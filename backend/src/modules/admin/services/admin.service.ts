import {
    IAdminService,
    IAdminRepository,
    IUserListQuery,
    IUserListResponse,
} from "../interfaces/admin.interface";

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
            message: "Users fetched successfully",
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

    public async toggleBlockUser(userId: string): Promise<{ success: boolean; message: string; data: { isBlocked: boolean } }> {
        const user = await this.adminRepository.toggleBlockUser(userId);
        return {
            success: true,
            message: user.isBlocked ? "User blocked successfully" : "User unblocked successfully",
            data: { isBlocked: user.isBlocked },
        };
    }
    
    public async getPendingProviders(): Promise<IUserListResponse> {
        const providers = await this.adminRepository.getPendingProviders();
        return {
            success: true,
            message: "Pending providers fetched successfully",
            data: {
                users: providers.map((provider) => ({
                    id: provider._id.toString(),
                    name: provider.userId.name,
                    email: provider.userId.email,
                    role: "provider",
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

    public async approveProvider(providerId: string): Promise<{ success: boolean; message: string }> {
        await this.adminRepository.approveProvider(providerId);
        return {
            success: true,
            message: "Provider approved successfully",
        };
    }

    public async rejectProvider(providerId: string, reason: string): Promise<{ success: boolean; message: string }> {
        await this.adminRepository.rejectProvider(providerId, reason);
        return {
            success: true,
            message: "Provider rejected successfully",
        };
    }
}
