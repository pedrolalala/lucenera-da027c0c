-- Add observacoes_internas column to separacoes table
ALTER TABLE public.separacoes 
ADD COLUMN observacoes_internas text NULL;

-- Add observacoes_internas column to entregas_finalizadas table (copied from separação when finalizing)
ALTER TABLE public.entregas_finalizadas 
ADD COLUMN observacoes_internas text NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.separacoes.observacoes_internas IS 'Internal observations about the delivery (e.g., access instructions, special requirements)';
COMMENT ON COLUMN public.entregas_finalizadas.observacoes_internas IS 'Internal observations copied from the original separação';