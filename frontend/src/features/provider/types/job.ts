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
  location: string;
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
  status: 'open' | 'assigned' | 'completed' | 'cancelled' | 'rejected';
  startDate: string;
  endDate: string;
  durationType: string;
  visibility: 'public' | 'private';
  hiredProviderId?: string;

  freelancersNeeded: number;
  myApplication?: {
    status: string;
    appliedAt: string;
  };
}

export interface JobDetailsResponse {
  success: boolean;
  data: JobDetail;
}
