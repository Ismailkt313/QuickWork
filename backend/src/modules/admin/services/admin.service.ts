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
import { logger } from "../../../utils/logger";
import { INotificationService } from "../../notification/interfaces/notification.interface";


export class AdminService implements IAdminService {
    private readonly adminRepository: IAdminRepository;
    private readonly notificationService: INotificationService;

    constructor(adminRepository: IAdminRepository, notificationService: INotificationService) {
        this.adminRepository = adminRepository;
        this.notificationService = notificationService;
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
            data: users.map((user) => ({
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                isBlocked: user.isBlocked,
                createdAt: user.createdAt,
            })),
            pagination: {
                total,
                page: query.page,
                limit: query.limit,
                totalPages,
            },
        };
    }

    public async toggleBlockUser(userId: string): Promise<IApiResponse<{ isBlocked: boolean }>> {
        const user = await this.adminRepository.toggleBlockUser(userId);
        logger.info({ userId, action: user.isBlocked ? "user_blocked" : "user_unblocked" }, `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`);

        await this.notificationService.createNotification({
            recipient: userId,
            title: user.isBlocked ? 'Account Blocked' : 'Account Unblocked',
            message: user.isBlocked 
                ? 'Your account has been blocked by the administrator due to policy violations.' 
                : 'Your account has been unblocked. You can now use all platform features.',
            type: 'SYSTEM',
            link: '/user/profile'
        });

        return {
            success: true,
            message: user.isBlocked ? SuccessMessages.USER_BLOCKED : SuccessMessages.USER_UNBLOCKED,
            data: { isBlocked: user.isBlocked },
        };
    }

    
    public async getPendingProviders(query: IUserListQuery): Promise<IUserListResponse> {
        const [providers, total] = await Promise.all([
            this.adminRepository.getPendingProviders(query),
            this.adminRepository.getPendingProviderCount()
        ]);
        
        const totalPages = Math.ceil(total / query.limit);

        return {
            success: true,
            message: SuccessMessages.PENDING_PROVIDERS_FETCHED,
            data: providers.map((provider) => ({
                id: provider._id.toString(),
                name: provider.userId.name,
                email: provider.userId.email,
                role: ROLES.PROVIDER,
                isBlocked: false,
                createdAt: provider.createdAt,
            })),
            pagination: {
                total,
                page: query.page,
                limit: query.limit,
                totalPages,
            },
        };
    }

    public async approveProvider(providerId: string): Promise<IApiResponse<void>> {
        await this.adminRepository.approveProvider(providerId);
        logger.info({ providerId, action: "provider_approved" }, "Provider approved successfully");
        return {
            success: true,
            message: SuccessMessages.PROVIDER_APPROVED,
            data: undefined as unknown as void,
        };
    }


    public async rejectProvider(providerId: string, reason: string): Promise<IApiResponse<void>> {
        await this.adminRepository.rejectProvider(providerId, reason);
        logger.info({ providerId, reason, action: "provider_rejected" }, "Provider rejected successfully");
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
