import {
  boolean,
  integer,
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
    /**
     * EventHub booking history snapshot. `null` means the check never ran:
     * new referred users are checked automatically on creation, older rows
     * are checked on demand from the admin panel.
     */
    isNewCustomer: boolean("is_new_customer"),
    /** Paid EventHub bookings made before this user joined the program. */
    priorBookingCount: integer("prior_booking_count"),
    totalBookingCount: integer("total_booking_count"),
    firstBookingDate: timestamp("first_booking_date", { withTimezone: true }),
    bookingCheckedAt: timestamp("booking_checked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [uniqueIndex("referred_email_unique").on(table.email)]
);
