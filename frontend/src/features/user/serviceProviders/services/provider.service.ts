import { api } from "../../../../services/api";

export interface ProviderApplicationPayload {
    headline: string;
    about: string;
    profileImage: string;
    skills: string[];
    yearsOfExperience: number;
    hourlyRate: number;
    location: { id: string; name: string; lat?: number; lon?: number };
    portfolio: {
        title: string;
        description: string;
        images: string[];
    }[];
}

export const submitProviderApplication = async (data: ProviderApplicationPayload): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
        const response = await api.post("/provider/apply", data);
        return response.data;
    } catch (error: any) {
        
        throw new Error(error.response?.data?.message || "Failed to submit application");
    }
};
