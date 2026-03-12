-- ============================================================================
-- MIGRATION: Fix Universal de Exclusão em Cascata
-- ============================================================================
-- Este script localiza AUTOMATICAMENTE todas as chaves estrangeiras que apontam
-- para auth.users ou public.profiles e que bloqueiam a exclusão (NO ACTION/RESTRICT)
-- e as altera para ON DELETE CASCADE.

DO $$ 
DECLARE 
    r RECORD;
    v_sql TEXT;
BEGIN 
    -- 1. Loop por todas as FKs que apontam para auth.users ou public.profiles
    -- e que NÃO são ON DELETE CASCADE ou SET NULL
    FOR r IN (
        SELECT 
            tc.table_schema, 
            tc.table_name, 
            tc.constraint_name,
            kcu.column_name,
            ccu.table_schema AS ref_schema,
            ccu.table_name AS ref_table,
            ccu.column_name AS ref_column
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu 
          ON tc.constraint_name = kcu.constraint_name 
          AND tc.table_schema = kcu.table_schema 
        JOIN information_schema.constraint_column_usage AS ccu 
          ON ccu.constraint_name = tc.constraint_name 
          AND ccu.table_schema = tc.table_schema 
        JOIN information_schema.referential_constraints AS rc 
          ON rc.constraint_name = tc.constraint_name 
          AND rc.constraint_schema = tc.table_schema 
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND (
            (ccu.table_name = 'users' AND ccu.table_schema = 'auth') 
            OR (ccu.table_name = 'profiles' AND ccu.table_schema = 'public')
          )
          AND rc.delete_rule NOT IN ('CASCADE', 'SET NULL')
          AND tc.table_schema = 'public' -- Focar apenas nas nossas tabelas
    ) LOOP
        -- Construir SQL para dropar e recriar a constraint com ON DELETE CASCADE
        BEGIN
            v_sql := format('ALTER TABLE %I.%I DROP CONSTRAINT %I', r.table_schema, r.table_name, r.constraint_name);
            EXECUTE v_sql;
            
            v_sql := format('ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I.%I(%I) ON DELETE CASCADE', 
                            r.table_schema, r.table_name, r.constraint_name, r.column_name, r.ref_schema, r.ref_table, r.ref_column);
            EXECUTE v_sql;
            
            RAISE NOTICE 'Atualizada FK: %.% (% -> %)', r.table_schema, r.table_name, r.column_name, r.ref_table;
        EXCEPTION WHEN OTHERS THEN 
            RAISE WARNING 'Erro ao atualizar FK %.%: %', r.table_name, r.constraint_name, SQLERRM;
        END;
    END LOOP;
END $$;
