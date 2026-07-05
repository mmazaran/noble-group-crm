import { createClient } from "@/lib/supabase/server";
import { addClient } from "./actions";

const TYPE_LABEL: Record<string, string> = {
  remodel: "Remodel",
  new_construction: "New Construction",
  course_lead: "Course Lead",
  other: "Other",
};

export default async function ClientsPage() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user!.id)
    .single();
  const isInternal = profile?.role === "owner" || profile?.role === "team";

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <div className="font-mono text-xs text-studio-muted mb-1">00:02 — CLIENTS</div>
        <h1 className="font-display text-2xl">Clients</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {clients?.length ? (
            clients.map((c) => (
              <div
                key={c.id}
                className="rounded-lg border border-studio-border bg-studio-surface p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{c.company_name}</div>
                  <div className="text-sm text-studio-muted">
                    {c.contact_name} · {c.email}
                  </div>
                </div>
                <span className="text-xs font-mono text-studio-muted border border-studio-border rounded px-2 py-1">
                  {TYPE_LABEL[c.type] ?? c.type}
                </span>
              </div>
            ))
          ) : (
            <div className="text-studio-muted text-sm">No clients yet.</div>
          )}
        </div>

        {isInternal && (
          <div className="rounded-lg border border-studio-border bg-studio-surface p-5 h-fit">
            <h2 className="font-display text-lg mb-4">Add client</h2>
            <form action={addClient} className="space-y-3">
              <input
                name="company_name"
                placeholder="Company name"
                required
                className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
              />
              <input
                name="contact_name"
                placeholder="Primary contact"
                className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
              />
              <input
                name="phone"
                placeholder="Phone"
                className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
              />
              <select
                name="type"
                className="w-full rounded border border-studio-border bg-studio-bg px-3 py-2 text-sm outline-none focus:border-tungsten"
              >
                <option value="remodel">Remodel</option>
                <option value="new_construction">New Construction</option>
                <option value="course_lead">Course Lead</option>
                <option value="other">Other</option>
              </select>
              <button
                type="submit"
                className="w-full rounded bg-tungsten hover:bg-tungsten-hover transition-colors text-white text-sm font-medium py-2"
              >
                Add client
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
