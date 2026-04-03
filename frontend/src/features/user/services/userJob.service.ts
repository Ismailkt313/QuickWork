import { api } from "../../../services/api";

export interface UserJob {
    id: string;
    title: string;
    description: string;
    skillId: string;
    locationId: string;
    budget: {
        min: number;
        max: number;
    };
    status: 'open' | 'partially_assigned' | 'fully_assigned' | 'in_progress' | 'completed' | 'cancelled';
    visibility: 'public' | 'private';
    createdAt: string;
    schedule: {
        startDate: string;
        endDate: string;
    };
    categoryName?: string;
    locationName?: string;
}

export const getUserJobs = async () => {
    try {
        const response = await api.get('/job/my');
        console.log("User Jobs Response:", response.data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch your jobs');
    }
};

export const cancelJob = async (jobId: string) => {
    try {
        console.log("Cancelling job:", jobId);
        const response = await api.put(`/job/${jobId}/cancel`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to cancel job');
    }
};

export const getJobDetails = async (jobId: string) => {
    try {
        const response = await api.get(`/job/${jobId}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch job details');
    }
};

export const getJobAssignments = async (jobId: string) => {
    try {
        const response = await api.get(`/job/${jobId}/assignments`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch assignments');
    }
};
