import { useState, useEffect, useCallback, useRef } from "react";
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
  enabled?: boolean;
}

export const useProviders = ({
  skillId,
  locationId,
  sort,
  search,
  enabled = true,
}: UseProvidersParams) => {
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Use a ref to track the last used filters to detect changes
  const lastFiltersRef = useRef({ skillId, locationId, sort, search });
  const filtersChanged = 
    lastFiltersRef.current.skillId !== skillId ||
    lastFiltersRef.current.locationId !== locationId ||
    lastFiltersRef.current.sort !== sort ||
    lastFiltersRef.current.search !== search;

  if (filtersChanged) {
    lastFiltersRef.current = { skillId, locationId, sort, search };
    setPage(1);
  }

  // Prevent fetching if we just triggered a page reset to avoid duplicate calls
  const isResetting = filtersChanged && page !== 1;

  const fetchProviders = useCallback(async () => {
    if (!skillId || !enabled || isResetting) return;
    
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
  }, [skillId, locationId, page, sort, search, enabled, isResetting]);

  useEffect(() => {
    if (enabled && !isResetting) {
      fetchProviders();
    }
  }, [fetchProviders, enabled, isResetting]);

  return { providers, pagination, loading, page, setPage };
};
