CREATE OR REPLACE FUNCTION public.is_platform_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM platform_admins WHERE user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text IN ('admin', 'super_admin', 'platform_admin')
  ) OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_platform_admin = true
  );
END;
$function$
