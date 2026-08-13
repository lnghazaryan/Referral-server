ALTER TABLE "referred" ADD COLUMN "is_new_customer" boolean;--> statement-breakpoint
ALTER TABLE "referred" ADD COLUMN "prior_booking_count" integer;--> statement-breakpoint
ALTER TABLE "referred" ADD COLUMN "total_booking_count" integer;--> statement-breakpoint
ALTER TABLE "referred" ADD COLUMN "first_booking_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "referred" ADD COLUMN "booking_checked_at" timestamp with time zone;
