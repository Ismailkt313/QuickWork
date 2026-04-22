import { IJobRepository, IJobService } from '../interfaces/job.interface';
import { ILocationRepository } from '../../location/interfaces/location.interface';
import { CreateJobDTO } from '../dtos/createJob.dto';
import { JobResponseDTO, mapJobToResponseDTO } from '../dtos/jobResponse.dto';
import { Types } from 'mongoose';
import { IServiceProviderRepository } from '../../serviceProvider/interfaces/serviceProvider.interface';
import { IAssignmentService } from '../../assignment/interfaces/assignment.interface';
import { JOB_STATUS } from '../../../constants/jobStatus';
import { ASSIGNMENT_STATUS, WORK_STATUS, ASSIGNMENT_TYPE } from '../../../constants/assignment';
import { JOB_DURATION_TYPE } from '../../../constants/jobDuration';
import { JOB_VISIBILITY } from '../../../constants/jobVisibility';
import { MIN_JOB_WAGE } from '../../../constants/job';
import { SuccessMessages } from '../../../constants/messages/successMessages';
import { ErrorMessages } from '../../../constants/messages/errorMessages';

export class JobService implements IJobService {
    private jobRepository: IJobRepository;
    private serviceProviderRepository: IServiceProviderRepository;
    private assignmentService: IAssignmentService;
    private locationRepository: ILocationRepository;

    constructor(
        jobRepository: IJobRepository,
        serviceProviderRepository: IServiceProviderRepository,
        assignmentService: IAssignmentService,
        locationRepository: ILocationRepository
    ) {
        this.jobRepository = jobRepository;
        this.serviceProviderRepository = serviceProviderRepository;
        this.assignmentService = assignmentService;
        this.locationRepository = locationRepository;
    }

    async createJob(userId: string, dto: CreateJobDTO): Promise<{ success: boolean; message: string; data?: JobResponseDTO }> {

        const district = await this.locationRepository.findById(dto.location.district);
        if (!district) {
            throw new Error(ErrorMessages.INVALID_DISTRICT);
        }


        const placeDistrict = dto.location.districtName.toLowerCase();
        const chosenDistrictName = district.name.toLowerCase();
        const formattedAddress = dto.location.address.toLowerCase();

        if (placeDistrict !== chosenDistrictName && !formattedAddress.includes(chosenDistrictName)) {
            throw new Error(ErrorMessages.DISTRICT_MISMATCH);
        }

        if (!dto.budget || dto.budget.min === undefined || dto.budget.max === undefined) {
            throw new Error(ErrorMessages.BUDGET_REQUIRED);
        }

        if (dto.budget.min < MIN_JOB_WAGE) {
            throw new Error(ErrorMessages.MIN_BUDGET_ERROR(MIN_JOB_WAGE));
        }

        if (dto.budget.max < dto.budget.min) {
            throw new Error(ErrorMessages.MAX_BUDGET_ERROR);
        }

        if (dto.budget.min <= 0 || dto.budget.max <= 0) {
            throw new Error(ErrorMessages.BUDGET_POSITIVE);
        }

        let endDate: Date;
        const start = new Date(dto.startDate);

        if (dto.durationType === 'multi_day' && dto.days) {
            endDate = new Date(start);
            endDate.setDate(start.getDate() + (dto.days - 1));
            endDate.setHours(23, 59, 59, 999);
        } else {
            endDate = new Date(start);
            endDate.setHours(23, 59, 59, 999);
        }

        const freelancersNeeded = dto.freelancersNeeded || 1;
        const isPrivate = !!dto.hiredProviderId;

        const newJob = await this.jobRepository.create({
            title: dto.title,
            description: dto.description,
            contactNumber: dto.contactNumber,
            skillId: new Types.ObjectId(dto.skillId) as any,
            location: {
                district: new Types.ObjectId(dto.location.district),
                address: dto.location.address,
                additionalDetails:dto.location.additionalDetails ? dto.location.additionalDetails : 'additional detail not provided',
                coordinates: {
                    type: "Point",
                    coordinates: dto.location.coordinates.coordinates
                }
            },
            userId: new Types.ObjectId(userId) as any,
            budget: dto.budget,
            isUrgent: dto.isUrgent,
            durationType: dto.durationType,
            schedule: {
                startDate: start,
                endDate: endDate
            },
            days: dto.days,
            freelancersNeeded: isPrivate ? 1 : freelancersNeeded,
            acceptedFreelancers: 0,
            visibility: isPrivate ? JOB_VISIBILITY.PRIVATE : dto.visibility,
            hiredProviderId: isPrivate ? new Types.ObjectId(dto.hiredProviderId) as any : undefined,
            status: JOB_STATUS.OPEN,
            applicantsCount: 0
        });


        const job = await this.jobRepository.findById(newJob._id.toString());

        return {
            success: true,
            message: SuccessMessages.JOB_CREATED,
            data: job ? await mapJobToResponseDTO(job) : undefined
        };
    }

    async getJobsByUser(
        userId: string,
        page: number = 1,
        limit: number = 10,
        filters?: { status?: string; search?: string; visibility?: string }
    ): Promise<import('../interfaces/job.interface').IJobPaginationResponse> {
        const [{ jobs, total }, counts] = await Promise.all([
            this.jobRepository.findByUserPaginated(userId, page, limit, filters),
            this.jobRepository.countByUserGrouped(userId)
        ]);

        return {
            success: true,
            data: await Promise.all(jobs.map(mapJobToResponseDTO)),
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            counts
        };
    }

    async availableJobs(page: number = 1, limit: number = 10, filters: any = {}, userId?: string): Promise<import('../interfaces/job.interface').IJobPaginationResponse> {
        
        
        const assignedJobIds = new Set<string>();
            const provider = await this.serviceProviderRepository.findByUserId(userId as string);
            if (provider) {
                const { assignments: providerAssignments } = await this.assignmentService.getAssignmentsByProvider(provider._id.toString(), { limit: 1000 });
                providerAssignments.forEach(a => {
                    const id = a.jobId && (a.jobId as any)._id ? (a.jobId as any)._id.toString() : a.jobId?.toString();
                    if (id) assignedJobIds.add(id);
                });
            }
            const skills:string[] = await provider.skills.map((a: any) => a._id.toString())
            const { jobs, total } = await this.jobRepository.findAllOpen(page, limit, filters, skills);
 


        const mappedJobs = await Promise.all(jobs.map(async j => {
            const dto = await mapJobToResponseDTO(j);
            dto.isApplied = assignedJobIds.has(dto.id);
            

            dto.applicants = await this.assignmentService.getAssignmentCountByJob(dto.id);
            
            return dto;
        }));
        
        return {
            success: true,
            data: mappedJobs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }

    async getJobById(jobId: string, userId?: string): Promise<{ success: boolean; data?: JobResponseDTO; message?: string }> {
        const job = await this.jobRepository.findById(jobId);
        if (!job) {
            return { success: false, message: ErrorMessages.JOB_NOT_FOUND };
        }

        const dto = await mapJobToResponseDTO(job);
        
        dto.applicants = await this.assignmentService.getAssignmentCountByJob(jobId);

        if (userId) {
            const provider = await this.serviceProviderRepository.findByUserId(userId);
            if (provider) {
                const { assignments } = await this.assignmentService.getAssignmentsByProvider(provider._id.toString(), { limit: 1000 });
                dto.isApplied = assignments.some(a => {
                    const id = a.jobId && (a.jobId as any)._id ? (a.jobId as any)._id.toString() : a.jobId?.toString();
                    return id === jobId;
                });
            }
        }

        return { success: true, data: dto };
    }

    async getDirectOffers(userId: string): Promise<{ success: boolean; data: JobResponseDTO[] }> {
        const provider = await this.serviceProviderRepository.findByUserId(userId);
        if (!provider) {
            return { success: true, data: [] };
        }

        const jobs = await this.jobRepository.findByProvider(provider._id.toString());
        return {
            success: true,
            data: await Promise.all(jobs.map(mapJobToResponseDTO))
        };
    }

    async acceptJob(jobId: string, userId: string): Promise<{ success: boolean; message: string }> {
        const provider = await this.serviceProviderRepository.findByUserId(userId);
        if (!provider) {
            return { success: false, message: ErrorMessages.PROVIDER_NOT_FOUND };
        }

        if (provider.verification?.status !== 'verified') {
            return { success: false, message: ErrorMessages.PROFILE_UNDER_VERIFICATION };
        }

        const job = await this.jobRepository.findById(jobId);
        if (!job || job.visibility !== 'public') {
            return { success: false, message: ErrorMessages.JOB_UNAVAILABLE };
        }

        if ([JOB_STATUS.FULLY_ASSIGNED, JOB_STATUS.COMPLETED, JOB_STATUS.CANCELLED, JOB_STATUS.REJECTED].includes(job.status)) {
            return { success: false, message: ErrorMessages.JOB_NOT_OPEN };
        }

        const { assignments: existingAssignments } = await this.assignmentService.getAssignmentsByProvider(provider._id.toString(), { limit: 1000 });
        const hasAlreadyAccepted = existingAssignments.some(a => a.jobId.toString() === job._id.toString());

        if (hasAlreadyAccepted) {
            return { success: false, message: ErrorMessages.JOB_ALREADY_ACCEPTED };
        }

        const hasOverlap = await this.assignmentService.checkOverlap(
            provider._id.toString(),
            job.schedule.startDate,
            job.schedule.endDate
        );

        if (hasOverlap) {
            return { success: false, message: ErrorMessages.JOB_OVERLAP };
        }

        const updatedJob = await this.jobRepository.findByConditionAndUpdate(
            {
                _id: job._id,
                status: { $in: [JOB_STATUS.OPEN, JOB_STATUS.PARTIALLY_ASSIGNED] },
                acceptedFreelancers: { $lt: job.freelancersNeeded }
            },
            {
                $inc: { acceptedFreelancers: 1 }
            }
        );

        if (!updatedJob) {
            return { success: false, message: ErrorMessages.JOB_FULLY_ASSIGNED };
        }

        const isOutOfDistrict = provider.location?.id?.toString() !== updatedJob.location?.district?._id?.toString();

        await this.assignmentService.createAssignment({
            jobId: updatedJob._id as any,
            freelancerId: provider._id as any,
            type: ASSIGNMENT_TYPE.OPEN,
            invite: {
                status: ASSIGNMENT_STATUS.ACCEPTED,
                invitedBy: updatedJob.userId as any,
                invitedAt: updatedJob.createdAt,
                respondedAt: new Date()
            },
            workStatus: WORK_STATUS.ASSIGNED,
            schedule: updatedJob.schedule,
            isOutOfDistrict,
            assignedAt: new Date()
        });

        if (updatedJob.acceptedFreelancers >= updatedJob.freelancersNeeded) {
            await this.jobRepository.updateStatus(jobId, JOB_STATUS.FULLY_ASSIGNED);
        } else if (updatedJob.status === JOB_STATUS.OPEN) {
            await this.jobRepository.updateStatus(jobId, JOB_STATUS.PARTIALLY_ASSIGNED);
        }

        return { success: true, message: SuccessMessages.JOB_ACCEPTED };
    }

    async acceptOffer(jobId: string, userId: string): Promise<{ success: boolean; message: string }> {
        const provider = await this.serviceProviderRepository.findByUserId(userId);
        if (!provider) {
            return { success: false, message: ErrorMessages.PROVIDER_NOT_FOUND };
        }

        if (provider.verification?.status !== 'verified') {
            return { success: false, message: ErrorMessages.PROFILE_UNDER_VERIFICATION };
        }

        const job = await this.jobRepository.findById(jobId);
        if (!job) {
            return { success: false, message: ErrorMessages.JOB_NOT_FOUND };
        }

        if (job.hiredProviderId?._id.toString() !== provider._id.toString()) {
            return { success: false, message: ErrorMessages.OFFER_NOT_FOR_USER };
        }


        const hasOverlap = await this.assignmentService.checkOverlap(
            provider._id.toString(),
            job.schedule.startDate,
            job.schedule.endDate
        );

        if (hasOverlap) {
            return { success: false, message: ErrorMessages.JOB_OVERLAP };
        }

        const isOutOfDistrict = provider.location?.id?.toString() !== job.location?.district?._id?.toString();

        const updatedJob = await this.jobRepository.findByConditionAndUpdate(
            {
                _id: jobId,
                status: JOB_STATUS.OPEN,
                hiredProviderId: provider._id
            },
            {
                $set: {
                    status: JOB_STATUS.FULLY_ASSIGNED,
                    acceptedFreelancers: 1
                }
            }
        );

        if (!updatedJob) {
            return { success: false, message: ErrorMessages.OFFER_INVALID };
        }

        await this.assignmentService.createAssignment({
            jobId: updatedJob._id as any,
            freelancerId: provider._id as any,
            type: ASSIGNMENT_TYPE.DIRECT,
            invite: {
                status: ASSIGNMENT_STATUS.ACCEPTED,
                invitedBy: updatedJob.userId as any,
                invitedAt: updatedJob.createdAt,
                respondedAt: new Date()
            },
            workStatus: WORK_STATUS.ASSIGNED,
            schedule: updatedJob.schedule,
            isOutOfDistrict,
            assignedAt: new Date()
        });

        return { success: true, message: SuccessMessages.OFFER_ACCEPTED };
    }

    async rejectOffer(jobId: string, userId: string, reason?: string): Promise<{ success: boolean; message: string }> {
        const provider = await this.serviceProviderRepository.findByUserId(userId);
        if (!provider) {
            return { success: false, message: ErrorMessages.PROVIDER_NOT_FOUND };
        }

        const job = await this.jobRepository.findById(jobId);
        if (!job || job.hiredProviderId?.toString() !== provider._id.toString()) {
            return { success: false, message: ErrorMessages.JOB_NOT_FOUND };
        }

        await this.jobRepository.findByConditionAndUpdate(
            { _id: jobId },
            { $set: { status: JOB_STATUS.REJECTED, rejectionReason: reason || 'Provider declined the offer' } }
        );

        return { success: true, message: SuccessMessages.OFFER_REJECTED };
    }

    async cancelJob(jobId: string, userId: string): Promise<{ success: boolean; message: string }> {
        const job = await this.jobRepository.findById(jobId);
        if (!job) {
            return { success: false, message: ErrorMessages.JOB_NOT_FOUND };
        }

        const jobOwnerId = (job.userId as any)._id ? (job.userId as any)._id.toString() : job.userId.toString();
        if (jobOwnerId !== userId.toString()) {
            return { success: false, message: ErrorMessages.UNAUTHORIZED_CANCEL };
        }

        if ([JOB_STATUS.COMPLETED, JOB_STATUS.CANCELLED, JOB_STATUS.REJECTED].includes(job.status)) {
            return { success: false, message: ErrorMessages.CANCEL_ALREADY_CLOSED(job.status) };
        }

        await this.jobRepository.updateStatus(jobId, JOB_STATUS.CANCELLED);

        if (job.status === JOB_STATUS.FULLY_ASSIGNED || job.status === JOB_STATUS.PARTIALLY_ASSIGNED || job.status === JOB_STATUS.IN_PROGRESS) {
            await this.assignmentService.cancelAssignmentsByJob(jobId);
        }

        return { success: true, message: SuccessMessages.JOB_CANCELLED };
    }
}