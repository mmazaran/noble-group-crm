import { createClient } from "@/lib/supabase/server";
import { addContentItem } from "./actions";
import StatusSelect from "./status-select";

const STATUS_ORDER = ["planned", "shot", "editing", "ready", "scheduled", "posted"] as const;
const STATUS_LABEL: Record<string, string> = {
  planned: "Planned",
  shot: "Shot",
  editing: "Editing",
  ready: "Ready",
  scheduled: "Scheduled",
  posted: "Posted",
};
const STATUS_COLOR: Record<string, string> = {
  planned: "border-status-planned text-status-planned",
  shot: "border-status-progress text-status-progress",
  editing: "border-status-progress text-status-progress",
  ready: "border-status-ready text-status-ready",
  scheduled: "border-status-ready text-status-ready",
  posted: "border-status-posted text-status-posted",
};

export default async function ContentPage() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user!.id)
    .single();
  const isInternal = profile?.role === "owner" || profile?.role === "team";

  const { data: items } = await supabase
    .from("content_items")
    .select("*, projects(name, clients(company_name))")
    .order("scheduled_date", { ascending: true });

  const { data: projects } = await supabase.from("projects").select("id, name, clients(company_name)");

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="font-mono text-xs text-studio-muted mb-1">00:04 — CONTENT CALENDAR</div>
          <h1 className="font-display text-2xl">Content Calendar</h1>
        </div>
      </div>

      {isInternal && (
        <details className="mb-8 rounded-lg border border-studio-border bg-studio-surface p-5">
          <summary className="cursor-pointer font-display text-lg">+ New content item</summary>
          <form action={addContentItem} className="grid grid-cols-2 gap-3 mt-4">
            <select
              name="project_id"
              required
              className="col-span-2 rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
            >
              <option value="">Select job site…</option>
              {projects?.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.clients?.company_name} — {p.name}
                </option>
              ))}
            </select>
            <input
              name="title"
              placeholder="Title (e.g. Foundation pour reveal)"
              required
              className="col-span-2 rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
            />
            <select
              name="type"
              className="rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
            >
              <option value="reel">Reel</option>
              <option value="post">Post</option>
              <option value="carousel">Carousel</option>
              <option value="story">Story</option>
              <option value="photo_set">Photo Set</option>
            </select>
            <input
              name="scheduled_date"
              type="date"
              className="rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
            />
            <textarea
              name="caption"
              placeholder="Caption / notes"
              rows={2}
              className="col-span-2 rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
            />
            <button
              type="submit"
              className="col-span-2 rounded bg-tungsten hover:bg-tungsten-hover transition-colors text-white text-sm font-medium py-2"
            >
              Add to calendar
            </button>
          </form>
        </details>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STATUS_ORDER.map((status) => (
          <div key={status}>
            <div className={`font-mono text-[11px] mb-3 pb-2 border-b ${STATUS_COLOR[status]}`}>
              {STATUS_LABEL[status].toUpperCase()}
            </div>
            <div className="space-y-2">
              {items
                ?.filter((i: any) => i.status === status)
                .map((i: any) => (
                  <div key={i.id} className="rounded border border-studio-border bg-studio-surface p-3">
                    <div className="text-sm font-medium mb-1">{i.title}</div>
                    <div className="text-xs text-studio-muted mb-2">
                      {i.projects?.clients?.company_name} · {i.projects?.name}
                    </div>
                    {i.scheduled_date && (
                      <div className="text-xs font-mono text-studio-faint mb-2">{i.scheduled_date}</div>
                    )}
                    {isInternal && <StatusSelect id={i.id} currentStatus={i.status} />}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
