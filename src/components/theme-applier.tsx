import { useEffect } from "react";
import { useUI } from "@/stores/ui";

export function ThemeApplier() {
  const theme = useUI((s) => s.theme);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return null;
}
