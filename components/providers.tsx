"use client";

import { ThemeProvider } from "next-themes";
import { DevServiceWorkerCleanup } from "@/components/dev-sw-cleanup";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <DevServiceWorkerCleanup />
      {children}
    </ThemeProvider>
  );
}