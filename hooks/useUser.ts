"use client";

import { useEffect, useState } from "react";
import { currentUser } from "@/lib/mock-data";
import { hasSupabaseConfig, createSupabaseBrowserClient } from "@/lib/supabase";
import type { UserProfile } from "@/types";

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      if (!hasSupabaseConfig()) {
        if (!mounted) return;
        setUser(currentUser);
        setLoading(false);
        return;
      }

      try {
        const supabase = createSupabaseBrowserClient();

        const { data } = await supabase.auth.getUser();

        if (!mounted) return;

        if (!data.user) {
          setUser(null);
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", data.user.id).maybeSingle();

        if (!mounted) return;

        if (profile) {
          setUser(profile as UserProfile);
        } else {
          setUser({
            id: data.user.id,
            role: (data.user.user_metadata?.role as UserProfile["role"]) ?? "student",
            name: data.user.user_metadata?.name ?? data.user.email ?? "ChronoClass User",
            section: data.user.user_metadata?.section ?? null,
            department: data.user.user_metadata?.department ?? null,
            email: data.user.email ?? "",
            avatar_url: data.user.user_metadata?.avatar_url ?? null,
            created_at: data.user.created_at,
          });
        }

        setLoading(false);
      } catch {
        if (!mounted) return;
        setUser(currentUser);
        setLoading(false);
      }
    }

    void loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  return { user, loading };
}
