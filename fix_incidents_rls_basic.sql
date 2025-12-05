-- Fix RLS policies for incidents table - versão básica que funciona
-- Remove políticas existentes
DROP POLICY IF EXISTS "incidents_select_policy" ON incidents;
DROP POLICY IF EXISTS "incidents_insert_policy" ON incidents;
DROP POLICY IF EXISTS "incidents_update_policy" ON incidents;

-- Criar políticas básicas que funcionem
-- 1. SELECT policy - Permitir visualização baseada no tenant_id
CREATE POLICY "incidents_select_policy" ON incidents
  FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- 2. INSERT policy - Permitir criação baseada no tenant_id
CREATE POLICY "incidents_insert_policy" ON incidents
  FOR INSERT
  WITH CHECK (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- 3. UPDATE policy - Permitir atualização baseada no tenant_id
CREATE POLICY "incidents_update_policy" ON incidents
  FOR UPDATE
  USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'incidents';