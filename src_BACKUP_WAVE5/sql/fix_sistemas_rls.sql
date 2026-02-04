-- Allow platform admins to access all records in 'sistemas'
-- This fixes the issue where admins switching tenants in the UI cannot see data because their JWT tenant_id (if any) doesn't match the row's tenant_id.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'sistemas' 
        AND policyname = 'Enable all access for platform admins'
    ) THEN
        CREATE POLICY "Enable all access for platform admins" ON public.sistemas
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid()
                AND profiles.is_platform_admin = true
            )
        );
    END IF;
END $$;
