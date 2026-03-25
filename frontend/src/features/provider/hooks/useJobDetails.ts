import { useState, useEffect } from 'react';
import type { JobDetail } from '../types/job';
import { api } from '../../../services/api';

export const useJobDetails = (jobId: string | undefined) => {
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/jobs/${jobId}`);
        setJob(response.data.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch job details');
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  return { job, loading, error };
};
