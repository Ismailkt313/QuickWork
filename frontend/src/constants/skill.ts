export const SKILL_STATUS = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected"
} as const;

export type SKILL_STATUS = (typeof SKILL_STATUS)[keyof typeof SKILL_STATUS];
