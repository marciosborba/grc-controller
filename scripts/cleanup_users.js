import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const emailsToDelete = [
  'ajuda@gepriv.com',
  'marcio@gepriv.com',
  'marcio.borba@gepriv.com',
  'notifications@gepriv.com'
];

async function cleanup() {
  console.log('Starting cleanup...');
  
  for (const email of emailsToDelete) {
    console.log(`Searching for user with email: ${email}`);
    
    // Search for user in Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error(`Error listing users: ${listError.message}`);
      continue;
    }
    
    const user = users.find(u => u.email === email);
    
    if (user) {
      console.log(`Found user ${user.id} for email ${email}. Deleting...`);
      
      // Delete from profiles (optional if cascade is set, but safer to do explicitly if needed)
      // Actually auth.users deletion usually cascades if configured, but let's check profiles too.
      await supabase.from('profiles').delete().eq('user_id', user.id);
      await supabase.from('vendor_users').delete().eq('email', email);
      await supabase.from('vendor_portal_users').delete().eq('email', email);
      
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteError) {
        console.error(`Error deleting user ${user.id}: ${deleteError.message}`);
      } else {
        console.log(`Successfully deleted user ${email}`);
      }
    } else {
      console.log(`User with email ${email} not found.`);
      // Just in case, try to delete from related tables by email
      await supabase.from('profiles').delete().eq('email', email);
      await supabase.from('vendor_users').delete().eq('email', email);
      await supabase.from('vendor_portal_users').delete().eq('email', email);
    }
  }
  
  console.log('Cleanup finished.');
}

cleanup();
