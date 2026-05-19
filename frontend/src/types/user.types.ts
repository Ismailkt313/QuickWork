export interface IUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: "user" | "provider" | "admin";
  profileImage?: {
    url: string;
    public_id: string;
  };
  number?: string;
  verificationStatus?: "pending" | "verified" | "rejected";
  authProvider?: "local" | "google" | "hybrid";
  hasPassword?: boolean;
}
