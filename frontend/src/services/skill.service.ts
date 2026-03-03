import { api } from '../api';

export interface Skill {
    id: string;
    name: string;
}

export const searchSkills = async (query: string): Promise<Skill[]> => {
    try {
        const response = await api.get("/skills", {
            params: { search: query },
        });
        return response.data.data;
    } catch (error) {
        console.error("Error searching skills:", error);
        return [];
    }
};

export const requestSkill = async (skillName: string, description: string = "Requested by provider during onboarding") => {
    try {
        const response = await api.post("/service-request", {
            name: skillName,
            description: description
        });
        return response.data;
    } catch (error: any) {
        console.error("Error requesting skill:", error);
        return { success: false, message: error.response?.data?.message || "Failed to request skill" };
    }
};