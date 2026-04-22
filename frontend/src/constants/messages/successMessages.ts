export const SuccessMessages = {
  LOGIN_SUCCESS: "Login successful",
  ADMIN_LOGIN_SUCCESS: "Admin login successful",
  LOGOUT_SUCCESS: "Logout successful",
  EMAIL_VERIFIED: "Email verified successfully",
  OTP_SENT: (email: string, minutes: number) =>
    `OTP sent to ${email}. Valid for ${minutes} minutes`,
  OTP_RESENT: (email: string, minutes: number) =>
    `OTP resent to ${email}. Valid for ${minutes} minutes`,
  PASSWORD_RESET_LINK_SENT: "If an account exists, a reset link will be sent.",
  PASSWORD_RESET_INSTRUCTIONS_SENT: (email: string) =>
    `Password reset instructions sent to ${email}`,
  PASSWORD_RESET_SUCCESS: "Password reset successfully",
  TOKEN_REFRESHED: "Token refreshed successfully",

  JOB_CREATED: "Job created successfully",
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
  PROFILE_UPDATED: "Profile updated successfully",

  SERVICE_REQUEST_SUBMITTED: "Service request submitted successfully",
  SERVICE_REQUEST_APPROVED: "Service request approved successfully",
  SERVICE_REQUEST_REJECTED: "Service request has been rejected",
};
