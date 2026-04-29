import { api } from "../../../services/api";
import { SKILL_STATUS } from "../../../constants/skill";

export interface SkillResult {
  id: string;
  name: string;
  slug?: string;
}

export interface SkillRequestResponse {
  success: boolean;
  message: string;
  data?: {
    _id?: string;
    name?: string;
    slug?: string;
    description?: string;
    status?: SKILL_STATUS;
    createdAt?: string;
  };
}

export const searchSkills = async (query: string): Promise<SkillResult[]> => {
  if (!query.trim()) return [];

  try {
    const response = await api.get<{ success: boolean; data: SkillResult[] }>(
      "/skills",
      {
        params: { search: query.trim() },
      },
    );

    return Array.isArray(response.data?.data) ? response.data.data : [];
  } catch {
    return [];
  }
};

export const requestSkill = async (
  skillName: string,
): Promise<SkillRequestResponse> => {
  const name = skillName.trim();

  if (!name) {
    throw new Error("Skill name is required");
  }

  try {
    const response = await api.post<SkillRequestResponse>("/service-request", {
      name,
      description: `Requested skill for provider onboarding: ${name}`,
    });

    return response.data;
  } catch (error: unknown) {
    const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to request skill";
    throw new Error(errorMessage);
  }
};
