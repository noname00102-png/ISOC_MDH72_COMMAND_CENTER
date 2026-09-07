-- ISOC MDH72 — PRODUCTION RLS / ROLE SETUP
-- This file is synchronized to the currently verified Supabase policies.
-- Verified against project riuebseoczwwifxezcwj.
-- Roles supported by the application: admin, commander, officer, viewer.
-- Compatibility role names currently accepted by the existing production policies:
-- administrator, ผู้ดูแลระบบ, เจ้าหน้าที่, เจ้าหน้าที่ปฏิบัติการ.
-- IMPORTANT: UI checks are not a security boundary. RLS remains authoritative.

ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.threats ENABLE ROW LEVEL SECURITY;

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
      AND lower(role) = 'admin'
  );
$$;

-- Recreate the verified profiles policies.
DROP POLICY IF EXISTS "profiles_admin_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_authenticated_read_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_read" ON public.profiles;

CREATE POLICY "profiles_admin_insert"
ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "profiles_admin_update"
ON public.profiles
FOR UPDATE TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "profiles_authenticated_read_own"
ON public.profiles
FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "profiles_self_read"
ON public.profiles
FOR SELECT TO authenticated
USING ((id = auth.uid()) OR is_admin());

-- Recreate the verified threats policies.
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
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND lower(trim(p.role)) = ANY (
        ARRAY[
          'admin',
          'administrator',
          'officer',
          'ผู้ดูแลระบบ',
          'เจ้าหน้าที่',
          'เจ้าหน้าที่ปฏิบัติการ'
        ]
      )
  )
);

CREATE POLICY "threats_officer_update"
ON public.threats
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND lower(trim(p.role)) = ANY (
        ARRAY[
          'admin',
          'administrator',
          'officer',
          'ผู้ดูแลระบบ',
          'เจ้าหน้าที่',
          'เจ้าหน้าที่ปฏิบัติการ'
        ]
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND lower(trim(p.role)) = ANY (
        ARRAY[
          'admin',
          'administrator',
          'officer',
          'ผู้ดูแลระบบ',
          'เจ้าหน้าที่',
          'เจ้าหน้าที่ปฏิบัติการ'
        ]
      )
  )
);

CREATE POLICY "threats_public_read"
ON public.threats
FOR SELECT TO anon
USING (visibility = 'public');
