-- Fix is_platform_admin function to avoid enum error
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM platform_admins WHERE user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text IN ('admin', 'super_admin', 'platform_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
