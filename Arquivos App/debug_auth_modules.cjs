
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role to bypass RLS for debug

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAuth(email) {
    console.log(`\n🔍 Debugging Auth for email: ${email}`);

    // 1. Get User ID
    // Note: We can't query auth.users directly easily via JS client usually, but we can query profiles
    const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', `%${email}%`);

    if (pErr) { console.error('Profiles Error:', pErr); return; }
    if (!profiles || profiles.length === 0) { console.error('No profile found matching email'); return; }

    const profile = profiles[0];
    console.log('✅ Profile found:', {
        id: profile.id,
        user_id: profile.user_id,
        email: profile.email,
        tenant_id: profile.tenant_id
    });

    if (!profile.tenant_id) {
        console.error('❌ Profile has NO tenant_id. This is why modules are missing!');
        return;
    }

    // 2. Fetch Tenant
    const { data: tenant, error: tErr } = await supabase
        .from('tenants')
        .select('id, name, settings')
        .eq('id', profile.tenant_id)
        .single();

    if (tErr) { console.error('Tenant Error:', tErr); }
    else {
        console.log('✅ Tenant found:', tenant);
    }

    // 3. Fetch Tenant Modules (Simulate AuthContext)
    const { data: modData, error: mErr } = await supabase
        .from('tenant_modules')
        .select('module_key, is_enabled')
        .eq('tenant_id', profile.tenant_id)
        .eq('is_enabled', true);

    if (mErr) { console.error('Tenant Modules Error:', mErr); return; }

    const enabledModules = modData.map(m => m.module_key);
    console.log('📦 Enabled Modules Count:', enabledModules.length);
    console.log('📦 Enabled Modules List:', enabledModules);
}

// Try to find the user
debugAuth('marcio');
