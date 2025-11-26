-- Function to check if user is platform admin
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM platform_admins WHERE user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'platform_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update Policies for incidents

DROP POLICY IF EXISTS "Users can view incidents from their tenant" ON incidents;
CREATE POLICY "Users can view incidents from their tenant" ON incidents
FOR SELECT
USING (
  tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  OR
  is_platform_admin()
);

DROP POLICY IF EXISTS "Users can update incidents from their tenant" ON incidents;
CREATE POLICY "Users can update incidents from their tenant" ON incidents
FOR UPDATE
USING (
  tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  OR
  is_platform_admin()
);

DROP POLICY IF EXISTS "Users can create incidents for their tenant" ON incidents;
CREATE POLICY "Users can create incidents for their tenant" ON incidents
FOR INSERT
WITH CHECK (
  tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  OR
  is_platform_admin()
);

DROP POLICY IF EXISTS "Users can delete incidents from their tenant" ON incidents;
CREATE POLICY "Users can delete incidents from their tenant" ON incidents
FOR DELETE
USING (
  tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  OR
  is_platform_admin()
);

-- Update Policies for incident_comments

DROP POLICY IF EXISTS "Users can view comments from their tenant" ON incident_comments;
CREATE POLICY "Users can view comments from their tenant" ON incident_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM incidents 
    WHERE incidents.id = incident_comments.incident_id 
    AND (
      incidents.tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
      OR
      is_platform_admin()
    )
  )
);

DROP POLICY IF EXISTS "Users can create comments for their tenant" ON incident_comments;
CREATE POLICY "Users can create comments for their tenant" ON incident_comments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM incidents 
    WHERE incidents.id = incident_comments.incident_id 
    AND (
      incidents.tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
      OR
      is_platform_admin()
    )
  )
);

-- Update Policies for incident_history

DROP POLICY IF EXISTS "Users can view history from their tenant" ON incident_history;
CREATE POLICY "Users can view history from their tenant" ON incident_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM incidents 
    WHERE incidents.id = incident_history.incident_id 
    AND (
      incidents.tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
      OR
      is_platform_admin()
    )
  )
);
