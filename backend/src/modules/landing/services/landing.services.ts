import { ILandingService, LandingData } from '../types/landing.types';
import { ILocationRepository } from '../../location/interfaces/location.interface';
import { ISkillRepository } from '../../skill/interfaces/skill.interface';

export class LandingService implements ILandingService {
    private readonly _locationRepository: ILocationRepository;
    private readonly _skillRepository: ISkillRepository;

    constructor(locationRepository: ILocationRepository, skillRepository: ISkillRepository) {
        this._locationRepository = locationRepository;
        this._skillRepository = skillRepository;
    }

    async getLandingData(locationId?: string): Promise<{ success: boolean; data: LandingData }> {
        const locations = await this._locationRepository.getAllLocations();

        const skills = locationId
            ? await this._skillRepository.getSkillsByLocationId(locationId)
            : await this._skillRepository.getAllSkillsList();

        return {
            success: true,
            data: { skills, locations }
        };
    }
}