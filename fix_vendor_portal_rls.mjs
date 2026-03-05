import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        const sql = `
      -- Allow vendor users to read their own vendor_registry
      DROP POLICY IF EXISTS "Vendor users can read their own registry" ON public.vendor_registry;
      CREATE POLICY "Vendor users can read their own registry" ON public.vendor_registry
          FOR SELECT
          USING (
            id IN (SELECT vendor_id FROM public.vendor_portal_users WHERE email = auth.email())
            OR id IN (SELECT vendor_id FROM public.vendor_users WHERE auth_user_id = auth.uid())
          );

      -- Allow vendor users to read and update their assessments
      DROP POLICY IF EXISTS "Vendor users can access their assessments" ON public.vendor_assessments;
      CREATE POLICY "Vendor users can access their assessments" ON public.vendor_assessments
          FOR ALL
          USING (
            vendor_id IN (SELECT vendor_id FROM public.vendor_portal_users WHERE email = auth.email())
            OR vendor_id IN (SELECT vendor_id FROM public.vendor_users WHERE auth_user_id = auth.uid())
          );

      -- Allow vendor users to read and update their action plans
      DROP POLICY IF EXISTS "Vendor users can access their action plans" ON public.action_plans;
      CREATE POLICY "Vendor users can access their action plans" ON public.action_plans
          FOR ALL
          USING (
            (entidade_origem_tipo IN ('vendor', 'vendor_assessment') AND entidade_origem_id IN (SELECT vendor_id FROM public.vendor_portal_users WHERE email = auth.email()))
            OR 
            (entidade_origem_tipo IN ('vendor', 'vendor_assessment') AND entidade_origem_id IN (SELECT vendor_id FROM public.vendor_users WHERE auth_user_id = auth.uid()))
          );
          
      -- Do the same for vendor_risk_messages (if needed for the message portal)
      DROP POLICY IF EXISTS "Vendor users can access their messages" ON public.vendor_risk_messages;
      CREATE POLICY "Vendor users can access their messages" ON public.vendor_risk_messages
          FOR ALL
          USING (
            vendor_id IN (SELECT vendor_id FROM public.vendor_portal_users WHERE email = auth.email())
            OR vendor_id IN (SELECT vendor_id FROM public.vendor_users WHERE auth_user_id = auth.uid())
          );
    `;

        console.log('Applying RLS for Vendor Portal...');
        await pool.query(sql);
        console.log('Vendor Portal RLS applied successfully.');
    } catch (err) {
        console.error('Error applying RLS:', err.message);
    } finally {
        await pool.end();
    }
}
main();
