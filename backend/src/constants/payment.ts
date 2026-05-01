export const PAYMENT_STATUS = {
    PENDING: 'pending',
    AWAITING_PROVIDER_CONFIRMATION: 'awaiting_provider_confirmation',
    PAID: 'paid',
    FAILED: 'failed',
    REFUNDED: 'refunded'
} as const;

export const PAYMENT_METHOD = {
    ONLINE: 'online',
    OFFLINE: 'offline',
} as const;

export type PAYMENT_STATUS = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];
export type PAYMENT_METHOD = typeof PAYMENT_METHOD[keyof typeof PAYMENT_METHOD];
