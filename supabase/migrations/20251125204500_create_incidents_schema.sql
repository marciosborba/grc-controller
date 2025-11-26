-- Create incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Open',
  priority TEXT NOT NULL DEFAULT 'Medium',
  category TEXT NOT NULL DEFAULT 'Other',
  reporter_id UUID REFERENCES auth.users(id),
  assignee_id UUID REFERENCES auth.users(id),
  tenant_id UUID REFERENCES tenants(id),
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
CREATE INDEX IF NOT EXISTS idx_incident_comments_incident_id ON incident_comments(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_history_incident_id ON incident_history(incident_id);

-- Enable RLS
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_history ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Incidents: Users can view incidents from their tenant
CREATE POLICY "Users can view incidents from their tenant" ON incidents
  FOR SELECT
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Incidents: Users can create incidents for their tenant
CREATE POLICY "Users can create incidents for their tenant" ON incidents
  FOR INSERT
  WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Incidents: Users can update incidents from their tenant
CREATE POLICY "Users can update incidents from their tenant" ON incidents
  FOR UPDATE
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Comments: Users can view comments for incidents in their tenant
CREATE POLICY "Users can view comments for incidents in their tenant" ON incident_comments
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM incidents
    WHERE incidents.id = incident_comments.incident_id
    AND incidents.tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  ));

-- Comments: Users can create comments for incidents in their tenant
CREATE POLICY "Users can create comments for incidents in their tenant" ON incident_comments
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM incidents
    WHERE incidents.id = incident_comments.incident_id
    AND incidents.tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  ));

-- History: Users can view history for incidents in their tenant
CREATE POLICY "Users can view history for incidents in their tenant" ON incident_history
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM incidents
    WHERE incidents.id = incident_history.incident_id
    AND incidents.tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  ));
