import { IAuthRepository, IUser, ICreateUserData } from "../interfaces/auth.interface";
import { ROLES } from "../../../constants/roles";
import { UserModel } from "../models/user.model";

export class AuthRepository implements IAuthRepository {

    public async findByEmail(email: string): Promise<IUser | null> {
        return UserModel.findOne({ email });
    }

    public async findByEmailWithPassword(email: string): Promise<IUser | null> {
        return UserModel.findOne({ email }).select("+hashedPassword");
    }

    public async findById(id: string): Promise<IUser | null> {
        return UserModel.findById(id);
    }

    public async createUser(data: ICreateUserData): Promise<IUser> {
        const user = new UserModel(data);
        return user.save();
    }

    public async updatePassword(userId: string, hashedPassword: string): Promise<void> {
        await UserModel.findByIdAndUpdate(userId, { hashedPassword });
    }

    public async updateUserRole(userId: string, role: ROLES): Promise<void> {
        await UserModel.findByIdAndUpdate(userId, { role });
    }

    public async updateUser(userId: string, data: Partial<IUser>): Promise<IUser | null> {
        return UserModel.findByIdAndUpdate(userId, data, { new: true });
    }

    public async incrementWarningCount(userId: string): Promise<void> {
        await UserModel.findByIdAndUpdate(userId, { $inc: { warningCount: 1 } });
    }

    public async blockUser(userId: string): Promise<void> {
        await UserModel.findByIdAndUpdate(userId, { isBlocked: true });
    }
}

