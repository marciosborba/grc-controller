import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AuditProject {
    id: string;
    codigo: string;
    titulo: string;
    descricao: string;
    status: 'planejamento' | 'execucao' | 'achados' | 'relatorio' | 'followup' | 'concluido' | 'suspenso';
    fase_atual: string;
    progresso_geral: number;
    auditor_lider: string;
    data_inicio: string;
    data_fim_prevista: string;
    prioridade: 'baixa' | 'media' | 'alta' | 'critica';
    area_auditada: string;
    tipo_auditoria: string;

    // Métricas calculadas
    total_trabalhos: number;
    trabalhos_concluidos: number;
    total_apontamentos: number;
    apontamentos_criticos: number;
    planos_acao: number;

    // Completude por fase
    completude_planejamento: number;
    completude_execucao: number;
    completude_achados: number;
    completude_relatorio: number;
    completude_followup: number;
}

export interface AuditMetrics {
    total_projetos: number;
    projetos_ativos: number;
    projetos_concluidos: number;
    projetos_atrasados: number;
    total_apontamentos: number;
    apontamentos_criticos: number;
    taxa_conclusao: number;
    cobertura_auditoria: number;
}

export const useAuditIntegration = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState<AuditProject[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // Sorting State
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Filter State
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Metrics State
    const [metrics, setMetrics] = useState<AuditMetrics>({
        total_projetos: 0,
        projetos_ativos: 0,
        projetos_concluidos: 0,
        projetos_atrasados: 0,
        total_apontamentos: 0,
        apontamentos_criticos: 0,
        taxa_conclusao: 0,
        cobertura_auditoria: 0
    });

    // Determine effective tenant ID
    const effectiveTenantId = user?.tenantId;

    useEffect(() => {
        if (effectiveTenantId) {
            const delayDebounceFn = setTimeout(() => {
                loadProjects();
            }, 300);

            loadMetrics();

            return () => clearTimeout(delayDebounceFn);
        }
    }, [effectiveTenantId, page, perPage, sortBy, sortOrder, statusFilter, priorityFilter, searchTerm]);

    const loadMetrics = async () => {
        try {
            // Fetch global stats (ignoring pagination and filters)
            const { data: projectsData, error } = await supabase
                .from('projetos_auditoria')
                .select(`
          id, 
          status, 
          prioridade, 
          data_fim_planejada,
          apontamentos_auditoria(id, criticidade)
        `)
                .eq('tenant_id', effectiveTenantId);

            if (error) throw error;

            const allProjects = projectsData || [];
            const total = allProjects.length;

            const ativos = allProjects.filter(p => ['planejamento', 'execucao', 'achados', 'relatorio'].includes(p.status)).length;
            const concluidos = allProjects.filter(p => p.status === 'concluido').length;

            const today = new Date();
            const atrasados = allProjects.filter(p => {
                if (!p.data_fim_planejada) return false;
                return new Date(p.data_fim_planejada) < today && p.status !== 'concluido';
            }).length;

            const totalApontamentos = allProjects.reduce((sum, p) => sum + (p.apontamentos_auditoria?.length || 0), 0);
            const apontamentosCriticos = allProjects.reduce((sum, p) =>
                sum + (p.apontamentos_auditoria?.filter((a: any) => a.criticidade === 'critica').length || 0), 0
            );

            const taxaConclusao = total > 0 ? Math.round((concluidos / total) * 100) : 0;

            setMetrics({
                total_projetos: total,
                projetos_ativos: ativos,
                projetos_concluidos: concluidos,
                projetos_atrasados: atrasados,
                total_apontamentos: totalApontamentos,
                apontamentos_criticos: apontamentosCriticos,
                taxa_conclusao: taxaConclusao,
                cobertura_auditoria: 85 // Simulado, requer dados históricos de inventário
            });

        } catch (error) {
            console.error('Error loading audit metrics:', error);
        }
    };

    const loadProjects = async () => {
        try {
            setLoading(true);

            let query = supabase
                .from('projetos_auditoria')
                .select(`
          *,
          trabalhos_auditoria(id, status),
          apontamentos_auditoria(id, criticidade, status),
          planos_acao(id, status)
        `, { count: 'exact' })
                .eq('tenant_id', effectiveTenantId);

            // Apply Filters
            if (statusFilter && statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            if (priorityFilter && priorityFilter !== 'all') {
                query = query.eq('prioridade', priorityFilter);
            }

            if (searchTerm) {
                query = query.or(`titulo.ilike.%${searchTerm}%,codigo.ilike.%${searchTerm}%,area_auditada.ilike.%${searchTerm}%`);
            }

            // Apply Sorting
            query = query.order(sortBy, { ascending: sortOrder === 'asc' });

            // Apply Pagination
            const from = (page - 1) * perPage;
            const to = from + perPage - 1;
            query = query.range(from, to);

            const { data, count, error } = await query;

            if (error) throw error;

            setTotalItems(count || 0);

            // Process Data
            const processedProjects = (data || []).map(project => ({
                id: project.id,
                codigo: project.codigo || `AUD-${project.id.slice(0, 8)}`,
                titulo: project.titulo,
                descricao: project.descricao || '',
                status: project.status || 'planejamento',
                fase_atual: project.fase_atual || 'planejamento',
                progresso_geral: calculateOverallProgress(project),
                auditor_lider: project.chefe_auditoria || 'Não definido',
                data_inicio: project.data_inicio,
                data_fim_prevista: project.data_fim_planejada,
                prioridade: project.prioridade || 'media',
                area_auditada: project.area_auditada || 'Não definida',
                tipo_auditoria: project.tipo_auditoria || 'Operacional',

                total_trabalhos: project.trabalhos_auditoria?.length || 0,
                trabalhos_concluidos: project.trabalhos_auditoria?.filter((t: any) => t.status === 'concluido').length || 0,
                total_apontamentos: project.apontamentos_auditoria?.length || 0,
                apontamentos_criticos: project.apontamentos_auditoria?.filter((a: any) => a.criticidade === 'critica').length || 0,
                planos_acao: project.planos_acao?.length || 0,

                completude_planejamento: Math.round(project.completude_planejamento || 0),
                completude_execucao: Math.round(project.completude_execucao || 0),
                completude_achados: Math.round(project.completude_achados || 0),
                completude_relatorio: Math.round(project.completude_relatorio || 0),
                completude_followup: Math.round(project.completude_followup || 0),
            }));

            setProjects(processedProjects);

        } catch (error) {
            console.error('Error loading audit projects:', error);
            toast.error('Erro ao carregar projetos de auditoria');
        } finally {
            setLoading(false);
        }
    };

    const calculateOverallProgress = (project: any): number => {
        const completudes = [
            project.completude_planejamento || 0,
            project.completude_execucao || 0,
            project.completude_achados || 0,
            project.completude_relatorio || 0,
            project.completude_followup || 0
        ];

        const totalCompletude = completudes.reduce((sum, completude) => sum + completude, 0);
        return Math.round(totalCompletude / completudes.length);
    };

    return {
        projects,
        loading,
        metrics,

        // Pagination
        page,
        setPage,
        perPage,
        setPerPage,
        totalItems,

        // Sorting
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,

        // Filters
        statusFilter,
        setStatusFilter,
        priorityFilter,
        setPriorityFilter,
        searchTerm,
        setSearchTerm,

        // Actions
        refresh: loadProjects
    };
};
