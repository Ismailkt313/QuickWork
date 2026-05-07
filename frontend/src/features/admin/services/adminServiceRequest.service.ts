import { Adminapi } from "./adminApi";
import { SKILL_STATUS } from "../../../constants/skill";
import type { IPaginatedResponse } from "../../../types/api.types";
import axios from "axios";

export interface ServiceRequest {
  _id: string;
  requestedBy: {
    _id: string;
    name: string;
    email: string;
  };
  name: string;
  description: string;
  status: SKILL_STATUS;
  adminNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export const getPendingServiceRequests = async (params?: {
  page?: number;
  limit?: number;
}): Promise<IPaginatedResponse<ServiceRequest>> => {
  const response = await Adminapi.get<IPaginatedResponse<ServiceRequest>>("/admin/service-requests", { params });
  return response.data;
};

export const approveServiceRequest = async (
  id: string,
  notes?: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await Adminapi.patch(
      `/admin/service-request/${id}/approve`,
      { notes },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to approve request",
      );
    }
    throw error;
  }
};

export const rejectServiceRequest = async (
  id: string,
  rejectionReason: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await Adminapi.patch(
      `/admin/service-request/${id}/reject`,
      { rejectionReason },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to reject request",
      );
    }
    throw error;
  }
};
