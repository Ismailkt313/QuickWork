import { ILoactionresponse, ILocation, ILocationRepository } from '../interfaces/location.interface';
import { LocationModel } from '../models/location.model';

export class LocationRepository implements ILocationRepository {
    async getAllLocations(): Promise<ILocation[]> {
        return await LocationModel.find({});
    }
    async getfullLocations(): Promise<ILoactionresponse[] | null> {
        const locations = await LocationModel.find({});
        if (!locations.length) return null;
        return locations.map(loc => ({
            id: loc._id.toString(),
            name: loc.name,
            center: loc.center
        }));
    }
    async findById(id: string): Promise<ILocation | null> {
        return await LocationModel.findById(id);
    }
}
