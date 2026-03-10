-- Create incidents table with all necessary fields
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  category TEXT NOT NULL DEFAULT 'Segurança da Informação',
  severity TEXT NOT NULL DEFAULT 'medium',
  type TEXT NOT NULL DEFAULT 'security_breach',
  reporter_id UUID REFERENCES auth.users(id),
  assignee_id UUID REFERENCES auth.users(id),
  tenant_id UUID REFERENCES tenants(id),
  detection_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolution_date TIMESTAMP WITH TIME ZONE,
  business_impact TEXT,
  affected_systems JSONB,
  tags JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create incident_comments table
CREATE TABLE IF NOT EXISTS incident_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create incident_history table
CREATE TABLE IF NOT EXISTS incident_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_incidents_tenant_id ON incidents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_assignee_id ON incidents(assignee_id);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_type ON incidents(type);
CREATE INDEX IF NOT EXISTS idx_incidents_detection_date ON incidents(detection_date);
CREATE INDEX IF NOT EXISTS idx_incident_comments_incident_id ON incident_comments(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_history_incident_id ON incident_history(incident_id);

-- Enable RLS
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_history ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Incidents: Users can view incidents from their tenant OR platform_admin can view all
CREATE POLICY "Users can view incidents from their tenant or platform_admin can view all" ON incidents
  FOR SELECT
  USING (
    -- Regular users: can view incidents from their tenant
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR
    -- Platform admins: can view all incidents
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_platform_admin = true)
  );

-- Incidents: Users can create incidents for their tenant OR platform_admin can create for any tenant
CREATE POLICY "Users can create incidents for their tenant or platform_admin can create for any" ON incidents
  FOR INSERT
  WITH CHECK (
    -- Regular users: can create incidents for their tenant
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR
    -- Platform admins: can create incidents for any tenant
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_platform_admin = true)
  );

-- Incidents: Users can update incidents from their tenant OR platform_admin can update any
CREATE POLICY "Users can update incidents from their tenant or platform_admin can update any" ON incidents
  FOR UPDATE
  USING (
    -- Regular users: can update incidents from their tenant
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR
    -- Platform admins: can update any incident
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_platform_admin = true)
  );

-- Comments: Users can view comments for incidents in their tenant
CREATE POLICY "Users can view comments for incidents in their tenant" ON incident_comments
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM incidents
    WHERE incidents.id = incident_comments.incident_id
    AND (
      incidents.tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
      OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_platform_admin = true)
    )
  ));

-- Comments: Users can create comments for incidents in their tenant
CREATE POLICY "Users can create comments for incidents in their tenant" ON incident_comments
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM incidents
    WHERE incidents.id = incident_comments.incident_id
    AND (
      incidents.tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
      OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_platform_admin = true)
    )
  ));

-- History: Users can view history for incidents in their tenant
CREATE POLICY "Users can view history for incidents in their tenant" ON incident_history
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM incidents
    WHERE incidents.id = incident_history.incident_id
    AND (
      incidents.tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
      OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_platform_admin = true)
    )
  ));

-- Add comments
COMMENT ON TABLE incidents IS 'Security incidents management table';
COMMENT ON COLUMN incidents.severity IS 'Incident severity level: low, medium, high, critical';
COMMENT ON COLUMN incidents.type IS 'Type of incident: security_breach, malware, phishing, etc.';
COMMENT ON COLUMN incidents.detection_date IS 'When the incident was first detected';
COMMENT ON COLUMN incidents.resolution_date IS 'When the incident was resolved';
COMMENT ON COLUMN incidents.business_impact IS 'Description of business impact';
COMMENT ON COLUMN incidents.affected_systems IS 'JSON array of affected systems';
COMMENT ON COLUMN incidents.tags IS 'JSON array of tags for categorization';