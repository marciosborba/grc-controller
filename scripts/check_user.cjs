const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  'https://myxvxponlmulnjstbjwd.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const email = 'marcio@gepriv.com';
  const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) { console.error('Error listing users:', error); return; }
  
  const user = users.find(u => u.email?.toLowerCase() === email);
  if (user) {
    console.log('User found:', JSON.stringify({
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at
    }, null, 2));
  } else {
    console.log(`User ${email} NOT found in Auth. Needs to be invited fresh.`);
  }
}

check();
