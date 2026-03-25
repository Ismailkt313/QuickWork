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
    startDate: string;
    endDate: string;
    durationType: string;
    createdAt: Date;
    updatedAt: Date;
}

export const mapJobToResponseDTO = (job: any): JobResponseDTO => {
     const formatBudget = (budget: { min: number; max: number }) => {
        return `₹${budget.min} – ₹${budget.max}`;
    };

     const getInitials = (name: string) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';
    };

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

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    };

    return {
        id: job._id ? job._id.toString() : job.id,
        title: job.title,
        description: job.description,
        clientName: user.name || 'Anonymous',
        clientInitials: getInitials(user.name),
        location: location.name || 'Remote',
        postedAt: getRelativeTime(job.createdAt),
        skills: skill.name ? [skill.name] : [], 
        budget: formatBudget(job.budget),
        jobType: job.jobType === 'fixed' ? 'Fixed' : 'Hourly',
        applicants: job.applicantsCount || 0,
        isUrgent: job.isUrgent || false,
        status: job.status,
        startDate: job.schedule ? formatDate(job.schedule.startDate) : '',
        endDate: job.schedule ? formatDate(job.schedule.endDate) : '',
        durationType: job.durationType || '',
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
    };
};
