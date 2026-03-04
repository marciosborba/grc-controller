const url = "https://myxvxponlmulnjstbjwd.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

async function check() {
    const req = await fetch(`${url}/rest/v1/vendor_assessments?select=id,created_at,framework_id,metadata,responses&order=created_at.desc&limit=3`, {
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    });

    const assessments = await req.json();

    for (const a of assessments) {
        console.log(`\n--- Assessment ID: ${a.id} ---`);
        console.log(`Created At: ${a.created_at}`);
        console.log(`Framework ID: ${a.framework_id}`);

        const hasQuestions = a.metadata && a.metadata.questions && Array.isArray(a.metadata.questions) && a.metadata.questions.length > 0;
        console.log(`Has Metadata Questions: ${hasQuestions ? a.metadata.questions.length : 'NO'}`);
        console.log(`Vendor Framework Name: ${a.metadata?.vendor_framework_name || 'N/A'}`);

        const r = a.responses || {};
        const keys = Object.keys(r);
        console.log(`Responses Count: ${keys.length}`);
    }
}

check().catch(console.error);
