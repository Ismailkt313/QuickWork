import { ILocationService, ILocationRepository, ILoactionresponse } from '../interfaces/location.interface';

export class LocationService implements ILocationService {
    private locationRepository: ILocationRepository;

    constructor(locationRepository: ILocationRepository) {
        this.locationRepository = locationRepository;
    }

    async getAllLocations(): Promise<{ success: boolean; data: ILoactionresponse[] }> {
        const locations = await this.locationRepository.getAllLocations();
        return {
            success: true,
            data: locations.map(loc => ({
                id: loc._id.toString(),
                name: loc.name
            }))
        };
    }
}
