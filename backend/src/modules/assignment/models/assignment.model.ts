import mongoose, { Schema } from 'mongoose';
import { IAssignment } from '../interfaces/assignment.interface';

const AssignmentSchema: Schema = new Schema(
    {
        jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
        freelancerId: { type: Schema.Types.ObjectId, ref: 'ServiceProvider', required: true },
        type: { type: String, enum: ['open', 'direct'], required: true },
        invite: {
            status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
            invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            invitedAt: { type: Date, default: Date.now },
            respondedAt: { type: Date }
        },
        workStatus: { type: String, enum: ['assigned', 'in_progress', 'completed', 'cancelled'], default: 'assigned' },
        schedule: {
            startDate: { type: Date, required: true },
            endDate: { type: Date, required: true }
        },
        assignedAt: { type: Date, default: Date.now },
        startedAt: { type: Date },
        completedAt: { type: Date },
        isOutOfDistrict: { type: Boolean, default: false },
        proof: [{ type: String }],
        proofDescription: { type: String }
    },
    { 
        timestamps: true 
    }
);

AssignmentSchema.index({ freelancerId: 1 });
AssignmentSchema.index({ jobId: 1 });
AssignmentSchema.index({ workStatus: 1 });
AssignmentSchema.index({ 'schedule.startDate': 1 });
AssignmentSchema.index({ 'schedule.endDate': 1 });

AssignmentSchema.index({ jobId: 1, freelancerId: 1 }, { unique: true });

export const AssignmentModel = mongoose.model<IAssignment>('Assignment', AssignmentSchema);

