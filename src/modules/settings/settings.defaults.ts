export type PromoSettings = {
  discountType: string;
  discountValue: number;
  maxCount: number;
  validityDays: number;
};

export type MailingSettings = {
  from: string;
  bcc: string;
  displayName: string;
};

export type AppSettings = {
  promo: PromoSettings;
  mailing: MailingSettings;
};

export const SETTINGS_KEY = "global";

export const DEFAULT_SETTINGS: AppSettings = {
  promo: {
    discountType: "PERCENT",
    discountValue: 10,
    maxCount: 1,
    validityDays: 30
  },
  mailing: {
    from: "ticket@eventhub.am",
    bcc: "admin@eventhub.am",
    displayName: "Eventhub"
  }
};
