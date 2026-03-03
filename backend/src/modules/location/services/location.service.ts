import { LocationRepository } from '../repositories/location.repository';
import { LocationModel } from '../models/location.model';
import axios from 'axios';
import { CreateLocationDTO } from '../dtos/createLocation.dto';
import { generateSlug } from '../../../utils/slug.util';

export class LocationService {
    private locationRepository: LocationRepository;

    constructor(locationRepository: LocationRepository) {
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
        if (!query || query.length < 3) return { success: true, data: [] };

        const localLocations = await LocationModel.find({ name: { $regex: query, $options: 'i' } }).limit(5);
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
}
