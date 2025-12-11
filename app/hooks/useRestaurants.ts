import { useEffect, useState } from "react";
export function useRestaurants(orgId?: string, refresh?: boolean) {
  const [restaurants, setRestaurants] = useState([]);
  useEffect (() => {
    if (orgId) {
      fetch(`/api/organizations/${orgId}/restaurants`)
        .then(res => res.json())
        .then(data => setRestaurants(data));
    }
  }, [orgId, refresh]);
  return restaurants;
}
