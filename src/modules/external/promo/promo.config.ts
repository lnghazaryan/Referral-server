import { env } from "../../../config/env";

const PROMO_BASE_URLS = {
  test: "https://organizer.api.test.eventhub.am",
  live: "https://organizer.api.eventhub.am"
} as const;

/** Fixed EventHub partner used for all referral promo codes. */
export const PROMO_PARTNER_ID =
  env.EVENTHUB_PROMO_PARTNER_ID || "5a82a51d-5ca8-442b-36ef-08dc809d7fb7";

export function getPromoApiBaseUrl(): string {
  if (env.EVENTHUB_PROMO_API_BASE_URL) {
    return env.EVENTHUB_PROMO_API_BASE_URL.replace(/\/$/, "");
  }

  return env.EVENTHUB_API_ENV === "live"
    ? PROMO_BASE_URLS.live
    : PROMO_BASE_URLS.test;
}
