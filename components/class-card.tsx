import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TimetableEntry } from "@/types";

export function ClassCard({ entry, current = false }: { entry: TimetableEntry; current?: boolean }) {
  return (
    <Card className={current ? "border-primary/60 shadow-glow" : undefined}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{entry.subject}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{entry.subject_code}</p>
          </div>
          <Badge style={{ backgroundColor: entry.color_hex }}>{entry.start_time}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>{entry.faculty_name}</p>
        <p>{entry.room}</p>
        <p>{entry.start_time} - {entry.end_time}</p>
      </CardContent>
    </Card>
  );
}
