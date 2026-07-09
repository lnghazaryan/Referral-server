import {
  BadRequestException,
  Injectable
} from "@nestjs/common";
import { filterValidGuids } from "../../common/utils/guid";
import { SettingsService } from "../settings/settings.service";
import { PromoApiClient } from "./promo/promo-api.client";

export type ExternalPromoResponse = {
  promoId: number | null;
  code: string;
  type: string;
  expiredAt: string;
};

export type CreateExternalPromoInput = {
  eventIds: string[];
  code?: string;
};

type PromoCreateRequest = {
  codes: string[];
  discountType: string;
  discountValue: number;
  categories: number[];
  events: string[];
  partners: string[];
  startDate: string;
  endDate: string;
  maxCount: number;
  isActive: boolean;
  createdBy: string;
};

@Injectable()
export class PromoExternalService {
  constructor(
    private readonly promoApiClient: PromoApiClient,
    private readonly settingsService: SettingsService
  ) {}

  async createPromo(
    input: CreateExternalPromoInput
  ): Promise<ExternalPromoResponse> {
    if (!input.eventIds.length) {
      throw new BadRequestException(
        "At least one eventId is required for promo creation."
      );
    }

    const eventIds = filterValidGuids(input.eventIds);
    if (!eventIds.length) {
      throw new BadRequestException(
        "Promo creation requires valid EventHub event UUIDs."
      );
    }

    const promo = this.settingsService.getPromoSettings();
    const code = input.code ?? this.generatePromoCode();
    const startDate = new Date();
    const endDate = new Date(
      Date.now() + promo.validityDays * 24 * 60 * 60 * 1000
    );

    const body: PromoCreateRequest = {
      codes: [code],
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      categories: [],
      events: eventIds,
      partners: [],
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      maxCount: promo.maxCount,
      isActive: true,
      createdBy: "referral-server",
    };

    await this.promoApiClient.post("/Promo/Create", body);

    return {
      promoId: null,
      code,
      type: promo.discountType,
      expiredAt: endDate.toISOString()
    };
  }

  /** @deprecated use createPromo */
  async fetchPromoCode(eventId: string): Promise<ExternalPromoResponse> {
    return this.createPromo({ eventIds: [eventId] });
  }

  private generatePromoCode(): string {
    const letters = Array.from({ length: 4 }, () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    );
    const digits = Array.from({ length: 2 }, () =>
      Math.floor(Math.random() * 10).toString()
    );
    const chars = [...letters, ...digits];

    for (let i = chars.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return chars.join("");
  }

  private createDevPromo(
    eventId: string,
    code?: string
  ): ExternalPromoResponse {
    const promo = this.settingsService.getPromoSettings();
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    const numericSeed = eventId.replace(/\D/g, "").slice(-5) || "10001";
    return {
      promoId: Number(`${numericSeed}${Date.now().toString().slice(-5)}`),
      code: code ?? `DEV-${suffix}`,
      type: promo.discountType,
      expiredAt: new Date(
        Date.now() + promo.validityDays * 24 * 60 * 60 * 1000
      ).toISOString()
    };
  }
}
