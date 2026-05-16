import { Types } from 'mongoose';
import { IServiceProvider, IServiceProviderRepository, ProviderFilter, ProviderListResult, IAvailability, IBlockedDate } from '../interfaces/serviceProvider.interface';
import { ServiceProviderModel } from '../models/serviceProvider.model';
import { UserModel } from '../../auth/models/user.model';
import { VERIFICATION_STATUS } from '../../../constants/verification';

export class ServiceProviderRepository implements IServiceProviderRepository {
    async findByUserId(userId: string): Promise<IServiceProvider | null> {
        const res = await ServiceProviderModel.findOne({ userId })
            .populate('userId skills', 'name email profileImage')
            .lean() as unknown as IServiceProvider | null;
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
        const { skillId, locationId, page, limit, search, sort, currentUserId } = filter;
        const skip = (page - 1) * limit;

        const query: Record<string, unknown> = {
            isActive: true,
            'verification.status': VERIFICATION_STATUS.VERIFIED,
        };

        if (currentUserId) {
            query.userId = { $ne: new Types.ObjectId(currentUserId) };
        }

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

        let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
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

    async findById(id: string): Promise<IServiceProvider | null> {
        return await ServiceProviderModel.findById(id)
            .populate('userId', 'name email profileImage')
            .populate('skills', 'name slug')
            .lean() as unknown as IServiceProvider | null;
    }

    async updateByUserId(userId: string, data: Partial<IServiceProvider>): Promise<IServiceProvider | null> {
        return await ServiceProviderModel.findOneAndUpdate(
            { userId: new Types.ObjectId(userId) },
            { $set: data },
            { new: true, runValidators: true }
        ).populate('userId', 'name email profileImage')
            .populate('skills', 'name slug')
            .lean() as unknown as IServiceProvider | null;
    }
    async deleteByUserId(userId: string): Promise<void> {
        await ServiceProviderModel.deleteOne({ userId: new Types.ObjectId(userId) });
    }

    async updateAvailability(userId: string, availability: IAvailability[]): Promise<IServiceProvider | null> {
        return await ServiceProviderModel.findOneAndUpdate(
            { userId: new Types.ObjectId(userId) },
            { $set: { availability } },
            { new: true, runValidators: true }
        ).lean() as unknown as IServiceProvider | null;
    }

    async addBlockedDate(userId: string, blockedDate: IBlockedDate): Promise<IServiceProvider | null> {
        return await ServiceProviderModel.findOneAndUpdate(
            { userId: new Types.ObjectId(userId) },
            { $push: { blockedDates: blockedDate } },
            { new: true, runValidators: true }
        ).lean() as unknown as IServiceProvider | null;
    }

    async deleteBlockedDate(userId: string, blockedDateId: string): Promise<IServiceProvider | null> {
        return await ServiceProviderModel.findOneAndUpdate(
            { userId: new Types.ObjectId(userId) },
            { $pull: { blockedDates: { _id: new Types.ObjectId(blockedDateId) } } },
            { new: true }
        ).lean() as unknown as IServiceProvider | null;
    }

    async countTotalProviders(): Promise<number> {
        return ServiceProviderModel.countDocuments();
    }

    async countPendingApprovals(): Promise<number> {
        return ServiceProviderModel.countDocuments({
            'verification.status': VERIFICATION_STATUS.PENDING
        });
    }

    async getRecentProviders(limit: number): Promise<IServiceProvider[]> {
        return ServiceProviderModel.find()
            .populate('userId', 'name profileImage')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean() as unknown as IServiceProvider[];
    }

    async getProviderGrowth(): Promise<{ _id: string; count: number }[]> {
        return ServiceProviderModel.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]) as unknown as Promise<{ _id: string; count: number }[]>;
    }
}
