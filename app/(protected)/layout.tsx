import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { currentUser } from "@/lib/mock-data";
import { AppShell } from "@/components/app-shell";
import type { Role } from "@/types";

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", data.user.id).maybeSingle();
  const role = (profile?.role as Role | undefined) ?? (data.user.user_metadata?.role as Role | undefined) ?? currentUser.role;

  return <AppShell role={role}>{children}</AppShell>;
}
