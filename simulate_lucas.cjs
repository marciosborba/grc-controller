const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function simulate() {
  console.log('1. Signing in as Lucas...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'lucas.alcantara@gepriv.com',
    password: 'Password123!', // Assumed password used for testing
  });

  if (authError) {
    console.error('Cannot login as Lucas:', authError.message);
    return;
  }
  
  console.log('Login successful. UID:', authData.user.id);

  console.log('\\n2. Calling check_is_vendor...');
  const { data: status, error: rpcError } = await supabase.rpc('check_is_vendor', {
      check_uid: authData.user.id,
      check_email: authData.user.email
  });
  
  console.log('check_is_vendor output:', status);
  if (rpcError) console.error('RPC Error:', rpcError);

  console.log('\\n3. Calling get_user_complete_profile...');
  const { data: profile, error: profError } = await supabase.rpc('get_user_complete_profile');
  if (profError) {
      console.error('Profile Error:', profError.message);
  } else {
      console.log('Profile output keys:', profile ? Object.keys(profile) : profile);
      console.log('Profile is_active:', profile?.is_active);
      console.log('Profile status:', profile?.status);
  }

  // Cleanup session
  await supabase.auth.signOut();
}

simulate();
