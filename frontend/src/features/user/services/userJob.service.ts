import { AxiosError } from "axios";
import { api } from "../../../services/api";
import { ENDPOINTS } from "../../../constants/endpoints";

export interface UserJob {
  id: string;
  title: string;
  description: string;
  skillId: string;
  locationId: string;
  budget: string;
  status:
    | "open"
    | "partially_assigned"
    | "fully_assigned"
    | "in_progress"
    | "completed"
    | "cancelled";
  visibility: "public" | "private";
  createdAt: string;
  schedule: {
    startDate: string;
    endDate: string;
  };
  categoryName?: string;
  skills?: string[];
  locationName?: string;
  hasPendingPayment?: boolean;
  providers?: {
    providerId: string;
    finalStatus: string;
    payment: {
      status: string;
      totalAmount: number;
    };
  }[];
}

export const getUserJobs = async (
  page: number = 1,
  limit: number = 10,
  status?: string,
  search?: string,
) => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (status && status !== "all") params.append("status", status);
    if (search) params.append("search", search);

    const response = await api.get(`${ENDPOINTS.JOB.MY}?${params.toString()}`);
    console.log("User Jobs Response:", response.data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message || "Operation failed",
    );
  }
};

export const cancelJob = async (jobId: string) => {
  try {
    console.log("Cancelling job:", jobId);
    const response = await api.put(ENDPOINTS.JOB.CANCEL(jobId));
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(axiosError.response?.data?.message || "Failed to cancel job");
  }
};

export const getJobDetails = async (jobId: string) => {
  try {
    const response = await api.get(ENDPOINTS.JOB.DETAILS(jobId));
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to fetch job details",
    );
  }
};

export const getJobAssignments = async (jobId: string) => {
  try {
    const response = await api.get(ENDPOINTS.JOB.ASSIGNMENTS(jobId));
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to fetch assignments",
    );
  }
};

export const userProfile = async () => {
  try {
    const response = await api.get(ENDPOINTS.USER.PROFILE);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(axiosError.response?.data?.message || "Failed to fetch profile");
  }
};
export const cancelAssignmentByClient = async (
  assignmentId: string,
  notes?: string,
) => {
  try {
    const response = await api.post(
      ENDPOINTS.ASSIGNMENT.CANCEL_BY_CLIENT(assignmentId),
      { notes },
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to cancel assignment",
    );
  }
};

export const reportAbsence = async (
  assignmentId: string,
  notes: string,
  evidence?: string[],
) => {
  try {
    const response = await api.post(ENDPOINTS.ASSIGNMENT.ABSENCE(assignmentId), {
      notes,
      evidence,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to report absence",
    );
  }
};

export const submitReview = async (reviewData: {
  assignmentId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  images?: string[];
  role: "client_to_provider" | "provider_to_client";
}) => {
  try {
    const response = await api.post(ENDPOINTS.REVIEW.CREATE, reviewData);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(axiosError.response?.data?.message || "Failed to submit review");
  }
};

export const submitReport = async (reportData: {
  assignmentId: string;
  reportedUserId: string;
  reason: string;
  description: string;
  images: string[];
  role: "client_to_provider" | "provider_to_client";
}) => {
  try {
    const response = await api.post(ENDPOINTS.REPORT.CREATE, reportData);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(axiosError.response?.data?.message || "Failed to submit report");
  }
};

export const markAsPaidByCash = async (assignmentId: string) => {
  try {
    const response = await api.post(ENDPOINTS.ASSIGNMENT.MARK_PAID_CASH(assignmentId));
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(axiosError.response?.data?.message || "Failed to mark as paid");
  }
};
