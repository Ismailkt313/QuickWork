import { SkillRepository } from '../repositories/skill.repository';
import { ISkill } from '../interfaces/skill.interface';
import { SkillModel } from '../models/skill.model';

export class SkillService {
    private skillRepository: SkillRepository;

    constructor(skillRepository: SkillRepository) {
        this.skillRepository = skillRepository;
    }

    async searchSkills(query: string): Promise<{ success: boolean; data: ISkill[] }> {
        const filter = query ? { name: { $regex: query, $options: 'i' } } : {};
        const skills = await SkillModel.find(filter).limit(20);

        const formattedSkills = skills.map(skill => ({
            id: skill._id,
            name: skill.name,
            slug: skill.slug
        }));

        return { success: true, data: formattedSkills as any };
    }
}
