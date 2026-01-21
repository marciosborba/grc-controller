import { supabase } from '@/integrations/supabase/client';
import { createGLMService } from './glmService';
import { toast } from 'sonner';

export interface AuditResult {
    control_code: string;
    control_description: string;
    detected_evidence: string;
    adequacy_score: number;
    maturity_level: 'Initial' | 'Managed' | 'Defined' | 'Quantitatively Managed' | 'Optimizing';
    status: 'compliant' | 'partial' | 'non_compliant';
    framework_requirement_code?: string;
    user_notes?: string;
}

export const policyAuditorService = {
    /**
     * Fetches all active policies for the current tenant
     */
    getActivePolicies: async (tenantId: string) => {
        const { data, error } = await supabase
            .from('policies')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('is_active', true)
            .eq('status', 'published'); // Only published/active policies

        if (error) throw error;
        return data || [];
    },

    /**
     * Starts an automated audit for a specific policy against a framework
     */
    startAudit: async (policy: any, frameworkId: string, frameworkName: string, apiKey: string) => {
        try {
            // 1. Create Audit Session
            const { data: audit, error: auditError } = await supabase
                .from('policy_audits')
                .insert({
                    tenant_id: policy.tenant_id,
                    policy_id: policy.id,
                    framework_id: frameworkId,
                    framework_name: frameworkName,
                    status: 'in_progress'
                })
                .select()
                .single();

            if (auditError) throw auditError;

            // 2. Perform AI Analysis using GLMService
            const glmService = createGLMService(apiKey);

            // Extract text content from policy (assuming content is stored or document_url is processed - simplistic approach for now: using description/title + dummy text if content is empty JSON)
            const policyText = JSON.stringify(policy.content) + "\n" + (policy.description || "");

            // Analysis Prompt
            const systemPrompt = `You are an expert Auditor specializing in ${frameworkName} compliance. 
      Analyze the provided Policy text. Identify distinct internal controls mentioned or implied.
      For each control, determine:
      1. Review the requirement code from ${frameworkName} that matches (e.g., A.5.1, AC-2).
      2. Rate adequacy (0-100%) based on clarity and completeness.
      3. Rate CMMI maturity (Initial, Managed, Defined, Quantitatively Managed, Optimizing).
      4. Status (compliant, partial, non_compliant).
      
      Output ONLY a JSON array of objects with keys: control_code, control_description, detected_evidence (quote from text), framework_requirement_code, adequacy_score, maturity_level, status.`;

            const analysisResponse = await glmService.chatCompletion({
                model: 'glm-4',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Policy Title: ${policy.title}\n\nPolicy Content: ${policyText}` }
                ],
                temperature: 0.2
            });

            const aiContent = analysisResponse.choices[0]?.message?.content;

            // Parse JSON from AI response (robustness needed)
            let matches: AuditResult[] = [];
            try {
                const jsonMatch = aiContent.match(/\[.*\]/s);
                if (jsonMatch) {
                    matches = JSON.parse(jsonMatch[0]);
                } else {
                    console.warn("Could not parse JSON from AI response", aiContent);
                }
            } catch (e) {
                console.error("JSON Parse Error", e);
            }

            // 3. Save Remediation/Matches
            let totalAdequacy = 0;
            if (matches.length > 0) {
                const inserts = matches.map(m => ({
                    audit_id: audit.id,
                    control_code: m.control_code || 'DETECTED-001',
                    control_description: m.control_description,
                    detected_evidence: m.detected_evidence,
                    framework_requirement_code: m.framework_requirement_code,
                    adequacy_score: m.adequacy_score,
                    maturity_level: m.maturity_level,
                    status: m.status
                }));

                await supabase.from('policy_control_matches').insert(inserts);

                // Calculate Average Adequacy
                totalAdequacy = matches.reduce((acc, curr) => acc + (curr.adequacy_score || 0), 0) / matches.length;
            }

            // 4. Update Audit Status
            await supabase
                .from('policy_audits')
                .update({
                    status: 'completed',
                    adequacy_percentage: totalAdequacy
                })
                .eq('id', audit.id);

            return { auditId: audit.id, matches, totalAdequacy };

        } catch (error) {
            console.error('Audit failed:', error);
            throw error;
        }
    },

    /**
     * Fetch recent audits for the tenant
     */
    getAudits: async (tenantId: string) => {
        const { data, error } = await supabase
            .from('policy_audits')
            .select(`
        *,
        policies (title)
      `)
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Get details of a specific audit
     */
    getAuditDetails: async (auditId: string) => {
        const { data: audit, error: auditError } = await supabase
            .from('policy_audits')
            .select('*, policies(title)')
            .eq('id', auditId)
            .single();

        if (auditError) throw auditError;

        const { data: matches, error: matchesError } = await supabase
            .from('policy_control_matches')
            .select('*')
            .eq('audit_id', auditId);

        if (matchesError) throw matchesError;

        return { audit, matches };
    },

    /**
     * Update a control match (user editing)
     */
    updateControlMatch: async (matchId: string, updates: Partial<AuditResult>) => {
        const { error } = await supabase
            .from('policy_control_matches')
            .update(updates)
            .eq('id', matchId);

        if (error) throw error;
    }
};
