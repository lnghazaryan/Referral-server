import { env } from "../../../config/env";

const EVENTHUB_BASE_URLS = {
  test: "https://website.api.eventhub.am",
  live: "https://website.api.eventhub.am"
} as const;

export function getEventHubBaseUrl(): string {
  if (env.EVENTHUB_API_BASE_URL) {
    return env.EVENTHUB_API_BASE_URL.replace(/\/$/, "");
  }

  return env.EVENTHUB_API_ENV === "live"
    ? EVENTHUB_BASE_URLS.live
    : EVENTHUB_BASE_URLS.test;
}

export function getEventHubEndpointPath(
  configuredPath: string,
  fallbackPath: string
): string {
  const path = configuredPath || fallbackPath;
  return path.startsWith("/") ? path : `/${path}`;
}
