import { formatBudget, formatDate, getInitials, getRelativeTime } from "../../../utils/mapper.utils";
import { VERIFICATION_STATUS } from "../../../constants/verification";
import { JOB_STATUS } from "../../../constants/jobStatus";
import { IJob } from "../interfaces/job.interface";
import { IAssignment } from "../../assignment/interfaces/assignment.interface";

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
  job: IJob | Record<string, unknown>,
  assignmentData?: IAssignment | Record<string, unknown> | null,
  clientMetrics?: { averageRating: number; totalReviews: number }
): Promise<JobResponseDTO> => {
  const j = job as unknown as Record<string, unknown>;
  const user = (typeof j.userId === 'object' && j.userId !== null ? j.userId : {}) as { _id?: unknown; id?: unknown; name?: string; email?: string; number?: string };
  const skill = (j.skillId as { name?: string }) || {};

  let hiredProvider = undefined;
  const hiredProv = typeof j.hiredProviderId === 'object' && j.hiredProviderId !== null ? (j.hiredProviderId as Record<string, unknown>) : null;
  const hiredProvUser = hiredProv && typeof hiredProv.userId === 'object' && hiredProv.userId !== null ? (hiredProv.userId as Record<string, unknown>) : null;

  if (hiredProv && hiredProvUser) {
    hiredProvider = {
      id: hiredProv._id ? (hiredProv._id as { toString(): string }).toString() : (hiredProv.id as string),
      userId: hiredProvUser._id ? (hiredProvUser._id as { toString(): string }).toString() : (hiredProvUser.id as string),
      name: hiredProvUser.name,
      email: hiredProvUser.email,
      headline: hiredProv.headline,
      profileImage: hiredProv.profileImage,
      isVerified: ((hiredProv.verification as Record<string, unknown>)?.status === VERIFICATION_STATUS.VERIFIED),
      assignmentId: assignmentData?._id ? (assignmentData._id as { toString(): string }).toString() : null,
      workStatus: (assignmentData?.workStatus as string) || null,
      cancellation: assignmentData?.cancellation ? {
        reason: (assignmentData.cancellation as Record<string, unknown>).reason as string,
        cancelledAt: (assignmentData.cancellation as Record<string, unknown>).cancelledAt as Date,
        isLateCancel: (assignmentData.cancellation as Record<string, unknown>).isLateCancel as boolean,
        notes: (assignmentData.cancellation as Record<string, unknown>).notes as string,
      } : null,
      absence: assignmentData?.absence ? {
        reportedAt: (assignmentData.absence as Record<string, unknown>).reportedAt as Date,
        notes: (assignmentData.absence as Record<string, unknown>).notes as string,
        evidence: (assignmentData.absence as Record<string, unknown>).evidence as string[],
      } : null,
      payment: assignmentData?.payment ? {
        status: (assignmentData.payment as Record<string, unknown>).status as string,
        method: (assignmentData.payment as Record<string, unknown>).method as string,
        amount: (assignmentData.payment as Record<string, unknown>).amount as number,
        paidAt: (assignmentData.payment as Record<string, unknown>).paidAt as Date,
        transactionId: (assignmentData.payment as Record<string, unknown>).transactionId as string
      } : null,
    };
  }

  const clientId =
    user._id ? (user._id as { toString(): string }).toString() :
    (typeof user === "string" ? user : (user.id as { toString(): string })?.toString() || "");

  const clientName = user.name || "Anonymous";

  let location: JobLocation | null = null;
  const loc = j.location as { coordinates?: { coordinates?: [number, number] }; address?: string; district?: { _id?: unknown; id?: unknown; name?: string; toString(): string }; additionalDetails?: string } | undefined;

  if (
    loc &&
    loc.coordinates &&
    Array.isArray(loc.coordinates.coordinates)
  ) {
    const [lng, lat] = loc.coordinates.coordinates;

    location = {
      address: loc.address || "",
      lat,
      lng,
      districtId: loc.district?._id ? (loc.district._id as { toString(): string }).toString() : (loc.district ? loc.district.toString() : ""),
      districtName: loc.district?.name,
    };
  }

  const budgetObj = j.budget as { min?: number; max?: number } | undefined;
  const scheduleObj = j.schedule as { startDate?: Date; endDate?: Date } | undefined;

  return {
    id: j._id ? (j._id as { toString(): string }).toString() : ((j.id as string) || ""),
    clientId,
    title: (j.title as string) || "",
    description: (j.description as string) || "",
    clientName,
    clientInitials: getInitials(clientName),

    location,

    additionalDetails: loc?.additionalDetails,
    clientEmail: user.email,
    clientNumber: (j.contactNumber as string) || user.number,

    postedAt: getRelativeTime((j.createdAt as Date) || new Date()),

    skills: skill?.name ? [skill.name] : [],
    budget: formatBudget({ min: budgetObj?.min || 0, max: budgetObj?.max || 0 }),
    budgetRange: {
      min: budgetObj?.min || 0,
      max: budgetObj?.max || 0,
    },

    applicants: (j.applicantsCount as number) || 0,
    status: (function() {
      const currentStatus = (j.status as string) || "";
      if (currentStatus === JOB_STATUS.OPEN && scheduleObj?.startDate && new Date() > scheduleObj.startDate) {
        return JOB_STATUS.EXPIRED;
      }
      return currentStatus;
    })(),

    startDate: scheduleObj?.startDate ? formatDate(scheduleObj.startDate) : "",
    endDate: scheduleObj?.endDate ? formatDate(scheduleObj.endDate) : "",

    durationType: (j.durationType as string) || "",
    visibility: (j.visibility as string) || "public",

    hiredProviderId: hiredProv ? (hiredProv._id ? (hiredProv._id as { toString(): string }).toString() : (hiredProv.id as string)) : undefined,

    hiredProvider,
    rejectionReason: j.rejectionReason as string | undefined,

    freelancersNeeded: (j.freelancersNeeded as number) || 1,
    acceptedFreelancers: (j.acceptedFreelancers as number) || 0,

    createdAt: (j.createdAt as Date) || new Date(),
    updatedAt: (j.updatedAt as Date) || new Date(),

    schedule: scheduleObj?.startDate && scheduleObj?.endDate ? {
      startDate: scheduleObj.startDate,
      endDate: scheduleObj.endDate,
    } : undefined,
    clientRating: clientMetrics?.averageRating || 0,
    clientReviewsCount: clientMetrics?.totalReviews || 0,
    jobCode: (j.jobCode as string) || ""
  };
};