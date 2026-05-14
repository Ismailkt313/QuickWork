export const SuccessMessages = {
  LOGIN_SUCCESS: "Login successful",
  JOB_CREATED: "Job created successfully",
  PROFILE_UPDATED: "Profile updated successfully",

  OTP_SENT: (email: string, minutes: number) => `OTP sent to ${email}. Expires in ${minutes} minutes`,
  OTP_RESENT: (email: string, minutes: number) => `OTP resent to ${email}. Expires in ${minutes} minutes`,
  EMAIL_VERIFIED: "Email verified and user registered successfully",
  TOKEN_REFRESHED: "Token refreshed successfully",
  ADMIN_LOGIN_SUCCESS: "Admin login successful",
  LOGOUT_SUCCESS: "Logout successful",
  PASSWORD_RESET_LINK_SENT: "If an account exists for this email, a reset code has been sent",
  PASSWORD_RESET_INSTRUCTIONS_SENT: (email: string) => `Instructions to reset your password have been sent to ${email}`,
  PASSWORD_RESET_SUCCESS: "Password has been reset successfully",
  PROFILE_FETCHED: "Profile fetched successfully",
  PASSWORD_CHANGED: "Password changed successfully",

  JOB_ACCEPTED: "Job accepted successfully",
  OFFER_ACCEPTED: "Offer accepted successfully",
  OFFER_REJECTED: "Offer rejected successfully",
  JOB_CANCELLED: "Job cancelled successfully",

  USERS_FETCHED: "Users fetched successfully",
  USER_BLOCKED: "User blocked successfully",
  USER_UNBLOCKED: "User unblocked successfully",
  PENDING_PROVIDERS_FETCHED: "Pending providers fetched successfully",
  PROVIDER_REJECTED: "Provider rejected successfully",
  PROVIDER_APPROVED: "Provider approved successfully",

  MESSAGE_CREATED: "Message created successfully",
  MESSAGE_DELETED: "Message deleted successfully",
  CONVERSATION_DELETED: "Conversation deleted successfully",

  SKILL_CREATED: "Skill created successfully",
  SKILLS_FETCHED: "Skills fetched successfully",
  SKILL_APPROVED: "Skill approved successfully",
  SKILL_REJECTED: "Skill rejected successfully",

  STATUS_UPDATED: (status: string) => `Status updated to ${status}`,
  PROOF_SUBMITTED: "Proof submitted successfully",

  PROVIDER_APPLICATION_SUBMITTED: "Provider application submitted successfully",
  APPLICATION_RESET: "Application reset successfully",

  SERVICE_REQUEST_SUBMITTED: "Service request submitted successfully",
  SERVICE_REQUEST_APPROVED: "Service request approved successfully",
  SERVICE_REQUEST_REJECTED: "Service request has been rejected",
  SERVICE_REQUEST_PARTIAL_SUCCESS: "Skill approved globally, but requesting provider profile was not found.",
  PROVIDER_DETAILS_FETCHED: "Provider details fetched successfully",
  USER_FETCHED: "User fetched successfully",
  REVIEW_CREATED: "Review created successfully",
  REVIEWS_FETCHED: "Reviews fetched successfully",

  EMAIL_UPDATE_OTP_SENT: (email: string, minutes: number) => `Verification OTP sent to ${email}. Expires in ${minutes} minutes`,
  EMAIL_UPDATE_OTP_RESENT: (email: string, minutes: number) => `Verification OTP resent to ${email}. Expires in ${minutes} minutes`,
  EMAIL_UPDATED: "Email address updated successfully",
};