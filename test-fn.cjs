require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing env vars');
  process.exit(1);
}

const payload = {
  email: 'test-user-' + Date.now() + '@testdomain123.com',
  full_name: 'Test Creation User',
  system_role: 'user',
  tenant_id: '46b1c048-85a1-423b-96fc-776007c8de1f',
  roles: ['user'],
  send_invitation: false,
};

console.log('Calling edge function with payload:', payload);

fetch(`${SUPABASE_URL}/functions/v1/create-user-admin`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SERVICE_KEY}`,
  },
  body: JSON.stringify(payload),
})
.then(async res => {
  const text = await res.text();
  console.log('Status:', res.status);
  try {
    const json = JSON.parse(text);
    console.log('Response:', JSON.stringify(json, null, 2));
  } catch {
    console.log('Raw response:', text);
  }
})
.catch(err => console.error('Fetch error:', err));
