import { Types } from 'mongoose';
import { IServiceProvider } from '../interfaces/serviceProvider.interface';
import { ServiceProviderRepository } from '../repositories/serviceProvider.repository';
import { SubmitApplicationDTO } from '../dtos/submitApplication.dto';

export class ServiceProviderService {
    private providerRepository: ServiceProviderRepository;

    constructor(providerRepository: ServiceProviderRepository) {
        this.providerRepository = providerRepository;
    }

    async submitApplication(userId: string, providerData: SubmitApplicationDTO): Promise<{ success: boolean; data?: any; message?: string }> {
        try {
             const existingProvider = await this.providerRepository.findByUserId(userId);
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

            return {
                success: true,
                message: 'Provider application submitted successfully',
                data: {
                    providerId: createdProvider._id
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to submit application: ${error.message}`);
        }
    }
}
