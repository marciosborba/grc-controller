import { supabase } from '@/integrations/supabase/client';

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
     * Get basic usage stats
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
    }
};
