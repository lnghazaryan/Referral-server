ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_event_id_events_event_id_fk";--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_promo_id_promos_promo_id_fk";--> statement-breakpoint
DROP TABLE IF EXISTS "transactions";--> statement-breakpoint
ALTER TABLE "referrals" DROP CONSTRAINT IF EXISTS "referrals_partner_id_partners_partner_id_fk";--> statement-breakpoint
ALTER TABLE "events" DROP CONSTRAINT IF EXISTS "events_partner_id_partners_partner_id_fk";--> statement-breakpoint
ALTER TABLE "referrals" DROP COLUMN IF EXISTS "event_session_id";--> statement-breakpoint
ALTER TABLE "referrals" DROP COLUMN IF EXISTS "partner_id";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN IF EXISTS "partner_id";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN IF EXISTS "session_id";--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "venue" varchar(255);--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "category" varchar(255);--> statement-breakpoint
DROP TABLE IF EXISTS "partners";--> statement-breakpoint
ALTER TABLE "referred" ADD COLUMN IF NOT EXISTS "event_id" varchar(36);--> statement-breakpoint
ALTER TABLE "referred" ADD CONSTRAINT "referred_event_id_events_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("event_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "data" jsonb;--> statement-breakpoint
ALTER TABLE "promos" ADD COLUMN IF NOT EXISTS "purpose" varchar(32);--> statement-breakpoint
UPDATE "promos" SET "purpose" = 'signup' WHERE "purpose" IS NULL;--> statement-breakpoint
ALTER TABLE "promos" ALTER COLUMN "purpose" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "promos_referred_purpose_unique" ON "promos" ("referred_id","purpose");
