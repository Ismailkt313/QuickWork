export interface JobDetail {
  id: string;
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
  jobType: 'Fixed' | 'Hourly';
  applicants: number;
  isUrgent: boolean;
  status: 'open' | 'assigned' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  durationType: string;

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
