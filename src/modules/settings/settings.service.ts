import { BadRequestException, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { appSettings } from "../../db/schema";
import { DatabaseService } from "../database/database.service";
import {
  AppSettings,
  DEFAULT_SETTINGS,
  MailingSettings,
  PromoSettings,
  SETTINGS_KEY
} from "./settings.defaults";

@Injectable()
export class SettingsService implements OnModuleInit {
  private readonly logger = new Logger(SettingsService.name);
  private cache: AppSettings = DEFAULT_SETTINGS;

  constructor(private readonly databaseService: DatabaseService) {}

  async onModuleInit() {
    try {
      const [row] = await this.databaseService.db
        .select()
        .from(appSettings)
        .where(eq(appSettings.key, SETTINGS_KEY))
        .limit(1);
      if (!row) {
        await this.databaseService.db.insert(appSettings).values({
          key: SETTINGS_KEY,
          value: DEFAULT_SETTINGS
        });
        this.cache = DEFAULT_SETTINGS;
        this.logger.log("Seeded default app settings.");
        return;
      }
      this.cache = this.merge(row.value as Partial<AppSettings>);
    } catch (error) {
      this.logger.warn(
        `Using in-memory default settings (table may not be migrated yet): ${String(
          error
        )}`
      );
    }
  }

  private merge(partial: Partial<AppSettings>): AppSettings {
    return {
      promo: { ...DEFAULT_SETTINGS.promo, ...(partial.promo ?? {}) },
      mailing: { ...DEFAULT_SETTINGS.mailing, ...(partial.mailing ?? {}) }
    };
  }

  getPromoSettings(): PromoSettings {
    return { ...this.cache.promo };
  }

  getMailingSettings(): MailingSettings {
    return { ...this.cache.mailing };
  }

  getAll() {
    return {
      promo: this.getPromoSettings(),
      mailing: this.getMailingSettings()
    };
  }

  async update(input: Partial<AppSettings>) {
    const next = this.merge({
      promo: input.promo,
      mailing: input.mailing
    });

    if (next.promo.discountValue < 0 || next.promo.maxCount < 1) {
      throw new BadRequestException("Invalid promo settings.");
    }
    if (next.promo.validityDays < 1) {
      throw new BadRequestException("Promo validity must be at least 1 day.");
    }
    if (!next.mailing.from || !next.mailing.displayName) {
      throw new BadRequestException("Mailing from and display name are required.");
    }

    const [saved] = await this.databaseService.db
      .insert(appSettings)
      .values({ key: SETTINGS_KEY, value: next, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: appSettings.key,
        set: { value: next, updatedAt: new Date() }
      })
      .returning();

    this.cache = this.merge(saved.value as Partial<AppSettings>);
    return {
      ...this.getAll(),
      updatedAt: saved.updatedAt
    };
  }
}
