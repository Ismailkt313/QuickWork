import { Request, Response, NextFunction } from 'express';
import { ISkill } from '../../skill/interfaces/skill.interface';
import { ILocation } from '../../location/interfaces/location.interface';

export interface LandingData {
    skills: ISkill[];
    locations: ILocation[];
}

export interface ILandingController {
    getLandingData: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

export interface ILandingService {
    getLandingData(locationId?: string): Promise<{ success: boolean; data: LandingData }>;
}

export interface ILandingRepository {
    getAllLocations(): Promise<ILocation[]>;
    getAllSkills(): Promise<ISkill[]>;
    getSkillsByLocationId(locationId: string): Promise<ISkill[]>;
}