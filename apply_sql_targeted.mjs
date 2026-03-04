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
      
      CREATE POLICY "Assessments are viewable by tenant users" ON public.assessments
          FOR ALL USING (
              tenant_id = (select tenant_id from auth.users where id = auth.uid()) OR
              public.is_platform_admin(auth.uid())
          );
          
      -- Fix vendor_assessments table
      DROP POLICY IF EXISTS "Users can access vendor_assessments for their tenant" ON public.vendor_assessments;
      
      CREATE POLICY "Users can access vendor_assessments for their tenant" ON public.vendor_assessments
          FOR ALL USING (
              tenant_id = (select tenant_id from auth.users where id = auth.uid()) OR
              public.is_platform_admin(auth.uid())
          );
          
      -- Fix vendor_registry table since it was mentioned in the UI
      DROP POLICY IF EXISTS "Users can access vendor_registry for their tenant" ON public.vendor_registry;
      
      CREATE POLICY "Users can access vendor_registry for their tenant" ON public.vendor_registry
          FOR ALL USING (
              tenant_id = (select tenant_id from auth.users where id = auth.uid()) OR
              public.is_platform_admin(auth.uid())
          );
    `;

        console.log('Applying targeted SQL migration...');
        await pool.query(sql);
        console.log('Targeted migration applied successfully.');
    } catch (err) {
        console.error('Error applying migration:', err.message);
    } finally {
        await pool.end();
    }
}
main();
