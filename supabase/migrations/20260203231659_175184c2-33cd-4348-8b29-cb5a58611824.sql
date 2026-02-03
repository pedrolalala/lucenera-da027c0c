-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view all entregas_pendentes" ON public.entregas_pendentes;

-- Create restrictive SELECT policy: admins can see all, users can only see their own registered entries
CREATE POLICY "Users can view their own or admins can view all entregas_pendentes"
ON public.entregas_pendentes
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') 
  OR registrado_por_user_id = auth.uid()
);