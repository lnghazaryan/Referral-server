ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_event_id_events_event_id_fk";--> statement-breakpoint
ALTER TABLE "promos" DROP CONSTRAINT IF EXISTS "promos_event_id_events_event_id_fk";--> statement-breakpoint
ALTER TABLE "referrals" DROP CONSTRAINT IF EXISTS "referrals_event_id_events_event_id_fk";--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "event_id" SET DATA TYPE varchar(36) USING "event_id"::text;--> statement-breakpoint
ALTER TABLE "promos" ALTER COLUMN "event_id" SET DATA TYPE varchar(36) USING "event_id"::text;--> statement-breakpoint
ALTER TABLE "referrals" ALTER COLUMN "event_id" SET DATA TYPE varchar(36) USING "event_id"::text;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "event_id" SET DATA TYPE varchar(36) USING "event_id"::text;--> statement-breakpoint
ALTER TABLE "promos" ADD CONSTRAINT "promos_event_id_events_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("event_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_event_id_events_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("event_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_event_id_events_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("event_id") ON DELETE no action ON UPDATE no action;
