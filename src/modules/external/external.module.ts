import { Module } from "@nestjs/common";
import { EventHubApiClient } from "./eventhub/eventhub-api.client";
import { EventHubEventsService } from "./eventhub/eventhub-events.service";
import { CustomerBookingsService } from "./eventhub-admin/customer-bookings.service";
import { EventHubAdminApiClient } from "./eventhub-admin/eventhub-admin-api.client";
import { DinnoEmailClient } from "./email/dinno-email.client";
import { MailSenderService } from "./mail-sender.service";
import { PromoApiClient } from "./promo/promo-api.client";
import { PromoExternalService } from "./promo-external.service";

@Module({
  providers: [
    EventHubApiClient,
    EventHubEventsService,
    EventHubAdminApiClient,
    CustomerBookingsService,
    PromoApiClient,
    PromoExternalService,
    DinnoEmailClient,
    MailSenderService
  ],
  exports: [
    EventHubApiClient,
    EventHubEventsService,
    EventHubAdminApiClient,
    CustomerBookingsService,
    PromoApiClient,
    PromoExternalService,
    DinnoEmailClient,
    MailSenderService
  ]
})
export class ExternalModule {}
