-- Atualizar constraint para permitir 'tabela' como material_tipo
ALTER TABLE separacoes DROP CONSTRAINT separacoes_material_tipo_check;
ALTER TABLE separacoes ADD CONSTRAINT separacoes_material_tipo_check CHECK (material_tipo = ANY (ARRAY['texto'::text, 'imagem'::text, 'pdf'::text, 'tabela'::text]));