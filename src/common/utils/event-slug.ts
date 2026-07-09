export type EventUrlSlugs = {
  nameSlug: string;
  categorySlug: string;
  isCinema: boolean;
};

const CINEMA_CATEGORY_IDS = new Set([80, 170]);

export function isCinemaCategory(categoryId: number | null | undefined) {
  return categoryId != null && CINEMA_CATEGORY_IDS.has(categoryId);
}

/** Mirrors WebSite.Front shared/helpers/generateSlug.ts */
export function generateSlug(text: string | null | undefined) {
  const first = String(text ?? "").split(/[|/\\]/)[0];
  return first
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function buildEventHubRelativePath(
  eventId: string,
  slugs: EventUrlSlugs
): string {
  const namePart = `${slugs.nameSlug || "event"}-${eventId}`;
  if (slugs.isCinema) {
    return `cinema/event/${namePart}`;
  }
  return `${slugs.categorySlug || "events"}/event/${namePart}`;
}
