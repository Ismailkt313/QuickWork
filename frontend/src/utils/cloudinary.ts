import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface CloudinarySignatureResponse {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    folder: string;
}

export const getUploadSignature = async (folder: string): Promise<CloudinarySignatureResponse> => {
    const token = localStorage.getItem('accessToken');
    const response = await axios.get(`${API_URL}/upload/signature`, {
        params: { folder },
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data.data;
};

export const uploadToCloudinary = async (file: File, folder: string) => {
    const signatureData = await getUploadSignature(folder);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signatureData.apiKey);
    formData.append('timestamp', signatureData.timestamp.toString());
    formData.append('signature', signatureData.signature);
    formData.append('folder', signatureData.folder);

    const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
        formData
    );

    return {
        secure_url: response.data.secure_url,
        public_id: response.data.public_id
    };
};
