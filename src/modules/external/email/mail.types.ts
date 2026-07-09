export type MailKind = "signup_promo" | "payment_reward";

export type SendMailPayload = {
  email: string;
  referralCode: string;
  promoCode: string;
  kind: MailKind;
};

export type DinnoEmailRequest = {
  To: string;
  Bcc: string;
  Subject: string;
  Body: string;
  IsBodyHtml: boolean;
  From: string;
  DisplayName: string;
};
