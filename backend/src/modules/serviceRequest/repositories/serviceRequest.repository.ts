import { IServiceRequest } from '../interfaces/serviceRequest.interface';
import { ServiceRequestModel } from '../models/serviceRequest.model';

export class ServiceRequestRepository {
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

    async findAllPending(): Promise<IServiceRequest[]> {
        return await ServiceRequestModel.find({ status: 'pending' }).populate('requestedBy', 'name email').sort({ createdAt: -1 });
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
