import { createClient } from "@/lib/supabase/server";
import { addProject } from "./actions";

const STAGE_LABEL: Record<string, string> = {
  foundation: "Foundation",
  framing: "Framing",
  interior: "Interior",
  near_complete: "Near Complete",
  complete: "Complete",
  on_hold: "On Hold",
};

export default async function ProjectsPage() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user!.id)
    .single();
  const isInternal = profile?.role === "owner" || profile?.role === "team";

  const { data: projects } = await supabase
    .from("projects")
    .select("*, clients(company_name)")
    .order("created_at", { ascending: false });

  const { data: clients } = isInternal
    ? await supabase.from("clients").select("id, company_name")
    : { data: [] };

  return (
    <div>
      <div className="mb-8">
        <div className="font-mono text-xs text-studio-muted mb-1">00:03 — JOB SITES</div>
        <h1 className="font-display text-2xl">Job Sites</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {projects?.length ? (
            projects.map((p: any) => (
              <div key={p.id} className="rounded-lg border border-studio-border bg-studio-surface p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-studio-muted">
                      {p.clients?.company_name} {p.address ? `· ${p.address}` : ""}
                    </div>
                  </div>
                  <span className="text-xs font-mono text-status-progress border border-studio-border rounded px-2 py-1">
                    {STAGE_LABEL[p.stage] ?? p.stage}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-studio-muted text-sm">No job sites yet.</div>
          )}
        </div>

        {isInternal && (
          <div className="rounded-lg border border-studio-border bg-studio-surface p-5 h-fit">
            <h2 className="font-display text-lg mb-4">Add job site</h2>
            <form action={addProject} className="space-y-3">
              <select
                name="client_id"
                required
                className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
              >
                <option value="">Select client…</option>
                {clients?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name}
                  </option>
                ))}
              </select>
              <input
                name="name"
                placeholder="Job site name (e.g. Roslyn Build)"
                required
                className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
              />
              <input
                name="address"
                placeholder="Address"
                className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
              />
              <select
                name="stage"
                className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
              >
                {Object.entries(STAGE_LABEL).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                name="start_date"
                type="date"
                className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
              />
              <textarea
                name="notes"
                placeholder="Notes"
                rows={2}
                className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
              />
              <button
                type="submit"
                className="w-full rounded bg-tungsten hover:bg-tungsten-hover transition-colors text-white text-sm font-medium py-2"
              >
                Add job site
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
