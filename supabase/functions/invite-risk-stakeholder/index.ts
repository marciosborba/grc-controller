// @ts-nocheck
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'https://app.gepriv.com';

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    try {
        const { email, full_name, tenant_id, resend } = await req.json();

        if (!email || !tenant_id) {
            return new Response(JSON.stringify({ error: 'email and tenant_id are required' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Admin client (service role)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        // 1. Check if user already exists in profiles
        const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('id, user_id, email, full_name, system_role')
            .eq('email', email.trim().toLowerCase())
            .eq('tenant_id', tenant_id)
            .maybeSingle();

        if (existingProfile?.user_id && !resend) {
            // User already has an account — just send notification link
            return new Response(JSON.stringify({ success: true, message: 'user_exists', user_id: existingProfile.user_id }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 2. Invite user via Supabase auth (sends magic link to set password)
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
            email.trim().toLowerCase(),
            {
                redirectTo: `${FRONTEND_URL}/risk-portal`,
                data: {
                    full_name: full_name || email,
                    tenant_id,
                    system_role: 'guest',
                    invited_as: 'risk_stakeholder',
                }
            }
        );

        if (inviteError) {
            // If user already exists in auth, just resend
            if (inviteError.message.includes('already been registered') || resend) {
                // Try to generate a password reset (re-invite)
                const { error: resetErr } = await supabaseAdmin.auth.admin.generateLink({
                    type: 'recovery',
                    email: email.trim().toLowerCase(),
                    options: { redirectTo: `${FRONTEND_URL}/risk-portal` }
                });
                if (resetErr) throw resetErr;
            } else {
                throw inviteError;
            }
        }

        const userId = inviteData?.user?.id;

        // 3. Upsert profile with system_role = 'guest'
        if (userId) {
            const { error: profileErr } = await supabaseAdmin
                .from('profiles')
                .upsert({
                    user_id: userId,
                    email: email.trim().toLowerCase(),
                    full_name: full_name || email,
                    tenant_id,
                    system_role: 'guest',
                    is_active: false, // Becomes active after first login
                }, { onConflict: 'user_id' });

            if (profileErr) console.error('Profile upsert error:', profileErr.message);

            // 4. Assign 'guest' role in user_roles
            const { error: roleErr } = await supabaseAdmin
                .from('user_roles')
                .upsert({ user_id: userId, role: 'user', tenant_id }, { onConflict: 'user_id,tenant_id' });

            if (roleErr) console.error('Role assignment error:', roleErr.message);
        } else if (!existingProfile) {
            // Create a pending profile (invite is queued by auth but no user_id yet)
            await supabaseAdmin.from('profiles').upsert({
                email: email.trim().toLowerCase(),
                full_name: full_name || email,
                tenant_id,
                system_role: 'guest',
                is_active: false,
            }, { onConflict: 'email,tenant_id' });
        }

        return new Response(JSON.stringify({ success: true, message: resend ? 'invite_resent' : 'invite_sent' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (err: any) {
        console.error('invite-risk-stakeholder error:', err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
