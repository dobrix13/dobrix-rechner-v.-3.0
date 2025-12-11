import { useEffect, useState } from "react";
export function useAbrechnungen(deps: any[] = []) {
  const [abrechnungen, setAbrechnungen] = useState([]);
  useEffect(() => {
    fetch("/api/abrechnungen")
      .then(res => res.json())
      .then(data => setAbrechnungen(data));
  }, deps);
  return abrechnungen;
}
