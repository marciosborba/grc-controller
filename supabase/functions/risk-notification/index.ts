import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RiskNotificationRequest {
  recipientName: string;
  recipientEmail: string;
  riskTitle: string;
  riskDescription: string;
  riskLevel: string;
  riskCategory: string;
  senderName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      recipientName,
      recipientEmail,
      riskTitle,
      riskDescription,
      riskLevel,
      riskCategory,
      senderName
    }: RiskNotificationRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Sistema de Gestão de Riscos <noreply@cyberguard.com>",
      to: [recipientEmail],
      subject: `🚨 Novo Risco Identificado: ${riskTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1e40af; margin: 0; font-size: 24px;">🛡️ CyberGuard</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Sistema de Gestão de Riscos</p>
            </div>
            
            <div style="border-left: 4px solid #ef4444; padding-left: 20px; margin-bottom: 30px;">
              <h2 style="color: #ef4444; margin: 0 0 10px 0; font-size: 20px;">🚨 Novo Risco Identificado</h2>
              <p style="color: #666; margin: 0;">Um novo risco foi registrado no sistema e requer sua atenção.</p>
            </div>
            
            <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin-bottom: 30px;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0;">Detalhes do Risco</h3>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Título:</strong>
                <p style="margin: 5px 0 0 0; color: #1f2937; font-weight: 600;">${riskTitle}</p>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Descrição:</strong>
                <p style="margin: 5px 0 0 0; color: #6b7280;">${riskDescription || 'Não informada'}</p>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Categoria:</strong>
                <span style="background-color: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-left: 10px;">${riskCategory}</span>
              </div>
              
              <div style="margin-bottom: 0;">
                <strong style="color: #374151;">Nível de Risco:</strong>
                <span style="background-color: ${getRiskLevelColor(riskLevel)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-left: 10px; font-weight: bold;">${riskLevel}</span>
              </div>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-bottom: 30px;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0;">Próximos Passos</h3>
              <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Acesse o sistema para revisar os detalhes completos do risco</li>
                <li style="margin-bottom: 8px;">Avalie o impacto e probabilidade de ocorrência</li>
                <li style="margin-bottom: 8px;">Defina estratégias de tratamento apropriadas</li>
                <li>Comunique a decisão através do sistema</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-bottom: 20px;">
              <a href="${Deno.env.get("FRONTEND_URL") || "https://app.cyberguard.com"}/risks" 
                 style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Acessar Sistema de Riscos
              </a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Risco registrado por: <strong>${senderName}</strong><br>
                Este é um e-mail automático do Sistema de Gestão de Riscos CyberGuard.<br>
                Para dúvidas, entre em contato com a equipe de TI.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Risk notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in risk-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function getRiskLevelColor(level: string): string {
  switch (level) {
    case 'Muito Alto':
      return '#dc2626';
    case 'Alto':
      return '#ea580c';
    case 'Médio':
      return '#d97706';
    case 'Baixo':
      return '#16a34a';
    default:
      return '#6b7280';
  }
}

serve(handler);