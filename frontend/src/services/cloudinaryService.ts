import axios from "axios";
import { apiClient } from "./api/apiClient";

export interface CloudinarySignatureResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
}

export const cloudinaryService = {
  async uploadImage(
    file: File,
    folder: string = "quickwork/general",
  ): Promise<CloudinaryUploadResponse> {
    try {
      const {
        data: { data: signatureData },
      } = await apiClient.get<{
        success: boolean;
        data: CloudinarySignatureResponse;
      }>(`/upload/signature?folder=${folder}`);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signatureData.apiKey);
      formData.append("timestamp", signatureData.timestamp.toString());
      formData.append("signature", signatureData.signature);
      formData.append("folder", signatureData.folder);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`;

      const response = await axios.post<CloudinaryUploadResponse>(
        cloudinaryUrl,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw new Error("Failed to upload image to Cloudinary");
    }
  },
};
