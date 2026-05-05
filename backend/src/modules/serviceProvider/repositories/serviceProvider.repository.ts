import { Types } from 'mongoose';
import { IServiceProvider, IServiceProviderRepository, ProviderFilter, ProviderListResult } from '../interfaces/serviceProvider.interface';
import { ServiceProviderModel } from '../models/serviceProvider.model';
import { UserModel } from '../../auth/models/user.model';
import { VERIFICATION_STATUS } from '../../../constants/verification';

export class ServiceProviderRepository implements IServiceProviderRepository {
    async findByUserId(userId: string): Promise<any> {
        const res = await ServiceProviderModel.findOne({ userId })
            .populate('userId skills', 'name email profileImage')
            .lean() as any;
            return res
    }

    async create(providerData: Partial<IServiceProvider>): Promise<IServiceProvider> {
        const provider = new ServiceProviderModel(providerData);
        await UserModel.findByIdAndUpdate(provider.userId, { role: 'provider' });
        return await provider.save();
    }

    async addSkillToProvider(providerId: string, skillId: string) {
        return ServiceProviderModel.updateOne(
            { userId: providerId },
            { $addToSet: { skills: skillId } }
        );
    }

    async findProviders(filter: ProviderFilter): Promise<ProviderListResult> {
        const { skillId, locationId, page, limit, search, sort } = filter;
        const skip = (page - 1) * limit;

        const query: Record<string, any> = {
            isActive: true,
            'verification.status': VERIFICATION_STATUS.VERIFIED,
        };

        if (skillId) {
            query.skills = new Types.ObjectId(skillId);
        }

        if (locationId) {
            query['location.id'] = locationId;
        }

        if (search) {
            query.$or = [
                { headline: { $regex: search, $options: 'i' } },
                { about: { $regex: search, $options: 'i' } }
            ];
        }

        let sortOption: any = { createdAt: -1 }; // Default
        if (sort === 'price_low') sortOption = { hourlyRate: 1 };
        if (sort === 'price_high') sortOption = { hourlyRate: -1 };
        if (sort === 'experience') sortOption = { yearsOfExperience: -1 };

        const [providers, total] = await Promise.all([
            ServiceProviderModel.find(query)
                .select('_id headline profileImage hourlyRate yearsOfExperience location')
                .sort(sortOption)
                .skip(skip)
                .limit(limit)
                .lean(),
            ServiceProviderModel.countDocuments(query),
        ]);
        return {
            providers: providers.map((p) => ({
                id: (p._id as Types.ObjectId).toString(),
                headline: p.headline,
                profileImage: p.profileImage,
                hourlyRate: p.hourlyRate,
                yearsOfExperience: p.yearsOfExperience, 
                location: p.location,
            })),
            total,
        };
    }

    async findById(id: string): Promise<any> {
        return await ServiceProviderModel.findById(id)
            .populate('userId', 'name email profileImage')
            .populate('skills', 'name slug')
            .lean() as any;
    }

    async updateByUserId(userId: string, data: any): Promise<any> {
        return await ServiceProviderModel.findOneAndUpdate(
            { userId: new Types.ObjectId(userId) },
            { $set: data },
            { new: true, runValidators: true }
        ).populate('userId', 'name email profileImage')
         .populate('skills', 'name slug')
         .lean();
    }
    async deleteByUserId(userId: string): Promise<void> {
        await ServiceProviderModel.deleteOne({ userId: new Types.ObjectId(userId) });
    }
}
