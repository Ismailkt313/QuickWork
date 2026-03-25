import { apiClient } from '../../../../../services/api/apiClient';

export interface CreateJobData {
    title: string;
    description: string;
    skillId: string;
    locationId: string;
    budget: { min: number; max: number };
    experience: string;
    durationType: string;
    startDate?: string;
    days?: number;
    freelancersNeeded: number;
}
export class JobRepository {
    static async createJob(jobData: CreateJobData): Promise<{ success: boolean; message: string; data?: any }> {
        try {
            const response = await apiClient.post('/jobs', jobData);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to create job',
            };
        }
    }
}
