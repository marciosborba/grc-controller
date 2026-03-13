const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testLink() {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY, // Service role key
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const email = 'test-invite-' + Date.now() + '@gepriv.com';
    const redirect = 'https://app.gepriv.com/reset-password';

    console.log(`Generating invite link for ${email} with redirectTo: ${redirect}`);
    
    try {
        const { data, error } = await supabase.auth.admin.generateLink({
            type: 'invite',
            email: email,
            options: {
                redirectTo: redirect,
                data: {
                    full_name: 'Test Invite',
                    test_flag: true
                }
            }
        });

        if (error) {
            console.error('❌ Error generating link:', error);
            return;
        }

        console.log('✅ Link generated successfully:');
        console.log(data.properties.action_link);
        
        // Final cleanup of the test user
        console.log('Cleaning up test user...');
        await supabase.auth.admin.deleteUser(data.user.id);
        console.log('Done.');

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testLink();
