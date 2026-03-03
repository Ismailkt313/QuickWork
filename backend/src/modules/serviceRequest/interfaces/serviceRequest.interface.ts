import { Document, Types } from "mongoose";

export interface IServiceRequest extends Document {
    name: string;
    slug: string;
    description: string;
    requestedBy: Types.ObjectId;
    status: 'pending' | 'approved' | 'rejected';
    reviewedBy?: Types.ObjectId;
    reviewedAt?: Date;
    rejectionReason?: string;
    createdAt: Date;
}
