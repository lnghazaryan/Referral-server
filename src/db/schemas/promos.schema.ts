import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
  varchar
} from "drizzle-orm/pg-core";
import { referred } from "./referrals.schema";

export const promos = pgTable(
  "promos",
  {
    id: serial("id").primaryKey(),
    promoId: integer("promo_id").unique(),
    code: varchar("code", { length: 64 }).notNull().unique(),
    type: varchar("type", { length: 64 }).notNull(),
    purpose: varchar("purpose", { length: 32 }).notNull(),
    referredId: integer("referred_id").references(() => referred.referredId),
    recipientEmail: varchar("recipient_email", { length: 255 }),
    recipientRole: varchar("recipient_role", { length: 16 }),
    /** @deprecated Prefer eventIds; kept for older rows / UI. */
    eventId: varchar("event_id", { length: 36 }),
    /** EventHub event UUIDs this promo code was created on. */
    eventIds: jsonb("event_ids").$type<string[]>().notNull().default([]),
    isUsed: boolean("is_used").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiredAt: timestamp("expired_at", { withTimezone: true }).notNull()
  },
  (table) => [
    uniqueIndex("promos_referred_purpose_unique").on(
      table.referredId,
      table.purpose
    )
  ]
);
