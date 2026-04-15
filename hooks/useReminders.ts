"use client";

import { useState } from "react";
import { demoEntries } from "@/lib/mock-data";

export function useReminders() {
  const [reminders] = useState(
    demoEntries.map((entry) => ({
      id: `r-${entry.id}`,
      user_id: "user-1",
      timetable_entry_id: entry.id,
      remind_before_minutes: 30,
      is_active: true,
    }))
  );

  return { reminders };
}
