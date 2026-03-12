-- ============================================================================
-- MIGRATION: Preserve Audit Work Papers (Fixing overly broad CASCADE)
-- ============================================================================

DO $$ 
DECLARE 
    r RECORD;
    v_sql TEXT;
BEGIN 
    -- We target tables that were previously set to CASCADE but should be SET NULL
    -- specifically major audit content tables.
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
          -- We target audit content tables specifically
          AND cl.relname ~* '(trabalhos_auditoria|apontamentos|evidencias_auditoria|procedimentos_auditoria|relatorios_auditoria|testes_auditoria|projetos_auditoria)'
          AND (
            (ref_cl.relname = 'users' AND ref_nm.nspname = 'auth')
            OR (ref_cl.relname = 'profiles' AND ref_nm.nspname = 'public')
          )
    ) LOOP
        -- Ensure nullable
        BEGIN
            v_sql := format('ALTER TABLE %I.%I ALTER COLUMN %I DROP NOT NULL', r.schema_name, r.table_name, r.column_name);
            EXECUTE v_sql;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Column %.% already nullable or error: %', r.table_name, r.column_name, SQLERRM;
        END;

        -- Change rule to SET NULL
        BEGIN
            v_sql := format('ALTER TABLE %I.%I DROP CONSTRAINT %I', r.schema_name, r.table_name, r.constraint_name);
            EXECUTE v_sql;
            
            v_sql := format('ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I.%I(%I) ON DELETE SET NULL', 
                            r.schema_name, r.table_name, r.constraint_name, r.column_name, r.ref_schema, r.ref_table, r.ref_column);
            EXECUTE v_sql;
            
            RAISE NOTICE 'Updated Audit FK to SET NULL: %.% (% -> %)', r.schema_name, r.table_name, r.column_name, r.ref_table;
        EXCEPTION WHEN OTHERS THEN 
            RAISE WARNING 'ERROR updating table %.%: %', r.table_name, r.constraint_name, SQLERRM;
        END;
    END LOOP;
END $$;
