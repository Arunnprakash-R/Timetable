import { redirect } from "next/navigation";
import { readDemoAuditLogs } from "@/lib/demo-store";
import { demoAuditLogs, demoEntries } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { hasSupabaseConfig } from "@/lib/supabase";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import type { AuditLog } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AnalyticsPage() {
  if (!hasSupabaseConfig()) {
    const subjectLoadMap: Record<string, number> = {};

    for (const row of demoEntries) {
      subjectLoadMap[row.subject] = (subjectLoadMap[row.subject] ?? 0) + 1;
    }

    const subjectLoad = Object.entries(subjectLoadMap).map(([subject, load]) => ({ subject, load }));

    const freeSlots = [
      { section: "CSE-A", free: 8 },
      { section: "CSE-B", free: 6 },
      { section: "ECE-A", free: 7 },
    ];

    const facultyLoad = [
      { faculty: "Dr. Maya Rao", mon: 2, tue: 1, wed: 1, thu: 0, fri: 1, sat: 0 },
      { faculty: "Prof. Arun Nair", mon: 1, tue: 2, wed: 1, thu: 1, fri: 0, sat: 0 },
    ];

    return <AnalyticsDashboard subjectLoad={subjectLoad} freeSlots={freeSlots} facultyLoad={facultyLoad} auditLogs={readDemoAuditLogs() ?? demoAuditLogs} />;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", data.user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/dashboard");

  const [subjectResponse, auditResponse] = await Promise.all([
    supabase.from("timetable_entries").select("subject, faculty_name, day_of_week, period_number"),
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(25),
  ]);

  const subjectRows = (subjectResponse.data ?? []) as Array<{ subject: string | null }>;
  const auditLogs = (auditResponse.data ?? []) as AuditLog[];

  const subjectLoadMap: Record<string, number> = {};
  for (const row of subjectRows) {
    const subject = row.subject ?? "Unknown";
    subjectLoadMap[subject] = (subjectLoadMap[subject] ?? 0) + 1;
  }

  const subjectLoad = Object.entries(subjectLoadMap).map(([subject, load]) => ({ subject, load }));

  const freeSlots = [
    { section: "CSE-A", free: 8 },
    { section: "CSE-B", free: 6 },
    { section: "ECE-A", free: 7 },
  ];

  const facultyLoad = [
    { faculty: "Dr. Maya Rao", mon: 2, tue: 1, wed: 1, thu: 0, fri: 1, sat: 0 },
    { faculty: "Prof. Arun Nair", mon: 1, tue: 2, wed: 1, thu: 1, fri: 0, sat: 0 },
  ];

  return <AnalyticsDashboard subjectLoad={subjectLoad} freeSlots={freeSlots} facultyLoad={facultyLoad} auditLogs={auditLogs} />;
}
