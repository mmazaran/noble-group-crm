import { signIn } from "./actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-studio-bg px-6">
      <div className="w-full max-w-sm">
        {/* Signature element: film-slate style header */}
        <div className="mb-8 font-mono text-xs text-studio-muted flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-tungsten" />
          <span>SCENE 01 — TAKE 01 — CRM</span>
        </div>

        <h1 className="font-display text-3xl text-studio-text mb-1">Noble Group</h1>
        <p className="text-studio-muted text-sm mb-8">Sign in to your production dashboard</p>

        {searchParams.error && (
          <div className="mb-4 rounded border border-status-overdue/40 bg-status-overdue/10 px-3 py-2 text-sm text-status-overdue">
            {searchParams.error}
          </div>
        )}
        {searchParams.message && (
          <div className="mb-4 rounded border border-status-posted/40 bg-status-posted/10 px-3 py-2 text-sm text-status-posted">
            {searchParams.message}
          </div>
        )}

        <form action={signIn} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-studio-muted mb-1">EMAIL</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded border border-studio-border bg-studio-surface px-3 py-2 text-studio-text outline-none focus:border-tungsten"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-studio-muted mb-1">PASSWORD</label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded border border-studio-border bg-studio-surface px-3 py-2 text-studio-text outline-none focus:border-tungsten"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded bg-tungsten hover:bg-tungsten-hover transition-colors text-white font-medium py-2"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-xs text-studio-faint">
          Need an account? Ask your Noble Group admin to create one, or use the sign-up flow
          your admin has enabled for clients.
        </p>
      </div>
    </div>
  );
}
