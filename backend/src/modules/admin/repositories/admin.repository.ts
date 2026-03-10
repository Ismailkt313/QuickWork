import { IAdminRepository, IUserListQuery } from "../interfaces/admin.interface";
import { IUser } from "../../auth/interfaces/auth.interface";
import { UserModel } from "../../auth/models/user.model";
import { AppError } from "../../../utils/AppError";
import { ServiceProviderModel } from "../../serviceProvider/models/serviceProvider.model";
import { IServiceProviderWithUser } from "../interfaces/admin.interface";

export class AdminRepository implements IAdminRepository {

    public async getUsers(query: IUserListQuery): Promise<IUser[]> {
        const filter = this.buildSearchFilter(query.search);
        const skip = (query.page - 1) * query.limit;

        return UserModel.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(query.limit);
    }

    public async getUserCount(search?: string): Promise<number> {
        const filter = this.buildSearchFilter(search);
        return UserModel.countDocuments(filter);
    }

    private buildSearchFilter(search?: string): Record<string, unknown> {
        if (!search || search.trim() === "") {
            return {};
        }

        const regex = new RegExp(search.trim(), "i");
        return {
            $or: [
                { name: { $regex: regex } },
                { email: { $regex: regex } },
            ],
        };
    }

    public async toggleBlockUser(userId: string): Promise<IUser> {
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new AppError("User not found", 404);
        }
        user.isBlocked = !user.isBlocked;
        await user.save();
        return user;
    }
    public async getPendingProviders(): Promise<IServiceProviderWithUser[]> {
        return ServiceProviderModel.find({ 'verification.status': 'pending' })
            .populate('userId', 'name email')
            .lean<IServiceProviderWithUser[]>();
    }

    public async approveProvider(providerId: string): Promise<void> {
        const provider = await ServiceProviderModel.findById(providerId);
        if (!provider) {
            throw new AppError("Service provider not found", 404);
        }

        if (provider.verification.status === 'verified') {
            throw new AppError("Provider is already approved", 400);
        }

        provider.verification.status = 'verified';
        provider.verification.verifiedAt = new Date();
        provider.isActive = true;
        await provider.save();

        await UserModel.findByIdAndUpdate(provider.userId, { role: 'provider' });
    }

    public async rejectProvider(providerId: string, reason: string): Promise<void> {
        const provider = await ServiceProviderModel.findById(providerId);
        if (!provider) {
            throw new AppError("Service provider not found", 404);
        }

        if (provider.verification.status === 'rejected') {
            throw new AppError("Provider is already rejected", 400);
        }

        provider.verification.status = 'rejected';
        provider.verification.rejectionReason = reason;
        provider.isActive = false;
        await provider.save();
    }
}
