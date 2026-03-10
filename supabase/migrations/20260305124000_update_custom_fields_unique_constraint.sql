-- Remove existing unique constraint on tenant_id + field_key (it might be named vendor_custom_fields_tenant_id_field_key_key or custom_field_definitions_tenant_id_field_key_key)
ALTER TABLE custom_field_definitions DROP CONSTRAINT IF EXISTS vendor_custom_fields_tenant_id_field_key_key;
ALTER TABLE custom_field_definitions DROP CONSTRAINT IF EXISTS custom_field_definitions_tenant_id_field_key_key;

-- Add new unique constraint that includes target_module
ALTER TABLE custom_field_definitions ADD CONSTRAINT custom_field_definitions_tenant_id_field_key_target_module_key UNIQUE (tenant_id, field_key, target_module);

-- Reload schema caches
NOTIFY pgrst, 'reload schema';
