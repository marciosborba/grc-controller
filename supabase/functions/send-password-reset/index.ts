// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { sendTemplateEmail } from '../_shared/sendpulse.ts'

const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'https://gepriv.com';
const RESET_PASSWORD_URL = `${FRONTEND_URL}/reset-password`;

async function sendPasswordResetEmail(
  recipientEmail: string,
  recipientName: string,
  resetLink: string
): Promise<boolean> {
  return sendTemplateEmail({
    templateId: 79267,
    subject: "GEPRIV - Redefinição de Senha",
    recipientEmail,
    recipientName,
    variables: {
      firstName: recipientName.split(" ")[0] || recipientName,
      inviteLink: resetLink,
      senderName: "Segurança GEPRIV",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { email, redirectTo } = body;

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: 'email é obrigatório' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const emailNorm = email.trim().toLowerCase();
    const finalRedirectTo = redirectTo || RESET_PASSWORD_URL;

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verificar se o usuário existe
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
      // Por segurança, retornamos sucesso mesmo se o usuário não existir
      console.log(`[send-password-reset] User ${emailNorm} not found — returning silent success`);
      return new Response(
        JSON.stringify({ success: true, message: 'Se o e-mail estiver cadastrado, você receberá as instruções em breve.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Buscar nome do perfil
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('user_id', existingUser.id)
      .single();

    const recipientName = profile?.full_name || emailNorm.split('@')[0];

    // Gerar link de recovery via admin API
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: emailNorm,
      options: { redirectTo: finalRedirectTo },
    });

    if (linkErr) throw new Error(`Falha ao gerar link de recuperação: ${linkErr.message}`);

    const resetLink = linkData?.properties?.action_link;
    if (!resetLink) throw new Error('Link de recuperação não gerado pelo servidor.');

    // Enviar via SendPulse com template 79267
    await sendPasswordResetEmail(emailNorm, recipientName, resetLink);

    console.log(`[send-password-reset] Reset email sent to ${emailNorm}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Se o e-mail estiver cadastrado, você receberá as instruções em breve.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    const errorMsg = error.message || 'Erro interno no servidor';
    console.error('[send-password-reset] Error:', errorMsg);
    return new Response(
      JSON.stringify({ success: false, error: errorMsg }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
