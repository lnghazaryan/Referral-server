ALTER TABLE "promos" ADD COLUMN "referred_id" integer;--> statement-breakpoint
ALTER TABLE "promos" ADD COLUMN "event_id" integer;--> statement-breakpoint
ALTER TABLE "promos" ADD COLUMN "is_used" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "referrals" ADD COLUMN "event_id" integer;--> statement-breakpoint
ALTER TABLE "referrals" ADD COLUMN "event_session_id" varchar(128);--> statement-breakpoint
ALTER TABLE "referrals" ADD COLUMN "partner_id" integer;--> statement-breakpoint
ALTER TABLE "referred" ADD COLUMN "has_payment" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "promos" ADD CONSTRAINT "promos_referred_id_referred_referred_id_fk" FOREIGN KEY ("referred_id") REFERENCES "public"."referred"("referred_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promos" ADD CONSTRAINT "promos_event_id_events_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("event_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_event_id_events_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("event_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_partner_id_partners_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("partner_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "referrals_email_unique" ON "referrals" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "referred_email_unique" ON "referred" USING btree ("email");