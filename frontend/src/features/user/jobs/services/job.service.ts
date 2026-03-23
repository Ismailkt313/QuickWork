import { JobRepository } from './repositories/JobRepository';
import type { CreateJobData } from './repositories/JobRepository';

export const jobService = {
    async createJob(jobData: CreateJobData) {
        return await JobRepository.createJob(jobData);
    },
};
