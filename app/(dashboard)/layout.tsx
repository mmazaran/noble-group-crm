import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "./sign-out-button";

const NAV = [
  { code: "00:01", label: "Dashboard", href: "/", internalOnly: false },
  { code: "00:02", label: "Clients", href: "/clients", internalOnly: false },
  { code: "00:03", label: "Job Sites", href: "/projects", internalOnly: false },
  { code: "00:04", label: "Content Calendar", href: "/content", internalOnly: false },
  { code: "00:05", label: "Tasks", href: "/tasks", internalOnly: true },
  { code: "00:06", label: "Invoices", href: "/invoices", internalOnly: false },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", authData.user.id)
    .single();

  const isInternal = profile?.role === "owner" || profile?.role === "team";

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 border-r border-studio-border bg-studio-surface flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-studio-border">
          <div className="font-mono text-[10px] text-studio-muted tracking-widest mb-1">
            NOBLE GROUP
          </div>
          <div className="font-display text-lg leading-tight">Production CRM</div>
        </div>

        <nav className="flex-1 py-4">
          {NAV.filter((item) => !item.internalOnly || isInternal).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-5 py-2.5 text-sm text-studio-muted hover:text-studio-text hover:bg-studio-surface2 transition-colors group"
            >
              <span className="font-mono text-[11px] text-tungsten-dim group-hover:text-tungsten">
                {item.code}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-studio-border">
          <div className="text-sm text-studio-text truncate">{profile?.full_name || "—"}</div>
          <div className="text-xs font-mono text-studio-faint uppercase mb-3">
            {profile?.role || "—"}
          </div>
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 bg-studio-bg overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
