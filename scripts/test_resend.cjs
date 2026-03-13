const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testResend() {
    const email = 'marcio@gepriv.com'; // We'll re-invite him for testing
    const tenantId = '6662705b-862d-4899-92c4-f3c05f0134f6'; // Generic tenant from previous logs if possible, or just grab one
    
    console.log(`Testing resend for ${email}...`);
    
    try {
        // 1. Create user first (if not exists)
        console.log('Ensuring user exists but unconfirmed...');
        const { data: userData, error: createError } = await supabase.auth.admin.createUser({
            email,
            email_confirm: false,
            user_metadata: { full_name: 'Marcio Test Resend' }
        });
        
        if (createError && !createError.message.includes('already registered')) {
            throw createError;
        }
        
        // 2. Try to invoke the function with resend: true
        console.log('Invoking create-user-admin with resend: true...');
        const { data, error } = await supabase.functions.invoke('create-user-admin', {
            body: {
                email,
                full_name: 'Marcio Test Resend',
                tenant_id: tenantId,
                system_role: 'admin',
                resend: true,
                send_invitation: true
            }
        });
        
        if (error) {
            console.error('Function Error:', error);
            // In Node.js, functions.invoke might return more details in the error object if it's a FetchError
            if (error.context) {
                const body = await error.context.text();
                console.error('Error Body:', body);
            }
        } else {
            console.log('Function Success:', data);
        }
    } catch (err) {
        console.error('Test failed:', err);
    }
}

testResend();
