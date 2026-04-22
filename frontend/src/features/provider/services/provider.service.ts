import { api } from "../../../services/api";
import { cloudinaryService } from "../../../services/cloudinaryService";

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
): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const response = await api.post("/provider/apply", data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to submit application",
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
    const response = await api.get("/job/availablejobs", {
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
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch available jobs",
    );
  }
};

export const fetchallskills = async () => {
  try {
    const response = await api.get("/skills");
    return response.data;
  } catch (error) {}
};

export const fetchSkills = async () => {
  try {
    const response = await api.get("/skills/my/skills");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch skills");
  }
};

export const fetchLocations = async () => {
  try {
    const response = await api.get("/locations/all");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch locations",
    );
  }
};

export const acceptJob = async (jobId: string) => {
  try {
    const response = await api.post(`/job/${jobId}/accept`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to accept job");
    }
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to accept job",
    );
  }
};

export const acceptOffer = async (jobId: string) => {
  try {
    const response = await api.put(`/job/offers/${jobId}/accept`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to accept offer");
    }
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to accept offer",
    );
  }
};

export const rejectOffer = async (jobId: string) => {
  try {
    const response = await api.put(`/job/offers/${jobId}/reject`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to reject offer");
  }
};

export const getAssignments = async (
  page: number = 1,
  limit: number = 10,
  search: string = "",
  status: string = "all",
) => {
  try {
    const response = await api.get("/assignment/my", {
      params: { page, limit, search, status },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch assignments",
    );
  }
};

export const getAssignmentById = async (id: string) => {
  try {
    const response = await api.get(`/assignment/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch assignment details",
    );
  }
};

export const updateAssignmentStatus = async (id: string, status: string) => {
  try {
    const response = await api.patch(`/assignment/${id}/status`, { status });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update status");
  }
};

export const submitAssignmentProof = async (
  id: string,
  data: { images: string[]; description: string },
) => {
  try {
    const response = await api.post(`/assignment/${id}/proof`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to submit proof");
  }
};

export const getMyProfile = async (): Promise<{
  success: boolean;
  data?: any;
  message?: string;
}> => {
  try {
    console.log("Fetching profile...");
    const response = await api.get("/provider/profile");
    console.log(response.data, "response.data");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch profile");
  }
};

export const updateProviderProfile = async (
  data: any,
): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const response = await api.patch("/provider/profile", data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update profile",
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
  } catch (error: any) {
    throw new Error(error.message || "Image upload failed");
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
  } catch (error: any) {
    throw new Error(error.message || "Multi-image upload failed");
  }
};

export const resetProviderApplication = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await api.post("/provider/reset");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to reset application",
    );
  }
};

export const cancelAssignmentByProvider = async (
  id: string,
  notes?: string,
) => {
  try {
    const response = await api.post(`/assignment/${id}/cancel-by-provider`, {
      notes,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to cancel assignment",
    );
  }
};
