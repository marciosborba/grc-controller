const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RianciLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM2ODY3MTk3LCJleHAiOjIwNTI0NDMxOTd9.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDeadlineSave() {
    console.log('Debugging deadline save...');

    // 1. Get an existing incident
    const { data: incidents, error: fetchError } = await supabase
        .from('incidents')
        .select('id, title, target_resolution_date')
        .limit(1);

    if (fetchError) {
        console.error('Error fetching incident:', fetchError);
        return;
    }

    let incident;
    if (!incidents || incidents.length === 0) {
        console.log('No incidents found. Creating one...');
        const { data: newIncident, error: createError } = await supabase
            .from('incidents')
            .insert({
                title: 'Test Incident for Deadline',
                description: 'Created by debug script',
                status: 'open',
                severity: 'low',
                priority: 'low',
                type: 'security_breach',
                category: 'Segurança da Informação',
                tenant_id: '46b1c048-85a1-423b-96fc-776007c8de1f' // Using GRC-Controller tenant ID from db.md
            })
            .select()
            .single();

        if (createError) {
            console.error('Error creating incident:', createError);
            return;
        }
        incident = newIncident;
    } else {
        incident = incidents[0];
    }
    console.log('Found incident:', incident);

    // 2. Try to update target_resolution_date
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 7); // 7 days from now
    const isoDate = newDate.toISOString();

    console.log(`Attempting to update target_resolution_date to: ${isoDate}`);

    const { data: updated, error: updateError } = await supabase
        .from('incidents')
        .update({ target_resolution_date: isoDate })
        .eq('id', incident.id)
        .select()
        .single();

    if (updateError) {
        console.error('Error updating incident:', updateError);
    } else {
        console.log('Update successful!');
        console.log('Updated incident:', updated);

        if (updated.target_resolution_date === isoDate) {
            console.log('VERIFICATION: Date matches!');
        } else {
            console.log(`VERIFICATION: Date mismatch! Expected ${isoDate}, got ${updated.target_resolution_date}`);
        }
    }
}

debugDeadlineSave();
