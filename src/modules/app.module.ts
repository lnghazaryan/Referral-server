import { Module } from "@nestjs/common";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { ContentModule } from "./content/content.module";
import { DatabaseModule } from "./database/database.module";
import { EventsModule } from "./events/events.module";
import { HealthController } from "./health.controller";
import { ReferralModule } from "./referral/referral.module";
import { SettingsModule } from "./settings/settings.module";

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    EventsModule,
    AdminModule,
    ContentModule,
    SettingsModule,
    ReferralModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
