import { Types } from 'mongoose';
import { ISkill, ISkillRepository } from '../interfaces/skill.interface';
import { SkillModel } from '../models/skill.model';
import { ServiceProviderModel } from '../../serviceProvider/models/serviceProvider.model';

export class SkillRepository implements ISkillRepository {

    async findByName(name: string): Promise<ISkill | null> {
        return await SkillModel.findOne({ name: name.toLowerCase().trim() });
    }

    async findBySlug(slug: string): Promise<ISkill | null> {
        return await SkillModel.findOne({ slug });
    }

    async create(skillData: Partial<ISkill>, session?: any): Promise<ISkill> {
        const skill = new SkillModel(skillData);
        
        return await skill.save({ session });
    }

    async skills(filter: any): Promise<ISkill[] | null> {
        const skills = await SkillModel.find(filter).limit(20);
        return skills as ISkill[];
    }

    async getServices():Promise<ISkill[]> {
        return SkillModel.find().limit(6) as Promise<ISkill[]>;
    }

    async getAllSkills(search?: string, locationId?: string): Promise<ISkill[]> {
        if (locationId) {
            const result = await ServiceProviderModel.aggregate<{ uniqueSkillIds: Types.ObjectId[] }>([
                { $match: { 'location.id': locationId } },
                { $unwind: '$skills' },
                { $group: { _id: null, uniqueSkillIds: { $addToSet: '$skills' } } }
            ]);
            if (!result.length || !result[0].uniqueSkillIds.length) return [];
            const filter = search
                ? { _id: { $in: result[0].uniqueSkillIds }, name: { $regex: search, $options: 'i' } }
                : { _id: { $in: result[0].uniqueSkillIds } };
            return SkillModel.find(filter).sort({ name: 1 });
        }
        const filter = search ? { name: { $regex: search, $options: 'i' } } : {};
        return SkillModel.find(filter).sort({ name: 1 });
    }
    
    async getSkills(): Promise<ISkill[]> {
        return SkillModel.find().sort({ name: 1 }) as Promise<ISkill[]>;
    }
}
