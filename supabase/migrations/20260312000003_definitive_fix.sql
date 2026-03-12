-- ============================================================================
-- MIGRATION: Definitive User Deletion Fix (Universal + Trigger Cleanup)
-- ============================================================================

DO $$ 
DECLARE 
    r RECORD;
    v_sql TEXT;
    v_new_rule TEXT;
BEGIN 
    -- PART 1: TRIGGER CLEANUP
    -- Drop triggers calling update_updated_at_column on tables that DON'T have an updated_at column
    FOR r IN (
        SELECT 
          nm.nspname AS schema_name,
          cl.relname AS table_name,
          trig.tgname AS trigger_name
        FROM pg_trigger trig
        JOIN pg_class cl ON trig.tgrelid = cl.oid 
        JOIN pg_namespace nm ON cl.relnamespace = nm.oid
        JOIN pg_proc pr ON trig.tgfoid = pr.oid 
        WHERE pr.proname = 'update_updated_at_column'
          AND NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = cl.relname 
              AND table_schema = nm.nspname 
              AND column_name = 'updated_at'
          )
    ) LOOP
        v_sql := format('DROP TRIGGER IF EXISTS %I ON %I.%I', r.trigger_name, r.schema_name, r.table_name);
        EXECUTE v_sql;
        RAISE NOTICE 'Dropped invalid trigger % on table %.%', r.trigger_name, r.schema_name, r.table_name;
    END LOOP;

    -- PART 2: BALANCED FOREIGN KEY UPDATE
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
          AND con.confdeltype IN ('a', 'r') 
    ) LOOP
        -- STRATEGY LOGIC
        IF r.table_name ~* '(history|log|notification|mapping|ai_|webhook|workflow|audit|comment|trail|preferences|context|usage|refresh_tokens|sessions|activity_logs)' THEN
            v_new_rule := 'CASCADE';
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

            v_sql := format('ALTER TABLE %I.%I DROP CONSTRAINT %I', r.schema_name, r.table_name, r.constraint_name);
            EXECUTE v_sql;
            
            v_sql := format('ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I.%I(%I) ON DELETE %s', 
                            r.schema_name, r.table_name, r.constraint_name, r.column_name, r.ref_schema, r.ref_table, r.ref_column, v_new_rule);
            EXECUTE v_sql;
            
            RAISE NOTICE 'Updated FK: %.% (% -> %) Rule: %', r.schema_name, r.table_name, r.column_name, r.ref_table, v_new_rule;
        EXCEPTION WHEN OTHERS THEN 
            RAISE WARNING 'ERROR updating table %.%: %', r.table_name, r.constraint_name, SQLERRM;
        END;
    END LOOP;
END $$;
