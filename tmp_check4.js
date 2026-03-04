const url = "https://myxvxponlmulnjstbjwd.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

async function check() {
    const req = await fetch(`${url}/rest/v1/vendor_assessment_frameworks?limit=1`, {
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    });

    const fws = await req.json();
    if (fws.length > 0) {
        console.log('Columns available in vendor_assessment_frameworks:');
        console.log(Object.keys(fws[0]).join(', '));
    }
}

check().catch(console.error);
