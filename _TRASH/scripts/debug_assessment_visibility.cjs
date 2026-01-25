const { Client } = require('pg');
require('dotenv').config();

async function debugVisibility() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres`,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        console.log('--- Debugging Assessment Visibility ---');

        // 1. Get the created assessment
        console.log('\n1. Checking Created Assessment:');
        const assessmentRes = await client.query(`
      SELECT id, assessment_name, tenant_id, created_by 
      FROM public.vendor_assessments 
      WHERE assessment_name LIKE '%QA Test Assessment%'
    `);

        if (assessmentRes.rows.length === 0) {
            console.log('❌ QA Assessment NOT FOUND in database.');
        } else {
            assessmentRes.rows.forEach(a => {
                console.log(`✅ Found Assessment: ${a.assessment_name}`);
                console.log(`   - ID: ${a.id}`);
                console.log(`   - Tenant ID: ${a.tenant_id}`);
            });
        }

        // 2. Check Profiles/Tenants
        console.log('\n2. Checking User Profiles & Tenants:');
        const profilesRes = await client.query(`
      SELECT id, email, full_name, tenant_id 
      FROM public.profiles
    `);

        if (profilesRes.rows.length === 0) {
            console.log('❌ No profiles found.');
        } else {
            profilesRes.rows.forEach(p => {
                console.log(`👤 User: ${p.email} (${p.full_name})`);
                console.log(`   - Profile ID: ${p.id}`);
                console.log(`   - Tenant ID: ${p.tenant_id}`);
            });
        }

        // 3. Check RLS Policy (Simulated)
        console.log('\n3. RLS Policy Check:');
        console.log('The policy "Users can access vendor_assessments for their tenant" usually enforces:');
        console.log('tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

debugVisibility();
