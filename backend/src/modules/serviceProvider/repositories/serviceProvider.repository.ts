import { IServiceProvider } from '../interfaces/serviceProvider.interface';
import { ServiceProviderModel } from '../models/serviceProvider.model';

export class ServiceProviderRepository {
    async findByUserId(userId: string): Promise<IServiceProvider | null> {
        return await ServiceProviderModel.findOne({ userId });
    }

    async create(providerData: Partial<IServiceProvider>): Promise<IServiceProvider> {
        const provider = new ServiceProviderModel(providerData);
        return await provider.save();
    }
}
