-- Convert numero_venda from TEXT to TEXT[] array
-- First add new array column
ALTER TABLE separacoes
  ADD COLUMN numero_venda_array TEXT[];

-- Migrate existing data to array format
UPDATE separacoes 
SET numero_venda_array = CASE 
  WHEN numero_venda IS NOT NULL AND numero_venda != '' THEN ARRAY[numero_venda]
  ELSE ARRAY[]::TEXT[]
END;

-- Drop old column and rename new one
ALTER TABLE separacoes DROP COLUMN numero_venda;
ALTER TABLE separacoes RENAME COLUMN numero_venda_array TO numero_venda;

-- Make numero_venda NOT NULL with default empty array
ALTER TABLE separacoes ALTER COLUMN numero_venda SET NOT NULL;
ALTER TABLE separacoes ALTER COLUMN numero_venda SET DEFAULT ARRAY[]::TEXT[];

-- Ensure separacoes_parciais has default
ALTER TABLE separacoes ALTER COLUMN separacoes_parciais SET DEFAULT ARRAY[]::TEXT[];

-- Ensure nivel_complexidade has default 'medio'
UPDATE separacoes SET nivel_complexidade = 'medio' WHERE nivel_complexidade IS NULL;
ALTER TABLE separacoes ALTER COLUMN nivel_complexidade SET DEFAULT 'medio';

-- Ensure material_tipo can be NULL (already should be, but confirm)
ALTER TABLE separacoes ALTER COLUMN material_tipo DROP NOT NULL;

-- Ensure telefone can be NULL
ALTER TABLE separacoes ALTER COLUMN telefone DROP NOT NULL;