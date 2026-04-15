"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const TabsContext = React.createContext<{ value: string; setValue: (value: string) => void } | null>(null);

export function Tabs({ value, onValueChange, children }: { value: string; onValueChange: (value: string) => void; children: React.ReactNode }) {
  return <TabsContext.Provider value={{ value, setValue: onValueChange }}>{children}</TabsContext.Provider>;
}

export function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("inline-flex rounded-xl bg-muted p-1", className)}>{children}</div>;
}

export function TabsTrigger({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const active = context.value === value;
  return (
    <button
      type="button"
      onClick={() => context.setValue(value)}
      className={cn(
        "rounded-lg px-3 py-2 text-sm font-medium transition",
        active ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");
  if (context.value !== value) return null;
  return <div className={cn("mt-4", className)}>{children}</div>;
}