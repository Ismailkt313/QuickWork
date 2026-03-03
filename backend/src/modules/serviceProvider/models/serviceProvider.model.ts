import mongoose, { Schema } from 'mongoose';
import { IServiceProvider } from '../interfaces/serviceProvider.interface';

const LocationSchema = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
}, { _id: false });

const PortfolioItemSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    images: [{ type: String, required: true }]
}, { _id: false });

const VerificationSchema = new Schema({
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    rejectionReason: { type: String }
}, { _id: false });

const ServiceProviderSchema = new Schema<IServiceProvider>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    headline: { type: String, required: true },
    about: { type: String, required: true, minlength: 80 },
    profileImage: { type: String, required: true },
    skills: [{ type: Schema.Types.ObjectId, ref: 'Skill', required: true }],
    yearsOfExperience: { type: Number, required: true, min: 0 },
    hourlyRate: { type: Number, required: true, min: 1 },
    location: { type: LocationSchema, required: true },
    portfolio: {
        type: [PortfolioItemSchema],
        validate: [
            (val: any[]) => val.length > 0,
            'At least one portfolio item is required'
        ]
    },
    verification: { type: VerificationSchema, default: () => ({ status: 'pending' }) },
    isActive: { type: Boolean, default: false },
    submittedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

export const ServiceProviderModel = mongoose.model<IServiceProvider>('ServiceProvider', ServiceProviderSchema);
