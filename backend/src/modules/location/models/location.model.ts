import mongoose, { Schema } from 'mongoose';
import { ILocation } from '../interfaces/location.interface';

const LocationSchema = new Schema<ILocation>({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    slug: {
        type: String,
        required: true,
    },
    lat: {
        type: Number,
        required: true
    },
    lon: {
        type: Number,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

LocationSchema.index({ location: '2dsphere' });

LocationSchema.pre('validate', function (next) {
    if (this.name) {
        this.name = this.name.toLowerCase().trim();
    }
    if (this.lat !== undefined && this.lon !== undefined) {
        this.location = {
            type: 'Point',
            coordinates: [this.lon, this.lat]
        };
    }
    next();
});

export const LocationModel = mongoose.model<ILocation>('Location', LocationSchema);