import { useState, useEffect } from 'react';
import { api } from '../../../services/api';

export const useProviderLocation = () => {
    const [providerLocation, setProviderLocation] = useState<string>('Not Set');

    useEffect(() => {
        const cachedStr = localStorage.getItem('providerLocationStr');
        if (cachedStr) {
            setProviderLocation(cachedStr);
        }

        const fetchLocation = async () => {
            try {
                if (localStorage.getItem('token')) {
                    const res = await api.get('/provider/me/profile');
                    if (res.data?.success && res.data.data?.location?.name) {
                        const locName = res.data.data.location.name;
                        setProviderLocation(locName);
                        localStorage.setItem('providerLocationStr', locName);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch provider location');
            }
        };

        fetchLocation();
    }, []);

    return providerLocation;
};
