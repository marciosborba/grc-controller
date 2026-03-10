import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

interface ChatNotificationRequest {
    recipientName: string;
    recipientEmail: string;
    vendorName: string;
    messagePreview: string;
    publicLink: string;
    senderName: string;
}

const sendPulseApi = async (emailPayload: any) => {
    const clientId = Deno.env.get("SENDPULSE_API_USER");
    const clientSecret = Deno.env.get("SENDPULSE_API_SECRET");

    if (!clientId || !clientSecret) {
        throw new Error("Configurações do SendPulse não encontradas no servidor (SENDPULSE_API_USER e SENDPULSE_API_SECRET)");
    }

    // 1. Obter Token de Autenticação
    const tokenResponse = await fetch("https://api.sendpulse.com/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            grant_type: "client_credentials",
            client_id: clientId,
            client_secret: clientSecret,
        }),
    });

    if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Falha ao obter token do SendPulse: ${errorText}`);
    }

    const { access_token } = await tokenResponse.json();

    // 2. Enviar o E-mail
    const sendResponse = await fetch("https://api.sendpulse.com/smtp/emails", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access_token}`
        },
        body: JSON.stringify({ email: emailPayload })
    });

    if (!sendResponse.ok) {
        const errorText = await sendResponse.text();
        throw new Error(`Falha no disparo via SendPulse: ${errorText}`);
    }

    return await sendResponse.json();
};

const handler = async (req: Request): Promise<Response> => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const {
            recipientName,
            recipientEmail,
            vendorName,
            messagePreview,
            publicLink,
            senderName
        }: ChatNotificationRequest = await req.json();

        if (!recipientEmail) {
            throw new Error("E-mail não fornecido.");
        }

        const publicUrl = `${Deno.env.get("FRONTEND_URL") || "https://app.cyberguard.com"}/vendor-assessment/${publicLink}`;

        const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin: 0; font-size: 24px;">🛡️ CyberGuard</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Gestão de Risco de Terceiros</p>
          </div>
          
          <div style="border-left: 4px solid #3b82f6; padding-left: 20px; margin-bottom: 30px;">
            <h2 style="color: #1e40af; margin: 0 0 10px 0; font-size: 20px;">Nova Mensagem Recebida</h2>
            <p style="color: #666; margin: 0;">Você recebeu uma nova mensagem através da Central de Dúvidas.</p>
          </div>
          
          <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin-bottom: 30px; border: 1px solid #e5e7eb;">
            <p style="color: #374151; font-weight: bold; margin-bottom: 10px;">Enviado por: ${senderName}</p>
            <p style="color: #4b5563; style="font-style: italic; white-space: pre-wrap; margin: 0;">"${messagePreview}"</p>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${publicUrl}" 
               style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              Acessar Portal do Fornecedor e Responder
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Olá ${recipientName || vendorName}, este é um e-mail automático do Sistema de Gestão de Riscos.<br>
              Por favor, não responda diretamente a este e-mail. Utilize o portal web.
            </p>
          </div>
        </div>
      </div>
    `;

        const emailPayload = {
            html: htmlContent,
            text: `Nova mensagem recebida de ${senderName}\n\nMensagem: "${messagePreview}"\n\nAcesse o portal para responder: ${publicUrl}`,
            subject: `[CyberGuard] Nova mensagem na Central de Dúvidas`,
            from: {
                name: "CyberGuard - Gestão de Terceiros",
                email: "noreply@cyberguard.com" // Needs to be an authenticated domain on SendPulse
            },
            to: [
                {
                    name: recipientName || vendorName,
                    email: recipientEmail
                }
            ]
        };

        const emailResponse = await sendPulseApi(emailPayload);
        console.log("Chat notification email sent successfully via SendPulse:", emailResponse);

        return new Response(JSON.stringify({ success: true, response: emailResponse }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
            },
        });
    } catch (error: any) {
        console.error("Error in vendor-chat-notification function:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            }
        );
    }
};

serve(handler);
