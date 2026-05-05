import { ILandingService, ILandingRepository, LandingData } from '../types/landing.types';

export class LandingService implements ILandingService {
    private readonly _landingRepository: ILandingRepository;

    constructor(landingRepository: ILandingRepository) {
        this._landingRepository = landingRepository;
    }

    async getLandingData(locationId?: string): Promise<{ success: boolean; data: LandingData }> {
        const locations = await this._landingRepository.getAllLocations();

        const skills = locationId
            ? await this._landingRepository.getSkillsByLocationId(locationId)
            : await this._landingRepository.getAllSkills();

        return {
            success: true,
            data: { skills, locations }
        };
    }
}