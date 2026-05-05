import { ILocationService, ILocationRepository, ILoactionresponse } from '../interfaces/location.interface';

export class LocationService implements ILocationService {
    private _locationRepository: ILocationRepository;

    constructor(locationRepository: ILocationRepository) {
        this._locationRepository = locationRepository;
    }

    async getAllLocations(): Promise<{ success: boolean; data: ILoactionresponse[] }> {
        const locations = await this._locationRepository.getAllLocations();
        return {
            success: true,
            data: locations.map(loc => ({
                id: loc._id.toString(),
                name: loc.name
            }))
        };
    }
}
