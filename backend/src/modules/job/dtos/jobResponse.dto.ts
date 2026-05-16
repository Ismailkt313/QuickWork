import { formatBudget, formatDate, getInitials, getRelativeTime } from "../../../utils/mapper.utils";
import { VERIFICATION_STATUS } from "../../../constants/verification";

export interface JobLocation {
  address: string;
  lat: number;
  lng: number;
  districtId: string;
  districtName?: string;
}

export interface JobResponseDTO {
  id: string;
  clientId: string;
  title: string;
  description: string;
  clientName: string;
  clientInitials: string;
  location: JobLocation | null;
  additionalDetails?: string;
  clientEmail?: string;
  clientNumber?: string;
  postedAt: string;
  skills: string[];
  budget: string;
  budgetRange: {
    min: number;
    max: number;
  };
  clientRating: number;
  clientReviewsCount: number;

  applicants: number;
  status: string;
  startDate: string;
  endDate: string;
  durationType: string;
  visibility: string;
  hiredProviderId?: string;
  hiredProvider?: Record<string, unknown>;
  rejectionReason?: string;
  isApplied?: boolean;
  freelancersNeeded: number;
  acceptedFreelancers: number;
  hasPendingPayment?: boolean;
  createdAt: Date;
  updatedAt: Date;
  schedule?: {
    startDate: Date;
    endDate: Date;
  };
  providers?: {
    providerId: string;
    finalStatus: string;
    payment: {
      status: string;
      totalAmount: number;
    };
  }[];
  jobCode: string;
}

export const mapJobToResponseDTO = async (
  job: {
    userId?: { _id?: unknown; id?: unknown; name?: string; email?: string; number?: string } | string;
    skillId?: { name?: string };
    hiredProviderId?: { _id?: unknown; id?: unknown; userId?: { _id?: unknown; id?: unknown; name?: string; email?: string } | string; headline?: string; profileImage?: string; verification?: { status?: string }; toString: () => string } | string;
    location?: { coordinates?: { coordinates?: [number, number] }; address?: string; district?: { name?: string; toString: () => string }; additionalDetails?: string };
    _id?: unknown;
    id?: string;
    title?: string;
    description?: string;
    contactNumber?: string;
    createdAt?: Date;
    updatedAt?: Date;
    budget?: { min?: number; max?: number };
    applicantsCount?: number;
    status?: string;
    schedule?: { startDate?: Date; endDate?: Date };
    durationType?: string;
    visibility?: string;
    rejectionReason?: string;
    freelancersNeeded?: number;
    acceptedFreelancers?: number;
    jobCode?: string;
  },
  assignmentData?: {
    _id?: unknown;
    workStatus?: string;
    cancellation?: { reason?: string; cancelledAt?: Date; isLateCancel?: boolean; notes?: string };
    absence?: { reportedAt?: Date; notes?: string; evidence?: string[] };
    payment?: { status?: string; method?: string; amount?: number; paidAt?: Date; transactionId?: string };
  },
  clientMetrics?: { averageRating: number; totalReviews: number }
): Promise<JobResponseDTO> => {
  const user = (typeof job.userId === 'object' && job.userId !== null ? job.userId : {}) as { _id?: unknown; id?: unknown; name?: string; email?: string; number?: string };
  const skill = job.skillId || {};

  let hiredProvider = undefined;
  const hiredProv = typeof job.hiredProviderId === 'object' && job.hiredProviderId !== null ? job.hiredProviderId : null;
  const hiredProvUser = hiredProv && typeof hiredProv.userId === 'object' && hiredProv.userId !== null ? hiredProv.userId : null;

  if (hiredProv && hiredProvUser) {
    hiredProvider = {
      id: hiredProv._id?.toString() || hiredProv.id,
      userId: hiredProvUser._id?.toString() || hiredProvUser.id,
      name: hiredProvUser.name,
      email: hiredProvUser.email,
      headline: hiredProv.headline,
      profileImage: hiredProv.profileImage,
      isVerified: hiredProv.verification?.status === VERIFICATION_STATUS.VERIFIED,
      assignmentId: assignmentData?._id?.toString() || null,
      workStatus: assignmentData?.workStatus || null,
      cancellation: assignmentData?.cancellation ? {
        reason: assignmentData.cancellation.reason,
        cancelledAt: assignmentData.cancellation.cancelledAt,
        isLateCancel: assignmentData.cancellation.isLateCancel,
        notes: assignmentData.cancellation.notes,
      } : null,
      absence: assignmentData?.absence ? {
        reportedAt: assignmentData.absence.reportedAt,
        notes: assignmentData.absence.notes,
        evidence: assignmentData.absence.evidence,
      } : null,
      payment: assignmentData?.payment ? {
        status: assignmentData.payment.status,
        method: assignmentData.payment.method,
        amount: assignmentData.payment.amount,
        paidAt: assignmentData.payment.paidAt,
        transactionId: assignmentData.payment.transactionId
      } : null,
    };
  }

  const clientId =
    user._id?.toString() ||
    (typeof user === "string" ? user : user.id?.toString() || "");

  const clientName = user.name || "Anonymous";

  let location: JobLocation | null = null;

  if (
    job.location &&
    job.location.coordinates &&
    Array.isArray(job.location.coordinates.coordinates)
  ) {
    const [lng, lat] = job.location.coordinates.coordinates;

    location = {
      address: job.location.address,
      lat,
      lng,
      districtId: job.location.district?.toString(),
      districtName: job.location.district?.name,
    };
  }

  return {
    id: job._id?.toString() || job.id,
    clientId,
    title: job.title,
    description: job.description,
    clientName,
    clientInitials: getInitials(clientName),

    location,

    additionalDetails: job.location?.additionalDetails,
    clientEmail: user.email,
    clientNumber: job.contactNumber || user.number,

    postedAt: getRelativeTime(job.createdAt),

    skills: skill?.name ? [skill.name] : [],
    budget: formatBudget(job.budget),
    budgetRange: {
      min: job.budget?.min || 0,
      max: job.budget?.max || 0,
    },

    applicants: job.applicantsCount || 0,
    status: job.status,

    startDate: job.schedule ? formatDate(job.schedule.startDate) : "",
    endDate: job.schedule ? formatDate(job.schedule.endDate) : "",

    durationType: job.durationType || "",
    visibility: job.visibility || "public",

    hiredProviderId:
      job.hiredProviderId?._id?.toString() ||
      job.hiredProviderId?.toString(),

    hiredProvider,
    rejectionReason: job.rejectionReason,

    freelancersNeeded: job.freelancersNeeded || 1,
    acceptedFreelancers: job.acceptedFreelancers || 0,

    createdAt: job.createdAt,
    updatedAt: job.updatedAt,

    schedule: job.schedule ? {
      startDate: job.schedule.startDate,
      endDate: job.schedule.endDate,
    } : undefined,
    clientRating: clientMetrics?.averageRating || 0,
    clientReviewsCount: clientMetrics?.totalReviews || 0,
    jobCode: job.jobCode
  };
};