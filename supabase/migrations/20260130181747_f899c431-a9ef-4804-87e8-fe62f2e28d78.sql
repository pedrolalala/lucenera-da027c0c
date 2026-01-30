-- Criar tabela para múltiplos arquivos por separação
CREATE TABLE public.separacao_arquivos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  separacao_id uuid NOT NULL REFERENCES public.separacoes(id) ON DELETE CASCADE,
  nome_arquivo text NOT NULL,
  tipo_arquivo text NOT NULL CHECK (tipo_arquivo IN ('pdf', 'imagem')),
  url_arquivo text NOT NULL,
  tamanho_bytes bigint NOT NULL,
  ordem integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_separacao_arquivos_separacao_id ON public.separacao_arquivos(separacao_id);

-- Enable RLS
ALTER TABLE public.separacao_arquivos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view all separacao_arquivos" 
ON public.separacao_arquivos 
FOR SELECT 
USING (is_authenticated());

CREATE POLICY "Authenticated users can insert separacao_arquivos" 
ON public.separacao_arquivos 
FOR INSERT 
WITH CHECK (is_authenticated());

CREATE POLICY "Authenticated users can update separacao_arquivos" 
ON public.separacao_arquivos 
FOR UPDATE 
USING (is_authenticated());

CREATE POLICY "Authenticated users can delete separacao_arquivos" 
ON public.separacao_arquivos 
FOR DELETE 
USING (is_authenticated());