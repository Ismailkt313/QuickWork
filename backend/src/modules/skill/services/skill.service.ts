import { ISkill } from '../interfaces/skill.interface';
import { ISkillService } from '../interfaces/skill.interface';
import { ISkillRepository } from '../interfaces/skill.interface';

export class SkillService implements ISkillService {
    private _skillRepository: ISkillRepository;

    constructor(skillRepository: ISkillRepository) {
        this._skillRepository = skillRepository;
    }

    async searchSkills(query: string): Promise<{ success: boolean; data: ISkill[] }> {
        const filter: any = { isActive: true };
        if (query) {
            filter.name = { $regex: query, $options: 'i' };
        }
        const skills = await this._skillRepository.skills(filter) as ISkill[];
        if (!skills) {
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
        const skills = await this._skillRepository.getAllSkills(search, locationId);
        return { success: true, data: skills };
    }

    async getAdminSkills(page: number, limit: number, search?: string): Promise<{ success: boolean; data: ISkill[], pagination: any }> {
        const { data, total } = await this._skillRepository.getAdminSkills(page, limit, search);
        return {
            success: true,
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async createSkill(skillData: Partial<ISkill>): Promise<{ success: boolean; message: string; data?: ISkill }> {
        if (!skillData.name) {
            return { success: false, message: "Skill name is required" };
        }

        const existingSkill = await this._skillRepository.findByName(skillData.name);
        if (existingSkill) {
            return { success: false, message: "Skill with this name already exists" };
        }

        const slug = skillData.name.toLowerCase().trim().replace(/\s+/g, '-');
        const skill = await this._skillRepository.create({ ...skillData, slug });

        return { success: true, message: "Skill created successfully", data: skill };
    }

    async updateSkill(id: string, skillData: Partial<ISkill>): Promise<{ success: boolean; message: string; data?: ISkill }> {
        if (skillData.name) {
            const existingSkill = await this._skillRepository.findByName(skillData.name);
            if (existingSkill && existingSkill._id.toString() !== id) {
                return { success: false, message: "Skill with this name already exists" };
            }
            skillData.slug = skillData.name.toLowerCase().trim().replace(/\s+/g, '-');
        }

        const skill = await this._skillRepository.update(id, skillData);
        if (!skill) {
            return { success: false, message: "Skill not found" };
        }

        return { success: true, message: "Skill updated successfully", data: skill };
    }

    async deleteSkill(id: string): Promise<{ success: boolean; message: string }> {
        const deleted = await this._skillRepository.delete(id);
        if (!deleted) {
            return { success: false, message: "Skill not found" };
        }
        return { success: true, message: "Skill deleted successfully" };
    }

    async toggleSkillStatus(id: string): Promise<{ success: boolean; message: string; data?: ISkill }> {
        const skill = await this._skillRepository.findById(id);
        if (!skill) {
            return { success: false, message: "Skill not found" };
        }

        const updated = await this._skillRepository.update(id, { isActive: !skill.isActive });
        return {
            success: true,
            message: `Skill ${!skill.isActive ? 'activated' : 'deactivated'} successfully`,
            data: updated!
        };
    }

    async getSkills(): Promise<{ success: boolean; data: ISkill[] }> {
        const skills = await this._skillRepository.getSkills();
        return { success: true, data: skills };
    }
    async getMySkills(userId: string): Promise<{ success: boolean; data: ISkill[] }> {
        const skills: ISkill[] = await this._skillRepository.getMySkill(userId)
        return { success: true, data: skills }
    }
}
