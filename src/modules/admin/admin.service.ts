import {
  getArmeniaNow,
  getArmeniaStartOfToday,
  isEventDatePast,
  parseEventHubDateTime
} from "../../common/utils/event-datetime";
import {
  EventUrlSlugs,
  isCinemaCategory
} from "../../common/utils/event-slug";
import { filterValidGuids } from "../../common/utils/guid";
import { buildEventI18n } from "../../common/utils/event-i18n";
import { DatabaseService } from "../database/database.service";
import {
  EventHubEventsService,
  EventHubSearchItem
} from "../external/eventhub/eventhub-events.service";
import { PromoExternalService } from "../external/promo-external.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { SyncEventsDto } from "./dto/sync-events.dto";
import { events, promos, referred } from "../../db/schema";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { and, eq, gt, inArray, lt, notInArray } from "drizzle-orm";

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventHubEventsService: EventHubEventsService,
    private readonly promoExternalService: PromoExternalService
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
    const previousIds = new Set(
      localEvents
        .map((item) => item.eventId)
        .filter((eventId): eventId is string => Boolean(eventId))
    );
    const idsToRemove = [...previousIds].filter(
      (eventId) => !selectedIds.has(eventId)
    );
    const newlyAddedIds = [...selectedIds].filter(
      (eventId) => !previousIds.has(eventId)
    );

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

    if (newlyAddedIds.length > 0) {
      await this.extendActivePromosToEvents(newlyAddedIds);
    }

    return this.listEvents();
  }

  /**
   * When admin adds events, attach every unused unexpired promo code to those
   * new EventHub events and persist the updated eventIds list.
   */
  private async extendActivePromosToEvents(newEventIds: string[]) {
    const added = filterValidGuids(newEventIds);
    if (!added.length) {
      return;
    }

    const activePromos = await this.databaseService.db
      .select({
        id: promos.id,
        code: promos.code,
        eventId: promos.eventId,
        eventIds: promos.eventIds
      })
      .from(promos)
      .where(
        and(eq(promos.isUsed, false), gt(promos.expiredAt, getArmeniaNow()))
      );

    this.logger.log(
      `extendActivePromosToEvents: ${activePromos.length} active promo(s), ${added.length} new event(s)`
    );

    for (const promo of activePromos) {
      const existingIds = this.resolvePromoEventIds(promo);
      const missing = added.filter((id) => !existingIds.includes(id));
      if (!missing.length) {
        continue;
      }

      try {
        const attached = await this.promoExternalService.attachPromoToEvents({
          code: promo.code,
          eventIds: missing
        });
        if (!attached.length) {
          continue;
        }

        const merged = [...existingIds];
        for (const id of attached) {
          if (!merged.includes(id)) {
            merged.push(id);
          }
        }

        await this.databaseService.db
          .update(promos)
          .set({
            eventIds: merged,
            eventId: merged[0] ?? promo.eventId
          })
          .where(eq(promos.id, promo.id));

        this.logger.log(
          `extendActivePromosToEvents: promo id=${promo.id} code=${promo.code} now covers ${merged.length} event(s)`
        );
      } catch (error) {
        this.logger.error(
          `extendActivePromosToEvents: FAILED promo id=${promo.id} code=${promo.code}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }
  }

  private resolvePromoEventIds(promo: {
    eventId: string | null;
    eventIds: string[] | null;
  }): string[] {
    const fromJson = Array.isArray(promo.eventIds) ? promo.eventIds : [];
    const merged = filterValidGuids([
      ...fromJson,
      ...(promo.eventId ? [promo.eventId] : [])
    ]);
    return [...new Set(merged)];
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
    await this.databaseService.db
      .delete(events)
      .where(lt(events.date, getArmeniaStartOfToday()));
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
        eventIds: promos.eventIds,
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
        eventIds: promos.eventIds,
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
