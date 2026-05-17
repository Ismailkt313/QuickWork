import { IAuthRepository, IUser, ICreateUserData } from "../interfaces/auth.interface";
import { ROLES } from "../../../constants/roles";
import { UserModel } from "../models/user.model";
import { BaseRepository } from "../../../shared/repositories/base.repository";

export class AuthRepository extends BaseRepository<IUser> implements IAuthRepository {
    constructor() {
        super(UserModel);
    }

    public async findByEmail(email: string): Promise<IUser | null> {
        return UserModel.findOne({ email });
    }

    public async findByEmailWithPassword(email: string): Promise<IUser | null> {
        return UserModel.findOne({ email }).select("+hashedPassword");
    }

    public async updatePassword(userId: string, hashedPassword: string): Promise<void> {
        await UserModel.findByIdAndUpdate(userId, { hashedPassword });
    }

    public async updateUserRole(userId: string, role: ROLES): Promise<void> {
        await UserModel.findByIdAndUpdate(userId, { role });
    }

    public async incrementWarningCount(userId: string): Promise<void> {
        await UserModel.findByIdAndUpdate(userId, { $inc: { warningCount: 1 } });
    }

    public async blockUser(userId: string): Promise<void> {
        await UserModel.findByIdAndUpdate(userId, { isBlocked: true });
    }

    public async countTotalUsers(): Promise<number> {
        return UserModel.countDocuments();
    }

    public async getRecentUsers(limit: number): Promise<IUser[]> {
        return UserModel.find().sort({ createdAt: -1 }).limit(limit);
    }

    public async getUserGrowth(): Promise<{ _id: string; count: number }[]> {
        return UserModel.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);
    }
}

