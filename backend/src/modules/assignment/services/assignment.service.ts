import { IAssignment, IAssignmentRepository, IAssignmentService } from '../interfaces/assignment.interface';
import { ASSIGNMENT_STATUS, WORK_STATUS } from '../../../constants/assignment';

export class AssignmentService implements IAssignmentService {
    private assignmentRepository: IAssignmentRepository;

    constructor(assignmentRepository: IAssignmentRepository) {
        this.assignmentRepository = assignmentRepository;
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
        return await this.assignmentRepository.update(id, updateData);
    }

    async submitProof(id: string, proofData: { images: string[], description: string }): Promise<IAssignment | null> {
        return await this.assignmentRepository.update(id, {
            proof: proofData.images,
            proofDescription: proofData.description,
            workStatus: WORK_STATUS.COMPLETED,
            completedAt: new Date()
        });
    }

    async getAssignmentCountByJob(jobId: string): Promise<number> {
        return await this.assignmentRepository.count({
            jobId,
            workStatus: { $ne: WORK_STATUS.CANCELLED },
            'invite.status': ASSIGNMENT_STATUS.ACCEPTED
        });
    }
}
