-- ============================================================================
-- NOBLE GROUP CRM — SCHEMA ADDITIONS
-- Run this in Supabase: Dashboard -> SQL Editor -> paste -> Run
-- These are additive changes on top of schema.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PIPELINE STAGE — add to clients table
--    Stages: new_lead → contacted → proposal_sent → contract_signed → active_client → completed
-- ----------------------------------------------------------------------------
alter table clients
  add column if not exists pipeline_stage text not null default 'new_lead';

-- ----------------------------------------------------------------------------
-- 2. APPOINTMENTS — shoots, consultations, content reviews
-- ----------------------------------------------------------------------------
create table if not exists appointments (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid references clients(id) on delete cascade,
  project_id    uuid references projects(id) on delete set null,
  title         text not null,
  description   text,
  start_time    timestamptz not null,
  end_time      timestamptz not null,
  type          text not null default 'shoot',   -- shoot | consultation | review | other
  status        text not null default 'scheduled', -- scheduled | completed | cancelled
  assigned_to   uuid references profiles(id) on delete set null,
  created_at    timestamptz not null default now()
);

alter table appointments enable row level security;

-- Internal staff: full access
create policy "appointments_internal_full" on appointments
  for all using (is_internal());

-- Clients: read their own appointments
create policy "appointments_client_read" on appointments
  for select using (client_id = auth_client_id());

-- ----------------------------------------------------------------------------
-- 3. AUTOMATIONS — trigger/action workflow rules (stored rules, not live executor)
--    Integration with email/SMS providers (e.g. Resend, Twilio) to be wired
--    separately via Edge Functions or webhooks.
-- ----------------------------------------------------------------------------
create table if not exists automations (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  trigger_event       text not null,
  -- e.g. 'appointment_scheduled' | 'appointment_completed' |
  --      'stage_changed_to_proposal' | 'stage_changed_to_contract' |
  --      'stage_changed_to_active' | 'content_posted'
  trigger_condition   jsonb,
  action_type         text not null,
  -- e.g. 'send_email' | 'send_sms' | 'create_task' | 'notify_team'
  action_config       jsonb not null default '{}',
  -- e.g. { "to": "client", "message": "Your shoot is complete!" }
  is_active           boolean not null default true,
  created_at          timestamptz not null default now()
);

alter table automations enable row level security;

-- Only internal staff can manage automations
create policy "automations_internal_full" on automations
  for all using (is_internal());

-- ----------------------------------------------------------------------------
-- 4. DROP INVOICE RLS (optional — keeps tables for data safety but removes
--    client-facing access). Uncomment if you want to also drop the tables:
-- ----------------------------------------------------------------------------
-- drop table if exists invoice_items cascade;
-- drop table if exists invoices cascade;
-- drop type if exists invoice_status;
