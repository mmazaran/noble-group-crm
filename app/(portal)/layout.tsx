import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "../(dashboard)/sign-out-button";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, client_id, clients(company_name)")
    .eq("id", authData.user.id)
    .single();

  // Internal staff who accidentally hit /portal → redirect to dashboard
  if (profile?.role === "owner" || profile?.role === "team") redirect("/");

  const clientName = (profile as any)?.clients?.company_name ?? "Client Portal";

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 border-r border-studio-border bg-studio-surface flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-studio-border">
          <div className="font-mono text-[10px] text-studio-muted tracking-widest mb-1">
            NOBLE GROUP
          </div>
          <div className="font-display text-lg leading-tight">Client Portal</div>
          <div className="text-xs text-studio-muted mt-1 truncate">{clientName}</div>
        </div>

        <nav className="flex-1 py-4">
          {[
            { code: "01:01", label: "My Projects", href: "/portal" },
            { code: "01:02", label: "Content", href: "/portal/content" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-5 py-2.5 text-sm text-studio-muted hover:text-studio-text hover:bg-studio-surface2 transition-colors group"
            >
              <span className="font-mono text-[11px] text-tungsten-dim group-hover:text-tungsten">
                {item.code}
              </span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-studio-border">
          <div className="text-sm text-studio-text truncate">{profile?.full_name || "—"}</div>
          <div className="text-xs font-mono text-studio-faint uppercase mb-3">Client</div>
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 bg-studio-bg overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
