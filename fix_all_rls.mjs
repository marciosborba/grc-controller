import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        // Step 1: Get all policies for vendor_registry and vendor_assessments and assessments
        const { rows: allPolicies } = await pool.query(`
      SELECT tablename, policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename IN ('assessments', 'vendor_assessments', 'vendor_registry', 'vendor_contacts', 'vendor_assessment_frameworks', 'vendor_risks', 'vendor_risk_action_plans', 'vendor_incidents', 'vendor_communications', 'vendor_performance_metrics', 'vendor_contracts', 'vendor_certifications', 'vendor_notifications')
    `);

        // Step 2: Drop all existing policies on these tables
        for (const pol of allPolicies) {
            console.log(`Dropping policy: "${pol.policyname}" on ${pol.tablename}`);
            await pool.query(`DROP POLICY IF EXISTS "${pol.policyname}" ON public."${pol.tablename}"`);
        }

        // Step 3: Create clean policies
        const simpleTables = [
            'assessments',
            'vendor_assessments',
            'vendor_registry',
            'vendor_assessment_frameworks',
            'vendor_risks',
            'vendor_risk_action_plans',
            'vendor_incidents',
            'vendor_communications',
            'vendor_performance_metrics',
            'vendor_contracts',
            'vendor_notifications'
        ];

        for (const table of simpleTables) {
            await pool.query(`
        CREATE POLICY "platform_admin_or_tenant_access" ON public."${table}"
        FOR ALL USING (
          public.is_platform_admin(auth.uid()) OR
          tenant_id IN (SELECT tenant_id FROM public.user_tenant_access WHERE user_id = auth.uid())
        )
      `);
            console.log(`Created policy for: ${table}`);
        }

        // vendor_contacts - joined to vendor_registry
        await pool.query(`
      CREATE POLICY "platform_admin_or_tenant_access" ON public."vendor_contacts"
      FOR ALL USING (
        public.is_platform_admin(auth.uid()) OR
        exists (
          select 1 from public.vendor_registry vr
          where vr.id = vendor_contacts.vendor_id
          and vr.tenant_id IN (SELECT tenant_id FROM public.user_tenant_access WHERE user_id = auth.uid())
        )
      )
    `);
        console.log(`Created policy for: vendor_contacts`);

        // vendor_certifications - joined to vendor_registry
        try {
            await pool.query(`
        CREATE POLICY "platform_admin_or_tenant_access" ON public."vendor_certifications"
        FOR ALL USING (
          public.is_platform_admin(auth.uid()) OR
          exists (
            select 1 from public.vendor_registry vr
            where vr.id = vendor_certifications.vendor_id
            and vr.tenant_id IN (SELECT tenant_id FROM public.user_tenant_access WHERE user_id = auth.uid())
          )
        )
      `);
            console.log(`Created policy for: vendor_certifications`);
        } catch (e) {
            console.log(`Skipping vendor_certifications: ${e.message}`);
        }

        // Also add assessment framework public access policy (needed for system-wide frameworks)
        await pool.query(`
      CREATE POLICY "public_system_frameworks" ON public."vendor_assessment_frameworks"
      FOR SELECT USING (tenant_id = '00000000-0000-0000-0000-000000000000')
    `);

        console.log('\nAll policies applied successfully!');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
