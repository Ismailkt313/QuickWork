export const VERIFICATION_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;

export type VERIFICATION_STATUS =
  (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];
