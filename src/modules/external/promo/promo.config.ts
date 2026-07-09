import { env } from "../../../config/env";

const PROMO_BASE_URLS = {
  test: "https://promo.apitest.eventhub.am",
  live: "https://promo.api.eventhub.am"
} as const;

export function getPromoApiBaseUrl(): string {
  if (env.EVENTHUB_PROMO_API_BASE_URL) {
    return env.EVENTHUB_PROMO_API_BASE_URL.replace(/\/$/, "");
  }

  return env.EVENTHUB_API_ENV === "live"
    ? PROMO_BASE_URLS.live
    : PROMO_BASE_URLS.test;
}
