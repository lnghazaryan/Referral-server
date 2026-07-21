import {
  boolean,
  numeric,
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
  varchar
} from "drizzle-orm/pg-core";

export const referrals = pgTable(
  "referrals",
  {
    referralId: serial("referral_id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 32 }),
    referralCode: varchar("referral_code", { length: 64 }).notNull().unique(),
    eventId: varchar("event_id", { length: 36 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [uniqueIndex("referrals_email_unique").on(table.email)]
);

export const referred = pgTable(
  "referred",
  {
    referredId: serial("referred_id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 32 }),
    referralCode: varchar("referral_code", { length: 64 })
      .notNull()
      .references(() => referrals.referralCode),
    eventId: varchar("event_id", { length: 36 }),
    hasPayment: boolean("has_payment").notNull().default(false),
    buyPrice: numeric("buy_price", { precision: 12, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [uniqueIndex("referred_email_unique").on(table.email)]
);
