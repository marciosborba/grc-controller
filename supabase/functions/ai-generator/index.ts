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
    const { type, parameters } = await req.json();

    console.log('Received generator request:', { type, parameters });

    if (!huggingFaceApiKey) {
      console.error('HUGGING_FACE_ACCESS_TOKEN not configured');
      throw new Error('Hugging Face API key not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'questionnaire':
        systemPrompt = `Você é um especialista em criação de questionários de assessment e compliance.
        Crie questionários estruturados em formato JSON com as seguintes propriedades:
        - id: identificador único
        - type: tipo da pergunta (boolean, multiple_choice, text, scale)
        - category: categoria da pergunta
        - question: texto da pergunta
        - options: opções de resposta (para multiple_choice)
        - weight: peso da pergunta (1-5)
        - required: se é obrigatória
        
        Retorne APENAS o JSON válido, sem comentários adicionais.`;
        
        userPrompt = `Crie um questionário de ${parameters.framework || 'compliance'} com ${parameters.questionCount || 10} perguntas sobre ${parameters.topic || 'controles de segurança'}.
        Foque em ${parameters.focus || 'avaliação de conformidade'}.`;
        break;

      case 'risk_assessment':
        systemPrompt = `Você é um especialista em avaliação de riscos corporativos.
        Crie uma avaliação de risco estruturada em formato JSON com:
        - title: título do risco
        - description: descrição detalhada
        - category: categoria do risco
        - probability: probabilidade (very_low, low, medium, high, very_high)
        - impact: impacto (very_low, low, medium, high, very_high)
        - severity: severidade calculada
        - controls: controles existentes
        - mitigation: ações de mitigação
        
        Retorne APENAS o JSON válido.`;
        
        userPrompt = `Avalie os riscos relacionados a ${parameters.area || 'segurança da informação'} para ${parameters.context || 'uma empresa de tecnologia'}.
        Considere ${parameters.scope || 'processos operacionais e tecnológicos'}.`;
        break;

      case 'audit_plan':
        systemPrompt = `Você é um auditor interno especializado.
        Crie um plano de auditoria estruturado em formato JSON com:
        - objective: objetivo da auditoria
        - scope: escopo
        - procedures: procedimentos de auditoria
        - timeline: cronograma
        - resources: recursos necessários
        - risk_areas: áreas de risco
        - testing_approach: abordagem de testes
        
        Retorne APENAS o JSON válido.`;
        
        userPrompt = `Crie um plano de auditoria para ${parameters.area || 'controles financeiros'} em ${parameters.department || 'departamento de TI'}.
        Foque em ${parameters.objectives || 'eficácia dos controles internos'}.`;
        break;

      case 'policy':
        systemPrompt = `Você é um especialista em políticas corporativas e governança.
        Crie uma política estruturada em formato JSON com:
        - title: título da política
        - purpose: propósito
        - scope: escopo de aplicação
        - definitions: definições importantes
        - policy_statements: declarações da política
        - responsibilities: responsabilidades
        - procedures: procedimentos
        - compliance: requisitos de conformidade
        - review_cycle: ciclo de revisão
        
        Retorne APENAS o JSON válido.`;
        
        userPrompt = `Crie uma política de ${parameters.type || 'segurança da informação'} para ${parameters.organization || 'uma organização corporativa'}.
        Considere ${parameters.requirements || 'melhores práticas e compliance'}.`;
        break;

      default:
        throw new Error('Tipo de geração não suportado');
    }

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    console.log('Sending request to Hugging Face for generation:', fullPrompt);

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
            max_new_tokens: 2000,
            temperature: 0.3,
            do_sample: true,
            return_full_text: false
          }
        }),
      }
    );

    console.log('Hugging Face generator response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face generator API error:', errorText);
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Hugging Face generator response data:', data);
    
    let aiResponse = '';
    if (Array.isArray(data) && data[0]?.generated_text) {
      aiResponse = data[0].generated_text;
    } else if (data.generated_text) {
      aiResponse = data.generated_text;
    } else {
      console.error('Unexpected response format from Hugging Face:', data);
      throw new Error('Formato de resposta inesperado da Hugging Face');
    }

    console.log('Final generator AI response:', aiResponse);
    
    try {
      // Tenta parsear como JSON
      const jsonResponse = JSON.parse(aiResponse);
      return new Response(JSON.stringify({ data: jsonResponse }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch {
      // Se não for JSON válido, retorna como texto
      return new Response(JSON.stringify({ data: aiResponse }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in ai-generator function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor',
      details: 'Verifique se a chave da API Hugging Face está configurada corretamente'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});