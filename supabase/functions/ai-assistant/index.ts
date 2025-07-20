import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, type, context } = await req.json();

    let systemPrompt = '';
    
    switch (type) {
      case 'general':
        systemPrompt = `Você é um assistente especializado em GRC (Governança, Riscos e Compliance). 
        Ajude os usuários com questões relacionadas a gestão de riscos, compliance, auditoria, políticas corporativas e segurança da informação.
        Seja específico, prático e sempre forneça exemplos quando possível.`;
        break;
        
      case 'assessment':
        systemPrompt = `Você é um especialista em criação de questionários de assessment e avaliações de risco.
        Ajude a criar questionários estruturados, perguntas relevantes, critérios de avaliação e frameworks como ISO 27001, NIST, LGPD.
        Forneça questões específicas, opções de resposta e critérios de pontuação.`;
        break;
        
      case 'risk':
        systemPrompt = `Você é um especialista em gestão de riscos corporativos.
        Ajude na identificação, análise, avaliação e mitigação de riscos. Forneça classificações de risco, probabilidades, impactos e controles.
        Use metodologias reconhecidas como COSO, ISO 31000 e frameworks de risco cibernético.`;
        break;
        
      case 'audit':
        systemPrompt = `Você é um auditor interno especializado em auditoria de processos, controles e sistemas.
        Ajude na criação de planos de auditoria, procedimentos de teste, achados de auditoria e recomendações.
        Foque em controles internos, evidências de auditoria e relatórios estruturados.`;
        break;
        
      case 'policy':
        systemPrompt = `Você é um especialista em políticas corporativas e procedimentos organizacionais.
        Ajude na criação de políticas estruturadas, procedimentos detalhados, fluxos de aprovação e documentação corporativa.
        Garanta conformidade com regulamentações e melhores práticas de governança.`;
        break;
        
      case 'compliance':
        systemPrompt = `Você é um especialista em compliance e conformidade regulatória.
        Ajude com questões de LGPD, SOX, ISO 27001, frameworks de compliance e controles regulatórios.
        Forneça orientações práticas sobre implementação e monitoramento de controles.`;
        break;
        
      default:
        systemPrompt = `Você é um assistente especializado em GRC (Governança, Riscos e Compliance). 
        Ajude com questões relacionadas a gestão corporativa, segurança e conformidade.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...(context ? [{ role: 'user', content: `Contexto: ${JSON.stringify(context)}` }] : []),
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro na API OpenAI');
    }

    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-assistant function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});