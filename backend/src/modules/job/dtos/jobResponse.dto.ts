import { formatBudget, formatDate, getInitials, getRelativeTime } from "../../../utils/mapper.utils";

export interface JobResponseDTO {
    id: string;
    title: string;
    description: string;
    clientName: string;
    clientInitials: string;
    location: string;
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
}

export const mapJobToResponseDTO = (job: any): JobResponseDTO => {
    const user = job.userId || {};
    const skill = job.skillId || {};
    const location = job.locationId || {};

    let hiredProvider = undefined;
    if (job.hiredProviderId && job.hiredProviderId.userId) {
        hiredProvider = {
            id: job.hiredProviderId._id ? job.hiredProviderId._id.toString() : job.hiredProviderId.id,
            name: job.hiredProviderId.userId.name,
            email: job.hiredProviderId.userId.email,
            headline: job.hiredProviderId.headline,
            profileImage: job.hiredProviderId.profileImage,
        };
    }

    return {
        id: job._id ? job._id.toString() : job.id,
        title: job.title,
        description: job.description,
        clientName: user.name || 'Anonymous',
        clientInitials: getInitials(user.name),
        location: location.name || 'Remote',
        postedAt: getRelativeTime(job.createdAt),
        skills: skill.name ? [skill.name] : [], 
        budget: formatBudget(job.budget),

        applicants: job.applicantsCount || 0,
        status: job.status,
        startDate: job.schedule ? formatDate(job.schedule.startDate) : '',
        endDate: job.schedule ? formatDate(job.schedule.endDate) : '',
        durationType: job.durationType || '',
        visibility: (job as any).visibility || 'public',
        hiredProviderId: (job as any).hiredProviderId?._id ? (job as any).hiredProviderId._id.toString() : (job as any).hiredProviderId?.toString(),
        hiredProvider,
        rejectionReason: (job as any).rejectionReason,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
    };
};

