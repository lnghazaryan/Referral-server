import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit
} from "@nestjs/common";
import { eq } from "drizzle-orm";
import { landingContent } from "../../db/schema";
import { DatabaseService } from "../database/database.service";
import {
  DEFAULT_CONTENT,
  HowStep,
  LocaleContent,
  SUPPORTED_LOCALES,
  SupportedLocale,
  isSupportedLocale
} from "./content.defaults";

@Injectable()
export class ContentService implements OnModuleInit {
  private readonly logger = new Logger(ContentService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async onModuleInit() {
    try {
      for (const locale of SUPPORTED_LOCALES) {
        const [existing] = await this.databaseService.db
          .select()
          .from(landingContent)
          .where(eq(landingContent.locale, locale))
          .limit(1);
        if (!existing) {
          await this.databaseService.db
            .insert(landingContent)
            .values({ locale, content: DEFAULT_CONTENT[locale] })
            .onConflictDoNothing();
          this.logger.log(`Seeded default landing content for "${locale}".`);
        } else {
          await this.upgradeStoredContent(locale, existing.content as LocaleContent);
        }
      }
    } catch (error) {
      this.logger.warn(
        `Skipped landing content seeding (table may not be migrated yet): ${String(
          error
        )}`
      );
    }
  }

  // Backfill structured "how.steps" for rows saved before the dynamic-steps
  // format existed (e.g. legacy how.step1.title keys or missing array).
  private async upgradeStoredContent(
    locale: SupportedLocale,
    stored: LocaleContent
  ) {
    const upgraded: LocaleContent = { ...stored };
    let needsUpdate = false;

    if (!Array.isArray(upgraded["how.steps"])) {
      const legacySteps: HowStep[] = [];
      for (let i = 1; i <= 20; i++) {
        const title = upgraded[`how.step${i}.title`];
        const desc = upgraded[`how.step${i}.desc`];
        if (title || desc) {
          legacySteps.push({
            title: title == null ? "" : String(title),
            desc: desc == null ? "" : String(desc)
          });
          delete upgraded[`how.step${i}.title`];
          delete upgraded[`how.step${i}.desc`];
        }
      }
      upgraded["how.steps"] =
        legacySteps.length > 0
          ? legacySteps
          : (DEFAULT_CONTENT[locale]["how.steps"] as HowStep[]);
      needsUpdate = true;
    } else if (
      Array.isArray(upgraded["how.steps"]) &&
      upgraded["how.steps"].length === 0
    ) {
      upgraded["how.steps"] = DEFAULT_CONTENT[locale]["how.steps"];
      needsUpdate = true;
    }

    if (!needsUpdate) return;

    await this.databaseService.db
      .update(landingContent)
      .set({ content: upgraded, updatedAt: new Date() })
      .where(eq(landingContent.locale, locale));
    this.logger.log(`Upgraded landing content for "${locale}".`);
  }

  private assertSupported(locale: string): SupportedLocale {
    if (!isSupportedLocale(locale)) {
      throw new BadRequestException(
        `Unsupported locale "${locale}". Allowed: ${SUPPORTED_LOCALES.join(", ")}.`
      );
    }
    return locale;
  }

  private async readStored(locale: SupportedLocale): Promise<LocaleContent> {
    const [row] = await this.databaseService.db
      .select()
      .from(landingContent)
      .where(eq(landingContent.locale, locale))
      .limit(1);
    return (row?.content as LocaleContent) ?? {};
  }

  // Effective content = defaults overlaid with whatever is stored in the DB.
  // This guarantees the landing always receives every key, even for keys added
  // to the defaults after the row was last saved.
  private merge(locale: SupportedLocale, stored: LocaleContent): LocaleContent {
    const merged: LocaleContent = { ...DEFAULT_CONTENT[locale], ...stored };
    // "how.steps" must always be an array; fall back to defaults if a legacy
    // or corrupted (stringified) value slipped into the DB.
    if (!Array.isArray(merged["how.steps"])) {
      merged["how.steps"] = DEFAULT_CONTENT[locale]["how.steps"] ?? [];
    }
    return merged;
  }

  async getPublicContent(locale: string): Promise<LocaleContent> {
    const safe = this.assertSupported(locale);
    return this.merge(safe, await this.readStored(safe));
  }

  async getForAdmin(locale: string) {
    const safe = this.assertSupported(locale);
    return {
      locale: safe,
      content: this.merge(safe, await this.readStored(safe))
    };
  }

  async getAllForAdmin() {
    const result = [];
    for (const locale of SUPPORTED_LOCALES) {
      result.push({
        locale,
        content: this.merge(locale, await this.readStored(locale))
      });
    }
    return result;
  }

  async upsert(locale: string, content: Record<string, unknown>) {
    const safe = this.assertSupported(locale);
    if (!content || typeof content !== "object" || Array.isArray(content)) {
      throw new BadRequestException("content must be an object of string values.");
    }

    // Scalars are coerced to strings; arrays/objects (e.g. the "how.steps"
    // list) are stored as-is so the landing can render structured content.
    const sanitized: LocaleContent = {};
    for (const [key, value] of Object.entries(content)) {
      if (value == null) {
        sanitized[key] = "";
      } else if (typeof value === "object") {
        sanitized[key] = value;
      } else {
        sanitized[key] = String(value);
      }
    }

    // Guarantee "how.steps" is a clean array of { title, desc } strings.
    if ("how.steps" in sanitized) {
      const raw = sanitized["how.steps"];
      sanitized["how.steps"] = Array.isArray(raw)
        ? raw.map((step) => {
            const item = (step ?? {}) as Record<string, unknown>;
            return {
              title: item.title == null ? "" : String(item.title),
              desc: item.desc == null ? "" : String(item.desc)
            };
          })
        : DEFAULT_CONTENT[safe]["how.steps"];
    }

    const [saved] = await this.databaseService.db
      .insert(landingContent)
      .values({ locale: safe, content: sanitized, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: landingContent.locale,
        set: { content: sanitized, updatedAt: new Date() }
      })
      .returning();

    return {
      locale: saved.locale,
      content: this.merge(safe, saved.content as LocaleContent),
      updatedAt: saved.updatedAt
    };
  }
}
