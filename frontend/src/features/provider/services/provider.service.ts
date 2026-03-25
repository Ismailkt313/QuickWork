import { api } from "../../../services/api";

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

export const availableJobs = async (page?: number, limit?: number, skillId?: string, locationId?: string) => {
    try {
        const response = await api.get("/jobs/availablejobs", {
            params: { page, limit, skillId, locationId }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch available jobs");
    }
};

export const fetchSkills = async () => {
    try {
        const response = await api.get("/skills");
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch skills");
    }
};

export const fetchLocations = async () => {
    try {
        const response = await api.get("/locations");
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch locations");
    }
};
