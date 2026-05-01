import { IServiceRequest } from '../interfaces/serviceRequest.interface';
import { ServiceRequestModel } from '../models/serviceRequest.model';
import { IServiceRequestRepository } from '../interfaces/serviceRequest.interface';

export class ServiceRequestRepository implements IServiceRequestRepository {
    async findPendingByName(name: string): Promise<IServiceRequest | null> {
        return await ServiceRequestModel.findOne({
            name: name.toLowerCase().trim(),
            status: 'pending'
        });
    }

    async create(requestData: Partial<IServiceRequest>): Promise<IServiceRequest> {
        const request = new ServiceRequestModel(requestData);
        return await request.save();
    }

    async findByUser(userId: string): Promise<IServiceRequest[]> {
        return await ServiceRequestModel.find({ requestedBy: userId }).sort({ createdAt: -1 });
    }

    async findAllPending(page: number, limit: number): Promise<IServiceRequest[]> {
        const skip = (page - 1) * limit;
        return await ServiceRequestModel.find({ status: 'pending' })
            .populate('requestedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }

    async getPendingCount(): Promise<number> {
        return await ServiceRequestModel.countDocuments({ status: 'pending' });
    }

    async findById(id: string): Promise<IServiceRequest | null> {
        return await ServiceRequestModel.findById(id);
    }

    async updateStatus(id: string, updateData: Partial<IServiceRequest>, session?: any): Promise<IServiceRequest | null> {
        return await ServiceRequestModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, session }
        );
    }
}
