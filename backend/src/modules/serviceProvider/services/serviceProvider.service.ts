import { Types } from 'mongoose';
import { IServiceProvider, IServiceProviderRepository, IServiceProviderService, ProviderListResult } from '../interfaces/serviceProvider.interface';
import { SubmitApplicationDTO } from '../dtos/submitApplication.dto';
import { SkillModel } from '../../skill/models/skill.model';
import { IAuthRepository } from '../../auth/interfaces/auth.interface';
import { generateAccessToken, generateRefreshToken } from '../../../utils/jwt.util';

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

export class ServiceProviderService implements IServiceProviderService {
    private providerRepository: IServiceProviderRepository;
    private authRepository: IAuthRepository;

    constructor(providerRepository: IServiceProviderRepository, authRepository: IAuthRepository) {
        this.providerRepository = providerRepository;
        this.authRepository = authRepository;
    }

    async submitApplication(userId: string, providerData: SubmitApplicationDTO): Promise<{ success: boolean; data?: any; message?: string }> {
        try {
            const existingProvider = await this.providerRepository.findByUserId(userId);
            console.log("Existing Provider:", existingProvider);``
            if (existingProvider) {
                return {
                    success: false,
                    message: 'Provider profile already exists'
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
                    status: 'pending'
                },
                isActive: false,
                submittedAt: new Date()
            };

            const createdProvider = await this.providerRepository.create(newProviderData);

            await this.authRepository.updateUserRole(userId, 'provider');

            const tokenPayload = {
                userId: userId,
                role: 'provider' as const
            };

            const accessToken = generateAccessToken(tokenPayload);
            const refreshToken = generateRefreshToken(tokenPayload);

            return {
                success: true,
                message: 'Provider application submitted successfully',
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
    }): Promise<{ success: boolean; message?: string; data?: ProviderListResult & { page: number; limit: number } }> {
        const { skillId, locationId } = params;
        if (!skillId) {
            return { success: false, message: 'skillId is required' };
        }

        const skillExists = await SkillModel.exists({ _id: skillId });
        if (!skillExists) {
            return { success: false, message: 'Skill not found' };
        }

        const page = Math.max(1, Number(params.page) || 1);
        const limit = Math.min(MAX_LIMIT, Math.max(1, Number(params.limit) || DEFAULT_LIMIT));

        const result = await this.providerRepository.findProviders({ skillId, locationId, page, limit });

        return { success: true, data: { ...result, page, limit } };
    }

    async getProviderById(id: string): Promise<{ success: boolean; data?: any; message?: string }> {
        const provider = await this.providerRepository.findById(id);
        if (!provider) {
            return { success: false, message: 'Provider not found' };
        }
        if (!provider.isActive || provider.verification?.status !== 'verified') {
            return { success: false, message: 'Provider is not available' };
        }
        return { success: true, data: provider };
    }
}
