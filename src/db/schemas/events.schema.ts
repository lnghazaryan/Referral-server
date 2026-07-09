import { jsonb, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  eventId: varchar("event_id", { length: 36 }).unique(),
  date: timestamp("date", { withTimezone: true }),
  name: varchar("name", { length: 255 }).notNull(),
  venue: varchar("venue", { length: 255 }),
  category: varchar("category", { length: 255 }),
  data: jsonb("data")
});
