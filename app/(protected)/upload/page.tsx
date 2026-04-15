import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { hasSupabaseConfig } from "@/lib/supabase";
import { currentUser } from "@/lib/mock-data";
import { UploadForm } from "@/components/upload-form";

export default async function UploadPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  if (!hasSupabaseConfig()) {
    if (currentUser.role !== "admin") redirect("/dashboard");

    return <UploadForm />;
  }

  const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", data.user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/dashboard");

  return <UploadForm />;
}
