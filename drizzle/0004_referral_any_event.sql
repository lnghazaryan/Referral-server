ALTER TABLE "referrals" DROP CONSTRAINT IF EXISTS "referrals_event_id_events_event_id_fk";--> statement-breakpoint
ALTER TABLE "referred" DROP CONSTRAINT IF EXISTS "referred_event_id_events_event_id_fk";
