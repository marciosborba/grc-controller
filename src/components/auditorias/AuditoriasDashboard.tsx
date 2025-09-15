import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RiskLevelDisplay } from '@/components/ui/risk-level-display';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import { 
  Calendar,
  ClipboardList,
  FileText,
  BarChart3,
  Target,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Plus,
  Filter,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { toast } from 'sonner';
import { UniversoAuditavel } from './UniversoAuditavel';

interface AuditUniverse {
  id: string;
  processo: string;
  categoria_risco: string;
  nivel_risco: number;
  responsavel_processo: string;
  ultima_auditoria?: string;
  proxima_auditoria?: string;
  status: 'pendente' | 'em_andamento' | 'concluido' | 'agendado';
}

interface AuditProject {
  id: string;
  titulo: string;
  tipo: string;
  status: 'planejado' | 'em_andamento' | 'concluido' | 'suspenso';
  auditor_lider: string;
  data_inicio: string;
  data_fim_prevista: string;
  progresso: number;
}

export function AuditoriasDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tenantSettings, refetch: refetchTenantSettings } = useTenantSettings();
  const [auditUniverse, setAuditUniverse] = useState<AuditUniverse[]>([]);
  const [auditProjects, setAuditProjects] = useState<AuditProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Log para debug
  console.log('📊 AuditoriasDashboard renderizado:', {
    matrixType: tenantSettings?.risk_matrix?.type,
    hasCustomLevels: !!tenantSettings?.risk_matrix?.risk_levels_custom,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    loadAuditData();
  }, []);
  
  // Escutar atualizações da matriz de risco
  useEffect(() => {
    const handleMatrixUpdate = (event: CustomEvent) => {
      console.log('🔄 Matriz de risco atualizada, recarregando configurações...', event.detail);
      refetchTenantSettings();
    };
    
    window.addEventListener('risk-matrix-updated', handleMatrixUpdate as EventListener);
    
    return () => {
      window.removeEventListener('risk-matrix-updated', handleMatrixUpdate as EventListener);
    };
  }, [refetchTenantSettings]);

  const loadAuditData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados do universo auditável
      const { data: universeData, error: universeError } = await supabase
        .from('universo_auditavel')
        .select('*')
        .eq('tenant_id', user?.tenant?.id)
        .order('nivel_risco_auditoria', { ascending: false });

      if (universeError) {
        console.error('Erro ao carregar universo auditável:', universeError);
      } else {
        const mappedUniverse = universeData?.map(item => ({
          id: item.id,
          processo: item.processo || 'Processo não definido',
          categoria_risco: item.categoria_risco || 'Não categorizado',
          nivel_risco: item.nivel_risco_auditoria || 1,
          responsavel_processo: item.responsavel_processo || 'Não definido',
          ultima_auditoria: item.ultima_auditoria,
          proxima_auditoria: item.proxima_auditoria_planejada,
          status: item.status_auditoria || 'pendente'
        })) || [];
        setAuditUniverse(mappedUniverse);
      }

      // Carregar projetos de auditoria
      const { data: projectsData, error: projectsError } = await supabase
        .from('projetos_auditoria')
        .select('*')
        .eq('tenant_id', user?.tenant?.id)
        .order('data_inicio', { ascending: false });

      if (projectsError) {
        console.error('Erro ao carregar projetos de auditoria:', projectsError);
      } else {
        const mappedProjects = projectsData?.map(project => ({
          id: project.id,
          titulo: project.titulo || 'Projeto sem título',
          tipo: project.tipo || 'Auditoria Geral',
          status: project.status || 'planejado',
          auditor_lider: project.auditor_lider || 'Não definido',
          data_inicio: project.data_inicio || '',
          data_fim_prevista: project.data_fim_prevista || '',
          progresso: project.progresso_percentual || 0
        })) || [];
        setAuditProjects(mappedProjects);
      }

    } catch (error) {
      console.error('Erro ao carregar dados de auditoria:', error);
      toast.error('Erro ao carregar dados de auditoria');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'em_andamento': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'agendado': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'pendente': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'suspenso': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRiskColor = (level: number) => {
    if (level >= 4) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (level >= 3) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  // Mapear níveis numéricos para nomes de risco baseado na configuração da tenant
  const mapRiskLevel = (numericLevel: number): string => {
    const matrixType = tenantSettings?.risk_matrix?.type || '5x5';
    
    // Se há configuração personalizada, usar ela
    if (tenantSettings?.risk_matrix?.risk_levels_custom) {
      const customLevels = tenantSettings.risk_matrix.risk_levels_custom
        .sort((a, b) => a.value - b.value);
      
      // Mapear o nível numérico para o nível personalizado correspondente
      const levelIndex = numericLevel - 1;
      if (levelIndex >= 0 && levelIndex < customLevels.length) {
        return customLevels[levelIndex].name;
      }
    }
    
    // Mapeamento baseado no tipo de matriz
    switch (matrixType) {
      case '3x3':
        switch (numericLevel) {
          case 1: return 'Baixo';
          case 2: return 'Médio';
          case 3: return 'Alto';
          default: return 'Baixo';
        }
      case '4x4':
        switch (numericLevel) {
          case 1: return 'Baixo';
          case 2: return 'Médio';
          case 3: return 'Alto';
          case 4: return 'Crítico';
          default: return 'Baixo';
        }
      case '5x5':
      default:
        switch (numericLevel) {
          case 1: return 'Muito Baixo';
          case 2: return 'Baixo';
          case 3: return 'Médio';
          case 4: return 'Alto';
          case 5: return 'Muito Alto';
          default: return 'Baixo';
        }
    }
  };

  const calculateMetrics = () => {
    const totalProcesses = auditUniverse.length;
    const highRiskProcesses = auditUniverse.filter(p => p.nivel_risco >= 4).length;
    const completedAudits = auditUniverse.filter(p => p.status === 'concluido').length;
    const activeProjects = auditProjects.filter(p => p.status === 'em_andamento').length;
    
    return {
      totalProcesses,
      highRiskProcesses,
      completedAudits,
      activeProjects,
      coveragePercentage: totalProcesses > 0 ? Math.round((completedAudits / totalProcesses) * 100) : 0
    };
  };

  const metrics = calculateMetrics();

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
          <p className="text-muted-foreground">Motor de Assurance Dinâmico e Conectado</p>
        </div>
        <div className="flex gap-2">
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
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processos</p>
                <p className="text-xl sm:text-2xl font-bold">{metrics.totalProcesses}</p>
              </div>
              <Target className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alto Risco</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">{metrics.highRiskProcesses}</p>
              </div>
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{metrics.completedAudits}</p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{metrics.activeProjects}</p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cobertura</p>
                <p className="text-xl sm:text-2xl font-bold">{metrics.coveragePercentage}%</p>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Módulos de Auditoria */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" onClick={() => navigate('/planejamento-estrategico')}>
          <CardContent className="p-4 sm:p-6 relative z-10">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-2">Planejamento Estratégico</h3>
            <p className="text-muted-foreground text-sm">Gestão completa do planejamento estratégico organizacional</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" onClick={() => navigate('/auditorias/projetos')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <ClipboardList className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-2">Projetos</h3>
            <p className="text-muted-foreground text-sm">Gestão de projetos de auditoria e equipes</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" onClick={() => navigate('/auditorias/papeis-trabalho')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-2">Papéis de Trabalho</h3>
            <p className="text-muted-foreground text-sm">Documentação digital de evidências</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" onClick={() => navigate('/auditorias/relatorios')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-2">Relatórios</h3>
            <p className="text-muted-foreground text-sm">Comunicação de resultados e dashboards</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>
      </div>

      {/* Módulos Principais */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="universe">Universo Auditável</TabsTrigger>
          <TabsTrigger value="projects">Projetos</TabsTrigger>
          <TabsTrigger value="planning">Planejamento</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Heatmap de Riscos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Heatmap de Riscos
                </CardTitle>
                <CardDescription>
                  Distribuição de processos por nível de risco
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RiskLevelDisplay 
                  risks={auditUniverse.map(p => ({ 
                    risk_level: mapRiskLevel(p.nivel_risco)
                  }))}
                  size="md"
                  responsive={true}
                  className=""
                />
              </CardContent>
            </Card>

            {/* Projetos Ativos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Projetos Ativos
                </CardTitle>
                <CardDescription>
                  Status dos projetos em andamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditProjects.filter(p => p.status === 'em_andamento').slice(0, 3).map(project => (
                    <div key={project.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <p className="font-medium">{project.titulo}</p>
                        <p className="text-sm text-muted-foreground">{project.auditor_lider}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.progresso}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="universe" className="space-y-4">
          <UniversoAuditavel />
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Projetos de Auditoria</CardTitle>
              <CardDescription>
                Gestão de projetos e execução de auditorias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditProjects.map(project => (
                  <div key={project.id} className="p-4 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{project.titulo}</h4>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tipo:</p>
                        <p>{project.tipo}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Auditor Líder:</p>
                        <p>{project.auditor_lider}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Início:</p>
                        <p>{project.data_inicio ? new Date(project.data_inicio).toLocaleDateString() : 'Não definido'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Progresso:</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${project.progresso}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{project.progresso}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {auditProjects.length === 0 && (
                  <div className="text-center py-8">
                    <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Nenhum projeto de auditoria criado</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Planejador Anual
              </CardTitle>
              <CardDescription>
                Cronograma e planejamento de auditorias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Planejador em Desenvolvimento</h3>
                <p className="text-muted-foreground mb-4">
                  O planejador anual interativo estará disponível em breve
                </p>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Plano Anual
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AuditoriasDashboard;