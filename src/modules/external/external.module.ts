import { Module } from "@nestjs/common";
import { EventHubApiClient } from "./eventhub/eventhub-api.client";
import { EventHubEventsService } from "./eventhub/eventhub-events.service";
import { DinnoEmailClient } from "./email/dinno-email.client";
import { MailSenderService } from "./mail-sender.service";
import { PromoApiClient } from "./promo/promo-api.client";
import { PromoExternalService } from "./promo-external.service";

@Module({
  providers: [
    EventHubApiClient,
    EventHubEventsService,
    PromoApiClient,
    PromoExternalService,
    DinnoEmailClient,
    MailSenderService
  ],
  exports: [
    EventHubApiClient,
    EventHubEventsService,
    PromoApiClient,
    PromoExternalService,
    DinnoEmailClient,
    MailSenderService
  ]
})
export class ExternalModule {}
