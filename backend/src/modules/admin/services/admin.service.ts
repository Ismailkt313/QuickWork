import {
    IAdminService,
    IAdminRepository,
    IUserListQuery,
    IUserListResponse,
    IServiceProviderDetails,
    IUserWithProviderProfile,
} from "../interfaces/admin.interface";
import { ROLES } from "../../../constants/roles";
import { SuccessMessages } from "../../../constants/messages/successMessages";
import { ErrorMessages } from "../../../constants/messages/errorMessages";
import { IApiResponse } from "../../../types/api.types";
import { ILogger } from "../../../shared/interfaces/ILogger";
import { INotificationService } from "../../notification/interfaces/notification.interface";
import { getIo } from "../../../chat/socket";

export class AdminService implements IAdminService {
    private readonly _adminRepository: IAdminRepository;
    private readonly _notificationService: INotificationService;
    private readonly _logger: ILogger;

    constructor(adminRepository: IAdminRepository, notificationService: INotificationService, logger: ILogger) {
        this._adminRepository = adminRepository;
        this._notificationService = notificationService;
        this._logger = logger;
    }

    public async getUsers(query: IUserListQuery): Promise<IUserListResponse> {
        const [users, total] = await Promise.all([
            this._adminRepository.getUsers(query),
            this._adminRepository.getUserCount(query),
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
        const user = await this._adminRepository.toggleBlockUser(userId);
        if (user.isBlocked) {
            this._logger.info("User Blocked", { userId });
        } else {
            this._logger.info("User Unblocked", { userId });
        }

        await this._notificationService.createNotification({
            recipient: userId,
            title: user.isBlocked ? 'Account Blocked' : 'Account Unblocked',
            message: user.isBlocked
                ? 'Your account has been blocked by the administrator due to policy violations.'
                : 'Your account has been unblocked. You can now use all platform features.',
            type: 'SYSTEM',
            link: '/user/profile'
        });

        if (user.isBlocked) {
            const io = getIo();
            if (io) {
                io.to(userId).emit('user_blocked');
            }
        }

        return {
            success: true,
            message: user.isBlocked ? SuccessMessages.USER_BLOCKED : SuccessMessages.USER_UNBLOCKED,
            data: { isBlocked: user.isBlocked },
        };
    }

    public async getPendingProviders(query: IUserListQuery): Promise<IUserListResponse> {
        const [providers, total] = await Promise.all([
            this._adminRepository.getPendingProviders(query),
            this._adminRepository.getPendingProviderCount(query)
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
        await this._adminRepository.approveProvider(providerId);
        this._logger.info("Provider Approved", { providerId });
        return {
            success: true,
            message: SuccessMessages.PROVIDER_APPROVED,
            data: undefined as unknown as void,
        };
    }

    public async rejectProvider(providerId: string, reason: string): Promise<IApiResponse<void>> {
        await this._adminRepository.rejectProvider(providerId, reason);
        this._logger.info("Provider Rejected", { providerId, reason });
        return {
            success: true,
            message: SuccessMessages.PROVIDER_REJECTED,
            data: undefined as unknown as void,
        };
    }

    public async getProviderDetails(providerId: string): Promise<IApiResponse<IServiceProviderDetails>> {
        const provider = await this._adminRepository.getProviderDetails(providerId);
        return {
            success: true,
            message: SuccessMessages.PROVIDER_DETAILS_FETCHED || "Provider details fetched successfully",
            data: provider,
        };
    }

    public async getUserById(userId: string): Promise<IApiResponse<IUserWithProviderProfile>> {
        const user = await this._adminRepository.getUserById(userId);
        if (!user) {
            throw new Error(ErrorMessages.USER_NOT_FOUND);
        }

        // If user is a provider, also fetch their provider profile
        let providerProfile: IServiceProviderDetails | null = null;
        if (user.role === ROLES.PROVIDER) {
            providerProfile = await this._adminRepository.getProviderByUserId(userId);
        }

        return {
            success: true,
            message: SuccessMessages.USER_FETCHED || "User fetched successfully",
            data: { user, providerProfile },
        };
    }
}
