# Guia: Notificações de E-mail via SendPulse

Stack: **Supabase Edge Functions** + **SendPulse REST API** + **Templates HTML**

---

## Por que esse fluxo funciona

O SendPulse, quando usado via **REST API com template ID**, renderiza o HTML no lado deles antes de entregar — garantindo que o HTML chegue íntegro ao destinatário. Enviar HTML diretamente no campo `html:` faz o SendPulse remover o conteúdo HTML por políticas anti-spam.

---

## Pré-requisitos

| Item | Onde obter |
|---|---|
| `SENDPULSE_CLIENT_ID` | SendPulse → API → Criar aplicação |
| `SENDPULSE_CLIENT_SECRET` | Idem |
| `SENDPULSE_FROM_EMAIL` | E-mail verificado no SendPulse |
| `SENDPULSE_TEMPLATE_XXXX` | ID do template criado no passo 2 |
| `FRONTEND_URL` | URL base da aplicação (ex: `https://gepriv.com`) |

Salve como secrets no Supabase:
```bash
npx supabase secrets set SENDPULSE_CLIENT_ID=xxx SENDPULSE_CLIENT_SECRET=yyy --project-ref SEU_PROJECT_REF
```

---

## Passo 1 — Criar o template HTML

1. Crie o arquivo HTML em `supabase/functions/email-templates/nome-do-template.html`
2. Use a sintaxe `{{variavel}}` para valores dinâmicos (duplas chaves)
3. Cores e estilos devem ser **inline** (suporte máximo em clientes de e-mail)
4. Use estrutura de **tabelas** (não divs) para compatibilidade com Outlook

**Variáveis disponíveis — exemplo:**
```html
<h2>{{firstName}}</h2>
<p>O analista <strong>{{senderName}}</strong> registrou um novo risco: <strong>{{riskTitle}}</strong></p>
<a href="{{portalUrl}}" style="background-color:#249485;color:#FFFFFF;padding:14px 28px">
  Acessar o Portal →
</a>
```

**Regra de ouro:** nunca use `%variavel%` ou `{variavel}` — apenas `{{variavel}}`.

---

## Passo 2 — Criar o template no SendPulse

1. Acesse **[SendPulse → SMTP → Meus Templates](https://login.sendpulse.com/smtp/templates/)**
2. Clique em **"Criar Template"** → **"Editor HTML"** (não o visual/drag-and-drop)
3. Cole o HTML do arquivo criado no Passo 1
4. Salve e **anote o ID numérico** do template (ex: `77966`)
5. Salve o ID como secret:
```bash
npx supabase secrets set SENDPULSE_TEMPLATE_NOME=77966 --project-ref SEU_PROJECT_REF
```

---

## Passo 3 — Criar a Edge Function

Arquivo: `supabase/functions/minha-notificacao/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getSendPulseToken(clientId: string, clientSecret: string) {
  const res = await fetch("https://api.sendpulse.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret }),
  });
  if (!res.ok) throw new Error(`Auth failed: ${await res.text()}`);
  return (await res.json()).access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { recipientEmail, recipientName, /* ...outros dados */ } = await req.json();

    const clientId     = Deno.env.get("SENDPULSE_CLIENT_ID")!;
    const clientSecret = Deno.env.get("SENDPULSE_CLIENT_SECRET")!;
    const fromEmail    = Deno.env.get("SENDPULSE_FROM_EMAIL") || "gepriv@gepriv.com";
    const templateId   = parseInt(Deno.env.get("SENDPULSE_TEMPLATE_NOME") || "0");
    const portalUrl    = `${Deno.env.get("FRONTEND_URL") || "https://gepriv.com"}/minha-pagina`;

    const accessToken = await getSendPulseToken(clientId, clientSecret);

    const res = await fetch("https://api.sendpulse.com/smtp/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        email: {
          subject: "Assunto do E-mail",
          template: {
            id: templateId,
            variables: {
              firstName:  (recipientName || recipientEmail).split(" ")[0],
              // ...outras variáveis que existem no template
              portalUrl,
            },
          },
          from: { name: "GEPRIV", email: fromEmail },
          to: [{ name: recipientName || recipientEmail, email: recipientEmail }],
        },
      }),
    });

    const result = await res.text();
    console.log("SendPulse response:", res.status, result);
    if (!res.ok) throw new Error(result);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
```

---

## Passo 4 — Fazer o deploy

```bash
npx supabase functions deploy minha-notificacao --project-ref SEU_PROJECT_REF
```

---

## Passo 5 — Chamar a função no frontend

```typescript
const { error } = await supabase.functions.invoke('minha-notificacao', {
  body: {
    recipientEmail: 'usuario@email.com',
    recipientName:  'Nome do Usuário',
    // ...outros dados
  },
});
```

---

## Diagnóstico de problemas

### E-mail não chega
1. Verifique **SendPulse → SMTP → Relatórios** — o e-mail aparece como entregue, bounce ou spam?
2. Verifique se o endereço está na **lista de suprimidos** do SendPulse
3. Confira os logs da edge function no **Supabase Dashboard → Functions → Logs**

### HTML não renderiza / aparece como texto
- Confirme que está usando `template: { id: ... }` e **NÃO** o campo `html:` diretamente
- SendPulse remove HTML enviado inline — use sempre template ID

### Variáveis aparecem como `{{variavel}}` no e-mail
- Confirme que o template no SendPulse foi salvo com `{{variavel}}` (duplas chaves)
- Confirme que as variáveis no código têm os **mesmos nomes** que no template

### SPF/DMARC falhando (e-mails indo para spam)
Adicione ao registro SPF TXT do domínio no Cloudflare/DNS:
```
v=spf1 include:_spf.mail.hostinger.com include:sendpulse.com ~all
```

---

## Templates existentes

| Template | Arquivo | ID SendPulse | Secret |
|---|---|---|---|
| Notificação de Risco | `risk-notification.html` | `77966` | `SENDPULSE_TEMPLATE_RISK` |
| *(próximo template)* | `nome.html` | *(ID)* | `SENDPULSE_TEMPLATE_NOME` |

---

## Referências

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [SendPulse SMTP API](https://sendpulse.com/integrations/api/smtp)
- [SendPulse Templates](https://login.sendpulse.com/smtp/templates/)
