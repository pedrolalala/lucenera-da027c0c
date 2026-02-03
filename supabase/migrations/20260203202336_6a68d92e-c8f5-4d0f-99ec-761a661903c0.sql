-- Create entregas_pendentes table (since columns were added but this table failed)
CREATE TABLE IF NOT EXISTS entregas_pendentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  separacao_id UUID NOT NULL REFERENCES separacoes(id) ON DELETE CASCADE,
  codigo_obra TEXT NOT NULL,
  cliente TEXT NOT NULL,
  endereco TEXT,
  responsavel TEXT,
  telefone TEXT,
  tipo_problema TEXT NOT NULL,
  descricao_problema TEXT NOT NULL,
  fotos_urls TEXT[] DEFAULT '{}',
  registrado_por TEXT NOT NULL,
  registrado_por_user_id UUID,
  data_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status_pendencia TEXT DEFAULT 'aguardando_resolucao',
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT entregas_pendentes_status_check CHECK (
    status_pendencia IN ('aguardando_resolucao', 'em_analise', 'resolvido', 'cancelado')
  )
);

-- Create indexes for entregas_pendentes
CREATE INDEX IF NOT EXISTS idx_pendentes_separacao ON entregas_pendentes(separacao_id);
CREATE INDEX IF NOT EXISTS idx_pendentes_status ON entregas_pendentes(status_pendencia);
CREATE INDEX IF NOT EXISTS idx_pendentes_data ON entregas_pendentes(data_registro DESC);

-- Enable RLS on entregas_pendentes
ALTER TABLE entregas_pendentes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for entregas_pendentes (without RESTRICTIVE)
CREATE POLICY "Authenticated users can view all entregas_pendentes" 
ON entregas_pendentes FOR SELECT 
USING (is_authenticated());

CREATE POLICY "Authenticated users can insert entregas_pendentes" 
ON entregas_pendentes FOR INSERT 
WITH CHECK (is_authenticated());

CREATE POLICY "Authenticated users can update entregas_pendentes" 
ON entregas_pendentes FOR UPDATE 
USING (is_authenticated());

CREATE POLICY "Authenticated users can delete entregas_pendentes" 
ON entregas_pendentes FOR DELETE 
USING (is_authenticated());