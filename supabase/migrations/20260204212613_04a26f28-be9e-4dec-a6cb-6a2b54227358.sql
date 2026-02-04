-- Add local and marca columns to separacao_itens for PDF extraction data
ALTER TABLE public.separacao_itens 
ADD COLUMN IF NOT EXISTS local TEXT,
ADD COLUMN IF NOT EXISTS marca TEXT;

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_separacao_itens_local ON public.separacao_itens(local);
CREATE INDEX IF NOT EXISTS idx_separacao_itens_marca ON public.separacao_itens(marca);