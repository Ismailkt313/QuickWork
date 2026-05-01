export const ErrorMessages = {
  INVALID_CREDENTIALS: "Invalid credentials",
  UNAUTHORIZED: "Unauthorized access",
  TOKEN_EXPIRED: "Session expired, please login again",
  ACCESS_DENIED: "You do not have permission to perform this action",

  USER_NOT_FOUND: "User not found",
  USER_ALREADY_EXISTS: "User already exists",

  PROVIDER_NOT_FOUND: "Service provider not found",
  APPLICATION_ALREADY_SUBMITTED: "You have already applied for this job",

  JOB_NOT_FOUND: "Job not found",
  JOB_ALREADY_FILLED: "This job is already filled",
  INVALID_JOB_STATUS: "Invalid job status",

  INVALID_LOCATION: "Invalid location data",
  LOCATION_NOT_FOUND: "Location not found",
  DISTRICT_MISMATCH: "Selected location does not match the district",

  FILE_UPLOAD_FAILED: "File upload failed",
  INVALID_FILE_TYPE: "Unsupported file type",
  FILE_TOO_LARGE: "File size exceeds the allowed limit",

  DUPLICATE_ENTRY: "Duplicate entry detected",
  RESOURCE_ALREADY_EXISTS: "Resource already exists",

  MESSAGE_NOT_FOUND: "Message not found",
  CHAT_NOT_FOUND: "Chat not found",

  VALIDATION_FAILED: "Validation failed",
  MISSING_REQUIRED_FIELDS: "Required fields are missing",
  INVALID_INPUT: "Invalid input provided",

  BAD_REQUEST: "Bad request",
  INTERNAL_SERVER_ERROR: "Something went wrong. Please try again later",

  REFRESH_TOKEN_REQUIRED: "Refresh token is required",
  INVALID_OR_EXPIRED_TOKEN: "Invalid or expired refresh token",
  ACCOUNT_BLOCKED: "Your account has been blocked",
  EMAIL_ALREADY_EXISTS: "Email already exists",
  OTP_EXPIRED: "OTP has expired. Please resend OTP",
  INVALID_OTP: "Invalid OTP",
  REGISTRATION_SESSION_EXPIRED: "Registration session expired. Please register again",
  RESET_REQUEST_EXPIRED: "Reset request expired. Please start over",
  RESET_CODE_EXPIRED: "Reset code has expired",
  INVALID_RESET_CODE: "Invalid reset code",
  INVALID_CURRENT_PASSWORD: "Invalid current password",

  INVALID_DISTRICT: "Invalid district selected",
  BUDGET_REQUIRED: "Budget information is required",
  MIN_BUDGET_ERROR: (min: number) => `Minimum budget must be at least ₹${min}`,
  MAX_BUDGET_ERROR: "Maximum budget must be greater than or equal to minimum budget",
  BUDGET_POSITIVE: "Budget values must be greater than zero",
  JOB_UNAVAILABLE: "Job not found or unavailable",
  JOB_ALREADY_ACCEPTED: "You have already accepted this job",
  JOB_OVERLAP: "You have another job overlapping with this schedule",
  JOB_FULLY_ASSIGNED: "Job is already fully assigned",
  OFFER_NOT_FOR_USER: "This offer is not for you",
  OFFER_INVALID: "Offer is no longer valid or already accepted",
  UNAUTHORIZED_CANCEL: "Unauthorized to cancel this job",
  CANCEL_ALREADY_CLOSED: (status: string) => `Cannot cancel a job that is already ${status}`,
  PROFILE_UNDER_VERIFICATION: "Profile under verification by admin",
  JOB_NOT_OPEN: "Job is no longer open for acceptance",

  SKILL_NOT_FOUND: "Skill not found",

  ASSIGNMENT_NOT_FOUND: "Assignment not found or unauthorized",
  PROVIDER_NOT_AVAILABLE: "Provider is not available",
  RESET_NOT_ALLOWED: "Only rejected applications can be reset",

  
  SKILL_ALREADY_EXISTS: "Skill already exists in the system",
  PENDING_REQUEST_EXISTS: "A pending request for this skill already exists",
  SERVICE_REQUEST_NOT_FOUND: "Service request not found",
  SERVICE_REQUEST_ID_REQUIRED: "Service request ID is required",
  REQUEST_ALREADY_REVIEWED: (status: string) => `Request is already ${status}`,

  
  INVALID_COORD_RANGE: "Invalid coordinate range",
  MAX_MIN_BUDGET_ERROR: "Max must be >= min",
  PRIVATE_JOB_FREELANCER_LIMIT: "Private jobs must have only 1 freelancer",
  MULTI_DAY_REQUIRED_DAYS: "Days required for multi-day jobs",
};