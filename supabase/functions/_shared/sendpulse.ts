// @ts-nocheck
// Utilitário compartilhado SendPulse para Edge Functions

export async function getSendPulseToken(clientId: string, clientSecret: string): Promise<string> {
  const res = await fetch("https://api.sendpulse.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret }),
  });
  if (!res.ok) throw new Error(`SendPulse Auth failed: ${await res.text()}`);
  return (await res.json()).access_token;
}

/**
 * Busca o HTML do template e substitui variáveis localmente.
 * Suporta {{varName}}, { varName } e {varName}.
 */
async function fetchAndRenderTemplate(
  accessToken: string,
  templateId: number,
  variables: Record<string, string>
): Promise<string | null> {
  try {
    const res = await fetch(`https://api.sendpulse.com/templates/${templateId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      console.warn(`[SendPulse] Template ${templateId} fetch HTTP ${res.status}`);
      return null;
    }
    const json = await res.json();
    // SendPulse may wrap in data object or return directly
    const tpl = json?.data ?? json;
    const html: string = tpl?.body ?? tpl?.html ?? tpl?.message ?? "";
    if (!html) {
      console.warn(`[SendPulse] Template ${templateId} has no HTML body. Keys: ${Object.keys(tpl).join(", ")}`);
      return null;
    }
    console.log(`[SendPulse] Template ${templateId} fetched, length=${html.length}. Vars: ${Object.keys(variables).join(", ")}`);

    // Check if the HTML actually contains any of our variable patterns.
    // If none are found, the template uses SendPulse's native variable engine
    // (not literal {{varName}} in HTML), so fall back to template.variables.
    const hasAnyVar = Object.keys(variables).some(key =>
      html.includes(`{{ ${key} }}`) || html.includes(`{{${key}}}`) ||
      html.includes(`{ ${key} }`) || html.includes(`{${key}}`)
    );
    if (!hasAnyVar) {
      console.log(`[SendPulse] Template ${templateId} uses native SendPulse variables — using template.variables fallback`);
      return null;
    }

    let rendered = html;
    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered
        .split(`{{ ${key} }}`).join(value)
        .split(`{{${key}}}`).join(value)
        .split(`{ ${key} }`).join(value)
        .split(`{${key}}`).join(value);
    }
    return rendered;
  } catch (e: any) {
    console.warn(`[SendPulse] fetchAndRenderTemplate error: ${e.message}`);
    return null;
  }
}

export interface SendTemplateEmailOptions {
  templateId: number;
  subject: string;
  recipientEmail: string;
  recipientName: string;
  variables: Record<string, string>;
  fromEmail?: string;
  fromName?: string;
}

/**
 * Envia e-mail via SendPulse.
 * Tenta primeiro buscar o HTML do template e substituir variáveis localmente.
 * Se isso falhar, usa template.variables (API nativa do SendPulse).
 */
export async function sendTemplateEmail(opts: SendTemplateEmailOptions): Promise<boolean> {
  const clientId = Deno.env.get("SENDPULSE_CLIENT_ID");
  const clientSecret = Deno.env.get("SENDPULSE_CLIENT_SECRET");
  const fromEmail = opts.fromEmail ?? Deno.env.get("SENDPULSE_FROM_EMAIL") ?? "gepriv@gepriv.com";
  const fromName = opts.fromName ?? "GEPRIV";

  if (!clientId || !clientSecret) {
    console.warn("[SendPulse] Credentials missing — skipping email.");
    return false;
  }

  const accessToken = await getSendPulseToken(clientId, clientSecret);

  // Step 1: try to fetch template HTML and substitute locally
  const renderedHtml = await fetchAndRenderTemplate(accessToken, opts.templateId, opts.variables);

  let emailPayload: Record<string, unknown>;

  if (renderedHtml) {
    // Send with pre-rendered HTML (variables already substituted)
    emailPayload = {
      subject: opts.subject,
      html: renderedHtml,
      from: { name: fromName, email: fromEmail },
      to: [{ name: opts.recipientName, email: opts.recipientEmail }],
    };
    console.log(`[SendPulse] Sending template ${opts.templateId} with pre-rendered HTML`);
  } else {
    // Fallback: use template.variables (works if template has SendPulse variable syntax)
    emailPayload = {
      subject: opts.subject,
      template: { id: opts.templateId, variables: opts.variables },
      from: { name: fromName, email: fromEmail },
      to: [{ name: opts.recipientName, email: opts.recipientEmail }],
    };
    console.log(`[SendPulse] Sending template ${opts.templateId} via template.variables fallback`);
  }

  const res = await fetch("https://api.sendpulse.com/smtp/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ email: emailPayload }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("[SendPulse] Send failed:", errorText);
    throw new Error(`SendPulse send failed: ${errorText}`);
  }

  console.log(`[SendPulse] Email sent to ${opts.recipientEmail} (template ${opts.templateId})`);
  return true;
}
