const { Client } = require('pg');
const fs = require('fs');
let envContent = fs.readFileSync('.env', 'utf8');
const dbPassMatch = envContent.match(/SUPABASE_DB_PASSWORD=(.*)/);
const client = new Client({ connectionString: 'postgresql://postgres:' + dbPassMatch[1].trim() + '@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres' });

const sql = `
-- ============================================================
-- FIX 1: Add INSERT/UPDATE/DELETE policies to remediation_tasks
-- (currently only has SELECT policy, blocking all writes)
-- ============================================================
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.remediation_tasks;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.remediation_tasks;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.remediation_tasks;

CREATE POLICY "Enable insert for authenticated users"
ON public.remediation_tasks
FOR INSERT
TO authenticated
WITH CHECK (
  is_platform_admin()
  OR
  vulnerability_id IN (
    SELECT v.id FROM public.vulnerabilities v
    WHERE v.tenant_id IN (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.system_role NOT IN ('guest', 'vendor')
    )
  )
);

CREATE POLICY "Enable update for authenticated users"
ON public.remediation_tasks
FOR UPDATE
TO authenticated
USING (
  is_platform_admin()
  OR
  vulnerability_id IN (
    SELECT v.id FROM public.vulnerabilities v
    WHERE v.tenant_id IN (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.system_role NOT IN ('guest', 'vendor')
    )
  )
);

CREATE POLICY "Enable delete for authenticated users"
ON public.remediation_tasks
FOR DELETE
TO authenticated
USING (
  is_platform_admin()
  OR
  vulnerability_id IN (
    SELECT v.id FROM public.vulnerabilities v
    WHERE v.tenant_id IN (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.system_role NOT IN ('guest', 'vendor')
    )
  )
);

-- Also update SELECT policy to support platform admins who have no tenant
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.remediation_tasks;
CREATE POLICY "Enable read access for authenticated users"
ON public.remediation_tasks
FOR SELECT
TO authenticated
USING (
  is_platform_admin()
  OR
  vulnerability_id IN (
    SELECT v.id FROM public.vulnerabilities v
    WHERE v.tenant_id IN (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  )
);

-- ============================================================
-- FIX 2: Add full policies to vulnerability_action_items
-- (currently NO policies at all)
-- ============================================================
ALTER TABLE public.vulnerability_action_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "action_items_select" ON public.vulnerability_action_items;
DROP POLICY IF EXISTS "action_items_insert" ON public.vulnerability_action_items;
DROP POLICY IF EXISTS "action_items_update" ON public.vulnerability_action_items;
DROP POLICY IF EXISTS "action_items_delete" ON public.vulnerability_action_items;

CREATE POLICY "action_items_select"
ON public.vulnerability_action_items FOR SELECT TO authenticated
USING (
  is_platform_admin()
  OR
  vulnerability_id IN (
    SELECT v.id FROM public.vulnerabilities v
    WHERE v.tenant_id IN (SELECT p.tenant_id FROM public.profiles p WHERE p.user_id = auth.uid())
  )
);

CREATE POLICY "action_items_insert"
ON public.vulnerability_action_items FOR INSERT TO authenticated
WITH CHECK (
  is_platform_admin()
  OR
  vulnerability_id IN (
    SELECT v.id FROM public.vulnerabilities v
    WHERE v.tenant_id IN (SELECT p.tenant_id FROM public.profiles p WHERE p.user_id = auth.uid() AND p.system_role NOT IN ('guest', 'vendor'))
  )
);

CREATE POLICY "action_items_update"
ON public.vulnerability_action_items FOR UPDATE TO authenticated
USING (
  is_platform_admin()
  OR
  vulnerability_id IN (
    SELECT v.id FROM public.vulnerabilities v
    WHERE v.tenant_id IN (SELECT p.tenant_id FROM public.profiles p WHERE p.user_id = auth.uid() AND p.system_role NOT IN ('guest', 'vendor'))
  )
);

CREATE POLICY "action_items_delete"
ON public.vulnerability_action_items FOR DELETE TO authenticated
USING (
  is_platform_admin()
  OR
  vulnerability_id IN (
    SELECT v.id FROM public.vulnerabilities v
    WHERE v.tenant_id IN (SELECT p.tenant_id FROM public.profiles p WHERE p.user_id = auth.uid() AND p.system_role NOT IN ('guest', 'vendor'))
  )
);

-- ============================================================
-- FIX 3: Add full policies to vulnerability_status_history
-- (currently NO policies at all)
-- ============================================================
ALTER TABLE public.vulnerability_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "status_history_select" ON public.vulnerability_status_history;
DROP POLICY IF EXISTS "status_history_insert" ON public.vulnerability_status_history;

CREATE POLICY "status_history_select"
ON public.vulnerability_status_history FOR SELECT TO authenticated
USING (
  is_platform_admin()
  OR
  vulnerability_id IN (
    SELECT v.id FROM public.vulnerabilities v
    WHERE v.tenant_id IN (SELECT p.tenant_id FROM public.profiles p WHERE p.user_id = auth.uid())
  )
);

CREATE POLICY "status_history_insert"
ON public.vulnerability_status_history FOR INSERT TO authenticated
WITH CHECK (
  is_platform_admin()
  OR
  vulnerability_id IN (
    SELECT v.id FROM public.vulnerabilities v
    WHERE v.tenant_id IN (SELECT p.tenant_id FROM public.profiles p WHERE p.user_id = auth.uid())
  )
);

-- ============================================================
-- FIX 4: Update vulnerabilities policies to support platform admins
-- ============================================================
DROP POLICY IF EXISTS "vulnerabilities_tenant_select" ON public.vulnerabilities;
CREATE POLICY "vulnerabilities_tenant_select"
ON public.vulnerabilities FOR SELECT TO authenticated
USING (
  is_platform_admin()
  OR
  tenant_id IN (SELECT p.tenant_id FROM public.profiles p WHERE p.user_id = auth.uid())
);

DROP POLICY IF EXISTS "vulnerabilities_tenant_insert" ON public.vulnerabilities;
CREATE POLICY "vulnerabilities_tenant_insert"
ON public.vulnerabilities FOR INSERT TO authenticated
WITH CHECK (
  is_platform_admin()
  OR
  tenant_id IN (SELECT p.tenant_id FROM public.profiles p WHERE p.user_id = auth.uid() AND p.system_role NOT IN ('guest', 'vendor'))
);

DROP POLICY IF EXISTS "vulnerabilities_tenant_update" ON public.vulnerabilities;
CREATE POLICY "vulnerabilities_tenant_update"
ON public.vulnerabilities FOR UPDATE TO authenticated
USING (
  is_platform_admin()
  OR
  tenant_id IN (SELECT p.tenant_id FROM public.profiles p WHERE p.user_id = auth.uid() AND p.system_role NOT IN ('guest', 'vendor'))
);

DROP POLICY IF EXISTS "vulnerabilities_tenant_delete" ON public.vulnerabilities;
CREATE POLICY "vulnerabilities_tenant_delete"
ON public.vulnerabilities FOR DELETE TO authenticated
USING (
  is_platform_admin()
  OR
  tenant_id IN (SELECT p.tenant_id FROM public.profiles p WHERE p.user_id = auth.uid() AND p.system_role NOT IN ('guest', 'vendor'))
);

-- ============================================================
-- FIX 5: Update vulnerability_attachments and vulnerability_comments
-- to support platform admins
-- ============================================================
DROP POLICY IF EXISTS "unified_SELECT_attachments" ON public.vulnerability_attachments;
CREATE POLICY "unified_SELECT_attachments"
ON public.vulnerability_attachments FOR SELECT TO authenticated
USING (is_platform_admin() OR vulnerability_id IN (SELECT v.id FROM public.vulnerabilities v WHERE v.tenant_id IN (SELECT p.tenant_id FROM public.profiles p WHERE p.user_id = auth.uid())));

DROP POLICY IF EXISTS "unified_INSERT_attachments" ON public.vulnerability_attachments;
CREATE POLICY "unified_INSERT_attachments"
ON public.vulnerability_attachments FOR INSERT TO authenticated
WITH CHECK (is_platform_admin() OR vulnerability_id IN (SELECT v.id FROM public.vulnerabilities v WHERE v.tenant_id IN (SELECT p.tenant_id FROM public.profiles p WHERE p.user_id = auth.uid())));

DROP POLICY IF EXISTS "unified_UPDATE_attachments" ON public.vulnerability_attachments;
CREATE POLICY "unified_UPDATE_attachments"
ON public.vulnerability_attachments FOR UPDATE TO authenticated
USING (is_platform_admin() OR vulnerability_id IN (SELECT v.id FROM public.vulnerabilities v WHERE v.tenant_id IN (SELECT p.tenant_id FROM public.profiles p WHERE p.user_id = auth.uid())));
DROP POLICY IF EXISTS "unified_DELETE_attachments" ON public.vulnerability_attachments;
CREATE POLICY "unified_DELETE_attachments"
ON public.vulnerability_attachments FOR DELETE TO authenticated
USING (is_platform_admin() OR vulnerability_id IN (SELECT v.id FROM public.vulnerabilities v WHERE v.tenant_id IN (SELECT p.tenant_id FROM public.profiles p WHERE p.user_id = auth.uid())));

DROP POLICY IF EXISTS "vulnerability_comments_select" ON public.vulnerability_comments;
CREATE POLICY "vulnerability_comments_select"
ON public.vulnerability_comments FOR SELECT TO authenticated
USING (is_platform_admin() OR tenant_id IN (SELECT p.tenant_id FROM public.profiles p WHERE p.user_id = auth.uid()));

DROP POLICY IF EXISTS "vulnerability_comments_insert" ON public.vulnerability_comments;
CREATE POLICY "vulnerability_comments_insert"
ON public.vulnerability_comments FOR INSERT TO authenticated
WITH CHECK (is_platform_admin() OR tenant_id IN (SELECT p.tenant_id FROM public.profiles p WHERE p.user_id = auth.uid()));
`;

client.connect().then(async () => {
  try {
    await client.query(sql);
    console.log('✅ All RLS policies applied successfully!');
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
  await client.end();
});
