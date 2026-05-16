import { JobResponseDTO, mapJobToResponseDTO } from "../../job/dtos/jobResponse.dto";
import { IAssignment } from "../interfaces/assignment.interface";

export interface AssignmentResponseDTO {
    id: string;
    jobId: string;
    job: JobResponseDTO | null;
    workStatus: string;
    type: string;
    schedule: {
        startDate: string;
        endDate: string;
    };
    assignedAt: string;
    invitedAt: string;
    respondedAt?: string;
    startedAt?: string;
    completedAt?: string;
    isOutOfDistrict: boolean;
    proof: string[];
    proofDescription?: string;
    coWorkers?: Record<string, unknown>[];
    cancellation?: {
        cancelledBy: string;
        cancelledAt: string;
        reason: string;
        isLateCancel: boolean;
        notes?: string;
    };
    absence?: {
        reportedBy: string;
        reportedAt: string;
        notes?: string;
        evidence?: string[];
    };
    payment?: {
        status: string;
        method?: string;
        amount: number;
        paidAt?: string;
        transactionId?: string;
    };
    assignmentCode: string;
}

export const mapAssignmentToResponseDTO = async (assignment: IAssignment | Record<string, unknown>): Promise<AssignmentResponseDTO> => {
    const a = assignment as unknown as Record<string, unknown>;
    const jobIdObj = a.jobId as Record<string, unknown> | undefined;
    const scheduleObj = a.schedule as { startDate?: Date; endDate?: Date } | undefined;
    const inviteObj = a.invite as { invitedAt?: Date; respondedAt?: Date } | undefined;
    const cancellationObj = a.cancellation as { cancelledBy?: unknown; cancelledAt?: Date; reason?: string; isLateCancel?: boolean; notes?: string } | undefined;
    const absenceObj = a.absence as { reportedBy?: unknown; reportedAt?: Date; notes?: string; evidence?: string[] } | undefined;
    const paymentObj = a.payment as { status?: string; method?: string; amount?: number; paidAt?: Date; transactionId?: string } | undefined;

    return {
        id: a._id ? (a._id as { toString(): string }).toString() : ((a.id as string) || ''),
        jobId: jobIdObj?._id ? (jobIdObj._id as { toString(): string }).toString() : (jobIdObj ? (jobIdObj as { toString(): string }).toString() : ''),
        job: jobIdObj && typeof jobIdObj === 'object' ? await mapJobToResponseDTO(jobIdObj) : null,
        workStatus: (a.workStatus as string) || '',
        type: (a.type as string) || '',
        schedule: {
            startDate: scheduleObj?.startDate ? scheduleObj.startDate.toISOString() : '',
            endDate: scheduleObj?.endDate ? scheduleObj.endDate.toISOString() : '',
        },
        assignedAt: (a.assignedAt as Date) ? (a.assignedAt as Date).toISOString() : '',
        invitedAt: inviteObj?.invitedAt ? inviteObj.invitedAt.toISOString() : '',
        respondedAt: inviteObj?.respondedAt ? inviteObj.respondedAt.toISOString() : '',
        startedAt: (a.startedAt as Date) ? (a.startedAt as Date).toISOString() : '',
        completedAt: (a.completedAt as Date) ? (a.completedAt as Date).toISOString() : '',
        isOutOfDistrict: !!a.isOutOfDistrict,
        proof: (a.proof as string[]) || [],
        proofDescription: (a.proofDescription as string) || '',
        coWorkers: (a.coWorkers as Record<string, unknown>[]) || [],
        cancellation: cancellationObj ? {
            cancelledBy: cancellationObj.cancelledBy ? (cancellationObj.cancelledBy as { toString(): string }).toString() : '',
            cancelledAt: cancellationObj.cancelledAt ? cancellationObj.cancelledAt.toISOString() : '',
            reason: cancellationObj.reason || '',
            isLateCancel: !!cancellationObj.isLateCancel,
            notes: cancellationObj.notes
        } : undefined,
        absence: absenceObj ? {
            reportedBy: absenceObj.reportedBy ? (absenceObj.reportedBy as { toString(): string }).toString() : '',
            reportedAt: absenceObj.reportedAt ? absenceObj.reportedAt.toISOString() : '',
            notes: absenceObj.notes,
            evidence: absenceObj.evidence
        } : undefined,
        payment: paymentObj ? {
            status: paymentObj.status || '',
            method: paymentObj.method,
            amount: paymentObj.amount || 0,
            paidAt: paymentObj.paidAt ? paymentObj.paidAt.toISOString() : '',
            transactionId: paymentObj.transactionId
        } : undefined,
        assignmentCode: (a.assignmentCode as string) || ''
    };
};
