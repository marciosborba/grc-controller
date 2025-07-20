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
    const { prompt, type = 'general', context } = await req.json();

    if (!huggingFaceApiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    const systemMessages = {
      general: 'Você é um assistente especializado em GRC (Governança, Riscos e Compliance). Responda de forma clara e objetiva em português.',
      assessment: 'Você é um especialista em assessments e avaliações de compliance. Responda de forma clara e objetiva em português.',
      risk: 'Você é um especialista em gestão de riscos corporativos. Responda de forma clara e objetiva em português.',
      audit: 'Você é um especialista em auditoria interna. Responda de forma clara e objetiva em português.',
      policy: 'Você é um especialista em políticas corporativas. Responda de forma clara e objetiva em português.',
      compliance: 'Você é um especialista em compliance regulatório. Responda de forma clara e objetiva em português.'
    };

    const systemPrompt = systemMessages[type] || systemMessages.general;
    const fullPrompt = `${systemPrompt}\n\nUsuário: ${prompt}`;

    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${huggingFaceApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: fullPrompt,
        parameters: {
          max_length: 512,
          temperature: 0.7,
          do_sample: true,
          return_full_text: false
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json();
    
    let responseText = '';
    if (Array.isArray(data) && data.length > 0) {
      responseText = data[0].generated_text || 'Desculpe, não consegui gerar uma resposta adequada.';
    } else {
      responseText = 'Desculpe, não consegui processar sua solicitação no momento.';
    }

    return new Response(JSON.stringify({ 
      response: responseText
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-assistant function:', error);
    return new Response(JSON.stringify({ 
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});