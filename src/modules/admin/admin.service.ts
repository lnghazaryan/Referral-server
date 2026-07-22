import {
  getArmeniaNow,
  isEventDatePast,
  parseEventHubDateTime
} from "../../common/utils/event-datetime";
import {
  EventUrlSlugs,
  isCinemaCategory
} from "../../common/utils/event-slug";
import { buildEventI18n } from "../../common/utils/event-i18n";
import { DatabaseService } from "../database/database.service";
import {
  EventHubEventsService,
  EventHubSearchItem
} from "../external/eventhub/eventhub-events.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { SyncEventsDto } from "./dto/sync-events.dto";
import { events, promos, referred } from "../../db/schema";
import { Injectable, NotFoundException } from "@nestjs/common";
import { eq, inArray, lte, notInArray } from "drizzle-orm";

@Injectable()
export class AdminService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventHubEventsService: EventHubEventsService
  ) {}

  async listEvents() {
    return this.databaseService.db.select().from(events);
  }

  async listExternalEventsCatalog() {
    await this.removePastEvents();

    const catalog = await this.eventHubEventsService.searchEvents();
    const now = getArmeniaNow();
    const upcomingCatalog = catalog.filter(
      (item) => !isEventDatePast(item.eventDateTime, now)
    );
    const catalogIds = upcomingCatalog.map((item) => item.eventId);

    // Drop saved events that EventHub no longer returns as upcoming
    await this.removeEventsAbsentFromCatalog(catalogIds);

    const localEvents = await this.databaseService.db
      .select({ eventId: events.eventId })
      .from(events);
    const selectedIds = new Set(
      localEvents
        .map((item) => item.eventId)
        .filter((eventId): eventId is string => Boolean(eventId))
    );

    return upcomingCatalog.map((item) => ({
      eventId: item.eventId,
      eventName: item.eventName,
      eventDateTime: item.eventDateTime,
      eventCategory: item.eventCategory,
      venue: item.venue,
      imageUrl: item.imageUrl,
      isSelected: selectedIds.has(item.eventId)
    }));
  }

  async syncEvents(dto: SyncEventsDto) {
    await this.removePastEvents();

    const [catalogAm, catalogRu, catalogEn] = await Promise.all([
      this.eventHubEventsService.searchEvents("am"),
      this.eventHubEventsService.searchEvents("ru"),
      this.eventHubEventsService.searchEvents("en")
    ]);
    const catalog = catalogAm;
    const byLang = {
      am: new Map(catalogAm.map((item) => [item.eventId, item])),
      ru: new Map(catalogRu.map((item) => [item.eventId, item])),
      en: new Map(catalogEn.map((item) => [item.eventId, item]))
    };
    const urlSlugsByEventId =
      await this.eventHubEventsService.buildEnglishUrlSlugsMap(catalog);
    const now = getArmeniaNow();
    const upcomingCatalog = catalog.filter(
      (item) => !isEventDatePast(item.eventDateTime, now)
    );
    const catalogIds = upcomingCatalog.map((item) => item.eventId);
    const selectedIds = new Set(
      dto.selectedEventIds.filter((eventId) => catalogIds.includes(eventId))
    );

    // Remove deselected events and any DB rows no longer in the catalog
    const localEvents = await this.databaseService.db
      .select({ eventId: events.eventId })
      .from(events);
    const idsToRemove = localEvents
      .map((item) => item.eventId)
      .filter((eventId): eventId is string => Boolean(eventId))
      .filter((eventId) => !selectedIds.has(eventId));

    if (idsToRemove.length > 0) {
      await this.databaseService.db
        .delete(events)
        .where(inArray(events.eventId, idsToRemove));
    }

    for (const item of upcomingCatalog) {
      if (!selectedIds.has(item.eventId)) {
        continue;
      }

      const [existing] = await this.databaseService.db
        .select()
        .from(events)
        .where(eq(events.eventId, item.eventId))
        .limit(1);

      const values = this.mapEventHubItem(
        item,
        urlSlugsByEventId.get(item.eventId),
        byLang
      );

      if (existing) {
        await this.databaseService.db
          .update(events)
          .set(values)
          .where(eq(events.eventId, item.eventId));
      } else {
        await this.databaseService.db.insert(events).values(values);
      }
    }

    return this.listEvents();
  }

  async getEventById(eventId: string) {
    const [event] = await this.databaseService.db
      .select()
      .from(events)
      .where(eq(events.eventId, eventId))
      .limit(1);

    if (!event) {
      throw new NotFoundException("Event not found.");
    }

    return event;
  }

  async createEvent(dto: CreateEventDto) {
    const [created] = await this.databaseService.db
      .insert(events)
      .values({
        eventId: dto.eventId,
        name: dto.name,
        date: parseEventHubDateTime(dto.date),
        venue: dto.venue,
        category: dto.category,
        data: dto.data ?? null
      })
      .returning();
    return created;
  }

  async removePastEvents() {
    const now = getArmeniaNow();
    await this.databaseService.db
      .delete(events)
      .where(lte(events.date, now));
  }

  private async removeEventsAbsentFromCatalog(catalogEventIds: string[]) {
    if (catalogEventIds.length === 0) {
      await this.databaseService.db.delete(events);
      return;
    }

    await this.databaseService.db
      .delete(events)
      .where(notInArray(events.eventId, catalogEventIds));
  }

  async listPromos() {
    return this.databaseService.db
      .select({
        id: promos.id,
        promoId: promos.promoId,
        code: promos.code,
        type: promos.type,
        purpose: promos.purpose,
        referredId: promos.referredId,
        referredEmail: referred.email,
        referredPhone: referred.phone,
        recipientEmail: promos.recipientEmail,
        recipientRole: promos.recipientRole,
        eventId: promos.eventId,
        isUsed: promos.isUsed,
        createdAt: promos.createdAt,
        expiredAt: promos.expiredAt
      })
      .from(promos)
      .leftJoin(referred, eq(promos.referredId, referred.referredId));
  }

  async getPromoById(promoId: number) {
    const [promo] = await this.databaseService.db
      .select({
        id: promos.id,
        promoId: promos.promoId,
        code: promos.code,
        type: promos.type,
        purpose: promos.purpose,
        referredId: promos.referredId,
        referredEmail: referred.email,
        referredPhone: referred.phone,
        recipientEmail: promos.recipientEmail,
        recipientRole: promos.recipientRole,
        eventId: promos.eventId,
        isUsed: promos.isUsed,
        createdAt: promos.createdAt,
        expiredAt: promos.expiredAt
      })
      .from(promos)
      .leftJoin(referred, eq(promos.referredId, referred.referredId))
      .where(eq(promos.promoId, promoId))
      .limit(1);

    if (!promo) {
      throw new NotFoundException("Promo not found.");
    }

    return promo;
  }

  private mapEventHubItem(
    item: EventHubSearchItem,
    urlSlugs: EventUrlSlugs | undefined,
    byLang: {
      am: Map<string, EventHubSearchItem>;
      ru: Map<string, EventHubSearchItem>;
      en: Map<string, EventHubSearchItem>;
    }
  ) {
    const i18n = buildEventI18n(item.eventId, byLang);
    const primary = i18n.hy;
    return {
      eventId: item.eventId,
      name: primary.name,
      date: parseEventHubDateTime(item.eventDateTime),
      venue: primary.venue,
      category: primary.category,
      data: {
        ...item,
        i18n,
        urlSlugs: urlSlugs ?? {
          nameSlug: "",
          categorySlug: "events",
          isCinema: isCinemaCategory(item.categoryId)
        }
      }
    };
  }
}
