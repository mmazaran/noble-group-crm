-- ============================================================================
-- PRIME VISUALS CRM — DATABASE SCHEMA
-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
create type user_role as enum ('owner', 'team', 'client');
create type client_type as enum ('remodel', 'new_construction', 'course_lead', 'other');
create type project_stage as enum ('foundation', 'framing', 'interior', 'near_complete', 'complete', 'on_hold');
create type content_type as enum ('reel', 'post', 'carousel', 'story', 'photo_set');
create type content_status as enum ('planned', 'shot', 'editing', 'ready', 'scheduled', 'posted');
create type task_status as enum ('todo', 'in_progress', 'done');
create type invoice_status as enum ('draft', 'sent', 'paid', 'overdue');

-- ----------------------------------------------------------------------------
-- CLIENTS  (the businesses Prime Visuals serves — e.g. A.R. Home Construction)
-- ----------------------------------------------------------------------------
create table clients (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  type client_type not null default 'other',
  notes text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- PROFILES  (extends Supabase auth.users with role + team/client linkage)
-- role = 'owner' | 'team'  -> internal Prime Visuals staff, see everything
-- role = 'client'          -> external client login, scoped to their client_id
-- ----------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role user_role not null default 'team',
  client_id uuid references clients(id) on delete set null,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- PROJECTS  (job sites — e.g. Roslyn foundation build, Manhasset remodel)
-- ----------------------------------------------------------------------------
create table projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  address text,
  stage project_stage not null default 'foundation',
  start_date date,
  notes text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- CONTENT ITEMS  (the content calendar — reels, posts, photo sets per job site)
-- ----------------------------------------------------------------------------
create table content_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  type content_type not null default 'reel',
  status content_status not null default 'planned',
  platform text default 'instagram',
  scheduled_date date,
  caption text,
  file_url text,
  assigned_to uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- TASKS  (internal to-dos, optionally linked to a project or content item)
-- ----------------------------------------------------------------------------
create table tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  content_item_id uuid references content_items(id) on delete cascade,
  title text not null,
  description text,
  assigned_to uuid references profiles(id) on delete set null,
  due_date date,
  status task_status not null default 'todo',
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- INVOICES + LINE ITEMS
-- ----------------------------------------------------------------------------
create table invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  invoice_number text not null unique,
  issue_date date not null default current_date,
  due_date date,
  status invoice_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  description text not null,
  quantity numeric not null default 1,
  unit_price numeric not null default 0
);

-- ----------------------------------------------------------------------------
-- HELPER: current user's role + client_id, used inside RLS policies
-- ----------------------------------------------------------------------------
create or replace function auth_role() returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql security definer stable;

create or replace function auth_client_id() returns uuid as $$
  select client_id from profiles where id = auth.uid();
$$ language sql security definer stable;

create or replace function is_internal() returns boolean as $$
  select auth_role() in ('owner', 'team');
$$ language sql security definer stable;

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Internal staff (owner/team) => full access.
-- Clients                     => read-only, scoped to rows tied to their client_id.
-- ----------------------------------------------------------------------------
alter table clients enable row level security;
alter table profiles enable row level security;
alter table projects enable row level security;
alter table content_items enable row level security;
alter table tasks enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;

-- profiles: everyone can read their own row; internal staff can read all
create policy "profiles_select_own_or_internal" on profiles
  for select using (id = auth.uid() or is_internal());
create policy "profiles_update_own" on profiles
  for update using (id = auth.uid());
create policy "profiles_internal_write" on profiles
  for insert with check (is_internal());

-- clients
create policy "clients_internal_full" on clients
  for all using (is_internal());
create policy "clients_self_read" on clients
  for select using (id = auth_client_id());

-- projects
create policy "projects_internal_full" on projects
  for all using (is_internal());
create policy "projects_client_read" on projects
  for select using (client_id = auth_client_id());

-- content_items (clients can see posted/scheduled content on their own jobs)
create policy "content_internal_full" on content_items
  for all using (is_internal());
create policy "content_client_read" on content_items
  for select using (
    project_id in (select id from projects where client_id = auth_client_id())
  );

-- tasks: internal only, never exposed to clients
create policy "tasks_internal_full" on tasks
  for all using (is_internal());

-- invoices
create policy "invoices_internal_full" on invoices
  for all using (is_internal());
create policy "invoices_client_read" on invoices
  for select using (client_id = auth_client_id());

-- invoice_items
create policy "invoice_items_internal_full" on invoice_items
  for all using (is_internal());
create policy "invoice_items_client_read" on invoice_items
  for select using (
    invoice_id in (select id from invoices where client_id = auth_client_id())
  );

-- ----------------------------------------------------------------------------
-- AUTO-CREATE A PROFILE ROW WHEN A NEW AUTH USER SIGNS UP
-- Defaults new users to 'client' role — you upgrade yourself/team to
-- 'owner'/'team' manually in Table Editor after first login (see README).
-- ----------------------------------------------------------------------------
create or replace function handle_new_user() returns trigger as $$
begin
  insert into profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'client');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ----------------------------------------------------------------------------
-- SEED DATA (optional — comment out if you don't want sample rows)
-- ----------------------------------------------------------------------------
insert into clients (company_name, contact_name, type, email) values
  ('A.R. Home Construction', 'Tommy', 'remodel', 'tommy@example.com'),
  ('Holfester Homes', 'Alexis', 'new_construction', 'alexis@example.com');
