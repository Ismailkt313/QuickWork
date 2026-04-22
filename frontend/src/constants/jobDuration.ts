export const JOB_DURATION_TYPE = {
  HALF_DAY: "half_day",
  FULL_DAY: "full_day",
  MULTI_DAY: "multi_day",
} as const;

export type JOB_DURATION_TYPE =
  (typeof JOB_DURATION_TYPE)[keyof typeof JOB_DURATION_TYPE];
