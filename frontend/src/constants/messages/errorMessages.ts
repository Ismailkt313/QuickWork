export const ErrorMessages = {
  INVALID_CREDENTIALS: "Invalid credentials",
  UNAUTHORIZED: "Unauthorized access",
  TOKEN_EXPIRED: "Session expired, please login again",
  ACCESS_DENIED: "You do not have permission to perform this action",
  INTERNAL_SERVER_ERROR: "Something went wrong. Please try again later",
  INVALID_OR_EXPIRED_TOKEN: "Invalid or expired token",
  PLEASE_LOGIN: "Please login to continue",
  USER_NOT_FOUND: "User not found",
  EMAIL_ALREADY_EXISTS: "Email already exists",
  INVALID_OTP: "Invalid OTP",
  OTP_EXPIRED: "OTP expired",
  REGISTRATION_SESSION_EXPIRED:
    "Registration session expired. Please register again",
  ACCOUNT_BLOCKED: "Your account has been blocked",
  INVALID_CURRENT_PASSWORD: "Invalid current password",

  RESET_REQUEST_EXPIRED: "Reset request expired",
  RESET_CODE_EXPIRED: "Reset code expired",
  INVALID_RESET_CODE: "Invalid reset code",

  INVALID_DISTRICT: "Invalid district selected",
  DISTRICT_MISMATCH: "Selected location does not belong to the chosen district",
  BUDGET_REQUIRED: "Budget information is required",
  MIN_BUDGET_ERROR: (min: number) => `Minimum budget must be at least ₹${min}`,
  MAX_BUDGET_ERROR:
    "Maximum budget must be greater than or equal to minimum budget",
  BUDGET_POSITIVE: "Budget values must be greater than zero",
  JOB_NOT_FOUND: "Job not found",
  JOB_UNAVAILABLE: "Job not found or unavailable",
  JOB_NOT_OPEN: "Job is no longer open for acceptance",
  JOB_ALREADY_ACCEPTED: "You have already accepted this job",
  JOB_OVERLAP: "You have another job overlapping with this schedule",
  JOB_FULLY_ASSIGNED: "Job is already fully assigned",
  OFFER_NOT_FOR_USER: "This offer is not for you",
  OFFER_INVALID: "Offer is no longer valid or already accepted",
  UNAUTHORIZED_CANCEL: "Unauthorized to cancel this job",
  CANCEL_ALREADY_CLOSED: (status: string) =>
    `Cannot cancel a job that is already ${status}`,
  PROFILE_UNDER_VERIFICATION: "Profile under verification by admin",

  SKILL_NOT_FOUND: "Skill not found",

  ASSIGNMENT_NOT_FOUND: "Assignment not found or unauthorized",
  PROVIDER_NOT_AVAILABLE: "Provider is not available",
  RESET_NOT_ALLOWED: "Only rejected applications can be reset",

  RESOURCE_ALREADY_EXISTS: "Resource already exists",
  MISSING_REQUIRED_FIELDS: "Required fields are missing",
  IMAGE_SIZE_ERROR: "Image size must be less than 2MB",
  PORTFOLIO_REQUIRED: "At least one portfolio item is required",
  MAX_IMAGES_EXCEEDED: "Maximum 5 images allowed",

  SERVICE_REQUEST_NOT_FOUND: "Service request not found",
  SERVICE_REQUEST_ID_REQUIRED: "Service request ID is required",
};
