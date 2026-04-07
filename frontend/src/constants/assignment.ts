export const ASSIGNMENT_STATUS = {
    PENDING: "pending",
    ACCEPTED: "accepted",
    REJECTED: "rejected",
    COMPLETED: "completed"
} as const;

export type ASSIGNMENT_STATUS = (typeof ASSIGNMENT_STATUS)[keyof typeof ASSIGNMENT_STATUS];

export const WORK_STATUS = {
    ASSIGNED: "assigned",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
    CANCELLED: "cancelled"
} as const;

export type WORK_STATUS = (typeof WORK_STATUS)[keyof typeof WORK_STATUS];

export const ASSIGNMENT_TYPE = {
    OPEN: "open",
    DIRECT: "direct"
} as const;

export type ASSIGNMENT_TYPE = (typeof ASSIGNMENT_TYPE)[keyof typeof ASSIGNMENT_TYPE];

