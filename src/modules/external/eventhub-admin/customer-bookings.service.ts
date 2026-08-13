import { Injectable, Logger } from "@nestjs/common";
import { parseEventHubDateTime } from "../../../common/utils/event-datetime";
import { EventHubAdminApiClient } from "./eventhub-admin-api.client";

export type EventHubBookingItem = {
  bookingId: string;
  bookingDate: string | null;
  bookingStatus: string | null;
  emailAddress: string | null;
  paymentId: number | null;
  paymentDate: string | null;
  amount: number | null;
  eventId: string | null;
  eventName: string | null;
};

export type EventHubBookingsSearchResponse = {
  totalCount: number;
  page: number;
  pageSize: number;
  items: EventHubBookingItem[];
};

export type CustomerBookingSummary = {
  /** Paid bookings made before the reference date (program join date). */
  priorBookingCount: number;
  /** All paid bookings this customer ever made. */
  totalBookingCount: number;
  firstBookingDate: Date | null;
  /** True when the customer had no paid booking before joining. */
  isNewCustomer: boolean;
};

const PAGE_SIZE = 100;
const MAX_PAGES = 10;
const UNPAID_STATUS_PATTERNS = ["CANCEL", "REFUND", "EXPIRED", "FAIL"];

@Injectable()
export class CustomerBookingsService {
  private readonly logger = new Logger(CustomerBookingsService.name);

  constructor(private readonly adminApiClient: EventHubAdminApiClient) {}

  async searchBookingsByEmail(email: string): Promise<EventHubBookingItem[]> {
    const collected: EventHubBookingItem[] = [];

    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const response =
        await this.adminApiClient.get<EventHubBookingsSearchResponse>(
          "/Bookings/Search",
          {
            query: {
              page,
              pageSize: PAGE_SIZE,
              customerMail: email
            }
          }
        );

      const items = response?.items ?? [];
      collected.push(...items);

      const totalCount = Number(response?.totalCount ?? 0);
      if (items.length < PAGE_SIZE || collected.length >= totalCount) {
        break;
      }
    }

    return collected;
  }

  /**
   * Builds the booking history snapshot for a referred user. Bookings made
   * before `joinedAt` decide whether they were already an EventHub customer.
   */
  async getBookingSummary(
    email: string,
    joinedAt: Date
  ): Promise<CustomerBookingSummary> {
    const bookings = await this.searchBookingsByEmail(email);
    const paidBookings = bookings.filter((booking) => this.isPaid(booking));

    let priorBookingCount = 0;
    let firstBookingDate: Date | null = null;

    for (const booking of paidBookings) {
      const bookingDate = parseEventHubDateTime(booking.bookingDate);
      if (!bookingDate) {
        continue;
      }
      if (bookingDate.getTime() < joinedAt.getTime()) {
        priorBookingCount += 1;
      }
      if (!firstBookingDate || bookingDate < firstBookingDate) {
        firstBookingDate = bookingDate;
      }
    }

    this.logger.log(
      `getBookingSummary: ${email} bookings=${bookings.length} paid=${paidBookings.length} prior=${priorBookingCount}`
    );

    return {
      priorBookingCount,
      totalBookingCount: paidBookings.length,
      firstBookingDate,
      isNewCustomer: priorBookingCount === 0
    };
  }

  private isPaid(booking: EventHubBookingItem): boolean {
    const status = (booking.bookingStatus ?? "").toUpperCase();
    if (UNPAID_STATUS_PATTERNS.some((pattern) => status.includes(pattern))) {
      return false;
    }

    return booking.paymentId != null || Boolean(booking.paymentDate);
  }
}
