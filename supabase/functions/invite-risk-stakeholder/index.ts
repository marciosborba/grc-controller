// @ts-nocheck
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'https://gepriv.com';
// Invite link goes to /reset-password so the new user creates their password first
// ResetPasswordPage detects type=invite and redirects to /risk-portal after setup
const RESET_URL = `${FRONTEND_URL}/reset-password`;
const PORTAL_URL = `${FRONTEND_URL}/risk-portal`;

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

        // 1. Search for existing user with pagination to ensure we find them
        let existingUser = null;
        let page = 1;
        const perPage = 1000;
        while (!existingUser) {
            const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
                page,
                perPage,
            });
            if (error || !users || users.length === 0) break;
            existingUser = users.find(u => u.email?.toLowerCase() === emailNorm) || null;
            if (users.length < perPage) break; // last page
            page++;
        }

        // 2. If user exists AND their email is confirmed → they have an account, use direct portal link
        if (existingUser && existingUser.email_confirmed_at) {
            console.log(`✅ User ${emailNorm} already has confirmed account → direct portal link`);
            return new Response(JSON.stringify({
                success: true,
                isNewUser: false,
                inviteLink: null,
                userId: existingUser.id,
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // 3. User doesn't exist OR exists but never confirmed → generate invite/recovery link
        let inviteLink: string | null = null;
        let userId: string | null = existingUser?.id || null;

        if (existingUser && !existingUser.email_confirmed_at) {
            // User was invited before but never set up → generate a new invite link
            console.log(`🔄 User ${emailNorm} exists but unconfirmed → regenerating invite link`);
            const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
                type: 'invite',
                email: emailNorm,
                options: { redirectTo: RESET_URL }
            });
            if (linkErr) {
                console.error('generateLink error (existing unconfirmed):', linkErr.message);
                throw new Error(`generateLink failed: ${linkErr.message}`);
            }
            inviteLink = linkData?.properties?.action_link || null;
        } else {
            // Completely new user → generate invite link
            console.log(`🆕 New user ${emailNorm} → generating invite link`);
            const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
                type: 'invite',
                email: emailNorm,
                options: {
                    redirectTo: RESET_URL,
                    data: {
                        full_name: full_name || emailNorm,
                        tenant_id,
                        system_role: 'guest',
                        invited_as: 'risk_stakeholder',
                    }
                }
            });
            if (linkErr) throw new Error(`generateLink failed: ${linkErr.message}`);
            inviteLink = linkData?.properties?.action_link || null;
            userId = linkData?.user?.id || null;
        }

        console.log(`🔗 Invite link generated for ${emailNorm}: ${inviteLink?.substring(0, 80)}...`);

        // 4. Always upsert profile as guest — ensures tenant_id and system_role are always set
        // (Auth trigger may create a profile with null tenant_id before we can set it)
        if (userId) {
            const { error: profileErr } = await supabaseAdmin.from('profiles').upsert({
                user_id: userId,
                email: emailNorm,
                full_name: full_name || emailNorm,
                tenant_id,
                system_role: 'guest',
                is_active: false,
            }, { onConflict: 'user_id' });
            if (profileErr) console.error('⚠️ Profile upsert error:', profileErr.message);
            else console.log(`✅ Profile upserted for guest ${emailNorm} in tenant ${tenant_id}`);

            // Insert role so they appear in User Management
            await supabaseAdmin.from('user_roles').upsert({
                user_id: userId,
                role: 'guest',
                tenant_id,
            }, { onConflict: 'user_id, role' }).then(({ error }) => {
                if (error) console.warn('⚠️ Role upsert warn:', error.message);
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
