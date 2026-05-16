import { z } from 'zod';
import { AppError } from '../../../utils/AppError';
import { JOB_DURATION_TYPE } from '../../../constants/jobDuration';
import { JOB_VISIBILITY } from '../../../constants/jobVisibility';
import {HttpStatusCode} from "../../../constants/httpStatusCode"
import { ErrorMessages } from '../../../constants/messages/errorMessages';

const createJobSchema = z.object({
    title: z.string().min(5).max(100),
    description: z.string().min(10).max(1000),
    contactNumber: z.string().min(10).max(15),
    skillId: z.string().length(24),

    location: z.object({
        district: z.string().length(24),
        districtName: z.string().min(1),
        address: z.string().min(3),
        additionalDetails: z.string().optional(),
        coordinates: z.object({
            type: z.literal("Point"),
            coordinates: z.array(z.number())
                .length(2)
                .refine(([lng, lat]) =>
                    lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90,
                    { message: ErrorMessages.INVALID_COORD_RANGE }
                )
        })
    }),

    budget: z.object({
        min: z.number().positive(),
        max: z.number().positive()
    }).refine(data => data.max >= data.min, {
        message: ErrorMessages.MAX_MIN_BUDGET_ERROR,
        path: ["max"]
    }),

    isUrgent: z.boolean().optional().default(false),

    durationType: z.nativeEnum(JOB_DURATION_TYPE),
    startDate: z.string().min(1),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).default("09:00"),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).default("18:00"),
    days: z.number().positive().optional(),

    freelancersNeeded: z.number().positive().optional(),

    visibility: z.nativeEnum(JOB_VISIBILITY).default(JOB_VISIBILITY.PUBLIC),
    hiredProviderId: z.string().length(24).optional()
})

.refine(data => {
    if (data.visibility === JOB_VISIBILITY.PRIVATE) {
        return data.freelancersNeeded === 1 || data.freelancersNeeded === undefined;
    }
    return true;
}, {
    message: ErrorMessages.PRIVATE_JOB_FREELANCER_LIMIT,
    path: ["freelancersNeeded"]
})

.refine(data => {
    if (data.durationType === JOB_DURATION_TYPE.MULTI_DAY) {
        return !!data.days && data.days >= 1;
    }
    return true;
}, {
    message: ErrorMessages.MULTI_DAY_REQUIRED_DAYS,
    path: ["days"]
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

export class CreateJobDTO {
    public readonly title: string;
    public readonly description: string;
    public readonly contactNumber: string;
    public readonly skillId: string;

    public readonly location: {
        district: string;
        districtName: string;
        address: string;
        additionalDetails?: string;
        coordinates: {
            type: "Point";
            coordinates: [number, number];
        };
    };

    public readonly budget: { min: number; max: number };
    public readonly isUrgent: boolean;
    public readonly durationType: JOB_DURATION_TYPE;
    public readonly startDate: string;
    public readonly startTime: string;
    public readonly endTime: string;
    public readonly days?: number;
    public readonly freelancersNeeded: number;
    public readonly visibility: JOB_VISIBILITY;
    public readonly hiredProviderId?: string;

    private constructor(data: CreateJobInput) {
        this.title = data.title;
        this.description = data.description;
        this.contactNumber = data.contactNumber;
        this.skillId = data.skillId;
        this.location = {
            district: data.location.district,
            districtName: data.location.districtName,
            address: data.location.address,
            additionalDetails: data.location.additionalDetails,
            coordinates: {
                type: data.location.coordinates.type,
                coordinates: data.location.coordinates.coordinates as [number, number]
            }
        };
        this.budget = data.budget;

        this.isUrgent = data.isUrgent ?? false;

        this.durationType = data.durationType;
        this.startDate = data.startDate;
        this.startTime = data.startTime;
        this.endTime = data.endTime;
        this.days = data.days;

        this.freelancersNeeded = data.freelancersNeeded ?? 1;
        this.visibility = data.visibility ?? JOB_VISIBILITY.PUBLIC;
        this.hiredProviderId = data.hiredProviderId;
    }

    public static create(data: unknown): CreateJobDTO {
        const result = createJobSchema.safeParse(data);

        if (!result.success) {
            const errors = result.error.issues.map(err => err.message).join(". ");
            throw new AppError(errors, HttpStatusCode.BAD_REQUEST);
        }

        return new CreateJobDTO(result.data);
    }
}