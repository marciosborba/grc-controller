-- Create table for tracking vulnerability status history
CREATE TABLE IF NOT EXISTS vulnerability_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vulnerability_id UUID NOT NULL REFERENCES vulnerabilities(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    changed_by UUID REFERENCES auth.users(id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_vulnerability_status_history_vuln_id ON vulnerability_status_history(vulnerability_id);

-- Enable RLS
ALTER TABLE vulnerability_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies (inherit from vulnerability access)
CREATE POLICY "Users can view history of vulnerabilities they can access"
ON vulnerability_status_history
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM vulnerabilities v
        WHERE v.id = vulnerability_status_history.vulnerability_id
        AND (v.tenant_id = (auth.jwt() ->> 'tenant_id')::uuid OR is_platform_admin(auth.uid()))
    )
);

-- Trigger function to log status changes
CREATE OR REPLACE FUNCTION log_vulnerability_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO vulnerability_status_history (vulnerability_id, old_status, new_status, changed_by)
        VALUES (NEW.id, NULL, NEW.status, auth.uid());
    ELSIF (TG_OP = 'UPDATE') THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            INSERT INTO vulnerability_status_history (vulnerability_id, old_status, new_status, changed_by)
            VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS log_vulnerability_status_change_trigger ON vulnerabilities;
CREATE TRIGGER log_vulnerability_status_change_trigger
AFTER INSERT OR UPDATE ON vulnerabilities
FOR EACH ROW
EXECUTE FUNCTION log_vulnerability_status_change();
