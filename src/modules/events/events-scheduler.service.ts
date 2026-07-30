import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import {
  getArmeniaNow,
  getNextArmeniaSlot
} from "../../common/utils/event-datetime";
import { EventsMaintenanceService } from "./events-maintenance.service";

/** Armenia wall-clock hours when stored events are reconciled. */
const EVENT_CHECK_HOURS = [10, 22] as const;

@Injectable()
export class EventsSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventsSchedulerService.name);
  private timer: NodeJS.Timeout | null = null;
  private stopped = false;

  constructor(
    private readonly eventsMaintenanceService: EventsMaintenanceService
  ) {}

  onModuleInit() {
    this.scheduleNextRun();
  }

  onModuleDestroy() {
    this.stopped = true;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private scheduleNextRun() {
    if (this.stopped) {
      return;
    }

    const now = getArmeniaNow();
    const next = getNextArmeniaSlot(EVENT_CHECK_HOURS, now);
    const delayMs = Math.max(next.getTime() - now.getTime(), 1_000);

    this.logger.log(
      `Next stored-events check at ${next.toISOString()} (in ${Math.round(delayMs / 60_000)} min, Armenia ${EVENT_CHECK_HOURS.join(":00 / ")}:00)`
    );

    this.timer = setTimeout(() => {
      void this.runAndReschedule();
    }, delayMs);
    this.timer.unref?.();
  }

  private async runAndReschedule() {
    try {
      this.logger.log("Running scheduled stored-events reconcile…");
      const result =
        await this.eventsMaintenanceService.reconcileStoredEvents();
      this.logger.log(
        `Scheduled reconcile done: checked=${result.checked} updated=${result.updated} removed=${result.removed}`
      );
    } catch (error) {
      this.logger.error(
        `Scheduled reconcile failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      this.scheduleNextRun();
    }
  }
}
