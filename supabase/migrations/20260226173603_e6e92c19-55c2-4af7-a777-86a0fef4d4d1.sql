ALTER TABLE public.separacoes 
  ADD COLUMN IF NOT EXISTS tipo_pedido text NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS garantia_detalhes text;