import { Module } from "@nestjs/common";
import { ExternalModule } from "../external/external.module";
import { EventsModule } from "../events/events.module";
import { ReferralController } from "./referral.controller";
import { ReferralService } from "./referral.service";

@Module({
  imports: [ExternalModule, EventsModule],
  controllers: [ReferralController],
  providers: [ReferralService]
})
export class ReferralModule {}
