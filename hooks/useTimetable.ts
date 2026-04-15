"use client";

import { useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { readDemoTimetable } from "@/lib/demo-store";
import { demoEntries } from "@/lib/mock-data";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { hasSupabaseConfig } from "@/lib/supabase";
import type { Timetable, TimetableEntry } from "@/types";

export function useTimetable(section = "CSE-A", department = "Computer Science") {
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [entries, setEntries] = useState<TimetableEntry[]>(demoEntries);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let supabase: ReturnType<typeof createSupabaseBrowserClient> | null = null;
    let active = true;
    let channel: RealtimeChannel | null = null;

    if (!hasSupabaseConfig()) {
      const syncDemoState = () => {
        const demoTimetable = readDemoTimetable(section, department);

        if (demoTimetable) {
          setTimetable(demoTimetable.timetable);
          setEntries(demoTimetable.entries);
        } else if (section === "CSE-A" && department === "Computer Science") {
          setTimetable({
            id: "tt-demo-1",
            label: "Odd Semester 2026",
            semester: "S5",
            section,
            department,
            file_url: null,
            file_type: null,
            uploaded_by: "user-1",
            is_active: true,
            created_at: new Date().toISOString(),
          });
          setEntries(demoEntries);
        } else {
          setTimetable(null);
          setEntries([]);
        }

        setLoading(false);
      };

      syncDemoState();

      window.addEventListener("chronoclass-demo-store-updated", syncDemoState);
      window.addEventListener("storage", syncDemoState);

      return () => {
        active = false;
        window.removeEventListener("chronoclass-demo-store-updated", syncDemoState);
        window.removeEventListener("storage", syncDemoState);
      };
    }

    async function loadTimetable() {
      try {
        supabase = createSupabaseBrowserClient();
      } catch {
        if (!active) return;
        setTimetable(null);
        setEntries(demoEntries);
        setLoading(false);
        return;
      }

      setLoading(true);

      if (!supabase) {
        return;
      }

      const supabaseClient = supabase;

      const { data: timetableRow, error: timetableError } = await supabaseClient
        .from("timetables")
        .select("*")
        .eq("section", section)
        .eq("department", department)
        .eq("is_active", true)
        .maybeSingle();

      if (!active) return;

      if (timetableError) {
        setEntries([]);
        setTimetable(null);
        setLoading(false);
        return;
      }

      if (!timetableRow) {
        setEntries([]);
        setTimetable(null);
        setLoading(false);
        return;
      }

      setTimetable(timetableRow as Timetable);

      const { data: timetableEntries } = await supabaseClient
        .from("timetable_entries")
        .select("*")
        .eq("timetable_id", timetableRow.id)
        .order("period_number", { ascending: true });

      if (!active) return;

      setEntries((timetableEntries as TimetableEntry[] | null) ?? []);
      setLoading(false);

      if (channel) {
        void supabaseClient.removeChannel(channel);
      }

      channel = supabaseClient
        .channel(`timetable-${timetableRow.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "timetable_entries", filter: `timetable_id=eq.${timetableRow.id}` },
          async () => {
            const { data: refreshedEntries } = await supabaseClient
              .from("timetable_entries")
              .select("*")
              .eq("timetable_id", timetableRow.id)
              .order("period_number", { ascending: true });

            if (active) setEntries((refreshedEntries as TimetableEntry[] | null) ?? []);
          }
        )
        .subscribe();
    }

    void loadTimetable();

    return () => {
      active = false;
      if (channel && supabase) {
        void supabase.removeChannel(channel);
      }
    };
  }, [section, department]);

  return { timetable, entries, loading };
}
