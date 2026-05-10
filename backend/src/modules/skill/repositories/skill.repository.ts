import { Types } from 'mongoose';
import { ISkill, ISkillRepository } from '../interfaces/skill.interface';
import { SkillModel } from '../models/skill.model';
import { ServiceProviderModel } from '../../serviceProvider/models/serviceProvider.model';

export class SkillRepository implements ISkillRepository {

    async findById(id: string): Promise<ISkill | null> {
        return await SkillModel.findById(id);
    }

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
        const baseFilter: any = { isActive: true };
        
        if (locationId) {
            const result = await ServiceProviderModel.aggregate<{ uniqueSkillIds: Types.ObjectId[] }>([
                { $match: { 'location.id': locationId } },
                { $unwind: '$skills' },
                { $group: { _id: null, uniqueSkillIds: { $addToSet: '$skills' } } }
            ]);
            if (!result.length || !result[0].uniqueSkillIds.length) return [];
            
            const filter = search
                ? { ...baseFilter, _id: { $in: result[0].uniqueSkillIds }, name: { $regex: search, $options: 'i' } }
                : { ...baseFilter, _id: { $in: result[0].uniqueSkillIds } };
            return SkillModel.find(filter).sort({ name: 1 });
        }
        
        const filter = search 
            ? { ...baseFilter, name: { $regex: search, $options: 'i' } } 
            : baseFilter;
        return SkillModel.find(filter).sort({ name: 1 });
    }

    async update(id: string, skillData: Partial<ISkill>): Promise<ISkill | null> {
        return await SkillModel.findByIdAndUpdate(id, skillData, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        const result = await SkillModel.findByIdAndDelete(id);
        return !!result;
    }

    async getAdminSkills(page: number, limit: number, search?: string): Promise<{ data: ISkill[], total: number }> {
        const query: any = {};
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
    async getMySkill(userId: any): Promise<ISkill[]>{
        const result = await ServiceProviderModel.findOne({ userId }).populate("skills") as any
        if (!result) {
            return []
        }
        return result.skills as ISkill[]
    }
}
