import { useState, useEffect } from "react";
import { api } from "../../../services/api";

export const useProviderLocation = () => {
  const [providerLocation, setProviderLocation] = useState<string>(() => {
    return localStorage.getItem("providerLocationStr") || "Not Set";
  });

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        if (localStorage.getItem("token")) {
          const res = await api.get("/provider/me/profile");
          if (res.data?.success && res.data.data?.location?.name) {
            const locName = res.data.data.location.name;
            setProviderLocation(locName);
            localStorage.setItem("providerLocationStr", locName);
          }
        }
      } catch {
        console.error("Failed to fetch provider location");
      }
    };

    fetchLocation();
  }, []);

  return providerLocation;
};
