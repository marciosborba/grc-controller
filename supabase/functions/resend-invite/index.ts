// @ts-nocheck
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

async function sendInviteEmail(recipientEmail: string, recipientName: string, inviteLink: string) {
  const clientId = Deno.env.get("SENDPULSE_CLIENT_ID");
  const clientSecret = Deno.env.get("SENDPULSE_CLIENT_SECRET");
  const fromEmail = Deno.env.get("SENDPULSE_FROM_EMAIL") || "gepriv@gepriv.com";
  const templateIdStr = Deno.env.get("SENDPULSE_TEMPLATE_PASSWORD_RESET") || "79267";

  if (!clientId || !clientSecret) {
    console.warn("[WARN] SendPulse credentials missing — cannot send email.");
    return false;
  }

  const templateId = parseInt(templateIdStr);
  const accessToken = await getSendPulseToken(clientId, clientSecret);

  const res = await fetch("https://api.sendpulse.com/smtp/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
    body: JSON.stringify({
      email: {
        subject: "GEPRIV - Redefinição de Senha",
        template: {
          id: templateId,
          variables: {
            firstName: recipientName.split(" ")[0] || recipientName,
            inviteLink,
            senderName: "Segurança GEPRIV",
          },
        },
        from: { name: "GEPRIV", email: fromEmail },
        to: [{ name: recipientName, email: recipientEmail }],
      },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("[ERROR] SendPulse send failed:", errorText);
    throw new Error(`SendPulse send failed: ${errorText}`);
  }

  console.log(`[SUCCESS] Invite email sent to ${recipientEmail}`);
  return true;
}

Deno.serve(async (req) => {
  // Standard OPTIONS response for CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Validate caller
    const token = authHeader.replace('Bearer ', '');
    const supabaseAnon = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    const { data: { user }, error: userError } = await supabaseAnon.auth.getUser(token);
    if (userError || !user) throw new Error('Unauthorized');

    const { email, full_name } = await req.json();
    if (!email) throw new Error('email is required');

    const emailNorm = email.trim().toLowerCase();
    const displayName = full_name || emailNorm.split('@')[0];

    console.log(`[resend-invite] Processing request for: ${emailNorm}`);

    // Find user in Auth
    let existingUser = null;
    let page = 1;
    while (true) {
      const { data: { users: list }, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error || !list?.length) break;
      existingUser = list.find((u) => u.email?.toLowerCase() === emailNorm) || null;
      if (existingUser || list.length < 1000) break;
      page++;
    }

    if (!existingUser) {
      console.log(`[resend-invite] User ${emailNorm} not found in Auth.`);
      // Return 200 with success: false so the UI can show the custom message
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `O usuário ${emailNorm} não foi encontrado no sistema de autenticação. Ele provavelmente foi excluído ou ainda não foi convidado. Por favor, use o botão "Convidar Usuário" acima para criá-lo novamente.` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    if (existingUser.email_confirmed_at) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `O usuário ${emailNorm} já confirmou o e-mail e possui uma conta ativa. Se ele esqueceu a senha, ele deve usar a opção "Esqueci minha senha" na tela de login.` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Generate new invite link
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: 'invite',
      email: emailNorm,
      options: { redirectTo: RESET_URL }
    });

    if (linkErr) throw new Error(`Falha do Supabase ao gerar link: ${linkErr.message}`);

    const inviteLink = linkData?.properties?.action_link || null;
    if (!inviteLink) throw new Error('O link de convite não foi gerado pelo servidor.');

    // Send email
    await sendInviteEmail(emailNorm, displayName, inviteLink);

    console.log(`[resend-invite] Success: Email sent to ${emailNorm}`);

    return new Response(
      JSON.stringify({ success: true, message: `Convite reenviado para ${emailNorm}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    const errorMsg = error.message || 'Erro interno no servidor';
    console.error('[resend-invite] Error:', errorMsg);
    return new Response(
      JSON.stringify({ success: false, error: errorMsg }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
