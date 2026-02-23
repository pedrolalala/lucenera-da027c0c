ALTER TABLE public.entregas_finalizadas DROP CONSTRAINT entregas_finalizadas_material_tipo_check;

ALTER TABLE public.entregas_finalizadas ADD CONSTRAINT entregas_finalizadas_material_tipo_check CHECK (material_tipo = ANY (ARRAY['texto', 'imagem', 'pdf', 'tabela', 'arquivos']));