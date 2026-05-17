import { IServiceRequest } from '../interfaces/serviceRequest.interface';
import { ServiceRequestModel } from '../models/serviceRequest.model';
import { IServiceRequestRepository } from '../interfaces/serviceRequest.interface';
import { ClientSession } from 'mongoose';
import { BaseRepository } from '../../../shared/repositories/base.repository';

export class ServiceRequestRepository extends BaseRepository<IServiceRequest> implements IServiceRequestRepository {
    constructor() {
        super(ServiceRequestModel);
    }
    async findPendingByName(name: string): Promise<IServiceRequest | null> {
        return await ServiceRequestModel.findOne({
            name: name.toLowerCase().trim(),
            status: 'pending'
        });
    }


    async findByUser(userId: string): Promise<IServiceRequest[]> {
        return await ServiceRequestModel.find({ requestedBy: userId }).sort({ createdAt: -1 });
    }

    async findAllPending(page: number, limit: number, search?: string): Promise<IServiceRequest[]> {
        const skip = (page - 1) * limit;
        const query: any = { status: 'pending' };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        return await ServiceRequestModel.find(query)
            .populate('requestedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }

    async getPendingCount(search?: string): Promise<number> {
        const query: any = { status: 'pending' };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        return await ServiceRequestModel.countDocuments(query);
    }


    async updateStatus(id: string, updateData: Partial<IServiceRequest>, session?: ClientSession): Promise<IServiceRequest | null> {
        return await ServiceRequestModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, session }
        );
    }
}
