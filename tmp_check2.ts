const url = "https://myxvxponlmulnjstbjwd.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

async function check() {
    const req = await fetch(`${url}/rest/v1/vendor_assessments?select=*&order=created_at.desc&limit=3`, {
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    });

    const assessments = await req.json();

    if (assessments.error) {
        console.error('Error fetching assessments:', assessments.error);
        return;
    }

    for (const a of assessments) {
        console.log(`\n--- Assessment ${a.id} ---`);
        console.log(`Framework ID: ${a.framework_id}`);
        // Truncate metadata if it's too big
        const md = JSON.stringify(a.metadata) || '';
        console.log(`Metadata length: ${md.length}`);
        if (a.metadata && a.metadata.questions) {
            console.log(`Metadata questions count: ${a.metadata.questions.length}`);
            const sampleIds = a.metadata.questions.slice(0, 3).map((q: any) => q.id);
            console.log(`Sample Question IDs from Metadata: ${sampleIds.join(', ')}`);
        } else {
            console.log(`Metadata questions: NONE`);
        }

        const r = a.responses || {};
        const keys = Object.keys(r);
        console.log(`Responses Keys: ${keys.join(', ')}`);
        console.log(`Responses Count: ${keys.length}`);

        if (keys.length > 0) {
            console.log(`Sample Responses:`);
            for (const k of keys.slice(0, 3)) {
                console.log(`  ${k}: ${r[k]}`);
            }
        }
    }
}

check().catch(console.error);
