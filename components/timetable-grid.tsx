import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { periods, weekdays } from "@/lib/mock-data";
import type { TimetableEntry } from "@/types";

function findEntry(dayIndex: number, period: number, entries: TimetableEntry[]) {
  return entries.find((entry) => entry.day_of_week === dayIndex && entry.period_number === period);
}

export function TimetableGrid({ entries = [], loading = false }: { entries?: TimetableEntry[]; loading?: boolean }) {
  const hasEntries = entries.length > 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between gap-3 border-b px-6 py-4">
        <CardTitle className="text-lg">Weekly grid</CardTitle>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <Badge className="bg-emerald-600 text-white">Free slot</Badge>
          <Badge className="bg-sky-600 text-white">Scheduled</Badge>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        {loading ? <div className="p-6 text-sm text-muted-foreground">Loading timetable...</div> : null}
        {!loading && !hasEntries ? (
          <div className="border-b p-6 text-sm text-muted-foreground">
            No classes found for the selected section. Upload a timetable or choose a section with saved data.
          </div>
        ) : null}
        <div className="min-w-[960px]">
          <div className="grid border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground timeline-grid">
            <div className="p-4">Period</div>
            {weekdays.map((day) => (
              <div key={day} className="p-4 text-center">{day}</div>
            ))}
          </div>
          {periods.map((period) => (
            <div key={period} className="grid border-b timeline-grid last:border-b-0">
              <div className="p-4 text-sm font-medium">P{period}</div>
              {weekdays.map((_, dayIndex) => {
                const entry = findEntry(dayIndex + 1, period, entries);
                if (!entry) {
                  return (
                    <div key={`${dayIndex}-${period}`} className="min-h-[92px] border-l border-dashed border-border p-3 text-xs text-emerald-600">
                      Free slot
                    </div>
                  );
                }

                return (
                  <div key={`${dayIndex}-${period}`} className="min-h-[92px] border-l p-3">
                    <div className="h-full rounded-2xl p-3 text-white shadow-sm" style={{ backgroundColor: entry.color_hex }}>
                      <p className="text-sm font-semibold">{entry.subject}</p>
                      <p className="mt-1 text-xs/5 opacity-90">{entry.faculty_name}</p>
                      <p className="text-xs/5 opacity-90">{entry.room}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
