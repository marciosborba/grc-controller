import { supabase } from '@/integrations/supabase/client';
import { createGLMService } from './glmService';
import { toast } from 'sonner';
import { aiConfigService } from '@/services/aiConfigService';

// Helper for parsing JSON from AI response
const parseAIJSONResponse = (aiContent: string | null | undefined): any[] => {
    if (!aiContent) return [];
    try {
        // Remove markdown code blocks if present
        let cleanContent = aiContent.replace(/```json\n?|```/g, '').trim();

        // Try strict parse on cleaned content
        return JSON.parse(cleanContent);
    } catch (e) {
        // Try to find JSON array in markdown/text if strict parse failed
        try {
            const jsonMatch = aiContent.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (e2) {
            console.error("JSON Parse Error", e2);
            console.log("Raw Content that failed to parse:", aiContent);
        }
    }
    return [];
};

export interface AuditResult {
    control_code: string;
    control_description: string;
    detected_evidence: string;
    adequacy_score: number;
    maturity_level: 'Initial' | 'Managed' | 'Defined' | 'Quantitatively Managed' | 'Optimizing' | 'Not Assessed' | null;
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
     * Fetch available reference frameworks (Both Standard and Custom)
     */
    getFrameworks: async (tenantId?: string) => {
        let query = supabase
            .from('frameworks_compliance')
            .select('id, name:nome, description:descricao, is_standard')
            .eq('status', 'ativo')
            .order('nome');

        if (tenantId) {
            // Fetch both standard (global) and custom (tenant) frameworks
            query = query.or(`is_standard.eq.true,tenant_id.eq.${tenantId}`);
        } else {
            // Fallback if no tenantId provided (should usually be provided)
            query = query.eq('is_standard', true);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching frameworks:", error);
            return [];
        }
        return data || [];
    },

    /**
     * Fetch requirements for a specific framework
     */
    getFrameworkRequirements: async (frameworkId: string) => {
        const { data, error } = await supabase
            .from('requisitos_compliance')
            .select('codigo, titulo, descricao, criterios_conformidade')
            .eq('framework_id', frameworkId)
            .order('codigo');

        if (error) {
            console.error("Error fetching requirements:", error);
            return [];
        }
        return data || [];
    },

    /**
     * Starts an automated audit for a specific policy against a framework
     */
    startAudit: async (policy: any, frameworkId: string, frameworkName: string, provider: any) => {
        let auditId: string | null = null;
        try {
            // 0. Fetch Framework Requirements Context
            const requirements = await policyAuditorService.getFrameworkRequirements(frameworkId);

            // Limit context size if too large (naive approach, can be improved)
            // Format: "Code: Title - Description (Criteria)"
            // Format: "Code: Title - Description" (Trimmed to reduce tokens)
            // We prioritize criteria, then description.
            const requirementsContext = requirements.map(r => {
                const combinedDesc = r.criterios_conformidade || r.descricao || '';
                // Limit description length per item to avoid massive context
                const truncatedDesc = combinedDesc.length > 100 ? combinedDesc.substring(0, 100) + '...' : combinedDesc;
                return `[${r.codigo}] ${r.titulo}: ${truncatedDesc}`;
            }).join('\n');

            if (!requirementsContext) {
                throw new Error("Framework has no requirements defined. Please check 'Gestão de Frameworks'.");
            }

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
            auditId = audit.id;

            // Extract text content from policy
            const policyText = typeof policy.content === 'object'
                ? JSON.stringify(policy.content)
                : String(policy.content || "");

            console.log(`[PolicyAuditor] Starting Audit. Policy Length: ${policyText.length}, Framework: ${frameworkName}`);
            console.log(`[PolicyAuditor] Requirements Context Length: ${requirementsContext.length}`);

            // Analysis Prompt
            // 0. Fetch (or Create) Prompt Template
            // 0. Fetch (or Create) Prompt Template
            let systemPromptTemplate = "";
            try {
                // 1. Try Function Mapping (Priority 1)
                const mappedTemplate = await aiConfigService.getPromptForFunction(policy.tenant_id, 'audit');
                if (mappedTemplate && mappedTemplate.template_content) {
                    console.log(`[PolicyAuditor] Using Mapped Prompt: ${mappedTemplate.name}`);
                    systemPromptTemplate = mappedTemplate.template_content;
                }

                // 2. Fallback to Standard Name (Priority 2)
                if (!systemPromptTemplate) {
                    const templates = await aiConfigService.getPrompts(policy.tenant_id);
                    const auditTemplate = templates.find(t => t.name === 'Policy Auditor Standard' && t.is_active);
                    if (auditTemplate && auditTemplate.template_content) {
                        console.log(`[PolicyAuditor] Using Standard Prompt: ${auditTemplate.name}`);
                        systemPromptTemplate = auditTemplate.template_content;
                    }
                }

                // 3. Last Resort Hardcoded Fallback
                if (!systemPromptTemplate) {
                    // Default Prompt
                    systemPromptTemplate = `You are an expert GRC Auditor ...`; // (Keeping the existing hardcoded fallback logic below if needed, or inline here)

                    systemPromptTemplate = `You are an expert GRC Auditor specializing in {{framework_name}} compliance.
      
REFERENCED FRAMEWORK REQUIREMENTS:
{{requirements_context}}

TASK:
Analyze the provided Policy content (which may be in JSON/Editor format or plain text) against the above requirements.
GOAL: Determine if the policy text covers the required controls.

INSTRUCTIONS:
1.  Read the "Policy Content" carefully. If it is a JSON object, look at the "text" or "content" fields to extract the actual meaning.
2.  Map specific paragraphs/statements in the policy to the Framework Requirements provided above.
3.  If a Requirement is addressed by the policy, create a match entry.
4.  If a Requirement is NOT addressed but SHOULD be, create a match entry with "non_compliant" status and 0 adequacy.
5.  DO NOT return one single generic match. Break it down by specific requirements found or missing.

OUTPUT FORMAT (JSON Array only):
[{
  "control_code": "Reference to Policy Section (e.g. 1.2)", 
  "control_description": "Summary of the policy statement analyzed",
  "detected_evidence": "Exact quote from policy (max 100 chars)",
  "framework_requirement_code": "The Matching Code from Reference (e.g. A.5.1)", 
  "adequacy_score": 0-100,
  "maturity_level": "Initial" | "Managed" | "Defined" | "Quantitatively Managed" | "Optimizing",
  "status": "compliant" | "partial" | "non_compliant"
}]

Only output the JSON array. Do not include markdown formatting like \`\`\`json.`;
                }
            } catch (err) {
                console.error("Error loading prompt template", err);
            }

            // Fallback if template logic completely failed
            if (!systemPromptTemplate) systemPromptTemplate = `You are an expert Auditor...`;

            // Interpolate Variables
            const systemPrompt = systemPromptTemplate
                .replace(/{{framework_name}}/g, frameworkName)
                .replace(/{{requirements_context}}/g, requirementsContext);

            let matches: AuditResult[] = [];

            // 2. Perform AI Analysis (Using Edge Function to avoid CORS)
            console.log("[PolicyAuditor] Invoke Edge Function for Audit...");

            // Combine instructions and content into a single robust user prompt
            // Combine instructions and content into a single robust user prompt (User Context only)
            const userPrompt = `
POLICY TO ANALYZE:
Policy Title: ${policy.title}
Policy Content:
${policyText}
`;

            // Invoke Supabase Edge Function
            const { data: funcData, error: funcError } = await supabase.functions.invoke('ai-chat-glm', {
                body: {
                    prompt: userPrompt,
                    system_prompt: systemPrompt, // Explicit override
                    type: 'audit',
                }
            });

            if (funcError) {
                console.error("❌ Edge Function Network/Invoke Error:", funcError);
                throw new Error(`Edge Function Failed: ${funcError.message || JSON.stringify(funcError)}`);
            }

            // Check if function returned an application-level error
            if (funcData && funcData.error) {
                console.error("❌ Edge Function Application Error:", funcData.error);
                throw new Error(`AI Generation Error: ${funcData.error}`);
            }

            if (!funcData || !funcData.response) {
                console.error("❌ Empty Response from Edge Function. Data received:", funcData);
                throw new Error("Edge Function returned empty response");
            }

            const aiContent = funcData.response;
            console.log("[PolicyAuditor] Raw AI Response (Edge):", aiContent);
            matches = parseAIJSONResponse(aiContent);

            // Log Usage
            if (provider && aiConfigService) {
                const usage = funcData.usage || {
                    prompt_tokens: Math.ceil(userPrompt.length / 4),
                    completion_tokens: Math.ceil(aiContent.length / 4),
                    total_tokens: Math.ceil((userPrompt.length + aiContent.length) / 4)
                };

                await aiConfigService.logUsage(
                    policy.tenant_id,
                    provider.id,
                    provider.model_name,
                    usage,
                    'prompt-execution' // Corrected: Must match check constraint
                );
            }

            // 3. Save Remediation/Matches
            let totalAdequacy = 0;
            if (matches.length > 0) {
                const inserts = matches.map(m => {
                    // Enforce strict rules for non-compliant
                    if (m.status === 'non_compliant') {
                        return {
                            audit_id: audit.id,
                            control_code: m.control_code || 'MISSING',
                            control_description: m.control_description,
                            detected_evidence: m.detected_evidence,
                            framework_requirement_code: m.framework_requirement_code,
                            adequacy_score: 0, // Force 0
                            maturity_level: 'Initial', // Force Initial
                            status: 'non_compliant'
                        };
                    }

                    return {
                        audit_id: audit.id,
                        control_code: m.control_code || 'DETECTED-001',
                        control_description: m.control_description,
                        detected_evidence: m.detected_evidence,
                        framework_requirement_code: m.framework_requirement_code,
                        adequacy_score: m.adequacy_score,
                        maturity_level: m.maturity_level,
                        status: m.status
                    };
                });

                const { error: insertError } = await supabase.from('policy_control_matches').insert(inserts);
                if (insertError) {
                    console.error("Error saving matches:", insertError);
                    throw insertError;
                }

                // Calculate Adherence (Sum of Scores / (Total Requirements * 100)) * 100
                const sumScores = matches.reduce((acc, curr) => acc + (curr.adequacy_score || 0), 0);
                const maxPossibleScore = requirements.length * 100;

                // Avoid division by zero
                totalAdequacy = maxPossibleScore > 0 ? (sumScores / maxPossibleScore) * 100 : 0;
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

        } catch (error: any) {
            console.log('❌ [PolicyAuditor] CRITICAL AUDIT FAILURE ❌');
            console.log('Error Details:', error.message);
            console.log('Full Error Object:', error);

            // Show toast to user
            toast.error(`Falha na Auditoria: ${error.message}`);

            // Mark audit as failed if we have an ID
            if (auditId) {
                try {
                    await supabase
                        .from('policy_audits')
                        .update({
                            status: 'failed',
                            adequacy_percentage: 0
                        })
                        .eq('id', auditId);
                    console.log(`[PolicyAuditor] Marked audit ${auditId} as failed. REASON: ${error?.message || 'Unknown'}`);
                    toast.error(`FALHA CRÍTICA NA AUDITORIA: ${error?.message || 'Erro desconhecido'}`);
                } catch (updateErr) {
                    console.error("Failed to update audit status to failed:", updateErr);
                }
            }
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
            .eq('audit_id', auditId)
            .order('framework_requirement_code', { ascending: true });

        if (matchesError) throw matchesError;

        // Fetch total requirements count and details for the framework
        const { data: requirements, count } = await supabase
            .from('requisitos_compliance')
            .select('*', { count: 'exact' })
            .eq('framework_id', audit.framework_id);

        const enrichedMatches = matches?.map(m => {
            const req = requirements?.find(r => r.codigo === m.framework_requirement_code);
            return {
                ...m,
                framework_title: req?.titulo,
                framework_description: req?.descricao
            };
        }).sort((a, b) => {
            // Robust Natural Sort
            const codeA = a.framework_requirement_code || '';
            const codeB = b.framework_requirement_code || '';

            // Split into chunks of explicit numbers and non-numbers
            // e.g. "A.5.2" -> ["A", ".", "5", ".", "2"]
            const regex = /(\d+)|(\D+)/g;
            const partsA = codeA.match(regex) || [];
            const partsB = codeB.match(regex) || [];

            for (let i = 0; i < Math.min(partsA.length, partsB.length); i++) {
                const partA = partsA[i];
                const partB = partsB[i];

                const numA = parseInt(partA, 10);
                const numB = parseInt(partB, 10);

                // If both are numbers, compare numerically
                if (!isNaN(numA) && !isNaN(numB)) {
                    if (numA !== numB) return numA - numB;
                } else {
                    // Otherwise compare as strings
                    if (partA !== partB) return partA.localeCompare(partB);
                }
            }

            return partsA.length - partsB.length;
        }) || [];

        return { audit, matches: enrichedMatches, totalRequirements: count || 0 };
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
    },

    /**
     * Delete an audit and its results
     */
    deleteAudit: async (auditId: string) => {
        // Matches are cascaded usually, but good to be safe or rely on cascade
        // Assuming database has ON DELETE CASCADE on policy_control_matches linked to audit_id

        const { error } = await supabase
            .from('policy_audits')
            .delete()
            .eq('id', auditId);

        if (error) throw error;
    }
};
