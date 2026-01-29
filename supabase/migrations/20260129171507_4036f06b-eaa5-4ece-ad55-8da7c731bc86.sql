-- Atualizar constraint em entregas_finalizadas para permitir 'tabela'
ALTER TABLE entregas_finalizadas DROP CONSTRAINT entregas_finalizadas_material_tipo_check;
ALTER TABLE entregas_finalizadas ADD CONSTRAINT entregas_finalizadas_material_tipo_check CHECK (material_tipo = ANY (ARRAY['texto'::text, 'imagem'::text, 'pdf'::text, 'tabela'::text]));