import { JOB_STATUS } from "../../../constants/jobStatus";
import { JOB_VISIBILITY } from "../../../constants/jobVisibility";
import { JOB_DURATION_TYPE } from "../../../constants/jobDuration";

export interface JobLocation {
  address: string;
  lat: number;
  lng: number;
  districtId: string;
  districtName?: string;
}

export interface JobDetail {
  id: string;
  clientId: string;
  clientAvatarUrl: string | undefined;
  title: string;
  description: string;
  clientName: string;
  clientInitials: string;
  clientRating?: number;
  clientReviewsCount?: number;
  isClientVerified?: boolean;
  location: JobLocation | null;
  additionalDetails?: string;
  clientEmail?: string;
  clientNumber?: string;
  postedAt: string;
  createdAt: string;
  skills: string[];
  budget: string;
  budgetRange: {
    min: number;
    max: number;
  };

  applicants: number;
  isUrgent: boolean;
  status: JOB_STATUS;
  startDate: string;
  endDate: string;
  durationType: JOB_DURATION_TYPE;
  visibility: JOB_VISIBILITY;
  hiredProviderId?: string;
  isApplied?: boolean;

  freelancersNeeded: number;
  acceptedFreelancers: number;
  myApplication?: {
    status: string;
    appliedAt: string;
  };
}

export interface JobDetailsResponse {
  success: boolean;
  data: JobDetail;
}
