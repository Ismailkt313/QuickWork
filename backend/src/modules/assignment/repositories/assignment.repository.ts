import { IAssignment, IAssignmentRepository } from '../interfaces/assignment.interface';
import { AssignmentModel } from '../models/assignment.model';

export class AssignmentRepository implements IAssignmentRepository {
    async create(data: Partial<IAssignment>): Promise<IAssignment> {
        const assignment = new AssignmentModel(data);
        return await assignment.save();
    }

    async findById(id: string): Promise<IAssignment | null> {
        return await AssignmentModel.findById(id)
            .populate({
                path: 'jobId',
                populate: [
                    { path: 'userId', select: 'name email' },
                    { path: 'locationId', select: 'name' },
                    { path: 'skillId', select: 'name' }
                ]
            })
            .populate({
                path: 'freelancerId',
                populate: { path: 'userId', select: 'name email' }
            });
    }

    async findOne(query: any): Promise<IAssignment | null> {
        return await AssignmentModel.findOne(query);
    }

    async find(query: any): Promise<IAssignment[]> {
        return await AssignmentModel.find(query)
            .populate({
                path: 'jobId',
                populate: [
                    { path: 'userId', select: 'name email' },
                    { path: 'locationId', select: 'name' },
                    { path: 'skillId', select: 'name' }
                ]
            })
            .populate({
                path: 'freelancerId',
                populate: { path: 'userId', select: 'name email' }
            });
    }

    async update(id: string, data: Partial<IAssignment>): Promise<IAssignment | null> {
        return await AssignmentModel.findByIdAndUpdate(id, { $set: data }, { new: true });
    }

    async updateByJobId(jobId: string, data: Partial<IAssignment>): Promise<any> {
        return await AssignmentModel.updateMany({ jobId }, { $set: data });
    }


    async exists(query: any): Promise<boolean> {
        const result = await AssignmentModel.exists(query);
        return !!result;
    }

    async count(query: any): Promise<number> {
        return await AssignmentModel.countDocuments(query);
    }
}
