import { Types } from 'mongoose';
import { SkillModel } from '../../skill/models/skill.model';
import { LocationModel } from '../../location/models/location.model';
import { ServiceProviderModel } from '../../serviceProvider/models/serviceProvider.model';
import { ISkill } from '../../skill/interfaces/skill.interface';
import { ILocation } from '../../location/interfaces/location.interface';
import { ILandingRepository } from '../types/landing.types';

export class LandingRepository implements ILandingRepository {

    async getAllLocations(): Promise<ILocation[]> {
        return LocationModel.find({});
    }

    async getAllSkills(): Promise<ISkill[]> {
        return SkillModel.find({});
    }

    async getSkillsByLocationId(locationId: string): Promise<ISkill[]> {
        const result = await ServiceProviderModel.aggregate<{ uniqueSkillIds: Types.ObjectId[] }>([
            {
                $match: { 'location.id': locationId }
            },
            {
                $unwind: '$skills'
            },
            {
                $group: {
                    _id: null,
                    uniqueSkillIds: { $addToSet: '$skills' }
                }
            }
        ]);

        if (!result.length || !result[0].uniqueSkillIds.length) {
            return [];
        }

        const skillIds = result[0].uniqueSkillIds;
        return SkillModel.find({ _id: { $in: skillIds } });
    }
}
