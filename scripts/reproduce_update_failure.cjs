const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://myxvxponlmulnjstbjwd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(supabaseUrl, supabaseKey);

const DatabaseManager = require('../database-manager.cjs');
const db = new DatabaseManager();

async function reproduceUpdate() {
    console.log('🚀 Attempting to reproduce update failure...');

    // 1. Get an existing incident using DatabaseManager (bypasses RLS)
    await db.connect();
    const result = await db.executeSQL("SELECT id, title, severity FROM incidents LIMIT 1", "Fetching incident");

    if (!result.rows || result.rows.length === 0) {
        console.error('❌ No incidents found in DB');
        return;
    }

    const incident = result.rows[0];
    console.log('Target Incident:', incident);

    // 2. Attempt to update severity using Supabase Client (subject to RLS)
    // Note: This will fail as anon, but we want to see the error code.
    const newSeverity = incident.severity === 'high' ? 'medium' : 'high';
    console.log(`Attempting to update severity from '${incident.severity}' to '${newSeverity}'...`);

    const { data: updated, error: updateError } = await supabase
        .from('incidents')
        .update({ severity: newSeverity })
        .eq('id', incident.id)
        .select()
        .single();

    if (updateError) {
        console.error('❌ Update failed:', updateError);
        // Check if it's an RLS error
        if (updateError.code === '42501') {
            console.error('   -> RLS Policy Violation (Permission Denied)');
        }
    } else {
        console.log('✅ Update successful:', updated);
        console.log('   New Severity:', updated.severity);
    }
}

reproduceUpdate();
