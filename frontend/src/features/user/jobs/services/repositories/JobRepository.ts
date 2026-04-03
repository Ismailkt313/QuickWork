import { apiClient } from '../../../../../services/api/apiClient';

export interface CreateJobData {
    title: string;
    description: string;
    skillId: string;
    locationId: string;
    budget: { min: number; max: number };

    durationType: string;
    startDate?: string;
    days?: number;
    freelancersNeeded: number;
    visibility?: 'public' | 'private';
    hiredProviderId?: string;
}
export class JobRepository {
    static async createJob(jobData: CreateJobData): Promise<{ success: boolean; message: string; data?: any }> {
        try {
            const response = await apiClient.post('/job', jobData);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to create job',
            };
        }
    }
}
