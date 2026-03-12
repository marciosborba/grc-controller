-- ============================================================================
-- MIGRATION: Recursive User Deletion Fix (Depth 2+ Blockers)
-- ============================================================================

DO $$ 
DECLARE 
    r RECORD;
    v_sql TEXT;
    v_new_rule TEXT;
    v_loop_count INT := 0;
    v_updated_this_loop INT := 1;
BEGIN 
    -- We loop multiple times to catch triggers that were blocked by tables 
    -- that were themselves blocked (recursive dependencies).
    WHILE v_updated_this_loop > 0 AND v_loop_count < 5 LOOP
        v_updated_this_loop := 0;
        v_loop_count := v_loop_count + 1;
        RAISE NOTICE '--- Pass % ---', v_loop_count;

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
              AND con.confdeltype IN ('a', 'r') -- NO ACTION or RESTRICT
              -- This is the critical change: We check for ANY table that is ALREADY part of a cascade chain
              -- Or direct links to auth.users/public.profiles
              AND (
                (ref_cl.relname = 'users' AND ref_nm.nspname = 'auth')
                OR (ref_cl.relname = 'profiles' AND ref_nm.nspname = 'public')
                OR EXISTS (
                    -- Table is referenced by something that IS ALREADY ON DELETE CASCADE or SET NULL
                    -- This detects nested hierarchies.
                    SELECT 1 
                    FROM pg_constraint c2 
                    WHERE c2.confrelid = con.confrelid 
                      AND c2.confdeltype IN ('c', 'n')
                )
              )
        ) LOOP
            -- STRATEGY LOGIC
            -- CASCADE for operational/log data
            IF r.table_name ~* '(history|log|notification|mapping|ai_|webhook|workflow|audit|comment|trail|preferences|context|usage|refresh_tokens|sessions|activity_logs|acknowledgments|approvals|metrics|responses|messages)' THEN
                v_new_rule := 'CASCADE';
            -- SET NULL for business assets (preserved)
            ELSE
                v_new_rule := 'SET NULL';
            END IF;

            BEGIN
                IF v_new_rule = 'SET NULL' THEN
                    BEGIN
                        v_sql := format('ALTER TABLE %I.%I ALTER COLUMN %I DROP NOT NULL', r.schema_name, r.table_name, r.column_name);
                        EXECUTE v_sql;
                    EXCEPTION WHEN OTHERS THEN
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
                
                v_updated_this_loop := v_updated_this_loop + 1;
                RAISE NOTICE 'Updated Recursive FK: %.% (% -> %) Rule: %', r.schema_name, r.table_name, r.column_name, r.ref_table, v_new_rule;
            EXCEPTION WHEN OTHERS THEN 
                RAISE WARNING 'ERROR updating table %.%: %', r.table_name, r.constraint_name, SQLERRM;
            END;
        END LOOP;
        
        RAISE NOTICE 'Updated % constraints in pass %.', v_updated_this_loop, v_loop_count;
    END LOOP;
END $$;
