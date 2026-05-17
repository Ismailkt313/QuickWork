import { IAdminRepository, IUserListQuery, IServiceProviderDetails } from "../interfaces/admin.interface";
import { IUser } from "../../auth/interfaces/auth.interface";
import { UserModel } from "../../auth/models/user.model";
import { AppError } from "../../../utils/AppError";
import { ServiceProviderModel } from "../../serviceProvider/models/serviceProvider.model";
import { IServiceProviderWithUser } from "../interfaces/admin.interface";
import { ROLES } from "../../../constants/roles";
import { VERIFICATION_STATUS } from "../../../constants/verification";
import { HttpStatusCode } from "../../../constants/httpStatusCode";

export class AdminRepository implements IAdminRepository {

    public async getUsers(query: IUserListQuery): Promise<IUser[]> {
        const filter = this._buildSearchFilter(query);
        const skip = (query.page - 1) * query.limit;

        return UserModel.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(query.limit);
    }

    public async getUserCount(query: IUserListQuery): Promise<number> {
        const filter = this._buildSearchFilter(query);
        return UserModel.countDocuments(filter);
    }

    private _buildSearchFilter(query: IUserListQuery): Record<string, unknown> {
        const filter: Record<string, unknown> = {};

        if (query.search && query.search.trim() !== "") {
            const regex = new RegExp(query.search.trim(), "i");
            filter.$or = [
                { name: { $regex: regex } },
                { email: { $regex: regex } },
            ];
        }

        if (query.role && query.role !== "") {
            filter.role = query.role;
        }

        if (query.isBlocked !== undefined) {
            filter.isBlocked = query.isBlocked;
        }

        return filter;
    }

    public async toggleBlockUser(userId: string): Promise<IUser> {
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new AppError("User not found", HttpStatusCode.NOT_FOUND);
        }
        user.isBlocked = !user.isBlocked;
        await user.save();
        return user;
    }
    public async getPendingProviders(query: IUserListQuery): Promise<IServiceProviderWithUser[]> {
        const skip = (query.page - 1) * query.limit;
        const filter: any = { 'verification.status': VERIFICATION_STATUS.PENDING };

        if (query.search && query.search.trim() !== "") {
            const regex = new RegExp(query.search.trim(), "i");
            const matchingUsers = await UserModel.find({
                $or: [{ name: { $regex: regex } }, { email: { $regex: regex } }]
            }).select('_id').lean();
            filter.userId = { $in: matchingUsers.map(u => u._id) };
        }

        return ServiceProviderModel.find(filter)
            .populate('userId', 'name email')
            .skip(skip)
            .limit(query.limit)
            .lean<IServiceProviderWithUser[]>();
    }

    public async getPendingProviderCount(query?: IUserListQuery): Promise<number> {
        const filter: any = { 'verification.status': VERIFICATION_STATUS.PENDING };

        if (query?.search && query.search.trim() !== "") {
            const regex = new RegExp(query.search.trim(), "i");
            const matchingUsers = await UserModel.find({
                $or: [{ name: { $regex: regex } }, { email: { $regex: regex } }]
            }).select('_id').lean();
            filter.userId = { $in: matchingUsers.map(u => u._id) };
        }

        return ServiceProviderModel.countDocuments(filter);
    }

    public async approveProvider(providerId: string): Promise<void> {
        const provider = await ServiceProviderModel.findById(providerId);
        if (!provider) {
            throw new AppError("Service provider not found", HttpStatusCode.NOT_FOUND);
        }

        if (provider.verification.status === VERIFICATION_STATUS.VERIFIED) {
            throw new AppError("Provider is already approved", HttpStatusCode.BAD_REQUEST);
        }

        provider.verification.status = VERIFICATION_STATUS.VERIFIED;
        provider.verification.verifiedAt = new Date();
        provider.isActive = true;
        await provider.save();

        await UserModel.findByIdAndUpdate(provider.userId, { role: ROLES.PROVIDER });
    }

    public async rejectProvider(providerId: string, reason: string): Promise<void> {
        const provider = await ServiceProviderModel.findById(providerId);
        if (!provider) {
            throw new AppError("Service provider not found", HttpStatusCode.NOT_FOUND);
        }

        if (provider.verification.status === VERIFICATION_STATUS.REJECTED) {
            throw new AppError("Provider is already rejected", HttpStatusCode.BAD_REQUEST);
        }

        provider.verification.status = VERIFICATION_STATUS.REJECTED;
        provider.verification.rejectionReason = reason;
        provider.isActive = false;
        await provider.save();
        await UserModel.findByIdAndUpdate(provider.userId, { role: ROLES.USER });

    }

    public async getProviderDetails(providerId: string): Promise<IServiceProviderDetails> {
        const provider = await ServiceProviderModel.findById(providerId)
            .populate('userId', 'name email phone')
            .populate('skills', 'name')
            .populate('location', 'name')
            .lean();

        if (!provider) {
            throw new AppError("Service provider not found", HttpStatusCode.NOT_FOUND);
        }

        return provider as unknown as IServiceProviderDetails;
    }

    public async getUserById(userId: string): Promise<IUser | null> {
        return UserModel.findById(userId);
    }

    public async getProviderByUserId(userId: string): Promise<IServiceProviderDetails | null> {
        const provider = await ServiceProviderModel.findOne({ userId })
            .populate('userId', 'name email phone')
            .populate('skills', 'name')
            .populate('location', 'name')
            .lean();

        if (!provider) return null;
        return provider as unknown as IServiceProviderDetails;
    }
}
