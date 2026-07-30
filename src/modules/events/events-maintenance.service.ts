import { Injectable, Logger } from "@nestjs/common";
import { eq, inArray } from "drizzle-orm";
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
import { events } from "../../db/schema";
import { DatabaseService } from "../database/database.service";
import {
  EventHubEventsService,
  EventHubSearchItem
} from "../external/eventhub/eventhub-events.service";

export type ReconcileStoredEventsResult = {
  checked: number;
  updated: number;
  removed: number;
};

@Injectable()
export class EventsMaintenanceService {
  private readonly logger = new Logger(EventsMaintenanceService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventHubEventsService: EventHubEventsService
  ) {}

  /**
   * Reconcile selected events in our DB with EventHub Search:
   * - if eventId still has an upcoming date → update name/date/venue/data
   * - otherwise → remove the row
   *
   * `onlyPast: true` limits work to rows whose stored date is before today
   * (used on public landing loads). Full reconcile is used by the scheduler
   * and admin sync.
   */
  async reconcileStoredEvents(options?: {
    onlyPast?: boolean;
  }): Promise<ReconcileStoredEventsResult> {
    const localEvents = await this.databaseService.db.select().from(events);
    const now = getArmeniaNow();
    const candidates = options?.onlyPast
      ? localEvents.filter((row) => isEventDatePast(row.date, now))
      : localEvents;

    const result: ReconcileStoredEventsResult = {
      checked: candidates.length,
      updated: 0,
      removed: 0
    };

    if (candidates.length === 0) {
      return result;
    }

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

    const upcomingById = new Map(
      catalog
        .filter((item) => !isEventDatePast(item.eventDateTime, now))
        .map((item) => [item.eventId, item])
    );

    const idsToRemove: string[] = [];

    for (const local of candidates) {
      const eventId = local.eventId;
      if (!eventId) {
        continue;
      }

      const catalogItem = upcomingById.get(eventId);
      if (!catalogItem) {
        idsToRemove.push(eventId);
        continue;
      }

      const values = this.mapEventHubItem(
        catalogItem,
        urlSlugsByEventId.get(eventId),
        byLang
      );
      await this.databaseService.db
        .update(events)
        .set(values)
        .where(eq(events.eventId, eventId));
      result.updated += 1;
    }

    if (idsToRemove.length > 0) {
      await this.databaseService.db
        .delete(events)
        .where(inArray(events.eventId, idsToRemove));
      result.removed = idsToRemove.length;
    }

    this.logger.log(
      `reconcileStoredEvents: checked=${result.checked} updated=${result.updated} removed=${result.removed}${
        options?.onlyPast ? " (onlyPast)" : ""
      }`
    );
    return result;
  }

  mapEventHubItem(
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
