import { ILandingService, ILandingRepository, LandingData } from '../types/landing.types';

export class LandingService implements ILandingService {
    private readonly landingRepository: ILandingRepository;

    constructor(landingRepository: ILandingRepository) {
        this.landingRepository = landingRepository;
    }

    async getLandingData(locationId?: string): Promise<{ success: boolean; data: LandingData }> {
        const locations = await this.landingRepository.getAllLocations();

        const skills = locationId
            ? await this.landingRepository.getSkillsByLocationId(locationId)
            : await this.landingRepository.getAllSkills();

        return {
            success: true,
            data: { skills, locations }
        };
    }
}