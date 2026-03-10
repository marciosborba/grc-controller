-- Migration to add show_in_filters flag to custom custom_field_definitions table
-- Create index to speed up filtering

ALTER TABLE public.custom_field_definitions 
ADD COLUMN IF NOT EXISTS show_in_filters BOOLEAN DEFAULT false;

-- Create an index to quickly find fields that need to be shown in filters
CREATE INDEX IF NOT EXISTS custom_field_definitions_filters_idx ON public.custom_field_definitions(tenant_id, target_module, show_in_filters) WHERE show_in_filters = true;
