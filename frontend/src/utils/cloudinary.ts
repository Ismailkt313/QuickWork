import axios from "axios";
import { api } from "../services/api";

export interface CloudinarySignatureResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export const getUploadSignature = async (
  folder: string,
): Promise<CloudinarySignatureResponse> => {
  try {
    const response = await api.get(`/upload/signature`, {
      params: { folder },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching upload signature:", error);
    throw error;
  }
};

export const uploadToCloudinary = async (file: File, folder: string) => {
  try {
    const signatureData = await getUploadSignature(folder);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signatureData.apiKey);
    formData.append("timestamp", signatureData.timestamp.toString());
    formData.append("signature", signatureData.signature);
    formData.append("folder", signatureData.folder);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
      formData,
    );

    return {
      secure_url: response.data.secure_url,
      public_id: response.data.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw error;
  }
};
