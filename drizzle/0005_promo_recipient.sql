ALTER TABLE "promos" ADD COLUMN IF NOT EXISTS "recipient_email" varchar(255);--> statement-breakpoint
ALTER TABLE "promos" ADD COLUMN IF NOT EXISTS "recipient_role" varchar(16);--> statement-breakpoint
UPDATE "promos" p
SET "recipient_email" = r.email, "recipient_role" = 'referred'
FROM "referred" r
WHERE p."referred_id" = r."referred_id"
  AND p."purpose" = 'signup'
  AND p."recipient_email" IS NULL;--> statement-breakpoint
UPDATE "promos" p
SET "recipient_email" = rf.email, "recipient_role" = 'referrer'
FROM "referred" r
JOIN "referrals" rf ON rf."referral_code" = r."referral_code"
WHERE p."referred_id" = r."referred_id"
  AND p."purpose" = 'payment_reward'
  AND p."recipient_email" IS NULL;
