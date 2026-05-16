import mongoose, { Schema } from 'mongoose';
import { IModerationLog } from '../interfaces/report.interface';

const ModerationLogSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reportId: { type: Schema.Types.ObjectId, ref: 'Report', required: true },
    action: {
        type: String,
        enum: ['warn', 'block', 'reject'],
        required: true
    },
    reason: { type: String, required: true },
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

ModerationLogSchema.index({ userId: 1 });
ModerationLogSchema.index({ reportId: 1 });
ModerationLogSchema.index({ adminId: 1 });

export const ModerationLogModel = mongoose.model<IModerationLog>('ModerationLog', ModerationLogSchema);

