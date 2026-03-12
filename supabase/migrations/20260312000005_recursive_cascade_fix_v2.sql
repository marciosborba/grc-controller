-- ============================================================================
-- MIGRATION: Recursive User Deletion Fix V2 (Depth 2+ Blockers)
-- ============================================================================

DO $$ 
DECLARE 
    r RECORD;
    v_sql TEXT;
    v_new_rule TEXT;
    v_loop_count INT := 0;
    v_updated_this_loop INT := 1;
BEGIN 
    -- Recursive loop to propagate CASCADE/SET NULL rules down the dependency tree
    WHILE v_updated_this_loop > 0 AND v_loop_count < 10 LOOP
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
              AND con.confdeltype IN ('a', 'r') -- Identifying static (NO ACTION/RESTRICT) blockers
              AND (
                -- LEVEL 1: Direct links to User objects
                (ref_cl.relname = 'users' AND ref_nm.nspname = 'auth')
                OR (ref_cl.relname = 'profiles' AND ref_nm.nspname = 'public')
                OR 
                -- LEVEL 2+: Links to tables that ARE ALREADY part of the deletion chain
                EXISTS (
                    SELECT 1 
                    FROM pg_constraint c2 
                    WHERE c2.conrelid = con.confrelid -- The parent table of CURRENT 'con' is the child of 'c2'
                      AND c2.confdeltype IN ('c', 'n') -- 'c2' is already set to CASCADE ('c') or SET NULL ('n')
                )
              )
        ) LOOP
            -- STRATEGY LOGIC
            -- CASCADE for operational, logs, history, and system-internal tables
            IF r.table_name ~* '(history|log|notification|mapping|ai_|webhook|workflow|audit|comment|trail|preferences|context|usage|refresh_tokens|sessions|activity_logs|acknowledgments|approvals|metrics|responses|messages|action_plans|evidence|interviews|witnesses|sampling)' THEN
                v_new_rule := 'CASCADE';
            -- SET NULL for high-value entities (Políticas, Riscos, etc.)
            ELSE
                v_new_rule := 'SET NULL';
            END IF;

            BEGIN
                -- Ensure nullable for SET NULL
                IF v_new_rule = 'SET NULL' THEN
                    BEGIN
                        v_sql := format('ALTER TABLE %I.%I ALTER COLUMN %I DROP NOT NULL', r.schema_name, r.table_name, r.column_name);
                        EXECUTE v_sql;
                    EXCEPTION WHEN OTHERS THEN
                        RAISE WARNING 'Could not remove NOT NULL from %.%: %', r.table_name, r.column_name, SQLERRM;
                    END;
                END IF;

                -- Re-apply constraint with the dynamic rule
                v_sql := format('ALTER TABLE %I.%I DROP CONSTRAINT %I', r.schema_name, r.table_name, r.constraint_name);
                EXECUTE v_sql;
                
                v_sql := format('ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I.%I(%I) ON DELETE %s', 
                                r.schema_name, r.table_name, r.constraint_name, r.column_name, r.ref_schema, r.ref_table, r.ref_column, v_new_rule);
                EXECUTE v_sql;
                
                v_updated_this_loop := v_updated_this_loop + 1;
                RAISE NOTICE 'Updated [Pass %] FK: %.% (% -> %) Rule: %', v_loop_count, r.schema_name, r.table_name, r.column_name, r.ref_table, v_new_rule;
            EXCEPTION WHEN OTHERS THEN 
                RAISE WARNING 'ERROR updating table %.%: %', r.table_name, r.constraint_name, SQLERRM;
            END;
        END LOOP;
        
        RAISE NOTICE 'Updated % constraints in pass %.', v_updated_this_loop, v_loop_count;
    END LOOP;
END $$;
