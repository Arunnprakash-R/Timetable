import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { Resend } from "npm:resend@4.1.3";

serve(async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const payload = await request.json().catch(() => ({}));
  const recipients: string[] = Array.isArray(payload.recipients) ? payload.recipients : [];
  const section = payload.section ?? "your section";
  const label = payload.label ?? "updated timetable";
  const from = Deno.env.get("RESEND_FROM_EMAIL") ?? "ChronoClass <no-reply@chronoclass.edu>";
  const resend = new Resend(Deno.env.get("RESEND_API_KEY") ?? "");

  if (!recipients.length) {
    return Response.json({ ok: false, message: "No recipients provided" }, { status: 400 });
  }

  const result = await resend.emails.send({
    from,
    to: recipients,
    subject: `ChronoClass update: ${label}`,
    html: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6">
        <h2>Timetable updated</h2>
        <p>The timetable for <strong>${section}</strong> has been updated.</p>
        <p>Open ChronoClass to view the latest classes and notifications.</p>
      </div>
    `,
  });

  return Response.json({ ok: true, result });
});
