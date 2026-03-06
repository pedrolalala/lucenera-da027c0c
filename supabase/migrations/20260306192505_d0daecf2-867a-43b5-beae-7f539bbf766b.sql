
-- 1. Fix is_authenticated: change from SECURITY DEFINER to SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN auth.uid() IS NOT NULL;
END;
$$;

-- 2. Fix storage policy: drop open policy, create authenticated-only policy
DROP POLICY IF EXISTS "Public can view materials" ON storage.objects;

CREATE POLICY "Authenticated users can view materials"
ON storage.objects FOR SELECT
USING (bucket_id = 'materiais-separacao' AND auth.uid() IS NOT NULL);

-- 3. Fix user_roles SELECT policy: restrict to own record or admin
DROP POLICY IF EXISTS "Authenticated users can view roles" ON public.user_roles;

CREATE POLICY "Users view own role, admins view all"
ON public.user_roles FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);
