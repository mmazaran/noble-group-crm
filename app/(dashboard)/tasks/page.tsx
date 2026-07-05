import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { addTask } from "./actions";
import TaskStatusSelect from "./task-status-select";

export default async function TasksPage() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user!.id)
    .single();

  const isInternal = profile?.role === "owner" || profile?.role === "team";
  if (!isInternal) redirect("/");

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, projects(name)")
    .order("due_date", { ascending: true });

  const { data: projects } = await supabase.from("projects").select("id, name");

  return (
    <div>
      <div className="mb-8">
        <div className="font-mono text-xs text-studio-muted mb-1">00:05 — TASKS</div>
        <h1 className="font-display text-2xl">Tasks</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-2">
          {tasks?.length ? (
            tasks.map((t) => (
              <div
                key={t.id}
                className="rounded border border-studio-border bg-studio-surface p-3 flex items-center gap-3"
              >
                <div className="flex-1">
                  <div className={`text-sm ${t.status === "done" ? "line-through text-studio-faint" : ""}`}>
                    {t.title}
                  </div>
                  <div className="text-xs text-studio-muted">
                    {t.projects?.name ?? "General"} {t.due_date ? `· due ${t.due_date}` : ""}
                  </div>
                </div>
                <TaskStatusSelect id={t.id} currentStatus={t.status} />
              </div>
            ))
          ) : (
            <div className="text-studio-muted text-sm">No tasks yet.</div>
          )}
        </div>

        <div className="rounded-lg border border-studio-border bg-studio-surface p-5 h-fit">
          <h2 className="font-display text-lg mb-4">Add task</h2>
          <form action={addTask} className="space-y-3">
            <input
              name="title"
              placeholder="Task title"
              required
              className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
            />
            <select
              name="project_id"
              className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
            >
              <option value="">No job site (general)</option>
              {projects?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              name="due_date"
              type="date"
              className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
            />
            <textarea
              name="description"
              placeholder="Details"
              rows={2}
              className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
            />
            <button
              type="submit"
              className="w-full rounded bg-tungsten hover:bg-tungsten-hover transition-colors text-white text-sm font-medium py-2"
            >
              Add task
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
