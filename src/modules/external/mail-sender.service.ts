import { Injectable } from "@nestjs/common";
import { env } from "../../config/env";
import { SettingsService } from "../settings/settings.service";
import { DinnoEmailClient } from "./email/dinno-email.client";
import { buildMailHtml, buildMailSubject } from "./email/mail-templates";
import type { SendMailPayload } from "./email/mail.types";

@Injectable()
export class MailSenderService {
  constructor(
    private readonly dinnoEmailClient: DinnoEmailClient,
    private readonly settingsService: SettingsService
  ) {}

  async sendMail(payload: SendMailPayload): Promise<void> {
    if (!payload.promoCode) {
      console.info("[mail:dev] skipped send without promoCode", payload);
      return;
    }

    if (!env.EMAIL_API_KEY) {
      console.info("[mail:dev] skipped send", payload);
      return;
    }

    const mailing = this.settingsService.getMailingSettings();

    await this.dinnoEmailClient.send({
      To: payload.email,
      Bcc: mailing.bcc,
      Subject: buildMailSubject(payload.kind),
      Body: buildMailHtml(payload.kind, {
        promoCode: payload.promoCode,
        referralCode: payload.referralCode
      }),
      IsBodyHtml: true,
      From: mailing.from,
      DisplayName: mailing.displayName
    });
  }
}
