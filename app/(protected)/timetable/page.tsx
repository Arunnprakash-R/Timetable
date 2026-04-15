"use client";

import { useEffect, useState } from "react";
import { TimetableGrid } from "@/components/timetable-grid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { departmentOptions, sectionOptions } from "@/lib/mock-data";
import { useUser } from "@/hooks/useUser";
import { useTimetable } from "@/hooks/useTimetable";

export default function TimetablePage() {
  const { user } = useUser();
  const [section, setSection] = useState(user?.section ?? "CSE-A");
  const [department, setDepartment] = useState(user?.department ?? "Computer Science");
  const { entries, loading } = useTimetable(section, department);

  useEffect(() => {
    if (user?.section) setSection(user.section);
    if (user?.department) setDepartment(user.department);
  }, [user?.section, user?.department]);

  return (
    <div className="space-y-6">
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Weekly timetable</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Select value={department} onChange={(event) => setDepartment(event.target.value)}>
            {departmentOptions.map((department) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </Select>
          <Select value={section} onChange={(event) => setSection(event.target.value)}>
            {sectionOptions.map((section) => (
              <option key={section} value={section}>{section}</option>
            ))}
          </Select>
          <Select defaultValue="Current semester">
            <option>Current semester</option>
            <option>Previous semester</option>
          </Select>
          <Select defaultValue="All periods">
            <option>All periods</option>
            <option>Morning only</option>
            <option>Afternoon only</option>
          </Select>
        </CardContent>
      </Card>

      <TimetableGrid entries={entries} loading={loading} />
    </div>
  );
}
