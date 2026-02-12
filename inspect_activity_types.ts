
import { createClient } from '@supabase/supabase-js';

// Credentials from src/integrations/supabase/client.ts
const supabaseUrl = "https://myxvxponlmulnjstbjwd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectLogs() {
    console.log('Fetching activity types...');

    // Fetch a sample of logs to analyze 'action' types
    const { data, error } = await supabase
        .from('activity_logs')
        .select('action')
        .limit(1000);

    if (error) {
        console.error('Error fetching logs:', error);
        return;
    }

    // Count occurrences
    const counts: Record<string, number> = {};
    data.forEach((log: any) => {
        counts[log.action] = (counts[log.action] || 0) + 1;
    });

    console.log('Activity Actions found (Sample of 1000):');
    console.table(counts);
}

inspectLogs();
