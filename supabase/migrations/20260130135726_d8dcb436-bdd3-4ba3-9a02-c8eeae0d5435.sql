-- Add scheduled delivery fields to separacoes table
ALTER TABLE public.separacoes 
ADD COLUMN IF NOT EXISTS delivery_type text NOT NULL DEFAULT 'flexible',
ADD COLUMN IF NOT EXISTS scheduled_time time,
ADD COLUMN IF NOT EXISTS order_in_route integer;

-- Add constraint to validate delivery_type values
ALTER TABLE public.separacoes 
ADD CONSTRAINT valid_delivery_type CHECK (delivery_type IN ('flexible', 'scheduled'));

-- Create index for efficient route optimization queries
CREATE INDEX IF NOT EXISTS idx_separacoes_delivery_type ON public.separacoes(delivery_type);
CREATE INDEX IF NOT EXISTS idx_separacoes_scheduled_time ON public.separacoes(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_separacoes_data_entrega ON public.separacoes(data_entrega);