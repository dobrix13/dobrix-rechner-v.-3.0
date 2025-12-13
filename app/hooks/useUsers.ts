import { useEffect, useState } from "react";
import type { User } from "../types/models";
import { apiGet } from "../utils/api";

export function useUsers(orgId?: string, restId?: string, refresh?: number) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    setLoading(true);
    
    apiGet<User[]>("/api/users")
      .then(data => {
        setUsers(data);
        setError(null);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      })
      .finally(() => setLoading(false));

    return () => abortController.abort();
  }, [orgId, restId, refresh]);

  return { users, loading, error };
}
