const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    console.log('Checking assessment_frameworks...');

    // 1. Try to select just ID to see if table exists
    const { data: d1, error: e1 } = await supabase.from('assessment_frameworks').select('id').limit(1);
    if (e1) {
        console.error('Error selecting id:', e1);
    } else {
        console.log('Table exists. Row count sample:', d1.length);
    }

    // 2. Try to select is_standard
    console.log('Checking column is_standard...');
    const { data: d2, error: e2 } = await supabase.from('assessment_frameworks').select('id, is_standard').limit(1);
    if (e2) {
        console.error('Error selecting is_standard:', e2);
    } else {
        console.log('Column is_standard exists.', d2);
    }

    // 3. Try to select is_active (another one I used)
    console.log('Checking column is_active...');
    const { data: d3, error: e3 } = await supabase.from('assessment_frameworks').select('id, is_active').limit(1);
    if (e3) {
        console.error('Error selecting is_active:', e3);
    } else {
        console.log('Column is_active exists.');
    }
}

check();
