import axios from 'axios';
import { CreateLocationDTO } from '../dtos/createLocation.dto';
import { generateSlug } from '../../../utils/slug.util';
import { ILocationService,ILocationRepository, ILoactionresponse } from '../interfaces/location.interface';

export class LocationService implements ILocationService {
    private locationRepository: ILocationRepository;

    constructor(locationRepository: ILocationRepository) {
        this.locationRepository = locationRepository;
    }

    async upsertLocation(dto: CreateLocationDTO): Promise<{ success: boolean; data: { id: string } }> {
        const normalizedName = dto.name.toLowerCase().trim();
        const slug = generateSlug(normalizedName);

        const existingLocation = await this.locationRepository.findBySlug(slug);

        if (existingLocation) {
            return {
                success: true,
                data: { id: existingLocation._id.toString() }
            };
        }

        const newLocation = await this.locationRepository.create({
            name: normalizedName,
            slug,
            lat: dto.lat,
            lon: dto.lon
        });

        return {
            success: true,
            data: { id: newLocation._id.toString() }
        };
    }

    async searchLocations(query: string): Promise<{ success: boolean; data: any[] }> {
        console.log('Searching locations with query:', query);  
        if (!query || query.length < 3) return { success: true, data: [] };

        const localLocations = await this.locationRepository.searchByName(query);
        if (localLocations.length > 0) {
            return {
                success: true,
                data: localLocations.map(loc => ({
                    id: loc._id.toString(),
                    name: loc.name,
                    lat: loc.lat,
                    lon: loc.lon
                }))
            };
        }

        try {
            const response = await axios.get("https://api.geoapify.com/v1/geocode/autocomplete", {
                params: { text: query, apiKey: '5c34647bd3d24bf3a94a281cdb1d8a50' }
            });
            const geoData = response.data.features.map((feature: any) => ({
                id: feature.properties.place_id,
                name: feature.properties.formatted,
                lat: feature.geometry.coordinates[1],
                lon: feature.geometry.coordinates[0]
            }));
            return { success: true, data: geoData };
        } catch (error) {
            
            return { success: true, data: [] };
        }
    }
    async getAllLocations(): Promise<{ success: boolean; data: ILoactionresponse[] }> {
        const locations = await this.locationRepository.getAllLocations();
        return {
            success: true,
            data: locations.map(loc => ({
                id: loc._id.toString(),
                name: loc.name,
                lat: loc.lat,
                lon: loc.lon
            }))
        };
    }
}
