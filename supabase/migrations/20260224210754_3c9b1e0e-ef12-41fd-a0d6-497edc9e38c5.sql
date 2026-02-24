
-- Add data_inicio_separacao column to track when separation actually started
ALTER TABLE public.separacoes
ADD COLUMN data_inicio_separacao timestamp with time zone DEFAULT NULL;

-- Backfill: for existing records with status 'em_separacao', use updated_at as best approximation
UPDATE public.separacoes
SET data_inicio_separacao = updated_at
WHERE status = 'em_separacao' AND data_inicio_separacao IS NULL;
