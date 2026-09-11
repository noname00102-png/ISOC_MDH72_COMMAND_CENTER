-- ISOC MDH72 COMMAND CENTER
-- Production RLS hardening applied to Supabase project riuebseoczwwifxezcwj
-- Date: 2026-09-11
--
-- Purpose:
-- 1) Keep public threat reads limited to visibility='public'.
-- 2) Make authenticated writes role-aware.
-- 3) Keep admin-only profile/audit operations protected.
-- 4) Keep threat image metadata tied to the authenticated creator/admin.
--
-- NOTE: This file documents the production migration already applied.

create schema if not exists private;

create or replace function private.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public, private
as $$
  select lower(coalesce(p.role,''))
  from public.profiles p
  where p.id = auth.uid()
  limit 1;
$$;

revoke all on function private.current_profile_role() from public;
grant execute on function private.current_profile_role() to authenticated;

revoke all on table public.profiles, public.threats, public.threat_images, public.audit_logs, public.weather_forecast_history from anon, authenticated;

grant select on public.profiles to authenticated;
grant select on public.threats to anon, authenticated;
grant insert, update, delete on public.threats to authenticated;
grant select, insert, update, delete on public.threat_images to authenticated;
grant insert, select on public.audit_logs to authenticated;
grant select on public.weather_forecast_history to anon, authenticated;

-- Remove legacy broad policies so the policies below are authoritative.
drop policy if exists "profiles_authenticated_read_own" on public.profiles;
drop policy if exists "profiles_self_read" on public.profiles;
drop policy if exists "profiles_self_or_admin_read" on public.profiles;
drop policy if exists "profiles_admin_insert" on public.profiles;
drop policy if exists "profiles_admin_update" on public.profiles;
drop policy if exists "threats_admin_all" on public.threats;
drop policy if exists "threats_authenticated_read" on public.threats;
drop policy if exists "threats_officer_insert" on public.threats;
drop policy if exists "threats_officer_update" on public.threats;
drop policy if exists "threats_public_read" on public.threats;

-- Profiles
drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_or_admin
on public.profiles for select to authenticated
using (id = auth.uid() or private.current_profile_role() = 'admin');

create policy profiles_admin_insert
on public.profiles for insert to authenticated
with check (private.current_profile_role() in ('admin','administrator','ผู้ดูแลระบบ'));

create policy profiles_admin_update
on public.profiles for update to authenticated
using (private.current_profile_role() in ('admin','administrator','ผู้ดูแลระบบ'))
with check (private.current_profile_role() in ('admin','administrator','ผู้ดูแลระบบ'));

-- Threats: anonymous public read only; authenticated users may read operational data.
drop policy if exists threats_select_public on public.threats;
create policy threats_select_public
on public.threats for select to anon
using (coalesce(visibility,'public') = 'public');

drop policy if exists threats_select_authenticated on public.threats;
create policy threats_select_authenticated
on public.threats for select to authenticated
using (true);

-- Create: admin/officer only, and created_by must equal auth.uid().
drop policy if exists threats_insert_officer_admin on public.threats;
create policy threats_insert_officer_admin
on public.threats for insert to authenticated
with check (
  created_by = auth.uid()
  and private.current_profile_role() in ('admin','administrator','ผู้ดูแลระบบ','officer','เจ้าหน้าที่','เจ้าหน้าที่ปฏิบัติการ')
);

-- Update: admin may edit any threat; officer may edit own threats only.
drop policy if exists threats_update_admin_or_owner on public.threats;
create policy threats_update_admin_or_owner
on public.threats for update to authenticated
using (
  private.current_profile_role() in ('admin','administrator','ผู้ดูแลระบบ')
  or (created_by = auth.uid() and private.current_profile_role() in ('officer','เจ้าหน้าที่','เจ้าหน้าที่ปฏิบัติการ'))
)
with check (
  private.current_profile_role() in ('admin','administrator','ผู้ดูแลระบบ')
  or (created_by = auth.uid() and private.current_profile_role() in ('officer','เจ้าหน้าที่','เจ้าหน้าที่ปฏิบัติการ'))
);

-- Delete: admin only.
drop policy if exists threats_delete_admin on public.threats;
create policy threats_delete_admin
on public.threats for delete to authenticated
using (private.current_profile_role() in ('admin','administrator','ผู้ดูแลระบบ'));

-- Threat image metadata follows the same ownership/admin model.
drop policy if exists threat_images_select_authenticated on public.threat_images;
create policy threat_images_select_authenticated
on public.threat_images for select to authenticated
using (
  private.current_profile_role() in ('admin','administrator','ผู้ดูแลระบบ')
  or created_by = auth.uid()
  or exists (
    select 1 from public.threats t
    where t.id = threat_images.threat_id
      and coalesce(t.visibility,'public') = 'public'
  )
);

drop policy if exists threat_images_insert_officer_admin on public.threat_images;
create policy threat_images_insert_officer_admin
on public.threat_images for insert to authenticated
with check (
  created_by = auth.uid()
  and private.current_profile_role() in ('admin','administrator','ผู้ดูแลระบบ','officer','เจ้าหน้าที่','เจ้าหน้าที่ปฏิบัติการ')
);

drop policy if exists threat_images_update_owner_admin on public.threat_images;
create policy threat_images_update_owner_admin
on public.threat_images for update to authenticated
using (private.current_profile_role() in ('admin','administrator','ผู้ดูแลระบบ') or created_by = auth.uid())
with check (private.current_profile_role() in ('admin','administrator','ผู้ดูแลระบบ') or created_by = auth.uid());

drop policy if exists threat_images_delete_owner_admin on public.threat_images;
create policy threat_images_delete_owner_admin
on public.threat_images for delete to authenticated
using (private.current_profile_role() in ('admin','administrator','ผู้ดูแลระบบ') or created_by = auth.uid());

-- Audit logs: append own events; admin-only read.
drop policy if exists audit_logs_insert_self on public.audit_logs;
create policy audit_logs_insert_self
on public.audit_logs for insert to authenticated
with check (actor_id = auth.uid());

drop policy if exists audit_logs_select_admin on public.audit_logs;
create policy audit_logs_select_admin
on public.audit_logs for select to authenticated
using (private.current_profile_role() in ('admin','administrator','ผู้ดูแลระบบ'));

-- Weather history is browser-readable; server-side forecast ingestion remains privileged.
drop policy if exists weather_history_select_public on public.weather_forecast_history;
create policy weather_history_select_public
on public.weather_forecast_history for select to anon, authenticated
using (true);
