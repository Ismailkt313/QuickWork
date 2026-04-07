import { Adminapi } from "./adminApi";
import { SKILL_STATUS } from "../../../constants/skill";

export interface ServiceRequest {
    _id: string;
    userId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    requestedBy: {
        _id: string;
        name: string;
    };
    name: string;
    description: string;
    status: SKILL_STATUS;
    type: 'skill_addition' | 'other';
    priority: 'low' | 'medium' | 'high';
    adminNotes?: string;
    createdAt: string;
    updatedAt: string;
}

export const getPendingServiceRequests = async (): Promise<ServiceRequest[]> => {
    try {
        const response = await Adminapi.get("/admin/service-requests");
        return response.data.data;
    } catch (error) {
        
        throw error;
    }
};

export const approveServiceRequest = async (id: string, notes?: string): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await Adminapi.patch(`/admin/service-request/${id}/approve`, { notes });
        return response.data;
    } catch (error: any) {
        
        throw new Error(error.response?.data?.message || "Failed to approve request");
    }
};

export const rejectServiceRequest = async (id: string, reason: string): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await Adminapi.patch(`/admin/service-request/${id}/reject`, { reason });
        return response.data;
    } catch (error: any) {
        
        throw new Error(error.response?.data?.message || "Failed to reject request");
    }
};
