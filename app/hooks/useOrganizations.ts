import { useEffect, useState } from "react";
export function useOrganizations() {
  const [organizations, setOrganizations] = useState([]);
  useEffect(() => {
    fetch("/api/organizations")
      .then(res => res.json())
      .then(data => setOrganizations(data));
  }, []);
  return organizations;
}
