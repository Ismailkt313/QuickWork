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

export interface IUserWithProviderProfile {
  user: IUserListItem;
  providerProfile?: IServiceProviderDetails | null;
}

export interface IAdminJob {
  _id: string;
  id?: string;
  jobCode: string;
  title: string;
  description: string;
  createdAt: string;
  status: string;
  budget?: {
    min: number;
    max: number;
  };
  budgetRange?: {
    min: number;
    max: number;
  };
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
  clientName?: string;
  location?: {
    districtName: string;
    address?: string;
    additionalDetails?: string;
  };
  acceptedFreelancers: number;
  freelancersNeeded: number;
  startDate?: string;
  endDate?: string;
  durationType?: string;
  days?: number;
  clientNumber?: string;
  hiredProviderId?: string;
  hiredProviderName?: string;
  visibility?: string;
  cancelledAt?: string;
  cancelledByAdmin?: boolean;
  adminCancellationReason?: string;
}
