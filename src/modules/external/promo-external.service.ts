import {
  BadRequestException,
  Injectable,
  Logger
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
  code: string;
  unit: string;
  discount: number;
  count: number;
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
    const unit = this.mapDiscountUnit(promo.discountType);
    const endDate = new Date(
      Date.now() + promo.validityDays * 24 * 60 * 60 * 1000
    );

    const body: PromoCreateRequest = {
      code,
      unit,
      discount: promo.discountValue,
      count: promo.maxCount
    };

    this.logger.log(
      `createPromo: same code=${code} for ${eventIds.length} event(s) body=${JSON.stringify(body)}`
    );

    // One authorize for the whole batch, then create per event.
    const accessToken = await this.promoApiClient.authorize();
    const authHeaders = { Authorization: `Bearer ${accessToken}` };

    for (const eventId of eventIds) {
      await this.createPromoOnEvent(eventId, body, authHeaders, false);
    }

    this.logger.log(
      `createPromo: done code=${code} events=${eventIds.length}`
    );

    return {
      promoId: null,
      code,
      type: unit,
      expiredAt: endDate.toISOString()
    };
  }

  /**
   * Attach an existing promo code to additional events (e.g. after admin
   * selects new events). Per-event failures are logged and skipped so one
   * EventHub conflict does not block the rest.
   */
  async attachPromoToEvents(input: {
    code: string;
    eventIds: string[];
  }): Promise<string[]> {
    const eventIds = filterValidGuids(input.eventIds);
    if (!eventIds.length) {
      return [];
    }

    const promo = this.settingsService.getPromoSettings();
    const unit = this.mapDiscountUnit(promo.discountType);
    const body: PromoCreateRequest = {
      code: input.code,
      unit,
      discount: promo.discountValue,
      count: promo.maxCount
    };

    const accessToken = await this.promoApiClient.authorize();
    const authHeaders = { Authorization: `Bearer ${accessToken}` };
    const attached: string[] = [];

    for (const eventId of eventIds) {
      const ok = await this.createPromoOnEvent(
        eventId,
        body,
        authHeaders,
        true
      );
      if (ok) {
        attached.push(eventId);
      }
    }

    this.logger.log(
      `attachPromoToEvents: code=${input.code} attached=${attached.length}/${eventIds.length}`
    );
    return attached;
  }

  /** @deprecated use createPromo */
  async fetchPromoCode(eventId: string): Promise<ExternalPromoResponse> {
    return this.createPromo({ eventIds: [eventId] });
  }

  private async createPromoOnEvent(
    eventId: string,
    body: PromoCreateRequest,
    authHeaders: Record<string, string>,
    softFail: boolean
  ): Promise<boolean> {
    const path = `/Promo/Create/${eventId}`;
    this.logger.log(`createPromo: POST ${path} ${JSON.stringify(body)}`);

    try {
      const response = await this.promoApiClient.post(path, body, {
        skipAuth: true,
        headers: authHeaders
      });
      this.logger.log(
        `createPromo: response for eventId=${eventId} ${JSON.stringify(response ?? null)}`
      );
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (softFail) {
        this.logger.warn(
          `createPromo: skipped eventId=${eventId} code=${body.code}: ${message}`
        );
        return false;
      }
      throw error;
    }
  }

  private mapDiscountUnit(discountType: string): string {
    const normalized = String(discountType || "")
      .trim()
      .toLowerCase();

    if (normalized === "percent" || normalized === "percentage") {
      return "Percent";
    }

    if (normalized === "fixed" || normalized === "amount") {
      return "Fixed";
    }

    // Fall back to settings value with leading capital (EventHub expects "Percent").
    const raw = String(discountType || "Percent").trim();
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
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
