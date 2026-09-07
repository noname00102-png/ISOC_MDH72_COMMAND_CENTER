-- ISOC MDH72 — PRODUCTION RLS / ROLE / TIMESTAMP SETUP
-- Verified against production project: riuebseoczwwifxezcwj.
-- Canonical roles: admin, commander, officer, viewer.
-- Compatibility aliases: administrator, ผู้ดูแลระบบ, เจ้าหน้าที่, เจ้าหน้าที่ปฏิบัติการ.
-- UI role checks are convenience only; Supabase RLS is authoritative.

ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.threats ENABLE ROW LEVEL SECURITY;

-- Admin role helper. SECURITY DEFINER avoids policy recursion when profiles is protected by RLS.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND lower(trim(role)) = ANY (ARRAY['admin','administrator','ผู้ดูแลระบบ'])
  );
$$;

-- Production timestamp defaults.
ALTER TABLE public.threats ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.threats ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.profiles ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.profiles ALTER COLUMN updated_at SET DEFAULT now();

-- Production trigger: updated_at changes on every UPDATE of threats.
CREATE OR REPLACE FUNCTION public.set_threat_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS threats_set_updated_at ON public.threats;
CREATE TRIGGER threats_set_updated_at
BEFORE UPDATE ON public.threats
FOR EACH ROW EXECUTE FUNCTION public.set_threat_updated_at();

-- Profiles: own profile read; admins may read all profiles.
DROP POLICY IF EXISTS "profiles_authenticated_read_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_or_admin_read" ON public.profiles;
CREATE POLICY "profiles_self_or_admin_read"
ON public.profiles
FOR SELECT TO authenticated
USING ((id = auth.uid()) OR is_admin());

DROP POLICY IF EXISTS "profiles_admin_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
CREATE POLICY "profiles_admin_insert"
ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (is_admin());
CREATE POLICY "profiles_admin_update"
ON public.profiles
FOR UPDATE TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Threats: authenticated users can read; officers can create/update; admin has full access.
DROP POLICY IF EXISTS "threats_admin_all" ON public.threats;
DROP POLICY IF EXISTS "threats_authenticated_read" ON public.threats;
DROP POLICY IF EXISTS "threats_officer_insert" ON public.threats;
DROP POLICY IF EXISTS "threats_officer_update" ON public.threats;
DROP POLICY IF EXISTS "threats_public_read" ON public.threats;

CREATE POLICY "threats_admin_all"
ON public.threats
FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "threats_authenticated_read"
ON public.threats
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "threats_officer_insert"
ON public.threats
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND lower(trim(p.role)) = ANY (ARRAY[
        'admin','administrator','officer','ผู้ดูแลระบบ','เจ้าหน้าที่','เจ้าหน้าที่ปฏิบัติการ'
      ])
  )
);

CREATE POLICY "threats_officer_update"
ON public.threats
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND lower(trim(p.role)) = ANY (ARRAY[
        'admin','administrator','officer','ผู้ดูแลระบบ','เจ้าหน้าที่','เจ้าหน้าที่ปฏิบัติการ'
      ])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND lower(trim(p.role)) = ANY (ARRAY[
        'admin','administrator','officer','ผู้ดูแลระบบ','เจ้าหน้าที่','เจ้าหน้าที่ปฏิบัติการ'
      ])
  )
);

CREATE POLICY "threats_public_read"
ON public.threats
FOR SELECT TO anon
USING (visibility = 'public');

-- NOTE: Production also contains trg_profile_audit and trg_threat_audit.
-- Those existing audit triggers are intentionally not recreated here because
-- their audit functions are production-specific and were not changed.
