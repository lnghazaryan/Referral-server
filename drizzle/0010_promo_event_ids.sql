ALTER TABLE "promos" ADD COLUMN "event_ids" jsonb DEFAULT '[]'::jsonb NOT NULL;
--> statement-breakpoint
UPDATE "promos"
SET "event_ids" = CASE
  WHEN "event_id" IS NOT NULL AND "event_id" <> '' THEN jsonb_build_array("event_id")
  ELSE '[]'::jsonb
END;
