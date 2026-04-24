import { ROLES } from "../../../constants/roles";
import { VERIFICATION_STATUS } from "../../../constants/verification";

export interface IUserListItem {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: ROLES;
  isBlocked: boolean;
  createdAt: string;
}

export interface IAdminLoginResponse {
  accessToken: string;
  refreshToken: string;
  admin: {
    id: string;
    name: string;
    email: string;
    role: ROLES;
  };
}

export interface IServiceProviderDetails {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  headline: string;
  about: string;
  profileImage: string;
  skills: { _id: string; name: string }[];
  yearsOfExperience: number;
  hourlyRate: number;
  location: { _id: string; name: string };
  verification: {
    status: VERIFICATION_STATUS;
    verifiedAt?: string;
    rejectionReason?: string;
  };
  isActive: boolean;
  submittedAt: string;
  createdAt: string;
}
