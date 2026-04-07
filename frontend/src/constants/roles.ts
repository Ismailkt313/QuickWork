export const ROLES = {
    ADMIN: "admin",
    USER: "user",
    PROVIDER: "provider"
} as const;

export type ROLES = (typeof ROLES)[keyof typeof ROLES];
