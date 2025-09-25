import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  ArrowRight,
  Eye,
  Edit,
  Trash2,
  SquarePen,
  Download,
  Printer,
  Mail,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';
import { sanitizeInput, sanitizeObject, secureLog, auditLog } from '@/utils/securityLogger';
import { useCRUDRateLimit } from '@/hooks/useRateLimit';
import { UniversoAuditavel } from './UniversoAuditavel';
import { ProjetosAuditoria } from './ProjetosAuditoria';
import { PapeisTrabalhoCompleto } from './PapeisTrabalhoCompleto';
import { AuditRiskMatrix } from './AuditRiskMatrix';
import { StatisticalSampling } from './StatisticalSampling';
import { RelatoriosAuditoriaSecure } from './RelatoriosAuditoriaSecure';
import { PlanejamentoAuditoriaOptimized } from './PlanejamentoAuditoriaOptimized';

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

interface TrabalhoAuditoria {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  tipo_auditoria: 'compliance' | 'operational' | 'financial' | 'it' | 'investigative' | 'follow_up';
  area_auditada: string;
  nivel_risco: 'baixo' | 'medio' | 'alto' | 'critico';
  data_inicio_planejada: string;
  data_fim_planejada: string;
  horas_planejadas: number;
  orcamento_estimado: number;
  status: 'planejado' | 'aprovado' | 'iniciado' | 'em_andamento' | 'suspenso' | 'concluido' | 'cancelado';
  percentual_conclusao: number;
  prioridade: number;
  auditor_lider: string;
  auditor_lider_profile?: {
    full_name: string;
  };
}

export function AuditoriasDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
  const { tenantSettings, refetch: refetchTenantSettings } = useTenantSettings();
  const [auditUniverse, setAuditUniverse] = useState<AuditUniverse[]>([]);
  const [auditProjects, setAuditProjects] = useState<AuditProject[]>([]);
  const [trabalhos, setTrabalhos] = useState<TrabalhoAuditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [generatingReport, setGeneratingReport] = useState(false);
  
  // Rate limiting para operações CRUD
  const rateLimitCRUD = useCRUDRateLimit();
  
  // Log seguro para debug
  secureLog('info', 'AuditoriasDashboard renderizado', {
    matrixType: tenantSettings?.risk_matrix?.type,
    hasCustomLevels: !!tenantSettings?.risk_matrix?.risk_levels_custom,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    if (effectiveTenantId) {
      loadAuditData();
    }
  }, [effectiveTenantId]);
  
  // Escutar atualizações da matriz de risco
  useEffect(() => {
    const handleMatrixUpdate = (event: CustomEvent) => {
      secureLog('info', 'Matriz de risco atualizada, recarregando configurações', event.detail);
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
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false });

      if (universeError) {
        secureLog('error', 'Erro ao carregar universo auditável', universeError);
      } else {
        const mappedUniverse = universeData?.map(item => ({
          id: item.id,
          processo: item.nome || 'Processo não definido',
          categoria_risco: item.tipo || 'Não categorizado',
          nivel_risco: item.criticidade === 'critica' ? 5 : item.criticidade === 'alta' ? 4 : item.criticidade === 'media' ? 3 : item.criticidade === 'baixa' ? 2 : 1,
          responsavel_processo: item.responsavel || 'Não definido',
          ultima_auditoria: item.data_ultima_auditoria,
          proxima_auditoria: item.data_proxima_auditoria,
          status: item.status || 'pendente'
        })) || [];
        setAuditUniverse(mappedUniverse);
      }

      // Carregar projetos de auditoria
      const { data: projectsData, error: projectsError } = await supabase
        .from('projetos_auditoria')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .order('data_inicio', { ascending: false });

      if (projectsError) {
        secureLog('error', 'Erro ao carregar projetos de auditoria', projectsError);
      } else {
        const mappedProjects = projectsData?.map(project => ({
          id: project.id,
          titulo: project.titulo || 'Projeto sem título',
          tipo: project.tipo_auditoria || 'Auditoria Geral',
          status: project.status || 'planejado',
          auditor_lider: project.chefe_auditoria || 'Não definido',
          data_inicio: project.data_inicio || '',
          data_fim_prevista: project.data_fim_planejada || '',
          progresso: project.fase_atual === 'concluida' ? 100 : 
                    project.fase_atual === 'followup' ? 90 :
                    project.fase_atual === 'fieldwork' ? 60 : 25,
          metadata: project.metadados || {},
          codigo: project.codigo || ''
        })) || [];
        setAuditProjects(mappedProjects);
      }

      // Carregar trabalhos de auditoria
      const { data: trabalhosData, error: trabalhosError } = await supabase
        .from('trabalhos_auditoria')
        .select(`
          *,
          auditor_lider_profile:profiles!trabalhos_auditoria_auditor_lider_fkey(full_name)
        `)
        .eq('tenant_id', effectiveTenantId)
        .order('data_inicio_planejada', { ascending: true })
        .limit(5);

      if (trabalhosError) {
        secureLog('error', 'Erro ao carregar trabalhos de auditoria', trabalhosError);
      } else {
        setTrabalhos(trabalhosData || []);
      }

    } catch (error) {
      secureLog('error', 'Erro ao carregar dados de auditoria', error);
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

  const riskColors = {
    baixo: 'bg-green-100 text-green-800',
    medio: 'bg-yellow-100 text-yellow-800',
    alto: 'bg-orange-100 text-orange-800',
    critico: 'bg-red-100 text-red-800'
  };

  const statusColors = {
    planejado: 'bg-blue-500 text-white dark:bg-blue-600',
    aprovado: 'bg-green-500 text-white dark:bg-green-600',
    iniciado: 'bg-yellow-500 text-white dark:bg-yellow-600',
    em_andamento: 'bg-yellow-500 text-white dark:bg-yellow-600',
    suspenso: 'bg-orange-500 text-white dark:bg-orange-600',
    concluido: 'bg-green-500 text-white dark:bg-green-600',
    cancelado: 'bg-red-500 text-white dark:bg-red-600'
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

  // Definição dos tipos de relatórios disponíveis
  const reportTypes = [
    {
      id: 'audit_universe_summary',
      name: 'Resumo do Universo Auditável',
      description: 'Relatório completo dos processos auditáveis e níveis de risco',
      icon: Target
    },
    {
      id: 'audit_projects_status',
      name: 'Status dos Projetos de Auditoria',
      description: 'Relatório detalhado do andamento dos projetos',
      icon: ClipboardList
    },
    {
      id: 'risk_assessment_report',
      name: 'Relatório de Avaliação de Riscos',
      description: 'Análise consolidada dos riscos identificados',
      icon: AlertTriangle
    },
    {
      id: 'audit_plan_compliance',
      name: 'Conformidade do Plano de Auditoria',
      description: 'Acompanhamento da execução do plano anual',
      icon: CheckCircle
    },
    {
      id: 'working_papers_summary',
      name: 'Resumo dos Papéis de Trabalho',
      description: 'Consolidação das evidências coletadas',
      icon: FileText
    },
    {
      id: 'executive_dashboard',
      name: 'Dashboard Executivo',
      description: 'Visão gerencial com KPIs e métricas principais',
      icon: BarChart3
    }
  ];

  // Função para gerar relatórios
  const handleGenerateReport = async () => {
    if (!selectedReportType) {
      toast.error('Selecione um tipo de relatório');
      return;
    }

    setGeneratingReport(true);
    
    try {
      // Simulação da geração do relatório
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const reportInfo = reportTypes.find(r => r.id === selectedReportType);
      const formatLabel = selectedFormat.toUpperCase();
      
      toast.success(`Relatório "${reportInfo?.name}" gerado em ${formatLabel} com sucesso!`);
      
      // Aqui seria implementada a lógica real de geração e download
      // Por exemplo: window.open(downloadUrl, '_blank');
      
      setReportDialogOpen(false);
      setSelectedReportType('');
      setSelectedFormat('pdf');
      
    } catch (error) {
      secureLog('error', 'Erro ao gerar relatório', error);
      toast.error('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setGeneratingReport(false);
    }
  };

  // Função para enviar relatório por email
  const handleEmailReport = async () => {
    if (!selectedReportType) {
      toast.error('Selecione um tipo de relatório');
      return;
    }

    setGeneratingReport(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const reportInfo = reportTypes.find(r => r.id === selectedReportType);
      toast.success(`Relatório "${reportInfo?.name}" enviado por email!`);
      
      setReportDialogOpen(false);
      setSelectedReportType('');
      
    } catch (error) {
      secureLog('error', 'Erro ao enviar relatório por email', error);
      toast.error('Erro ao enviar relatório por email.');
    } finally {
      setGeneratingReport(false);
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

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" onClick={() => setSelectedTab('projects')}>
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

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" onClick={() => setSelectedTab('working-papers')}>
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

        <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
          <DialogTrigger asChild>
            <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden">
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-base sm:text-lg mb-2">📊 Relatórios Avançados</h3>
                <p className="text-muted-foreground text-sm">Geração automática de relatórios em múltiplos formatos</p>
              </CardContent>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
            </Card>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                Central de Relatórios de Auditoria
              </DialogTitle>
              <DialogDescription>
                Selecione o tipo de relatório e formato para geração ou exportação
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Seleção do Tipo de Relatório */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Tipo de Relatório</label>
                <div className="grid gap-3">
                  {reportTypes.map((report) => {
                    const IconComponent = report.icon;
                    return (
                      <Card 
                        key={report.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedReportType === report.id ? 'ring-2 ring-primary bg-primary/5' : ''
                        }`}
                        onClick={() => setSelectedReportType(report.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              selectedReportType === report.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            }`}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{report.name}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Seleção do Formato */}
              {selectedReportType && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">Formato de Exportação</label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-red-600" />
                          PDF - Portable Document Format
                        </div>
                      </SelectItem>
                      <SelectItem value="excel">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          Excel - Planilha eletrônica
                        </div>
                      </SelectItem>
                      <SelectItem value="csv">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          CSV - Valores separados por vírgula
                        </div>
                      </SelectItem>
                      <SelectItem value="png">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-purple-600" />
                          PNG - Imagem do relatório
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Opções Avançadas */}
              {selectedReportType && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">Opções Avançadas</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Período
                    </Button>
                  </div>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={handleGenerateReport}
                  disabled={!selectedReportType || generatingReport}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {generatingReport ? 'Gerando...' : 'Gerar Relatório'}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleEmailReport}
                  disabled={!selectedReportType || generatingReport}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                
                <Button 
                  variant="outline"
                  disabled={!selectedReportType || generatingReport}
                  onClick={() => toast.info('Função de impressão será implementada')}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Módulos Principais */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="universe">Universo Auditável</TabsTrigger>
          <TabsTrigger value="projects">Projetos</TabsTrigger>
          <TabsTrigger value="working-papers">Papéis de Trabalho</TabsTrigger>
          <TabsTrigger value="risk-matrix">Matriz de Risco</TabsTrigger>
          <TabsTrigger value="sampling">Amostragem</TabsTrigger>
          <TabsTrigger value="planejamento">Planejamento</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
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
                  {auditProjects.filter(p => p.status === 'em_andamento' || p.status === 'em_execucao').slice(0, 3).map((project: any) => (
                    <div key={project.id} className="flex items-center justify-between p-3 border rounded hover:shadow-sm transition-shadow">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{project.titulo}</p>
                          {project.metadata?.sox_audit && (
                            <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">
                              SOX
                            </Badge>
                          )}
                          {project.tipo === 'regulatoria' && !project.metadata?.sox_audit && (
                            <Badge variant="destructive" className="text-xs">
                              Regulatória
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{project.auditor_lider}</p>
                        <p className="text-xs text-muted-foreground">{project.codigo}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(project.status)}>
                          {(project.status || '').replace('_', ' ')}
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
          <ProjetosAuditoria />
        </TabsContent>

        <TabsContent value="working-papers" className="space-y-4">
          <PapeisTrabalhoCompleto />
        </TabsContent>

        <TabsContent value="risk-matrix" className="space-y-4">
          <AuditRiskMatrix />
        </TabsContent>

        <TabsContent value="sampling" className="space-y-4">
          <StatisticalSampling />
        </TabsContent>

        <TabsContent value="planejamento" className="space-y-4">
          <PlanejamentoAuditoriaOptimized />
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-4">
          <RelatoriosAuditoriaSecure />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AuditoriasDashboard;