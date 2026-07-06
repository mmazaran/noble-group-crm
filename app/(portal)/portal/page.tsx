import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const STAGE_STEPS = [
  { key: "foundation", label: "Foundation" },
  { key: "framing", label: "Framing" },
  { key: "interior", label: "Interior" },
  { key: "near_complete", label: "Near Complete" },
  { key: "complete", label: "Complete" },
];

const STAGE_INDEX: Record<string, number> = Object.fromEntries(
  STAGE_STEPS.map((s, i) => [s.key, i])
);

function ProjectTracker({ project }: { project: any }) {
  const currentIdx = STAGE_INDEX[project.stage] ?? 0;

  return (
    <div className="rounded-lg border border-studio-border bg-studio-surface p-5 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-medium text-studio-text">{project.name}</div>
          {project.address && (
            <div className="text-sm text-studio-muted">{project.address}</div>
          )}
          {project.start_date && (
            <div className="text-xs text-studio-faint mt-0.5">
              Started {new Date(project.start_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </div>
          )}
        </div>
        {project.stage === "on_hold" && (
          <span className="text-xs font-mono border border-status-overdue text-status-overdue rounded px-2 py-1">
            On Hold
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-0 mb-2">
        {STAGE_STEPS.map((step, idx) => {
          const isComplete = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isLast = idx === STAGE_STEPS.length - 1;

          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full border-2 transition-colors ${
                    isComplete
                      ? "bg-tungsten border-tungsten"
                      : isCurrent
                      ? "bg-transparent border-tungsten"
                      : "bg-transparent border-studio-border"
                  }`}
                />
              </div>
              {!isLast && (
                <div
                  className={`flex-1 h-0.5 ${isComplete ? "bg-tungsten" : "bg-studio-border"}`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between">
        {STAGE_STEPS.map((step, idx) => {
          const isCurrent = idx === currentIdx;
          return (
            <div
              key={step.key}
              className={`text-[10px] font-mono text-center ${isCurrent ? "text-tungsten" : "text-studio-faint"}`}
              style={{ width: `${100 / STAGE_STEPS.length}%` }}
            >
              {step.label}
            </div>
          );
        })}
      </div>

      {/* Upcoming appointments for this project */}
      {project.appointments?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-studio-border">
          <div className="text-xs font-mono text-studio-muted uppercase tracking-widest mb-2">
            Upcoming Shoots
          </div>
          {project.appointments
            .filter((a: any) => a.status === "scheduled")
            .slice(0, 3)
            .map((a: any) => (
              <div key={a.id} className="flex items-center justify-between py-1">
                <span className="text-sm text-studio-text">{a.title}</span>
                <span className="text-xs text-studio-muted">
                  {new Date(a.start_time).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default async function PortalPage() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, client_id, full_name, clients(company_name)")
    .eq("id", authData.user.id)
    .single();

  if (!profile || profile.role !== "client") redirect("/");

  const { data: projects } = await supabase
    .from("projects")
    .select("*, appointments(id, title, start_time, status, type)")
    .eq("client_id", profile.client_id!)
    .order("created_at", { ascending: false });

  const { data: contentStats } = await supabase
    .from("content_items")
    .select("status, project_id")
    .in(
      "project_id",
      (projects ?? []).map((p) => p.id)
    );

  const totalContent = contentStats?.length ?? 0;
  const postedContent = contentStats?.filter((c) => c.status === "posted").length ?? 0;
  const inPipeline = contentStats?.filter(
    (c) => !["posted", "planned"].includes(c.status)
  ).length ?? 0;

  const activeProjects = projects?.filter((p) => p.stage !== "complete" && p.stage !== "on_hold") ?? [];

  return (
    <div>
      <div className="mb-8">
        <div className="font-mono text-xs text-studio-muted mb-1">01:01 — MY PROJECTS</div>
        <h1 className="font-display text-2xl">
          Welcome, {profile.full_name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-sm text-studio-muted mt-1">
          Here's an overview of your active projects and upcoming shoots.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Active projects", value: activeProjects.length },
          { label: "Content posted", value: postedContent },
          { label: "Content in production", value: inPipeline },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-studio-border bg-studio-surface p-4">
            <div className="font-display text-3xl mb-1">{stat.value}</div>
            <div className="text-sm text-studio-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Projects */}
      <div className="mb-4">
        <div className="font-mono text-xs text-studio-muted uppercase tracking-widest mb-4">
          Your Projects
        </div>
        {projects?.length ? (
          projects.map((project) => <ProjectTracker key={project.id} project={project} />)
        ) : (
          <div className="text-studio-muted text-sm">No projects yet. Noble Group will add your job sites here.</div>
        )}
      </div>
    </div>
  );
}
