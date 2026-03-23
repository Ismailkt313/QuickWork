import { IJob } from '../interfaces/job.interface';

export interface JobResponseDTO {
    id: string;
    title: string;
    description: string;
    clientName: string;
    clientInitials: string;
    location: string;
    postedAt: string;
    skills: string[];
    budget: string;
    jobType: string;
    applicants: number;
    isUrgent: boolean;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export const mapJobToResponseDTO = (job: any): JobResponseDTO => {
    // Helper to format budget
    const formatBudget = (budget: { min: number; max: number }) => {
        return `₹${budget.min} – ₹${budget.max}`;
    };

    // Helper to get initials
    const getInitials = (name: string) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';
    };

    // Helper to format relative time
    const getRelativeTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const user = job.userId || {};
    const skill = job.skillId || {};
    const location = job.locationId || {};

    return {
        id: job._id ? job._id.toString() : job.id,
        title: job.title,
        description: job.description,
        clientName: user.name || 'Anonymous',
        clientInitials: getInitials(user.name),
        location: location.name || 'Remote',
        postedAt: getRelativeTime(job.createdAt),
        skills: skill.name ? [skill.name] : [], // Assuming single skill for now as per current schema
        budget: formatBudget(job.budget),
        jobType: job.jobType === 'fixed' ? 'Fixed' : 'Hourly',
        applicants: job.applicantsCount || 0,
        isUrgent: job.isUrgent || false,
        status: job.status,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
    };
};
