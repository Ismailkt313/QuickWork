import { useState, useEffect, useCallback } from "react";
import {
  getProviders,
  type ProviderItem,
  type PaginationInfo,
} from "../../user/serviceProviders/services/providersService";

interface UseProvidersParams {
  skillId: string;
  locationId?: string;
  sort?: string;
  search?: string;
}

export const useProviders = ({
  skillId,
  locationId,
  sort,
  search,
}: UseProvidersParams) => {
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchProviders = useCallback(async () => {
    if (!skillId) return;
    setLoading(true);
    try {
      const res = await getProviders({ skillId, locationId, page, sort, search });
      setProviders(res.data || []);
      setPagination(res.pagination || null);
    } catch {
      setProviders([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [skillId, locationId, page, sort, search]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  useEffect(() => {
    setPage(1);
  }, [skillId, locationId, sort, search]);

  return { providers, pagination, loading, page, setPage };
};
