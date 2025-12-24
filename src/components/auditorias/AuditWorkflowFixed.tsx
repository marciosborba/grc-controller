import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  Play,
  AlertTriangle,
  FileText,
  CheckCircle,
  ChevronRight,
  Clock,
  Users,
  Calendar,
  BarChart3,
  Plus,
  Edit,
  Eye,
  Download,
  Upload,
  Settings,

  Save,
  Send,
  Lock,
  Unlock,
  Info
} from 'lucide-react';
import { PlanningPhaseFixed } from './phases/PlanningPhaseFixed';
import { ExecutionPhase } from './phases/ExecutionPhase';
import { FindingsPhaseFixed } from './phases/FindingsPhaseFixed';
import { ReportingPhase } from './phases/ReportingPhase';
import { FollowUpPhase } from './phases/FollowUpPhase';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { secureLog } from '@/utils/securityLogger';
import { useProjectCompleteness, ProjectCompletenessProvider } from '@/contexts/ProjectCompletenessContext';

interface AuditProject {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  status: string;
  fase_atual: string;
  progresso_geral: number;
  auditor_lider: string;
  data_inicio: string;
  data_fim_prevista: string;
  prioridade: string;
  area_auditada: string;
  tipo_auditoria: string;
  total_trabalhos: number;
  trabalhos_concluidos: number;
  total_apontamentos: number;
  apontamentos_criticos: number;
  planos_acao: number;
  completude_planejamento: number;
  completude_execucao: number;
  completude_achados: number;
  completude_relatorio: number;
  completude_followup: number;
  // Novos campos para controle de navegação
  fases_visitadas?: string[];
  fase_maxima_atingida?: string;
}

interface AuditWorkflowProps {
  project: AuditProject;
  activePhase: string;
  onPhaseChange: (phase: string) => void;
}

// Componente interno que usa o hook
function AuditWorkflowContent({ project, activePhase, onPhaseChange }: AuditWorkflowProps) {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [saving, setSaving] = useState(false);
  const lastClickTime = useRef(0);
  const DEBOUNCE_DELAY = 500; // 500ms de debounce

  // Hook centralizado para gerenciar completude
  const {
    completeness,
    refreshFromDatabase,
    loading: completenessLoading
  } = useProjectCompleteness();

  // Carregar dados do banco quando o componente monta
  useEffect(() => {
    if (project.id && effectiveTenantId) {
      console.log('AuditWorkflowContent - Loading completeness from database:', {
        projectId: project.id,
        tenantId: effectiveTenantId
      });
      refreshFromDatabase(project.id, effectiveTenantId);
    }
  }, [project.id, effectiveTenantId, refreshFromDatabase]);

  // Forçar refresh se os dados do projeto mudaram
  useEffect(() => {
    if (project.id && effectiveTenantId && !completenessLoading) {
      // Se temos dados de completude no projeto mas não no contexto, forçar refresh
      const hasProjectData = project.completude_planejamento > 0 ||
        project.completude_execucao > 0 ||
        project.completude_achados > 0 ||
        project.completude_relatorio > 0 ||
        project.completude_followup > 0;

      const hasContextData = completeness.planejamento?.databaseCompleteness > 0 ||
        completeness.execucao?.databaseCompleteness > 0 ||
        completeness.achados?.databaseCompleteness > 0 ||
        completeness.relatorio?.databaseCompleteness > 0 ||
        completeness.followup?.databaseCompleteness > 0;

      if (hasProjectData && !hasContextData) {
        console.log('AuditWorkflowContent - Project has data but context is empty, refreshing...');
        refreshFromDatabase(project.id, effectiveTenantId);
      }
    }
  }, [project, completeness, completenessLoading, refreshFromDatabase, effectiveTenantId]);

  // Usar dados centralizados de completude
  console.log('AuditWorkflowFixed - Centralized completeness data:', {
    project_id: project.id,
    completeness,
    loading: completenessLoading,
    project_data: {
      completude_planejamento: project.completude_planejamento,
      completude_execucao: project.completude_execucao,
      completude_achados: project.completude_achados,
      completude_relatorio: project.completude_relatorio,
      completude_followup: project.completude_followup
    }
  });

  // Função para obter completude dos botões (baseada no banco de dados)
  const getButtonCompleteness = (phase: string) => {
    const phaseData = completeness[phase as keyof typeof completeness];
    const databaseValue = phaseData?.databaseCompleteness || 0;

    // Fallback para dados do projeto se o contexto não tem dados
    const projectValue = Math.round(project[`completude_${phase}`] || 0);
    const finalValue = databaseValue > 0 ? databaseValue : projectValue;

    console.log(`AuditWorkflowFixed - getButtonCompleteness for ${phase}:`, {
      project_id: project.id,
      phase,
      databaseValue,
      projectValue,
      finalValue,
      source: databaseValue > 0 ? 'context_database' : 'project_fallback'
    });

    return finalValue;
  };

  const phases = [
    {
      id: 'planejamento',
      name: 'Planejamento',
      icon: Target,
      description: 'Definição de objetivos, escopo e recursos',
      completeness: getButtonCompleteness('planejamento'), // Baseado no banco
      color: 'blue',
      minCompleteness: 0
    },
    {
      id: 'execucao',
      name: 'Execução',
      icon: Play,
      description: 'Trabalhos de campo e coleta de evidências',
      completeness: getButtonCompleteness('execucao'), // Baseado no banco
      color: 'yellow',
      minCompleteness: 0
    },
    {
      id: 'achados',
      name: 'Achados',
      icon: AlertTriangle,
      description: 'Análise e classificação de apontamentos',
      completeness: getButtonCompleteness('achados'), // Baseado no banco
      color: 'orange',
      minCompleteness: 0
    },
    {
      id: 'relatorio',
      name: 'Relatório',
      icon: FileText,
      description: 'Elaboração e revisão de relatórios',
      completeness: getButtonCompleteness('relatorio'), // Baseado no banco
      color: 'purple',
      minCompleteness: 0
    },
    {
      id: 'followup',
      name: 'Follow-up',
      icon: CheckCircle,
      description: 'Acompanhamento de implementação',
      completeness: getButtonCompleteness('followup'), // Baseado no banco
      color: 'green',
      minCompleteness: 0
    }
  ];

  const currentPhaseIndex = phases.findIndex(p => p.id === activePhase);
  const currentPhase = phases[currentPhaseIndex];

  // LÓGICA DE ACESSIBILIDADE SIMPLIFICADA E MAIS PERMISSIVA
  const getPhaseAccessibility = (phaseIndex: number) => {
    const phase = phases[phaseIndex];
    const faseId = phase?.id;

    // NAVEGAÇÃO LIVRE ATIVADA - Permite acesso a todas as fases
    // Isso facilita o trabalho dos auditores e permite flexibilidade
    return { accessible: true, reason: 'Navegação livre ativada - Acesso permitido a todas as fases' };
  };

  // Função para obter o status visual da fase
  const getPhaseStatus = (phaseIndex: number) => {
    const phase = phases[phaseIndex];
    const isActive = phaseIndex === currentPhaseIndex;
    const isCompleted = phase?.completeness >= 100;
    const accessibility = getPhaseAccessibility(phaseIndex);
    const isAccessible = accessibility.accessible;

    // Determinar se a fase foi visitada
    const fasesVisitadas = project.fases_visitadas || ['planejamento'];
    const isVisited = fasesVisitadas.includes(phase.id) || phase.completeness > 0;

    return {
      isActive,
      isCompleted,
      isVisited,
      isAccessible,
      completeness: phase?.completeness || 0,
      accessibilityReason: accessibility.reason
    };
  };

  // Função para atualizar a fase no banco de dados
  const updateProjectPhase = async (newPhase: string) => {
    try {
      // Atualizar fases visitadas
      const fasesVisitadas = project.fases_visitadas || ['planejamento'];
      const novasFasesVisitadas = fasesVisitadas.includes(newPhase)
        ? fasesVisitadas
        : [...fasesVisitadas, newPhase];

      const { error } = await supabase
        .from('projetos_auditoria')
        .update({
          fase_atual: newPhase,
          fases_visitadas: novasFasesVisitadas,
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;

      secureLog('info', 'Fase do projeto atualizada', {
        projectId: project.id,
        newPhase,
        fasesVisitadas: novasFasesVisitadas
      });
      return true;
    } catch (error) {
      secureLog('error', 'Erro ao atualizar fase do projeto', error);
      toast.error('Erro ao atualizar fase do projeto');
      return false;
    }
  };

  // Função com debounce para evitar cliques múltiplos
  const handlePhaseClick = (phaseId: string) => {
    const now = Date.now();
    if (now - lastClickTime.current < DEBOUNCE_DELAY) {
      console.log('Clique ignorado por debounce');
      return;
    }
    lastClickTime.current = now;
    handleDirectPhaseChange(phaseId);
  };

  // Função para navegação direta entre fases - MELHORADA
  const handleDirectPhaseChange = async (phaseId: string) => {
    // Validações iniciais
    if (!phaseId) {
      console.warn('Phase ID não fornecido');
      return;
    }

    if (phaseId === activePhase) {
      console.log('Já está na fase:', phaseId);
      return; // Já está na fase
    }

    // Verificar se já está em transição
    if (isTransitioning) {
      console.log('Transição já em andamento, ignorando clique');
      return;
    }

    const phaseIndex = phases.findIndex(p => p.id === phaseId);
    if (phaseIndex === -1) {
      console.error('Fase não encontrada:', phaseId);
      toast.error('Fase não encontrada');
      return;
    }

    const accessibility = getPhaseAccessibility(phaseIndex);

    if (!accessibility.accessible) {
      toast.error(`Não é possível acessar esta fase: ${accessibility.reason}`);
      return;
    }

    console.log('Iniciando navegação para fase:', phaseId);
    setIsTransitioning(true);

    try {
      // Primeiro atualizar o estado local imediatamente para feedback visual
      onPhaseChange(phaseId);

      // Depois atualizar o banco de dados
      const success = await updateProjectPhase(phaseId);

      if (success) {
        const phaseName = phases.find(p => p.id === phaseId)?.name || phaseId;
        toast.success(`Navegou para: ${phaseName}`);
        console.log('Navegação concluída com sucesso para:', phaseName);
      } else {
        // Se falhou, reverter o estado local
        console.error('Falha ao atualizar banco, revertendo estado');
        // Aqui você pode implementar lógica para reverter se necessário
      }
    } catch (error) {
      console.error('Erro na navegação direta de fase:', error);
      secureLog('error', 'Erro na navegação direta de fase', error);
      toast.error('Erro ao navegar para a fase');
    } finally {
      setIsTransitioning(false);
    }
  };

  // Função para salvar progresso da fase atual
  const savePhaseProgress = async () => {
    try {
      setSaving(true);

      const completenessValue = currentPhase?.completeness || 0;
      console.log(`Saving phase progress for ${activePhase}:`, {
        project_id: project.id,
        phase: activePhase,
        completeness: completenessValue
      });

      const { error } = await supabase
        .from('projetos_auditoria')
        .update({
          [`completude_${activePhase}`]: completenessValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;

      toast.success(`Progresso salvo: ${completenessValue}%`);
      secureLog('info', 'Progresso da fase salvo', {
        projectId: project.id,
        phase: activePhase,
        completeness: completenessValue
      });
    } catch (error) {
      secureLog('error', 'Erro ao salvar progresso', error);
      toast.error('Erro ao salvar progresso');
    } finally {
      setSaving(false);
    }
  };



  const getPhaseColor = (color: string, status: any) => {
    // Logic: Active (Selected) -> Blue. Completed -> Green. Visited -> Yellow. Future -> Gray.

    if (status.isActive) {
      // User requested: "volte o azul para a fase selecionada"
      return 'border-blue-600 bg-blue-600 text-white font-semibold shadow-md ring-2 ring-blue-600/20 scale-105';
    } else if (status.isCompleted) {
      return 'border-emerald-600 bg-emerald-600 text-white font-medium'; // Green for completion
    } else if (status.isVisited) {
      return 'border-amber-500 bg-amber-500 text-white'; // Amber/Yellow for in-progress/visited (but not currently selected)
    } else if (status.isAccessible) {
      // Future but accessible
      return 'border-slate-300 bg-slate-100 text-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 transition-all';
    } else {
      // Locked
      return 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed opacity-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-700';
    }
  };

  const renderPhaseContent = () => {
    switch (activePhase) {
      case 'planejamento':
        return <PlanningPhaseFixed project={project} />;
      case 'execucao':
        return <ExecutionPhase project={project} />;
      case 'achados':
        return <FindingsPhaseFixed project={project} />;
      case 'relatorio':
        return <ReportingPhase project={project} />;
      case 'followup':
        return <FollowUpPhase project={project} />;
      default:
        return <PlanningPhaseFixed project={project} />;
    }
  };



  return (
    <div className="space-y-6">
      {/* Breadcrumb de Navegação */}
      <div className="flex flex-wrap items-center gap-1 p-4 bg-muted/30 rounded-lg overflow-x-auto">
        {phases.map((phase, index) => {
          const IconComponent = phase.icon;
          const status = getPhaseStatus(index);

          return (
            <React.Fragment key={phase.id}>
              <div className="relative group">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Botão clicado:', phase.id, 'Status:', status);
                    if (status.isAccessible && !isTransitioning) {
                      handlePhaseClick(phase.id);
                    } else {
                      console.log('Clique ignorado - Não acessível ou em transição');
                    }
                  }}
                  disabled={!status.isAccessible || isTransitioning}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-md border-2 transition-all cursor-pointer text-xs ${getPhaseColor(phase.color, status)
                    } ${isTransitioning ? 'opacity-50 cursor-wait' : ''}`}
                  title={status.accessibilityReason}
                  type="button"
                >
                  <IconComponent className="h-3 w-3" />
                  <span className="text-xs font-medium">{phase.name}</span>
                  <span className="text-xs">({Math.round(phase.completeness || 0)}%)</span>

                  {/* Ícones de status */}
                  {isTransitioning && status.isActive ? (
                    <div className="animate-spin h-3 w-3 border border-primary border-t-transparent rounded-full" />
                  ) : (
                    <>
                      {status.isCompleted && <CheckCircle className="h-2.5 w-2.5 text-white" />}
                      {status.isActive && <Clock className="h-2.5 w-2.5 text-white" />}
                      {!status.isAccessible && <Lock className="h-2.5 w-2.5 icon-slate-400" />}
                      {status.isAccessible && !status.isActive && !status.isCompleted && <Unlock className="h-2.5 w-2.5 text-slate-500" />}
                    </>
                  )}
                </button>

                {/* Tooltip com informações */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                  {status.accessibilityReason}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                </div>
              </div>

              {index < phases.length - 1 && (
                <ChevronRight className="h-3 w-3 text-gray-400" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Alertas e Validações MELHORADOS */}
      {currentPhase && currentPhase.completeness < 50 && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">Dica de Navegação</p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Complete pelo menos 50% desta fase para facilitar o acesso às próximas fases.
                  Você pode navegar livremente entre fases já visitadas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conteúdo da Fase */}
      <div className="min-h-[400px]">
        {renderPhaseContent()}
      </div>

      {/* Ações da Fase MELHORADAS */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">
                Última atualização: {new Date().toLocaleString('pt-BR')}
              </span>
              <Badge variant="outline" className="ml-2">
                Navegação Livre Ativada
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Exportar
              </Button>

              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-1" />
                Importar
              </Button>

              <Button size="sm" onClick={savePhaseProgress} disabled={saving}>
                <Save className="h-4 w-4 mr-1" />
                {saving ? 'Salvando...' : 'Salvar Progresso'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente principal que fornece o Provider
export function AuditWorkflowFixed({ project, activePhase, onPhaseChange }: AuditWorkflowProps) {
  return (
    <ProjectCompletenessProvider>
      <AuditWorkflowContent
        project={project}
        activePhase={activePhase}
        onPhaseChange={onPhaseChange}
      />
    </ProjectCompletenessProvider>
  );
}