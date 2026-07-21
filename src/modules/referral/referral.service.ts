import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException
} from "@nestjs/common";
import { and, eq, lte } from "drizzle-orm";
import { getArmeniaNow } from "../../common/utils/event-datetime";
import {
  buildEventHubRelativePath,
  EventUrlSlugs
} from "../../common/utils/event-slug";
import { filterValidGuids } from "../../common/utils/guid";
import { events, promos, referred, referrals } from "../../db/schema";
import {
  ExternalPromoResponse,
  PromoExternalService
} from "../external/promo-external.service";
import { MailSenderService } from "../external/mail-sender.service";
import { DatabaseService } from "../database/database.service";
import { CreateReferredDto } from "./dto/create-referred.dto";
import { ReferredPaymentDto } from "./dto/referred-payment.dto";
import { RegisterReferralDto } from "./dto/register-referral.dto";
import { generateReferralCode } from "./utils/generate-referral-code";
import { REFERRAL_API_ERRORS } from "./referral-api.errors";

const PROMO_PURPOSE_SIGNUP = "signup";
const PROMO_PURPOSE_PAYMENT_REWARD = "payment_reward";

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly promoExternalService: PromoExternalService,
    private readonly mailSenderService: MailSenderService
  ) {}

  async listReferrals() {
    return this.databaseService.db.select().from(referrals);
  }

  async getReferralById(referralId: number) {
    const [referral] = await this.databaseService.db
      .select()
      .from(referrals)
      .where(eq(referrals.referralId, referralId))
      .limit(1);

    if (!referral) {
      throw new NotFoundException("Referral not found.");
    }

    return referral;
  }

  async registerReferral(dto: RegisterReferralDto) {
    const [existingByEmail] = await this.databaseService.db
      .select()
      .from(referrals)
      .where(eq(referrals.email, dto.email))
      .limit(1);
    if (existingByEmail) {
      this.logger.log(
        `registerReferral: referral already exists referralId=${existingByEmail.referralId} email=${dto.email}`
      );
      return existingByEmail;
    }

    const referralCode = await this.generateUniqueReferralCode();
    const [created] = await this.databaseService.db
      .insert(referrals)
      .values({
        email: dto.email,
        phone: dto.phone,
        referralCode,
        eventId: dto.eventId
      })
      .returning();

    return created;
  }

  async listPublicEvents() {
    await this.removePastEvents();

    const list = await this.databaseService.db.select().from(events);
    return list
      .filter((event) => Boolean(event.eventId))
      .map((event) => {
        const data = (event.data ?? {}) as Record<string, unknown>;
        const urlSlugs = data.urlSlugs as EventUrlSlugs | undefined;
        const imageUrl =
          (typeof data.imageUrl === "string" && data.imageUrl) ||
          (typeof data.bannerUrl === "string" && data.bannerUrl) ||
          null;
        const eventUrlPath =
          urlSlugs && event.eventId
            ? buildEventHubRelativePath(event.eventId, urlSlugs)
            : null;
        return {
          eventId: event.eventId,
          name: event.name,
          date: event.date,
          venue: event.venue,
          category: event.category,
          eventUrlPath,
          imageUrl
        };
      });
  }

  async createReferred(dto: CreateReferredDto) {
    this.logger.log(
      `createReferred: start email=${dto.email} referralCode=${dto.referralCode}`
    );

    const referralOwner = await this.getReferralByCode(dto.referralCode);

    if (referralOwner.email.toLowerCase() === dto.email.toLowerCase()) {
      throw new BadRequestException(REFERRAL_API_ERRORS.SELF_REFERRAL);
    }

    await this.ensureReferredEmailAvailable(dto.email);

    // Generate the external promo BEFORE persisting the referred user.
    // If promo creation crashes, the user is never added to our DB.
    const external = await this.createExternalPromo(dto.email);

    // On signup/join there is no event or phone yet: always create the referred
    // user with no event, no phone and hasPayment = false.
    const [createdReferred] = await this.databaseService.db
      .insert(referred)
      .values({
        email: dto.email,
        phone: null,
        referralCode: dto.referralCode,
        eventId: null,
        hasPayment: false
      })
      .returning();
    this.logger.log(
      `createReferred: referred user stored referredId=${createdReferred.referredId} email=${dto.email}`
    );

    const promo = await this.storePromo(
      createdReferred.referredId,
      PROMO_PURPOSE_SIGNUP,
      {
        ...external,
        recipientEmail: createdReferred.email,
        recipientRole: "referred"
      }
    );

    await this.sendPromoMail({
      email: createdReferred.email,
      referralCode: referralOwner.referralCode,
      promoCode: promo.code,
      kind: "signup_promo"
    });

    this.logger.log(
      `createReferred: done referredId=${createdReferred.referredId} promoCode=${promo.code}`
    );
    return { referred: createdReferred, promo };
  }

  async updatePromoIsUsed(promoId: number, isUsed: boolean) {
    const [updated] = await this.databaseService.db
      .update(promos)
      .set({ isUsed })
      .where(eq(promos.id, promoId))
      .returning();

    if (!updated) {
      throw new NotFoundException("Promo not found.");
    }

    return updated;
  }

  async completeReferredPayment(dto: ReferredPaymentDto) {
    this.logger.log(
      `completeReferredPayment: start email=${dto.email} referralCode=${dto.referralCode}`
    );

    const referralOwner = await this.getReferralByCode(dto.referralCode);

    if (referralOwner.email.toLowerCase() === dto.email.toLowerCase()) {
      throw new BadRequestException(REFERRAL_API_ERRORS.SELF_REFERRAL);
    }

    const [existingReferred] = await this.databaseService.db
      .select()
      .from(referred)
      .where(
        and(
          eq(referred.email, dto.email),
          eq(referred.referralCode, dto.referralCode)
        )
      )
      .limit(1);

    if (existingReferred?.hasPayment) {
      throw new ConflictException("Referred user already completed payment.");
    }

    if (
      existingReferred &&
      dto.phone &&
      existingReferred.phone &&
      existingReferred.phone !== dto.phone
    ) {
      throw new BadRequestException(
        "Phone number does not match referred user."
      );
    }

    if (existingReferred) {
      const existingReward = await this.getPromoByPurpose(
        existingReferred.referredId,
        PROMO_PURPOSE_PAYMENT_REWARD
      );
      if (existingReward) {
        this.logger.log(
          `completeReferredPayment: reward already exists referredId=${existingReferred.referredId}`
        );
        return { referred: existingReferred, promo: existingReward };
      }
    }

    // The referrer reward promo is only generated when the purchased event is
    // in our admin events list. When it is not, hasPayment stays false and no
    // reward promo is sent to the referrer.
    const eventInList = await this.isEventInList(dto.eventId);
    this.logger.log(
      `completeReferredPayment: eventId=${dto.eventId} inList=${eventInList}`
    );

    if (existingReferred) {
      return this.rewardExistingReferred(
        existingReferred,
        referralOwner,
        dto,
        eventInList
      );
    }

    return this.createReferredOnPayment(referralOwner, dto, eventInList);
  }

  // Referred user already exists (they signed up earlier). On payment we only
  // reward the referrer and flip hasPayment when the event is in our list.
  private async rewardExistingReferred(
    existingReferred: typeof referred.$inferSelect,
    referralOwner: typeof referrals.$inferSelect,
    dto: ReferredPaymentDto,
    eventInList: boolean
  ) {
    // Create the referrer promo BEFORE persisting so a promo failure never
    // records the payment.
    const external = eventInList
      ? await this.createExternalPromo(referralOwner.email)
      : null;

    const [updatedReferred] = await this.databaseService.db
      .update(referred)
      .set({
        hasPayment: eventInList,
        phone: existingReferred.phone ?? dto.phone ?? null,
        buyPrice:
          dto.buyPrice != null
            ? String(dto.buyPrice)
            : existingReferred.buyPrice,
        // Only record the event when it is in our list; a non-list payment must
        // not overwrite the stored event and keeps it null for pending records.
        eventId: eventInList ? dto.eventId : existingReferred.eventId
      })
      .where(eq(referred.referredId, existingReferred.referredId))
      .returning();
    this.logger.log(
      `completeReferredPayment: updated referredId=${updatedReferred.referredId} hasPayment=${eventInList}`
    );

    if (!external) {
      this.logger.log(
        `completeReferredPayment: event not in list, no referrer promo generated referredId=${updatedReferred.referredId}`
      );
      return { referred: updatedReferred, promo: null };
    }

    const promo = await this.storePromo(
      updatedReferred.referredId,
      PROMO_PURPOSE_PAYMENT_REWARD,
      {
        ...external,
        recipientEmail: referralOwner.email,
        recipientRole: "referrer"
      }
    );

    await this.sendPromoMail({
      email: referralOwner.email,
      referralCode: referralOwner.referralCode,
      promoCode: promo.code,
      kind: "payment_reward"
    });

    this.logger.log(
      `completeReferredPayment: done referredId=${updatedReferred.referredId} promoCode=${promo.code}`
    );
    return { referred: updatedReferred, promo };
  }

  // Referred user paid without signing up first. When the paid event is not in
  // our list we still store them (as a pending record: hasPayment=false,
  // eventId=null, no promo) so they can be rewarded later if they pay for one
  // of our events with this referral code. When the event is in our list we
  // send them their own promo and reward the referrer.
  private async createReferredOnPayment(
    referralOwner: typeof referrals.$inferSelect,
    dto: ReferredPaymentDto,
    eventInList: boolean
  ) {
    if (!eventInList) {
      const [pendingReferred] = await this.databaseService.db
        .insert(referred)
        .values({
          email: dto.email,
          phone: dto.phone ?? null,
          referralCode: dto.referralCode,
          eventId: null,
          hasPayment: false,
          buyPrice: dto.buyPrice != null ? String(dto.buyPrice) : null
        })
        .returning();
      this.logger.log(
        `completeReferredPayment: event not in list, stored pending referred referredId=${pendingReferred.referredId} (no promo, eventId=null, hasPayment=false)`
      );
      return { referred: pendingReferred, promo: null };
    }

    // Create all external promos BEFORE persisting. If any fails, no user is
    // stored and no payment is recorded.
    const referredExternal = await this.createExternalPromo(dto.email);
    const referrerExternal = await this.createExternalPromo(referralOwner.email);

    const [createdReferred] = await this.databaseService.db
      .insert(referred)
      .values({
        email: dto.email,
        phone: dto.phone ?? null,
        referralCode: dto.referralCode,
        eventId: dto.eventId,
        hasPayment: true,
        buyPrice: dto.buyPrice != null ? String(dto.buyPrice) : null
      })
      .returning();
    this.logger.log(
      `completeReferredPayment: created new referred referredId=${createdReferred.referredId} hasPayment=true`
    );

    const referredPromo = await this.storePromo(
      createdReferred.referredId,
      PROMO_PURPOSE_SIGNUP,
      {
        ...referredExternal,
        recipientEmail: createdReferred.email,
        recipientRole: "referred"
      }
    );

    await this.sendPromoMail({
      email: createdReferred.email,
      referralCode: referralOwner.referralCode,
      promoCode: referredPromo.code,
      kind: "signup_promo"
    });

    const rewardPromo = await this.storePromo(
      createdReferred.referredId,
      PROMO_PURPOSE_PAYMENT_REWARD,
      {
        ...referrerExternal,
        recipientEmail: referralOwner.email,
        recipientRole: "referrer"
      }
    );

    await this.sendPromoMail({
      email: referralOwner.email,
      referralCode: referralOwner.referralCode,
      promoCode: rewardPromo.code,
      kind: "payment_reward"
    });

    this.logger.log(
      `completeReferredPayment: done referredId=${createdReferred.referredId} rewardPromoCode=${rewardPromo.code}`
    );
    return { referred: createdReferred, promo: rewardPromo };
  }

  async updateReferredHasPayment(referredId: number, hasPayment: boolean) {
    const [existing] = await this.databaseService.db
      .select()
      .from(referred)
      .where(eq(referred.referredId, referredId))
      .limit(1);

    if (!existing) {
      throw new NotFoundException("Referred user not found.");
    }

    if (hasPayment && !existing.hasPayment) {
      return this.completeReferredPayment({
        email: existing.email,
        referralCode: existing.referralCode,
        eventId: existing.eventId ?? "",
        phone: existing.phone ?? undefined
      });
    }

    const [updated] = await this.databaseService.db
      .update(referred)
      .set({ hasPayment })
      .where(eq(referred.referredId, referredId))
      .returning();

    return updated;
  }

  async listReferred() {
    return this.databaseService.db
      .select({
        referredId: referred.referredId,
        email: referred.email,
        phone: referred.phone,
        referralCode: referred.referralCode,
        eventId: referred.eventId,
        hasPayment: referred.hasPayment,
        buyPrice: referred.buyPrice,
        createdAt: referred.createdAt,
        referrerId: referrals.referralId,
        referrerEmail: referrals.email,
        referrerPhone: referrals.phone
      })
      .from(referred)
      .innerJoin(referrals, eq(referred.referralCode, referrals.referralCode));
  }

  async getReferredById(referredId: number) {
    const [referredUser] = await this.databaseService.db
      .select({
        referredId: referred.referredId,
        email: referred.email,
        phone: referred.phone,
        referralCode: referred.referralCode,
        eventId: referred.eventId,
        hasPayment: referred.hasPayment,
        buyPrice: referred.buyPrice,
        createdAt: referred.createdAt,
        referrerId: referrals.referralId,
        referrerEmail: referrals.email,
        referrerPhone: referrals.phone
      })
      .from(referred)
      .innerJoin(referrals, eq(referred.referralCode, referrals.referralCode))
      .where(eq(referred.referredId, referredId))
      .limit(1);

    if (!referredUser) {
      throw new NotFoundException("Referred user not found.");
    }

    return referredUser;
  }

  async listPromos() {
    return this.databaseService.db
      .select({
        id: promos.id,
        promoId: promos.promoId,
        code: promos.code,
        type: promos.type,
        purpose: promos.purpose,
        referredId: promos.referredId,
        referredEmail: referred.email,
        referredPhone: referred.phone,
        recipientEmail: promos.recipientEmail,
        recipientRole: promos.recipientRole,
        eventId: promos.eventId,
        isUsed: promos.isUsed,
        createdAt: promos.createdAt,
        expiredAt: promos.expiredAt
      })
      .from(promos)
      .leftJoin(referred, eq(promos.referredId, referred.referredId));
  }

  async resendPromoEmail(id: number) {
    const [row] = await this.databaseService.db
      .select({
        id: promos.id,
        code: promos.code,
        purpose: promos.purpose,
        recipientEmail: promos.recipientEmail,
        recipientRole: promos.recipientRole,
        referredEmail: referred.email,
        referralCode: referred.referralCode
      })
      .from(promos)
      .leftJoin(referred, eq(promos.referredId, referred.referredId))
      .where(eq(promos.id, id))
      .limit(1);

    if (!row) {
      throw new NotFoundException("Promo not found.");
    }

    if (!row.referralCode) {
      throw new BadRequestException(
        "Promo is not linked to a referred user, cannot resend."
      );
    }

    const referralOwner = await this.getReferralByCode(row.referralCode);
    const isReward = row.purpose === PROMO_PURPOSE_PAYMENT_REWARD;

    // Prefer the stored recipient; fall back to purpose-based resolution.
    const recipient =
      row.recipientEmail ??
      (isReward ? referralOwner.email : row.referredEmail);
    if (!recipient) {
      throw new BadRequestException("Recipient email not found for this promo.");
    }

    this.logger.log(
      `resendPromoEmail: promoId=${id} purpose=${row.purpose} to=${recipient}`
    );

    await this.mailSenderService.sendMail({
      email: recipient,
      referralCode: referralOwner.referralCode,
      promoCode: row.code,
      kind: isReward ? "payment_reward" : "signup_promo"
    });

    this.logger.log(`resendPromoEmail: sent promoId=${id} to=${recipient}`);
    return { ok: true, email: recipient, promoCode: row.code };
  }

  private async getReferralByCode(referralCode: string) {
    const [referralOwner] = await this.databaseService.db
      .select()
      .from(referrals)
      .where(eq(referrals.referralCode, referralCode))
      .limit(1);

    if (!referralOwner) {
      throw new NotFoundException(REFERRAL_API_ERRORS.REFERRAL_CODE_NOT_FOUND);
    }

    return referralOwner;
  }

  private async ensureReferredEmailAvailable(email: string) {
    const [existingByEmail] = await this.databaseService.db
      .select()
      .from(referred)
      .where(eq(referred.email, email))
      .limit(1);
    if (existingByEmail) {
      throw new ConflictException(REFERRAL_API_ERRORS.REFERRED_EMAIL_EXISTS);
    }
  }

  private async isEventInList(
    eventId: string | null | undefined
  ): Promise<boolean> {
    if (!eventId) {
      return false;
    }

    const [row] = await this.databaseService.db
      .select({ eventId: events.eventId })
      .from(events)
      .where(eq(events.eventId, eventId))
      .limit(1);

    return Boolean(row);
  }

  private async getPromoByPurpose(referredId: number, purpose: string) {
    const [existingPromo] = await this.databaseService.db
      .select()
      .from(promos)
      .where(
        and(eq(promos.referredId, referredId), eq(promos.purpose, purpose))
      )
      .limit(1);

    return existingPromo ?? null;
  }

  private async createExternalPromo(
    contextEmail: string
  ): Promise<{ external: ExternalPromoResponse; eventIds: string[] }> {
    const eventIds = await this.loadPromoEventIds();
    this.logger.log(
      `createExternalPromo: sending ${eventIds.length} event(s) for ${contextEmail} [${eventIds.join(", ")}]`
    );

    try {
      const external = await this.promoExternalService.createPromo({
        eventIds
      });
      this.logger.log(
        `createExternalPromo: promo created for ${contextEmail} code=${external.code}`
      );
      return { external, eventIds };
    } catch (error) {
      this.logger.error(
        `createExternalPromo: FAILED for ${contextEmail}. User will not be saved. ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw error;
    }
  }

  private async storePromo(
    referredId: number,
    purpose: string,
    input: {
      external: ExternalPromoResponse;
      eventIds: string[];
      recipientEmail: string;
      recipientRole: "referred" | "referrer";
    }
  ) {
    const { external, eventIds, recipientEmail, recipientRole } = input;
    const primaryEventId = eventIds[referredId % eventIds.length];

    const [createdPromo] = await this.databaseService.db
      .insert(promos)
      .values({
        promoId: external.promoId,
        code: external.code,
        type: external.type,
        purpose,
        expiredAt: new Date(external.expiredAt),
        referredId,
        recipientEmail,
        recipientRole,
        eventId: primaryEventId,
        isUsed: false
      })
      .returning();

    this.logger.log(
      `storePromo: stored promo id=${createdPromo.id} referredId=${referredId} purpose=${purpose} recipient=${recipientEmail} (${recipientRole})`
    );
    return createdPromo;
  }

  private async sendPromoMail(payload: {
    email: string;
    referralCode: string;
    promoCode: string;
    kind: "signup_promo" | "payment_reward";
  }) {
    try {
      await this.mailSenderService.sendMail(payload);
      this.logger.log(
        `sendPromoMail: sent ${payload.kind} to ${payload.email}`
      );
    } catch (error) {
      // Mail is a separate concern; a failure must not roll back the promo.
      this.logger.error(
        `sendPromoMail: FAILED ${payload.kind} to ${payload.email}. ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private async loadPromoEventIds(): Promise<string[]> {
    await this.removePastEvents();

    const eventList = await this.databaseService.db.select().from(events);
    const eventIds = filterValidGuids(
      eventList
        .map((item) => item.eventId)
        .filter((eventId): eventId is string => Boolean(eventId))
    );

    if (eventIds.length === 0) {
      throw new BadRequestException(
        "No valid EventHub event UUIDs selected in admin for promo generation."
      );
    }

    return eventIds;
  }

  private async removePastEvents() {
    const now = getArmeniaNow();
    await this.databaseService.db.delete(events).where(lte(events.date, now));
  }

  private async generateUniqueReferralCode() {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const referralCode = generateReferralCode();
      const [existing] = await this.databaseService.db
        .select()
        .from(referrals)
        .where(eq(referrals.referralCode, referralCode))
        .limit(1);
      if (!existing) {
        return referralCode;
      }
    }

    throw new BadRequestException("Failed to generate unique referral code.");
  }
}
