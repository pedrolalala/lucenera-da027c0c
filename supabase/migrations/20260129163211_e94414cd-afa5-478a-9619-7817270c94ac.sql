-- Add new fields to separacoes table
ALTER TABLE public.separacoes 
ADD COLUMN IF NOT EXISTS numero_pedido text,
ADD COLUMN IF NOT EXISTS vendedor text;

-- Add new fields to entregas_finalizadas table
ALTER TABLE public.entregas_finalizadas 
ADD COLUMN IF NOT EXISTS numero_pedido text,
ADD COLUMN IF NOT EXISTS vendedor text;

-- Create separacao_itens table for structured material items
CREATE TABLE IF NOT EXISTS public.separacao_itens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  separacao_id uuid NOT NULL REFERENCES public.separacoes(id) ON DELETE CASCADE,
  ordem integer NOT NULL DEFAULT 1,
  id_lote text,
  codigo_produto text NOT NULL,
  referencia text NOT NULL,
  descricao text NOT NULL,
  quantidade decimal(10,2) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_separacao_itens_separacao_id ON public.separacao_itens(separacao_id);

-- Enable RLS on separacao_itens
ALTER TABLE public.separacao_itens ENABLE ROW LEVEL SECURITY;

-- RLS policies for separacao_itens
CREATE POLICY "Authenticated users can view all separacao_itens"
ON public.separacao_itens
FOR SELECT
USING (is_authenticated());

CREATE POLICY "Authenticated users can insert separacao_itens"
ON public.separacao_itens
FOR INSERT
WITH CHECK (is_authenticated());

CREATE POLICY "Authenticated users can update separacao_itens"
ON public.separacao_itens
FOR UPDATE
USING (is_authenticated());

CREATE POLICY "Authenticated users can delete separacao_itens"
ON public.separacao_itens
FOR DELETE
USING (is_authenticated());

-- Create materiais-separacao bucket for PDFs and images
INSERT INTO storage.buckets (id, name, public)
VALUES ('materiais-separacao', 'materiais-separacao', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for materiais-separacao bucket
CREATE POLICY "Authenticated users can upload materials"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'materiais-separacao' AND is_authenticated());

CREATE POLICY "Public can view materials"
ON storage.objects
FOR SELECT
USING (bucket_id = 'materiais-separacao');

CREATE POLICY "Authenticated users can delete materials"
ON storage.objects
FOR DELETE
USING (bucket_id = 'materiais-separacao' AND is_authenticated());