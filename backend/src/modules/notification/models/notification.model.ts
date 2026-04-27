import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    recipient: mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: 'JOB_ASSIGNMENT' | 'JOB_STATUS' | 'PAYMENT' | 'SYSTEM' | 'REVIEW';
    link?: string;
    isRead: boolean;
    createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
    {
        recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: { 
            type: String, 
            enum: ['JOB_ASSIGNMENT', 'JOB_STATUS', 'PAYMENT', 'SYSTEM', 'REVIEW'],
            default: 'SYSTEM'
        },
        link: { type: String },
        isRead: { type: Boolean, default: false }
    },
    { 
        timestamps: { createdAt: true, updatedAt: false } 
    }
);

NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1 });

export const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);
