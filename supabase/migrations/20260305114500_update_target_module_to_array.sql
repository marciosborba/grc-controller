-- Converter target_module para array de texto (text[])

-- Primeiro, temporariamente remove default para facilitar a alteração
ALTER TABLE custom_field_definitions ALTER COLUMN target_module DROP DEFAULT;

-- Altera o tipo da coluna convertendo o valor existente (string única) para um array com esse único valor
ALTER TABLE custom_field_definitions ALTER COLUMN target_module TYPE text[] USING ARRAY[target_module]::text[];

-- Adiciona um default vazio
ALTER TABLE custom_field_definitions ALTER COLUMN target_module SET DEFAULT '{}'::text[];

-- Recarrega o cache do PostgREST
NOTIFY pgrst, 'reload schema';
