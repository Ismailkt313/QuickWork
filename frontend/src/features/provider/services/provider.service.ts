import { AxiosError } from "axios";
import { api } from "../../../services/api";
import { ENDPOINTS } from "../../../constants/endpoints";
import { cloudinaryService } from "../../../services/cloudinaryService";
import type { Availability } from "../store/availabilitySlice";

interface BaseResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface ProviderApplicationPayload {
  headline: string;
  about: string;
  profileImage: string;
  skills: string[];
  yearsOfExperience: number;
  hourlyRate: number;
  location: { id: string; name: string; lat?: number; lon?: number };
  portfolio: {
    title: string;
    description: string;
    images: string[];
  }[];
}

export const submitProviderApplication = async (
  data: ProviderApplicationPayload,
): Promise<BaseResponse<{ accessToken: string; refreshToken: string }>> => {
  try {
    const response = await api.post(ENDPOINTS.PROVIDER.APPLY, data);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw new Error(
      err.response?.data?.message || "Failed to submit application",
    );
  }
};

export const availableJobs = async (
  page?: number,
  limit?: number,
  skillId?: string,
  locationId?: string,
  minBudget?: number,
  maxBudget?: number,
  search?: string,
) => {
  try {
    const response = await api.get(ENDPOINTS.JOB.AVAILABLE, {
      params: {
        page,
        limit,
        skillId,
        locationId,
        minBudget,
        maxBudget,
        search,
      },
    });
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw new Error(
      err.response?.data?.message || "Failed to fetch available jobs",
    );
  }
};

export const fetchallskills = async () => {
  try {
    const response = await api.get(ENDPOINTS.SKILLS.LIST);
    return response.data;
  } catch {
    return { success: false, message: "Failed to fetch all skills" };
  }
};

export const fetchSkills = async () => {
  try {
    const response = await api.get(ENDPOINTS.SKILLS.MY);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message || "Failed to fetch skills");
  }
};

export const fetchLocations = async () => {
  try {
    const response = await api.get(ENDPOINTS.LOCATION.ALL);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw new Error(
      err.response?.data?.message || "Failed to fetch locations",
    );
  }
};

export const acceptJob = async (jobId: string) => {
  try {
    const response = await api.post(ENDPOINTS.JOB.ACCEPT(jobId));
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to accept job");
    }
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw new Error(
      err.response?.data?.message || err.message || "Failed to accept job",
    );
  }
};

export const acceptOffer = async (jobId: string) => {
  try {
    const response = await api.put(ENDPOINTS.JOB.OFFER_ACCEPT(jobId));
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to accept offer");
    }
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw new Error(
      err.response?.data?.message ||
      err.message ||
      "Failed to accept offer",
    );
  }
};

export const rejectOffer = async (jobId: string) => {
  try {
    const response = await api.put(ENDPOINTS.JOB.OFFER_REJECT(jobId));

    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message || "Failed to reject offer");
  }
};

export const getAssignments = async (
  page: number = 1,
  limit: number = 10,
  search: string = "",
  status: string = "all",
) => {
  try {
    const response = await api.get(ENDPOINTS.ASSIGNMENT.MY, {
      params: { page, limit, search, status },
    });
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw new Error(
      err.response?.data?.message || "Failed to fetch assignments",
    );
  }
};

export const getAssignmentById = async (id: string) => {
  try {
    const response = await api.get(ENDPOINTS.ASSIGNMENT.DETAILS(id));
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw new Error(
      err.response?.data?.message || "Failed to fetch assignment details",
    );
  }
};

export const updateAssignmentStatus = async (id: string, status: string) => {
  try {
    const response = await api.patch(ENDPOINTS.ASSIGNMENT.UPDATE_STATUS(id), { status });
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message || "Failed to update status");
  }
};

export const submitAssignmentProof = async (
  id: string,
  data: { images: string[]; description: string },
) => {
  try {
    const response = await api.post(ENDPOINTS.ASSIGNMENT.SUBMIT_PROOF(id), data);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message || "Failed to submit proof");
  }
};

export const getMyProfile = async <T = unknown>(): Promise<BaseResponse<T>> => {
  try {

    const response = await api.get(ENDPOINTS.PROVIDER.PROFILE);

    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message || "Failed to fetch profile");
  }
};

export const updateProviderProfile = async (
  data: unknown,
): Promise<BaseResponse> => {
  try {
    const response = await api.patch(ENDPOINTS.PROVIDER.PROFILE, data);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw new Error(
      err.response?.data?.message || "Failed to update profile",
    );
  }
};

export const uploadImage = async (
  file: File,
  type: "profile" | "portfolio",
): Promise<{
  success: boolean;
  data: { imageUrl: string; publicId: string };
}> => {
  try {
    const folder =
      type === "profile"
        ? "quickwork/profile-images"
        : "quickwork/portfolio-images";
    const result = await cloudinaryService.uploadImage(file, folder);
    return {
      success: true,
      data: {
        imageUrl: result.secure_url,
        publicId: result.public_id,
      },
    };
  } catch (error) {
    const err = error as Error;
    throw new Error(err.message || "Image upload failed");
  }
};

export const uploadMultipleImages = async (
  files: FileList | File[],
): Promise<{
  success: boolean;
  data: { imageUrl: string; publicId: string }[];
}> => {
  try {
    const results = await Promise.all(
      Array.from(files).map((file) =>
        cloudinaryService.uploadImage(file, "quickwork/assignment-proofs"),
      ),
    );
    return {
      success: true,
      data: results.map((r) => ({
        imageUrl: r.secure_url,
        publicId: r.public_id,
      })),
    };
  } catch (error) {
    const err = error as Error;
    throw new Error(err.message || "Multi-image upload failed");
  }
};

export const resetProviderApplication = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await api.post(ENDPOINTS.PROVIDER.RESET);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw new Error(
      err.response?.data?.message || "Failed to reset application",
    );
  }
};

export const cancelAssignmentByProvider = async (
  id: string,
  notes?: string,
) => {
  try {
    const response = await api.post(ENDPOINTS.ASSIGNMENT.CANCEL_BY_PROVIDER(id), {
      notes,
    });
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw new Error(
      err.response?.data?.message || "Failed to cancel assignment",
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
    const err = error as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message || "Failed to submit review");
  }
};

export const updateReview = async (id: string, reviewData: {
  rating: number;
  comment: string;
  images?: string[];
}) => {
  try {
    const response = await api.put(ENDPOINTS.REVIEW.BY_ID(id), reviewData);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message || "Failed to update review");
  }
};

export const deleteReview = async (id: string) => {
  try {
    const response = await api.delete(ENDPOINTS.REVIEW.BY_ID(id));
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message || "Failed to delete review");
  }
};

export const getReviewsForAssignment = async (assignmentId: string) => {
  try {
    const response = await api.get(ENDPOINTS.REVIEW.ASSIGNMENT(assignmentId));
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message || "Failed to fetch reviews");
  }
};

export const getReviewsForUser = async (userId: string, page = 1, limit = 10) => {
  try {
    const response = await api.get(ENDPOINTS.REVIEW.USER(userId), {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message || "Failed to fetch user reviews");
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
    const err = error as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message || "Failed to submit report");
  }
};

export const confirmPayment = async (id: string) => {
  try {
    const response = await api.post(ENDPOINTS.ASSIGNMENT.CONFIRM_CASH(id));
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message || "Failed to confirm payment");
  }
};

export const providerMarkAsPaid = async (id: string) => {
  try {
    const response = await api.post(ENDPOINTS.ASSIGNMENT.PROVIDER_MARK_PAID(id));
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message || "Failed to mark as paid");
  }
};

export const rejectPayment = async (id: string) => {
  try {
    const response = await api.post(ENDPOINTS.ASSIGNMENT.REJECT_PAYMENT(id));
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw new Error(err.response?.data?.message || "Failed to reject payment");
  }
};

export const providerService = {
  submitProviderApplication,
  availableJobs,
  fetchallskills,
  fetchSkills,
  fetchLocations,
  acceptJob,
  acceptOffer,
  rejectOffer,
  getAssignments,
  getAssignmentById,
  updateAssignmentStatus,
  submitAssignmentProof,
  getMyProfile,
  updateProviderProfile,
  uploadImage,
  uploadMultipleImages,
  resetProviderApplication,
  cancelAssignmentByProvider,
  submitReview,
  updateReview,
  deleteReview,
  getReviewsForAssignment,
  getReviewsForUser,
  submitReport,
  confirmPayment,
  providerMarkAsPaid,
  rejectPayment,

  updateAvailability: async (availability: Availability[]) => {
    const response = await api.patch(ENDPOINTS.PROVIDER.AVAILABILITY, { availability });
    return response.data;
  },

  addBlockedDate: async (data: { startDate: string; endDate: string; reason: string }) => {
    const response = await api.post(ENDPOINTS.PROVIDER.BLOCKED_DATES, data);
    return response.data;
  },

  deleteBlockedDate: async (id: string) => {
    const response = await api.delete(ENDPOINTS.PROVIDER.BLOCKED_DATES_DELETE(id));
    return response.data;
  },
};
