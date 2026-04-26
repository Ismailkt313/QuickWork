import { formatBudget, formatDate, getInitials, getRelativeTime } from "../../../utils/mapper.utils";

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

  applicants: number;
  status: string;
  startDate: string;
  endDate: string;
  durationType: string;
  visibility: string;
  hiredProviderId?: string;
  hiredProvider?: any;
  rejectionReason?: string;
  isApplied?: boolean;
  createdAt: Date;
  updatedAt: Date;
  schedule?: {
    startDate: Date;
    endDate: Date;
  };
}

export const mapJobToResponseDTO = async (job: any): Promise<JobResponseDTO> => {
  const user = job.userId || {};
  const skill = job.skillId || {};

  let hiredProvider = undefined;

  if (job.hiredProviderId?.userId) {
    let assignmentData: any = null;
    try {
      const { AssignmentModel } = require('../../assignment/models/assignment.model');
      assignmentData = await AssignmentModel.findOne({
        jobId: job._id,
        freelancerId: job.hiredProviderId._id
      }).lean();
    } catch (e) {
    }

    hiredProvider = {
      id: job.hiredProviderId._id?.toString() || job.hiredProviderId.id,
      userId: job.hiredProviderId.userId?._id?.toString() || job.hiredProviderId.userId?.id || job.hiredProviderId.userId?.toString(),
      name: job.hiredProviderId.userId.name,
      email: job.hiredProviderId.userId.email,
      headline: job.hiredProviderId.headline,
      profileImage: job.hiredProviderId.profileImage,
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

    createdAt: job.createdAt,
    updatedAt: job.updatedAt,

    schedule: job.schedule ? {
      startDate: job.schedule.startDate,
      endDate: job.schedule.endDate,
    } : undefined,
  };
};