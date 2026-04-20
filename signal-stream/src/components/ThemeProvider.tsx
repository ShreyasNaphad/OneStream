"use client";

import { useEffect } from "react";
import { useSourceStore } from "@/store/useSourceStore";

/**
 * Applies the persisted theme class ('dark' or 'light') to <html>
 * on first client mount. This must be a client component.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSourceStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  return <>{children}</>;
}
