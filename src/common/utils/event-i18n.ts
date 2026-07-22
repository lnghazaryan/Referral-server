import type { EventHubSearchItem } from "../../modules/external/eventhub/eventhub-events.service";

export type EventLocale = "hy" | "ru" | "en";

export type EventLocaleFields = {
  name: string;
  venue: string | null;
  category: string | null;
};

export type EventI18nMap = Record<EventLocale, EventLocaleFields>;

export function resolveEventLocale(lang?: string | null): EventLocale {
  if (lang === "ru" || lang === "en") {
    return lang;
  }
  return "hy";
}

export function buildEventI18n(
  eventId: string,
  byLang: {
    am: Map<string, EventHubSearchItem>;
    ru: Map<string, EventHubSearchItem>;
    en: Map<string, EventHubSearchItem>;
  }
): EventI18nMap {
  const am = byLang.am.get(eventId);
  const ru = byLang.ru.get(eventId);
  const en = byLang.en.get(eventId);

  const hyFields: EventLocaleFields = {
    name: am?.eventName?.trim() || "Event",
    venue: am?.venue ?? null,
    category: am?.eventCategory ?? null
  };

  return {
    hy: hyFields,
    ru: {
      name: ru?.eventName?.trim() || hyFields.name,
      venue: ru?.venue ?? hyFields.venue,
      category: ru?.eventCategory ?? hyFields.category
    },
    en: {
      name: en?.eventName?.trim() || hyFields.name,
      venue: en?.venue ?? hyFields.venue,
      category: en?.eventCategory ?? hyFields.category
    }
  };
}

export function readEventI18n(
  data: Record<string, unknown> | null | undefined
): EventI18nMap | null {
  const raw = data?.i18n;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const map = raw as Record<string, unknown>;
  const read = (key: EventLocale): EventLocaleFields | null => {
    const item = map[key];
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return null;
    }
    const row = item as Record<string, unknown>;
    const name = row.name == null ? "" : String(row.name).trim();
    if (!name) return null;
    return {
      name,
      venue: row.venue == null ? null : String(row.venue),
      category: row.category == null ? null : String(row.category)
    };
  };

  const hy = read("hy");
  if (!hy) return null;

  return {
    hy,
    ru: read("ru") ?? hy,
    en: read("en") ?? hy
  };
}

export function localizedEventDisplay(
  event: {
    name: string;
    venue: string | null;
    category: string | null;
    data: unknown;
  },
  locale: EventLocale
): EventLocaleFields {
  const i18n = readEventI18n(
    (event.data ?? null) as Record<string, unknown> | null
  );
  if (i18n) {
    return i18n[locale];
  }
  return {
    name: event.name,
    venue: event.venue,
    category: event.category
  };
}
