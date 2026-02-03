-- Rename numero_pedido to numero_venda
ALTER TABLE separacoes RENAME COLUMN numero_pedido TO numero_venda;

-- Rename vendedor to solicitante
ALTER TABLE separacoes RENAME COLUMN vendedor TO solicitante;

-- Make telefone nullable (it might already be, but let's ensure)
ALTER TABLE separacoes ALTER COLUMN telefone DROP NOT NULL;

-- Make material_tipo nullable
ALTER TABLE separacoes ALTER COLUMN material_tipo DROP NOT NULL;

-- Add new columns if they don't exist
DO $$ 
BEGIN
  -- Add separacoes_parciais column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'separacoes' AND column_name = 'separacoes_parciais') THEN
    ALTER TABLE separacoes ADD COLUMN separacoes_parciais TEXT[];
  END IF;
  
  -- Add nivel_complexidade column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'separacoes' AND column_name = 'nivel_complexidade') THEN
    ALTER TABLE separacoes ADD COLUMN nivel_complexidade TEXT;
  END IF;
  
  -- Add tipo_entrega column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'separacoes' AND column_name = 'tipo_entrega') THEN
    ALTER TABLE separacoes ADD COLUMN tipo_entrega TEXT;
  END IF;
  
  -- Add transportadora_nome column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'separacoes' AND column_name = 'transportadora_nome') THEN
    ALTER TABLE separacoes ADD COLUMN transportadora_nome TEXT;
  END IF;
  
  -- Add codigo_rastreamento column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'separacoes' AND column_name = 'codigo_rastreamento') THEN
    ALTER TABLE separacoes ADD COLUMN codigo_rastreamento TEXT;
  END IF;
END $$;

-- Set default value for existing rows without nivel_complexidade
UPDATE separacoes SET nivel_complexidade = 'medio' WHERE nivel_complexidade IS NULL;

-- Set default value for existing rows without tipo_entrega
UPDATE separacoes SET tipo_entrega = 'lucenera_entrega' WHERE tipo_entrega IS NULL;