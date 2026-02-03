-- First update all existing 'separando' records to 'em_separacao' (before adding constraint)
UPDATE separacoes SET status = 'separado' WHERE status = 'separando';

-- Now drop the old constraint
ALTER TABLE separacoes DROP CONSTRAINT IF EXISTS separacoes_status_check;

-- Add new constraint with all valid status values
ALTER TABLE separacoes ADD CONSTRAINT separacoes_status_check 
CHECK (status IN ('material_solicitado', 'em_separacao', 'separado', 'matheus_separacao_garantia', 'pendente', 'finalizado'));

-- Update default value
ALTER TABLE separacoes ALTER COLUMN status SET DEFAULT 'material_solicitado';