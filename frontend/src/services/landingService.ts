import { api } from "./api";

export interface Location {
  _id: string;
  name: string;
  slug?: string;
  lat?: number;
  lon?: number;
}

export interface Skill {
  _id: string;
  name: string;
  slug?: string;
  icon?: string;
}

export interface LandingData {
  skills: Skill[];
  locations: Location[];
}

export const getLandingData = async (locationId?: string): Promise<LandingData> => {
  const params = locationId ? { locationId } : {};
  const response = await api.get('/landing', { params });
  return response.data.data;
};