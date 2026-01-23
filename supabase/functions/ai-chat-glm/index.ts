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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, type = 'general', context, system_prompt: overrideSystemPrompt } = await req.json();
    console.log('Request received:', {
      promptLength: prompt?.length,
      type,
      hasContext: !!context,
      hasSystemPrompt: !!overrideSystemPrompt
    });

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Authorization header missing');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('user_id', user.id)
      .single();

    if (!profile) throw new Error('User profile not found');
    console.log('Tenant Context:', profile.tenant_id);

    // 1. Try Local GLM Provider
    let providers: any[] = [];

    const { data: localProviders } = await supabase
      .from('ai_grc_providers')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .eq('provider_type', 'glm')
      .eq('is_active', true)
      .order('priority', { ascending: true })
      .limit(1);

    if (localProviders && localProviders.length > 0) {
      providers = localProviders;
      console.log('Found Local Provider:', providers[0].name);
    }

    // 2. Global Fallback
    if (!providers || providers.length === 0) {
      console.log('Checking Global Fallback...');

      // Fetch ALL active providers this user can see via RLS
      const { data: allActive, error: searchError } = await supabase
        .from('ai_grc_providers')
        .select('*')
        .eq('is_active', true);

      if (searchError) {
        console.error('Provider Search Error:', searchError);
      }

      console.log('Visible Providers:', allActive?.length || 0);

      // Filter for Global (tenant_id is null) in memory to be safe
      const globalProviders = (allActive || []).filter(p => !p.tenant_id);

      if (globalProviders.length > 0) {
        // Sort by priority if multiple
        globalProviders.sort((a, b) => (a.priority || 999) - (b.priority || 999));
        providers = [globalProviders[0]];
        console.log('Found Global Provider:', providers[0].name);
      }
    }

    if (!providers || providers.length === 0) {
      console.error('CRITICAL: No active provider found for user', user.id);
      throw new Error(`No active AI provider found. visible=${providers?.length}`);
    }

    const provider = providers[0];
    console.log(`Using Provider: ${provider.name} (${provider.provider_type}) Model: ${provider.model_name}`);

    // Fetch System Prompt
    let systemPrompt = '';

    if (overrideSystemPrompt) {
      // Use user-provided prompt (e.g. from frontend service)
      systemPrompt = overrideSystemPrompt;
      console.log('Using Provided System Prompt Override');
    } else {
      // Fallback to Type-Based Database Lookup (Legacy)
      const typeToPromptName: Record<string, string> = {
        risk: 'ALEX RISK - Especialista em Gestão de Riscos Corporativos',
        compliance: 'ALEX COMPLIANCE - Especialista em Conformidade Regulatória',
        audit: 'ALEX AUDIT - Especialista em Auditoria Big Four e IA',
        policy: 'ALEX POLICY - Especialista em Políticas e Procedimentos Corporativos',
        assessment: 'ALEX ASSESSMENT - Especialista em Assessments e Avaliações de Maturidade',
        privacy: 'ALEX PRIVACY - Especialista em Privacidade de Dados e LGPD',
        incident: 'ALEX INCIDENT - Especialista em Gestão de Incidentes',
        vendor: 'ALEX VENDOR - Especialista em Riscos de Fornecedores e IA',
        ethics: 'ALEX ETHICS - Especialista em Ética e Ouvidoria Corporativa',
        general: 'ALEX RISK - Especialista em Gestão de Riscos Corporativos'
      };

      const promptName = typeToPromptName[type] || typeToPromptName.general;

      const { data: promptTemplates } = await supabase
        .from('ai_grc_prompt_templates')
        .select('template_content')
        .eq('name', promptName)
        .eq('is_active', true)
        .limit(1);

      if (promptTemplates && promptTemplates.length > 0) {
        systemPrompt = promptTemplates[0].template_content;
      } else {
        systemPrompt = 'Você é um especialista em GRC. Responda em português brasileiro.';
      }
    }

    let responseText = '';
    let usageData: any = {};

    // --- GEMINI LOGIC ---
    if (provider.provider_type === 'gemini') {
      const geminiUrl = `${provider.endpoint_url}?key=${provider.api_key_encrypted}`;

      const combinedPrompt = `${systemPrompt}\n\nCONTEXTO DO USUÁRIO:\n${JSON.stringify(context || {})}\n\nINSTRUÇÃO:\n${prompt}`;

      const payload = {
        contents: [{
          parts: [{ text: combinedPrompt }]
        }],
        generationConfig: {
          temperature: Number(provider.temperature) || 0.7,
          maxOutputTokens: Number(provider.max_output_tokens) || 8192
        }
      };

      console.log('Sending to Gemini...');
      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API Error: ${res.status} - ${errText}`);
      }

      const data = await res.json();
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
        responseText = data.candidates[0].content.parts[0].text;
        usageData = data.usageMetadata || {};
      } else {
        throw new Error('Empty response from Gemini');
      }

    }
    // --- LEGACY GLM LOGIC ---
    else if (provider.provider_type === 'glm') {
      const messages: GLMMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ];
      if (context) messages[0].content += `\n\nContexto: ${JSON.stringify(context)}`;

      const glmRequest: GLMChatRequest = {
        model: provider.model_name,
        messages,
        temperature: Number(provider.temperature) || 0.7,
        max_tokens: Number(provider.max_output_tokens) || 2000
      };

      const res = await fetch(provider.endpoint_url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${provider.api_key_encrypted}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(glmRequest),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`GLM API error: ${res.status} - ${errText}`);
      }

      const data = await res.json();
      if (!data.choices || data.choices.length === 0) throw new Error('No response from GLM');
      responseText = data.choices[0].message.content;
      usageData = data.usage;

    } else {
      throw new Error(`Provider type ${provider.provider_type} not supported.`);
    }

    // Log Usage
    try {
      await supabase.from('ai_usage_logs').insert({
        user_id: user.id,
        module_name: 'ai-chat',
        operation_type: 'prompt-execution',
        provider_id: provider.id,
        input_prompt_encrypted: prompt,
        output_response_encrypted: responseText,
        tokens_input: usageData.promptTokenCount || usageData.prompt_tokens || 0,
        tokens_output: usageData.candidatesTokenCount || usageData.completion_tokens || 0,
        tenant_id: profile.tenant_id
      });
    } catch (e) {
      console.warn('Logging failed', e);
    }

    return new Response(JSON.stringify({
      response: responseText,
      usage: usageData
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in ai-chat-glm:', error);
    return new Response(JSON.stringify({
      error: error.message || String(error)
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});