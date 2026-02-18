
-- 1. Criar sequência para numeração automática de entregas
CREATE SEQUENCE IF NOT EXISTS public.numero_entrega_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

-- 2. Adicionar coluna numero_entrega na tabela separacoes
ALTER TABLE public.separacoes
  ADD COLUMN IF NOT EXISTS numero_entrega text;

-- 3. Preencher registros existentes com número retroativo
UPDATE public.separacoes
SET numero_entrega = 'LUC-' || LPAD(nextval('public.numero_entrega_seq')::text, 4, '0')
WHERE numero_entrega IS NULL;

-- 4. Adicionar constraint de unicidade
ALTER TABLE public.separacoes
  ADD CONSTRAINT separacoes_numero_entrega_unique UNIQUE (numero_entrega);

-- 5. Criar função para gerar número automático ao inserir
CREATE OR REPLACE FUNCTION public.generate_numero_entrega()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numero_entrega IS NULL THEN
    NEW.numero_entrega := 'LUC-' || LPAD(nextval('public.numero_entrega_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 6. Criar trigger para auto-preencher ao inserir nova separação
DROP TRIGGER IF EXISTS trg_generate_numero_entrega ON public.separacoes;
CREATE TRIGGER trg_generate_numero_entrega
  BEFORE INSERT ON public.separacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_numero_entrega();

-- 7. Adicionar campos para resolução de pendências
ALTER TABLE public.entregas_pendentes
  ADD COLUMN IF NOT EXISTS fotos_resolucao text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS observacoes_resolucao text,
  ADD COLUMN IF NOT EXISTS resolved_by_user_id uuid;
