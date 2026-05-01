import { AxiosError } from "axios";
import { api } from "../../../services/api";

export interface Review {
  id: string;
  assignmentId: string;
  reviewerId: {
    id: string;
    name: string;
  };
  revieweeId: {
    id: string;
    name: string;
  };
  role: string;
  rating: number;
  comment?: string;
  images?: string[];
  createdAt: string;
}

export const reviewService = {
  getMyReviews: async (): Promise<Review[]> => {
    try {
      const response = await api.get("/review/me");
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      throw new Error(axiosError.response?.data?.message || "Failed to fetch reviews");
    }
  },

  getReviewsForUser: async (userId: string): Promise<Review[]> => {
    try {
      const response = await api.get(`/review/user/${userId}`);
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      throw new Error(axiosError.response?.data?.message || "Failed to fetch user reviews");
    }
  }
};
