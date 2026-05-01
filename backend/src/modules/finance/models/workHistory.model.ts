import mongoose, { Schema } from 'mongoose';
import { IWorkHistory } from '../interfaces/finance.interface';

const WorkHistorySchema = new Schema<IWorkHistory>({
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    providerId: { type: Schema.Types.ObjectId, ref: 'ServiceProvider', required: true },
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    finalStatus: { type: String, enum: ['COMPLETED', 'CANCELLED', 'ABSENT'], required: true },
    assignedAt: { type: Date, required: true },
    startedAt: { type: Date },
    endedAt: { type: Date, default: Date.now },
    payment: {
        method: { type: String, enum: ['CASH', 'ONLINE'], required: true },
        totalAmount: { type: Number, required: true },
        platformFee: { type: Number, required: true },
        providerAmount: { type: Number, required: true },
        status: { type: String, enum: ['pending', 'awaiting_confirmation', 'completed'], default: 'pending' },
        confirmedAt: { type: Date }
    }
}, { timestamps: true });

WorkHistorySchema.index({ providerId: 1 });
WorkHistorySchema.index({ clientId: 1 });
WorkHistorySchema.index({ jobId: 1 });

export const WorkHistoryModel = mongoose.model<IWorkHistory>('WorkHistory', WorkHistorySchema);
