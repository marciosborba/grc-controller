-- Make tenant_id nullable in activity_logs
ALTER TABLE activity_logs ALTER COLUMN tenant_id DROP NOT NULL;
