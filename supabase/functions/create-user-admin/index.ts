import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'https://gepriv.com';
const RESET_URL = `${FRONTEND_URL}/reset-password`;

async function getSendPulseToken(clientId: string, clientSecret: string) {
  const res = await fetch("https://api.sendpulse.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret }),
  });
  if (!res.ok) throw new Error(`SendPulse Auth failed: ${await res.text()}`);
  return (await res.json()).access_token;
}

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
  const clientId = Deno.env.get("SENDPULSE_CLIENT_ID");
  const clientSecret = Deno.env.get("SENDPULSE_CLIENT_SECRET");
  const fromEmail = Deno.env.get("SENDPULSE_FROM_EMAIL") || "gepriv@gepriv.com";
  // Check both names as they might be defined differently in different environments
  const templateIdStr = Deno.env.get("SENDPULSE_TEMPLATE_INVITE") || Deno.env.get("SENDPULSE_TEMPLATE_ID");

  if (!clientId || !clientSecret) {
    throw new Error("Credenciais do SendPulse não configuradas no servidor (CLIENT_ID/SECRET).");
  }

  if (!templateIdStr) {
    throw new Error("Template Id do SendPulse (SENDPULSE_TEMPLATE_INVITE) não encontrado.");
  }

  const templateId = parseInt(templateIdStr);
  if (isNaN(templateId)) {
    throw new Error(`Template Id inválido: "${templateIdStr}"`);
  }

  console.log(`🔗 [EMAIL] Fetching SendPulse token for ${recipientEmail}...`);
  const accessToken = await getSendPulseToken(clientId, clientSecret);

  console.log(`✉️ [EMAIL] Sending email to ${recipientEmail} using template ${templateId}...`);
  const res = await fetch("https://api.sendpulse.com/smtp/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      email: {
        subject: "Bem-vindo ao GEPRIV - Defina sua senha",
        template: {
          id: templateId,
          variables: {
            firstName: recipientName.split(" ")[0] || recipientName,
            inviteLink: inviteLink,
            senderName: senderName || "Administrador",
          },
        },
        from: { name: "GEPRIV", email: fromEmail },
        to: [{ name: recipientName, email: recipientEmail }],
      },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ [EMAIL] SendPulse API error:", errorText);
    throw new Error(`API do SendPulse retornou erro: ${errorText}`);
  }

  console.log(`✅ [EMAIL] Invitation email sent successfully to ${recipientEmail}`);
  return true;
}

// Maps UI system_role values to valid app_role enum values in the database
function mapToAppRole(role: string): string {
  const mapping: Record<string, string> = {
    'tenant_admin': 'admin',
    'guest': 'user',
    'super_admin': 'admin', // Super admin UI label -> admin DB role for regular tenant assignment
  }
  return mapping[role] || role;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing authorization header')

    // Admin client (service role) – bypasses RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Validate the calling user token
    const token = authHeader.replace('Bearer ', '')
    const supabaseAnon = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )
    const { data: { user }, error: userError } = await supabaseAnon.auth.getUser(token)
    if (userError || !user) throw new Error('Unauthorized')

    // ── Determine caller's permission level ──────────────────────────────────
    const { data: callerRoles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    const callerRoleNames = (callerRoles || []).map((r: { role: string }) => r.role)
    const isSuperAdmin = callerRoleNames.includes('super_admin')
    const isAdmin = callerRoleNames.includes('admin') || callerRoleNames.includes('tenant_admin') || isSuperAdmin

    const { data: platformAdmin } = await supabaseAdmin
      .from('platform_admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()
    
    const isPlatformSuperAdmin = isSuperAdmin || !!platformAdmin

    if (!isAdmin) {
      throw new Error('Sem permissão para criar usuários.')
    }

    // ── Parse request body ───────────────────────────────────────────────────
    const userData = await req.json()
    const emailNorm = (userData.email || '').trim().toLowerCase()

    if (!emailNorm) throw new Error('Email é obrigatório')
    console.log(`📋 [LOG] userData received for ${emailNorm}:`, JSON.stringify(userData))

    // ── Determine effective tenant_id ────────────────────────────────────────
    let targetTenantId: string | null = null

    if (isPlatformSuperAdmin) {
      targetTenantId = userData.tenant_id || null
      console.log(`🔑 [SUPER_ADMIN] Using payload tenant_id: ${targetTenantId}`)
    } else {
      const { data: callerProfile } = await supabaseAdmin
        .from('profiles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single()
      targetTenantId = callerProfile?.tenant_id || null
      console.log(`👤 [REGULAR_ADMIN] Using caller profile tenant_id: ${targetTenantId}`)
    }

    if (!targetTenantId) {
      throw new Error('Tenant ID não encontrado.')
    }

    // ── Determine system_role ────────────────────────────────────────────────
    const systemRole = userData.system_role || 'user'
    const BLOCKED_ROLES = ['super_admin', 'platform_admin']
    if (BLOCKED_ROLES.includes(systemRole)) {
      throw new Error('A função Super Admin só pode ser atribuída em Configurações Globais.')
    }

    // ── Create user / generate invite link ───────────────────────────────────
    let userId: string | null = null
    let inviteLink: string | null = null

    if (userData.send_invitation !== false) {
      console.log(`📧 [INVITE] Starting link generation for ${emailNorm} (resend: ${!!userData.resend})`)
      let existingUser = null
      let page = 1
      while (true) {
        const { data: { users: list }, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 })
        if (error || !list?.length) break
        existingUser = list.find((u: { email?: string }) => u.email?.toLowerCase() === emailNorm) || null
        if (existingUser || list.length < 1000) break
        page++
      }

      if (existingUser && !userData.resend) {
        console.log(`⚠️ [INVITE] User ${emailNorm} already exists and not a resend request.`)
        if (existingUser.email_confirmed_at) {
          throw new Error('Este e-mail já está em uso por uma conta ativa.')
        }
        userId = existingUser.id
      } else {
        const isConfirmed = existingUser?.email_confirmed_at != null
        // If unconfirmed, 'invite' type is always best even if resending
        const type = (isConfirmed && userData.resend) ? 'recovery' : 'invite'
        
        console.log(`🔄 [INVITE] Generating link type "${type}" for ${emailNorm} (confirmed: ${isConfirmed})`)
        
        const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
          type: type as any,
          email: emailNorm,
          options: {
            redirectTo: RESET_URL,
            // Skip metadata if user exists to avoid conflicts
            data: existingUser ? undefined : {
              full_name: userData.full_name,
              tenant_id: targetTenantId,
              system_role: systemRole,
              custom_role_id: userData.tenant_role_id || null
            }
          }
        })

        if (linkErr) {
          console.error(`❌ [INVITE] generateLink error:`, linkErr)
          throw new Error(`Falha ao gerar link do Supabase: ${linkErr.message}`)
        }

        inviteLink = linkData?.properties?.action_link || null
        userId = linkData?.user?.id || existingUser?.id || userId || null
        
        console.log(`✅ [INVITE] Link generated: ${!!inviteLink}, userId: ${userId}`)
      }

    } else {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: emailNorm,
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name,
          tenant_id: targetTenantId,
          system_role: systemRole,
          custom_role_id: userData.tenant_role_id || null
        },
      })
      if (authError) throw authError
      userId = authData.user.id
    }

    // ── Upsert profile ───────────────────────────────────────────────────────
    if (userId) {
      const profilePayload: Record<string, any> = {
        id: userId,
        user_id: userId,
        email: emailNorm,
        full_name: userData.full_name,
        tenant_id: targetTenantId,
        system_role: systemRole,
        is_active: false,
        must_change_password: true,
        custom_role_id: userData.tenant_role_id || null
      }

      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      if (existingProfile?.id) {
        await supabaseAdmin.from('profiles').update(profilePayload).eq('id', existingProfile.id)
      } else {
        await supabaseAdmin.from('profiles').upsert(profilePayload, { onConflict: 'user_id' })
      }

      // ── Assign roles ──────────────────────────────────────────────────────
      const dbRole = mapToAppRole(systemRole)
      await supabaseAdmin.from('user_roles').delete().eq('user_id', userId).eq('tenant_id', targetTenantId)
      await supabaseAdmin.from('user_roles').upsert({ user_id: userId, role: dbRole, tenant_id: targetTenantId }, { onConflict: 'user_id, role' })

      if (userData.tenant_role_id) {
        await supabaseAdmin.from('user_tenant_roles').upsert(
          { user_id: userId, tenant_role_id: userData.tenant_role_id, tenant_id: targetTenantId },
          { onConflict: 'user_id, tenant_role_id' }
        )
      }
    }

    // ── Activity log & email ────────────────────────────────────────────────
    let emailSent = false;
    let emailError = null;

    try {
      await supabaseAdmin.rpc('rpc_log_activity', {
        p_user_id: user.id,
        p_action: 'user_invited',
        p_resource_type: 'users',
        p_resource_id: userId,
        p_details: { email: emailNorm, system_role: systemRole, tenant_id: targetTenantId, resend: !!userData.resend }
      })
    } catch { /* ignore */ }

    if (userData.send_invitation !== false && inviteLink) {
      try {
        emailSent = await sendSendPulseInvite({
          recipientEmail: emailNorm,
          recipientName: userData.full_name || emailNorm,
          inviteLink: inviteLink,
          senderName: user.email?.split('@')[0] || "Administrador"
        });
      } catch (err: any) {
        console.error("⚠️ [EMAIL] Failed to send invite:", err.message);
        emailError = err.message;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: { id: userId, email: emailNorm }, 
        emailSent,
        emailError,
        inviteLinkGenerated: !!inviteLink,
        debug: { systemRole, targetTenantId, resend: !!userData.resend }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    const errorMsg = error?.message || 'Erro desconhecido';
    console.error('❌ [CREATE-USER-ADMIN] Edge Function Error:', errorMsg);
    return new Response(
      JSON.stringify({ success: false, error: errorMsg }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})