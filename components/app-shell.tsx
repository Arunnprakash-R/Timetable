"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";
import { OfflineBanner } from "@/components/offline-banner";

export function AppShell({ children, role }: { children: React.ReactNode; role: string }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <OfflineBanner />
      <Navbar role={role} />
      <main className={cn("mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8", pathname === "/dashboard" ? "space-y-6" : "space-y-8")}>{children}</main>
    </div>
  );
}
