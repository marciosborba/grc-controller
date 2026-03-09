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
  // Use env var if set, otherwise fall back to the confirmed template ID 77996
  const templateIdStr = Deno.env.get("SENDPULSE_TEMPLATE_INVITE") || "77996";

  if (!clientId || !clientSecret) {
    console.warn("⚠️ SendPulse SENDPULSE_CLIENT_ID or SENDPULSE_CLIENT_SECRET missing. Skipping email sending.");
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
        subject: "Bem-vindo ao GRC Controller - Defina sua senha",
        template: {
          id: templateId,
          variables: {
            firstName: recipientName.split(" ")[0],
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
    console.error("❌ SendPulse send error:", errorText);
    throw new Error(`SendPulse send failed: ${errorText}`);
  }

  console.log(`✅ Invitation email sent via SendPulse to ${recipientEmail}`);
  return true;
}

interface CreateUserRequest {
  email: string;
  full_name: string;
  job_title?: string;
  department?: string;
  phone?: string;
  tenant_id: string;
  // System role: tenant_admin | admin | user | guest
  system_role?: string;
  roles: string[];
  // Custom tenant role ID from tenant_roles table
  tenant_role_id?: string;
  permissions?: string[];
  send_invitation?: boolean;
  must_change_password?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing authorization header')

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const token = authHeader.replace('Bearer ', '')
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token)
    if (userError || !user) throw new Error('Unauthorized')

    // Check permissions: platform admin or admin role
    const { data: platformAdmin } = await supabaseAdmin
      .from('platform_admins').select('user_id').eq('user_id', user.id).single()
    const isPlatformAdmin = !!platformAdmin

    if (!isPlatformAdmin) {
      const { data: userRoles } = await supabaseAdmin
        .from('user_roles').select('role').eq('user_id', user.id)
      const isAdmin = userRoles?.some(r => r.role === 'admin' || r.role === 'tenant_admin')
      if (!isAdmin) throw new Error('Sem permissão para criar usuários.')
    }

    const userData: CreateUserRequest = await req.json()
    const emailNorm = userData.email.trim().toLowerCase()

    // Determine effective tenant_id
    let targetTenantId = userData.tenant_id
    if (!isPlatformAdmin) {
      const { data: currentProfile } = await supabaseAdmin
        .from('profiles').select('tenant_id').eq('user_id', user.id).single()
      targetTenantId = currentProfile?.tenant_id
    }
    if (!targetTenantId) throw new Error('Tenant ID é obrigatório')

    // Determine system_role (default to 'user')
    const systemRole = userData.system_role || (userData.roles?.[0] as string) || 'user'

    // Check tenant user limit
    if (!isPlatformAdmin) {
      const { data: tenant, error: tenantError } = await supabaseAdmin
        .from('tenants').select('max_users, current_users_count').eq('id', targetTenantId).single()
      if (tenantError) throw new Error('Erro ao verificar limites do tenant')
      if (tenant.current_users_count >= tenant.max_users) {
        throw new Error(`Limite de usuários atingido (${tenant.max_users}).`)
      }
    }

    let userId: string | null = null
    let inviteLink: string | null = null

    if (userData.send_invitation !== false) {
      // ── Invite flow: generate a magic invite link (sends email via Supabase SMTP) ──
      console.log(`📧 Generating invite link for ${emailNorm}`)

      // Check if user already exists
      let existingUser = null
      let page = 1
      while (!existingUser) {
        const { data: { users: list }, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 })
        if (error || !list?.length) break
        existingUser = list.find(u => u.email?.toLowerCase() === emailNorm) || null
        if (list.length < 1000) break
        page++
      }

      if (existingUser && existingUser.email_confirmed_at) {
        throw new Error(`O usuário ${emailNorm} já possui conta ativa. Use "Editar" para alterar permissões.`)
      }

      const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
        type: 'invite',
        email: emailNorm,
        options: {
          redirectTo: RESET_URL,
          data: {
            full_name: userData.full_name,
            tenant_id: targetTenantId,
            system_role: systemRole,
          }
        }
      })
      if (linkErr) throw new Error(`Falha ao gerar convite: ${linkErr.message}`)
      inviteLink = linkData?.properties?.action_link || null
      userId = linkData?.user?.id || existingUser?.id || null
      console.log(`✅ Invite link generated for ${emailNorm}`)

    } else {
      // ── No-invite flow: create user directly with a temp password ──
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: emailNorm,
        email_confirm: true,
        user_metadata: { full_name: userData.full_name },
      })
      if (authError) throw authError
      userId = authData.user.id
    }

    // ── Save / update profile ──
    if (userId) {
      const profilePayload: Record<string, unknown> = {
        user_id: userId,
        email: emailNorm,
        full_name: userData.full_name,
        job_title: userData.job_title || null,
        department: userData.department || null,
        phone: userData.phone || null,
        tenant_id: targetTenantId,
        system_role: systemRole,
        is_active: false,
        must_change_password: true,
      }
      // Optional: attach custom tenant role
      if (userData.tenant_role_id) {
        profilePayload['tenant_role_id'] = userData.tenant_role_id
      }
      if (userData.permissions?.length) {
        profilePayload['permissions'] = userData.permissions
      }

      // Check if the profile was already created by the auth trigger
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (existingProfile) {
        // Trigger already created it (often with default or null tenant_id)
        const { error: profileErr } = await supabaseAdmin
          .from('profiles')
          .update(profilePayload)
          .eq('id', existingProfile.id)

        if (profileErr) console.error('Profile update error:', profileErr.message)
        else console.log(`✅ Profile updated for ${emailNorm} in tenant ${targetTenantId}`)
      } else {
        // Profile doesn't exist yet
        const { error: profileErr } = await supabaseAdmin
          .from('profiles')
          .insert([profilePayload])

        if (profileErr) console.error('Profile insert error:', profileErr.message)
        else console.log(`✅ Profile inserted for ${emailNorm} in tenant ${targetTenantId}`)
      }

      // ── Assign roles ──
      const rolesToAssign = userData.roles?.length ? userData.roles : [systemRole]
      for (const role of rolesToAssign) {
        await supabaseAdmin.from('user_roles').upsert(
          { user_id: userId, role, tenant_id: targetTenantId },
          { onConflict: 'user_id, role' }
        )
      }

      // ── Assign custom tenant role ──
      if (userData.tenant_role_id) {
        await supabaseAdmin.from('user_tenant_roles').upsert(
          { user_id: userId, tenant_role_id: userData.tenant_role_id, tenant_id: targetTenantId },
          { onConflict: 'user_id, tenant_role_id' }
        ).then(({ error }) => {
          // table may not exist — ignore error gracefully
          if (error) console.warn('user_tenant_roles upsert:', error.message)
        })
      }
    }

    // ── Activity log ──
    try {
      await supabaseAdmin.rpc('rpc_log_activity', {
        p_user_id: user.id,
        p_action: 'user_invited',
        p_resource_type: 'users',
        p_resource_id: userId,
        p_details: { email: emailNorm, system_role: systemRole, roles: userData.roles }
      })
    } catch { /* ignore log errors */ }

    // ── Send Email via SendPulse ──
    if (userData.send_invitation !== false && inviteLink) {
      try {
        await sendSendPulseInvite({
          recipientEmail: emailNorm,
          recipientName: userData.full_name,
          inviteLink: inviteLink,
          senderName: user.email?.split('@')[0] || "Administrador"
        });
      } catch (emailErr: any) {
        console.error("⚠️ Invite email failed to send, but user was created:", emailErr.message);
        // We don't fail the whole request if only the email fails, but we inform the user
      }
    }

    return new Response(
      JSON.stringify({ success: true, user: { id: userId, email: emailNorm }, inviteLink }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('create-user-admin error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})