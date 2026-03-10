const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load .env
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role to read auth.users

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugSessions() {
    console.log('🔍 Debugging Active Sessions...');

    // 1. Get raw Last Sign In data
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
        console.error('❌ Error fetching users:', usersError);
        return;
    }

    console.log(`Found ${users.users.length} users.`);

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const activeUsers = users.users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > oneDayAgo);

    console.log(`Users signed in last 24h: ${activeUsers.length}`);

    for (const user of activeUsers) {
        console.log(`\nUser: ${user.email} (ID: ${user.id})`);
        console.log(`Last Sign In: ${user.last_sign_in_at}`);

        // Check for Logout Logs
        const { data: logouts } = await supabase
            .from('activity_logs')
            .select('created_at, action')
            .eq('user_id', user.id)
            .in('action', ['logout', 'signout', 'session_terminated', 'session_terminated_success'])
            .order('created_at', { ascending: false })
            .limit(1);

        if (logouts && logouts.length > 0) {
            const lastLogout = logouts[0].created_at;
            console.log(`Last Logout Log: ${lastLogout} (${logouts[0].action})`);

            if (new Date(lastLogout) > new Date(user.last_sign_in_at)) {
                console.log('🔴 STATUS: Logged Out (Logout > Sign In)');
            } else {
                console.log('🟢 STATUS: Active (Sign In > Logout)');
            }
        } else {
            console.log('🟢 STATUS: Active (No Logout found)');
        }
    }

    // 2. Call RPC
    console.log('\nRunning RPC...');
    const { data: rpcData, error: rpcError } = await supabase.rpc('admin_get_security_metrics');
    if (rpcError) console.error('RPC Error:', rpcError);
    else console.log('RPC Result:', rpcData);
}

debugSessions();
