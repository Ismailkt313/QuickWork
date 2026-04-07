export const JOB_VISIBILITY = {
    PUBLIC: "public",
    PRIVATE: "private"
} as const;

export type JOB_VISIBILITY = (typeof JOB_VISIBILITY)[keyof typeof JOB_VISIBILITY];
