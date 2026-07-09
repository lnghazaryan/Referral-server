import { jsonb, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const landingContent = pgTable("landing_content", {
  id: serial("id").primaryKey(),
  locale: varchar("locale", { length: 8 }).notNull().unique(),
  content: jsonb("content").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
});
