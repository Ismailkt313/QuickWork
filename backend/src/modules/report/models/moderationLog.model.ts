import mongoose, { Schema, Document } from 'mongoose';

export interface IModerationLog extends Document {
    userId: mongoose.Types.ObjectId;
    reportId: mongoose.Types.ObjectId;
    action: 'warn' | 'block' | 'reject';
    reason: string;
    adminId: mongoose.Types.ObjectId;
    createdAt: Date;
}

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
