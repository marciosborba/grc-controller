const url = "https://myxvxponlmulnjstbjwd.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

async function check() {
    const req = await fetch(`${url}/rest/v1/assessment_frameworks?limit=1`, {
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    });
    const data = await req.json();
    console.log('assessment_frameworks:', data.length > 0 ? Object.keys(data[0]) : "EMPTY");

    const req2 = await fetch(`${url}/rest/v1/vendor_assessment_frameworks?limit=1`, {
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    });
    const data2 = await req2.json();
    console.log('vendor_assessment_frameworks:', data2.length > 0 ? Object.keys(data2[0]) : "EMPTY");
}

check().catch(console.error);
