import * as React from "react";
import { cn } from "@/lib/utils";

export function Avatar({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted", className)}>{children}</div>;
}

export function AvatarImage({ src, alt }: { src?: string | null; alt: string }) {
  if (!src) return null;
  return <img src={src} alt={alt} className="h-full w-full object-cover" />;
}

export function AvatarFallback({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full w-full items-center justify-center text-sm font-semibold">{children}</div>;
}