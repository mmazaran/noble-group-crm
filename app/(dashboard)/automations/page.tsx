import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { addAutomation, toggleAutomation, deleteAutomation } from "./actions";

const TRIGGER_LABELS: Record<string, string> = {
  appointment_scheduled: "Appointment Scheduled",
  appointment_completed: "Shoot Completed",
  stage_changed_to_proposal: "Client Reaches Proposal Stage",
  stage_changed_to_contract: "Contract Signed",
  stage_changed_to_active: "Client Goes Active",
  content_posted: "Content Posted",
};

const ACTION_LABELS: Record<string, string> = {
  send_email: "Send Email",
  send_sms: "Send SMS",
  create_task: "Create Task",
  notify_team: "Notify Team",
};

export default async function AutomationsPage() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (profile?.role === "client") redirect("/portal");

  const { data: automations } = await supabase
    .from("automations")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <div className="font-mono text-xs text-studio-muted mb-1">00:08 — AUTOMATIONS</div>
        <h1 className="font-display text-2xl">Automations</h1>
        <p className="text-sm text-studio-muted mt-1">
          Trigger automatic actions when events happen in your CRM.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {automations?.length ? (
            automations.map((auto: any) => (
              <div
                key={auto.id}
                className={`rounded-lg border bg-studio-surface p-4 ${auto.is_active ? "border-studio-border" : "border-studio-border opacity-50"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${auto.is_active ? "bg-status-posted" : "bg-studio-faint"}`}
                      />
                      <span className="font-medium text-sm">{auto.name}</span>
                    </div>
                    <div className="text-xs text-studio-muted space-y-1">
                      <div>
                        <span className="font-mono text-studio-faint">WHEN </span>
                        {TRIGGER_LABELS[auto.trigger_event] ?? auto.trigger_event}
                      </div>
                      <div>
                        <span className="font-mono text-studio-faint">DO </span>
                        {ACTION_LABELS[auto.action_type] ?? auto.action_type}
                        {auto.action_config?.to && (
                          <span className="text-studio-faint"> → {auto.action_config.to}</span>
                        )}
                      </div>
                      {auto.action_config?.message && (
                        <div className="mt-1 text-studio-faint italic">
                          "{auto.action_config.message}"
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <form>
                      <button
                        formAction={async () => {
                          "use server";
                          await toggleAutomation(auto.id, auto.is_active);
                        }}
                        className="text-xs text-studio-muted hover:text-studio-text border border-studio-border rounded px-2 py-1 transition-colors"
                      >
                        {auto.is_active ? "Pause" : "Enable"}
                      </button>
                    </form>
                    <form>
                      <button
                        formAction={async () => {
                          "use server";
                          await deleteAutomation(auto.id);
                        }}
                        className="text-xs text-status-overdue hover:opacity-80 border border-studio-border rounded px-2 py-1 transition-colors"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-studio-border p-8 text-center">
              <div className="text-studio-muted text-sm mb-1">No automations yet</div>
              <div className="text-studio-faint text-xs">
                Create your first workflow to automate follow-ups and notifications.
              </div>
            </div>
          )}
        </div>

        {/* Add automation form */}
        <div className="rounded-lg border border-studio-border bg-studio-surface p-5 h-fit">
          <h2 className="font-display text-lg mb-4">New automation</h2>
          <form action={addAutomation} className="space-y-3">
            <input
              name="name"
              placeholder="Automation name"
              required
              className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
            />
            <div>
              <label className="text-xs text-studio-muted block mb-1">When this happens…</label>
              <select
                name="trigger_event"
                required
                className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
              >
                {Object.entries(TRIGGER_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-studio-muted block mb-1">Do this…</label>
              <select
                name="action_type"
                required
                className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
              >
                {Object.entries(ACTION_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <input
              name="action_to"
              placeholder="Send to (client / team)"
              className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
            />
            <textarea
              name="action_message"
              placeholder="Message template"
              rows={3}
              className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
            />
            <button
              type="submit"
              className="w-full rounded bg-tungsten hover:bg-tungsten-hover transition-colors text-white text-sm font-medium py-2"
            >
              Create automation
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
