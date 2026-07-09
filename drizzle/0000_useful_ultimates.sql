CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer,
	"session_id" varchar(128) NOT NULL,
	"name" varchar(255) NOT NULL,
	"partner_id" integer NOT NULL,
	CONSTRAINT "events_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "partners_partner_id_unique" UNIQUE("partner_id")
);
--> statement-breakpoint
CREATE TABLE "promos" (
	"id" serial PRIMARY KEY NOT NULL,
	"promo_id" integer,
	"code" varchar(64) NOT NULL,
	"type" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expired_at" timestamp with time zone NOT NULL,
	CONSTRAINT "promos_promo_id_unique" UNIQUE("promo_id"),
	CONSTRAINT "promos_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"referral_id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(32),
	"referral_code" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "referrals_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "referred" (
	"referred_id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(32),
	"referral_code" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_id" integer,
	"promo_id" integer NOT NULL,
	"event_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"meta" text,
	CONSTRAINT "transactions_transaction_id_unique" UNIQUE("transaction_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(64) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" varchar(16) DEFAULT 'Guest' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_partner_id_partners_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("partner_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referred" ADD CONSTRAINT "referred_referral_code_referrals_referral_code_fk" FOREIGN KEY ("referral_code") REFERENCES "public"."referrals"("referral_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_promo_id_promos_promo_id_fk" FOREIGN KEY ("promo_id") REFERENCES "public"."promos"("promo_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_event_id_events_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("event_id") ON DELETE no action ON UPDATE no action;