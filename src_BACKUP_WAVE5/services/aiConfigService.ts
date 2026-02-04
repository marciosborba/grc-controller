import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AIProvider {
    id: string;
    name: string;
    provider_type: 'openai' | 'azure_openai' | 'custom' | 'google' | 'glm';
    model_name: string;
    api_key_encrypted: string;
    endpoint_url?: string;
    is_active: boolean;
    is_primary: boolean;
    tenant_id: string;
    created_at?: string;
    settings?: any;
}

export interface AIUsageStats {
    total_tokens: number;
    total_cost_usd: number;
    total_requests: number;
    requests_by_day: { date: string; count: number }[];
}

export const PLATFORM_TENANT_ID = '46b1c048-85a1-423b-96fc-776007c8de1f';

export const aiConfigService = {
    /**
     * Fetch all AI providers configured for a tenant
     */
    getProviders: async (tenantId: string): Promise<AIProvider[]> => {
        const { data, error } = await supabase
            .from('ai_grc_providers')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Create or Update an AI Provider
     */
    upsertProvider: async (provider: Partial<AIProvider>) => {
        // If setting as primary, unset others first
        if (provider.is_primary && provider.tenant_id) {
            await supabase
                .from('ai_grc_providers')
                .update({ is_primary: false })
                .eq('tenant_id', provider.tenant_id);
        }

        const { data, error } = await supabase
            .from('ai_grc_providers')
            .upsert({
                id: provider.id, // If id is undefined, upsert might generate if configured, but usually for update we need ID. For insert we omit ID or let UUID gen.
                tenant_id: provider.tenant_id,
                name: provider.name,
                provider_type: provider.provider_type,
                model_name: provider.model_name,
                api_key_encrypted: provider.api_key_encrypted, // WARNING: In a real app, encrypt this before sending!
                endpoint_url: provider.endpoint_url,
                is_active: provider.is_active,
                is_primary: provider.is_primary,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Delete a provider
     */
    deleteProvider: async (id: string) => {
        const { error } = await supabase
            .from('ai_grc_providers')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * Get primary provider for the tenant (to be used by services)
     */
    getPrimaryProvider: async (tenantId: string): Promise<AIProvider | null> => {
        const { data, error } = await supabase
            .from('ai_grc_providers')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('is_primary', true)
            .eq('is_active', true)
            .single();

        // If no primary, fallback to any active? Or return null.
        // Error code PGRST116 means no rows found (single())
        if (error && error.code !== 'PGRST116') throw error;

        return data;
    },

    /**
     * Get usage stats
     */
    getUsageStats: async (tenantId: string): Promise<AIUsageStats> => {
        // This aggregates from ai_usage_logs
        const dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - 30); // Last 30 days

        const { data, error } = await supabase
            .from('ai_usage_logs')
            .select('created_at, tokens_input, tokens_output, cost_usd')
            .eq('tenant_id', tenantId)
            .gte('created_at', dateFilter.toISOString());

        if (error) throw error;

        const stats = (data || []).reduce((acc, log) => {
            acc.total_tokens += (log.tokens_input || 0) + (log.tokens_output || 0);
            acc.total_cost_usd += (log.cost_usd || 0);
            acc.total_requests += 1;

            const day = new Date(log.created_at).toLocaleDateString();
            const existingDay = acc.requests_by_day.find(d => d.date === day);
            if (existingDay) {
                existingDay.count++;
            } else {
                acc.requests_by_day.push({ date: day, count: 1 });
            }
            return acc;
        }, {
            total_tokens: 0,
            total_cost_usd: 0,
            total_requests: 0,
            requests_by_day: [] as { date: string; count: number }[]
        });

        return stats;
    },

    /**
     * Get the effective provider (Tenant Override > Platform Default)
     */
    getEffectiveProvider: async (tenantId: string, platformTenantId: string = PLATFORM_TENANT_ID): Promise<AIProvider | null> => {
        // 1. Try to find a primary provider for the specific tenant
        const { data: localProvider, error: localError } = await supabase
            .from('ai_grc_providers')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('is_primary', true)
            .eq('is_active', true)
            .single();

        if (!localError && localProvider) {
            return localProvider;
        }

        // 2. If no local provider, check Global Fallback (tenant_id IS NULL)
        const { data: globalProvider, error: globalError } = await supabase
            .from('ai_grc_providers')
            .select('*')
            .is('tenant_id', null)
            .eq('is_active', true)
            .limit(1)
            .maybeSingle();

        if (!globalError && globalProvider) {
            // Return global provider with is_primary false to indicate it's a fallback
            return { ...globalProvider, is_primary: false };
        }

        return null;
    },

    /**
     * --- PROMPTS MANAGEMENT ---
     */
    getPrompts: async (tenantId: string): Promise<AIPromptTemplate[]> => {
        const { data, error } = await supabase
            .from('ai_grc_prompt_templates')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    upsertPrompt: async (prompt: Partial<AIPromptTemplate>) => {
        const { data, error } = await supabase
            .from('ai_grc_prompt_templates')
            .upsert({
                id: prompt.id,
                tenant_id: prompt.tenant_id,
                name: prompt.name,
                title: prompt.title || prompt.name, // Auto-fill title if missing
                category: prompt.category,
                description: prompt.description,
                template_content: prompt.template_content,
                use_case: prompt.use_case || prompt.description, // Auto-fill use_case if missing
                is_active: prompt.is_active,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    deletePrompt: async (id: string) => {
        const { error } = await supabase
            .from('ai_grc_prompt_templates')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * --- WORKFLOWS MANAGEMENT ---
     */
    getWorkflows: async (tenantId: string): Promise<AIWorkflow[]> => {
        const { data, error } = await supabase
            .from('ai_workflows')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    upsertWorkflow: async (workflow: Partial<AIWorkflow>) => {
        const { data, error } = await supabase
            .from('ai_workflows')
            .upsert({
                id: workflow.id,
                tenant_id: workflow.tenant_id,
                name: workflow.name,
                is_active: workflow.is_active,
                status: workflow.status,
                // Add other fields as necessary if schema expands
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    deleteWorkflow: async (id: string) => {
        const { error } = await supabase
            .from('ai_workflows')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * --- FUNCTION MAPPINGS ---
     */
    getFunctionMappings: async (tenantId: string): Promise<AIFunctionMapping[]> => {
        const { data, error } = await supabase
            .from('ai_function_mappings')
            .select(`
                *,
                prompt_template:ai_grc_prompt_templates(id, name)
            `)
            .eq('tenant_id', tenantId);

        if (error) throw error;
        return data || [];
    },

    upsertFunctionMapping: async (mapping: Partial<AIFunctionMapping>) => {
        const { data, error } = await supabase
            .from('ai_function_mappings')
            .upsert({
                id: mapping.id,
                tenant_id: mapping.tenant_id,
                function_key: mapping.function_key,
                prompt_template_id: mapping.prompt_template_id,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    getPromptForFunction: async (tenantId: string, functionKey: string): Promise<AIPromptTemplate | null> => {
        // 1. Check explicit mapping
        const { data: mapping } = await supabase
            .from('ai_function_mappings')
            .select('prompt_template_id')
            .eq('tenant_id', tenantId)
            .eq('function_key', functionKey)
            .single();

        if (mapping && mapping.prompt_template_id) {
            const { data: template } = await supabase
                .from('ai_grc_prompt_templates')
                .select('*')
                .eq('id', mapping.prompt_template_id)
                .single();
            return template;
        }
        return null;
    },

    /**
     * Log AI Usage
     */
    logUsage: async (tenantId: string, providerId: string, model: string, usage: { prompt_tokens: number, completion_tokens: number, total_tokens: number }, type: string) => {
        // Simple cost estimation (can be improved with a pricing table)
        // Default to approx $0.0000005 per token (very rough avg for basic models) or 0 if unknown
        // Real implementation should fetch price from provider/model table
        let cost = 0;

        // Example pricing (placeholder)
        // Gemini Flash: ~$0.0001 / 1k input, ~$0.0004 / 1k output
        if (model.includes('flash')) {
            cost = (usage.prompt_tokens * 0.0000001) + (usage.completion_tokens * 0.0000004);
        } else if (model.includes('pro')) {
            cost = (usage.prompt_tokens * 0.00000125) + (usage.completion_tokens * 0.00000375);
        }

        // Simple UUID v4 generator
        const uuidv4 = () => {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };

        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('ai_usage_logs')
            .insert({
                tenant_id: tenantId,
                request_id: uuidv4(),
                user_id: user?.id,
                provider_id: providerId,
                tokens_input: usage.prompt_tokens,
                tokens_output: usage.completion_tokens,
                cost_usd: cost,
                operation_type: type, // 'prompt-execution'
                module_name: 'Policy Auditor'
            });

        if (error) {
            console.error('Failed to log AI usage:', error);
            toast.error(`Erro ao salvar logs de uso: ${error.message}`);
        }
    }
};

// --- Additional Interfaces ---

export interface AIFunctionMapping {
    id: string;
    tenant_id: string;
    function_key: string;
    prompt_template_id: string;
    prompt_template?: { id: string, name: string };
    created_at?: string;
    updated_at?: string;
}

export interface AIPromptTemplate {
    id: string;
    tenant_id: string;
    name: string;
    title?: string;
    is_active: boolean;
    category: string;
    description?: string;
    template_content?: string;
    use_case?: string;
    created_at?: string;
}

export interface AIWorkflow {
    id: string;
    tenant_id: string;
    name: string;
    is_active: boolean;
    status: string;
    created_at?: string;
}
