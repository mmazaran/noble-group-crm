import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const STATUS_STYLE: Record<string, string> = {
  planned: "text-studio-faint border-studio-border",
  shot: "text-status-progress border-status-progress",
  editing: "text-status-ready border-status-ready",
  ready: "text-status-posted border-status-posted",
  scheduled: "text-status-ready border-status-ready",
  posted: "text-status-posted border-status-posted",
};

const TYPE_EMOJI: Record<string, string> = {
  reel: "🎬",
  post: "📸",
  carousel: "🖼️",
  story: "📱",
  photo_set: "📷",
};

export default async function PortalContentPage() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, client_id")
    .eq("id", authData.user.id)
    .single();

  if (!profile || profile.role !== "client") redirect("/");

  // Get client's projects then their content
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("client_id", profile.client_id!);

  const projectIds = (projects ?? []).map((p) => p.id);
  const projectMap = Object.fromEntries((projects ?? []).map((p) => [p.id, p.name]));

  const { data: content } = projectIds.length
    ? await supabase
        .from("content_items")
        .select("*")
        .in("project_id", projectIds)
        .order("scheduled_date", { ascending: false })
    : { data: [] };

  const posted = content?.filter((c) => c.status === "posted") ?? [];
  const inProgress = content?.filter((c) => c.status !== "posted") ?? [];

  function ContentCard({ item }: { item: any }) {
    return (
      <div className="rounded-lg border border-studio-border bg-studio-surface p-4">
        <div className="flex items-start gap-3">
          <span className="text-lg flex-shrink-0">{TYPE_EMOJI[item.type] ?? "📄"}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-medium text-sm">{item.title}</span>
              <span
                className={`text-[10px] font-mono border rounded px-1.5 py-0.5 uppercase ${STATUS_STYLE[item.status] ?? ""}`}
              >
                {item.status}
              </span>
            </div>
            <div className="text-xs text-studio-faint mb-1">
              {projectMap[item.project_id] ?? ""} · {item.platform ?? "instagram"}
            </div>
            {item.scheduled_date && (
              <div className="text-xs text-studio-muted">
                {item.status === "posted" ? "Posted" : "Scheduled"}{" "}
                {new Date(item.scheduled_date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            )}
            {item.caption && (
              <div className="text-xs text-studio-muted mt-2 line-clamp-2">{item.caption}</div>
            )}
            {item.file_url && (
              <a
                href={item.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-xs text-tungsten hover:text-tungsten-hover"
              >
                View / Download →
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="font-mono text-xs text-studio-muted mb-1">01:02 — CONTENT</div>
        <h1 className="font-display text-2xl">Your Content</h1>
        <p className="text-sm text-studio-muted mt-1">
          All content we're creating and have published for your brand.
        </p>
      </div>

      {inProgress.length > 0 && (
        <div className="mb-8">
          <div className="font-mono text-xs text-studio-muted uppercase tracking-widest mb-3">
            In Production
          </div>
          <div className="space-y-3">
            {inProgress.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {posted.length > 0 && (
        <div>
          <div className="font-mono text-xs text-studio-muted uppercase tracking-widest mb-3">
            Published
          </div>
          <div className="space-y-3">
            {posted.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {!content?.length && (
        <div className="rounded-lg border border-dashed border-studio-border p-10 text-center">
          <div className="text-studio-muted text-sm mb-1">No content yet</div>
          <div className="text-studio-faint text-xs">
            Content will appear here once Noble Group starts production on your projects.
          </div>
        </div>
      )}
    </div>
  );
}
