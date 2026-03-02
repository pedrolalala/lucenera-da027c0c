
-- Restrict separacoes INSERT to non-entregador only
DROP POLICY IF EXISTS "Authenticated users can insert separacoes" ON public.separacoes;
CREATE POLICY "Non-entregador can insert separacoes"
ON public.separacoes FOR INSERT
TO authenticated
WITH CHECK (NOT public.has_role(auth.uid(), 'entregador'::app_role));

-- Restrict separacoes DELETE to non-entregador only
DROP POLICY IF EXISTS "Authenticated users can delete separacoes" ON public.separacoes;
CREATE POLICY "Non-entregador can delete separacoes"
ON public.separacoes FOR DELETE
TO authenticated
USING (NOT public.has_role(auth.uid(), 'entregador'::app_role));

-- Restrict separacao_itens INSERT/UPDATE/DELETE to non-entregador
DROP POLICY IF EXISTS "Authenticated users can insert separacao_itens" ON public.separacao_itens;
CREATE POLICY "Non-entregador can insert separacao_itens"
ON public.separacao_itens FOR INSERT
TO authenticated
WITH CHECK (NOT public.has_role(auth.uid(), 'entregador'::app_role));

DROP POLICY IF EXISTS "Authenticated users can update separacao_itens" ON public.separacao_itens;
CREATE POLICY "Non-entregador can update separacao_itens"
ON public.separacao_itens FOR UPDATE
TO authenticated
USING (NOT public.has_role(auth.uid(), 'entregador'::app_role));

DROP POLICY IF EXISTS "Authenticated users can delete separacao_itens" ON public.separacao_itens;
CREATE POLICY "Non-entregador can delete separacao_itens"
ON public.separacao_itens FOR DELETE
TO authenticated
USING (NOT public.has_role(auth.uid(), 'entregador'::app_role));

-- Restrict separacao_arquivos INSERT/UPDATE/DELETE to non-entregador
DROP POLICY IF EXISTS "Authenticated users can insert separacao_arquivos" ON public.separacao_arquivos;
CREATE POLICY "Non-entregador can insert separacao_arquivos"
ON public.separacao_arquivos FOR INSERT
TO authenticated
WITH CHECK (NOT public.has_role(auth.uid(), 'entregador'::app_role));

DROP POLICY IF EXISTS "Authenticated users can update separacao_arquivos" ON public.separacao_arquivos;
CREATE POLICY "Non-entregador can update separacao_arquivos"
ON public.separacao_arquivos FOR UPDATE
TO authenticated
USING (NOT public.has_role(auth.uid(), 'entregador'::app_role));

DROP POLICY IF EXISTS "Authenticated users can delete separacao_arquivos" ON public.separacao_arquivos;
CREATE POLICY "Non-entregador can delete separacao_arquivos"
ON public.separacao_arquivos FOR DELETE
TO authenticated
USING (NOT public.has_role(auth.uid(), 'entregador'::app_role));
