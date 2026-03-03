import { ISkill } from '../interfaces/skill.interface';
import { SkillModel } from '../models/skill.model';

export class SkillRepository {
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
}
