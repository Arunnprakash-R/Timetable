"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const DropdownMenuContext = React.createContext<{ open: boolean; setOpen: (value: boolean) => void } | null>(null);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ children }: { children: React.ReactElement }) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error("DropdownMenuTrigger must be used within DropdownMenu");

  return React.cloneElement(children, {
    onClick: () => context.setOpen(!context.open),
  });
}

export function DropdownMenuContent({ className, children }: { className?: string; children: React.ReactNode }) {
  const context = React.useContext(DropdownMenuContext);
  if (!context?.open) return null;

  return <div className={cn("absolute right-0 z-50 mt-2 w-56 rounded-2xl border bg-card p-2 shadow-xl", className)}>{children}</div>;
}

export function DropdownMenuItem({ className, children, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(DropdownMenuContext);

  return (
    <button
      className={cn("flex w-full items-center rounded-xl px-3 py-2 text-left text-sm hover:bg-muted", className)}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        context?.setOpen(false);
      }}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-2 h-px bg-border" />;
}