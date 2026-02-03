-- 1. Drop existing constraint if any
ALTER TABLE separacoes 
DROP CONSTRAINT IF EXISTS separacoes_material_tipo_check;

-- 2. Ensure column allows NULL
ALTER TABLE separacoes
ALTER COLUMN material_tipo DROP NOT NULL;

-- 3. Add new constraint allowing correct values
ALTER TABLE separacoes
ADD CONSTRAINT separacoes_material_tipo_check 
CHECK (material_tipo IN ('tabela', 'arquivos') OR material_tipo IS NULL);

-- 4. Migrate old data to new values
UPDATE separacoes 
SET material_tipo = 'arquivos' 
WHERE material_tipo IN ('pdf', 'imagem');

UPDATE separacoes
SET material_tipo = NULL
WHERE material_tipo = 'texto';