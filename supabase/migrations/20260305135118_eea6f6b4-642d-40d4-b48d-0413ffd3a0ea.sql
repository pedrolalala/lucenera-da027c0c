ALTER TABLE public.separacoes 
ADD COLUMN inclui_garantia boolean NOT NULL DEFAULT false,
ADD COLUMN garantia_peca text DEFAULT NULL,
ADD COLUMN garantia_motivo text DEFAULT NULL;