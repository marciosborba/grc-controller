
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

async function verifyMetrics() {
    console.log('Connecting to Supabase...');

    // Try to find a tenant from vendor_registry
    const { data: vendors } = await supabase.from('vendor_registry').select('tenant_id').limit(1);
    let tenantId = vendors?.[0]?.tenant_id;
    let createdMock = false;
    let mockVendorId;

    if (!tenantId) {
        console.log('No tenant found. Creating mock data...');
        // Create mock vendor to get a tenant (mocking a tenant ID here or using default)
        // Use a UUID for tenant to be safe if DB requires it, but usually 'default' works in some setups
        // We will try to find a user's tenant first from auth users, if not, generate one.

        // Actually, let's just use a random UUID for testing if allowed, or '11111111-1111-1111-1111-111111111111'
        const mockTenant = '11111111-1111-1111-1111-111111111111';

        const { data: v, error: vErr } = await supabase.from('vendor_registry').insert({
            name: 'Mock Verification Vendor',
            status: 'active',
            criticality_level: 'medium',
            business_category: 'Technology',
            vendor_type: 'operational',
            tenant_id: mockTenant
        }).select().single();

        if (vErr) {
            console.error('Failed to create mock vendor:', vErr);
            return;
        }

        tenantId = mockTenant;
        mockVendorId = v.id;
        createdMock = true;
        console.log('Created mock vendor:', v.id);

        // Create mock assessment
        await supabase.from('vendor_assessments').insert({
            vendor_id: v.id,
            assessment_name: 'Mock Assessment',
            status: 'in_progress',
            priority: 'high',
            tenant_id: mockTenant,
            start_date: new Date().toISOString()
        });
        console.log('Created mock assessment.');
    }

    console.log(`Testing metrics for tenant: ${tenantId}`);

    // Call the RPC
    const { data, error } = await supabase.rpc('get_vendor_dashboard_metrics', {
        tenant_uuid: tenantId
    });

    if (error) {
        console.error('RPC Error:', error);
    } else {
        console.log('RPC Success! Metrics:', data);

        // Verify specific counts manually
        const { count: pendingCount } = await supabase
            .from('vendor_assessments')
            .select('*', { count: 'exact', head: true })
            .in('status', ['draft', 'sent', 'in_progress', 'internal_review'])
            .eq('tenant_id', tenantId);

        console.log(`Manual Pending Count (Draft/Sent/InProgress/Review): ${pendingCount}`);
    }
}

verifyMetrics();
