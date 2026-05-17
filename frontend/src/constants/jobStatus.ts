export const JOB_STATUS = {
  OPEN: "open",
  PARTIALLY_ASSIGNED: "partially_assigned",
  FULLY_ASSIGNED: "fully_assigned",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REJECTED: "rejected",
  EXPIRED: "expired",
} as const;

export type JOB_STATUS = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];
