import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RiskNotificationRequest {
  recipientName: string;
  recipientEmail: string;
  riskTitle: string;
  riskDescription?: string;
  riskLevel?: string;
  riskCategory?: string;
  senderName: string;
  notificationType?: 'RISK' | 'ACTION_PLAN';
  actionPlanTitle?: string;
  actionPlanDueDate?: string;
  customPortalUrl?: string; // invite link for new guest users
}

async function getSendPulseToken(clientId: string, clientSecret: string): Promise<string> {
  const response = await fetch("https://api.sendpulse.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret }),
  });
  if (!response.ok) throw new Error(`SendPulse auth failed: ${await response.text()}`);
  const data = await response.json();
  return data.access_token;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const {
      recipientName,
      recipientEmail,
      riskTitle,
      riskDescription,
      riskLevel,
      riskCategory,
      senderName,
      notificationType = 'RISK',
      actionPlanTitle,
      actionPlanDueDate,
      customPortalUrl,
    }: RiskNotificationRequest = await req.json();

    const clientId = Deno.env.get("SENDPULSE_CLIENT_ID")!;
    const clientSecret = Deno.env.get("SENDPULSE_CLIENT_SECRET")!;
    const fromEmail = Deno.env.get("SENDPULSE_FROM_EMAIL") || "gepriv@gepriv.com";
    const defaultPortalUrl = `${Deno.env.get("FRONTEND_URL") || "https://gepriv.com"}/risk-portal`;
    const portalUrl = customPortalUrl || defaultPortalUrl;
    const templateId = parseInt(Deno.env.get("SENDPULSE_TEMPLATE_RISK") || "77966");

    if (!clientId || !clientSecret) throw new Error("SENDPULSE credentials not configured.");

    const accessToken = await getSendPulseToken(clientId, clientSecret);

    const subject = notificationType === 'ACTION_PLAN'
      ? `Novo Plano de Acao: ${riskTitle}`
      : `Novo Risco Identificado: ${riskTitle}`;

    const riskColor = (['Muito Alto', 'Alto'].includes(riskLevel || '')) ? '#C0392B' : '#E67E22';
    const firstName = (recipientName || recipientEmail || '').split(' ')[0];

    // Variáveis que serão substituídas no template SendPulse (%variavel%)
    const templateVariables = {
      firstName: firstName,
      senderName: senderName,
      riskTitle: riskTitle,
      riskDescription: riskDescription || 'Sem descricao adicional.',
      riskLevel: riskLevel || 'Nao definido',
      riskCategory: riskCategory || 'Sem categoria',
      riskColor: riskColor,
      portalUrl: portalUrl,
      actionPlanTitle: actionPlanTitle || '',
      actionPlanDue: actionPlanDueDate || 'Nao definido',
    };

    const payload = {
      email: {
        subject,
        template: {
          id: templateId,
          variables: templateVariables,
        },
        from: { name: "GEPRIV", email: fromEmail },
        to: [{ name: recipientName || recipientEmail, email: recipientEmail }],
      },
    };

    console.log("📧 Enviando para:", recipientEmail);
    console.log("📋 Template ID:", templateId);
    console.log("🎨 Risk Color:", riskColor);

    const sendResponse = await fetch("https://api.sendpulse.com/smtp/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const sendResultText = await sendResponse.text();
    console.log("📬 SendPulse status:", sendResponse.status);
    console.log("📬 SendPulse response:", sendResultText);

    if (!sendResponse.ok) throw new Error(`SendPulse error: ${sendResultText}`);

    console.log("✅ Email enviado via template", templateId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("❌ Erro:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);