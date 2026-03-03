import { LocationRepository } from '../repositories/location.repository';
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
}
