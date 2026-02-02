-- Add gestora_equipe field to separacoes (required for new entries, will add default for existing)
ALTER TABLE public.separacoes ADD COLUMN gestora_equipe text;

-- Update existing records with a default value
UPDATE public.separacoes SET gestora_equipe = 'Thais Gomes' WHERE gestora_equipe IS NULL;

-- Now make it NOT NULL
ALTER TABLE public.separacoes ALTER COLUMN gestora_equipe SET NOT NULL;

-- Add gestora_equipe to entregas_finalizadas (nullable, copied from separacao)
ALTER TABLE public.entregas_finalizadas ADD COLUMN gestora_equipe text;