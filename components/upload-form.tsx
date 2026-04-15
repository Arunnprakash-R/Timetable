"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { OCRParser } from "@/components/ocr-parser";
import { appendDemoAuditLog, upsertDemoNotification, upsertDemoTimetable } from "@/lib/demo-store";
import { demoEntries, sectionOptions } from "@/lib/mock-data";
import { departmentOptions } from "@/lib/mock-data";
import { useUser } from "@/hooks/useUser";
import { createSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase";
import { scanTimetableImage } from "@/lib/ocr";
import type { TimetableEntry } from "@/types";

export function UploadForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"file" | "ocr" | "manual">("file");
  const [section, setSection] = useState("CSE-A");
  const [department, setDepartment] = useState("Computer Science");
  const [semester, setSemester] = useState("S5");
  const [label, setLabel] = useState("Odd Semester 2026");
  const [file, setFile] = useState<File | null>(null);
  const [previewEntries, setPreviewEntries] = useState<TimetableEntry[]>(demoEntries);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const { user } = useUser();
  const periodsText = useMemo(() => previewEntries.map((entry) => `${entry.subject} - ${entry.start_time}-${entry.end_time}`).join("\n"), [previewEntries]);

  const handleFileChange = async (nextFile: File | null) => {
    setFile(nextFile);
    if (nextFile) {
      toast.info(`Selected ${nextFile.name}. Click Save timetable to store it.`);
      if (nextFile.type.startsWith("image/")) {
        setScanning(true);
        try {
          const result = await scanTimetableImage(nextFile);
          if (result.entries.length) {
            setPreviewEntries(result.entries);
            toast.success(`Detected ${result.entries.length} class rows from the image`);
          } else {
            toast.info("OCR could not detect timetable rows. Try a clearer crop or use the OCR tab.");
          }
        } catch {
          toast.error("OCR failed on the selected image.");
        } finally {
          setScanning(false);
        }
      }
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("You must be signed in to upload a timetable");
      return;
    }

    if (!hasSupabaseConfig()) {
      const timetableId = `demo-${section}-${Date.now()}`;
      const fileMetadata = file ? `local:${file.name}` : null;

      upsertDemoTimetable({
        timetable: {
          id: timetableId,
          label,
          semester,
          section,
          department,
          file_url: fileMetadata,
          file_type: file?.type ?? null,
          uploaded_by: user.id,
          is_active: true,
          created_at: new Date().toISOString(),
        },
        entries: previewEntries.map((entry) => ({
          ...entry,
          timetable_id: timetableId,
        })),
      });

      upsertDemoNotification({
        id: `demo-notification-${Date.now()}`,
        user_id: user.id,
        title: "Timetable updated",
        message: `${label} is now available for ${section}${file ? ` from ${file.name}` : ""}.`,
        type: "success",
        is_read: false,
        created_at: new Date().toISOString(),
      });

      appendDemoAuditLog({
        id: `demo-audit-${Date.now()}`,
        action: "Upload timetable",
        performed_by: user.name,
        metadata: { label, section, department, rows: previewEntries.length },
        created_at: new Date().toISOString(),
      });

      toast.success("Timetable saved locally in demo mode");
      router.push("/timetable");
      return;
    }

    setSaving(true);
    const supabase = createSupabaseBrowserClient();

    try {
      let fileUrl: string | null = null;

      if (file) {
        const extension = file.name.split(".").pop() ?? "dat";
        const storagePath = `${section}/${Date.now()}.${extension}`;
        const { error: uploadError } = await supabase.storage.from("timetable-files").upload(storagePath, file, { upsert: true, contentType: file.type });
        if (uploadError) throw uploadError;

        const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from("timetable-files").createSignedUrl(storagePath, 60 * 60 * 24 * 7);
        if (signedUrlError) throw signedUrlError;

        fileUrl = signedUrlData.signedUrl;
      }

      const { data: timetableRow, error: timetableError } = await supabase
        .from("timetables")
        .insert({
          label,
          semester,
          section,
          department,
          file_url: fileUrl,
          file_type: file?.type ?? null,
          uploaded_by: user.id,
          is_active: true,
        })
        .select("id")
        .single();

      if (timetableError) throw timetableError;

      const timetableEntries = previewEntries.map((entry) => ({
        timetable_id: timetableRow.id,
        subject: entry.subject,
        subject_code: entry.subject_code,
        faculty_name: entry.faculty_name,
        room: entry.room,
        day_of_week: entry.day_of_week,
        period_number: entry.period_number,
        start_time: entry.start_time,
        end_time: entry.end_time,
        color_hex: entry.color_hex,
      }));

      if (timetableEntries.length) {
        const { error: entriesError } = await supabase.from("timetable_entries").insert(timetableEntries);
        if (entriesError) throw entriesError;
      }

      const { data: recipients, error: recipientsError } = await supabase
        .from("user_profiles")
        .select("id,email")
        .eq("section", section)
        .eq("department", department);

      if (recipientsError) throw recipientsError;

      const notificationRows = (recipients ?? []).map((recipient) => ({
        user_id: recipient.id,
        title: "Timetable updated",
        message: `${label} is now available for ${section}.`,
        type: "success" as const,
        is_read: false,
      }));

      if (notificationRows.length) {
        const { error: notificationError } = await supabase.from("notifications").insert(notificationRows);
        if (notificationError) throw notificationError;
      }

      const { error: auditError } = await supabase.from("audit_logs").insert({
        action: "Upload timetable",
        performed_by: user.id,
        metadata: { label, section, department, rows: timetableEntries.length },
      });

      if (auditError) throw auditError;

      if (recipients?.length) {
        await supabase.functions.invoke("timetable-updated", {
          body: {
            recipients: recipients.map((recipient) => recipient.email),
            section,
            label,
          },
        });
      }

      toast.success("Timetable saved and notifications sent");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save timetable");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>Upload timetable</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-3">
            {(["file", "ocr", "manual"] as const).map((item) => (
              <Button key={item} variant={mode === item ? "default" : "outline"} onClick={() => setMode(item)}>
                {item.toUpperCase()}
              </Button>
            ))}
          </div>

          {mode === "file" ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">PDF or image</Label>
                <Input id="file" type="file" accept="application/pdf,image/*" onChange={(event) => void handleFileChange(event.target.files?.[0] ?? null)} />
              </div>
              {file ? <p className="text-sm text-muted-foreground">Selected file: {file.name}</p> : <p className="text-sm text-muted-foreground">Choose a PDF or image, then save to store it in demo mode.</p>}
              {scanning ? <p className="text-sm text-muted-foreground">Scanning image and extracting timetable rows...</p> : null}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="label">Label</Label>
                  <Input id="label" value={label} onChange={(event) => setLabel(event.target.value)} />
                </div>
                <div>
                  <Label htmlFor="semester">Semester</Label>
                  <Input id="semester" value={semester} onChange={(event) => setSemester(event.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="section">Section</Label>
                <Select id="section" value={section} onChange={(event) => setSection(event.target.value)}>
                  {sectionOptions.map((section) => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Select id="department" value={department} onChange={(event) => setDepartment(event.target.value)}>
                  {departmentOptions.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </Select>
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save timetable"}
              </Button>
            </div>
          ) : null}

          {mode === "ocr" ? <OCRParser onParsed={setPreviewEntries} /> : null}

          {mode === "manual" ? (
            <div className="space-y-4">
              <Textarea value={periodsText} readOnly rows={10} />
              <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save draft"}</Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview and corrections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {previewEntries.map((entry) => (
            <div key={entry.id} className="rounded-2xl border p-4">
              <p className="font-medium">{entry.subject}</p>
              <p className="text-sm text-muted-foreground">{entry.faculty_name} · {entry.room}</p>
              <p className="text-sm text-muted-foreground">{entry.start_time} - {entry.end_time}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
