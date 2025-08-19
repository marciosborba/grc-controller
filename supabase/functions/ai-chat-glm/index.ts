import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GLMChatRequest {
  model: string;
  messages: GLMMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface GLMChatResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, type = 'general', context } = await req.json();
    console.log('Request received:', { prompt: prompt?.substring(0, 50), type, hasContext: !!context });
    
    // Obter token de autorização
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }
    console.log('Authorization header found');

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Obter usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User authentication failed:', userError);
      throw new Error('User not authenticated');
    }
    console.log('User authenticated:', user.id);

    // Obter tenant do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile lookup failed:', profileError);
      throw new Error('User profile not found');
    }
    console.log('Profile found, tenant_id:', profile.tenant_id);

    // Buscar provedor GLM ativo
    const { data: providers, error: providerError } = await supabase
      .from('ai_grc_providers')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .eq('provider_type', 'glm')
      .eq('is_active', true)
      .order('priority', { ascending: true })
      .limit(1);

    if (providerError || !providers || providers.length === 0) {
      console.error('Provider lookup failed:', providerError, 'Found providers:', providers?.length || 0);
      throw new Error('No active GLM provider found');
    }
    console.log('GLM provider found:', providers[0].name);

    const provider = providers[0];

    // Buscar prompt específico do banco de dados baseado no tipo/módulo
    let systemPrompt = '';
    
    // Mapear tipos de chat para prompts ALEX específicos
    const typeToPromptName = {
      risk: 'ALEX RISK - Especialista em Gestão de Riscos Corporativos',
      compliance: 'ALEX COMPLIANCE - Especialista em Conformidade Regulatória',
      audit: 'ALEX AUDIT - Especialista em Auditoria Big Four e IA',
      policy: 'ALEX POLICY - Especialista em Políticas e Procedimentos Corporativos',
      assessment: 'ALEX ASSESSMENT - Especialista em Assessments e Avaliações de Maturidade',
      privacy: 'ALEX PRIVACY - Especialista em Privacidade de Dados e LGPD',
      incident: 'ALEX INCIDENT - Especialista em Gestão de Incidentes',
      vendor: 'ALEX VENDOR - Especialista em Riscos de Fornecedores e IA',
      ethics: 'ALEX ETHICS - Especialista em Ética e Ouvidoria Corporativa',
      general: 'ALEX RISK - Especialista em Gestão de Riscos Corporativos' // fallback para ALEX RISK
    };
    
    const promptName = typeToPromptName[type] || typeToPromptName.general;
    
    console.log(`Looking for prompt: ${promptName} for type: ${type}`);
    
    // Buscar prompt template específico pelo nome
    const { data: promptTemplates, error: promptError } = await supabase
      .from('ai_grc_prompt_templates')
      .select('template_content, name, id')
      .eq('name', promptName)
      .eq('is_active', true)
      .limit(1);
    
    console.log('Prompt lookup result:', { 
      promptError, 
      foundTemplates: promptTemplates?.length || 0,
      searchedName: promptName 
    });
    
    if (promptTemplates && promptTemplates.length > 0) {
      systemPrompt = promptTemplates[0].template_content;
      console.log(`Using prompt template: ${promptTemplates[0].name}`);
    } else {
      // Fallback para mensagens básicas se não encontrar template
      const fallbackMessages = {
        general: 'Você é um assistente especializado em GRC (Governança, Riscos e Compliance). Responda de forma clara, objetiva e profissional em português brasileiro.',
        assessment: 'Você é ALEX ASSESSMENT - um especialista em assessments e avaliações de maturidade em GRC. Responda de forma clara, objetiva e profissional em português brasileiro, focando em metodologias de avaliação, frameworks de maturidade e boas práticas.',
        risk: 'Você é ALEX RISK - um especialista em gestão de riscos corporativos. Responda de forma clara, objetiva e profissional em português brasileiro, focando em identificação, análise, avaliação e mitigação de riscos.',
        audit: 'Você é ALEX AUDIT - um especialista em auditoria interna e externa. Responda de forma clara, objetiva e profissional em português brasileiro, focando em procedimentos de auditoria, controles internos e relatórios.',
        policy: 'Você é ALEX POLICY - um especialista em políticas e procedimentos corporativos. Responda de forma clara, objetiva e profissional em português brasileiro, focando na criação e revisão de políticas organizacionais.',
        compliance: 'Você é ALEX COMPLIANCE - um especialista em conformidade regulatória. Responda de forma clara, objetiva e profissional em português brasileiro, focando em frameworks regulatórios, controles de compliance e gestão de conformidade.'
      };
      systemPrompt = fallbackMessages[type] || fallbackMessages.general;
      console.log(`Using fallback prompt for type: ${type}`);
    }

    // Preparar mensagens para GLM
    const messages: GLMMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    // Adicionar contexto se fornecido
    if (context) {
      messages[0].content += `\n\nContexto adicional: ${JSON.stringify(context)}`;
    }

    // Fazer chamada para GLM
    const glmRequest: GLMChatRequest = {
      model: provider.model_name,
      messages,
      temperature: provider.temperature || 0.7,
      max_tokens: provider.max_output_tokens || 2000
    };

    console.log('Sending request to GLM:', {
      model: glmRequest.model,
      messagesCount: glmRequest.messages.length,
      temperature: glmRequest.temperature
    });

    const glmResponse = await fetch(provider.endpoint_url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.api_key_encrypted}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(glmRequest),
    });

    if (!glmResponse.ok) {
      const errorText = await glmResponse.text();
      console.error(`GLM API error: ${glmResponse.status} - ${errorText}`);
      throw new Error(`GLM API error: ${glmResponse.status} - ${errorText}`);
    }

    const glmData: GLMChatResponse = await glmResponse.json();
    console.log('GLM response received:', {
      hasChoices: !!glmData.choices,
      choicesLength: glmData.choices?.length || 0,
      usage: glmData.usage
    });

    if (!glmData.choices || glmData.choices.length === 0) {
      throw new Error('No response from GLM');
    }

    const responseText = glmData.choices[0].message.content;

    // Log da requisição no banco
    try {
      const logData: any = {
        request_id: crypto.randomUUID(),
        user_id: user.id,
        module_name: 'ai-chat',
        operation_type: 'prompt-execution',
        provider_id: provider.id,
        input_prompt_encrypted: prompt,
        output_response_encrypted: responseText,
        tokens_input: glmData.usage?.prompt_tokens || 0,
        tokens_output: glmData.usage?.completion_tokens || 0,
        cost_usd: 0, // Calcular custo se necessário
        tenant_id: profile.tenant_id
      };
      
      // Adicionar template_id se um template foi usado
      if (promptTemplates && promptTemplates.length > 0) {
        logData.template_id = promptTemplates[0].id;
      }
      
      await supabase.from('ai_usage_logs').insert(logData);
    } catch (logError) {
      console.warn('Failed to log usage:', logError);
    }

    return new Response(JSON.stringify({ 
      response: responseText,
      usage: glmData.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat-glm function:', error);
    return new Response(JSON.stringify({ 
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});