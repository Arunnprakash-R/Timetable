"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AuditLog } from "@/types";

const heatmapColumns = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type AnalyticsDashboardProps = {
  subjectLoad: Array<{ subject: string; load: number }>;
  freeSlots: Array<{ section: string; free: number }>;
  facultyLoad: Array<Record<string, string | number>>;
  auditLogs: AuditLog[];
};

export function AnalyticsDashboard({ subjectLoad, freeSlots, facultyLoad, auditLogs }: AnalyticsDashboardProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Subject load distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subjectLoad}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="load" radius={[10, 10, 0, 0]} fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Free slot analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={freeSlots} dataKey="free" nameKey="section" innerRadius={56} outerRadius={90} paddingAngle={4}>
                {freeSlots.map((entry, index) => (
                  <Cell key={entry.section} fill={["#22c55e", "#14b8a6", "#0ea5e9"][index % 3]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid gap-3 sm:grid-cols-3">
            {freeSlots.map((slot) => (
              <div key={slot.section} className="rounded-2xl border p-4">
                <p className="text-sm text-muted-foreground">{slot.section}</p>
                <p className="mt-1 text-2xl font-semibold">{slot.free}</p>
                <p className="text-xs text-muted-foreground">available periods</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Faculty workload heatmap</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-[700px] rounded-2xl border">
            <div className="grid grid-cols-7 border-b bg-muted/60 text-sm font-medium">
              <div className="p-4">Faculty</div>
              {heatmapColumns.map((column) => (
                <div key={column} className="p-4 text-center">{column}</div>
              ))}
            </div>
            {facultyLoad.map((faculty) => (
              <div key={String(faculty.faculty)} className="grid grid-cols-7 border-b last:border-b-0 text-sm">
                <div className="p-4 font-medium">{faculty.faculty as string}</div>
                {heatmapColumns.map((column) => {
                  const value = Number(faculty[column.toLowerCase()] ?? 0);
                  return (
                    <div key={column} className="p-4 text-center">
                      <div className="rounded-xl px-3 py-2 text-white" style={{ backgroundColor: `rgba(37, 99, 235, ${0.15 + value * 0.18})` }}>
                        {value}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Upload history</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Performed by</TableHead>
                <TableHead>Metadata</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.performed_by}</TableCell>
                  <TableCell>{JSON.stringify(log.metadata)}</TableCell>
                  <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
