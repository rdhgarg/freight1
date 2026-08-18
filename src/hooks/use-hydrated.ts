import { useEffect, useState } from "react";

/**
 * Returns true only after client mount, so SSR HTML and the first client
 * render match (persisted zustand stores rehydrate after hydration).
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
