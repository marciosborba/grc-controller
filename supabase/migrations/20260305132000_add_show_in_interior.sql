-- Add show_in_interior column to custom_field_definitions
ALTER TABLE custom_field_definitions ADD COLUMN show_in_interior BOOLEAN DEFAULT true;

-- Reload schema caches
NOTIFY pgrst, 'reload schema';
