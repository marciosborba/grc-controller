-- Fix RLS policies for incidents table - versão simplificada
-- Remove políticas existentes
DROP POLICY IF EXISTS "Users can view incidents from their tenant" ON incidents;
DROP POLICY IF EXISTS "Users can create incidents for their tenant" ON incidents;
DROP POLICY IF EXISTS "Users can update incidents from their tenant" ON incidents;

-- Criar políticas mais permissivas temporariamente para testar
-- 1. SELECT policy - Permitir visualização baseada no tenant_id
CREATE POLICY "incidents_select_policy" ON incidents
  FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR
    -- Permitir se o usuário tem is_platform_admin = true
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (
      -- Verificar se há campo is_platform_admin
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'profiles' 
          AND column_name = 'is_platform_admin'
        ) THEN is_platform_admin = true
        ELSE false
      END
    ))
  );

-- 2. INSERT policy - Permitir criação baseada no tenant_id
CREATE POLICY "incidents_insert_policy" ON incidents
  FOR INSERT
  WITH CHECK (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR
    -- Permitir se o usuário tem is_platform_admin = true
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (
      -- Verificar se há campo is_platform_admin
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'profiles' 
          AND column_name = 'is_platform_admin'
        ) THEN is_platform_admin = true
        ELSE false
      END
    ))
  );

-- 3. UPDATE policy - Permitir atualização baseada no tenant_id
CREATE POLICY "incidents_update_policy" ON incidents
  FOR UPDATE
  USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR
    -- Permitir se o usuário tem is_platform_admin = true
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (
      -- Verificar se há campo is_platform_admin
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'profiles' 
          AND column_name = 'is_platform_admin'
        ) THEN is_platform_admin = true
        ELSE false
      END
    ))
  );

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'incidents';