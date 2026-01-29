-- Create separacoes table
CREATE TABLE public.separacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente TEXT NOT NULL,
  codigo_obra TEXT NOT NULL,
  data_entrega DATE NOT NULL,
  responsavel_recebimento TEXT NOT NULL,
  telefone TEXT NOT NULL,
  endereco TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'separando' CHECK (status IN ('separando', 'separado', 'finalizado')),
  material_tipo TEXT NOT NULL DEFAULT 'texto' CHECK (material_tipo IN ('texto', 'imagem', 'pdf')),
  material_conteudo TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on codigo_obra for fast lookups
CREATE UNIQUE INDEX idx_separacoes_codigo_obra ON public.separacoes(codigo_obra);

-- Create entregas_finalizadas table
CREATE TABLE public.entregas_finalizadas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  separacao_id UUID NOT NULL REFERENCES public.separacoes(id) ON DELETE CASCADE,
  cliente TEXT NOT NULL,
  codigo_obra TEXT NOT NULL,
  data_entrega_real TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  endereco TEXT NOT NULL,
  recebido_por TEXT NOT NULL,
  telefone TEXT NOT NULL,
  material_tipo TEXT NOT NULL CHECK (material_tipo IN ('texto', 'imagem', 'pdf')),
  material_conteudo TEXT NOT NULL,
  fotos_urls TEXT[] NOT NULL DEFAULT '{}',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on codigo_obra for fast lookups
CREATE INDEX idx_entregas_codigo_obra ON public.entregas_finalizadas(codigo_obra);

-- Enable Row Level Security
ALTER TABLE public.separacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entregas_finalizadas ENABLE ROW LEVEL SECURITY;

-- Create helper function to check if user is authenticated
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RLS Policies for separacoes (all authenticated users have full access)
CREATE POLICY "Authenticated users can view all separacoes"
  ON public.separacoes FOR SELECT
  USING (public.is_authenticated());

CREATE POLICY "Authenticated users can insert separacoes"
  ON public.separacoes FOR INSERT
  WITH CHECK (public.is_authenticated());

CREATE POLICY "Authenticated users can update separacoes"
  ON public.separacoes FOR UPDATE
  USING (public.is_authenticated());

CREATE POLICY "Authenticated users can delete separacoes"
  ON public.separacoes FOR DELETE
  USING (public.is_authenticated());

-- RLS Policies for entregas_finalizadas (all authenticated users have full access)
CREATE POLICY "Authenticated users can view all entregas_finalizadas"
  ON public.entregas_finalizadas FOR SELECT
  USING (public.is_authenticated());

CREATE POLICY "Authenticated users can insert entregas_finalizadas"
  ON public.entregas_finalizadas FOR INSERT
  WITH CHECK (public.is_authenticated());

CREATE POLICY "Authenticated users can update entregas_finalizadas"
  ON public.entregas_finalizadas FOR UPDATE
  USING (public.is_authenticated());

CREATE POLICY "Authenticated users can delete entregas_finalizadas"
  ON public.entregas_finalizadas FOR DELETE
  USING (public.is_authenticated());

-- Create storage bucket for delivery photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('entregas-fotos', 'entregas-fotos', true);

-- Storage policies for entregas-fotos bucket
CREATE POLICY "Authenticated users can view delivery photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'entregas-fotos' AND public.is_authenticated());

CREATE POLICY "Authenticated users can upload delivery photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'entregas-fotos' AND public.is_authenticated());

CREATE POLICY "Authenticated users can update delivery photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'entregas-fotos' AND public.is_authenticated());

CREATE POLICY "Authenticated users can delete delivery photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'entregas-fotos' AND public.is_authenticated());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates on separacoes
CREATE TRIGGER update_separacoes_updated_at
  BEFORE UPDATE ON public.separacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data with correct AANNNN format for testing
INSERT INTO public.separacoes (cliente, codigo_obra, data_entrega, responsavel_recebimento, telefone, endereco, status, material_tipo, material_conteudo)
VALUES 
  ('Construtora Alpha', '26001', CURRENT_DATE, 'João Silva', '(11) 99999-1111', 'Av. Paulista, 1000 - São Paulo, SP', 'separando', 'texto', '• 20 luminárias LED embutir 60x60\n• 50m fita LED 4000K\n• 10 spots direcionáveis AR70\n• 5 pendentes decorativos'),
  ('Arquitetos Beta', '26002', CURRENT_DATE, 'Maria Santos', '(11) 98888-2222', 'Rua Augusta, 500 - São Paulo, SP', 'separado', 'texto', '• 15 arandelas externas\n• 30 plafons LED 18W\n• Transformadores e drivers'),
  ('Incorporadora Gamma', '26003', CURRENT_DATE + INTERVAL '1 day', 'Pedro Oliveira', '(11) 97777-3333', 'Alameda Santos, 200 - São Paulo, SP', 'separando', 'texto', '• 100 spots de embutir\n• 25 luminárias lineares\n• 15 pendentes cuisine'),
  ('Escritório Delta', '26004', CURRENT_DATE + INTERVAL '2 days', 'Ana Costa', '(11) 96666-4444', 'Rua Oscar Freire, 800 - São Paulo, SP', 'separado', 'texto', '• 40 painéis LED 40W\n• 20 luminárias de mesa\n• 10 trilhos eletrificados');