import { IAssignment, IAssignmentRepository, IAssignmentService } from '../interfaces/assignment.interface';
import { ASSIGNMENT_STATUS, WORK_STATUS } from '../../../constants/assignment';
import { IJobRepository } from '../../job/interfaces/job.interface';
import { JOB_STATUS } from '../../../constants/jobStatus';
import { Types } from 'mongoose';
import { getObjectId } from '../../../utils/getObjectId';
import { NotificationService } from '../../notification/services/notification.service';

export class AssignmentService implements IAssignmentService {
    private assignmentRepository: IAssignmentRepository;
    private jobRepository: IJobRepository;
    private notificationService: NotificationService;

    constructor(
        assignmentRepository: IAssignmentRepository,
        jobRepository: IJobRepository,
        notificationService: NotificationService
    ) {
        this.assignmentRepository = assignmentRepository;
        this.jobRepository = jobRepository;
        this.notificationService = notificationService;
    }

    async checkOverlap(freelancerId: string, startDate: Date, endDate: Date): Promise<boolean> {

        const query = {
            freelancerId,
            workStatus: { $in: [WORK_STATUS.ASSIGNED, WORK_STATUS.IN_PROGRESS] },
            'invite.status': { $ne: ASSIGNMENT_STATUS.REJECTED },
            'schedule.startDate': { $lt: endDate },
            'schedule.endDate': { $gt: startDate }
        };

        const existing = await this.assignmentRepository.find(query);
        return existing.length > 0;
    }

    async createAssignment(data: Partial<IAssignment>): Promise<IAssignment> {
        return await this.assignmentRepository.create(data);
    }

    async getAssignmentsByProvider(providerId: string, options?: { page?: number, limit?: number, search?: string, status?: string }): Promise<{ assignments: IAssignment[], total: number, counts: { active: number, completed: number, cancelled: number, all: number } }> {
        const { page = 1, limit = 10, search = '', status = 'all' } = options || {};
        
        const query: any = {
            freelancerId: providerId,
            'invite.status': ASSIGNMENT_STATUS.ACCEPTED
        };

        // Handle status filtering
        if (status === 'active') {
            query.workStatus = { $in: [WORK_STATUS.ASSIGNED, WORK_STATUS.IN_PROGRESS] };
        } else if (status === 'completed') {
            query.workStatus = WORK_STATUS.COMPLETED;
        } else if (status === 'cancelled') {
            query.workStatus = WORK_STATUS.CANCELLED;
        } else {
            // all
            query.workStatus = { $in: [WORK_STATUS.ASSIGNED, WORK_STATUS.IN_PROGRESS, WORK_STATUS.COMPLETED, WORK_STATUS.CANCELLED, WORK_STATUS.ABSENT] };
        }

        if (search) {
            // Find jobs matching search
            const matchingJobs = await this.jobRepository.find({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            });
            const jobIds = matchingJobs.map((j: any) => j._id.toString());
            query.jobId = { $in: jobIds };
        }

        const [assignments, total, allCount, activeCount, completedCount, cancelledCount] = await Promise.all([
            this.assignmentRepository.find(query, { page, limit }),
            this.assignmentRepository.count(query),
            this.assignmentRepository.count({ freelancerId: providerId, 'invite.status': ASSIGNMENT_STATUS.ACCEPTED }),
            this.assignmentRepository.count({ freelancerId: providerId, 'invite.status': ASSIGNMENT_STATUS.ACCEPTED, workStatus: { $in: [WORK_STATUS.ASSIGNED, WORK_STATUS.IN_PROGRESS] } }),
            this.assignmentRepository.count({ freelancerId: providerId, 'invite.status': ASSIGNMENT_STATUS.ACCEPTED, workStatus: WORK_STATUS.COMPLETED }),
            this.assignmentRepository.count({ freelancerId: providerId, 'invite.status': ASSIGNMENT_STATUS.ACCEPTED, workStatus: WORK_STATUS.CANCELLED })
        ]);

        return { 
            assignments, 
            total,
            counts: {
                all: allCount,
                active: activeCount,
                completed: completedCount,
                cancelled: cancelledCount
            }
        };
    }

    async cancelAssignmentsByJob(jobId: string): Promise<void> {
        await this.assignmentRepository.updateByJobId(jobId, { workStatus: WORK_STATUS.CANCELLED });
    }

    async getAssignmentById(id: string): Promise<IAssignment | null> {
        return await this.assignmentRepository.findById(id);
    }

    async getAssignmentsByJobId(jobId: string): Promise<IAssignment[]> {
        return await this.assignmentRepository.find({ jobId, 'invite.status': ASSIGNMENT_STATUS.ACCEPTED });
    }

    async updateStatus(id: string, status: WORK_STATUS): Promise<IAssignment | null> {
        const updateData: any = { workStatus: status };
        if (status === WORK_STATUS.IN_PROGRESS) {
            updateData.startedAt = new Date();
        } else if (status === WORK_STATUS.COMPLETED) {
            updateData.completedAt = new Date();
        }
        
        const updated = await this.assignmentRepository.update(id, updateData);
        
        if (updated && status === WORK_STATUS.COMPLETED) {
            const jobId = getObjectId(updated.jobId);
            await this.checkAndCompleteJob(jobId);

            // Send notification to Client
            const job = await this.jobRepository.findById(jobId);
            if (job) {
                await this.notificationService.createNotification({
                    recipient: (job.userId as any)._id ? (job.userId as any)._id.toString() : job.userId.toString(),
                    title: 'Work Completed',
                    message: `A provider has marked their work as completed for: ${job.title}`,
                    type: 'JOB_STATUS',
                    link: `/user/jobs/${job._id}`
                });
            }
        }
        
        return updated;
    }

    async submitProof(id: string, proofData: { images: string[], description: string }): Promise<IAssignment | null> {
        const updated = await this.assignmentRepository.update(id, {
            proof: proofData.images,
            proofDescription: proofData.description,
            workStatus: WORK_STATUS.COMPLETED,
            completedAt: new Date()
        });

        if (updated) {
            const jobId = getObjectId(updated.jobId);
            await this.checkAndCompleteJob(jobId);

            // Send notification to Client
            const job = await this.jobRepository.findById(jobId);
            if (job) {
                await this.notificationService.createNotification({
                    recipient: (job.userId as any)._id ? (job.userId as any)._id.toString() : job.userId.toString(),
                    title: 'Proof of Work Submitted',
                    message: `A provider has submitted proof of work for: ${job.title}`,
                    type: 'PAYMENT', // Usually related to payment release
                    link: `/user/jobs/${job._id}`
                });
            }
        }

        return updated;
    }

    async getAssignmentCountByJob(jobId: string): Promise<number> {
        return await this.assignmentRepository.count({
            jobId,
            workStatus: { $ne: WORK_STATUS.CANCELLED },
            'invite.status': ASSIGNMENT_STATUS.ACCEPTED
        });
    }

    private async checkAndCompleteJob(jobId: string): Promise<void> {
        const job = await this.jobRepository.findById(jobId);
        if (!job) return;

        if (job.status === JOB_STATUS.COMPLETED || job.status === JOB_STATUS.CANCELLED) return;

        const allAssignments = await this.assignmentRepository.find({ 
            jobId, 
            'invite.status': ASSIGNMENT_STATUS.ACCEPTED 
        });

        const completedCount = allAssignments.filter(a => a.workStatus === WORK_STATUS.COMPLETED).length;

        if (completedCount >= job.freelancersNeeded) {
            await this.jobRepository.updateStatus(jobId, JOB_STATUS.COMPLETED);
        }
    }

    async cancelByProvider(id: string, providerId: string, notes?: string): Promise<IAssignment> {
        const assignment = await this.assignmentRepository.findById(id);
        if (!assignment) throw new Error('Assignment not found');

        const freelancerId = getObjectId(assignment.freelancerId);
        if (freelancerId !== providerId) {
            throw new Error('Unauthorized: Only the assigned provider can cancel this assignment');
        }

        if ([WORK_STATUS.CANCELLED, WORK_STATUS.ABSENT, WORK_STATUS.COMPLETED].includes(assignment.workStatus)) {
            throw new Error(`Cannot cancel an assignment that is already ${assignment.workStatus}`);
        }

        const isLateCancel = new Date() > assignment.schedule.startDate;

        const userId = (assignment.freelancerId as any).userId?._id || (assignment.freelancerId as any).userId;

        const updated = await this.assignmentRepository.update(id, {
            workStatus: WORK_STATUS.CANCELLED,
            cancellation: {
                cancelledBy: new Types.ObjectId(userId),
                cancelledAt: new Date(),
                reason: 'provider_requested',
                isLateCancel,
                notes
            }
        });

        if (!updated) throw new Error('Failed to update assignment');

        await this.handleJobReopening(getObjectId(updated.jobId), providerId);

        // Send notification to Client
        const jobId = getObjectId(updated.jobId);
        const job = await this.jobRepository.findById(jobId);
        if (job) {
            await this.notificationService.createNotification({
                recipient: (job.userId as any)._id ? (job.userId as any)._id.toString() : job.userId.toString(),
                title: 'Assignment Cancelled',
                message: `A provider has cancelled their assignment for: ${job.title}`,
                type: 'JOB_STATUS',
                link: `/user/jobs/${job._id}`
            });
        }

        return updated;
    }

    async cancelByClient(id: string, clientId: string, notes?: string): Promise<IAssignment> {
        const assignment = await this.assignmentRepository.findById(id);
        if (!assignment) throw new Error('Assignment not found');

        const jobId = getObjectId(assignment.jobId);
        const job = await this.jobRepository.findById(jobId);
        
        if (!job) throw new Error('Job not found');
        
        const jobOwnerId = getObjectId(job.userId);
        if (jobOwnerId !== clientId) {
            throw new Error('Unauthorized: Only the job owner can cancel this assignment');
        }

        if ([WORK_STATUS.CANCELLED, WORK_STATUS.ABSENT, WORK_STATUS.COMPLETED].includes(assignment.workStatus)) {
            throw new Error(`Cannot cancel an assignment that is already ${assignment.workStatus}`);
        }

        const isLateCancel = new Date() > assignment.schedule.startDate;

        const updated = await this.assignmentRepository.update(id, {
            workStatus: WORK_STATUS.CANCELLED,
            cancellation: {
                cancelledBy: new Types.ObjectId(clientId),
                cancelledAt: new Date(),
                reason: 'client_requested',
                isLateCancel,
                notes
            }
        });

        if (!updated) throw new Error('Failed to update assignment');

        const freelancerId = getObjectId(assignment.freelancerId);
        await this.handleJobReopening(getObjectId(updated.jobId), freelancerId);

        return updated;
    }

    async reportAbsence(id: string, clientId: string, notes?: string, evidence?: string[]): Promise<IAssignment> {
        const assignment = await this.assignmentRepository.findById(id);
        if (!assignment) throw new Error('Assignment not found');

        const jobId = getObjectId(assignment.jobId);
        const job = await this.jobRepository.findById(jobId);

        if (!job) throw new Error('Job not found');

        const jobOwnerId = getObjectId(job.userId);
        if (jobOwnerId !== clientId) {
            throw new Error('Unauthorized: Only the job owner can report absence');
        }

        if (new Date() < assignment.schedule.startDate) {
            throw new Error('Absence can only be reported after the job start time');
        }

        if ([WORK_STATUS.CANCELLED, WORK_STATUS.ABSENT, WORK_STATUS.COMPLETED].includes(assignment.workStatus)) {
            throw new Error(`Cannot report absence for an assignment that is already ${assignment.workStatus}`);
        }

        const updated = await this.assignmentRepository.update(id, {
            workStatus: WORK_STATUS.ABSENT,
            absence: {
                reportedBy: new Types.ObjectId(clientId),
                reportedAt: new Date(),
                notes,
                evidence
            }
        });

        if (!updated) throw new Error('Failed to update assignment');

        const freelancerId = getObjectId(assignment.freelancerId);
        await this.handleJobReopening(getObjectId(updated.jobId), freelancerId);

        return updated;
    }

    private async handleJobReopening(jobId: string, freelancerId: string): Promise<void> {
        const job = await this.jobRepository.findById(jobId);
        if (!job) return;

        if (job.visibility === 'private') {
            await this.jobRepository.findByConditionAndUpdate(
                { _id: jobId },
                { $set: { 
                    status: JOB_STATUS.CANCELLED, 
                    acceptedFreelancers: 0,
                    hiredProviderId: null 
                }}
            );
            return;
        }

        const newAcceptedCount = Math.max(0, (job.acceptedFreelancers || 1) - 1);
        
        const updateData: any = {
            acceptedFreelancers: newAcceptedCount,
            status: newAcceptedCount === 0 ? JOB_STATUS.OPEN : JOB_STATUS.PARTIALLY_ASSIGNED
        };

        const hiredProviderId = job.hiredProviderId ? getObjectId(job.hiredProviderId) : null;
        if (hiredProviderId === freelancerId) {
            updateData.hiredProviderId = null;
        }

        await this.jobRepository.findByConditionAndUpdate({ _id: jobId }, { $set: updateData });
    }
}
