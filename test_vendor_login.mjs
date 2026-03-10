// Test vendor login via Supabase Auth REST API
const SUPABASE_URL = 'https://myxvxponlmulnjstbjwd.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

const emails = [
    { email: 'teste5@teste.com', password: 'teste123' },
    { email: 'teste5@mail.com', password: 'teste123' },
];

async function testLogin(email, password) {
    console.log(`\nTesting login for: ${email}`);

    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': ANON_KEY,
        },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
        console.log('✅ Login SUCCESS! user_id:', data.user?.id);
    } else {
        console.log('❌ Login FAILED:', response.status, JSON.stringify(data));
    }
    return data;
}

// Try a few common passwords used during testing
const testPasswords = ['teste123', 'senha123', 'teste1234', '12345678'];

for (const email of ['teste5@teste.com', 'teste5@mail.com']) {
    for (const pwd of testPasswords) {
        const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY },
            body: JSON.stringify({ email, password: pwd })
        });
        const d = await res.json();
        if (res.ok) {
            console.log(`✅ ${email} / ${pwd} - LOGIN OK! user_id=${d.user?.id}`);
        } else {
            console.log(`❌ ${email} / ${pwd} - ${d.error_code || d.error}: ${d.msg || d.message || ''}`);
        }
    }
}
