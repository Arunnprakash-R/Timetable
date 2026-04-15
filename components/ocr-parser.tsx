"use client";

import { useState } from "react";
import { Loader2, ScanText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { scanTimetableImage } from "@/lib/ocr";
import type { TimetableEntry } from "@/types";

export function OCRParser({ onParsed }: { onParsed?: (entries: TimetableEntry[]) => void }) {
  const [progress, setProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [preview, setPreview] = useState<TimetableEntry[]>([]);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState("");

  const handleScan = async (file?: File | null) => {
    if (!file) return;
    setIsScanning(true);
    try {
      setSelectedFileName(file.name);
      setRawText("");
      const result = await scanTimetableImage(file, setProgress);
      setRawText(result.text);
      const parsed = result.entries;
      setPreview(parsed);
      onParsed?.(parsed);
      if (parsed.length) {
        toast.success(`Detected ${parsed.length} schedule items`);
      } else {
        toast.info("OCR finished, but no timetable rows were detected. Try a clearer crop of the timetable area.");
      }
    } catch {
      toast.error("OCR failed. Please try another image.");
    } finally {
      setIsScanning(false);
      setProgress(0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>OCR timetable parser</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            setSelectedFile(file);
            setSelectedFileName(file?.name ?? null);
            setPreview([]);
            setRawText("");
            if (file) {
              toast.info(`Selected ${file.name}`);
              void handleScan(file);
            }
          }}
        />
        {selectedFileName ? <p className="text-sm text-muted-foreground">Selected file: {selectedFileName}</p> : null}
        {isScanning ? (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Recognizing timetable... {progress}%
          </div>
        ) : null}
        <Button variant="secondary" onClick={() => handleScan(selectedFile)} className="gap-2" disabled={isScanning || !selectedFile}>
          <ScanText className="h-4 w-4" />
          {isScanning ? "Parsing..." : "Parse image"}
        </Button>

        {preview.length ? (
          <div className="rounded-2xl border p-4">
            <p className="mb-3 text-sm font-semibold">Preview</p>
            <div className="space-y-2 text-sm">
              {preview.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-xl bg-muted px-3 py-2">
                  <span>{entry.subject}</span>
                  <span>{entry.start_time} - {entry.end_time}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {rawText ? (
          <div className="rounded-2xl border p-4">
            <p className="mb-2 text-sm font-semibold">OCR text</p>
            <p className="max-h-40 overflow-auto text-xs leading-5 text-muted-foreground whitespace-pre-wrap">{rawText.slice(0, 1200)}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
