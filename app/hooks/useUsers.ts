import { useEffect, useState } from "react";
export function useUsers(orgId?: string, restId?: string, refresh?: any) {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(data => setUsers(data));
  }, [orgId, restId, refresh]);
  return users;
}
