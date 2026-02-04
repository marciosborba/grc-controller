
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';

export const useAssessmentIntegration = () => {
    const { user } = useAuth();
    const tenantId = useCurrentTenantId();

    // State
    const [loading, setLoading] = useState(true);
    const [assessments, setAssessments] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState(0);

    // Pagination
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);

    // Sorting
    const [sortBy, setSortBy] = useState<string>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all'); // Assessments table has 'configuracoes_especiais->prioridade'

    // Metrics (Server-Side)
    const [metrics, setMetrics] = useState({
        total: 0,
        active: 0,
        completed: 0,
        pending: 0,
        reviewPending: 0,
        avgMaturity: 0,
        frameworks: 0,
        complianceRate: 0,
        overdue: 0
    });

    // Aux Data
    const [frameworks, setFrameworks] = useState<any[]>([]);
    const [availableUsers, setAvailableUsers] = useState<any[]>([]);

    // List Refresh Trigger
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Actions
    const createAssessment = async (assessmentData: any) => {
        const { data, error } = await supabase
            .from('assessments')
            .insert([assessmentData])
            .select()
            .single();

        if (error) throw error;
        setRefreshTrigger(prev => prev + 1);
        loadMetrics();
        return data;
    };

    const addAssessmentEvaluators = async (evaluatorsData: any[]) => {
        const { error } = await supabase
            .from('assessment_user_roles')
            .insert(evaluatorsData);

        if (error) throw error;
    };

    // Load Frameworks
    const loadFrameworks = useCallback(async () => {
        if (!tenantId) return;
        try {
            const { data, error } = await supabase
                .from('assessment_frameworks')
                .select('*')
                .eq('tenant_id', tenantId)
                .eq('status', 'ativo')
                .eq('is_standard', false)
                .order('nome');

            if (error) throw error;

            // Deduplicate
            const uniqueFrameworks = Array.from(
                new Map((data || []).map(f => [f.id, f])).values()
            );
            setFrameworks(uniqueFrameworks);
        } catch (err) {
            console.error('Error loading frameworks:', err);
        }
    }, [tenantId]);

    // Load Users
    const loadAvailableUsers = useCallback(async () => {
        if (!tenantId) return;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, email, tenant_id')
                .or(`tenant_id.eq.${tenantId}, tenant_id.is.null`)
                .order('full_name');

            if (error) throw error;

            // Deduplicate
            const usersMap = new Map();
            (data || []).forEach(u => {
                if (u.email && !usersMap.has(u.email)) {
                    usersMap.set(u.email, u);
                }
            });
            setAvailableUsers(Array.from(usersMap.values()));
        } catch (err) {
            console.error('Error loading users:', err);
        }
    }, [tenantId]);

    // Load Metrics (Independent of List Filters)
    const loadMetrics = useCallback(async () => {
        if (!tenantId) return;

        try {
            // 1. Base query for assessments counts
            const { data: allAssessments, error } = await supabase
                .from('assessments')
                .select('status, percentual_maturidade, data_fim_planejada, percentual_conclusao')
                .eq('tenant_id', tenantId);

            if (error) throw error;

            // 2. Frameworks count (use existing functionality or re-fetch for count specifically if frameworks list not loaded)
            // We can use the frameworks state if loaded, but to be safe and independent:
            const { count: fwCount } = await supabase
                .from('assessment_frameworks')
                .select('*', { count: 'exact', head: true })
                .eq('tenant_id', tenantId);

            const total = allAssessments?.length || 0;
            const completed = allAssessments?.filter(a => a.status === 'concluido').length || 0;
            const active = allAssessments?.filter(a => ['em_andamento', 'em_execucao'].includes(a.status)).length || 0;
            const pending = allAssessments?.filter(a => a.status === 'planejado').length || 0;
            const reviewPending = allAssessments?.filter(a => a.status === 'aguardando_revisao').length || 0;

            const avgMaturity = total > 0
                ? Math.round((allAssessments?.reduce((sum, a) => sum + (a.percentual_maturidade || 0), 0) || 0) / total)
                : 0;

            // Overdue calculation
            const today = new Date().toISOString().split('T')[0];
            const overdue = allAssessments?.filter(a =>
                a.data_fim_planejada &&
                a.data_fim_planejada < today &&
                a.status !== 'concluido'
            ).length || 0;

            const complianceRate = total > 0 ? Math.round((completed / total) * 100) : 0;

            setMetrics({
                total,
                active,
                completed,
                pending,
                reviewPending,
                avgMaturity,
                frameworks: fwCount || 0,
                complianceRate,
                overdue
            });

        } catch (err) {
            console.error('Error loading assessment metrics:', err);
        }
    }, [tenantId]);

    // Load List Data
    useEffect(() => {
        let isMounted = true;

        const fetchAssessments = async () => {
            if (!tenantId) return;
            setLoading(true);

            try {
                let query = supabase
                    .from('assessments')
                    .select(`
            *,
            framework:assessment_frameworks(nome, tipo_framework)
          `, { count: 'exact' })
                    .eq('tenant_id', tenantId);

                // Filters
                if (statusFilter !== 'all') {
                    query = query.eq('status', statusFilter);
                }

                // Priority Filter - stored in JSONB 'configuracoes_especiais'
                if (priorityFilter !== 'all') {
                    // JSONB filtering syntax: configuracoes_especiais->>'prioridade'
                    query = query.eq('configuracoes_especiais->>prioridade', priorityFilter);
                }

                if (searchTerm) {
                    query = query.or(`titulo.ilike.%${searchTerm}%,codigo.ilike.%${searchTerm}%`);
                }

                // Sorting
                query = query.order(sortBy, { ascending: sortOrder === 'asc' });

                // Pagination
                const from = (page - 1) * perPage;
                const to = from + perPage - 1;
                query = query.range(from, to);

                const { data, count, error } = await query;

                if (error) throw error;

                if (isMounted) {
                    setAssessments(data || []);
                    setTotalItems(count || 0);
                }
            } catch (err) {
                console.error('Error fetching assessments:', err);
                toast.error('Erro ao carregar assessments');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchAssessments();
        }, 500);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [tenantId, page, perPage, sortBy, sortOrder, statusFilter, priorityFilter, searchTerm, refreshTrigger]);

    // Load metrics initially and when tenant changes
    useEffect(() => {
        loadMetrics();
        loadFrameworks();
        loadAvailableUsers();
    }, [loadMetrics, loadFrameworks, loadAvailableUsers]);

    const updateAssessment = async (id: string, updates: any) => {
        const { error } = await supabase
            .from('assessments')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
        setRefreshTrigger(prev => prev + 1);
        loadMetrics();
    };

    const deleteAssessment = async (id: string) => {
        // Manually delete dependencies to ensure clean removal
        // 1. Responses
        await supabase.from('assessment_responses').delete().eq('assessment_id', id);
        // 2. Action Plans
        await supabase.from('assessment_action_plans').delete().eq('assessment_id', id);
        // 3. User Roles
        await supabase.from('assessment_user_roles').delete().eq('assessment_id', id);
        // 4. History (if exists)
        // await supabase.from('assessment_history').delete().eq('assessment_id', id);
        // 5. Reports (Missing dependency found)
        await supabase.from('assessment_reports').delete().eq('assessment_id', id);

        // Finally, delete the assessment
        const { error } = await supabase
            .from('assessments')
            .delete()
            .eq('id', id);

        if (error) throw error;
        // Refresh both list and metrics
        setRefreshTrigger(prev => prev + 1);
        loadMetrics();
    };

    return {
        assessments,
        loading,
        metrics,
        page,
        setPage,
        perPage,
        totalItems,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        statusFilter,
        setStatusFilter,
        priorityFilter,
        setPriorityFilter,
        searchTerm,
        setSearchTerm,
        refreshMetrics: loadMetrics,
        frameworks,
        availableUsers,
        createAssessment,
        updateAssessment,
        deleteAssessment,
        addAssessmentEvaluators,
        refreshList: () => {
            setRefreshTrigger(prev => prev + 1);
            loadMetrics();
        }
    };
};
