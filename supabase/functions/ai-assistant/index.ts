import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const huggingFaceApiKey = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');

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

    console.log('Received request:', { prompt, type, context });

    if (!huggingFaceApiKey) {
      console.error('HUGGING_FACE_ACCESS_TOKEN not configured');
      throw new Error('Hugging Face API key not configured');
    }

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

    const contextInfo = context ? `Contexto: ${JSON.stringify(context)}` : '';
    const fullPrompt = `${systemPrompt}\n\n${contextInfo}\n\nPergunta: ${prompt}`;

    console.log('Sending request to Hugging Face with prompt:', fullPrompt);

    // Usando o modelo Qwen/QwQ-32B-Preview que é gratuito e eficiente
    const response = await fetch(
      "https://api-inference.huggingface.co/models/Qwen/QwQ-32B-Preview",
      {
        headers: {
          Authorization: `Bearer ${huggingFaceApiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            max_new_tokens: 1000,
            temperature: 0.7,
            do_sample: true,
            return_full_text: false
          }
        }),
      }
    );

    console.log('Hugging Face response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', errorText);
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Hugging Face response data:', data);
    
    let aiResponse = '';
    if (Array.isArray(data) && data[0]?.generated_text) {
      aiResponse = data[0].generated_text;
    } else if (data.generated_text) {
      aiResponse = data.generated_text;
    } else {
      console.error('Unexpected response format from Hugging Face:', data);
      throw new Error('Formato de resposta inesperado da Hugging Face');
    }

    console.log('Final AI response:', aiResponse);

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-assistant function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor',
      details: 'Verifique se a chave da API Hugging Face está configurada corretamente'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});