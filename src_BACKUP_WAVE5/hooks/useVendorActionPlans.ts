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
    vendor_id: string;
    created_at: string;
    updated_at: string;
    due_date: string | null;
    progress: number;
    activities?: ActionPlanActivity[];
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

// Helper functions for mapping
const mapPriorityToDB = (priority: string): string => {
    const map: Record<string, string> = {
        'low': 'baixa',
        'medium': 'media',
        'high': 'alta',
        'critical': 'critica'
    };
    return map[priority] || 'media';
};

const mapPriorityFromDB = (priority: string): 'low' | 'medium' | 'high' | 'critical' => {
    const map: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
        'baixa': 'low',
        'media': 'medium',
        'alta': 'high',
        'critica': 'critical'
    };
    return map[priority?.toLowerCase()] || 'medium';
};

const mapStatusToDB = (status: string): string => {
    const map: Record<string, string> = {
        'open': 'planejado',
        'in_progress': 'em_andamento',
        'completed': 'concluido',
        'verified': 'concluido' // Map verified to concluido for now
    };
    return map[status] || 'planejado';
};

const mapStatusFromDB = (status: string): 'open' | 'in_progress' | 'completed' | 'verified' => {
    const map: Record<string, 'open' | 'in_progress' | 'completed' | 'verified'> = {
        'planejado': 'open',
        'em_andamento': 'in_progress',
        'concluido': 'completed',
        'cancelado': 'completed' // Handle cancelled as completed/closed for now or add new status
    };
    return map[status?.toLowerCase()] || 'open';
};

export const useVendorActionPlans = () => {
    const { user } = useAuth();
    const { effectiveTenantId, isPlatformAdmin } = useEffectiveTenant();
    const { toast } = useToast();
    const [plans, setPlans] = useState<ActionPlan[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchPlans = useCallback(async () => {
        // Allow fetch if tenant selected OR platform admin (fetching all)
        if (!effectiveTenantId && !isPlatformAdmin) return;

        try {
            setLoading(true);
            let query = supabase
                .from('action_plans')
                .select(`
          *,
          action_plan_activities (
            id,
            titulo,
            descricao,
            status,
            prioridade,
            data_fim_planejada,
            responsavel_execucao,
            created_at,
            updated_at
          )
        `);

            if (effectiveTenantId) {
                query = query.eq('tenant_id', effectiveTenantId);
            }

            const { data, error } = await query
                .eq('modulo_origem', 'vendor_risk')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                // Map database fields to friendly interface
                const mappedPlans: ActionPlan[] = data.map(plan => {
                    const activities = plan.action_plan_activities?.map((activity: any) => ({
                        id: activity.id,
                        title: activity.titulo,
                        description: activity.descricao || '',
                        status: mapStatusFromDB(activity.status),
                        priority: mapPriorityFromDB(activity.prioridade),
                        due_date: activity.data_fim_planejada,
                        responsible_id: activity.responsavel_execucao,
                        created_at: activity.created_at,
                        updated_at: activity.updated_at,
                        action_plan_id: plan.id
                    })) || [];

                    // Calculate progress based on activities if strictly 0 in DB (or always rely on calc)
                    // Currently relying on calculation to ensure UI matches activities state
                    const calculatedProgress = activities.length > 0
                        ? Math.round((activities.filter(a => a.status === 'completed' || a.status === 'verified').length / activities.length) * 100)
                        : (plan.percentual_conclusao || 0);

                    return {
                        id: plan.id,
                        title: plan.titulo,
                        description: plan.descricao || '',
                        status: mapStatusFromDB(plan.status),
                        priority: mapPriorityFromDB(plan.prioridade),
                        vendor_id: plan.entidade_origem_id || '',
                        created_at: plan.created_at || new Date().toISOString(),
                        updated_at: plan.updated_at || new Date().toISOString(),
                        due_date: plan.data_fim_planejada,
                        progress: calculatedProgress,
                        activities: activities
                    };
                });
                setPlans(mappedPlans);
            }
        } catch (error: any) {
            console.error('Erro ao buscar planos de ação:', error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar os planos de ação",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [effectiveTenantId, isPlatformAdmin, toast]);

    const createPlan = async (data: {
        vendor_id: string;
        title: string;
        description: string;
        priority: string;
        due_date: string;
    }) => {
        if (!effectiveTenantId || !user?.id) {
            toast({ title: "Erro", description: "Selecione um tenant para criar o plano.", variant: "destructive" });
            return;
        }

        try {
            // First ensure we have a category for vendor risk
            // For now we'll fetch any category or insert a default one if needed
            // Simpler approach: verify if a default category exists
            let categoryId;
            const { data: categories } = await supabase
                .from('action_plan_categories')
                .select('id')
                .eq('tenant_id', effectiveTenantId)
                .limit(1);

            if (categories && categories.length > 0) {
                categoryId = categories[0].id;
            } else {
                // Fallback or handle error - for now assume user has setup categories or we can insert one
                // Let's create a default category if none exists
                const { data: newCat, error: catError } = await supabase
                    .from('action_plan_categories')
                    .insert({
                        nome: "Gestão de Riscos de Terceiros",
                        codigo: "VENDOR_RISK",
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
                    modulo_origem: 'vendor_risk',
                    entidade_origem_tipo: 'vendor',
                    entidade_origem_id: data.vendor_id,
                    category_id: categoryId || '00000000-0000-0000-0000-000000000000', // Warning: Needs valid UUID if FK enforced
                    created_by: user.id,
                    status: 'planejado',
                    codigo: `PLAN-${Date.now().toString().slice(-6)}` // Simple code generation
                })
                .select()
                .single();

            if (error) {
                console.error('Supabase error creating plan:', error);
                throw error;
            }

            toast({
                title: "Sucesso",
                description: "Plano de ação criado com sucesso"
            });

            fetchPlans();
            return newPlan;
        } catch (error: any) {
            console.error('Erro ao criar plano (catch):', error);
            toast({
                title: "Erro",
                description: "Não foi possível criar o plano de ação: " + (error.message || error.details || "Erro desconhecido"),
                variant: "destructive"
            });
            return null;
        }
    };

    const updatePlan = async (planId: string, data: {
        title: string;
        description: string;
        priority: string;
        due_date: string;
        status: string;
    }) => {
        try {
            const { error } = await supabase
                .from('action_plans')
                .update({
                    titulo: data.title,
                    descricao: data.description,
                    prioridade: mapPriorityToDB(data.priority),
                    data_fim_planejada: data.due_date || null,
                    status: mapStatusToDB(data.status),
                    updated_at: new Date().toISOString()
                })
                .eq('id', planId);

            if (error) throw error;

            toast({
                title: "Sucesso",
                description: "Plano de ação atualizado com sucesso"
            });

            fetchPlans();
            return true;
        } catch (error: any) {
            console.error('Erro ao atualizar plano:', error);
            toast({
                title: "Erro",
                description: "Não foi possível atualizar o plano",
                variant: "destructive"
            });
            return false;
        }
    };

    const updateActivity = async (activityId: string, data: {
        title: string;
        description: string;
        priority: string;
        due_date: string;
        status: string;
        responsible_id?: string;
    }) => {
        try {
            const { error } = await supabase
                .from('action_plan_activities')
                .update({
                    titulo: data.title,
                    descricao: data.description,
                    prioridade: mapPriorityToDB(data.priority),
                    data_fim_planejada: data.due_date,
                    status: mapStatusToDB(data.status),
                    responsavel_execucao: data.responsible_id,
                    percentual_conclusao: (data.status === 'completed' || data.status === 'verified') ? 100 : (data.status === 'open' ? 0 : undefined),
                    data_fim_real: (data.status === 'completed' || data.status === 'verified') ? new Date().toISOString() : (data.status === 'open' ? null : undefined),
                    updated_at: new Date().toISOString()
                })
                .eq('id', activityId);

            if (error) throw error;

            toast({ title: "Atualizado", description: "Atividade atualizada com sucesso." });
            fetchPlans();
            return true;
        } catch (error: any) {
            console.error('Erro ao atualizar atividade:', error);
            const msg = error.details || error.message || "Erro desconhecido";
            toast({ title: "Erro", description: `Falha ao atualizar atividade: ${msg}`, variant: "destructive" });
            return false;
        }
    };

    const addActivity = async (planId: string, data: {
        title: string;
        description: string;
        priority: string;
        due_date: string;
        responsible_id?: string;
    }) => {
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
                    data_inicio_planejada: new Date().toISOString() // Required field
                });

            if (error) throw error;

            toast({
                title: "Sucesso",
                description: "Atividade adicionada com sucesso"
            });
            fetchPlans();
        } catch (error: any) {
            console.error('Erro ao adicionar atividade:', error);
            toast({
                title: "Erro",
                description: "Não foi possível adicionar a atividade",
                variant: "destructive"
            });
        }
    };

    const updateActivityStatus = async (activityId: string, status: string) => {
        console.log('updateActivityStatus called', { activityId, status });
        // Optimistic Update
        const previousPlans = [...plans];
        setPlans(currentPlans => currentPlans.map(plan => {
            const updatedActivities = plan.activities?.map(activity =>
                activity.id === activityId
                    ? { ...activity, status: status as any }
                    : activity
            ) || [];

            // Recalculate progress for this plan
            const calculatedProgress = updatedActivities.length > 0
                ? Math.round((updatedActivities.filter(a => a.status === 'completed' || a.status === 'verified').length / updatedActivities.length) * 100)
                : plan.progress;

            return {
                ...plan,
                progress: calculatedProgress,
                activities: updatedActivities
            };
        }));

        try {
            const dbStatus = mapStatusToDB(status);
            const updates: any = { status: dbStatus };

            if (status === 'completed' || status === 'verified') {
                updates.percentual_conclusao = 100;
                updates.data_fim_real = new Date().toISOString();
            } else if (status === 'open') {
                updates.percentual_conclusao = 0;
                updates.data_fim_real = null;
            }

            const { error } = await supabase
                .from('action_plan_activities')
                .update(updates)
                .eq('id', activityId);

            if (error) throw error;

            toast({ title: "Atualizado", description: "Status da atividade atualizado." });
            fetchPlans();
        } catch (error: any) {
            console.error('Erro ao atualizar status:', error);
            // Revert optimistic update
            setPlans(previousPlans);
            const msg = error.details || error.message || "Erro desconhecido";
            toast({ title: "Erro", description: `Falha ao atualizar status: ${msg}`, variant: "destructive" });
        }
    };

    const deleteActivity = async (activityId: string) => {
        try {
            const { error } = await supabase
                .from('action_plan_activities')
                .delete()
                .eq('id', activityId);

            if (error) throw error;

            toast({ title: "Removido", description: "Atividade removida com sucesso." });
            fetchPlans();
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Falha ao remover atividade", variant: "destructive" });
        }
    };


    return {
        plans,
        loading,
        fetchPlans,
        createPlan,
        addActivity,
        updateActivityStatus,
        deleteActivity,
        updatePlan,
        updateActivity
    };
};
