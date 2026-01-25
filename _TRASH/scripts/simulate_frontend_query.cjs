const { Client } = require('pg');
require('dotenv').config();

async function simulateQuery() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres`,
        ssl: { rejectUnauthorized: false }
    });

    const tenantId = '550e8400-e29b-41d4-a716-446655440000'; // Confirmed Tenant ID

    try {
        await client.connect();
        console.log(`Simulating frontend query for Tenant ID: ${tenantId}`);

        const query = `
      SELECT 
        va.id, 
        va.assessment_name, 
        va.status,
        vr.name as vendor_name
      FROM public.vendor_assessments va
      LEFT JOIN public.vendor_registry vr ON va.vendor_id = vr.id
      WHERE va.tenant_id = $1
      ORDER BY va.created_at DESC
    `;

        const res = await client.query(query, [tenantId]);

        if (res.rows.length === 0) {
            console.log('❌ No assessments found for this tenant.');
        } else {
            console.log(`✅ Found ${res.rows.length} assessments:`);
            res.rows.forEach(r => {
                console.log(`- [${r.status}] ${r.assessment_name} (Vendor: ${r.vendor_name})`);
            });
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

simulateQuery();
