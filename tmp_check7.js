const url = "https://myxvxponlmulnjstbjwd.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

async function check() {
    const req = await fetch(`${url}/rest/v1/vendor_assessments?select=id,public_link,metadata&order=created_at.desc&limit=1`, {
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    });

    const assessments = await req.json();
    const link = assessments[0].public_link;
    const vendorFwId = assessments[0].metadata?.vendor_framework_id;
    console.log(`Public Link: ${link}`);
    console.log(`Vendor FW ID: ${vendorFwId}`);

    if (link) {
        const rpcReq = await fetch(`${url}/rest/v1/rpc/get_public_assessment_data`, {
            method: 'POST',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ p_link: link })
        });
        const rpcData = await rpcReq.json();
        console.log('RPC Data:', JSON.stringify(rpcData, null, 2));
    }
}

check().catch(console.error);
