CREATE TABLE IF NOT EXISTS "landing_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"locale" varchar(8) NOT NULL,
	"content" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "landing_content_locale_unique" UNIQUE("locale")
);
