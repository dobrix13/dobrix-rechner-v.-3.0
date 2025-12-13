import { useEffect, useState } from "react";
import type { Restaurant } from "../types/models";
import { apiGet } from "../utils/api";

export function useRestaurants(orgId?: string, refresh?: number) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orgId) {
      setRestaurants([]);
      return;
    }

    const abortController = new AbortController();
    setLoading(true);
    
    apiGet<Restaurant[]>(`/api/organizations/${orgId}/restaurants`)
      .then(data => {
        setRestaurants(data);
        setError(null);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      })
      .finally(() => setLoading(false));

    return () => abortController.abort();
  }, [orgId, refresh]);

  return { restaurants, loading, error };
}
