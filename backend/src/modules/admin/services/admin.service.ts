import {
    IAdminService,
    IAdminRepository,
    IUserListQuery,
    IUserListResponse,
    IServiceProviderDetails,
} from "../interfaces/admin.interface";
import { ROLES } from "../../../constants/roles";
import { SuccessMessages } from "../../../constants/messages/successMessages";
import { ErrorMessages } from "../../../constants/messages/errorMessages";
import { IApiResponse } from "../../../types/api.types";
import { IUser } from "../../auth/interfaces/auth.interface";

export class AdminService implements IAdminService {
    private readonly adminRepository: IAdminRepository;

    constructor(adminRepository: IAdminRepository) {
        this.adminRepository = adminRepository;
    }

    public async getUsers(query: IUserListQuery): Promise<IUserListResponse> {
        const [users, total] = await Promise.all([
            this.adminRepository.getUsers(query),
            this.adminRepository.getUserCount(query.search),
        ]);

        const totalPages = Math.ceil(total / query.limit);

        return {
            success: true,
            message: SuccessMessages.USERS_FETCHED,
            data: {
                users: users.map((user) => ({
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isBlocked: user.isBlocked,
                    createdAt: user.createdAt,
                })),
                total,
                page: query.page,
                limit: query.limit,
                totalPages,
            },
        };
    }

    public async toggleBlockUser(userId: string): Promise<IApiResponse<{ isBlocked: boolean }>> {
        const user = await this.adminRepository.toggleBlockUser(userId);
        return {
            success: true,
            message: user.isBlocked ? SuccessMessages.USER_BLOCKED : SuccessMessages.USER_UNBLOCKED,
            data: { isBlocked: user.isBlocked },
        };
    }
    
    public async getPendingProviders(): Promise<IUserListResponse> {
        const providers = await this.adminRepository.getPendingProviders();
        return {
            success: true,
            message: SuccessMessages.PENDING_PROVIDERS_FETCHED,
            data: {
                users: providers.map((provider) => ({
                    id: provider._id.toString(),
                    name: provider.userId.name,
                    email: provider.userId.email,
                    role: ROLES.PROVIDER,
                    isBlocked: false,
                    createdAt: provider.createdAt,
                })),
                total: providers.length,
                page: 1,
                limit: providers.length,
                totalPages: 1,
            },
        };
    }

    public async approveProvider(providerId: string): Promise<IApiResponse<void>> {
        await this.adminRepository.approveProvider(providerId);
        return {
            success: true,
            message: SuccessMessages.PROVIDER_APPROVED,
            data: undefined as unknown as void,
        };
    }

    public async rejectProvider(providerId: string, reason: string): Promise<IApiResponse<void>> {
        await this.adminRepository.rejectProvider(providerId, reason);
        return {
            success: true,
            message: SuccessMessages.PROVIDER_REJECTED,
            data: undefined as unknown as void,
        };
    }

    public async getProviderDetails(providerId: string): Promise<IApiResponse<IServiceProviderDetails>> {
        const provider = await this.adminRepository.getProviderDetails(providerId);
        return {
            success: true,
            message: SuccessMessages.PROVIDER_DETAILS_FETCHED || "Provider details fetched successfully",
            data: provider,
        };
    }

    public async getUserById(userId: string): Promise<IApiResponse<IUser>> {
        const user = await this.adminRepository.getUserById(userId);
        if (!user) {
            throw new Error(ErrorMessages.USER_NOT_FOUND);
        }
        return {
            success: true,
            message: SuccessMessages.USER_FETCHED || "User fetched successfully",
            data: user,
        };
    }
}
