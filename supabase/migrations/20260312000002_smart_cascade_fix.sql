-- ============================================================================
-- MIGRATION: Final Balanced User Deletion Fix
-- ============================================================================
-- This script implements a hybrid strategy:
-- 1. CASCADE for operational data (logs, history, notifications, AI context).
-- 2. SET NULL for business assets (policies, risks, assessments, processes).

DO $$ 
DECLARE 
    r RECORD;
    v_sql TEXT;
    v_new_rule TEXT;
BEGIN 
    -- Iterate through ALL remaining blocking foreign keys in ALL schemas
    -- targeting auth.users or public.profiles
    FOR r IN (
        SELECT
            nm.nspname AS schema_name,
            cl.relname AS table_name,
            con.conname AS constraint_name,
            att.attname AS column_name,
            ref_nm.nspname AS ref_schema,
            ref_cl.relname AS ref_table,
            ref_att.attname AS ref_column
        FROM pg_constraint con
        JOIN pg_class cl ON cl.oid = con.conrelid
        JOIN pg_namespace nm ON nm.oid = cl.relnamespace
        JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY(con.conkey)
        JOIN pg_class ref_cl ON ref_cl.oid = con.confrelid
        JOIN pg_namespace ref_nm ON ref_nm.oid = ref_cl.relnamespace
        JOIN pg_attribute ref_att ON ref_att.attrelid = con.confrelid AND ref_att.attnum = ANY(con.confkey)
        WHERE con.contype = 'f'
          AND (
            (ref_cl.relname = 'users' AND ref_nm.nspname = 'auth')
            OR (ref_cl.relname = 'profiles' AND ref_nm.nspname = 'public')
          )
          AND con.confdeltype IN ('a', 'r') -- NO ACTION or RESTRICT
    ) LOOP
        -- STRATEGY LOGIC
        -- Tables that Should be CASCADED (operational/temporary)
        IF r.table_name ~* '(history|log|notification|mapping|ai_|webhook|workflow|audit|comment|trail|preferences|context|usage)' THEN
            v_new_rule := 'CASCADE';
        -- Tables that Should be PRESERVED (business value)
        ELSE
            v_new_rule := 'SET NULL';
        END IF;

        BEGIN
            -- If SET NULL, we must ensure the column is actually nullable
            IF v_new_rule = 'SET NULL' THEN
                BEGIN
                    v_sql := format('ALTER TABLE %I.%I ALTER COLUMN %I DROP NOT NULL', r.schema_name, r.table_name, r.column_name);
                    EXECUTE v_sql;
                EXCEPTION WHEN OTHERS THEN
                    -- Some views or system tables might fail, but we try
                    RAISE WARNING 'Could not remove NOT NULL from %.%: %', r.table_name, r.column_name, SQLERRM;
                END;
            END IF;

            -- Drop existing constraint
            v_sql := format('ALTER TABLE %I.%I DROP CONSTRAINT %I', r.schema_name, r.table_name, r.constraint_name);
            EXECUTE v_sql;
            
            -- Re-add with new rule
            v_sql := format('ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I.%I(%I) ON DELETE %s', 
                            r.schema_name, r.table_name, r.constraint_name, r.column_name, r.ref_schema, r.ref_table, r.ref_column, v_new_rule);
            EXECUTE v_sql;
            
            RAISE NOTICE 'Updated FK: %.% (% -> %) Rule: %', r.schema_name, r.table_name, r.column_name, r.ref_table, v_new_rule;
        EXCEPTION WHEN OTHERS THEN 
            RAISE WARNING 'ERROR updating table %.%: %', r.table_name, r.constraint_name, SQLERRM;
        END;
    END LOOP;
END $$;
