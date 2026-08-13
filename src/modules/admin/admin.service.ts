import {
  ARMENIA_TIMEZONE,
  getArmeniaNow,
  isEventDatePast,
  parseEventHubDateTime
} from "../../common/utils/event-datetime";
import { filterValidGuids } from "../../common/utils/guid";
import { DatabaseService } from "../database/database.service";
import { EventHubEventsService } from "../external/eventhub/eventhub-events.service";
import { PromoExternalService } from "../external/promo-external.service";
import { EventsMaintenanceService } from "../events/events-maintenance.service";
import {
  AnalyticsGranularity,
  AnalyticsQueryDto
} from "./dto/analytics-query.dto";
import { CreateEventDto } from "./dto/create-event.dto";
import { SyncEventsDto } from "./dto/sync-events.dto";
import { events, promos, referrals, referred } from "../../db/schema";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { and, count, eq, gt, gte, inArray, lte, notInArray, sql, sum } from "drizzle-orm";

type PeriodBucket = {
  period: string;
  label: string;
  referrers: number;
  referred: number;
  paidConversions: number;
  revenue: number;
  signupPromos: number;
  rewardPromos: number;
  usedPromos: number;
  newCustomers: number;
  existingCustomers: number;
  uncheckedCustomers: number;
};

type CountRow = { period: Date | string; value: number | string | null };
type RevenueRow = { period: Date | string; value: number | string | null };
type CustomerTypeRow = {
  period: Date | string;
  newCustomers: number | string | null;
  existingCustomers: number | string | null;
  uncheckedCustomers: number | string | null;
};

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventHubEventsService: EventHubEventsService,
    private readonly promoExternalService: PromoExternalService,
    private readonly eventsMaintenanceService: EventsMaintenanceService
  ) {}

  async listEvents() {
    return this.databaseService.db.select().from(events);
  }

  async listExternalEventsCatalog() {
    await this.eventsMaintenanceService.reconcileStoredEvents();

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
    await this.eventsMaintenanceService.reconcileStoredEvents();

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

      const values = this.eventsMaintenanceService.mapEventHubItem(
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

  async getAnalytics(query: AnalyticsQueryDto) {
    const granularity: AnalyticsGranularity = query.granularity ?? "daily";
    const { from, to } = this.resolveAnalyticsRange(
      granularity,
      query.from,
      query.to
    );
    const truncUnit =
      granularity === "daily"
        ? "day"
        : granularity === "weekly"
          ? "week"
          : "month";
    const truncReferrals = sql`to_char(date_trunc(${sql.raw(`'${truncUnit}'`)}, ${referrals.createdAt} AT TIME ZONE ${sql.raw(`'${ARMENIA_TIMEZONE}'`)}), 'YYYY-MM-DD')`;
    const truncReferred = sql`to_char(date_trunc(${sql.raw(`'${truncUnit}'`)}, ${referred.createdAt} AT TIME ZONE ${sql.raw(`'${ARMENIA_TIMEZONE}'`)}), 'YYYY-MM-DD')`;
    const truncPromos = sql`to_char(date_trunc(${sql.raw(`'${truncUnit}'`)}, ${promos.createdAt} AT TIME ZONE ${sql.raw(`'${ARMENIA_TIMEZONE}'`)}), 'YYYY-MM-DD')`;

    const newCustomerCount = sql<number>`count(*) filter (where ${referred.isNewCustomer} is true)`;
    const existingCustomerCount = sql<number>`count(*) filter (where ${referred.isNewCustomer} is false)`;
    const uncheckedCustomerCount = sql<number>`count(*) filter (where ${referred.isNewCustomer} is null)`;

    const [
      referrerRows,
      referredRows,
      paidRows,
      revenueRows,
      signupPromoRows,
      rewardPromoRows,
      usedPromoRows,
      customerTypeRows,
      totalsReferrers,
      totalsReferred,
      totalsPaid,
      totalsRevenue,
      totalsSignupPromos,
      totalsRewardPromos,
      totalsUsedPromos,
      totalsAllPromos,
      totalsCustomerTypes
    ] = await Promise.all([
      this.databaseService.db
        .select({
          period: truncReferrals.as("period"),
          value: count()
        })
        .from(referrals)
        .where(and(gte(referrals.createdAt, from), lte(referrals.createdAt, to)))
        .groupBy(truncReferrals)
        .orderBy(truncReferrals),
      this.databaseService.db
        .select({
          period: truncReferred.as("period"),
          value: count()
        })
        .from(referred)
        .where(and(gte(referred.createdAt, from), lte(referred.createdAt, to)))
        .groupBy(truncReferred)
        .orderBy(truncReferred),
      this.databaseService.db
        .select({
          period: truncReferred.as("period"),
          value: count()
        })
        .from(referred)
        .where(
          and(
            gte(referred.createdAt, from),
            lte(referred.createdAt, to),
            eq(referred.hasPayment, true)
          )
        )
        .groupBy(truncReferred)
        .orderBy(truncReferred),
      this.databaseService.db
        .select({
          period: truncReferred.as("period"),
          value: sql<string>`coalesce(${sum(referred.buyPrice)}, 0)`
        })
        .from(referred)
        .where(
          and(
            gte(referred.createdAt, from),
            lte(referred.createdAt, to),
            eq(referred.hasPayment, true)
          )
        )
        .groupBy(truncReferred)
        .orderBy(truncReferred),
      this.databaseService.db
        .select({
          period: truncPromos.as("period"),
          value: count()
        })
        .from(promos)
        .where(
          and(
            gte(promos.createdAt, from),
            lte(promos.createdAt, to),
            eq(promos.purpose, "signup")
          )
        )
        .groupBy(truncPromos)
        .orderBy(truncPromos),
      this.databaseService.db
        .select({
          period: truncPromos.as("period"),
          value: count()
        })
        .from(promos)
        .where(
          and(
            gte(promos.createdAt, from),
            lte(promos.createdAt, to),
            eq(promos.purpose, "payment_reward")
          )
        )
        .groupBy(truncPromos)
        .orderBy(truncPromos),
      this.databaseService.db
        .select({
          period: truncPromos.as("period"),
          value: count()
        })
        .from(promos)
        .where(
          and(
            gte(promos.createdAt, from),
            lte(promos.createdAt, to),
            eq(promos.isUsed, true)
          )
        )
        .groupBy(truncPromos)
        .orderBy(truncPromos),
      this.databaseService.db
        .select({
          period: truncReferred.as("period"),
          newCustomers: newCustomerCount,
          existingCustomers: existingCustomerCount,
          uncheckedCustomers: uncheckedCustomerCount
        })
        .from(referred)
        .where(and(gte(referred.createdAt, from), lte(referred.createdAt, to)))
        .groupBy(truncReferred)
        .orderBy(truncReferred),
      this.databaseService.db
        .select({ value: count() })
        .from(referrals)
        .where(and(gte(referrals.createdAt, from), lte(referrals.createdAt, to))),
      this.databaseService.db
        .select({ value: count() })
        .from(referred)
        .where(and(gte(referred.createdAt, from), lte(referred.createdAt, to))),
      this.databaseService.db
        .select({ value: count() })
        .from(referred)
        .where(
          and(
            gte(referred.createdAt, from),
            lte(referred.createdAt, to),
            eq(referred.hasPayment, true)
          )
        ),
      this.databaseService.db
        .select({
          value: sql<string>`coalesce(${sum(referred.buyPrice)}, 0)`
        })
        .from(referred)
        .where(
          and(
            gte(referred.createdAt, from),
            lte(referred.createdAt, to),
            eq(referred.hasPayment, true)
          )
        ),
      this.databaseService.db
        .select({ value: count() })
        .from(promos)
        .where(
          and(
            gte(promos.createdAt, from),
            lte(promos.createdAt, to),
            eq(promos.purpose, "signup")
          )
        ),
      this.databaseService.db
        .select({ value: count() })
        .from(promos)
        .where(
          and(
            gte(promos.createdAt, from),
            lte(promos.createdAt, to),
            eq(promos.purpose, "payment_reward")
          )
        ),
      this.databaseService.db
        .select({ value: count() })
        .from(promos)
        .where(
          and(
            gte(promos.createdAt, from),
            lte(promos.createdAt, to),
            eq(promos.isUsed, true)
          )
        ),
      this.databaseService.db
        .select({ value: count() })
        .from(promos)
        .where(and(gte(promos.createdAt, from), lte(promos.createdAt, to))),
      this.databaseService.db
        .select({
          newCustomers: newCustomerCount,
          existingCustomers: existingCustomerCount,
          uncheckedCustomers: uncheckedCustomerCount
        })
        .from(referred)
        .where(and(gte(referred.createdAt, from), lte(referred.createdAt, to)))
    ]);

    const series = this.buildAnalyticsSeries(granularity, from, to, {
      referrers: referrerRows as CountRow[],
      referred: referredRows as CountRow[],
      paid: paidRows as CountRow[],
      revenue: revenueRows as RevenueRow[],
      signupPromos: signupPromoRows as CountRow[],
      rewardPromos: rewardPromoRows as CountRow[],
      usedPromos: usedPromoRows as CountRow[],
      customerTypes: customerTypeRows as CustomerTypeRow[]
    });

    const referrersTotal = Number(totalsReferrers[0]?.value ?? 0);
    const referredTotal = Number(totalsReferred[0]?.value ?? 0);
    const paidTotal = Number(totalsPaid[0]?.value ?? 0);
    const revenueTotal = Number(totalsRevenue[0]?.value ?? 0);
    const signupPromosTotal = Number(totalsSignupPromos[0]?.value ?? 0);
    const rewardPromosTotal = Number(totalsRewardPromos[0]?.value ?? 0);
    const usedPromosTotal = Number(totalsUsedPromos[0]?.value ?? 0);
    const allPromosTotal = Number(totalsAllPromos[0]?.value ?? 0);
    const newCustomersTotal = Number(totalsCustomerTypes[0]?.newCustomers ?? 0);
    const existingCustomersTotal = Number(
      totalsCustomerTypes[0]?.existingCustomers ?? 0
    );
    const uncheckedCustomersTotal = Number(
      totalsCustomerTypes[0]?.uncheckedCustomers ?? 0
    );
    // Percentages only count users whose booking history was actually checked.
    const checkedCustomersTotal = newCustomersTotal + existingCustomersTotal;

    return {
      granularity,
      from: from.toISOString(),
      to: to.toISOString(),
      totals: {
        referrers: referrersTotal,
        referred: referredTotal,
        paidConversions: paidTotal,
        conversionRate:
          referredTotal > 0
            ? Math.round((paidTotal / referredTotal) * 1000) / 10
            : 0,
        revenue: revenueTotal,
        signupPromos: signupPromosTotal,
        rewardPromos: rewardPromosTotal,
        usedPromos: usedPromosTotal,
        promoRedemptionRate:
          allPromosTotal > 0
            ? Math.round((usedPromosTotal / allPromosTotal) * 1000) / 10
            : 0,
        newCustomers: newCustomersTotal,
        existingCustomers: existingCustomersTotal,
        uncheckedCustomers: uncheckedCustomersTotal,
        newCustomerRate:
          checkedCustomersTotal > 0
            ? Math.round((newCustomersTotal / checkedCustomersTotal) * 1000) / 10
            : 0,
        existingCustomerRate:
          checkedCustomersTotal > 0
            ? Math.round(
                (existingCustomersTotal / checkedCustomersTotal) * 1000
              ) / 10
            : 0
      },
      series
    };
  }

  private resolveAnalyticsRange(
    granularity: AnalyticsGranularity,
    fromRaw?: string,
    toRaw?: string
  ) {
    const now = getArmeniaNow();
    const to = toRaw ? new Date(toRaw) : now;
    let from: Date;

    if (fromRaw) {
      from = new Date(fromRaw);
    } else if (granularity === "daily") {
      from = new Date(to);
      from.setUTCDate(from.getUTCDate() - 29);
    } else if (granularity === "weekly") {
      from = new Date(to);
      from.setUTCDate(from.getUTCDate() - 7 * 11);
    } else {
      from = new Date(to);
      from.setUTCMonth(from.getUTCMonth() - 11);
    }

    from.setUTCHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setUTCHours(23, 59, 59, 999);

    return { from, to: end };
  }

  private buildAnalyticsSeries(
    granularity: AnalyticsGranularity,
    from: Date,
    to: Date,
    rows: {
      referrers: CountRow[];
      referred: CountRow[];
      paid: CountRow[];
      revenue: RevenueRow[];
      signupPromos: CountRow[];
      rewardPromos: CountRow[];
      usedPromos: CountRow[];
      customerTypes: CustomerTypeRow[];
    }
  ): PeriodBucket[] {
    const referrersMap = this.toPeriodMap(rows.referrers);
    const referredMap = this.toPeriodMap(rows.referred);
    const paidMap = this.toPeriodMap(rows.paid);
    const revenueMap = this.toPeriodMap(rows.revenue);
    const signupMap = this.toPeriodMap(rows.signupPromos);
    const rewardMap = this.toPeriodMap(rows.rewardPromos);
    const usedMap = this.toPeriodMap(rows.usedPromos);
    const newCustomersMap = this.toPeriodMap(
      rows.customerTypes.map((row) => ({
        period: row.period,
        value: row.newCustomers
      }))
    );
    const existingCustomersMap = this.toPeriodMap(
      rows.customerTypes.map((row) => ({
        period: row.period,
        value: row.existingCustomers
      }))
    );
    const uncheckedCustomersMap = this.toPeriodMap(
      rows.customerTypes.map((row) => ({
        period: row.period,
        value: row.uncheckedCustomers
      }))
    );

    const periods = this.enumeratePeriods(granularity, from, to);
    return periods.map((periodDate) => {
      const key = this.periodKey(periodDate);
      return {
        period: key,
        label: this.formatPeriodLabel(granularity, periodDate),
        referrers: referrersMap.get(key) ?? 0,
        referred: referredMap.get(key) ?? 0,
        paidConversions: paidMap.get(key) ?? 0,
        revenue: revenueMap.get(key) ?? 0,
        signupPromos: signupMap.get(key) ?? 0,
        rewardPromos: rewardMap.get(key) ?? 0,
        usedPromos: usedMap.get(key) ?? 0,
        newCustomers: newCustomersMap.get(key) ?? 0,
        existingCustomers: existingCustomersMap.get(key) ?? 0,
        uncheckedCustomers: uncheckedCustomersMap.get(key) ?? 0
      };
    });
  }

  private toPeriodMap(rows: Array<{ period: Date | string; value: unknown }>) {
    const map = new Map<string, number>();
    for (const row of rows) {
      const key =
        typeof row.period === "string"
          ? row.period.slice(0, 10)
          : this.periodKey(row.period);
      map.set(key, Number(row.value ?? 0));
    }
    return map;
  }

  private periodKey(value: Date | string) {
    const date = value instanceof Date ? value : new Date(value);
    return date.toISOString().slice(0, 10);
  }

  private enumeratePeriods(
    granularity: AnalyticsGranularity,
    from: Date,
    to: Date
  ) {
    const cursor = new Date(from);
    cursor.setUTCHours(0, 0, 0, 0);

    if (granularity === "weekly") {
      // Align to Monday (Postgres date_trunc('week') uses Monday).
      const day = cursor.getUTCDay();
      const diff = day === 0 ? -6 : 1 - day;
      cursor.setUTCDate(cursor.getUTCDate() + diff);
    } else if (granularity === "monthly") {
      cursor.setUTCDate(1);
    }

    const periods: Date[] = [];
    const endMs = to.getTime();
    while (cursor.getTime() <= endMs) {
      periods.push(new Date(cursor));
      if (granularity === "daily") {
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      } else if (granularity === "weekly") {
        cursor.setUTCDate(cursor.getUTCDate() + 7);
      } else {
        cursor.setUTCMonth(cursor.getUTCMonth() + 1);
      }
    }
    return periods;
  }

  private formatPeriodLabel(
    granularity: AnalyticsGranularity,
    date: Date
  ) {
    if (granularity === "monthly") {
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
        timeZone: "UTC"
      });
    }
    if (granularity === "weekly") {
      const end = new Date(date);
      end.setUTCDate(end.getUTCDate() + 6);
      return (
        date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "UTC"
        }) +
        " – " +
        end.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "UTC"
        })
      );
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC"
    });
  }
}
