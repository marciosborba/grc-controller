const url = "https://myxvxponlmulnjstbjwd.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

async function check() {
    const req = await fetch(`${url}/rest/v1/vendor_assessments?select=id,assessment_name,metadata&order=created_at.desc&limit=1`, {
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    });

    const assessments = await req.json();
    const ass = assessments[0];
    console.log(`\n--- Assessment: ${ass.assessment_name} ---`);
    const qs = ass.metadata?.questions || [];
    qs.forEach((q, i) => {
        console.log(`Q${i + 1}: "${q.text || q.question}" - Type: ${q.type} - Required: ${q.required}`);
    });
}

check().catch(console.error);
