import { ISkill } from '../interfaces/skill.interface';
import { ISkillService } from '../interfaces/skill.interface';
import { ISkillRepository } from '../interfaces/skill.interface';

export class SkillService implements ISkillService {
    private skillRepository: ISkillRepository;

    constructor(skillRepository: ISkillRepository) {
        this.skillRepository = skillRepository;
    }

    async searchSkills(query: string): Promise<{ success: boolean; data: ISkill[] }> {
        const filter = query ? { name: { $regex: query, $options: 'i' } } : {};
        const skills = await this.skillRepository.skills(filter) as ISkill[];
        if(!skills) {
            return { success: true, data: [] };
        }
        const formattedSkills = skills.map(skill => ({
            id: skill._id,
            name: skill.name,
            slug: skill.slug
        }));

        return { success: true, data: formattedSkills as any };
    }

    async getAllSkills(search?: string, locationId?: string): Promise<{ success: boolean; data: ISkill[] }> {
        const skills = await this.skillRepository.getAllSkills(search, locationId);
        return { success: true, data: skills };
    }

    async getSkills(): Promise<{ success: boolean; data: ISkill[] }> {
        const skills = await this.skillRepository.getSkills();
        return { success: true, data: skills };
    }
    async getMySkills(userId:string): Promise<{ success: boolean; data: ISkill[] }>{
        const skills:ISkill[] = await this.skillRepository.getMySkill(userId)
        return {success:true, data: skills}
    }
}
