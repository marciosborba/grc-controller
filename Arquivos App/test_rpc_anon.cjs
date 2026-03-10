
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = "https://myxvxponlmulnjstbjwd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

if (!supabaseUrl || !supabaseAnonKey) {
    process.exit(1);
}

console.log('🔗 Connecting to Supabase as ANON:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRpc() {
    console.log('⚡ Calling log_activity RPC as ANON with Auto-IP capture...');

    const { data, error } = await supabase.rpc('log_activity', {
        p_action: 'test_ip_capture',
        p_resource_type: 'auth',
        p_details: { source: 'test_script' },
        p_user_id: null,
        p_resource_id: null,
        p_ip_address: null
    });

    if (error) {
        console.error('❌ RPC Failed:', error);
    } else {
        console.log('✅ RPC Success! Data:', data);
    }
}

testRpc();
