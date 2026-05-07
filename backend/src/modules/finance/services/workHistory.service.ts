import { IWorkHistory, IWorkHistoryRepository, IWorkHistoryService } from '../interfaces/finance.interface';
import { IJobRepository } from '../../job/interfaces/job.interface';

export class WorkHistoryService implements IWorkHistoryService {
    private _workHistoryRepo: IWorkHistoryRepository;
    private _jobRepo: IJobRepository;

    constructor(
        workHistoryRepo: IWorkHistoryRepository,
        jobRepo: IJobRepository
    ) {
        this._workHistoryRepo = workHistoryRepo;
        this._jobRepo = jobRepo;
    }

    async createFromAssignment(assignment: any): Promise<IWorkHistory> {

        let clientId = assignment.clientId;
        if (!clientId && assignment.jobId) {
            if (assignment.jobId.userId) {

                clientId = assignment.jobId.userId._id || assignment.jobId.userId;
            } else {

                const job = await this._jobRepo.findById(assignment.jobId);
                if (job) clientId = job.userId;
            }
        }

        if (!clientId) {
            throw new Error('WorkHistory creation failed: clientId not found');
        }

        const totalAmount = assignment.payment?.amount || 0;
        const platformFee = totalAmount * 0.10;
        const providerAmount = totalAmount - platformFee;

        let finalStatus: 'COMPLETED' | 'CANCELLED' | 'ABSENT' = 'COMPLETED';
        if (assignment.workStatus === 'cancelled') finalStatus = 'CANCELLED';
        if (assignment.workStatus === 'absent') finalStatus = 'ABSENT';

        const workHistory = await this._workHistoryRepo.create({
            jobId: assignment.jobId?._id || assignment.jobId,
            clientId,
            providerId: assignment.freelancerId?._id || assignment.freelancerId,
            assignmentId: assignment._id,
            finalStatus,
            assignedAt: assignment.assignedAt,
            startedAt: assignment.startedAt,
            endedAt: assignment.completedAt || assignment.cancellation?.cancelledAt || assignment.absence?.reportedAt || new Date(),
            payment: {
                method: assignment.payment?.method === 'ONLINE' ? 'ONLINE' : 'CASH',
                totalAmount,
                platformFee,
                providerAmount,
                status: 'pending'
            }
        });

        return workHistory;
    }

    async getByProvider(providerId: string): Promise<IWorkHistory[]> {
        return await this._workHistoryRepo.getByProvider(providerId);
    }

    async getById(id: string): Promise<IWorkHistory | null> {
        return await this._workHistoryRepo.findById(id);
    }
}
