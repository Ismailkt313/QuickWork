import { IAdminRepository, IUserListQuery } from "../interfaces/admin.interface";
import { IUser } from "../../auth/interfaces/auth.interface";
import { UserModel } from "../../auth/models/user.model";
import { AppError } from "../../../utils/AppError";

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
}
