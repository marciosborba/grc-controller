import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Plus, 
  Filter, 
  BarChart3, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  FileText,
  Users,
  Calendar,
  ChevronRight,
  PlayCircle,
  PauseCircle,
  Settings,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import { RiskLevelDisplay } from '@/components/ui/risk-level-display';
import { AuditProjectCard } from './AuditProjectCard';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { secureLog } from '@/utils/securityLogger';

interface AuditProject {
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

interface DashboardMetrics {
  total_projetos: number;
  projetos_ativos: number;
  projetos_concluidos: number;
  projetos_atrasados: number;
  total_apontamentos: number;
  apontamentos_criticos: number;
  taxa_conclusao: number;
  cobertura_auditoria: number;
}

export function AuditDashboardNew() {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

  const [projects, setProjects] = useState<AuditProject[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (effectiveTenantId) {
      loadDashboardData();
    }
  }, [effectiveTenantId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar projetos com métricas
      const { data: projectsData, error: projectsError } = await supabase
        .from('projetos_auditoria')
        .select(`
          *,
          trabalhos_auditoria(id, status),
          apontamentos_auditoria(id, criticidade, status),
          planos_acao(id, status)
        `)
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false });
        


      if (projectsError) throw projectsError;

      // Processar dados dos projetos
      const processedProjects = projectsData?.map(project => {
        const trabalhos = project.trabalhos_auditoria || [];
        const apontamentos = project.apontamentos_auditoria || [];
        const planos = project.planos_acao || [];
        


        return {
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
          
          total_trabalhos: trabalhos.length,
          trabalhos_concluidos: trabalhos.filter(t => t.status === 'concluido').length,
          total_apontamentos: apontamentos.length,
          apontamentos_criticos: apontamentos.filter(a => a.criticidade === 'critica').length,
          planos_acao: planos.length,
          
          // Usar APENAS valores do banco de dados - fonte única da verdade
          completude_planejamento: Math.round(project.completude_planejamento || 0),
          completude_execucao: Math.round(project.completude_execucao || 0),
          completude_achados: Math.round(project.completude_achados || 0),
          completude_relatorio: Math.round(project.completude_relatorio || 0),
          completude_followup: Math.round(project.completude_followup || 0),
        };
      }) || [];

      setProjects(processedProjects);

      // Calcular métricas do dashboard
      const dashboardMetrics = calculateDashboardMetrics(processedProjects);
      setMetrics(dashboardMetrics);

    } catch (error) {
      secureLog('error', 'Erro ao carregar dados do dashboard', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallProgress = (project: any): number => {
    // Usar apenas os valores reais de completude do banco de dados
    const completudes = [
      project.completude_planejamento || 0,
      project.completude_execucao || 0,
      project.completude_achados || 0,
      project.completude_relatorio || 0,
      project.completude_followup || 0
    ];
    
    // Calcular média ponderada das fases
    const totalCompletude = completudes.reduce((sum, completude) => sum + completude, 0);
    const progressoGeral = Math.round(totalCompletude / completudes.length);
    
    console.log('calculateOverallProgress:', {
      project_id: project.id,
      completudes,
      totalCompletude,
      progressoGeral
    });
    
    return progressoGeral;
  };

  const calculatePhaseCompleteness = (project: any, phase: string): number => {

    
    // Usar os valores reais de completude do banco de dados se disponíveis
    const completudeField = `completude_${phase}`;
    if (project[completudeField] !== undefined && project[completudeField] !== null) {
      return Math.round(project[completudeField]);
    }
    
    // Fallback para lógica de cálculo se não houver dados no banco
    switch (phase) {
      case 'planejamento':
        let planejamentoScore = 0;
        if (project.objetivos) planejamentoScore += 25;
        if (project.escopo) planejamentoScore += 25;
        if (project.metodologia) planejamentoScore += 25;
        if (project.cronograma) planejamentoScore += 25;
        return planejamentoScore;
      case 'execucao':
        const trabalhos = project.trabalhos_auditoria || [];
        return trabalhos.length > 0 ? Math.round((trabalhos.filter((t: any) => t.status === 'concluido').length / trabalhos.length) * 100) : 0;
      case 'achados':
        const apontamentos = project.apontamentos_auditoria || [];
        if (apontamentos.length === 0) return 0;
        
        // Calcular baseado no status dos apontamentos
        const validados = apontamentos.filter(a => ['validado', 'comunicado', 'aceito'].includes(a.status)).length;
        return Math.round((validados / apontamentos.length) * 100);
      case 'relatorio':
        return project.relatorio_final ? 100 : 0;
      case 'followup':
        const planos = project.planos_acao || [];
        return planos.length > 0 ? Math.round((planos.filter((p: any) => p.status === 'implementado').length / planos.length) * 100) : 0;
      default:
        return 0;
    }
  };

  const calculateDashboardMetrics = (projects: AuditProject[]): DashboardMetrics => {
    const total = projects.length;
    const ativos = projects.filter(p => ['planejamento', 'execucao', 'achados', 'relatorio'].includes(p.status)).length;
    const concluidos = projects.filter(p => p.status === 'concluido').length;
    const atrasados = projects.filter(p => {
      if (!p.data_fim_prevista) return false;
      return new Date(p.data_fim_prevista) < new Date() && p.status !== 'concluido';
    }).length;
    
    const totalApontamentos = projects.reduce((sum, p) => sum + p.total_apontamentos, 0);
    const apontamentosCriticos = projects.reduce((sum, p) => sum + p.apontamentos_criticos, 0);
    const taxaConclusao = total > 0 ? (concluidos / total) * 100 : 0;
    
    return {
      total_projetos: total,
      projetos_ativos: ativos,
      projetos_concluidos: concluidos,
      projetos_atrasados: atrasados,
      total_apontamentos: totalApontamentos,
      apontamentos_criticos: apontamentosCriticos,
      taxa_conclusao: taxaConclusao,
      cobertura_auditoria: 85 // Valor simulado
    };
  };

  const getStatusColor = (status: string) => {
    const colors = {
      planejamento: 'bg-blue-100 text-blue-800',
      execucao: 'bg-yellow-100 text-yellow-800',
      achados: 'bg-orange-100 text-orange-800',
      relatorio: 'bg-purple-100 text-purple-800',
      followup: 'bg-indigo-100 text-indigo-800',
      concluido: 'bg-green-100 text-green-800',
      suspenso: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      baixa: 'bg-green-100 text-green-800',
      media: 'bg-yellow-100 text-yellow-800',
      alta: 'bg-orange-100 text-orange-800',
      critica: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchTerm || 
      project.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.area_auditada.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-3xl font-bold">Auditoria Interna</h1>
          <p className="text-muted-foreground">Gestão Integrada de Projetos de Auditoria</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <Card className="col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Projetos</p>
                <p className="text-3xl font-bold">{metrics?.total_projetos || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Projetos de auditoria</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projetos Ativos</p>
                <p className="text-3xl font-bold text-blue-600">{metrics?.projetos_ativos || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Em andamento</p>
              </div>
              <PlayCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-3xl font-bold text-green-600">{Math.round(metrics?.taxa_conclusao || 0)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Projetos concluídos</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Apontamentos Críticos</p>
                <p className="text-3xl font-bold text-red-600">{metrics?.apontamentos_criticos || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Requer atenção</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap de Riscos */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Heatmap de Riscos
            </CardTitle>
            <CardDescription>
              Distribuição de riscos por área auditada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RiskLevelDisplay 
              risks={projects.map(p => ({ 
                risk_level: p.prioridade === 'critica' ? 'Muito Alto' : 
                           p.prioridade === 'alta' ? 'Alto' : 
                           p.prioridade === 'media' ? 'Médio' : 'Baixo'
              }))}
              size="md"
              responsive={true}
            />
          </CardContent>
        </Card>

        {/* Filtros e Busca */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Filtros e Pesquisa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar projetos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">Todos os Status</option>
                  <option value="planejamento">Planejamento</option>
                  <option value="execucao">Execução</option>
                  <option value="achados">Achados</option>
                  <option value="relatorio">Relatório</option>
                  <option value="followup">Follow-up</option>
                  <option value="concluido">Concluído</option>
                </select>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  Lista
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Projetos */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Projetos de Auditoria</h2>
          <Badge variant="secondary">{filteredProjects.length} projetos</Badge>
        </div>

        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum projeto encontrado</h3>
              <p className="text-muted-foreground">Crie seu primeiro projeto de auditoria ou ajuste os filtros.</p>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Criar Projeto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-6' : 'space-y-4'}>
            {filteredProjects.map((project) => (
              <AuditProjectCard
                key={project.id}
                project={project}
                isExpanded={selectedProject === project.id}
                onToggleExpand={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}