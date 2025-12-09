const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking incidents table schema...');

    // Try to select the new column from a single record
    const { data, error } = await supabase
        .from('incidents')
        .select('target_resolution_date')
        .limit(1);

    if (error) {
        console.error('Error selecting target_resolution_date:', error.message);
        if (error.message.includes('does not exist')) {
            console.log('CONCLUSION: The column "target_resolution_date" DOES NOT exist.');
        } else {
            console.log('CONCLUSION: Unknown error, possibly permissions or other issue.');
        }
    } else {
        console.log('Success! The column "target_resolution_date" exists.');
    }
}

checkSchema();
