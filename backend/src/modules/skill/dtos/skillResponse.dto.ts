import { ISkill } from '../interfaces/skill.interface';

export interface SkillResponseDTO {
    id: string;
    name: string;
    slug: string;
    description?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt?: Date;
}

export const mapSkillToResponseDTO = (skill: ISkill | Record<string, unknown>): SkillResponseDTO => {
    const s = skill as unknown as Record<string, unknown>;
    return {
        id: s._id ? (s._id as { toString(): string }).toString() : ((s.id as string) || ""),
        name: (s.name as string) || "",
        slug: (s.slug as string) || "",
        description: (s.description as string) || undefined,
        isActive: (s.isActive as boolean) || false,
        createdAt: (s.createdAt as Date) || new Date(),
        updatedAt: (s.updatedAt as Date) || undefined
    };
};
