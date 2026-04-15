"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarDays, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!hasSupabaseConfig()) {
      toast.success("Demo mode enabled");
      router.push("/dashboard");
      return;
    }

    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Signed in successfully");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!hasSupabaseConfig()) {
      toast.success("Demo mode enabled");
      router.push("/dashboard");
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/dashboard` } });
      if (error) toast.error(error.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in with Google");
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative flex items-center justify-center overflow-hidden px-6 py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.18),transparent_28%)]" />
        <div className="relative max-w-xl space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 text-sm shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4 text-primary" />
            ChronoClass for modern campus operations
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Manage timetables, reminders, analytics, and notifications in one place.</h1>
            <p className="text-lg text-muted-foreground">Built with Supabase, OCR-assisted uploads, realtime alerts, offline access, and calendar export.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Role-based access", "Admin, faculty, student"],
              ["OCR import", "Image to timetable draft"],
              ["Realtime updates", "Live notifications and badges"],
            ].map(([title, description]) => (
              <Card key={title} className="bg-background/70 backdrop-blur">
                <CardContent className="p-4 text-left">
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription className="mt-1">{description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <CalendarDays className="h-6 w-6" />
            </div>
            <CardTitle className="mt-4 text-2xl">Login to ChronoClass</CardTitle>
            <CardDescription>Use your college email and password, or continue with Google.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@college.edu" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
            </div>
            <Button className="w-full" onClick={handleLogin} disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <Button className="w-full gap-2" variant="outline" onClick={handleGoogleLogin}>
              <ShieldCheck className="h-4 w-4" />
              Continue with Google
            </Button>
            {!hasSupabaseConfig() ? (
              <p className="text-sm text-muted-foreground">
                Supabase is not configured, so the app is running in demo mode.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
