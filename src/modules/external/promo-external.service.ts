import {
  BadRequestException,
  Injectable,
  Logger
} from "@nestjs/common";
import { filterValidGuids } from "../../common/utils/guid";
import { SettingsService } from "../settings/settings.service";
import { PromoApiClient } from "./promo/promo-api.client";
import { PROMO_PARTNER_ID } from "./promo/promo.config";

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
  events: string[];
  partners: string[];
  startDate: string;
  endDate: string;
  maxCount: number;
  isActive: boolean;
};

@Injectable()
export class PromoExternalService {
  private readonly logger = new Logger(PromoExternalService.name);

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
      discountType: String(promo.discountType).toUpperCase(),
      discountValue: promo.discountValue,
      events: eventIds,
      partners: [PROMO_PARTNER_ID],
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      maxCount: promo.maxCount,
      isActive: true
    };

    this.logger.log(
      `createPromo: POST /Promo/v2/Create ${JSON.stringify(body)}`
    );

    await this.promoApiClient.post("/Promo/v2/Create", body);

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
}
