"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/useUser";
import { useNotifications } from "@/hooks/useNotifications";

export default function NotificationsPage() {
  const { user } = useUser();
  const { notifications, loading, markAsRead } = useNotifications(user?.id);

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>
        ) : notifications.length ? (
          notifications.map((notification) => (
            <div key={notification.id} className="flex items-start justify-between gap-4 rounded-2xl border p-4">
              <div>
                <p className="font-medium">{notification.title}</p>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                {!notification.is_read ? (
                  <Button variant="ghost" size="sm" className="mt-2 px-0" onClick={() => markAsRead(notification.id)}>
                    Mark as read
                  </Button>
                ) : null}
              </div>
              <Badge className={notification.is_read ? "bg-muted text-foreground" : "bg-primary"}>{notification.type}</Badge>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No notifications yet for {user?.name ?? "this account"}.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
