// @ts-nocheck
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'https://gepriv.com';
const RESET_URL = `${FRONTEND_URL}/reset-password`;
const RISK_PORTAL_URL = `${FRONTEND_URL}/risk-portal`;

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    try {
        const { email, full_name, tenant_id } = await req.json();

        if (!email || !tenant_id) {
            return new Response(JSON.stringify({ error: 'email and tenant_id are required' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        const emailNorm = email.trim().toLowerCase();

        // 1. Search for existing user
        let existingUser = null;
        let page = 1;
        const perPage = 1000;
        while (!existingUser) {
            const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
            if (error || !users || users.length === 0) break;
            existingUser = users.find(u => u.email?.toLowerCase() === emailNorm) || null;
            if (users.length < perPage) break;
            page++;
        }

        // 2. Existing confirmed user → check if they've already set a password
        if (existingUser && existingUser.email_confirmed_at) {
            const { data: profileRow } = await supabaseAdmin
                .from('profiles')
                .select('must_change_password')
                .eq('user_id', existingUser.id)
                .maybeSingle();

            const needsPassword = profileRow?.must_change_password === true;

            if (!needsPassword) {
                // Has password → just send them to login via portal URL
                console.log(`✅ User ${emailNorm} has password → returning portal link`);
                return new Response(JSON.stringify({
                    success: true,
                    isNewUser: false,
                    inviteLink: RISK_PORTAL_URL,
                    userId: existingUser.id,
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            // Confirmed but never set password → generate new recovery link
            console.log(`🔄 User ${emailNorm} confirmed but needs password → generating recovery link`);
            const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
                type: 'recovery',
                email: emailNorm,
                options: { redirectTo: RESET_URL },
            });
            if (linkErr) throw new Error(`generateLink failed: ${linkErr.message}`);
            const inviteLink = linkData?.properties?.action_link || null;
            console.log(`🔗 Recovery link generated for ${emailNorm}`);
            return new Response(JSON.stringify({
                success: true,
                isNewUser: true,
                inviteLink,
                userId: existingUser.id,
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // 3. New or unconfirmed user → create/confirm + generate recovery link
        let userId: string | null = existingUser?.id || null;

        if (!existingUser) {
            // Create new user with email already confirmed (no Supabase invite email sent)
            console.log(`🆕 Creating new confirmed user ${emailNorm}`);
            const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
                email: emailNorm,
                email_confirm: true,
                user_metadata: {
                    full_name: full_name || emailNorm,
                    tenant_id,
                    system_role: 'guest',
                    invited_as: 'risk_stakeholder',
                },
            });
            if (createErr) throw new Error(`Failed to create user: ${createErr.message}`);
            userId = newUser.user.id;
            console.log(`✅ User created: ${userId}`);
        } else {
            // Existing unconfirmed user → confirm their email so recovery link works
            console.log(`🔄 Confirming email for existing user ${emailNorm}`);
            await supabaseAdmin.auth.admin.updateUser(existingUser.id, { email_confirm: true });
        }

        // Generate a recovery link (fires PASSWORD_RECOVERY event — more reliable than invite)
        const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email: emailNorm,
            options: { redirectTo: RESET_URL },
        });
        if (linkErr) throw new Error(`generateLink failed: ${linkErr.message}`);

        const inviteLink = linkData?.properties?.action_link || null;
        console.log(`🔗 Recovery link generated for ${emailNorm}`);

        // 4. Upsert profile as guest
        if (userId) {
            const profilePayload = {
                user_id: userId,
                email: emailNorm,
                full_name: full_name || emailNorm,
                tenant_id,
                system_role: 'guest',
                is_active: true,
                must_change_password: true,
                override_risk_portal: true,
            };

            const { data: existingProfile } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .eq('user_id', userId)
                .single();

            if (existingProfile) {
                const { error: profileErr } = await supabaseAdmin
                    .from('profiles').update(profilePayload).eq('id', existingProfile.id);
                if (profileErr) console.error('Profile update error:', profileErr.message);
            } else {
                const { error: profileErr } = await supabaseAdmin
                    .from('profiles').insert([profilePayload]);
                if (profileErr) console.error('Profile insert error:', profileErr.message);
            }

            await supabaseAdmin.from('user_roles').upsert(
                { user_id: userId, role: 'user' },
                { onConflict: 'user_id, role' }
            ).then(({ error }) => {
                if (error) console.warn('Role upsert warn:', error.message);
            });
        }

        return new Response(JSON.stringify({
            success: true,
            isNewUser: true,
            inviteLink,
            userId,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (err: any) {
        console.error('invite-risk-stakeholder error:', err.message);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
