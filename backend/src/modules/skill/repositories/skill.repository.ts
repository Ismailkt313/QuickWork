import { Types, FilterQuery, ClientSession } from 'mongoose';
import { ISkill, ISkillRepository } from '../interfaces/skill.interface';
import { SkillModel } from '../models/skill.model';
import { ServiceProviderModel } from '../../serviceProvider/models/serviceProvider.model';
import { BaseRepository } from '../../../shared/repositories/base.repository';

export class SkillRepository extends BaseRepository<ISkill> implements ISkillRepository {
    constructor() {
        super(SkillModel);
    }


    async findByName(name: string): Promise<ISkill | null> {
        return await SkillModel.findOne({ name: name.toLowerCase().trim() });
    }

    async findBySlug(slug: string): Promise<ISkill | null> {
        return await SkillModel.findOne({ slug });
    }

    async create(skillData: Partial<ISkill>, session?: ClientSession): Promise<ISkill> {
        const skill = new SkillModel(skillData);

        return await skill.save({ session });
    }

    async skills(filter: FilterQuery<ISkill>): Promise<ISkill[] | null> {
        const skills = await SkillModel.find(filter).limit(20);
        return skills as ISkill[];
    }

    async getServices():Promise<ISkill[]> {
        return SkillModel.find().limit(6) as Promise<ISkill[]>;
    }

    async getAllSkills(page: number, limit: number, search?: string, locationId?: string): Promise<{ data: ISkill[], total: number }> {
        const baseFilter: FilterQuery<ISkill> = { isActive: true };
        const skip = (page - 1) * limit;
        
        if (locationId) {
            const result = await ServiceProviderModel.aggregate<{ uniqueSkillIds: Types.ObjectId[] }>([
                { $match: { 'location.id': locationId } },
                { $unwind: '$skills' },
                { $group: { _id: null, uniqueSkillIds: { $addToSet: '$skills' } } }
            ]);
            if (!result.length || !result[0].uniqueSkillIds.length) return { data: [], total: 0 };
            
            const filter = search
                ? { ...baseFilter, _id: { $in: result[0].uniqueSkillIds }, name: { $regex: search, $options: 'i' } }
                : { ...baseFilter, _id: { $in: result[0].uniqueSkillIds } };

            const [data, total] = await Promise.all([
                SkillModel.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
                SkillModel.countDocuments(filter)
            ]);
            return { data, total };
        }
        
        const filter = search 
            ? { ...baseFilter, name: { $regex: search, $options: 'i' } } 
            : baseFilter;

        const [data, total] = await Promise.all([
            SkillModel.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
            SkillModel.countDocuments(filter)
        ]);
        return { data, total };
    }


    async getAdminSkills(page: number, limit: number, search?: string): Promise<{ data: ISkill[], total: number }> {
        const query: FilterQuery<ISkill> = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const [data, total] = await Promise.all([
            SkillModel.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            SkillModel.countDocuments(query)
        ]);

        return { data, total };
    }

    async getSkills(): Promise<ISkill[]> {
        return SkillModel.find({ isActive: true }).sort({ name: 1 }) as Promise<ISkill[]>;
    }
    async getMySkill(userId: string): Promise<ISkill[]>{
        const result = await ServiceProviderModel.findOne({ userId }).populate<{ skills: ISkill[] }>("skills");
        if (!result) {
            return [];
        }
        return result.skills;
    }
}
