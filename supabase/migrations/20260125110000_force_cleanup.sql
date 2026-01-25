-- Comprehensive Dynamic Force Cleanup of Orphaned Data

DO $$
DECLARE
    valid_profile_id UUID;
    r RECORD;
    stmt TEXT;
BEGIN
    -- 1. Find a valid profile (fallback owner)
    --    Must have a matching auth.user
    SELECT id INTO valid_profile_id 
    FROM profiles 
    WHERE user_id IN (SELECT id FROM auth.users)
    LIMIT 1;

    IF valid_profile_id IS NULL THEN
        RAISE NOTICE 'No valid profile found. Cannot safely reassign orphans.';
        RETURN;
    END IF;

    RAISE NOTICE 'Using valid profile % for reassignment', valid_profile_id;

    -- 2. Dynamically reassign ALL Foreign Key references
    --    Find all columns that reference profiles.id
    FOR r IN 
        SELECT 
            tc.table_schema, 
            tc.table_name, 
            kcu.column_name 
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND ccu.table_name = 'profiles'
          AND ccu.column_name = 'id'
          AND tc.table_schema = 'public'
    LOOP
        -- Construct dynamic UPDATE statement
        -- "UPDATE public.tablename SET col = valid_id WHERE col IN (SELECT id FROM profiles WHERE orphaned)"
        stmt := format(
            'UPDATE %I.%I SET %I = %L WHERE %I IN (SELECT id FROM profiles WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM auth.users))',
            r.table_schema,
            r.table_name,
            r.column_name,
            valid_profile_id,
            r.column_name
        );

        RAISE NOTICE 'Executing reassignment for %.%: %', r.table_name, r.column_name, stmt;
        
        BEGIN
            EXECUTE stmt;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to update %.%: %', r.table_name, r.column_name, SQLERRM;
        END;
    END LOOP;

    -- 3. Delete Orphaned Profiles
    RAISE NOTICE 'Deleting orphaned profiles...';
    DELETE FROM public.profiles
    WHERE user_id IS NULL 
       OR user_id NOT IN (SELECT id FROM auth.users);
       
    RAISE NOTICE 'Cleanup completed successfully.';
END $$;
