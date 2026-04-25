import mongoose, { Schema } from 'mongoose';
import { IReport, REPORT_STATUS } from '../interfaces/report.interface';

const ReportSchema: Schema = new Schema(
    {
        assignmentId: { 
            type: Schema.Types.ObjectId, 
            ref: 'Assignment', 
            required: true 
        },
        reporterId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        reportedUserId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        reason: { 
            type: String, 
            required: true 
        },
        description: { 
            type: String 
        },
        status: { 
            type: String, 
            enum: Object.values(REPORT_STATUS), 
            default: REPORT_STATUS.PENDING 
        }
    },
    { 
        timestamps: true 
    }
);

ReportSchema.index({ reporterId: 1 });
ReportSchema.index({ reportedUserId: 1 });
ReportSchema.index({ status: 1 });

export const ReportModel = mongoose.model<IReport>('Report', ReportSchema);
