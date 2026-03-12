const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
require('dotenv').config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

async function testInternal() {
    const email = `test_iam_${Date.now()}@example.com`;
    const tenantId = '46b1c048-85a1-423b-96fc-776007c8de1f'; // GRC Tenant
    console.log(`Testing creation for ${email} in tenant ${tenantId}...`);

    try {
        // 1. Generate Link (simulates Edge Function invitation)
        const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
            type: 'invite',
            email,
            options: {
                data: {
                    full_name: 'Test IAM User',
                    tenant_id: tenantId,
                    system_role: 'admin'
                }
            }
        });

        if (linkErr) throw linkErr;
        const userId = linkData.user.id;
        console.log(`✅ User created: ${userId}`);

        // 2. Inspect DB via PG
        const pg = new Client({
            host: 'db.myxvxponlmulnjstbjwd.supabase.co',
            port: 5432,
            database: 'postgres',
            user: 'postgres',
            password: process.env.SUPABASE_DB_PASSWORD,
            ssl: { rejectUnauthorized: false }
        });
        await pg.connect();

        console.log('\n--- auth.users metadata ---');
        const authUser = await pg.query('SELECT raw_user_meta_data FROM auth.users WHERE id = $1', [userId]);
        console.log(JSON.stringify(authUser.rows[0]?.raw_user_meta_data, null, 2));

        console.log('\n--- public.profiles ---');
        const profile = await pg.query('SELECT * FROM public.profiles WHERE user_id = $1', [userId]);
        console.log(profile.rows[0] ? JSON.stringify(profile.rows[0], null, 2) : '❌ Profile NOT FOUND');

        console.log('\n--- public.user_roles ---');
        const roles = await pg.query('SELECT * FROM public.user_roles WHERE user_id = $1', [userId]);
        console.table(roles.rows);

        // Cleanup
        await supabaseAdmin.auth.admin.deleteUser(userId);
        await pg.end();

    } catch (err) {
        console.error('Test failed:', err);
    }
}

testInternal();
