import { Types } from 'mongoose';
import { IServiceProvider, IServiceProviderRepository, IServiceProviderService, ProviderListResult } from '../interfaces/serviceProvider.interface';
import { SubmitApplicationDTO } from '../dtos/submitApplication.dto';
import { ISkillRepository } from '../../skill/interfaces/skill.interface';
import { IAuthRepository } from '../../auth/interfaces/auth.interface';
import { generateAccessToken, generateRefreshToken } from '../../../utils/jwt.util';
import { ROLES } from '../../../constants/roles';
import { VERIFICATION_STATUS } from '../../../constants/verification';
import { SuccessMessages } from '../../../constants/messages/successMessages';
import { ErrorMessages } from '../../../constants/messages/errorMessages';

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

export class ServiceProviderService implements IServiceProviderService {
    private _providerRepository: IServiceProviderRepository;
    private _authRepository: IAuthRepository;
    private _skillRepository: ISkillRepository;

    constructor(providerRepository: IServiceProviderRepository, authRepository: IAuthRepository, skillRepository: ISkillRepository) {
        this._providerRepository = providerRepository;
        this._authRepository = authRepository;
        this._skillRepository = skillRepository;
    }

    async submitApplication(userId: string, providerData: SubmitApplicationDTO): Promise<{ success: boolean; data?: any; message?: string }> {
        try {
            const existingProvider = await this._providerRepository.findByUserId(userId);
            if (existingProvider) {
                return {
                    success: false,
                    message: ErrorMessages.RESOURCE_ALREADY_EXISTS 
                };
            }

            const newProviderData: Partial<IServiceProvider> = {
                userId: new Types.ObjectId(userId),
                headline: providerData.headline,
                about: providerData.about,
                profileImage: providerData.profileImage,
                skills: providerData.skills.map(id => new Types.ObjectId(id)),
                yearsOfExperience: providerData.yearsOfExperience,
                hourlyRate: providerData.hourlyRate,
                location: providerData.location,
                portfolio: providerData.portfolio,
                verification: {
                    status: VERIFICATION_STATUS.PENDING 
                },
                isActive: false, 
                submittedAt: new Date()
            };

            const createdProvider = await this._providerRepository.create(newProviderData);

            await this._authRepository.updateUserRole(userId, ROLES.PROVIDER);

            const tokenPayload = {
                userId: userId,
                role: ROLES.PROVIDER
            };

            const accessToken = generateAccessToken(tokenPayload);
            const refreshToken = generateRefreshToken(tokenPayload);

            return {
                success: true,
                message: SuccessMessages.PROVIDER_APPLICATION_SUBMITTED,
                data: {
                    providerId: createdProvider._id.toString(),
                    accessToken,
                    refreshToken
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to submit application: ${error.message}`);
        }
    }

    async getProviders(params: {
        skillId?: string;
        locationId?: string;
        page?: number;
        limit?: number;
        search?: string;
        sort?: string;
    }): Promise<{ success: boolean; message?: string; data?: ProviderListResult & { page: number; limit: number } }> {
        const { skillId, locationId, search, sort } = params;

        if (skillId) {
            const skillExists = await this._skillRepository.findById(skillId);
            if (!skillExists) {
                return { success: false, message: ErrorMessages.SKILL_NOT_FOUND };
            }
        }

        const page = Math.max(1, Number(params.page) || 1);
        const limit = Math.min(MAX_LIMIT, Math.max(1, Number(params.limit) || DEFAULT_LIMIT));

        const result = await this._providerRepository.findProviders({ skillId, locationId, page, limit, search, sort });

        return { success: true, data: { ...result, page, limit } };
    }

    async getProviderById(id: string): Promise<{ success: boolean; data?: any; message?: string }> {
        const provider = await this._providerRepository.findById(id);
        if (!provider) {
            return { success: false, message: ErrorMessages.PROVIDER_NOT_FOUND };
        }
        if (!provider.isActive || provider.verification?.status !== VERIFICATION_STATUS.VERIFIED) {
            return { success: false, message: ErrorMessages.PROVIDER_NOT_AVAILABLE };
        }
        return { success: true, data: provider };
    }

    async getMyProfile(userId: string): Promise<{ success: boolean; data?: any; message?: string }> {
        const provider = await this._providerRepository.findByUserId(userId);
        if (!provider) {
            return { success: false, message: ErrorMessages.PROVIDER_NOT_FOUND };
        }
        return { success: true, data: provider };
    }

    async updateProfile(userId: string, data: any): Promise<{ success: boolean; data?: any; message?: string }> {
        const updateData = { ...data };
        
        if (updateData.skills && Array.isArray(updateData.skills)) {
            updateData.skills = updateData.skills.map((id: string) => new Types.ObjectId(id));
        }

        const updatedProvider = await this._providerRepository.updateByUserId(userId, updateData);
        
        if (!updatedProvider) {
            return { success: false, message: ErrorMessages.INTERNAL_SERVER_ERROR };
        }

        return { success: true, data: updatedProvider, message: SuccessMessages.PROFILE_UPDATED };
    }

    async resetApplication(userId: string): Promise<{ success: boolean; message: string }> {
        const provider = await this._providerRepository.findByUserId(userId);
        if (!provider) {
            return { success: false, message: ErrorMessages.PROVIDER_NOT_FOUND };
        }

        if (provider.verification.status !== VERIFICATION_STATUS.REJECTED) {
            return { success: false, message: ErrorMessages.RESET_NOT_ALLOWED };
        }

        await this._providerRepository.deleteByUserId(userId);
        return { success: true, message: SuccessMessages.APPLICATION_RESET };
    }
}
