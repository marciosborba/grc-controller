const url = "https://myxvxponlmulnjstbjwd.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

async function check() {
    const req = await fetch(`${url}/rest/v1/vendor_assessments?select=id,assessment_name,created_at,metadata,responses&order=created_at.desc&limit=2`, {
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    });

    const assessments = await req.json();
    assessments.forEach(ass => {
        console.log(`\n--- Assessment: ${ass.assessment_name} ---`);
        console.log(`Created: ${ass.created_at}`);
        console.log(`Metadata Questions Count: ${ass.metadata?.questions?.length || 0}`);
        console.log(`Responses Count: ${ass.responses ? Object.keys(ass.responses).length : 0}`);
    });
}

check().catch(console.error);
