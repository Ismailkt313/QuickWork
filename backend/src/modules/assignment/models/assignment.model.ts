import mongoose, { Schema } from 'mongoose';
import { IAssignment } from '../interfaces/assignment.interface';
import { ASSIGNMENT_STATUS, WORK_STATUS, ASSIGNMENT_TYPE } from '../../../constants/assignment';
import { PAYMENT_STATUS, PAYMENT_METHOD } from '../../../constants/payment';

const AssignmentSchema: Schema = new Schema(
    {
        jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
        freelancerId: { type: Schema.Types.ObjectId, ref: 'ServiceProvider', required: true },
        type: { type: String, enum: Object.values(ASSIGNMENT_TYPE), required: true },
        invite: {
            status: { type: String, enum: Object.values(ASSIGNMENT_STATUS), default: ASSIGNMENT_STATUS.PENDING },
            invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            invitedAt: { type: Date, default: Date.now },
            respondedAt: { type: Date }
        },
        workStatus: { type: String, enum: Object.values(WORK_STATUS), default: WORK_STATUS.ASSIGNED },
        schedule: {
            startDate: { type: Date, required: true },
            endDate: { type: Date, required: true }
        },
        assignedAt: { type: Date, default: Date.now },
        startedAt: { type: Date },
        completedAt: { type: Date },
        isOutOfDistrict: { type: Boolean, default: false },
        proof: [{ type: String }],
        proofDescription: { type: String },
        cancellation: {
            cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
            cancelledAt: { type: Date },
            reason: { type: String, enum: ['provider_requested', 'client_requested'] },
            isLateCancel: { type: Boolean },
            notes: { type: String }
        },
        absence: {
            reportedBy: { type: Schema.Types.ObjectId, ref: 'User' },
            reportedAt: { type: Date },
            notes: { type: String },
            evidence: [{ type: String }]
        },
        payment: {
            status: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.PENDING },
            method: { type: String, enum: Object.values(PAYMENT_METHOD) },
            amount: { type: Number },
            paidAt: { type: Date },
            transactionId: { type: String }
        }
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

