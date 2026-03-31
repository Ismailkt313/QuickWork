import { z } from 'zod';
import { AppError } from '../../../utils/AppError';

const createJobSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long").max(100, "Title is too long"),
    description: z.string().min(10, "Description must be at least 10 characters long").max(1000, "Description is too long"),
    skillId: z.string().length(24, "Invalid skill ID format"),
    locationId: z.string().length(24, "Invalid location ID format"),
    budget: z.object({
        min: z.number().positive("Minimum budget must be a positive number"),
        max: z.number().positive("Maximum budget must be a positive number")
    }).refine(data => data.max >= data.min, {
        message: "Maximum budget must be greater than or equal to minimum budget",
        path: ["max"]
    }),
    jobType: z.enum(['fixed', 'hourly']).default('fixed'),
    isUrgent: z.boolean().optional().default(false),

    durationType: z.enum(['half_day', 'full_day', 'multi_day']),
    startDate: z.string().min(1, "Start date is required"),
    days: z.number().positive().optional(),
    freelancersNeeded: z.number().positive("Freelancers needed must be a positive number").optional()
}).refine(data => {
    if (data.durationType === 'multi_day') {
        return !!data.days && data.days >= 1;
    }
    return true;
}, {
    message: "Number of days is required for multi-day jobs",
    path: ["days"]
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

export class CreateJobDTO {
    public readonly title: string;
    public readonly description: string;
    public readonly skillId: string;
    public readonly locationId: string;
    public readonly budget: { min: number; max: number };
    public readonly jobType: 'fixed' | 'hourly';
    public readonly isUrgent: boolean;

    public readonly durationType: string;
    public readonly startDate: string;
    public readonly days?: number;
    public readonly freelancersNeeded: number;

    private constructor(data: CreateJobInput) {
        this.title = data.title;
        this.description = data.description;
        this.skillId = data.skillId;
        this.locationId = data.locationId;
        this.budget = data.budget;
        this.jobType = data.jobType || 'fixed';
        this.isUrgent = data.isUrgent || false;

        this.durationType = data.durationType;
        this.startDate = data.startDate;
        this.days = data.days;
        this.freelancersNeeded = data.freelancersNeeded || 1;
    }

    public static create(data: any): CreateJobDTO {
        const result = createJobSchema.safeParse(data);
        
        if (!result.success) {
            const zodError = result.error as z.ZodError<any>;
            const errors = zodError.issues.map((err: any) => err.message).join('. ');
            console.error("Validation errors:", errors);
            throw new AppError(errors, 400);
        }

        return new CreateJobDTO(result.data);
    }
}
