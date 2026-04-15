"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { buildIcalFromEntries } from "@/lib/ical";
import type { TimetableEntry } from "@/types";

export function ExportButton({ entries }: { entries: TimetableEntry[] }) {
  const handleExport = () => {
    const ics = buildIcalFromEntries(entries);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "chronoclass.ics";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Calendar export generated");
  };

  return (
    <Button onClick={handleExport} className="gap-2">
      <Download className="h-4 w-4" />
      Export iCal
    </Button>
  );
}
