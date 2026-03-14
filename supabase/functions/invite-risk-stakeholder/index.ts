// @ts-nocheck
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendTemplateEmail } from '../_shared/sendpulse.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'https://gepriv.com';
const RESET_URL = `${FRONTEND_URL}/reset-password`;

async function sendSendPulseInvite({
  recipientEmail,
  recipientName,
  inviteLink,
  senderName
}: {
  recipientEmail: string;
  recipientName: string;
  inviteLink: string;
  senderName: string;
}) {
  return sendTemplateEmail({
    templateId: 77966,
    subject: "Bem-vindo ao Portal de Riscos - Defina sua senha",
    recipientEmail,
    recipientName,
    variables: {
      firstName: recipientName.split(" ")[0] || recipientName,
      inviteLink,
      senderName: senderName || "Equipe GEPRIV",
    },
  });
}

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

        // 4. Upsert profile as guest — ensure tenant_id and system_role are always set
        if (userId) {
            // Check if profile already exists (may have been created by Auth trigger with wrong tenant)
            const { data: existingProfile } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .eq('user_id', userId)
                .single();

            const profilePayload = {
                user_id: userId,
                email: emailNorm,
                full_name: full_name || emailNorm,
                tenant_id,
                system_role: 'guest',
                is_active: false,
                must_change_password: true,
                override_risk_portal: true, // Garante acesso ao portal mesmo que o módulo global esteja desativado
            };

            if (existingProfile) {
                const { error: profileErr } = await supabaseAdmin
                    .from('profiles')
                    .update(profilePayload)
                    .eq('id', existingProfile.id);
                if (profileErr) console.error('Profile update error:', profileErr.message);
                else console.log(`Profile updated for guest ${emailNorm} in tenant ${tenant_id}`);
            } else {
                const { error: profileErr } = await supabaseAdmin
                    .from('profiles')
                    .insert([profilePayload]);
                if (profileErr) console.error('Profile insert error:', profileErr.message);
                else console.log(`Profile inserted for guest ${emailNorm} in tenant ${tenant_id}`);
            }

            // Assign 'user' role in user_roles (app_role enum does not have 'guest')
            // 'guest' is tracked via profiles.system_role only
            await supabaseAdmin.from('user_roles').upsert(
                { user_id: userId, role: 'user' },
                { onConflict: 'user_id, role' }
            ).then(({ error }) => {
                if (error) console.warn('Role upsert warn:', error.message);
            });
        }

        // Responde ao frontend imediatamente — e-mail é disparado em background
        if (inviteLink) {
            sendSendPulseInvite({
                recipientEmail: emailNorm,
                recipientName: full_name || emailNorm,
                inviteLink: inviteLink,
                senderName: "Equipe GEPRIV"
            }).catch((emailErr: any) =>
                console.error("⚠️ Invite email failed to send, but user was created:", emailErr.message)
            );
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
