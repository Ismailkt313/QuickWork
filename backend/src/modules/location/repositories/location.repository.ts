import { ILocation } from '../interfaces/location.interface';
import { LocationModel } from '../models/location.model';

export class LocationRepository {
    async findBySlug(slug: string): Promise<ILocation | null> {
        return await LocationModel.findOne({ slug });
    }

    async create(locationData: Partial<ILocation>): Promise<ILocation> {
        const location = new LocationModel(locationData);
        return await location.save();
    }
}
