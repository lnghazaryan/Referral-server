/** Armenia does not use DST; Asia/Yerevan is always UTC+4. */
export const ARMENIA_TIMEZONE = "Asia/Yerevan";
export const ARMENIA_UTC_OFFSET = "+04:00";

/**
 * Parses EventHub datetime strings like "2026-07-08 19:00"
 * as Armenian local time (Asia/Yerevan, UTC+4).
 */
export function parseEventHubDateTime(
  value: string | null | undefined
): Date | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const match = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/
  );

  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4]);
    const minute = Number(match[5]);
    const second = Number(match[6] ?? "0");

    const iso =
      `${String(year).padStart(4, "0")}-` +
      `${String(month).padStart(2, "0")}-` +
      `${String(day).padStart(2, "0")}T` +
      `${String(hour).padStart(2, "0")}:` +
      `${String(minute).padStart(2, "0")}:` +
      `${String(second).padStart(2, "0")}` +
      ARMENIA_UTC_OFFSET;

    const parsed = new Date(iso);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getArmeniaNow(): Date {
  return new Date();
}

/** YYYY-MM-DD in Asia/Yerevan. */
export function toArmeniaDateKey(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: ARMENIA_TIMEZONE });
}

/** Midnight Asia/Yerevan for the current Armenia calendar day. */
export function getArmeniaStartOfToday(now: Date = getArmeniaNow()): Date {
  const key = toArmeniaDateKey(now);
  return new Date(`${key}T00:00:00${ARMENIA_UTC_OFFSET}`);
}

/**
 * True when the event's Armenia calendar day is before today.
 * Same-day events stay visible regardless of clock time.
 */
export function isEventDatePast(
  value: Date | string | null | undefined,
  now: Date = getArmeniaNow()
): boolean {
  if (!value) {
    return false;
  }

  const date = value instanceof Date ? value : parseEventHubDateTime(value);
  if (!date) {
    return false;
  }

  return toArmeniaDateKey(date) < toArmeniaDateKey(now);
}
