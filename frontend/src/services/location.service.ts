    import axios from "axios";
import { api }from '../api';

const GEOAPIFY_API_KEY = '5c34647bd3d24bf3a94a281cdb1d8a50';

export interface LocationResult {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export const searchLocation = async (
  query: string
): Promise<LocationResult[]> => {
  if (!query || query.length < 3) return [];

  try {
    const response = await axios.get(
      "https://api.geoapify.com/v1/geocode/autocomplete",
      {
        params: {
          text: query,
          apiKey: GEOAPIFY_API_KEY,
        },
      }
    );

    return response.data.features.map((feature: any) => ({
      id: feature.properties.place_id,
      name: feature.properties.formatted,
      lat: feature.geometry.coordinates[1],
      lon: feature.geometry.coordinates[0],
    }));
  } catch (error) {
    console.error("Error searching location:", error);
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
    console.error("Error persisting location:", error);
    throw error;
  }
};