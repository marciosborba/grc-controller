const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://myxvxponlmulnjstbjwd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RianciLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM2ODY3MTk3LCJleHAiOjIwNTI0NDMxOTd9.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8";

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
        tenant_id: '46b1c048-85a1-423b-96fc-776007c8de1f' // GRC-Controller tenant
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
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 5);
    const targetDateIso = targetDate.toISOString();

    const updates = {
        severity: 'critical',
        business_impact: 'Updated impact',
        resolution_date: new Date().toISOString(),
        target_resolution_date: targetDateIso
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
    console.log('   Target Resolution Date:', updated.target_resolution_date);

    if (updated.severity === 'critical' &&
        updated.business_impact === 'Updated impact' &&
        updated.resolution_date &&
        updated.target_resolution_date === targetDateIso) {
        console.log('✅ VERIFICATION SUCCESSFUL: Updates persisted correctly.');
    } else {
        console.error('❌ VERIFICATION FAILED: Updates did not persist correctly.');
        console.log(`Expected target_resolution_date: ${targetDateIso}`);
        console.log(`Actual target_resolution_date: ${updated.target_resolution_date}`);
    }

    // Cleanup
    await supabase.from('incidents').delete().eq('id', created.id);
}

verifyUpdate();
