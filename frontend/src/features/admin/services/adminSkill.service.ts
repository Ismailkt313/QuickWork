import { Adminapi as api } from "../services/adminApi";
import { ENDPOINTS } from "../../../constants/endpoints";

export interface Skill {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SkillResponse {
  success: boolean;
  message?: string;
  data: Skill[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const adminSkillService = {
  getSkills: async (page = 1, limit = 10, search = "", status = "") => {
    const response = await api.get(ENDPOINTS.ADMIN.SKILLS_LIST, {
      params: { page, limit, search, status }
    });
    return response.data;
  },

  createSkill: async (skillData: Partial<Skill>) => {
    const response = await api.post(ENDPOINTS.ADMIN.SKILL_CREATE, skillData);
    return response.data;
  },

  updateSkill: async (id: string, skillData: Partial<Skill>) => {
    const response = await api.put(ENDPOINTS.ADMIN.SKILL_UPDATE(id), skillData);
    return response.data;
  },

  deleteSkill: async (id: string) => {
    const response = await api.delete(ENDPOINTS.ADMIN.SKILL_DELETE(id));
    return response.data;
  },

  toggleStatus: async (id: string) => {
    const response = await api.patch(ENDPOINTS.ADMIN.SKILL_TOGGLE(id));
    return response.data;
  }
};
