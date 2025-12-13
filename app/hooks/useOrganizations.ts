import { useEffect, useState } from "react";
import type { Organization } from "../types/models";
import { apiGet } from "../utils/api";

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    
    apiGet<Organization[]>("/api/organizations")
      .then(data => {
        setOrganizations(data);
        setError(null);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      })
      .finally(() => setLoading(false));

    return () => abortController.abort();
  }, []);

  return { organizations, loading, error };
}
