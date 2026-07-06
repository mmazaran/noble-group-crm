import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { addAppointment, updateAppointmentStatus } from "./actions";

const TYPE_COLORS: Record<string, string> = {
  shoot: "text-tungsten border-tungsten",
  consultation: "text-status-ready border-status-ready",
  review: "text-status-progress border-status-progress",
  other: "text-studio-muted border-studio-border",
};

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default async function CalendarPage() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (profile?.role === "client") redirect("/portal");

  const { data: appointments } = await supabase
    .from("appointments")
    .select("*, clients(company_name), projects(name)")
    .order("start_time", { ascending: true });

  const { data: clients } = await supabase
    .from("clients")
    .select("id, company_name")
    .order("company_name");

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, client_id")
    .order("name");

  const upcoming = appointments?.filter((a) => a.status === "scheduled") ?? [];
  const past = appointments?.filter((a) => a.status !== "scheduled") ?? [];

  return (
    <div>
      <div className="mb-8">
        <div className="font-mono text-xs text-studio-muted mb-1">00:06 — CALENDAR</div>
        <h1 className="font-display text-2xl">Calendar & Appointments</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming */}
          <div>
            <h2 className="text-sm font-mono text-studio-muted uppercase tracking-widest mb-3">
              Upcoming
            </h2>
            <div className="space-y-3">
              {upcoming.length ? (
                upcoming.map((appt: any) => (
                  <div
                    key={appt.id}
                    className="rounded-lg border border-studio-border bg-studio-surface p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs font-mono border rounded px-2 py-0.5 ${TYPE_COLORS[appt.type] ?? TYPE_COLORS.other}`}
                          >
                            {appt.type}
                          </span>
                          <span className="font-medium text-sm">{appt.title}</span>
                        </div>
                        <div className="text-xs text-studio-muted">
                          {formatDateTime(appt.start_time)} → {formatDateTime(appt.end_time)}
                        </div>
                        {(appt.clients?.company_name || appt.projects?.name) && (
                          <div className="text-xs text-studio-faint mt-1">
                            {appt.clients?.company_name}
                            {appt.projects?.name ? ` · ${appt.projects.name}` : ""}
                          </div>
                        )}
                        {appt.description && (
                          <div className="text-xs text-studio-muted mt-2">{appt.description}</div>
                        )}
                      </div>
                      <form>
                        <input type="hidden" name="id" value={appt.id} />
                        <button
                          formAction={async () => {
                            "use server";
                            await updateAppointmentStatus(appt.id, "completed");
                          }}
                          className="text-xs text-studio-muted hover:text-status-posted transition-colors border border-studio-border rounded px-2 py-1"
                        >
                          Mark done
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-studio-muted text-sm">No upcoming appointments.</div>
              )}
            </div>
          </div>

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-mono text-studio-muted uppercase tracking-widest mb-3">
                Past
              </h2>
              <div className="space-y-2">
                {past.map((appt: any) => (
                  <div
                    key={appt.id}
                    className="rounded-lg border border-studio-border bg-studio-surface p-3 opacity-60 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium">{appt.title}</div>
                      <div className="text-xs text-studio-muted">
                        {formatDateTime(appt.start_time)}
                        {appt.clients?.company_name ? ` · ${appt.clients.company_name}` : ""}
                      </div>
                    </div>
                    <span className="text-xs font-mono text-studio-faint">
                      {STATUS_LABEL[appt.status] ?? appt.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add appointment form */}
        <div className="rounded-lg border border-studio-border bg-studio-surface p-5 h-fit">
          <h2 className="font-display text-lg mb-4">Schedule appointment</h2>
          <form action={addAppointment} className="space-y-3">
            <input
              name="title"
              placeholder="Title (e.g. Roslyn Shoot)"
              required
              className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
            />
            <select
              name="type"
              className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
            >
              <option value="shoot">Shoot</option>
              <option value="consultation">Consultation</option>
              <option value="review">Content Review</option>
              <option value="other">Other</option>
            </select>
            <select
              name="client_id"
              className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
            >
              <option value="">Select client…</option>
              {clients?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name}
                </option>
              ))}
            </select>
            <select
              name="project_id"
              className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
            >
              <option value="">Select job site…</option>
              {projects?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <div>
              <label className="text-xs text-studio-muted block mb-1">Start time</label>
              <input
                name="start_time"
                type="datetime-local"
                required
                className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
              />
            </div>
            <div>
              <label className="text-xs text-studio-muted block mb-1">End time</label>
              <input
                name="end_time"
                type="datetime-local"
                required
                className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
              />
            </div>
            <textarea
              name="description"
              placeholder="Notes"
              rows={2}
              className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
            />
            <button
              type="submit"
              className="w-full rounded bg-tungsten hover:bg-tungsten-hover transition-colors text-white text-sm font-medium py-2"
            >
              Schedule
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
