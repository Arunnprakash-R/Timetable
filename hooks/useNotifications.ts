"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { markDemoNotificationRead, readDemoNotifications } from "@/lib/demo-store";
import { demoNotifications } from "@/lib/mock-data";
import { createSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase";
import type { Notification } from "@/types";

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>(demoNotifications);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let channel: ReturnType<ReturnType<typeof createSupabaseBrowserClient>["channel"]> | null = null;

    if (!hasSupabaseConfig()) {
      const syncDemoNotifications = () => {
        setNotifications(readDemoNotifications(userId));
        setLoading(false);
      };

      syncDemoNotifications();
      window.addEventListener("chronoclass-demo-store-updated", syncDemoNotifications);
      window.addEventListener("storage", syncDemoNotifications);

      return () => {
        mounted = false;
        window.removeEventListener("chronoclass-demo-store-updated", syncDemoNotifications);
        window.removeEventListener("storage", syncDemoNotifications);
      };
    }

    if (!userId) {
      setNotifications(demoNotifications);
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    async function loadNotifications() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (!mounted) return;

        setNotifications((data as Notification[] | null) ?? []);

        channel = supabase.channel(`notifications-${userId}`);

        channel.on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
          (payload) => {
            const nextNotification = payload.new as Notification;
            setNotifications((previous) => [nextNotification, ...previous]);
            toast.info(nextNotification.title);
          }
        );

        channel.subscribe();

        setLoading(false);
      } catch {
        if (!mounted) return;
        setNotifications(demoNotifications);
        setLoading(false);
      }
    }

    void loadNotifications();

    return () => {
      mounted = false;
      if (channel) {
        const supabase = createSupabaseBrowserClient();
        void supabase.removeChannel(channel);
      }
    };
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    if (!hasSupabaseConfig()) {
      markDemoNotificationRead(notificationId);
      setNotifications((previous) => previous.map((notification) => (notification.id === notificationId ? { ...notification, is_read: true } : notification)));
      return;
    }

    const supabase = createSupabaseBrowserClient();
    await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId);
    setNotifications((previous) => previous.map((notification) => (notification.id === notificationId ? { ...notification, is_read: true } : notification)));
  };

  return {
    notifications,
    unreadCount: notifications.filter((notification) => !notification.is_read).length,
    loading,
    markAsRead,
  };
}
