const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://myxvxponlmulnjstbjwd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyUpdate() {
    console.log('🚀 Verifying incident creation and update with new columns...');

    // 1. Create Incident
    const newIncident = {
        title: 'Test Incident ' + Date.now(),
        description: 'Testing persistence of new columns',
        type: 'malware',
        category: 'Segurança da Informação',
        severity: 'high',
        priority: 'critical',
        status: 'open',
        detection_date: new Date().toISOString(),
        affected_systems: ['System A', 'System B'],
        business_impact: 'High impact test',
        // Need valid IDs for reporter/assignee/tenant
        // We'll fetch them first
    };

    const incidentData = {
        ...newIncident,
        reporter_id: null,
        assignee_id: null,
        tenant_id: null
    };

    console.log('Creating incident with data:', incidentData);

    const { data: created, error: createError } = await supabase
        .from('incidents')
        .insert(incidentData)
        .select()
        .single();

    if (createError) {
        console.error('❌ Error creating incident:', createError);
        return;
    }

    console.log('✅ Incident created:', created.id);
    console.log('   Type:', created.type);
    console.log('   Severity:', created.severity);
    console.log('   Affected Systems:', created.affected_systems);

    // 2. Update Incident
    const updates = {
        severity: 'critical',
        business_impact: 'Updated impact',
        resolution_date: new Date().toISOString()
    };

    console.log('Updating incident with:', updates);

    const { data: updated, error: updateError } = await supabase
        .from('incidents')
        .update(updates)
        .eq('id', created.id)
        .select()
        .single();

    if (updateError) {
        console.error('❌ Error updating incident:', updateError);
        return;
    }

    console.log('✅ Incident updated:', updated.id);
    console.log('   Severity:', updated.severity);
    console.log('   Business Impact:', updated.business_impact);
    console.log('   Resolution Date:', updated.resolution_date);

    if (updated.severity === 'critical' && updated.business_impact === 'Updated impact' && updated.resolution_date) {
        console.log('✅ VERIFICATION SUCCESSFUL: Updates persisted correctly.');
    } else {
        console.error('❌ VERIFICATION FAILED: Updates did not persist correctly.');
    }

    // Cleanup
    await supabase.from('incidents').delete().eq('id', created.id);
}

verifyUpdate();
