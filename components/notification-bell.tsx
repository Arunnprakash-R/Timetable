"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationBell({ userId }: { userId?: string }) {
  const { unreadCount } = useNotifications(userId);

  return (
    <Link href="/notifications" className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-input bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
      <Bell className="h-4 w-4" />
      {unreadCount > 0 ? <Badge className="absolute -right-2 -top-2 rounded-full px-2 py-0.5">{unreadCount}</Badge> : null}
    </Link>
  );
}
