import mongoose, { Schema } from 'mongoose';
import { IReview, REVIEW_ROLE } from '../interfaces/review.interface';

const ReviewSchema: Schema = new Schema(
    {
        assignmentId: { 
            type: Schema.Types.ObjectId, 
            ref: 'Assignment', 
            required: true 
        },
        reviewerId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        revieweeId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        role: { 
            type: String, 
            enum: Object.values(REVIEW_ROLE), 
            required: true 
        },
        rating: { 
            type: Number, 
            required: true, 
            min: 1, 
            max: 5 
        },
        comment: { 
            type: String 
        },
        images: [{ 
            type: String 
        }]
    },
    { 
        timestamps: true 
    }
);

// Unique compound index on (assignmentId + role)
ReviewSchema.index({ assignmentId: 1, role: 1 }, { unique: true });
ReviewSchema.index({ reviewerId: 1 });
ReviewSchema.index({ revieweeId: 1 });

export const ReviewModel = mongoose.model<IReview>('Review', ReviewSchema);
