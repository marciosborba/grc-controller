const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://myxvxponlmulnjstbjwd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
    console.log('Testing query with explicit FK name...');

    const { data, error } = await supabase
        .from('incidents')
        .select(`
      id,
      title,
      reporter:profiles!incidents_reporter_id_fkey(email, id),
      assignee:profiles!incidents_assignee_id_fkey(email, id)
    `)
        .limit(1);

    if (error) {
        console.error('❌ Error with explicit FK name:', error);
    } else {
        console.log('✅ Success with explicit FK name:', data);
        return;
    }

    console.log('\nTesting query with column name hint...');
    const { data: data2, error: error2 } = await supabase
        .from('incidents')
        .select(`
      id,
      title,
      reporter:profiles!reporter_id(email, id),
      assignee:profiles!assignee_id(email, id)
    `)
        .limit(1);

    if (error2) {
        console.error('❌ Error with column name hint:', error2);
    } else {
        console.log('✅ Success with column name hint:', data2);
    }
}

testQuery();
