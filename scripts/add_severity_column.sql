ALTER TABLE incidents
ADD COLUMN IF NOT EXISTS severity text DEFAULT 'medium';
