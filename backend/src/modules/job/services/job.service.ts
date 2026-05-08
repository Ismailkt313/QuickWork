import { IJobRepository, IJobService } from '../interfaces/job.interface';
import { ILocationRepository } from '../../location/interfaces/location.interface';
import { CreateJobDTO } from '../dtos/createJob.dto';
import { JobResponseDTO, mapJobToResponseDTO } from '../dtos/jobResponse.dto';
import { Types } from 'mongoose';
import { IServiceProviderRepository } from '../../serviceProvider/interfaces/serviceProvider.interface';
import { IAssignmentService } from '../../assignment/interfaces/assignment.interface';
import { INotificationService } from '../../notification/interfaces/notification.interface';
import { JOB_STATUS } from '../../../constants/jobStatus';
import { ASSIGNMENT_STATUS, WORK_STATUS, ASSIGNMENT_TYPE } from '../../../constants/assignment';
import { JOB_VISIBILITY } from '../../../constants/jobVisibility';
import { SuccessMessages } from '../../../constants/messages/successMessages';
import { ErrorMessages } from '../../../constants/messages/errorMessages';
import { IWorkHistoryRepository } from '../../finance/interfaces/finance.interface';
import { AvailabilityValidator } from '../../serviceProvider/utils/availability.validator';
import { IReviewRepository } from '../../review/interfaces/review.interface';

export class JobService implements IJobService {
    private _jobRepository: IJobRepository;
    private _serviceProviderRepository: IServiceProviderRepository;
    private _assignmentService: IAssignmentService;
    private _locationRepository: ILocationRepository;
    private _notificationService: INotificationService;
    private _workHistoryRepository: IWorkHistoryRepository;
    private _reviewRepository: IReviewRepository;

    constructor(
        jobRepository: IJobRepository,
        serviceProviderRepository: IServiceProviderRepository,
        assignmentService: IAssignmentService,
        locationRepository: ILocationRepository,
        notificationService: INotificationService,
        workHistoryRepository: IWorkHistoryRepository,
        reviewRepository: IReviewRepository
    ) {
        this._jobRepository = jobRepository;
        this._serviceProviderRepository = serviceProviderRepository;
        this._assignmentService = assignmentService;
        this._locationRepository = locationRepository;
        this._notificationService = notificationService;
        this._workHistoryRepository = workHistoryRepository;
        this._reviewRepository = reviewRepository;
    }

    private async _getClientMetrics(userId: any): Promise<{ averageRating: number; totalReviews: number }> {
        const userIdStr = userId?._id?.toString() || userId?.toString();
        if (!userIdStr || !Types.ObjectId.isValid(userIdStr)) {
            return { averageRating: 0, totalReviews: 0 };
        }
        try {
            const response = await this._reviewRepository.findByUser(userIdStr, 1, 1);
            return response.meta;
        } catch (error) {
            console.error(`Error fetching metrics for user ${userIdStr}:`, error);
            return { averageRating: 0, totalReviews: 0 };
        }
    }

    async createJob(userId: string, dto: CreateJobDTO): Promise<{ success: boolean; message: string; data?: JobResponseDTO }> {

        const district = await this._locationRepository.findById(dto.location.district);
        if (!district) {
            return { success: false, message: ErrorMessages.INVALID_DISTRICT };
        }

        const placeDistrict = dto.location.districtName.toLowerCase();
        const chosenDistrictName = district.name.toLowerCase();
        const formattedAddress = dto.location.address.toLowerCase();

        if (placeDistrict !== chosenDistrictName && !formattedAddress.includes(chosenDistrictName)) {
            return { success: false, message: ErrorMessages.DISTRICT_MISMATCH };
        }

        if (!dto.budget || dto.budget.min === undefined || dto.budget.max === undefined) {
            return { success: false, message: ErrorMessages.BUDGET_REQUIRED };
        }

        let requiredMinBudget = 500;
        if (dto.durationType === 'half_day') {
            requiredMinBudget = 500;
        } else if (dto.durationType === 'full_day') {
            requiredMinBudget = 1000;
        } else if (dto.durationType === 'multi_day') {
            const daysCount = dto.days || 1;
            requiredMinBudget = 1000 * daysCount;
        }

        if (dto.budget.min < requiredMinBudget) {
            if (dto.durationType === 'half_day') {
                return { success: false, message: "For a half-day job, min budget per provider must be at least ₹500" };
            } else if (dto.durationType === 'full_day') {
                return { success: false, message: "For a full-day job, min budget per provider must be at least ₹1000" };
            } else {
                return { success: false, message: `For ${dto.days || 1} days, min budget per provider must be at least ₹${requiredMinBudget}` };
            }
        }

        if (dto.budget.max < dto.budget.min) {
            return { success: false, message: ErrorMessages.MAX_BUDGET_ERROR };
        }

        if (dto.budget.min <= 0 || dto.budget.max <= 0) {
            return { success: false, message: ErrorMessages.BUDGET_POSITIVE };
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

        const newJob = await this._jobRepository.create({
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
                endDate: endDate,
                startTime: dto.startTime,
                endTime: dto.endTime
            },
            days: dto.days,
            freelancersNeeded: isPrivate ? 1 : freelancersNeeded,
            acceptedFreelancers: 0,
            visibility: isPrivate ? JOB_VISIBILITY.PRIVATE : dto.visibility,
            hiredProviderId: isPrivate ? new Types.ObjectId(dto.hiredProviderId) as any : undefined,
            status: JOB_STATUS.OPEN,
            applicantsCount: 0
        });

        const job = await this._jobRepository.findById(newJob._id.toString());

        let assignmentData = null;
        if (job && job.hiredProviderId) {
             assignmentData = await this._assignmentService.getAssignmentByJobAndFreelancer(
                job._id.toString(),
                job.hiredProviderId._id.toString()
            );
        }

        const clientMetrics = await this._getClientMetrics(job?.userId);
        return {
            success: true,
            message: SuccessMessages.JOB_CREATED,
            data: job ? await mapJobToResponseDTO(job, assignmentData, clientMetrics) : undefined
        };
    }

    async getJobsByUser(
        userId: string,
        page: number = 1,
        limit: number = 10,
        filters?: { status?: string; search?: string; visibility?: string }
    ): Promise<import('../interfaces/job.interface').IJobPaginationResponse> {
        const [{ jobs, total }, counts] = await Promise.all([
            this._jobRepository.findByUserPaginated(userId, page, limit, filters),
            this._jobRepository.countByUserGrouped(userId)
        ]);

        const mappedJobs = await Promise.all(jobs.map(async (j) => {
            let assignmentData = null;
            if (j.hiredProviderId) {
                assignmentData = await this._assignmentService.getAssignmentByJobAndFreelancer(
                    j._id.toString(),
                    j.hiredProviderId._id.toString()
                );
            }
            const clientMetrics = await this._getClientMetrics(j.userId);
            const dto = await mapJobToResponseDTO(j, assignmentData, clientMetrics);

            const workHistories = await this._workHistoryRepository.findByJobAndStatus(j._id.toString(), 'COMPLETED');

            dto.providers = workHistories.map(wh => ({
                providerId: wh.providerId.toString(),
                finalStatus: wh.finalStatus,
                payment: {
                    status: wh.payment.status,
                    totalAmount: wh.payment.totalAmount
                }
            }));

            dto.hasPendingPayment = workHistories.some(wh => wh.payment.status !== 'completed');

            return dto;
        }));

        return {
            success: true,
            data: mappedJobs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            },
            counts
        };
    }

    async availableJobs(page: number = 1, limit: number = 10, filters: any = {}, userId?: string): Promise<import('../interfaces/job.interface').IJobPaginationResponse> {

        const assignedJobIds = new Set<string>();
            const provider = await this._serviceProviderRepository.findByUserId(userId as string);
            if (provider) {
                const { assignments: providerAssignments } = await this._assignmentService.getAssignmentsByProvider(provider._id.toString(), { limit: 1000 });
                providerAssignments.forEach(a => {
                    const id = a.jobId && (a.jobId as any)._id ? (a.jobId as any)._id.toString() : a.jobId?.toString();
                    if (id) assignedJobIds.add(id);
                });
            }
            const skills: string[] = await provider.skills.map((a: any) => a._id.toString())
            const { jobs, total } = await this._jobRepository.findAllOpen(page, limit, filters, skills, Array.from(assignedJobIds), userId);

        const mappedJobs = await Promise.all(jobs.map(async j => {
            const clientMetrics = await this._getClientMetrics(j.userId);
            const dto = await mapJobToResponseDTO(j, undefined, clientMetrics);
            dto.isApplied = assignedJobIds.has(dto.id);

            dto.applicants = await this._assignmentService.getAssignmentCountByJob(dto.id);

            return dto;
        }));

        return {
            success: true,
            data: mappedJobs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        };
    }

    async getJobById(jobId: string, userId?: string): Promise<{ success: boolean; data?: JobResponseDTO; message?: string }> {
        const job = await this._jobRepository.findById(jobId);
        if (!job) {
            return { success: false, message: ErrorMessages.JOB_NOT_FOUND };
        }

        let assignmentData = null;
        if (job.hiredProviderId) {
             assignmentData = await this._assignmentService.getAssignmentByJobAndFreelancer(
                job._id.toString(),
                job.hiredProviderId._id.toString()
            );
        }

        const clientMetrics = await this._getClientMetrics(job.userId);
        const dto = await mapJobToResponseDTO(job, assignmentData, clientMetrics);

        dto.applicants = await this._assignmentService.getAssignmentCountByJob(jobId);

        if (userId) {
            const provider = await this._serviceProviderRepository.findByUserId(userId);
            if (provider) {
                const { assignments } = await this._assignmentService.getAssignmentsByProvider(provider._id.toString(), { limit: 1000 });
                dto.isApplied = assignments.some(a => {
                    const id = a.jobId && (a.jobId as any)._id ? (a.jobId as any)._id.toString() : a.jobId?.toString();
                    return id === jobId;
                });
            }
        }

        return { success: true, data: dto };
    }

    async getDirectOffers(userId: string, page: number = 1, limit: number = 10, search?: string, filter?: string): Promise<import('../interfaces/job.interface').IJobPaginationResponse> {
        const provider = await this._serviceProviderRepository.findByUserId(userId);
        if (!provider) {
            return {
                success: true,
                data: [],
                pagination: { total: 0, page, limit, totalPages: 0, hasNext: false, hasPrev: false },
                counts: { all: 0, pending: 0, accepted: 0, rejected: 0 } as any
            };
        }

        const [{ jobs, total }, counts] = await Promise.all([
            this._jobRepository.findByProviderPaginated(provider._id.toString(), page, limit, search, filter),
            this._jobRepository.countByProviderGrouped(provider._id.toString())
        ]);

        const mappedJobs = await Promise.all(jobs.map(async j => {
             const assignmentData = await this._assignmentService.getAssignmentByJobAndFreelancer(
                j._id.toString(),
                provider._id.toString()
            );
            const clientMetrics = await this._getClientMetrics(j.userId);
            return mapJobToResponseDTO(j, assignmentData, clientMetrics);
        }));

        return {
            success: true,
            data: mappedJobs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            },
            counts: counts as any
        };
    }

    async acceptJob(jobId: string, userId: string, amount?: number): Promise<{ success: boolean; message: string }> {
        const provider = await this._serviceProviderRepository.findByUserId(userId);
        if (!provider) {
            return { success: false, message: ErrorMessages.PROVIDER_NOT_FOUND };
        }

        if (provider.verification?.status !== 'verified') {
            return { success: false, message: ErrorMessages.PROFILE_UNDER_VERIFICATION };
        }

        const job = await this._jobRepository.findById(jobId);
        if (!job || job.visibility !== 'public') {
            return { success: false, message: ErrorMessages.JOB_UNAVAILABLE };
        }

        if ([JOB_STATUS.FULLY_ASSIGNED, JOB_STATUS.COMPLETED, JOB_STATUS.CANCELLED, JOB_STATUS.REJECTED].includes(job.status)) {
            return { success: false, message: ErrorMessages.JOB_NOT_OPEN };
        }

        const { assignments: existingAssignments } = await this._assignmentService.getAssignmentsByProvider(provider._id.toString(), { limit: 1000 });
        const hasAlreadyAccepted = existingAssignments.some(a => a.jobId.toString() === job._id.toString());

        if (hasAlreadyAccepted) {
            return { success: false, message: ErrorMessages.JOB_ALREADY_ACCEPTED };
        }

        const isAvailableInWeekly = AvailabilityValidator.isWithinWeeklyAvailability(
            provider.availability,
            job.schedule.startDate,
            job.schedule.startTime,
            job.schedule.endTime
        );
        if (!isAvailableInWeekly) {
            return { success: false, message: "Provider unavailable during requested time based on weekly schedule" };
        }

        const isBlocked = AvailabilityValidator.isDateBlocked(
            provider.blockedDates,
            job.schedule.startDate
        );
        if (isBlocked) {
            return { success: false, message: "Provider has blocked this date" };
        }

        const hasConflict = AvailabilityValidator.doesOverlapWithAssignments(
            existingAssignments,
            job.schedule.startDate,
            job.schedule.startTime,
            job.schedule.endTime
        );
        if (hasConflict) {
            return { success: false, message: "Provider has a conflicting assignment within buffer time" };
        }

        const updatedJob = await this._jobRepository.findByConditionAndUpdate(
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
        
        if (amount !== undefined) {
            if (amount < updatedJob.budget.min || amount > updatedJob.budget.max) {
                return { success: false, message: "Amount must remain within client budget range" };
            }
        }

        const isOutOfDistrict = provider.location?.id?.toString() !== updatedJob.location?.district?._id?.toString();

        await this._assignmentService.createAssignment({
            jobId: updatedJob._id as any,
            freelancerId: provider._id as any,
            type: ASSIGNMENT_TYPE.OPEN,
            invite: {
                status: ASSIGNMENT_STATUS.ACCEPTED,
                invitedBy: updatedJob.userId as any,
                invitedAt: updatedJob.createdAt,
                respondedAt: new Date()
            },
            payment: amount !== undefined ? { amount, status: 'pending' } as any : undefined,
            workStatus: WORK_STATUS.ASSIGNED,
            schedule: updatedJob.schedule,
            isOutOfDistrict,
            assignedAt: new Date()
        });

        if (updatedJob.acceptedFreelancers >= updatedJob.freelancersNeeded) {
            await this._jobRepository.updateStatus(jobId, JOB_STATUS.FULLY_ASSIGNED);
        } else if (updatedJob.status === JOB_STATUS.OPEN) {
            await this._jobRepository.updateStatus(jobId, JOB_STATUS.PARTIALLY_ASSIGNED);
        }

        await this._notificationService.createNotification({
            recipient: updatedJob.userId.toString(),
            title: 'Job Accepted',
            message: `${provider.userId?.name || 'A provider'} has accepted your job: ${updatedJob.title}`,
            type: 'JOB_ASSIGNMENT',
            link: `/user/jobs/${updatedJob._id}`
        });

        return { success: true, message: SuccessMessages.JOB_ACCEPTED };
    }

    async acceptOffer(jobId: string, userId: string, amount?: number): Promise<{ success: boolean; message: string }> {
        const provider = await this._serviceProviderRepository.findByUserId(userId);
        if (!provider) {
            return { success: false, message: ErrorMessages.PROVIDER_NOT_FOUND };
        }

        if (provider.verification?.status !== 'verified') {
            return { success: false, message: ErrorMessages.PROFILE_UNDER_VERIFICATION };
        }

        const job = await this._jobRepository.findById(jobId);
        if (!job) {
            return { success: false, message: ErrorMessages.JOB_NOT_FOUND };
        }

        if (job.hiredProviderId?._id.toString() !== provider._id.toString()) {
            return { success: false, message: ErrorMessages.OFFER_NOT_FOR_USER };
        }

        const { assignments: existingAssignments } = await this._assignmentService.getAssignmentsByProvider(provider._id.toString(), { limit: 1000 });

        const isAvailableInWeekly = AvailabilityValidator.isWithinWeeklyAvailability(
            provider.availability,
            job.schedule.startDate,
            job.schedule.startTime,
            job.schedule.endTime
        );
        if (!isAvailableInWeekly) {
            return { success: false, message: "Provider unavailable during requested time based on weekly schedule" };
        }

        const isBlocked = AvailabilityValidator.isDateBlocked(
            provider.blockedDates,
            job.schedule.startDate
        );
        if (isBlocked) {
            return { success: false, message: "Provider has blocked this date" };
        }

        const hasConflict = AvailabilityValidator.doesOverlapWithAssignments(
            existingAssignments,
            job.schedule.startDate,
            job.schedule.startTime,
            job.schedule.endTime
        );
        if (hasConflict) {
            return { success: false, message: "Provider has a conflicting assignment within buffer time" };
        }

        const isOutOfDistrict = provider.location?.id?.toString() !== job.location?.district?._id?.toString();

        const updatedJob = await this._jobRepository.findByConditionAndUpdate(
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

        if (amount !== undefined) {
            if (amount < updatedJob.budget.min || amount > updatedJob.budget.max) {
                return { success: false, message: "Amount must remain within client budget range" };
            }
        }

        await this._assignmentService.createAssignment({
            jobId: updatedJob._id as any,
            freelancerId: provider._id as any,
            type: ASSIGNMENT_TYPE.DIRECT,
            invite: {
                status: ASSIGNMENT_STATUS.ACCEPTED,
                invitedBy: updatedJob.userId as any,
                invitedAt: updatedJob.createdAt,
                respondedAt: new Date()
            },
            payment: amount !== undefined ? { amount, status: 'pending' } as any : undefined,
            workStatus: WORK_STATUS.ASSIGNED,
            schedule: updatedJob.schedule,
            isOutOfDistrict,
            assignedAt: new Date()
        });

        await this._notificationService.createNotification({
            recipient: updatedJob.userId.toString(),
            title: 'Offer Accepted',
            message: `${provider.userId?.name || 'The provider'} has accepted your direct offer for: ${updatedJob.title}`,
            type: 'JOB_ASSIGNMENT',
            link: `/user/jobs/${updatedJob._id}`
        });

        return { success: true, message: SuccessMessages.OFFER_ACCEPTED };
    }

    async rejectOffer(jobId: string, userId: string, reason?: string): Promise<{ success: boolean; message: string }> {
        const provider = await this._serviceProviderRepository.findByUserId(userId);
        if (!provider) {
            return { success: false, message: ErrorMessages.PROVIDER_NOT_FOUND };
        }

        const job = await this._jobRepository.findById(jobId);
        if (!job || job.hiredProviderId?._id?.toString() !== provider._id.toString()) {
            return { success: false, message: ErrorMessages.JOB_NOT_FOUND };
        }

        await this._jobRepository.findByConditionAndUpdate(
            { _id: jobId },
            { $set: { status: JOB_STATUS.REJECTED, rejectionReason: reason || 'Provider declined the offer' } }
        );

        await this._notificationService.createNotification({
            recipient: (job.userId as any)._id ? (job.userId as any)._id.toString() : job.userId.toString(),
            title: 'Offer Declined',
            message: `${provider.userId?.name || 'The provider'} has declined your direct offer for: ${job.title}`,
            type: 'JOB_ASSIGNMENT',
            link: `/user/jobs/${job._id}`
        });

        return { success: true, message: SuccessMessages.OFFER_REJECTED };
    }

    async cancelJob(jobId: string, userId: string): Promise<{ success: boolean; message: string }> {
        const job = await this._jobRepository.findById(jobId);
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

        await this._jobRepository.updateStatus(jobId, JOB_STATUS.CANCELLED);

        if (job.status === JOB_STATUS.FULLY_ASSIGNED || job.status === JOB_STATUS.PARTIALLY_ASSIGNED || job.status === JOB_STATUS.IN_PROGRESS) {
            await this._assignmentService.cancelAssignmentsByJob(jobId);
        }

        return { success: true, message: SuccessMessages.JOB_CANCELLED };
    }
}