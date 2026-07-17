// Stable API error codes returned to clients. Landing maps these to CMS keys.
export const REFERRAL_API_ERRORS = {
  REFERRAL_CODE_NOT_FOUND: "REFERRAL_CODE_NOT_FOUND",
  REFERRED_EMAIL_EXISTS: "REFERRED_EMAIL_EXISTS",
  SELF_REFERRAL: "SELF_REFERRAL"
} as const;

export type ReferralApiErrorCode =
  (typeof REFERRAL_API_ERRORS)[keyof typeof REFERRAL_API_ERRORS];
