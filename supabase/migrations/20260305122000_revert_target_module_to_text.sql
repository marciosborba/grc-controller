-- Converter target_module de volta para texto (text)

-- Primeiro, temporariamente remove default 
ALTER TABLE custom_field_definitions ALTER COLUMN target_module DROP DEFAULT;

-- Altera o tipo da coluna convertendo o array de volta para string (pegando o primeiro item)
ALTER TABLE custom_field_definitions ALTER COLUMN target_module TYPE text USING target_module[1];

-- Adiciona um default vazio
ALTER TABLE custom_field_definitions ALTER COLUMN target_module SET DEFAULT 'vendor_registration'::text;

-- Recarrega o cache do PostgREST
NOTIFY pgrst, 'reload schema';
