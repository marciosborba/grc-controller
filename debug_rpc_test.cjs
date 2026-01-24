const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Env Check:', {
    url: supabaseUrl ? 'FOUND' : 'MISSING',
    key: supabaseKey ? 'FOUND' : 'MISSING'
});

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRpc() {
    console.log('🔍 Testing get_database_size RPC...');

    // 1. Test as Service Role
    const { data, error } = await supabase.rpc('get_database_size');

    console.log('--- Service Role Result ---');
    console.log('Error:', error);
    console.log('Data:', data);
    console.log('Type:', typeof data);

    // 2. Test via SQL fallback (Direct Query)
    console.log('\n🔍 Testing Direct SQL via Service Role...');
    const { data: sqlData, error: sqlError } = await supabase
        .from('pg_database')
        .select('name'); // Just to see connection

    console.log('SQL Check:', sqlError ? 'FAIL' : 'OK');
}

testRpc();
