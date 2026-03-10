import { ILoactionresponse, ILocation, ILocationRepository } from '../interfaces/location.interface';
import { LocationModel } from '../models/location.model';

export class LocationRepository implements ILocationRepository {
    async findBySlug(slug: string): Promise<ILocation | null> {
        return await LocationModel.findOne({ slug });
    }

    async create(locationData: Partial<ILocation>): Promise<ILocation> {
        const location = new LocationModel(locationData);
        return await location.save();
    }
    async searchByName(query: string): Promise<ILocation[]> {
        return await LocationModel.find({ name: { $regex: query, $options: 'i' } }).limit(5);
    }
    async getAllLocations(): Promise<ILocation[]> {
        return await LocationModel.find({});
    }
    async getfullLocations(): Promise<ILoactionresponse[] | null> {
        const locations = await LocationModel.find({});
        if (!locations.length) return null;
        return locations.map(loc => ({
            id: loc._id.toString(),
            name: loc.name,
            lat: loc.lat,
            lon: loc.lon
        }));
    }
}
