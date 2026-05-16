import { JobResponseDTO, mapJobToResponseDTO } from "../../job/dtos/jobResponse.dto";

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

export const mapAssignmentToResponseDTO = async (assignment: {
    _id?: unknown;
    id?: string;
    jobId?: { _id?: unknown; toString: () => string } | unknown;
    workStatus?: string;
    type?: string;
    schedule?: { startDate?: Date; endDate?: Date };
    assignedAt?: Date;
    invite?: { invitedAt?: Date; respondedAt?: Date };
    startedAt?: Date;
    completedAt?: Date;
    isOutOfDistrict?: boolean;
    proof?: string[];
    proofDescription?: string;
    coWorkers?: Record<string, unknown>[];
    cancellation?: { cancelledBy?: unknown; cancelledAt?: Date; reason?: string; isLateCancel?: boolean; notes?: string };
    absence?: { reportedBy?: unknown; reportedAt?: Date; notes?: string; evidence?: string[] };
    payment?: { status?: string; method?: string; amount?: number; paidAt?: Date; transactionId?: string };
    assignmentCode?: string;
}): Promise<AssignmentResponseDTO> => {
    return {
        id: assignment._id ? assignment._id.toString() : assignment.id,
        jobId: assignment.jobId?._id ? assignment.jobId._id.toString() : (assignment.jobId?.toString() || ''),
        job: assignment.jobId && typeof assignment.jobId === 'object' ? await mapJobToResponseDTO(assignment.jobId) : null,
        workStatus: assignment.workStatus,
        type: assignment.type,
        schedule: {
            startDate: assignment.schedule?.startDate ? assignment.schedule.startDate.toISOString() : '',
            endDate: assignment.schedule?.endDate ? assignment.schedule.endDate.toISOString() : '',
        },
        assignedAt: assignment.assignedAt ? assignment.assignedAt.toISOString() : '',
        invitedAt: assignment.invite?.invitedAt ? assignment.invite.invitedAt.toISOString() : '',
        respondedAt: assignment.invite?.respondedAt ? assignment.invite.respondedAt.toISOString() : '',
        startedAt: assignment.startedAt ? assignment.startedAt.toISOString() : '',
        completedAt: assignment.completedAt ? assignment.completedAt.toISOString() : '',
        isOutOfDistrict: !!assignment.isOutOfDistrict,
        proof: assignment.proof || [],
        proofDescription: assignment.proofDescription || '',
        coWorkers: assignment.coWorkers || [],
        cancellation: assignment.cancellation ? {
            cancelledBy: assignment.cancellation.cancelledBy?.toString() || '',
            cancelledAt: assignment.cancellation.cancelledAt ? assignment.cancellation.cancelledAt.toISOString() : '',
            reason: assignment.cancellation.reason,
            isLateCancel: !!assignment.cancellation.isLateCancel,
            notes: assignment.cancellation.notes
        } : undefined,
        absence: assignment.absence ? {
            reportedBy: assignment.absence.reportedBy?.toString() || '',
            reportedAt: assignment.absence.reportedAt ? assignment.absence.reportedAt.toISOString() : '',
            notes: assignment.absence.notes,
            evidence: assignment.absence.evidence
        } : undefined,
        payment: assignment.payment ? {
            status: assignment.payment.status,
            method: assignment.payment.method,
            amount: assignment.payment.amount,
            paidAt: assignment.payment.paidAt ? assignment.payment.paidAt.toISOString() : '',
            transactionId: assignment.payment.transactionId
        } : undefined,
        assignmentCode: assignment.assignmentCode
    };
};
