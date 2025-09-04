/**
 * ALEX ASSESSMENT ENGINE - AI RECOMMENDATIONS EDGE FUNCTION
 * 
 * Generates intelligent recommendations for assessment controls using the configured AI provider
 * Integrates with the existing AI Manager system for seamless AI operations
 * 
 * Author: Claude Code (Alex Assessment)
 * Date: 2025-09-04
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AssessmentRecommendationRequest {
  assessment_id: string
  control_id?: string
  recommendation_type: 'control_analysis' | 'risk_priority' | 'evidence_suggestion' | 'framework_mapping' | 'gap_analysis'
  context?: Record<string, any>
}

interface AIProviderConfig {
  id: string
  provider_type: string
  model_name: string
  api_key?: string
  endpoint_url?: string
  is_primary: boolean
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get user from JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      throw new Error('Invalid authorization')
    }

    // Get user's tenant
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile?.tenant_id) {
      throw new Error('User has no tenant')
    }

    // Parse request body
    const body: AssessmentRecommendationRequest = await req.json()

    // Get assessment details
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select(`
        id, name, framework_id_on_creation, tenant_id,
        framework:frameworks!framework_id_on_creation (
          id, name, short_name, category
        )
      `)
      .eq('id', body.assessment_id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (assessmentError || !assessment) {
      throw new Error('Assessment not found or access denied')
    }

    // Get control details if specified
    let controlContext = null
    if (body.control_id) {
      const { data: response } = await supabase
        .from('assessment_responses')
        .select(`
          id, maturity_level, respondent_comments, auditor_comments,
          control:framework_controls!control_id (
            id, name, description, category, domain
          )
        `)
        .eq('assessment_id', body.assessment_id)
        .eq('control_id', body.control_id)
        .single()

      controlContext = response
    }

    // Get AI configuration for tenant
    const { data: aiConfig } = await supabase
      .from('ai_configurations')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .single()

    // Get primary AI provider
    const { data: aiProvider, error: providerError } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .eq('is_primary', true)
      .eq('is_active', true)
      .single()

    if (providerError || !aiProvider) {
      throw new Error('No active AI provider configured')
    }

    // Get appropriate prompt template
    const { data: promptTemplate } = await supabase
      .from('ai_prompt_templates')
      .select('*')
      .eq('category', getPromptCategory(body.recommendation_type))
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!promptTemplate) {
      throw new Error(`No prompt template found for ${body.recommendation_type}`)
    }

    // Prepare context for AI prompt
    const aiContext = {
      assessment_name: assessment.name,
      framework_name: assessment.framework?.name,
      framework_category: assessment.framework?.category,
      control_name: controlContext?.control?.name,
      control_description: controlContext?.control?.description,
      control_domain: controlContext?.control?.domain,
      current_maturity: controlContext?.maturity_level,
      respondent_comments: controlContext?.respondent_comments,
      auditor_comments: controlContext?.auditor_comments,
      recommendation_type: body.recommendation_type,
      tenant_context: aiConfig?.module_settings || {},
      additional_context: body.context || {}
    }

    // Generate prompt from template
    let prompt = promptTemplate.template_content
    Object.entries(aiContext).forEach(([key, value]) => {
      const placeholder = `{${key}}`
      prompt = prompt.replace(new RegExp(placeholder, 'g'), String(value || ''))
    })

    console.log('Generated prompt:', prompt)

    // Call AI provider
    const aiResponse = await callAIProvider(aiProvider, prompt, aiConfig)
    
    // Parse AI response
    let parsedResponse
    try {
      parsedResponse = JSON.parse(aiResponse)
    } catch {
      // If not JSON, wrap in a standard format
      parsedResponse = {
        analysis: aiResponse,
        confidence: 0.8,
        recommendations: []
      }
    }

    // Calculate confidence score
    const confidenceScore = calculateConfidenceScore(parsedResponse, controlContext)

    // Save recommendation to database
    const { data: savedRecommendation, error: saveError } = await supabase
      .from('ai_assessment_recommendations')
      .insert({
        tenant_id: profile.tenant_id,
        assessment_id: body.assessment_id,
        recommendation_type: body.recommendation_type,
        trigger_context: aiContext,
        ai_provider: aiProvider.provider_type,
        ai_model: aiProvider.model_name,
        ai_prompt_used: prompt,
        ai_response: parsedResponse,
        confidence_score: confidenceScore,
        status: 'pending'
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving recommendation:', saveError)
    }

    // Update AI provider usage statistics
    await updateProviderStats(supabase, aiProvider.id, true)

    // Return response
    return new Response(
      JSON.stringify({
        success: true,
        recommendation_id: savedRecommendation?.id,
        response: parsedResponse,
        confidence_score: confidenceScore,
        provider_used: `${aiProvider.provider_type}/${aiProvider.model_name}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in alex-assessment-recommendations:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

/**
 * Get the appropriate prompt category based on recommendation type
 */
function getPromptCategory(recommendationType: string): string {
  const categoryMap: Record<string, string> = {
    'control_analysis': 'assessment_analysis',
    'risk_priority': 'risk_prioritization',
    'evidence_suggestion': 'evidence_guidance',
    'framework_mapping': 'framework_mapping',
    'gap_analysis': 'gap_analysis'
  }
  
  return categoryMap[recommendationType] || 'assessment_analysis'
}

/**
 * Call the configured AI provider
 */
async function callAIProvider(
  provider: AIProviderConfig, 
  prompt: string, 
  config: any
): Promise<string> {
  const maxTokens = config?.max_tokens_per_request || 2000
  const temperature = config?.temperature || 0.7

  switch (provider.provider_type.toLowerCase()) {
    case 'openai':
      return await callOpenAI(provider, prompt, maxTokens, temperature)
    case 'anthropic':
      return await callAnthropic(provider, prompt, maxTokens, temperature)
    case 'azure_openai':
      return await callAzureOpenAI(provider, prompt, maxTokens, temperature)
    default:
      throw new Error(`Unsupported AI provider: ${provider.provider_type}`)
  }
}

/**
 * Call OpenAI API
 */
async function callOpenAI(
  provider: AIProviderConfig,
  prompt: string,
  maxTokens: number,
  temperature: number
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${provider.api_key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: provider.model_name,
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em GRC (Governance, Risk, and Compliance) focado em assessments de segurança e conformidade.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature: temperature
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || 'No response generated'
}

/**
 * Call Anthropic Claude API
 */
async function callAnthropic(
  provider: AIProviderConfig,
  prompt: string,
  maxTokens: number,
  temperature: number
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': provider.api_key!,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: provider.model_name,
      max_tokens: maxTokens,
      temperature: temperature,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  })

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.content[0]?.text || 'No response generated'
}

/**
 * Call Azure OpenAI API
 */
async function callAzureOpenAI(
  provider: AIProviderConfig,
  prompt: string,
  maxTokens: number,
  temperature: number
): Promise<string> {
  const response = await fetch(provider.endpoint_url!, {
    method: 'POST',
    headers: {
      'api-key': provider.api_key!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em GRC (Governance, Risk, and Compliance) focado em assessments de segurança e conformidade.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature: temperature
    })
  })

  if (!response.ok) {
    throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || 'No response generated'
}

/**
 * Calculate confidence score based on response quality
 */
function calculateConfidenceScore(response: any, controlContext: any): number {
  let confidence = 0.5 // Base confidence
  
  // Increase confidence if response is well-structured JSON
  if (typeof response === 'object' && response.recommendations) {
    confidence += 0.2
  }
  
  // Increase confidence if we have control context
  if (controlContext?.maturity_level) {
    confidence += 0.15
  }
  
  // Increase confidence if response includes specific recommendations
  if (response.recommendations && Array.isArray(response.recommendations) && response.recommendations.length > 0) {
    confidence += 0.15
  }
  
  return Math.min(confidence, 1.0)
}

/**
 * Update AI provider usage statistics
 */
async function updateProviderStats(supabase: any, providerId: string, success: boolean) {
  try {
    const increment = success ? 
      { successful_requests: 1, total_requests: 1 } :
      { failed_requests: 1, total_requests: 1 }
      
    await supabase
      .from('ai_providers')
      .update({
        ...increment,
        last_request_at: new Date().toISOString()
      })
      .eq('id', providerId)
  } catch (error) {
    console.error('Error updating provider stats:', error)
  }
}