import { IAssignment } from "../interfaces/assignment.interface";
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
}

export const mapAssignmentToResponseDTO = (assignment: any): AssignmentResponseDTO => {
    return {
        id: assignment._id ? assignment._id.toString() : assignment.id,
        jobId: assignment.jobId?._id ? assignment.jobId._id.toString() : (assignment.jobId?.toString() || ''),
        job: assignment.jobId && typeof assignment.jobId === 'object' ? mapJobToResponseDTO(assignment.jobId) : null,
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
        coWorkers: assignment.coWorkers || []
    };
};

