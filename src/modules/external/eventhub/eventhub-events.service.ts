import { Injectable } from "@nestjs/common";
import {
  EventUrlSlugs,
  generateSlug,
  isCinemaCategory
} from "../../../common/utils/event-slug";
import { EventHubApiClient } from "./eventhub-api.client";

export type EventHubSearchItem = {
  eventId: string;
  eventName: string | null;
  eventDateTime: string | null;
  categoryId: number;
  eventCategory: string | null;
  venue: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
};

export type EventHubCategoryItem = {
  id: number;
  name: string;
  parentId?: number;
};

@Injectable()
export class EventHubEventsService {
  constructor(private readonly eventHubApiClient: EventHubApiClient) {}

  searchEvents(language?: string): Promise<EventHubSearchItem[]> {
    return this.eventHubApiClient.get<EventHubSearchItem[]>("/Event/Search", {
      headers: language ? { "Content-Language": language } : undefined
    });
  }

  getEventCategories(language?: string): Promise<EventHubCategoryItem[]> {
    return this.eventHubApiClient.get<EventHubCategoryItem[]>(
      "/Event/Categories",
      {
        headers: language ? { "Content-Language": language } : undefined
      }
    );
  }

  async buildEnglishUrlSlugsMap(
    catalog: EventHubSearchItem[]
  ): Promise<Map<string, EventUrlSlugs>> {
    const [englishEvents, englishCategories] = await Promise.all([
      this.searchEvents("en"),
      this.getEventCategories("en")
    ]);

    const englishNameById = new Map(
      englishEvents.map((item) => [item.eventId, item.eventName])
    );
    const englishCategoryById = new Map(
      englishCategories.map((item) => [item.id, item.name])
    );

    const slugsByEventId = new Map<string, EventUrlSlugs>();
    for (const item of catalog) {
      const englishName =
        englishNameById.get(item.eventId) ?? item.eventName ?? "Event";
      const englishCategory =
        englishCategoryById.get(item.categoryId) ??
        item.eventCategory ??
        "events";

      slugsByEventId.set(item.eventId, {
        nameSlug: generateSlug(englishName) || "event",
        categorySlug: generateSlug(englishCategory) || "events",
        isCinema: isCinemaCategory(item.categoryId)
      });
    }

    return slugsByEventId;
  }
}
