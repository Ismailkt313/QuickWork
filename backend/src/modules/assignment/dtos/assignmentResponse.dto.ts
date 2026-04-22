import { JobResponseDTO, mapJobToResponseDTO } from "../../job/dtos/jobResponse.dto";
import { formatDate } from "../../../utils/mapper.utils";

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
    coWorkers?: any[];
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
}

export const mapAssignmentToResponseDTO = async (assignment: any): Promise<AssignmentResponseDTO> => {
    return {
        id: assignment._id ? assignment._id.toString() : assignment.id,
        jobId: assignment.jobId?._id ? assignment.jobId._id.toString() : (assignment.jobId?.toString() || ''),
        job: assignment.jobId && typeof assignment.jobId === 'object' ? await mapJobToResponseDTO(assignment.jobId) : null,
        workStatus: assignment.workStatus,
        type: assignment.type,
        schedule: {
            startDate: assignment.schedule ? formatDate(assignment.schedule.startDate) : '',
            endDate: assignment.schedule ? formatDate(assignment.schedule.endDate) : '',
        },
        assignedAt: assignment.assignedAt ? formatDate(assignment.assignedAt) : '',
        invitedAt: assignment.invite && assignment.invite.invitedAt ? formatDate(assignment.invite.invitedAt) : '',
        respondedAt: assignment.invite && assignment.invite.respondedAt ? formatDate(assignment.invite.respondedAt) : '',
        startedAt: assignment.startedAt ? formatDate(assignment.startedAt) : '',
        completedAt: assignment.completedAt ? formatDate(assignment.completedAt) : '',
        isOutOfDistrict: !!assignment.isOutOfDistrict,
        proof: assignment.proof || [],
        proofDescription: assignment.proofDescription || '',
        coWorkers: assignment.coWorkers || [],
        cancellation: assignment.cancellation ? {
            cancelledBy: assignment.cancellation.cancelledBy?.toString() || '',
            cancelledAt: formatDate(assignment.cancellation.cancelledAt),
            reason: assignment.cancellation.reason,
            isLateCancel: !!assignment.cancellation.isLateCancel,
            notes: assignment.cancellation.notes
        } : undefined,
        absence: assignment.absence ? {
            reportedBy: assignment.absence.reportedBy?.toString() || '',
            reportedAt: formatDate(assignment.absence.reportedAt),
            notes: assignment.absence.notes,
            evidence: assignment.absence.evidence
        } : undefined
    };
};

