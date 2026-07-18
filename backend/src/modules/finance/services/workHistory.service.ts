import { IWorkHistory, IWorkHistoryRepository, IWorkHistoryService } from '../interfaces/finance.interface';
import { IJobRepository } from '../../job/interfaces/job.interface';
import { jobRepository } from '../../job';

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

    private get jobRepo(): IJobRepository {
        return this._jobRepo || jobRepository;
    }

    async createFromAssignment(assignment: {
        _id?: unknown;
        clientId?: unknown;
        jobId?: { userId?: { _id?: unknown; toString?: () => string }; _id?: unknown; toString?: () => string };
        payment?: { amount?: number; method?: string };
        workStatus?: string;
        freelancerId?: { _id?: unknown; toString?: () => string };
        assignedAt?: Date;
        startedAt?: Date;
        completedAt?: Date;
        cancellation?: { cancelledAt?: Date };
        absence?: { reportedAt?: Date };
    }): Promise<IWorkHistory> {

        let clientId = assignment.clientId;
        if (!clientId && assignment.jobId) {
            if (assignment.jobId.userId) {

                clientId = assignment.jobId.userId._id || assignment.jobId.userId;
            } else {

                const job = await this.jobRepo.findById(assignment.jobId as string);
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

        const existing = await this._workHistoryRepo.findByAssignmentId(assignment._id as string);
        if (existing) {
            existing.finalStatus = finalStatus;
            existing.endedAt = assignment.completedAt || assignment.cancellation?.cancelledAt || assignment.absence?.reportedAt || new Date();
            return await this._workHistoryRepo.save(existing);
        }

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

    async getByAssignmentId(assignmentId: string): Promise<IWorkHistory | null> {
        return await this._workHistoryRepo.findByAssignmentId(assignmentId);
    }

    async getProviderHistory(providerId: string, status?: string, page?: number, limit?: number): Promise<{ history: IWorkHistory[], total: number }> {
        const skip = ((page || 1) - 1) * (limit || 10);
        const [history, total] = await this._workHistoryRepo.findProviderHistory(providerId, status, skip, limit || 10);
        return { history, total };
    }
}

