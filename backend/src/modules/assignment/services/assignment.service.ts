import { IAssignment, IAssignmentRepository, IAssignmentService } from '../interfaces/assignment.interface';
import { ASSIGNMENT_STATUS, WORK_STATUS } from '../../../constants/assignment';
import { IJobRepository } from '../../job/interfaces/job.interface';
import { JOB_STATUS } from '../../../constants/jobStatus';

export class AssignmentService implements IAssignmentService {
    private assignmentRepository: IAssignmentRepository;
    private jobRepository: IJobRepository;

    constructor(
        assignmentRepository: IAssignmentRepository,
        jobRepository: IJobRepository
    ) {
        this.assignmentRepository = assignmentRepository;
        this.jobRepository = jobRepository;
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

    async getAssignmentsByProvider(providerId: string): Promise<IAssignment[]> {
        return await this.assignmentRepository.find({
            freelancerId: providerId,
            'invite.status': ASSIGNMENT_STATUS.ACCEPTED,
            workStatus: { $in: [WORK_STATUS.ASSIGNED, WORK_STATUS.IN_PROGRESS, WORK_STATUS.COMPLETED] }
        });
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
            const jobId = updated.jobId?._id ? updated.jobId._id.toString() : updated.jobId.toString();
            await this.checkAndCompleteJob(jobId);
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
            const jobId = updated.jobId?._id ? updated.jobId._id.toString() : updated.jobId.toString();
            await this.checkAndCompleteJob(jobId);
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
        console.log(`Checking auto-completion for job: ${jobId}`);
        const job = await this.jobRepository.findById(jobId);
        if (!job) return;

        if (job.status === JOB_STATUS.COMPLETED || job.status === JOB_STATUS.CANCELLED) return;

        const allAssignments = await this.assignmentRepository.find({ 
            jobId, 
            'invite.status': ASSIGNMENT_STATUS.ACCEPTED 
        });

        const completedCount = allAssignments.filter(a => a.workStatus === WORK_STATUS.COMPLETED).length;

        console.log(`Job status check: ${completedCount}/${job.freelancersNeeded} providers completed.`);

        if (completedCount >= job.freelancersNeeded) {
            console.log(`Auto-completing job ${jobId} as all providers finished.`);
            await this.jobRepository.updateStatus(jobId, JOB_STATUS.COMPLETED);
        }
    }
}
