const fs = require('fs');
let envContent = fs.readFileSync('.env', 'utf8');
const dbPassMatch = envContent.match(/SUPABASE_DB_PASSWORD=(.*)/);

if(!dbPassMatch) { process.exit(1); }

const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:' + dbPassMatch[1].trim() + '@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres'
});

async function fixRLS() {
  try {
    await client.connect();

    // CRITICAL FIX: The previous RLS policy used `WHERE id = auth.uid()` 
    // but auth.uid() maps to profiles.user_id, NOT profiles.id !
    // The profiles table has:
    //   id      = profile primary key (a UUID)
    //   user_id = foreign key to auth.users.id (this equals auth.uid())
    //
    // So the correct check is: WHERE user_id = auth.uid()
    //
    // Design:
    //   - In the Vulnerability MODULE (full admin panel): show ALL vulnerabilities of the tenant
    //   - In the Vulnerability PORTAL: the frontend will do additional filtering by assigned user
    //   - RLS scope: ANY authenticated user in the same tenant can read vulnerabilities
    //     (the portal's frontend restricts further to only assigned ones)

    const query = `
      -- Drop all existing policies
      DROP POLICY IF EXISTS "vulnerabilities_tenant_select" ON public.vulnerabilities;
      DROP POLICY IF EXISTS "vulnerabilities_user_select" ON public.vulnerabilities;
      DROP POLICY IF EXISTS "vulnerabilities_visible_to_user" ON public.vulnerabilities;
      DROP POLICY IF EXISTS "vulnerabilities_tenant_insert" ON public.vulnerabilities;
      DROP POLICY IF EXISTS "vulnerabilities_tenant_update" ON public.vulnerabilities;
      DROP POLICY IF EXISTS "vulnerabilities_tenant_delete" ON public.vulnerabilities;

      -- CORRECTED SELECT policy: use user_id = auth.uid() NOT id = auth.uid()
      -- All authenticated users in the same tenant can see all vulnerabilities.
      -- The portal's frontend layer handles per-user filtering for the "my queue" view.
      CREATE POLICY "vulnerabilities_tenant_select" ON public.vulnerabilities
      FOR SELECT TO authenticated
      USING (
        tenant_id IN (
          SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()
        )
      );

      -- INSERT: only non-guest users can create
      CREATE POLICY "vulnerabilities_tenant_insert" ON public.vulnerabilities
      FOR INSERT TO authenticated
      WITH CHECK (
        tenant_id IN (
          SELECT tenant_id FROM public.profiles
          WHERE user_id = auth.uid()
          AND system_role NOT IN ('guest', 'vendor')
        )
      );

      -- UPDATE: only non-guest users can update
      CREATE POLICY "vulnerabilities_tenant_update" ON public.vulnerabilities
      FOR UPDATE TO authenticated
      USING (
        tenant_id IN (
          SELECT tenant_id FROM public.profiles
          WHERE user_id = auth.uid()
          AND system_role NOT IN ('guest', 'vendor')
        )
      );

      -- DELETE: only non-guest users can delete
      CREATE POLICY "vulnerabilities_tenant_delete" ON public.vulnerabilities
      FOR DELETE TO authenticated
      USING (
        tenant_id IN (
          SELECT tenant_id FROM public.profiles
          WHERE user_id = auth.uid()
          AND system_role NOT IN ('guest', 'vendor')
        )
      );

      -- Fix vulnerability_comments too
      DROP POLICY IF EXISTS "vulnerability_comments_select" ON public.vulnerability_comments;
      DROP POLICY IF EXISTS "vulnerability_comments_insert" ON public.vulnerability_comments;

      CREATE POLICY "vulnerability_comments_select" ON public.vulnerability_comments
      FOR SELECT TO authenticated
      USING (
        tenant_id IN (
          SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()
        )
      );

      CREATE POLICY "vulnerability_comments_insert" ON public.vulnerability_comments
      FOR INSERT TO authenticated
      WITH CHECK (
        tenant_id IN (
          SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()
        )
      );
    `;

    console.log('Applying corrected RLS policies...');
    await client.query(query);
    console.log('SUCCESS!');

    // Verify
    const policies = await client.query(
      "SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename IN ('vulnerabilities', 'vulnerability_comments') ORDER BY tablename, cmd"
    );
    console.log('\nActive policies:');
    policies.rows.forEach(r => console.log(`  [${r.tablename}] ${r.policyname} (${r.cmd})`));

  } catch (e) {
    console.error('FAILED:', e.message);
    if (e.detail) console.error('Detail:', e.detail);
  } finally {
    await client.end();
  }
}

fixRLS();
