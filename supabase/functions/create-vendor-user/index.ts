// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'https://gepriv.com';
// Vendor portal first-access link
const VENDOR_RESET_URL = `${FRONTEND_URL}/reset-password`;

async function getSendPulseToken(clientId: string, clientSecret: string) {
    const res = await fetch("https://api.sendpulse.com/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret }),
    });
    if (!res.ok) throw new Error(`SendPulse Auth failed: ${await res.text()}`);
    return (await res.json()).access_token;
}

async function sendVendorInviteEmail(recipientEmail: string, recipientName: string, inviteLink: string) {
    const clientId = Deno.env.get("SENDPULSE_CLIENT_ID");
    const clientSecret = Deno.env.get("SENDPULSE_CLIENT_SECRET");
    const fromEmail = Deno.env.get("SENDPULSE_FROM_EMAIL") || "gepriv@gepriv.com";
    const templateIdStr = "79283"; // Template fixo: Portal de Fornecedores (TPRM)

    if (!clientId || !clientSecret) {
        console.warn("[WARN] SendPulse config missing — skipping vendor invite email.");
        return false;
    }

    const templateId = parseInt(templateIdStr);
    const accessToken = await getSendPulseToken(clientId, clientSecret);

    const res = await fetch("https://api.sendpulse.com/smtp/emails", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            email: {
                subject: "Bem-vindo ao Portal do Fornecedor GEPRIV - Defina sua senha",
                template: {
                    id: templateId,
                    variables: {
                        firstName: recipientName.split(" ")[0] || recipientName,
                        inviteLink: inviteLink,
                        senderName: "Equipe GEPRIV",
                    },
                },
                from: { name: "GEPRIV", email: fromEmail },
                to: [{ name: recipientName, email: recipientEmail }],
            },
        }),
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error("[ERROR] SendPulse vendor invite error:", errorText);
        throw new Error(`SendPulse send failed: ${errorText}`);
    }

    console.log(`[SUCCESS] Vendor invite email sent to ${recipientEmail}`);
    return true;
}

interface CreateVendorUserRequest {
    email: string;
    name: string;
    vendor_id: string;
    tenant_id?: string | null;
    // Legacy fields (kept for backwards compatibility, but ignored)
    password?: string;
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('Missing authorization header')
        }

        // Admin client with service role key
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        // Validate the calling user is authenticated
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(
            authHeader.replace('Bearer ', '')
        )
        if (userError || !user) {
            throw new Error('Unauthorized')
        }

        const body: CreateVendorUserRequest = await req.json()
        const { email, name, vendor_id, tenant_id } = body

        if (!email || !vendor_id) {
            throw new Error('email and vendor_id are required')
        }
        const emailNorm = email.trim().toLowerCase();

        // Check if user already exists in Auth
        let existingUser = null;
        let page = 1;
        while (!existingUser) {
            const { data: { users: list }, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
            if (error || !list?.length) break;
            existingUser = list.find(u => u.email?.toLowerCase() === emailNorm) || null;
            if (list.length < 1000) break;
            page++;
        }

        if (existingUser && existingUser.email_confirmed_at) {
            throw new Error(`O e-mail ${emailNorm} já possui uma conta ativa no sistema.`);
        }

        // Generate an invite link — vendor sets their own password on first access
        console.log(`[INFO] Generating vendor invite link for ${emailNorm}`);
        const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
            type: 'invite',
            email: emailNorm,
            options: {
                redirectTo: VENDOR_RESET_URL,
                data: {
                    name: name || emailNorm,
                    is_vendor: true,
                    vendor_id,
                }
            }
        });
        if (linkErr) throw new Error(`Falha ao gerar convite: ${linkErr.message}`);

        const inviteLink = linkData?.properties?.action_link || null;
        const authUserId = linkData?.user?.id || existingUser?.id || null;
        console.log(`[SUCCESS] Invite link generated for vendor ${emailNorm}`);

        if (!authUserId) throw new Error('Falha ao obter ID do usuário após geração do convite.');

        // Upsert vendor_users
        const { error: vuErr } = await supabaseAdmin.from('vendor_users').upsert({
            vendor_id,
            auth_user_id: authUserId,
            email: emailNorm,
            name: name || 'Fornecedor',
            role: 'vendor_admin',
            is_active: true
        }, { onConflict: 'vendor_id,email' });
        if (vuErr) console.error('[WARN] vendor_users upsert:', vuErr.message);

        // Upsert vendor_portal_users (no password, no force_password_change needed with invite flow)
        const { error: vpuErr } = await supabaseAdmin.from('vendor_portal_users').upsert({
            vendor_id,
            email: emailNorm,
            tenant_id: tenant_id || null,
            force_password_change: false,
        }, { onConflict: 'email' });
        if (vpuErr) console.error('[WARN] vendor_portal_users upsert:', vpuErr.message);

        // Send invite email via SendPulse
        if (inviteLink) {
            try {
                await sendVendorInviteEmail(emailNorm, name || emailNorm, inviteLink);
            } catch (emailErr: any) {
                // Don't fail the request if email fails — user is created
                console.error('[WARN] Vendor invite email failed:', emailErr.message);
            }
        }

        return new Response(
            JSON.stringify({ success: true, user_id: authUserId, inviteLink }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        console.error('Error in create-vendor-user:', error)
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
