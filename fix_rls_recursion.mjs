import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        const sql = `
      -- 1. Create a security definer function to securely fetch the vendor_id of the currently logged-in vendor user
      -- This bypasses RLS and breaks the infinite recursion loop.
      CREATE OR REPLACE FUNCTION auth_vendor_ids()
      RETURNS SETOF uuid
      LANGUAGE sql
      SECURITY DEFINER
      SET search_path = public
      AS $$
        SELECT vendor_id FROM public.vendor_users WHERE auth_user_id = auth.uid()
        UNION
        SELECT vendor_id FROM public.vendor_portal_users WHERE email = auth.email();
      $$;

      -- 2. Update the vendor_registry policy to use this function instead of querying the tables directly
      DROP POLICY IF EXISTS "Vendor users can read their own registry" ON public.vendor_registry;
      CREATE POLICY "Vendor users can read their own registry" ON public.vendor_registry
          FOR SELECT
          USING (
            id IN (SELECT auth_vendor_ids())
          );

      -- 3. We can also update the other vendor policies that were querying the tables directly, to improve performance and prevent further recursion issues
      DROP POLICY IF EXISTS "Vendor users can access their assessments" ON public.vendor_assessments;
      CREATE POLICY "Vendor users can access their assessments" ON public.vendor_assessments
          FOR ALL
          USING (
            vendor_id IN (SELECT auth_vendor_ids())
          );

      DROP POLICY IF EXISTS "Vendor users can access their action plans" ON public.action_plans;
      CREATE POLICY "Vendor users can access their action plans" ON public.action_plans
          FOR ALL
          USING (
            entidade_origem_tipo IN ('vendor', 'vendor_assessment') 
            AND entidade_origem_id IN (SELECT auth_vendor_ids())
          );

      DROP POLICY IF EXISTS "Vendor users can access their messages" ON public.vendor_risk_messages;
      CREATE POLICY "Vendor users can access their messages" ON public.vendor_risk_messages
          FOR ALL
          USING (
            vendor_id IN (SELECT auth_vendor_ids())
          );
    `;

        console.log('Applying optimized RLS policies to fix recursion...');
        await pool.query(sql);
        console.log('Recursion fixed successfully.');
    } catch (err) {
        console.error('Error applying RLS:', err.message);
    } finally {
        await pool.end();
    }
}
main();
