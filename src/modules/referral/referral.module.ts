import { Module } from "@nestjs/common";
import { ExternalModule } from "../external/external.module";
import { ReferralController } from "./referral.controller";
import { ReferralService } from "./referral.service";

@Module({
  imports: [ExternalModule],
  controllers: [ReferralController],
  providers: [ReferralService]
})
export class ReferralModule {}
