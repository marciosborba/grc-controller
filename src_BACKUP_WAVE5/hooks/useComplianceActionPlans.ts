import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useToast } from '@/hooks/use-toast';
import { useEffectiveTenant } from '@/hooks/useEffectiveTenant';

export interface ActionPlan {
    id: string;
    title: string;
    description: string;
    status: 'open' | 'in_progress' | 'completed' | 'verified';
    priority: 'low' | 'medium' | 'high' | 'critical';
    created_at: string;
    updated_at: string;
    due_date: string | null;
    progress: number;
    activities?: ActionPlanActivity[];

    // Compliance specific fields (mapped from metadados or other columns)
    nao_conformidade_id?: string;
    causa_raiz?: string;
    objetivo?: string;
    category?: string;

    // Display helpers
    responsavel_nome?: string;
    responsavel_id?: string;
    nao_conformidade_titulo?: string;
}

export interface ActionPlanActivity {
    id: string;
    title: string;
    description: string;
    status: 'open' | 'in_progress' | 'completed' | 'verified';
    priority: 'low' | 'medium' | 'high' | 'critical';
    due_date: string;
    responsible_id: string | null;
    responsible_name?: string;
    created_at: string;
    updated_at: string;
    action_plan_id: string;
}

// Helpers mirroring useVendorActionPlans for consistency
const mapPriorityToDB = (priority: string): string => {
    const map: Record<string, string> = { 'low': 'baixa', 'medium': 'media', 'high': 'alta', 'critical': 'critica' };
    return map[priority] || 'media';
};

const mapPriorityFromDB = (priority: string): 'low' | 'medium' | 'high' | 'critical' => {
    const map: Record<string, 'low' | 'medium' | 'high' | 'critical'> = { 'baixa': 'low', 'media': 'medium', 'alta': 'high', 'critica': 'critical' };
    return map[priority?.toLowerCase()] || 'medium';
};

const mapStatusToDB = (status: string): string => {
    const map: Record<string, string> = { 'open': 'planejado', 'in_progress': 'em_andamento', 'completed': 'concluido', 'verified': 'concluido' };
    return map[status] || 'planejado';
};

const mapStatusFromDB = (status: string): 'open' | 'in_progress' | 'completed' | 'verified' => {
    const map: Record<string, 'open' | 'in_progress' | 'completed' | 'verified'> = { 'planejado': 'open', 'em_andamento': 'in_progress', 'concluido': 'completed', 'verified': 'verified' };
    return map[status?.toLowerCase()] || 'open';
};

export const useComplianceActionPlans = () => {
    const { user } = useAuth();
    const { effectiveTenantId, isPlatformAdmin } = useEffectiveTenant();
    const { toast } = useToast();
    const [plans, setPlans] = useState<ActionPlan[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchPlans = useCallback(async () => {
        if (!effectiveTenantId && !isPlatformAdmin) return;

        try {
            setLoading(true);
            let query = supabase
                .from('action_plans')
                .select(`
                    *,
                    responsavel_profile:profiles!action_plans_responsavel_plano_fkey(full_name),
                    action_plan_activities (
                        id, titulo, descricao, status, prioridade, data_fim_planejada,
                        responsavel_execucao, created_at, updated_at,
                        responsavel:profiles!action_plan_activities_responsavel_execucao_fkey(full_name)
                    )
                `);

            if (effectiveTenantId) {
                query = query.eq('tenant_id', effectiveTenantId);
            }

            const { data, error } = await query
                .eq('modulo_origem', 'compliance')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                // Fetch related info (e.g. Non Conformity titles) manually if needed or via join if FK exists
                // The generic action_plans table might link via entidade_origem_id to non-conformities

                const mappedPlans: ActionPlan[] = await Promise.all(data.map(async (plan) => {
                    // Enrich with non-conformity title if needed
                    let ncTitle = 'N/A';
                    if (plan.entidade_origem_id) {
                        // Optional: could fetch this in a separate query or join if possible. 
                        // strict implementation would batch this. For now let's keep it simple.
                        // We will rely on mapped metadata if possible, or fetch singly (optimized later)
                    }

                    const activities = plan.action_plan_activities?.map((activity: any) => ({
                        id: activity.id,
                        title: activity.titulo,
                        description: activity.descricao || '',
                        status: mapStatusFromDB(activity.status),
                        priority: mapPriorityFromDB(activity.prioridade),
                        due_date: activity.data_fim_planejada,
                        responsible_id: activity.responsavel_execucao,
                        responsible_name: activity.responsavel?.full_name || 'Não atribuído',
                        created_at: activity.created_at,
                        updated_at: activity.updated_at,
                        action_plan_id: plan.id
                    })) || [];

                    // Calculate progress
                    const calculatedProgress = activities.length > 0
                        ? Math.round((activities.filter(a => a.status === 'completed' || a.status === 'verified').length / activities.length) * 100)
                        : (plan.percentual_conclusao || 0);

                    return {
                        id: plan.id,
                        title: plan.titulo,
                        description: plan.descricao || '',
                        status: mapStatusFromDB(plan.status),
                        priority: mapPriorityFromDB(plan.prioridade),
                        created_at: plan.created_at,
                        updated_at: plan.updated_at,
                        due_date: plan.data_fim_planejada,
                        progress: calculatedProgress,
                        activities: activities,

                        // Mapped fields
                        nao_conformidade_id: plan.entidade_origem_id, // assuming linked to NC ID
                        causa_raiz: plan.metadados?.causa_raiz,
                        objetivo: plan.objetivo,
                        category: '', // category logic can be added later
                        responsavel_nome: plan.responsavel_profile?.full_name,
                        responsavel_id: plan.responsavel_plano
                    };
                }));
                setPlans(mappedPlans);
            }
        } catch (error: any) {
            console.error('Erro ao buscar planos de conformidade:', error);
            toast({ title: "Erro", description: "Falha ao carregar planos de ação.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [effectiveTenantId, isPlatformAdmin, toast]);

    const createPlan = async (data: {
        title: string;
        description: string;
        priority: string;
        due_date: string;
        nao_conformidade_id?: string;
        causa_raiz?: string;
        objetivo?: string;
        responsavel_id?: string;
    }) => {
        if (!effectiveTenantId || !user?.id) return;

        try {
            // Get or create category 'Conformidade'
            let categoryId;
            const { data: categories } = await supabase
                .from('action_plan_categories')
                .select('id')
                .eq('tenant_id', effectiveTenantId)
                .eq('codigo', 'COMPLIANCE')
                .maybeSingle(); // Changed from Limit(1) to maybeSingle for clarity

            if (categories) {
                categoryId = categories.id;
            } else {
                const { data: newCat } = await supabase
                    .from('action_plan_categories')
                    .insert({
                        nome: "Conformidade",
                        codigo: "COMPLIANCE",
                        tenant_id: effectiveTenantId,
                        created_by: user.id
                    })
                    .select()
                    .single();
                if (newCat) categoryId = newCat.id;
            }

            const { data: newPlan, error } = await supabase
                .from('action_plans')
                .insert({
                    tenant_id: effectiveTenantId,
                    titulo: data.title,
                    descricao: data.description,
                    prioridade: mapPriorityToDB(data.priority),
                    data_fim_planejada: data.due_date || null,
                    modulo_origem: 'compliance',
                    entidade_origem_tipo: 'non_conformity',
                    entidade_origem_id: data.nao_conformidade_id,
                    responsavel_plano: data.responsavel_id,
                    objetivo: data.objetivo,
                    category_id: categoryId || '00000000-0000-0000-0000-000000000000',
                    created_by: user.id,
                    status: 'planejado',
                    codigo: `PAC-${Date.now().toString().slice(-6)}`,
                    metadados: {
                        causa_raiz: data.causa_raiz
                    }
                })
                .select()
                .single();

            if (error) throw error;

            toast({ title: "Sucesso", description: "Plano de ação criado com sucesso." });
            fetchPlans();
            return newPlan;

        } catch (error: any) {
            console.error('Erro ao criar plano:', error);
            toast({ title: "Erro", description: "Falha ao criar plano.", variant: "destructive" });
        }
    };

    const updatePlan = async (planId: string, data: Partial<ActionPlan>) => {
        try {
            const updates: any = {
                updated_at: new Date().toISOString()
            };
            if (data.title) updates.titulo = data.title;
            if (data.description) updates.descricao = data.description;
            if (data.priority) updates.prioridade = mapPriorityToDB(data.priority);
            if (data.due_date) updates.data_fim_planejada = data.due_date;
            if (data.status) updates.status = mapStatusToDB(data.status);
            if (data.objetivo) updates.objetivo = data.objetivo;
            if (data.responsavel_id) updates.responsavel_plano = data.responsavel_id;
            // Handle metadata updates selectively to avoid overwriting
            if (data.causa_raiz) {
                // ideally verify existing metadata first, for now we assume simple structure
                const existing = plans.find(p => p.id === planId);
                updates.metadados = { ...existing, causa_raiz: data.causa_raiz };
            }

            const { error } = await supabase
                .from('action_plans')
                .update(updates)
                .eq('id', planId);

            if (error) throw error;

            toast({ title: "Sucesso", description: "Plano atualizado." });
            fetchPlans();
            return true;
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Falha ao atualizar plano.", variant: "destructive" });
            return false;
        }
    };

    const addActivity = async (planId: string, data: any) => {
        // ... (Similar implementation to Vendor Hook)
        if (!effectiveTenantId || !user?.id) return;

        try {
            const { error } = await supabase
                .from('action_plan_activities')
                .insert({
                    tenant_id: effectiveTenantId,
                    action_plan_id: planId,
                    titulo: data.title,
                    descricao: data.description,
                    prioridade: mapPriorityToDB(data.priority),
                    data_fim_planejada: data.due_date,
                    responsavel_execucao: data.responsible_id,
                    created_by: user.id,
                    status: 'planejado',
                    data_inicio_planejada: new Date().toISOString()
                });

            if (error) throw error;
            toast({ title: "Sucesso", description: "Atividade adicionada." });
            fetchPlans();
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Falha ao adicionar atividade.", variant: "destructive" });
        }
    };



    const updateActivity = async (activityId: string, data: any) => {
        if (!effectiveTenantId || !user?.id) return false;

        try {
            const updates: any = {
                updated_at: new Date().toISOString()
            };
            if (data.title) updates.titulo = data.title;
            if (data.description) updates.descricao = data.description;
            if (data.priority) updates.prioridade = mapPriorityToDB(data.priority);
            if (data.due_date) updates.data_fim_planejada = data.due_date;
            if (data.responsible_id) updates.responsavel_execucao = data.responsible_id;
            if (data.status) updates.status = mapStatusToDB(data.status);

            const { error } = await supabase
                .from('action_plan_activities')
                .update(updates)
                .eq('id', activityId);

            if (error) throw error;
            toast({ title: "Sucesso", description: "Atividade atualizada." });
            fetchPlans();
            return true;
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Falha ao atualizar atividade.", variant: "destructive" });
            return false;
        }
    };

    const deleteActivity = async (activityId: string) => {
        try {
            const { error } = await supabase
                .from('action_plan_activities')
                .delete()
                .eq('id', activityId);

            if (error) throw error;
            toast({ title: "Sucesso", description: "Atividade removida." });
            fetchPlans();
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Falha ao remover atividade.", variant: "destructive" });
        }
    };

    const updateActivityStatus = async (activityId: string, status: string) => {
        try {
            const dbStatus = mapStatusToDB(status);
            const updates: any = { status: dbStatus };

            if (['completed', 'verified'].includes(status)) {
                updates.percentual_conclusao = 100;
                updates.data_fim_real = new Date().toISOString();
            } else if (status === 'open') {
                updates.percentual_conclusao = 0;
                updates.data_fim_real = null;
            }

            const { error } = await supabase.from('action_plan_activities').update(updates).eq('id', activityId);
            if (error) throw error;

            fetchPlans(); // Refresh to recalc progress
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Falha ao atualizar status.", variant: "destructive" });
        }
    };

    return {
        plans,
        loading,
        fetchPlans,
        createPlan,
        updatePlan,
        addActivity,
        updateActivity,
        deleteActivity,
        updateActivityStatus
    };
};
