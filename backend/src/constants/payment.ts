export const PAYMENT_STATUS = {
    PENDING: 'pending',
    AWAITING_CONFIRMATION: 'awaiting_confirmation',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
} as const;

export const PAYMENT_METHOD = {
    ONLINE: 'ONLINE',
    CASH: 'CASH',
} as const;

export type PAYMENT_STATUS = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];
export type PAYMENT_METHOD = typeof PAYMENT_METHOD[keyof typeof PAYMENT_METHOD];
