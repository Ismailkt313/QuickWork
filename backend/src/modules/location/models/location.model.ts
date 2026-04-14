import mongoose, { Schema } from 'mongoose';
import { ILocation } from '../interfaces/location.interface';

const LocationSchema = new Schema<ILocation>({
    name: {
        type: String,
        required: true,
        unique: true
    },
    center: {
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
});

LocationSchema.index({ center: "2dsphere" });

export const LocationModel = mongoose.model<ILocation>('Location', LocationSchema);