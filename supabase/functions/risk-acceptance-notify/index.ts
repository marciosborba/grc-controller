// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { sendTemplateEmail } from "../_shared/sendpulse.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApprovalRequest {
  approverName: string;
  approverEmail: string;
  riskTitle: string;
  riskLevel: string;
  riskCategory: string;
  riskDescription: string;
  senderName: string;
  acceptanceType: string; // 'temporario' | 'definitivo'
  justification: string;
  riskId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body: ApprovalRequest = await req.json();
    const {
      approverName,
      approverEmail,
      riskTitle,
      riskLevel,
      riskCategory,
      riskDescription,
      senderName,
      acceptanceType,
      justification,
      riskId,
    } = body;

    const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://gepriv.com";
    const approvalUrl = `${frontendUrl}/risks?highlight=${riskId}`;

    await sendTemplateEmail({
      templateId: 79413,
      subject: "Carta de Risco - Sua Aprovação é Necessária para um Aceite de Risco",
      recipientEmail: approverEmail,
      recipientName: approverName,
      variables: {
        approverName: approverName.split(" ")[0],
        approverFullName: approverName,
        riskTitle,
        riskLevel: riskLevel || "Não definido",
        riskCategory: riskCategory || "Geral",
        riskDescription: riskDescription || "Sem descrição adicional.",
        senderName,
        acceptanceType: acceptanceType === "definitivo" ? "Definitivo" : "Temporário",
        justification: justification || "Consulte o sistema para mais detalhes.",
        approvalUrl,
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("❌ risk-acceptance-notify error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
