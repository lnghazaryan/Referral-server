import "dotenv/config";

const port = Number(process.env.PORT ?? "4000");

const eventHubApiEnv =
  process.env.EVENTHUB_API_ENV === "live" ? "live" : "test";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. Add it in your .env file.");
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number.isNaN(port) ? 4000 : port,
  DATABASE_URL: databaseUrl,
  EVENTHUB_API_ENV: eventHubApiEnv as "test" | "live",
  EVENTHUB_API_BASE_URL: process.env.EVENTHUB_API_BASE_URL ?? "",
  EVENTHUB_PROMO_API_BASE_URL: process.env.EVENTHUB_PROMO_API_BASE_URL ?? "",
  EVENTHUB_ORGANIZER_USERNAME: process.env.EVENTHUB_ORGANIZER_USERNAME ?? "",
  EVENTHUB_ORGANIZER_PASSWORD: process.env.EVENTHUB_ORGANIZER_PASSWORD ?? "",
  EVENTHUB_PROMO_PARTNER_ID: process.env.EVENTHUB_PROMO_PARTNER_ID ?? "",
  EVENTHUB_DEFAULT_LANGUAGE: process.env.EVENTHUB_DEFAULT_LANGUAGE ?? "am",
  EMAIL_API_URL:
    process.env.EMAIL_API_URL ?? "https://email.dinno.am/api/send",
  EMAIL_API_KEY: process.env.EMAIL_API_KEY ?? "",
  LANDING_BASE_URL:
    process.env.LANDING_BASE_URL ?? "https://loyalty.eventhub.am"
};
