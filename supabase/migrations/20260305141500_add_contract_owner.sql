-- Migration to add Contract Owner fields to vendor_registry
ALTER TABLE vendor_registry ADD COLUMN IF NOT EXISTS contract_owner_name text;
ALTER TABLE vendor_registry ADD COLUMN IF NOT EXISTS contract_owner_email text;
