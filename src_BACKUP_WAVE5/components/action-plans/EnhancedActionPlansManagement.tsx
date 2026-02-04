import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Target,
  RefreshCw,
  LayoutGrid
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EnhancedActionPlanCard, ActionPlan } from './EnhancedActionPlanCard';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';

interface Filters {
  search: string;
  modulo_origem: string;
  status: string;
  prioridade: string;
  responsavel: string;
  vencimento: string;
}

export const EnhancedActionPlansManagement: React.FC = () => {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<Filters>({
    search: '',
    modulo_origem: '',
    status: '',
    prioridade: '',
    responsavel: '',
    vencimento: ''
  });
  const [expandAll, setExpandAll] = useState(false);

  useEffect(() => {
    if (effectiveTenantId) {
      loadActionPlans();
    }
  }, [effectiveTenantId, filters.modulo_origem]);

  const loadActionPlans = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('action_plans')
        .select(`
            *,
            responsavel_profile:profiles!action_plans_responsavel_plano_fkey(full_name, avatar_url),
            action_plan_activities(
                id, titulo, descricao, status, prioridade, data_fim_planejada, 
                percentual_conclusao, data_fim_real, responsavel_execucao, created_at
            )
        `);

      if (effectiveTenantId) {
        query = query.eq('tenant_id', effectiveTenantId);
      }

      // If we want to support server-side filtering later, add it here.
      // For now client-side filtering (except tenant) as per original mock style

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Transform DB data to Interface
      const mappedPlans: ActionPlan[] = (data || []).map(p => {
        const activities = p.action_plan_activities || [];

        // Helper to calc progress if 0/null in DB (fallback logic)
        const calculatedProgress = activities.length > 0
          ? Math.round((activities.filter((a: any) => ['concluido', 'completed', 'verified'].includes(a.status)).length / activities.length) * 100)
          : (p.percentual_conclusao || 0);

        return {
          id: p.id,
          codigo: p.codigo,
          titulo: p.titulo,
          descricao: p.descricao,
          modulo_origem: p.modulo_origem,
          origem_id: p.entidade_origem_id || '', // Just the ID
          categoria: p.categoria_id, // TODO: fetch category name if needed
          prioridade: p.prioridade,
          status: p.status,
          percentual_conclusao: calculatedProgress,
          data_inicio: p.created_at, // Using created_at as start date proxy if null
          data_fim_planejada: p.data_fim_planejada,
          responsavel_id: p.responsavel_plano,
          orcamento_planejado: p.orcamento_planejado,
          orcamento_realizado: p.orcamento_realizado,
          gut_score: p.gut_score,
          tenant_id: p.tenant_id,
          created_at: p.created_at,
          updated_at: p.updated_at,
          created_by: p.created_by,

          // Calc days overdue
          dias_para_vencimento: p.data_fim_planejada
            ? Math.ceil((new Date(p.data_fim_planejada).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            : 0,

          responsavel: {
            id: p.responsavel_plano,
            nome: p.responsavel_profile?.full_name || 'Não atribuído',
            email: '',
            avatar_url: p.responsavel_profile?.avatar_url
          },
          atividades: activities.map((a: any) => ({
            id: a.id,
            action_plan_id: p.id,
            titulo: a.titulo,
            descricao: a.descricao,
            status: a.status,
            data_fim_planejada: a.data_fim_planejada,
            data_fim_real: a.data_fim_real,
            responsavel_id: a.responsavel_execucao,
            percentual_conclusao: a.percentual_conclusao,
            created_at: a.created_at
          })),
          comentarios: [] // TODO: fetch comments if needed
        };
      });

      setActionPlans(mappedPlans);
      setLoading(false);

    } catch (error) {
      console.error('Erro ao carregar planos de ação:', error);
      toast.error('Erro ao carregar planos de ação');
      setLoading(false);
    }
  };

  const filteredPlans = actionPlans.filter(plan => {
    const matchesSearch = !filters.search ||
      plan.titulo.toLowerCase().includes(filters.search.toLowerCase()) ||
      (plan.codigo && plan.codigo.toLowerCase().includes(filters.search.toLowerCase()));

    const matchesModulo = !filters.modulo_origem || filters.modulo_origem === 'all' || plan.modulo_origem === filters.modulo_origem;
    // Map DB status to Filter status if necessary (e.g. planejado vs open)
    // Simplifying: assumes DB stores lowercase english or consistent keys. 
    // If not, we need a normalization step. Assuming consistent DB for now.
    const matchesStatus = !filters.status || filters.status === 'all' || plan.status === filters.status;
    const matchesPrioridade = !filters.prioridade || filters.prioridade === 'all' || plan.prioridade?.toLowerCase() === filters.prioridade?.toLowerCase();

    const matchesVencimento = !filters.vencimento || filters.vencimento === 'all' || (() => {
      const days = plan.dias_para_vencimento || 0;
      switch (filters.vencimento) {
        case 'vencidos': return days < 0;
        case 'hoje': return days === 0;
        case 'proximos_7': return days > 0 && days <= 7;
        case 'proximos_30': return days > 7 && days <= 30;
        default: return true;
      }
    })();

    // Tab filtering
    const matchesTab = (() => {
      switch (activeTab) {
        case 'all': return true;
        case 'active': return ['planejado', 'em_execucao', 'pausado', 'open', 'em_andamento'].includes(plan.status);
        case 'completed': return ['concluido', 'completed', 'verified'].includes(plan.status);
        case 'overdue': return (plan.dias_para_vencimento || 0) < 0 && !['concluido', 'completed'].includes(plan.status);
        case 'critical': return plan.prioridade === 'critica' || plan.prioridade === 'critical';
        case 'risk': return plan.modulo_origem === 'risk_management' || plan.modulo_origem === 'vendor_risk'; // grouping risks
        case 'compliance': return plan.modulo_origem === 'compliance';
        case 'privacy': return plan.modulo_origem === 'privacy';
        case 'assessments': return plan.modulo_origem === 'assessments';
        case 'audit': return plan.modulo_origem === 'audit';
        default: return true;
      }
    })();

    return matchesSearch && matchesModulo && matchesStatus && matchesPrioridade && matchesVencimento && matchesTab;
  });

  const getTabCount = (tabType: string) => {
    // Re-implement with same logic as filter for consistency
    const isActive = (s: string) => ['planejado', 'em_execucao', 'pausado', 'open', 'em_andamento'].includes(s);
    const isCompleted = (s: string) => ['concluido', 'completed', 'verified'].includes(s);

    switch (tabType) {
      case 'all': return actionPlans.length;
      case 'active': return actionPlans.filter(p => isActive(p.status)).length;
      case 'completed': return actionPlans.filter(p => isCompleted(p.status)).length;
      case 'overdue': return actionPlans.filter(p => (p.dias_para_vencimento || 0) < 0 && !isCompleted(p.status)).length;
      case 'critical': return actionPlans.filter(p => p.prioridade === 'critica' || p.prioridade === 'critical').length;
      case 'risk': return actionPlans.filter(p => p.modulo_origem === 'risk_management' || p.modulo_origem === 'vendor_risk').length;
      case 'compliance': return actionPlans.filter(p => p.modulo_origem === 'compliance').length;
      case 'privacy': return actionPlans.filter(p => p.modulo_origem === 'privacy').length;
      case 'assessments': return actionPlans.filter(p => p.modulo_origem === 'assessments').length;
      default: return 0;
    }
  };

  const handlePlanUpdate = (updatedPlan: ActionPlan) => {
    setActionPlans(plans =>
      plans.map(plan => plan.id === updatedPlan.id ? updatedPlan : plan)
    );
  };

  const handlePlanDelete = (planId: string) => {
    setActionPlans(plans => plans.filter(plan => plan.id !== planId));
    toast.success('Plano de ação removido');
  };

  const exportData = () => {
    const csvData = filteredPlans.map(plan => ({
      Codigo: plan.codigo,
      Titulo: plan.titulo,
      Modulo: plan.modulo_origem,
      Prioridade: plan.prioridade,
      Status: plan.status,
      Progresso: `${plan.percentual_conclusao}%`,
      Responsavel: plan.responsavel?.nome || '',
      Prazo: plan.data_fim_planejada,
      'Dias para Vencimento': plan.dias_para_vencimento || 0
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'planos-acao.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast.success('Dados exportados com sucesso');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Planos de Ação</h1>
          <p className="text-muted-foreground">
            Visualização e gestão unificada de planos de ação (Conformidade, Riscos, etc.)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setExpandAll(!expandAll)}>
            {expandAll ? 'Recolher Todos' : 'Expandir Todos'}
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Plano
          </Button>
        </div>
      </div>

      {/* Filters (same layout as before but updated values logic if needed) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="xl:col-span-2">
              <Input
                placeholder="Buscar por título ou código..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full"
              />
            </div>

            <Select value={filters.modulo_origem} onValueChange={(value) => setFilters({ ...filters, modulo_origem: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Módulo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os módulos</SelectItem>
                <SelectItem value="risk_management">Gestão de Riscos</SelectItem>
                <SelectItem value="compliance">Conformidade</SelectItem>
                <SelectItem value="assessments">Avaliações</SelectItem>
                <SelectItem value="privacy">Privacidade</SelectItem>
                <SelectItem value="tprm">TPRM</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="planejado">Planejado</SelectItem>
                <SelectItem value="em_execucao">Em Execução</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.prioridade} onValueChange={(value) => setFilters({ ...filters, prioridade: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as prioridades</SelectItem>
                <SelectItem value="critica">Crítica</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.vencimento} onValueChange={(value) => setFilters({ ...filters, vencimento: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Vencimento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os prazos</SelectItem>
                <SelectItem value="vencidos">Vencidos</SelectItem>
                <SelectItem value="hoje">Vencem hoje</SelectItem>
                <SelectItem value="proximos_7">Próximos 7 dias</SelectItem>
                <SelectItem value="proximos_30">Próximos 30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 xl:grid-cols-10">
          <TabsTrigger value="all" className="text-xs">Todos ({getTabCount('all')})</TabsTrigger>
          <TabsTrigger value="active" className="text-xs">Ativos ({getTabCount('active')})</TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">Concluídos ({getTabCount('completed')})</TabsTrigger>
          <TabsTrigger value="overdue" className="text-xs">Vencidos ({getTabCount('overdue')})</TabsTrigger>
          <TabsTrigger value="critical" className="text-xs">Críticos ({getTabCount('critical')})</TabsTrigger>
          <TabsTrigger value="risk" className="text-xs">Riscos ({getTabCount('risk')})</TabsTrigger>
          <TabsTrigger value="compliance" className="text-xs">Conformidade ({getTabCount('compliance')})</TabsTrigger>
          <TabsTrigger value="privacy" className="text-xs">Privacidade ({getTabCount('privacy')})</TabsTrigger>
          <TabsTrigger value="assessments" className="text-xs">Avaliações ({getTabCount('assessments')})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Exibindo {filteredPlans.length} de {actionPlans.length} planos de ação
            </p>
            <Button variant="ghost" size="sm" onClick={loadActionPlans}>
              <RefreshCw className="h-4 w-4 mr-2" /> Atualizar
            </Button>
          </div>

          <div className="space-y-4">
            {filteredPlans.length > 0 ? (
              filteredPlans.map((plan) => (
                <EnhancedActionPlanCard
                  key={plan.id}
                  actionPlan={plan}
                  onUpdate={handlePlanUpdate}
                  onDelete={handlePlanDelete}
                  isExpandedByDefault={expandAll}
                  showModuleLink={true}
                />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum plano encontrado</h3>
                  <p className="text-muted-foreground mb-6">Não há planos de ação que correspondam aos filtros selecionados.</p>
                  <Button onClick={() => setFilters({ search: '', modulo_origem: '', status: '', prioridade: '', responsavel: '', vencimento: '' })}>
                    Limpar Filtros
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};