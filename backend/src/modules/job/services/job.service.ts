import { IJobRepository, IJobService } from '../interfaces/job.interface';
import { CreateJobDTO } from '../dtos/createJob.dto';
import { JobResponseDTO, mapJobToResponseDTO } from '../dtos/jobResponse.dto';
import { Types } from 'mongoose';
import { IServiceProviderRepository } from '../../serviceProvider/interfaces/serviceProvider.interface';
import { IAssignmentService } from '../../assignment/interfaces/assignment.interface';

export class JobService implements IJobService {
    private jobRepository: IJobRepository;
    private serviceProviderRepository: IServiceProviderRepository;
    private assignmentService: IAssignmentService;

    constructor(
        jobRepository: IJobRepository,
        serviceProviderRepository: IServiceProviderRepository,
        assignmentService: IAssignmentService
    ) {
        this.jobRepository = jobRepository;
        this.serviceProviderRepository = serviceProviderRepository;
        this.assignmentService = assignmentService;
    }

    async createJob(userId: string, dto: CreateJobDTO): Promise<{ success: boolean; message: string; data?: JobResponseDTO }> {
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
            skillId: new Types.ObjectId(dto.skillId) as any,
            locationId: new Types.ObjectId(dto.locationId) as any,
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
            visibility: isPrivate ? 'private' : dto.visibility,
            hiredProviderId: isPrivate ? new Types.ObjectId(dto.hiredProviderId) as any : undefined,
            status: 'open',
            applicantsCount: 0
        });

        if (isPrivate && dto.hiredProviderId) {
            console.log(`Direct hire offer created for provider: ${dto.hiredProviderId}`);
        }

        console.log("New Job Created:", newJob);
        const job = await this.jobRepository.findById(newJob._id.toString());

        return {
            success: true,
            message: 'Job created successfully',
            data: job ? mapJobToResponseDTO(job) : undefined
        };
    }

    async getJobsByUser(userId: string): Promise<{ success: boolean; data: JobResponseDTO[] }> {
        const jobs = await this.jobRepository.findByUser(userId);
        console.log("Jobs:", jobs);
        return {
            success: true,
            data: jobs.map(mapJobToResponseDTO)
        };
    }

    async availableJobs(page: number = 1, limit: number = 10, filters: any = {}, userId?: string): Promise<import('../interfaces/job.interface').IJobPaginationResponse> {
        const { jobs, total } = await this.jobRepository.findAllOpen(page, limit, filters);

        let assignedJobIds = new Set<string>();
        if (userId) {
            const provider = await this.serviceProviderRepository.findByUserId(userId);
            if (provider) {
                // We use assignmentService but to avoid circular deps if needed we could query repo, 
                // but we already injected assignmentService in constructor!
                const providerAssignments = await this.assignmentService.getAssignmentsByProvider(provider._id.toString());
                providerAssignments.forEach(a => {
                    const id = a.jobId && (a.jobId as any)._id ? (a.jobId as any)._id.toString() : a.jobId?.toString();
                    if (id) assignedJobIds.add(id);
                });
            }
        }

        const mappedJobs = await Promise.all(jobs.map(async j => {
            const dto = mapJobToResponseDTO(j);
            dto.isApplied = assignedJobIds.has(dto.id);
            
            // Refine applicant count to only active assignments
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

    async getJobById(jobId: string): Promise<{ success: boolean; data?: JobResponseDTO; message?: string }> {
        const job = await this.jobRepository.findById(jobId);
        if (!job) {
            return { success: false, message: 'Job not found' };
        }
        return { success: true, data: mapJobToResponseDTO(job) };
    }

    async getDirectOffers(userId: string): Promise<{ success: boolean; data: JobResponseDTO[] }> {
        const provider = await this.serviceProviderRepository.findByUserId(userId);
        if (!provider) {
            return { success: true, data: [] };
        }

        const jobs = await this.jobRepository.findByProvider(provider._id.toString());
        return {
            success: true,
            data: jobs.map(mapJobToResponseDTO)
        };
    }

    async acceptJob(jobId: string, userId: string): Promise<{ success: boolean; message: string }> {
        const provider = await this.serviceProviderRepository.findByUserId(userId);
        if (!provider) {
            return { success: false, message: 'Provider profile not found' };
        }

        const job = await this.jobRepository.findById(jobId);
        if (!job || job.visibility !== 'public') {
            return { success: false, message: 'Job not found or unavailable' };
        }

        if (['fully_assigned', 'completed', 'cancelled', 'rejected'].includes(job.status)) {
            return { success: false, message: 'Job is no longer open for acceptance' };
        }

        const existingAssignments = await this.assignmentService.getAssignmentsByProvider(provider._id.toString());
        const hasAlreadyAccepted = existingAssignments.some(a => a.jobId.toString() === job._id.toString());

        if (hasAlreadyAccepted) {
            return { success: false, message: 'You have already accepted this job' };
        }

        const hasOverlap = await this.assignmentService.checkOverlap(
            provider._id.toString(),
            job.schedule.startDate,
            job.schedule.endDate
        );

        if (hasOverlap) {
            return { success: false, message: 'You have another job overlapping with this schedule' };
        }

        const updatedJob = await this.jobRepository.findByConditionAndUpdate(
            {
                _id: job._id,
                status: { $in: ['open', 'partially_assigned'] },
                acceptedFreelancers: { $lt: job.freelancersNeeded }
            },
            {
                $inc: { acceptedFreelancers: 1 }
            }
        );

        if (!updatedJob) {
            return { success: false, message: 'Job is already fully assigned' };
        }

        const isOutOfDistrict = provider.location?.id?.toString() !== updatedJob.locationId?.toString();

        await this.assignmentService.createAssignment({
            jobId: updatedJob._id as any,
            freelancerId: provider._id as any,
            type: 'open',
            invite: {
                status: 'accepted',
                invitedBy: updatedJob.userId as any,
                invitedAt: updatedJob.createdAt,
                respondedAt: new Date()
            },
            workStatus: 'assigned',
            schedule: updatedJob.schedule,
            isOutOfDistrict,
            assignedAt: new Date()
        });

        if (updatedJob.acceptedFreelancers >= updatedJob.freelancersNeeded) {
            await this.jobRepository.updateStatus(jobId, 'fully_assigned');
        } else if (updatedJob.status === 'open') {
            await this.jobRepository.updateStatus(jobId, 'partially_assigned');
        }

        return { success: true, message: 'Job accepted successfully' };
    }

    async acceptOffer(jobId: string, userId: string): Promise<{ success: boolean; message: string }> {
        const provider = await this.serviceProviderRepository.findByUserId(userId);
        if (!provider) {
            return { success: false, message: 'Provider profile not found' };
        }

        const job = await this.jobRepository.findById(jobId);
        if (!job) {
            return { success: false, message: 'Job not found' };
        }

        if (job.hiredProviderId?._id.toString() !== provider._id.toString()) {
            return { success: false, message: 'This offer is not for you' };
        }


        const hasOverlap = await this.assignmentService.checkOverlap(
            provider._id.toString(),
            job.schedule.startDate,
            job.schedule.endDate
        );

        if (hasOverlap) {
            return { success: false, message: 'You have another job overlapping with this schedule' };
        }

        const isOutOfDistrict = provider.location?.id?.toString() !== job.locationId?.toString();

        const updatedJob = await this.jobRepository.findByConditionAndUpdate(
            {
                _id: jobId,
                status: 'open',
                hiredProviderId: provider._id
            },
            {
                $set: {
                    status: 'fully_assigned',
                    acceptedFreelancers: 1
                }
            }
        );

        if (!updatedJob) {
            return { success: false, message: 'Offer is no longer valid or already accepted' };
        }

        await this.assignmentService.createAssignment({
            jobId: updatedJob._id as any,
            freelancerId: provider._id as any,
            type: 'direct',
            invite: {
                status: 'accepted',
                invitedBy: updatedJob.userId as any,
                invitedAt: updatedJob.createdAt,
                respondedAt: new Date()
            },
            workStatus: 'assigned',
            schedule: updatedJob.schedule,
            isOutOfDistrict,
            assignedAt: new Date()
        });

        return { success: true, message: 'Offer accepted successfully' };
    }

    async rejectOffer(jobId: string, userId: string, reason?: string): Promise<{ success: boolean; message: string }> {
        const provider = await this.serviceProviderRepository.findByUserId(userId);
        if (!provider) {
            return { success: false, message: 'Provider profile not found' };
        }

        const job = await this.jobRepository.findById(jobId);
        if (!job || job.hiredProviderId?.toString() !== provider._id.toString()) {
            return { success: false, message: 'Direct offer not found for you' };
        }

        await this.jobRepository.findByConditionAndUpdate(
            { _id: jobId },
            { $set: { status: 'rejected', rejectionReason: reason || 'Provider declined the offer' } }
        );

        return { success: true, message: 'Offer rejected successfully' };
    }

    async cancelJob(jobId: string, userId: string): Promise<{ success: boolean; message: string }> {
        const job = await this.jobRepository.findById(jobId);
        if (!job) {
            return { success: false, message: 'Job not found' };
        }

        const jobOwnerId = (job.userId as any)._id ? (job.userId as any)._id.toString() : job.userId.toString();
        if (jobOwnerId !== userId.toString()) {
            return { success: false, message: 'Unauthorized to cancel this job' };
        }

        if (['completed', 'cancelled', 'rejected'].includes(job.status)) {
            return { success: false, message: `Cannot cancel a job that is already ${job.status}` };
        }

        // Update Job status
        await this.jobRepository.updateStatus(jobId, 'cancelled');

        // Cancel any related assignments
        if (job.status === 'fully_assigned' || job.status === 'partially_assigned' || job.status === 'in_progress') {
            await this.assignmentService.cancelAssignmentsByJob(jobId);
        }

        return { success: true, message: 'Job cancelled successfully' };
    }
}