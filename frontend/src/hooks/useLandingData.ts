import { useState, useEffect, useCallback } from 'react';
import { getLandingData, type Location, type Skill } from '../services/landingService';

const LOCATION_STORAGE_KEY = 'locationId';

export const useLandingData = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | undefined>(
    () => localStorage.getItem(LOCATION_STORAGE_KEY) ?? undefined
  );
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const fetchData = useCallback(async (locationId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLandingData(locationId);
      setSkills(data.skills);
      setLocations(data.locations);
      if (locationId && data.locations.length > 0) {
        const found = data.locations.find((l) => l._id === locationId) ?? null;
        setSelectedLocation(found);
      }
    } catch {
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedLocationId);
  }, [selectedLocationId, fetchData]);

  const selectLocation = (location: Location) => {
    localStorage.setItem(LOCATION_STORAGE_KEY, location._id);
    setSelectedLocation(location);
    setSelectedLocationId(location._id);
  };

  const clearLocation = () => {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
    setSelectedLocation(null);
    setSelectedLocationId(undefined);
  };

  return { skills, locations, loading, error, selectedLocation, selectLocation, clearLocation };
};
