/**
 * Test script: calls create-user-admin edge function directly
 * to diagnose the exact 400 error message.
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// We need a user JWT token - generate one using the admin API
async function run() {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Get a token by creating a short-lived link for the super admin
  // and simulating a login - we'll use service role to call the function
  // Actually, just call the function with a fake auth header won't work.
  // Instead, sign in with the superadmin credentials (from .env if present)

  // Use admin API to get a magic link for the super admin
  const adminEmail = 'adm@grc-controller.com';
  
  // Sign in using service role token via admin createToken
  const { data: sessionData, error: signInErr } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: adminEmail,
  });
  
  if (signInErr) {
    console.error('Error generating token:', signInErr.message);
    return;
  }
  
  console.log('Session user:', sessionData?.user?.id);
  
  // We need a real access token. Call with service role directly as a workaround.
  // Try calling the function with the user's JWT from Supabase exchange
  const { data: otp, error: otpErr } = await supabase.auth.admin.getUserById('0c5c1433-2682-460c-992a-f4cce57c0d6d');
  console.log('User exists:', !!otp?.user);
  
  // Actually call the function via fetch with service role key (to test)
  const testPayload = {
    email: 'test-create-' + Date.now() + '@test-domain.com',
    full_name: 'Test User Creation',
    system_role: 'user',
    tenant_id: '46b1c048-85a1-423b-96fc-776007c8de1f',
    roles: ['user'],
    send_invitation: false,  // no-invite mode to avoid email
  };
  
  // Call using service role (acts as admin)
  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-user-admin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify(testPayload),
  });
  
  const responseText = await response.text();
  console.log('Status:', response.status);
  console.log('Response:', responseText);
}

run().catch(console.error);
