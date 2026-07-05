# Noble Group CRM

A production dashboard for Noble Group: clients, job sites, content calendar,
tasks, and invoicing. Built with Next.js + Supabase, deploys on Vercel.

## What's included

- **Clients** — the businesses you serve (A.R. Home Construction, Holfester Homes, etc.)
- **Job Sites** — projects tied to a client, with a build stage (foundation → complete)
- **Content Calendar** — reels/posts/carousels per job site, tracked planned → posted
- **Tasks** — internal to-dos, team-only (not visible to clients)
- **Invoices** — line-item invoices per client, status tracked draft → paid
- **Roles** — `owner` and `team` see everything; `client` logins are scoped to only
  their own company's job sites, content, and invoices (enforced at the database
  level via Row Level Security, not just hidden in the UI)

## 1. Create your Supabase project

1. Go to https://supabase.com → sign up (free tier is enough to start) → **New Project**.
2. Pick a name (e.g. `noble-group-crm`), a database password (save it somewhere safe),
   and a region close to you (US East is fine for Long Island).
3. Once it's provisioned, go to **SQL Editor** → **New query**.
4. Open `supabase/schema.sql` from this project, paste the entire contents in, and click **Run**.
   This creates every table, the roles, and the security rules in one shot.
5. Go to **Project Settings → API**. You'll need three values in the next step:
   - `Project URL`
   - `anon public` key
   - `service_role` key (keep this one secret — never put it in a public repo or the browser)

## 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in the three values from step 1.5.

```
cp .env.local.example .env.local
```

## 3. Run it locally

```
npm install
npm run dev
```

Open http://localhost:3000 — it'll redirect you to `/login`.

## 4. Create your own account and make yourself the owner

1. On the login page, you'll need a sign-up option — for now, the fastest way is:
   Supabase Dashboard → **Authentication → Users → Add user** → enter your email/password,
   and check "Auto Confirm User."
2. Every new user is created with role `client` by default (safest default). To make
   yourself an owner: Supabase Dashboard → **Table Editor → profiles** → find your row →
   change `role` to `owner`.
3. Do the same for Angie (`team`) once she has an account.
4. For Tommy and Alexis, create their accounts the same way, then set their `client_id`
   in the `profiles` table to match their row in the `clients` table — that's what scopes
   their view to only their own job sites and invoices.

## 5. Deploy to Vercel

1. Push this project to a GitHub repo (create one on github.com, then):
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR-USERNAME/noble-group-crm.git
   git push -u origin main
   ```
2. Go to https://vercel.com → sign up/log in with GitHub → **Add New Project** →
   import the repo you just pushed.
3. In the import screen, expand **Environment Variables** and add the same three
   values from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Click **Deploy**. Vercel will build and give you a live URL
   (e.g. `noble-group-crm.vercel.app`).
5. From now on, every time you push to `main` on GitHub, Vercel redeploys automatically.

## Notes on what's stubbed vs. complete

- Every module (Clients, Job Sites, Content Calendar, Tasks, Invoices) has working
  list views, add forms, and status updates, wired to real Supabase queries and
  server actions — not placeholder UI.
- Sign-up is currently admin-created (via Supabase dashboard) rather than
  self-serve, since you want to control who gets `team` vs `client` access. If you
  want a self-serve client invite flow later (e.g. "Invite client" button that emails
  them a link), that's a natural next addition.
- File uploads for content (photos/video links) currently take a plain URL
  (`file_url`) — wiring up direct upload to Supabase Storage is a quick follow-on.
- No automated tests yet. For a tool this size, I'd add a few once the core flows
  are in daily use and stable.

## Project structure

```
app/
  login/              — sign-in page + server actions
  auth/callback/       — email confirmation redirect handler
  (dashboard)/         — everything behind auth
    layout.tsx          — sidebar shell, role-aware nav
    page.tsx             — overview / stats
    clients/            — client list + add
    projects/            — job site list + add, stage tracking
    content/             — content calendar board (by status)
    tasks/               — internal task list
    invoices/            — invoice list + line items
lib/supabase/          — browser/server/middleware Supabase clients
supabase/schema.sql     — full database schema + Row Level Security policies
middleware.ts            — protects all routes, redirects unauthenticated users
```
