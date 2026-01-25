-- Fix Diagnostic Data Issues

-- 1. Remove Orphaned Profiles (Profiles with no matching Auth User)
--    Safe to delete as they cannot log in anyway.
DELETE FROM public.profiles
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- 2. Fix Invalid Tenant References
--    Assign profiles pointing to non-existent tenants to the first available valid tenant.
DO $$
DECLARE
    default_tenant_id UUID;
BEGIN
    SELECT id INTO default_tenant_id FROM public.tenants LIMIT 1;
    
    IF default_tenant_id IS NOT NULL THEN
        UPDATE public.profiles
        SET tenant_id = default_tenant_id
        WHERE tenant_id NOT IN (SELECT id FROM public.tenants);
    END IF;
END $$;
