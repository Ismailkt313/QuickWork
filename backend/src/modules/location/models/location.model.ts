import mongoose, { Schema } from 'mongoose';
import { ILocation } from '../interfaces/location.interface';

const LocationSchema = new Schema<ILocation>({
    name: {
        type: String,
        required: true,
        unique: true
    },
});

export const LocationModel = mongoose.model<ILocation>('Location', LocationSchema);