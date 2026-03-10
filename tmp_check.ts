import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: 'src/.env' }); // or whichever path has the env vars
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: assessments, error } = await supabase
        .from('vendor_assessments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

    if (error) {
        console.error('Error fetching assessments:', error);
        return;
    }

    for (const a of assessments) {
        console.log(`\n--- Assessment ${a.id} ---`);
        console.log(`Framework ID: ${a.framework_id}`);
        console.log(`Metadata: ${JSON.stringify(a.metadata)}`);
        console.log(`Responses Keys: ${Object.keys(a.responses || {}).join(', ')}`);
        const r = a.responses || {};
        // Pick a response
        for (const k of Object.keys(r)) {
            console.log(`  ${k}: ${r[k]}`);
        }
    }
}

check();
