import { IAssignment, IAssignmentRepository, IAssignmentService } from '../interfaces/assignment.interface';

export class AssignmentService implements IAssignmentService {
    private assignmentRepository: IAssignmentRepository;

    constructor(assignmentRepository: IAssignmentRepository) {
        this.assignmentRepository = assignmentRepository;
    }

    async checkOverlap(freelancerId: string, startDate: Date, endDate: Date): Promise<boolean> {

        const query = {
            freelancerId,
            workStatus: { $in: ['assigned', 'in_progress'] },
            'invite.status': { $ne: 'rejected' },
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
            'invite.status': 'accepted',
            workStatus: { $in: ['assigned', 'in_progress', 'completed'] }
        });
    }

    async cancelAssignmentsByJob(jobId: string): Promise<void> {
        await this.assignmentRepository.updateByJobId(jobId, { workStatus: 'cancelled' });
    }

    async getAssignmentById(id: string): Promise<IAssignment | null> {
        return await this.assignmentRepository.findById(id);
    }

    async getAssignmentsByJobId(jobId: string): Promise<IAssignment[]> {
        return await this.assignmentRepository.find({ jobId, 'invite.status': 'accepted' });
    }

    async updateStatus(id: string, status: string): Promise<IAssignment | null> {
        const updateData: any = { workStatus: status };
        if (status === 'in_progress') {
            updateData.startedAt = new Date();
        } else if (status === 'completed') {
            updateData.completedAt = new Date();
        }
        return await this.assignmentRepository.update(id, updateData);
    }

    async submitProof(id: string, proofData: { images: string[], description: string }): Promise<IAssignment | null> {
        return await this.assignmentRepository.update(id, {
            proof: proofData.images,
            proofDescription: proofData.description,
            workStatus: 'completed',
            completedAt: new Date()
        });
    }

    async getAssignmentCountByJob(jobId: string): Promise<number> {
        return await this.assignmentRepository.count({
            jobId,
            workStatus: { $ne: 'cancelled' },
            'invite.status': 'accepted'
        });
    }
}
