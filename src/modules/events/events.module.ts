import { Module } from "@nestjs/common";
import { ExternalModule } from "../external/external.module";
import { EventsMaintenanceService } from "./events-maintenance.service";
import { EventsSchedulerService } from "./events-scheduler.service";

@Module({
  imports: [ExternalModule],
  providers: [EventsMaintenanceService, EventsSchedulerService],
  exports: [EventsMaintenanceService]
})
export class EventsModule {}
