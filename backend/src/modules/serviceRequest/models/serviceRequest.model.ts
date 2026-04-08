import mongoose, { Schema } from 'mongoose';
import { IServiceRequest } from '../interfaces/serviceRequest.interface';
import { SKILL_STATUS } from '../../../constants/skill';

const ServiceRequestSchema = new Schema<IServiceRequest>({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    slug: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    requestedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: Object.values(SKILL_STATUS),
        default: SKILL_STATUS.PENDING,
        index: true
    },
    reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    },
    rejectionReason: {
        type: String
    },
    adminNotes: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

ServiceRequestSchema.pre('save', function (next) {
    if (this.name) {
        this.name = this.name.toLowerCase().trim();
    }
    next();
});


export const ServiceRequestModel = mongoose.model<IServiceRequest>('ServiceRequest', ServiceRequestSchema);
