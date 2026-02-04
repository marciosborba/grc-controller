
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyVendorRiskCRUD() {
    console.log('Starting Vendor Risk CRUD Verification...');

    // 1. Create a Test Vendor
    const { data: vendor, error: vendorError } = await supabase
        .from('vendor_registry')
        .insert({
            name: 'Audit Test Vendor',
            status: 'pending',
            criticality_level: 'medium',
            tenant_id: 'default' // Should use a real tenant ID in prod context
        })
        .select()
        .single();

    if (vendorError) {
        console.error('FAILED: Vendor Creation', vendorError);
        return;
    }
    console.log('SUCCESS: Vendor Created', vendor.id);

    // 2. Create Assessment Framework (Mock)
    // Assuming a framework exists or creating a simple one

    // 3. Create Assessment
    const { data: assessment, error: assessError } = await supabase
        .from('vendor_assessments')
        .insert({
            vendor_id: vendor.id,
            assessment_name: 'Audit Test Assessment',
            status: 'draft',
            priority: 'medium',
            assessment_type: 'initial', // Added required field
            tenant_id: 'default'
        })
        .select()
        .single();

    if (assessError) {
        console.error('FAILED: Assessment Creation', assessError);
    } else {
        console.log('SUCCESS: Assessment Created', assessment.id);
    }

    // 4. Cleanup
    if (assessment) {
        await supabase.from('vendor_assessments').delete().eq('id', assessment.id);
        console.log('CLEANUP: Assessment Deleted');
    }
    await supabase.from('vendor_registry').delete().eq('id', vendor.id);
    console.log('CLEANUP: Vendor Deleted');

    console.log('Verification Complete.');
}

// verifyVendorRiskCRUD();
