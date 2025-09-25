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
  Settings,
  Target,
  Shield,
  FileText,
  Clipboard,
  Eye,
  Activity,
  Building,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  BarChart3,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EnhancedActionPlanCard, ActionPlan } from './EnhancedActionPlanCard';

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
    if (user?.tenant_id) {
      loadActionPlans();
    }
  }, [user?.tenant_id, filters]);

  const loadActionPlans = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration - Replace with actual Supabase query
      setTimeout(() => {
        const mockPlans: ActionPlan[] = [
          {
            id: '1',
            codigo: 'PA-RISK-001',
            titulo: 'Implementar controles de segurança da informação',
            descricao: 'Implementação de controles técnicos e administrativos para mitigar riscos de segurança identificados na avaliação de riscos.',
            modulo_origem: 'risk_management',
            origem_id: 'risk-001',
            categoria: 'Segurança',
            prioridade: 'alta',
            status: 'em_execucao',
            percentual_conclusao: 65,
            data_inicio: '2025-01-15',
            data_fim_planejada: '2025-10-15',
            responsavel_id: user?.id || '',
            orcamento_planejado: 50000,
            orcamento_realizado: 32500,
            gut_score: 8,
            impacto_esperado: 'Redução de 80% nos riscos de segurança da informação',
            criterio_sucesso: 'Todos os controles implementados e testados com sucesso',
            tenant_id: user?.tenant_id || '',
            created_at: '2025-01-15T10:00:00Z',
            updated_at: '2025-01-20T15:30:00Z',
            created_by: user?.id || '',
            dias_para_vencimento: 26,
            responsavel: {
              id: user?.id || '',
              nome: 'João Silva',
              email: 'joao.silva@empresa.com',
              avatar_url: ''
            },
            atividades: [
              {
                id: '1',
                action_plan_id: '1',
                titulo: 'Instalação de firewall',
                descricao: 'Configuração e instalação do firewall corporativo',
                status: 'concluida',
                data_fim_planejada: '2025-02-15',
                data_fim_real: '2025-02-10',
                responsavel_id: user?.id || '',
                percentual_conclusao: 100,
                ordem: 1,
                created_at: '2025-01-15T10:00:00Z'
              },
              {
                id: '2',
                action_plan_id: '1',
                titulo: 'Treinamento de segurança',
                descricao: 'Capacitação da equipe sobre políticas de segurança',
                status: 'em_execucao',
                data_fim_planejada: '2025-03-15',
                responsavel_id: user?.id || '',
                percentual_conclusao: 50,
                ordem: 2,
                created_at: '2025-01-15T10:00:00Z'
              }
            ],
            comentarios: [
              {
                id: '1',
                action_plan_id: '1',
                conteudo: 'Firewall instalado com sucesso. Iniciando fase de testes.',
                autor_id: user?.id || '',
                autor_nome: 'João Silva',
                created_at: '2025-02-10T14:30:00Z',
                tipo: 'atualizacao_progresso'
              }
            ]
          },
          {
            id: '2',
            codigo: 'PA-COMP-001',
            titulo: 'Adequação às normas ISO 27001',
            descricao: 'Implementação de controles necessários para adequação à norma ISO 27001.',
            modulo_origem: 'compliance',
            origem_id: 'comp-001',
            categoria: 'Conformidade',
            prioridade: 'critica',
            status: 'planejado',
            percentual_conclusao: 0,
            data_fim_planejada: '2025-12-31',
            responsavel_id: user?.id || '',
            orcamento_planejado: 100000,
            gut_score: 9,
            impacto_esperado: 'Certificação ISO 27001 obtida',
            criterio_sucesso: 'Auditoria de certificação aprovada',
            tenant_id: user?.tenant_id || '',
            created_at: '2025-01-10T08:00:00Z',
            updated_at: '2025-01-10T08:00:00Z',
            created_by: user?.id || '',
            dias_para_vencimento: 285,
            responsavel: {
              id: user?.id || '',
              nome: 'Maria Santos',
              email: 'maria.santos@empresa.com',
              avatar_url: ''
            },
            atividades: [],
            comentarios: []
          },
          {
            id: '3',
            codigo: 'PA-PRIV-001',
            titulo: 'Implementação de programa LGPD',
            descricao: 'Desenvolvimento e implementação de programa de adequação à LGPD.',
            modulo_origem: 'privacy',
            origem_id: 'dpia-001',
            categoria: 'Privacidade',
            prioridade: 'alta',
            status: 'concluido',
            percentual_conclusao: 100,
            data_inicio: '2024-06-01',
            data_fim_planejada: '2024-12-31',
            data_fim_real: '2024-12-20',
            responsavel_id: user?.id || '',
            orcamento_planejado: 75000,
            orcamento_realizado: 73000,
            gut_score: 7,
            impacto_esperado: 'Conformidade total com LGPD',
            criterio_sucesso: 'Todos os processos adequados e documentados',
            tenant_id: user?.tenant_id || '',
            created_at: '2024-06-01T09:00:00Z',
            updated_at: '2024-12-20T17:00:00Z',
            created_by: user?.id || '',
            dias_para_vencimento: -65,
            responsavel: {
              id: user?.id || '',
              nome: 'Ana Costa',
              email: 'ana.costa@empresa.com',
              avatar_url: ''
            },
            atividades: [],
            comentarios: []
          }
        ];
        
        setActionPlans(mockPlans);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao carregar planos de ação:', error);
      toast.error('Erro ao carregar planos de ação');
      setLoading(false);
    }
  };

  const filteredPlans = actionPlans.filter(plan => {
    const matchesSearch = !filters.search || 
      plan.titulo.toLowerCase().includes(filters.search.toLowerCase()) ||
      plan.codigo.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesModulo = !filters.modulo_origem || plan.modulo_origem === filters.modulo_origem;
    const matchesStatus = !filters.status || plan.status === filters.status;
    const matchesPrioridade = !filters.prioridade || plan.prioridade === filters.prioridade;
    
    const matchesVencimento = !filters.vencimento || (() => {
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
        case 'active': return ['planejado', 'em_execucao', 'pausado'].includes(plan.status);
        case 'completed': return plan.status === 'concluido';
        case 'overdue': return (plan.dias_para_vencimento || 0) < 0;
        case 'critical': return plan.prioridade === 'critica';
        case 'risk': return plan.modulo_origem === 'risk_management';
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
    switch (tabType) {
      case 'all': return actionPlans.length;
      case 'active': return actionPlans.filter(p => ['planejado', 'em_execucao', 'pausado'].includes(p.status)).length;
      case 'completed': return actionPlans.filter(p => p.status === 'concluido').length;
      case 'overdue': return actionPlans.filter(p => (p.dias_para_vencimento || 0) < 0).length;
      case 'critical': return actionPlans.filter(p => p.prioridade === 'critica').length;
      case 'risk': return actionPlans.filter(p => p.modulo_origem === 'risk_management').length;
      case 'compliance': return actionPlans.filter(p => p.modulo_origem === 'compliance').length;
      case 'privacy': return actionPlans.filter(p => p.modulo_origem === 'privacy').length;
      case 'assessments': return actionPlans.filter(p => p.modulo_origem === 'assessments').length;
      case 'audit': return actionPlans.filter(p => p.modulo_origem === 'audit').length;
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
            Visualização e gestão completa de todos os planos de ação do sistema
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

      {/* Filters */}
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
                <SelectItem value="audit">Auditoria</SelectItem>
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
                <SelectItem value="pausado">Pausado</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
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
          <TabsTrigger value="all" className="text-xs">
            Todos ({getTabCount('all')})
          </TabsTrigger>
          <TabsTrigger value="active" className="text-xs">
            Ativos ({getTabCount('active')})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">
            Concluídos ({getTabCount('completed')})
          </TabsTrigger>
          <TabsTrigger value="overdue" className="text-xs">
            Vencidos ({getTabCount('overdue')})
          </TabsTrigger>
          <TabsTrigger value="critical" className="text-xs">
            Críticos ({getTabCount('critical')})
          </TabsTrigger>
          <TabsTrigger value="risk" className="text-xs">
            Riscos ({getTabCount('risk')})
          </TabsTrigger>
          <TabsTrigger value="compliance" className="text-xs">
            Conformidade ({getTabCount('compliance')})
          </TabsTrigger>
          <TabsTrigger value="privacy" className="text-xs">
            Privacidade ({getTabCount('privacy')})
          </TabsTrigger>
          <TabsTrigger value="assessments" className="text-xs">
            Avaliações ({getTabCount('assessments')})
          </TabsTrigger>
          <TabsTrigger value="audit" className="text-xs">
            Auditoria ({getTabCount('audit')})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Exibindo {filteredPlans.length} de {actionPlans.length} planos de ação
            </p>
            <Button variant="ghost" size="sm" onClick={loadActionPlans}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>

          {/* Action Plans List */}
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
                  <p className="text-muted-foreground mb-6">
                    Não há planos de ação que correspondam aos filtros selecionados.
                  </p>
                  <Button onClick={() => setFilters({
                    search: '',
                    modulo_origem: '',
                    status: '',
                    prioridade: '',
                    responsavel: '',
                    vencimento: ''
                  })}>
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