import { apiClient } from "../api/apiClient";
import type { ServiceCategory } from "../../features/user/jobs/types/job.types";

export class CategoryRepository {
  static async getCategories(): Promise<ServiceCategory[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: ServiceCategory[];
      }>("/skills/list");
      console.log("Categories fetched from API:", response.data);
      return response.data.data;
    } catch {
      throw new Error("Failed to fetch categories");
    }
  }
}
