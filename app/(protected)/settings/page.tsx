"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ExportButton } from "@/components/export-button";
import { useUser } from "@/hooks/useUser";
import { useTimetable } from "@/hooks/useTimetable";

export default function SettingsPage() {
  const { user } = useUser();
  const { entries } = useTimetable(user?.section ?? "CSE-A", user?.department ?? "Computer Science");

  return (
    <div className="space-y-6">
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={user?.name ?? ""} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar URL</Label>
            <Input id="avatar" value={user?.avatar_url ?? ""} readOnly placeholder="Supabase Storage URL" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Notification preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border p-4">
            <div>
              <p className="font-medium">Email on timetable update</p>
              <p className="text-sm text-muted-foreground">Send an email when your timetable changes.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-2xl border p-4">
            <div>
              <p className="font-medium">Reminders</p>
              <p className="text-sm text-muted-foreground">Notify 30 minutes before class.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <ExportButton entries={entries} />
        </CardContent>
      </Card>
    </div>
  );
}
