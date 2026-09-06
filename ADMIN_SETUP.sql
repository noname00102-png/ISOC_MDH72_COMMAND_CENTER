-- ISOC MDH72 Admin authorization baseline
-- Run in Supabase SQL Editor after reviewing existing schema.
-- Adjust column names only if your existing profiles/threats schema differs.

-- Recommended profiles shape:
-- profiles(id uuid primary key references auth.users(id), role text not null default 'viewer')

-- Recommended role values:
-- admin, commander, officer, viewer

-- Enable RLS on operational data.
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.threats ENABLE ROW LEVEL SECURITY;

-- Helper: current user's role.
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Remove conflicting baseline policies before recreating these names.
DROP POLICY IF EXISTS "threats_admin_all" ON public.threats;
DROP POLICY IF EXISTS "threats_authenticated_read" ON public.threats;
DROP POLICY IF EXISTS "threats_officer_insert" ON public.threats;
DROP POLICY IF EXISTS "threats_officer_update" ON public.threats;

-- Authenticated users can read operational events.
CREATE POLICY "threats_authenticated_read"
ON public.threats FOR SELECT TO authenticated
USING (true);

-- Admin can fully manage threats.
CREATE POLICY "threats_admin_all"
ON public.threats FOR ALL TO authenticated
USING (public.current_user_role() = 'admin')
WITH CHECK (public.current_user_role() = 'admin');

-- Officers can create/update events.
CREATE POLICY "threats_officer_insert"
ON public.threats FOR INSERT TO authenticated
WITH CHECK (public.current_user_role() IN ('admin','officer'));

CREATE POLICY "threats_officer_update"
ON public.threats FOR UPDATE TO authenticated
USING (public.current_user_role() IN ('admin','officer'))
WITH CHECK (public.current_user_role() IN ('admin','officer'));
