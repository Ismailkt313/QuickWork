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
    experience: z.string().optional(),
    duration: z.number().positive("Duration must be a positive number").optional(),
    freelancersNeeded: z.number().positive("Freelancers needed must be a positive number").optional()
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
    public readonly experience?: string;
    public readonly duration?: number;
    public readonly freelancersNeeded?: number;

    private constructor(data: CreateJobInput) {
        this.title = data.title;
        this.description = data.description;
        this.skillId = data.skillId;
        this.locationId = data.locationId;
        this.budget = data.budget;
        this.jobType = data.jobType;
        this.isUrgent = data.isUrgent ?? false;
        this.experience = data.experience;
        this.duration = data.duration;
        this.freelancersNeeded = data.freelancersNeeded;
    }

    public static create(data: any): CreateJobDTO {
        const result = createJobSchema.safeParse(data);
        
        if (!result.success) {
            const zodError = result.error as z.ZodError<any>;
            const errors = zodError.issues.map((err: any) => err.message).join('. ');
            throw new AppError(errors, 400);
        }

        return new CreateJobDTO(result.data);
    }
}
