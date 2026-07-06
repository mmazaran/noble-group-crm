import { createClient } from "@/lib/supabase/server";

function StatCard({ label, value, code }: { label: string; value: string | number; code: string }) {
  return (
    <div className="rounded-lg border border-studio-border bg-studio-surface p-5">
      <div className="font-mono text-[10px] text-tungsten-dim mb-2">{code}</div>
      <div className="font-display text-3xl mb-1">{value}</div>
      <div className="text-sm text-studio-muted">{label}</div>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = createClient();

  const [{ count: clientCount }, { count: activeProjects }, { count: scheduledContent }, { count: appointmentsThisWeek }] =
    await Promise.all([
      supabase.from("clients").select("*", { count: "exact", head: true }),
      supabase.from("projects").select("*", { count: "exact", head: true }).neq("stage", "complete"),
      supabase
        .from("content_items")
        .select("*", { count: "exact", head: true })
        .in("status", ["planned", "shot", "editing", "ready", "scheduled"]),
      supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("status", "scheduled")
        .gte("start_time", new Date().toISOString())
        .lte("start_time", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

  return (
    <div>
      <div className="mb-8">
        <div className="font-mono text-xs text-studio-muted mb-1">00:01 — DASHBOARD</div>
        <h1 className="font-display text-2xl">Overview</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard code="A" label="Active clients" value={clientCount ?? 0} />
        <StatCard code="B" label="Job sites in progress" value={activeProjects ?? 0} />
        <StatCard code="C" label="Content in pipeline" value={scheduledContent ?? 0} />
        <StatCard code="D" label="Shoots this week" value={appointmentsThisWeek ?? 0} />
      </div>

      <div className="mt-10 rounded-lg border border-studio-border bg-studio-surface p-6">
        <p className="text-sm text-studio-muted">
          Use the sidebar to manage clients, pipeline, job sites, content calendar, appointments, and automations.
          Clients log in at <strong>/portal</strong> to view their projects and content deliverables.
        </p>
      </div>
    </div>
  );
}
