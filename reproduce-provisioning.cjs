const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is required in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const testUser = {
    email: 'test_provision@gepriv.com',
    full_name: 'Test Provision User',
    tenant_id: '0c5c1433-2688-460c-992a-f4cce57c0d6d', // Gepriv Tenant ID
    system_role: 'guest',
    tenant_role_id: 'f87a8b9c-d4e5-4f6a-8b9c-d4e54f6a8b9c', // A sample role ID if exists, or null
    send_invitation: true
};

async function reproduce() {
    console.log('🚀 Invoking create-user-admin...');
    
    // First, cleanup if exists
    await supabase.auth.admin.deleteUser('test_provision@gepriv.com'); // This might fail if user doesn't exist, ignore
    await supabase.from('profiles').delete().eq('email', testUser.email);
    
    const { data, error } = await supabase.functions.invoke('create-user-admin', {
        body: testUser
    });

    if (error) {
        console.error('❌ Edge Function Error:', error);
        return;
    }

    console.log('✅ Edge Function Response:', JSON.stringify(data, null, 2));

    if (!data?.success) {
        console.error('❌ Edge Function returned success: false');
        return;
    }

    const userId = data.user.id;
    console.log(`🔍 Inspecting database for User ID: ${userId}`);

    // Check Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    console.log('\n--- PROFILE ---');
    console.log(JSON.stringify(profile, null, 2));

    // Check user_roles
    const { data: roles } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);
    
    console.log('\n--- USER_ROLES ---');
    console.log(JSON.stringify(roles, null, 2));

    // Check user_tenant_roles
    const { data: tenantRoles } = await supabase
        .from('user_tenant_roles')
        .select('*')
        .eq('user_id', userId);
    
    console.log('\n--- USER_TENANT_ROLES ---');
    console.log(JSON.stringify(tenantRoles, null, 2));
    
    // Final check: RPC get_user_complete_profile simulation (using service role might differ but let's see)
    // Actually get_user_complete_profile uses auth.uid(), so we can't easily call it for another user using service role.
}

reproduce();
