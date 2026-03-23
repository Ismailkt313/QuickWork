import { useState, useEffect, useCallback } from 'react';
import { getProviders, type ProviderItem, type PaginationInfo } from '../../user/serviceProviders/services/providersService';

interface UseProvidersParams {
    skillId: string;
    locationId?: string;
    sort?: string;
}

export const useProviders = ({ skillId, locationId, sort }: UseProvidersParams) => {
    const [providers, setProviders] = useState<ProviderItem[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const fetchProviders = useCallback(async () => {
        if (!skillId) return;
        setLoading(true);
        try {
            const data = await getProviders({ skillId, locationId, page, sort });
            setProviders(data.providers);
            setPagination(data.pagination);
        } catch {
            setProviders([]);
            setPagination(null);
        } finally {
            setLoading(false);
        }
    }, [skillId, locationId, page, sort]);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    useEffect(() => {
        setPage(1);
    }, [skillId, locationId, sort]);

    return { providers, pagination, loading, page, setPage };
};
