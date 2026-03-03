import { api } from '../api';

export interface LocationResult {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export const searchLocation = async (query: string): Promise<LocationResult[]> => {
  if (!query || query.length < 3) return [];
  try {
    const response = await api.get("/locations", {
      params: { search: query }
    });
    return response.data.data;
  } catch (error) {
    
    return [];
  }
};

export const selectLocation = async (
  locationData: { name: string; lat: number; lon: number }
): Promise<{ id: string }> => {
  try {
    const response = await api.post("/locations", locationData);
    return { id: response.data.data.id };
  } catch (error) {
    
    throw error;
  }
};