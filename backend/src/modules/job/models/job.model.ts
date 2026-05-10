import mongoose, { Schema } from 'mongoose';
import { IJob } from '../interfaces/job.interface';
import { JOB_STATUS } from '../../../constants/jobStatus';
import { JOB_VISIBILITY } from '../../../constants/jobVisibility';
import { JOB_DURATION_TYPE } from '../../../constants/jobDuration';
import { generateJobCode } from '../../../utils/idGenerator';

const JobSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        contactNumber: { type: String, required: true },
        skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
        location: {
    district: {
        type: Schema.Types.ObjectId,
        ref: 'Location',
        required: true
    },
    address: {
        type: String,
        required: true
    },
    additionalDetails: {
        type: String,
        required: false
    },
    coordinates: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
            default: "Point"
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
        },
        budget: {
            min: { type: Number, required: true },
            max: { type: Number, required: true }
        },

        applicantsCount: {
            type: Number,
            default: 1
        },
        isUrgent: {
            type: Boolean,
            default: false
        },

        durationType: {
            type: String,
            enum: Object.values(JOB_DURATION_TYPE),
            required: true
        },
        schedule: {
            startDate: { type: Date, required: true },
            endDate: { type: Date, required: true },
            startTime: { type: String, required: true, default: "09:00" },
            endTime: { type: String, required: true, default: "18:00" }
        },
        days: { type: Number },
        freelancersNeeded: {
            type: Number,
            default: 1
        },
        acceptedFreelancers: {
            type: Number,
            default: 0
        },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        visibility: {
            type: String,
            enum: Object.values(JOB_VISIBILITY),
            default: JOB_VISIBILITY.PUBLIC
        },
        hiredProviderId: {
            type: Schema.Types.ObjectId,
            ref: 'ServiceProvider'
        },
        status: {
            type: String,
            enum: Object.values(JOB_STATUS),
            default: JOB_STATUS.OPEN
        },
        rejectionReason: { type: String },
        jobCode: {
            type: String,
            unique: true,
            index: true
        }
    },
    {
        timestamps: true
    }
);

JobSchema.pre('save', function(next) {
    if (this.isModified('visibility') || this.isNew) {
        if (this.get('visibility') === JOB_VISIBILITY.PRIVATE) {
            this.set('freelancersNeeded', 1);
        }
    }

    if (this.isNew && !this.get('jobCode')) {
        this.set('jobCode', generateJobCode());
    }
    next();
});
JobSchema.index({ "location.coordinates": "2dsphere" });
JobSchema.index({ skillId: 1 });
JobSchema.index({ status: 1 });
JobSchema.index({ 'schedule.startDate': 1 });
JobSchema.index({ createdAt: -1 });

export const JobModel = mongoose.model<IJob>('Job', JobSchema);
