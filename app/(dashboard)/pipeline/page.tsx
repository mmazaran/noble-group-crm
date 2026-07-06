import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PipelineBoard from "./pipeline-board";

export default async function PipelinePage() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (profile?.role === "client") redirect("/portal");

  const { data: clients } = await supabase
    .from("clients")
    .select("id, company_name, contact_name, email, phone, pipeline_stage")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <div className="font-mono text-xs text-studio-muted mb-1">00:03 — PIPELINE</div>
        <h1 className="font-display text-2xl">Pipeline</h1>
        <p className="text-sm text-studio-muted mt-1">
          Drag clients through stages to track your sales pipeline.
        </p>
      </div>

      <PipelineBoard clients={(clients ?? []) as any} />
    </div>
  );
}
