import { IAssignment, IAssignmentRepository, IAssignmentService } from '../interfaces/assignment.interface';
import { ASSIGNMENT_STATUS, WORK_STATUS } from '../../../constants/assignment';
import { PAYMENT_STATUS, PAYMENT_METHOD } from '../../../constants/payment';
import { IJobRepository } from '../../job/interfaces/job.interface';
import { JOB_STATUS } from '../../../constants/jobStatus';
import { Types } from 'mongoose';
import { getObjectId } from '../../../utils/getObjectId';
import { INotificationService } from '../../notification/interfaces/notification.interface';
import { IWorkHistoryService, IPaymentService } from '../../finance/interfaces/finance.interface';

export class AssignmentService implements IAssignmentService {
    private _assignmentRepository: IAssignmentRepository;
    private _jobRepository: IJobRepository;
    private _notificationService: INotificationService;
    private _workHistoryService: IWorkHistoryService;
    private _paymentService: IPaymentService;

    constructor(
        assignmentRepository: IAssignmentRepository,
        jobRepository: IJobRepository,
        notificationService: INotificationService,
        workHistoryService: IWorkHistoryService,
        paymentService: IPaymentService
    ) {
        this._assignmentRepository = assignmentRepository;
        this._jobRepository = jobRepository;
        this._notificationService = notificationService;
        this._workHistoryService = workHistoryService;
        this._paymentService = paymentService;
    }

    async checkOverlap(freelancerId: string, startDate: Date, endDate: Date): Promise<boolean> {
        const query = {
            freelancerId,
            workStatus: { $in: [WORK_STATUS.ASSIGNED, WORK_STATUS.IN_PROGRESS] },
            'invite.status': { $ne: ASSIGNMENT_STATUS.REJECTED },
            'schedule.startDate': { $lt: endDate },
            'schedule.endDate': { $gt: startDate }
        };

        const existing = await this._assignmentRepository.find(query);
        return existing.length > 0;
    }

    async createAssignment(data: Partial<IAssignment>): Promise<IAssignment> {
        if (data.jobId) {
            const jobId = data.jobId.toString();
            const job = await this._jobRepository.findById(jobId);

            if (job && job.budget) {
                const chosenAmount = data.payment?.amount;
                const finalAmount = (chosenAmount !== undefined && chosenAmount !== null)
                    ? chosenAmount
                    : (job.budget.min + job.budget.max) / 2;

                data.payment = {
                    ...data.payment,
                    status: PAYMENT_STATUS.PENDING,
                    amount: finalAmount
                };
            }
        }
        return await this._assignmentRepository.create(data);
    }

    async getAssignmentsByProvider(providerId: string, options?: { page?: number, limit?: number, search?: string, status?: string }): Promise<{ assignments: IAssignment[], total: number, counts: { active: number, completed: number, cancelled: number, all: number } }> {
        const { page = 1, limit = 10, search = '', status = 'all' } = options || {};

        const query: Record<string, unknown> = {
            freelancerId: providerId,
            'invite.status': ASSIGNMENT_STATUS.ACCEPTED
        };

        if (status === 'active') {
            query.workStatus = { $in: [WORK_STATUS.ASSIGNED, WORK_STATUS.IN_PROGRESS] };
        } else if (status === 'completed') {
            query.workStatus = WORK_STATUS.COMPLETED;
        } else if (status === 'cancelled') {
            query.workStatus = WORK_STATUS.CANCELLED;
        } else {
            query.workStatus = { $in: [WORK_STATUS.ASSIGNED, WORK_STATUS.IN_PROGRESS, WORK_STATUS.COMPLETED, WORK_STATUS.CANCELLED, WORK_STATUS.ABSENT] };
        }

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            const matchingJobs = await this._jobRepository.find({
                $or: [
                    { jobCode: searchRegex },
                    { title: searchRegex },
                    { description: searchRegex }
                ]
            });
            const jobIds = matchingJobs.map((j: { _id: { toString: () => string } }) => j._id.toString());
            query.$or = [
                { assignmentCode: searchRegex },
                { jobId: { $in: jobIds } }
            ];
        }

        const [assignments, total, allCount, activeCount, completedCount, cancelledCount] = await Promise.all([
            this._assignmentRepository.find(query, { page, limit }),
            this._assignmentRepository.count(query),
            this._assignmentRepository.count({ freelancerId: providerId, 'invite.status': ASSIGNMENT_STATUS.ACCEPTED }),
            this._assignmentRepository.count({ freelancerId: providerId, 'invite.status': ASSIGNMENT_STATUS.ACCEPTED, workStatus: { $in: [WORK_STATUS.ASSIGNED, WORK_STATUS.IN_PROGRESS] } }),
            this._assignmentRepository.count({ freelancerId: providerId, 'invite.status': ASSIGNMENT_STATUS.ACCEPTED, workStatus: WORK_STATUS.COMPLETED }),
            this._assignmentRepository.count({ freelancerId: providerId, 'invite.status': ASSIGNMENT_STATUS.ACCEPTED, workStatus: WORK_STATUS.CANCELLED })
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
        await this._assignmentRepository.updateByJobId(jobId, { workStatus: WORK_STATUS.CANCELLED });
    }

    async getAssignmentById(id: string): Promise<IAssignment | null> {
        return await this._assignmentRepository.findById(id);
    }

    async getAssignmentsByJobId(jobId: string): Promise<IAssignment[]> {
        return await this._assignmentRepository.find({ jobId, 'invite.status': ASSIGNMENT_STATUS.ACCEPTED });
    }

    async getJobAssignments(jobId: string): Promise<IAssignment[]> {
        return await this._assignmentRepository.findWithFreelancer(jobId);
    }

    async updateStatus(id: string, status: WORK_STATUS): Promise<IAssignment | null> {
        const updateData: Record<string, unknown> = { workStatus: status };
        if (status === WORK_STATUS.IN_PROGRESS) {
            updateData.startedAt = new Date();
        } else if (status === WORK_STATUS.COMPLETED) {
            updateData.completedAt = new Date();
        }

        const updated = await this._assignmentRepository.updateById(id, updateData);

        if (updated && status === WORK_STATUS.COMPLETED) {
            const jobId = getObjectId(updated.jobId);
            await this._checkAndCompleteJob(jobId);

            await this._workHistoryService.createFromAssignment(updated as unknown as Record<string, unknown>);

            const job = await this._jobRepository.findById(jobId);
            if (job) {
                await this._notificationService.createNotification({
                    recipient: ((job.userId as { _id?: { toString: () => string } })._id?.toString()) || job.userId.toString(),
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
        const updated = await this._assignmentRepository.updateById(id, {
            proof: proofData.images,
            proofDescription: proofData.description,
            workStatus: WORK_STATUS.COMPLETED,
            completedAt: new Date()
        });

        if (updated) {
            const jobId = getObjectId(updated.jobId);
            await this._checkAndCompleteJob(jobId);

            await this._workHistoryService.createFromAssignment(updated as unknown as Record<string, unknown>);

            const job = await this._jobRepository.findById(jobId);
            if (job) {
                await this._notificationService.createNotification({
                    recipient: ((job.userId as { _id?: { toString: () => string } })._id?.toString()) || job.userId.toString(),
                    title: 'Proof of Work Submitted',
                    message: `A provider has submitted proof of work for: ${job.title}`,
                    type: 'PAYMENT',
                    link: `/user/jobs/${job._id}`
                });
            }
        }

        return updated;
    }

    async getAssignmentCountByJob(jobId: string): Promise<number> {
        return await this._assignmentRepository.count({
            jobId,
            workStatus: { $ne: WORK_STATUS.CANCELLED },
            'invite.status': ASSIGNMENT_STATUS.ACCEPTED
        });
    }

    private async _checkAndCompleteJob(jobId: string): Promise<void> {
        const job = await this._jobRepository.findById(jobId);
        if (!job) return;

        if (job.status === JOB_STATUS.COMPLETED || job.status === JOB_STATUS.CANCELLED) return;

        const allAssignments = await this._assignmentRepository.find({
            jobId,
            'invite.status': ASSIGNMENT_STATUS.ACCEPTED
        });

        const completedCount = allAssignments.filter(a => a.workStatus === WORK_STATUS.COMPLETED).length;

        if (completedCount >= job.freelancersNeeded) {
            await this._jobRepository.updateStatus(jobId, JOB_STATUS.COMPLETED);
        }
    }

    async cancelByProvider(id: string, providerId: string, notes?: string): Promise<IAssignment> {
        const assignment = await this._assignmentRepository.findById(id);
        if (!assignment) throw new Error('Assignment not found');

        const freelancerId = getObjectId(assignment.freelancerId);
        if (freelancerId !== providerId) {
            throw new Error('Unauthorized: Only the assigned provider can cancel this assignment');
        }

        if ([WORK_STATUS.CANCELLED, WORK_STATUS.ABSENT, WORK_STATUS.COMPLETED].includes(assignment.workStatus)) {
            throw new Error(`Cannot cancel an assignment that is already ${assignment.workStatus}`);
        }

        const isLateCancel = new Date() > assignment.schedule.startDate;

        const userId = (assignment.freelancerId as { userId?: { _id?: Types.ObjectId; toString: () => string } }).userId?._id || (assignment.freelancerId as { userId?: { _id?: Types.ObjectId; toString: () => string } }).userId;

        const updated = await this._assignmentRepository.updateById(id, {
            workStatus: WORK_STATUS.CANCELLED,
            cancellation: {
                cancelledBy: new Types.ObjectId(userId as Types.ObjectId),
                cancelledAt: new Date(),
                reason: 'provider_requested',
                isLateCancel,
                notes
            }
        });

        if (!updated) throw new Error('Failed to update assignment');

        await this._workHistoryService.createFromAssignment(updated as unknown as Record<string, unknown>);

        await this._handleJobReopening(getObjectId(updated.jobId), providerId);

        const jobId = getObjectId(updated.jobId);
        const job = await this._jobRepository.findById(jobId);
        if (job) {
            await this._notificationService.createNotification({
                recipient: ((job.userId as { _id?: { toString: () => string } })._id?.toString()) || job.userId.toString(),
                title: 'Assignment Cancelled',
                message: `A provider has cancelled their assignment for: ${job.title}`,
                type: 'JOB_STATUS',
                link: `/user/jobs/${job._id}`
            });
        }

        return updated;
    }

    async cancelByClient(id: string, clientId: string, notes?: string): Promise<IAssignment> {
        const assignment = await this._assignmentRepository.findById(id);
        if (!assignment) throw new Error('Assignment not found');

        const jobId = getObjectId(assignment.jobId);
        const job = await this._jobRepository.findById(jobId);

        if (!job) throw new Error('Job not found');

        const jobOwnerId = getObjectId(job.userId);
        if (jobOwnerId !== clientId) {
            throw new Error('Unauthorized: Only the job owner can cancel this assignment');
        }

        if ([WORK_STATUS.CANCELLED, WORK_STATUS.ABSENT, WORK_STATUS.COMPLETED].includes(assignment.workStatus)) {
            throw new Error(`Cannot cancel an assignment that is already ${assignment.workStatus}`);
        }

        const isLateCancel = new Date() > assignment.schedule.startDate;

        const updated = await this._assignmentRepository.updateById(id, {
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

        await this._workHistoryService.createFromAssignment(updated as unknown as Record<string, unknown>);

        const freelancerId = getObjectId(assignment.freelancerId);
        await this._handleJobReopening(getObjectId(updated.jobId), freelancerId);

        return updated;
    }

    async reportAbsence(id: string, clientId: string, notes?: string, evidence?: string[]): Promise<IAssignment> {
        const assignment = await this._assignmentRepository.findById(id);
        if (!assignment) throw new Error('Assignment not found');

        const jobId = getObjectId(assignment.jobId);
        const job = await this._jobRepository.findById(jobId);

        if (!job) throw new Error('Job not found');

        const jobOwnerId = getObjectId(job.userId);
        if (jobOwnerId !== clientId) {
            throw new Error('Unauthorized: Only the job owner can report absence');
        }

        const startDate = new Date(assignment.schedule.startDate);
        if (new Date() < startDate) {
            throw new Error('Absence can only be reported after the job start time');
        }

        if ([WORK_STATUS.CANCELLED, WORK_STATUS.ABSENT, WORK_STATUS.COMPLETED].includes(assignment.workStatus)) {
            throw new Error(`Cannot report absence for an assignment that is already ${assignment.workStatus}`);
        }

        const updated = await this._assignmentRepository.updateById(id, {
            workStatus: WORK_STATUS.ABSENT,
            absence: {
                reportedBy: new Types.ObjectId(clientId),
                reportedAt: new Date(),
                notes,
                evidence
            }
        });

        if (!updated) throw new Error('Failed to update assignment');

        await this._workHistoryService.createFromAssignment(updated as unknown as Record<string, unknown>);

        const freelancerId = getObjectId(assignment.freelancerId);
        await this._handleJobReopening(getObjectId(updated.jobId), freelancerId);

        return updated;
    }

    private async _handleJobReopening(jobId: string, freelancerId: string): Promise<void> {
        const job = await this._jobRepository.findById(jobId);
        if (!job) return;

        if (job.visibility === 'private') {
            await this._jobRepository.findByConditionAndUpdate(
                { _id: jobId },
                {
                    $set: {
                        status: JOB_STATUS.CANCELLED,
                        acceptedFreelancers: 0,
                        hiredProviderId: null
                    }
                }
            );
            return;
        }

        const newAcceptedCount = Math.max(0, (job.acceptedFreelancers || 1) - 1);

        const updateData: Record<string, unknown> = {
            acceptedFreelancers: newAcceptedCount,
            status: newAcceptedCount === 0 ? JOB_STATUS.OPEN : JOB_STATUS.PARTIALLY_ASSIGNED
        };

        const hiredProviderId = job.hiredProviderId ? getObjectId(job.hiredProviderId) : null;
        if (hiredProviderId === freelancerId) {
            updateData.hiredProviderId = null;
        }

        await this._jobRepository.findByConditionAndUpdate({ _id: jobId }, { $set: updateData });
    }

    async markAsPaidByCash(id: string, clientId: string): Promise<IAssignment> {
        const assignment = await this._assignmentRepository.findById(id);
        if (!assignment) throw new Error('Assignment not found');

        const job = await this._jobRepository.findById(getObjectId(assignment.jobId));
        if (!job || getObjectId(job.userId) !== clientId) {
            throw new Error('Unauthorized: Only the job owner can mark as paid');
        }

        if (assignment.workStatus !== WORK_STATUS.COMPLETED) {
            throw new Error('Payment can only be marked after work is completed');
        }

        const updated = await this._assignmentRepository.updateById(id, {
            payment: {
                ...assignment.payment!,
                status: PAYMENT_STATUS.AWAITING_CONFIRMATION,
                method: PAYMENT_METHOD.CASH
            }
        });

        if (!updated) throw new Error('Failed to update assignment');

        await this._notificationService.createNotification({
            recipient: (assignment.freelancerId as { userId?: { _id?: { toString: () => string }; toString: () => string } }).userId?._id?.toString() || (assignment.freelancerId as { userId?: { _id?: { toString: () => string }; toString: () => string } }).userId?.toString() || '',
            title: 'Payment Marked as Paid',
            message: `The client has marked your work as paid by cash. Please confirm receipt.`,
            type: 'PAYMENT',
            link: `/provider/assignment/${id}`
        });

        return updated;
    }

    async confirmPayment(id: string, providerId: string): Promise<IAssignment> {
        const history = await this._workHistoryService.getByAssignmentId(id);
        if (history) {
            await this._paymentService.confirmCashPayment(history._id.toString(), providerId);
            const updated = await this._assignmentRepository.findById(id);
            return updated!;
        }

        const assignment = await this._assignmentRepository.findById(id);
        if (!assignment) throw new Error('Assignment not found');

        if (getObjectId(assignment.freelancerId) !== providerId) {
            throw new Error('Unauthorized: Only the assigned provider can confirm payment');
        }

        const updated = await this._assignmentRepository.updateById(id, {
            payment: {
                ...assignment.payment!,
                status: PAYMENT_STATUS.COMPLETED,
                paidAt: new Date()
            }
        });

        if (!updated) throw new Error('Failed to update assignment');

        return updated;
    }

    async providerMarkAsPaid(id: string, providerId: string): Promise<IAssignment> {
        const history = await this._workHistoryService.getByAssignmentId(id);
        if (history) {
            await this._paymentService.confirmCashPayment(history._id.toString(), providerId);
            const updated = await this._assignmentRepository.findById(id);
            return updated!;
        }

        const assignment = await this._assignmentRepository.findById(id);
        if (!assignment) throw new Error('Assignment not found');

        if (getObjectId(assignment.freelancerId) !== providerId) {
            throw new Error('Unauthorized: Only the assigned provider can mark as paid');
        }

        const updated = await this._assignmentRepository.updateById(id, {
            payment: {
                ...assignment.payment!,
                status: PAYMENT_STATUS.COMPLETED,
                method: PAYMENT_METHOD.CASH,
                paidAt: new Date()
            }
        });

        if (!updated) throw new Error('Failed to update assignment');

        const job = await this._jobRepository.findById(getObjectId(assignment.jobId));
        if (job) {
            await this._notificationService.createNotification({
                recipient: getObjectId(job.userId),
                title: 'Payment Confirmed by Provider',
                message: `The provider has confirmed receiving the payment in cash.`,
                type: 'PAYMENT',
                link: `/user/jobs/${getObjectId(assignment.jobId)}`
            });
        }

        return updated;
    }

    async rejectPayment(id: string, providerId: string): Promise<IAssignment> {
        const assignment = await this._assignmentRepository.findById(id);
        if (!assignment) throw new Error('Assignment not found');

        if (getObjectId(assignment.freelancerId) !== providerId) {
            throw new Error('Unauthorized: Only the assigned provider can reject payment');
        }

        const updated = await this._assignmentRepository.updateById(id, {
            payment: {
                ...assignment.payment!,
                status: PAYMENT_STATUS.PENDING,
                method: undefined
            }
        });

        if (!updated) throw new Error('Failed to update assignment');

        const job = await this._jobRepository.findById(getObjectId(assignment.jobId));
        if (job) {
            await this._notificationService.createNotification({
                recipient: getObjectId(job.userId),
                title: 'Payment Rejected by Provider',
                message: `The provider has rejected the cash payment confirmation. Payment is back to pending.`,
                type: 'PAYMENT',
                link: `/user/jobs/${getObjectId(assignment.jobId)}`
            });
        }

        return updated;
    }

    async getAssignmentByJobAndFreelancer(jobId: string, freelancerId: string): Promise<IAssignment | null> {
        return await this._assignmentRepository.findOne({ jobId, freelancerId, 'invite.status': ASSIGNMENT_STATUS.ACCEPTED });
    }
}
