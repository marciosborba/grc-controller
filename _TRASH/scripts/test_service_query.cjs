const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://myxvxponlmulnjstbjwd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
    console.log('Testing service query...');

    const { data, error } = await supabase
        .from('incidents')
        .select(`
      *,
      reporter:profiles!incidents_reporter_id_fkey(email, id),
      assignee:profiles!incidents_assignee_id_fkey(email, id)
    `)
        .limit(5);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Data returned:', data.length);
    if (data.length > 0) {
        console.log('First item severity:', data[0].severity);
        console.log('First item type:', data[0].type);
        console.log('First item keys:', Object.keys(data[0]));
    }
}

testQuery();
