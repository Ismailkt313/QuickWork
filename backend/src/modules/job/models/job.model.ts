import mongoose, { Schema } from 'mongoose';
import { IJob } from '../interfaces/job.interface';

const JobSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
        locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
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
            enum: ['half_day', 'full_day', 'multi_day'],
            required: true
        },
        schedule: {
            startDate: { type: Date, required: true },
            endDate: { type: Date, required: true }
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
            enum: ['public', 'private'], 
            default: 'public' 
        },
        hiredProviderId: { 
            type: Schema.Types.ObjectId, 
            ref: 'ServiceProvider' 
        },
        status: { 
            type: String, 
            enum: ['open', 'partially_assigned', 'fully_assigned', 'in_progress', 'completed', 'cancelled', 'rejected'], 
            default: 'open' 
        },
        rejectionReason: { type: String }
    },
    { 
        timestamps: true 
    }
);

// Pre-save hook to enforce private job constraints
JobSchema.pre('save', function(next) {
    if (this.isModified('visibility') || this.isNew) {
        if (this.get('visibility') === 'private') {
            this.set('freelancersNeeded', 1);
        }
    }
    next();
});

JobSchema.index({ skillId: 1 });
JobSchema.index({ locationId: 1 });
JobSchema.index({ status: 1 });
JobSchema.index({ 'schedule.startDate': 1 });
JobSchema.index({ createdAt: -1 });

export const JobModel = mongoose.model<IJob>('Job', JobSchema);
