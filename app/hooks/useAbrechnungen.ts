import { useEffect, useState } from "react";
import type { Abrechnung } from "../types/models";
import { apiGet } from "../utils/api";

interface UseAbrechnungenOptions {
  restaurantId?: string;
  geschaeftsDag?: string;
  refresh?: number;
}

export function useAbrechnungen(options: UseAbrechnungenOptions = {}) {
  const [abrechnungen, setAbrechnungen] = useState<Abrechnung[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    setLoading(true);
    
    // Build query string
    const params = new URLSearchParams();
    if (options.restaurantId) params.set('restaurantId', options.restaurantId);
    if (options.geschaeftsDag) params.set('geschaefts_tag', options.geschaeftsDag);
    const queryString = params.toString();
    const url = `/api/abrechnungen${queryString ? `?${queryString}` : ''}`;
    
    apiGet<Abrechnung[]>(url)
      .then(data => {
        setAbrechnungen(data);
        setError(null);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      })
      .finally(() => setLoading(false));

    return () => abortController.abort();
  }, [options.restaurantId, options.geschaeftsDag, options.refresh]);

  return { abrechnungen, loading, error };
}
