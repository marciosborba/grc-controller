import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        const sql = `
      -- Fix assessments table
      DROP POLICY IF EXISTS "Assessments are viewable by tenant users" ON public.assessments;
      DROP POLICY IF EXISTS "Users can access assessments for their tenant" ON public.assessments;
      DROP POLICY IF EXISTS "assessments_tenant_policy" ON public.assessments;
      DROP POLICY IF EXISTS "assessments_read_own" ON public.assessments;
      DROP POLICY IF EXISTS "assessments_manage_admin" ON public.assessments;

      CREATE POLICY "Assessments are viewable by tenant users" ON public.assessments
          FOR ALL USING (
              tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) OR
              public.is_platform_admin(auth.uid())
          );
          
      -- Fix vendor_assessments table
      DROP POLICY IF EXISTS "Users can access vendor_assessments for their tenant" ON public.vendor_assessments;
      
      CREATE POLICY "Users can access vendor_assessments for their tenant" ON public.vendor_assessments
          FOR ALL USING (
              tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) OR
              public.is_platform_admin(auth.uid())
          );
          
      -- Fix vendor_registry table since it was mentioned in the UI
      DROP POLICY IF EXISTS "Users can access vendor_registry for their tenant" ON public.vendor_registry;
      
      CREATE POLICY "Users can access vendor_registry for their tenant" ON public.vendor_registry
          FOR ALL USING (
              tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) OR
              public.is_platform_admin(auth.uid())
          );
          
      -- Replace any other policies that attempt to read from auth.users on all tables
      CREATE OR REPLACE FUNCTION replace_invalid_vendor_policies() RETURNS void AS $$
      DECLARE
        pol RECORD;
      BEGIN
        FOR pol IN 
          SELECT policyname, tablename 
          FROM pg_policies 
          WHERE schemaname = 'public' 
            AND tablename LIKE 'vendor_%'
            AND (qual LIKE '%auth.users%' OR with_check LIKE '%auth.users%')
        LOOP
           EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
           EXECUTE format('
              CREATE POLICY "Users can access %I for their tenant" ON public.%I
              FOR ALL USING (
                  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) OR
                  public.is_platform_admin(auth.uid())
              )', pol.tablename, pol.tablename);
        END LOOP;
      END;
      $$ LANGUAGE plpgsql;
      
      SELECT replace_invalid_vendor_policies();
    `;

        console.log('Applying targeted SQL migration with public.profiles...');
        await pool.query(sql);
        console.log('Targeted migration applied successfully.');
    } catch (err) {
        console.error('Error applying migration:', err.message);
    } finally {
        await pool.end();
    }
}
main();
