import { api } from "../../../services/api";
import { ENDPOINTS } from "../../../constants/endpoints";

export interface Location {
  id: string;
  name: string;
}

export const getLocations = async (): Promise<{
  success: boolean;
  data: Location[];
}> => {
  try {
    const response = await api.get(ENDPOINTS.LOCATION.ALL);
    return response.data;
  } catch {
    return { success: false, data: [] };
  }
};

export interface LocationResult {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export const searchLocation = async (
  query: string,
): Promise<LocationResult[]> => {
  if (!query || query.length < 3) return [];
  try {
    const response = await api.get(ENDPOINTS.LOCATION.LIST, {
      params: { search: query },
    });
    return response.data.data;
  } catch {
    return [];
  }
};

export const selectLocation = async (locationData: {
  name: string;
  lat: number;
  lon: number;
}): Promise<{ id: string }> => {
  const response = await api.post(ENDPOINTS.LOCATION.CREATE, locationData);
  return { id: response.data.data.id };
};
