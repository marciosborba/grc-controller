
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function verifyPrivacyMetrics() {
    console.log('Connecting to Supabase...');

    // Call the RPC
    const { data, error } = await supabase.rpc('calculate_privacy_metrics');

    if (error) {
        console.error('RPC Error:', error);
    } else {
        console.log('RPC Success! Metrics:');
        console.log(JSON.stringify(data, null, 2));

        // Validating specific keys for new cards
        const pendingDpias = data?.dpia_assessments?.pending_dpias;
        const processingActivities = data?.compliance_overview?.processing_activities;

        console.log('--------------------------------');
        console.log(`DPIAs Pendentes: ${pendingDpias} (Expected: number)`);
        console.log(`Atividades de Tratamento: ${processingActivities} (Expected: number)`);

        if (typeof pendingDpias === 'number' && typeof processingActivities === 'number') {
            console.log('✅ Data structure confirmed.');
        } else {
            console.log('❌ Data structure validation FAILED.');
            if (typeof processingActivities !== 'number') {
                console.log('NOTE: processing_activities might be missing or in different path.');
            }
        }
    }
}

verifyPrivacyMetrics();
