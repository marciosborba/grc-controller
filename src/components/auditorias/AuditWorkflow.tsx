import React, { useState } from 'react';
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
  ArrowRight,
  ArrowLeft,
  Save,
  Send
} from 'lucide-react';
import { PlanningPhase } from './phases/PlanningPhase';
import { ExecutionPhase } from './phases/ExecutionPhase';
import { FindingsPhase } from './phases/FindingsPhase';
import { ReportingPhase } from './phases/ReportingPhase';
import { FollowUpPhase } from './phases/FollowUpPhase';
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
}

interface AuditWorkflowProps {
  project: AuditProject;
  activePhase: string;
  onPhaseChange: (phase: string) => void;
}

export function AuditWorkflow({ project, activePhase, onPhaseChange }: AuditWorkflowProps) {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [saving, setSaving] = useState(false);

  const phases = [
    {
      id: 'planejamento',
      name: 'Planejamento',
      icon: Target,
      description: 'Definição de objetivos, escopo e recursos',
      completeness: project.completude_planejamento,
      color: 'blue'
    },
    {
      id: 'execucao',
      name: 'Execução',
      icon: Play,
      description: 'Trabalhos de campo e coleta de evidências',
      completeness: project.completude_execucao,
      color: 'yellow'
    },
    {
      id: 'achados',
      name: 'Achados',
      icon: AlertTriangle,
      description: 'Análise e classificação de apontamentos',
      completeness: project.completude_achados,
      color: 'orange'
    },
    {
      id: 'relatorio',
      name: 'Relatório',
      icon: FileText,
      description: 'Elaboração e revisão de relatórios',
      completeness: project.completude_relatorio,
      color: 'purple'
    },
    {
      id: 'followup',
      name: 'Follow-up',
      icon: CheckCircle,
      description: 'Acompanhamento de implementação',
      completeness: project.completude_followup,
      color: 'green'
    }
  ];

  const currentPhaseIndex = phases.findIndex(p => p.id === activePhase);
  const currentPhase = phases[currentPhaseIndex];
  const canAdvance = currentPhase?.completeness >= 80; // Mínimo 80% para avançar
  const canGoBack = currentPhaseIndex > 0;

  // Determinar quais fases são acessíveis
  const getPhaseAccessibility = (phaseIndex: number) => {
    // Sempre pode acessar a primeira fase
    if (phaseIndex === 0) return true;

    // Pode acessar fases anteriores se já passou por elas
    if (phaseIndex <= currentPhaseIndex) return true;

    // Pode acessar a próxima fase se a atual estiver 80% completa
    if (phaseIndex === currentPhaseIndex + 1 && currentPhase?.completeness >= 80) return true;

    // Pode acessar fases completadas (100%)
    const phase = phases[phaseIndex];
    if (phase?.completeness >= 100) return true;

    return false;
  };

  // Função para atualizar a fase no banco de dados
  const updateProjectPhase = async (newPhase: string) => {
    try {
      const { error } = await supabase
        .from('projetos_auditoria')
        .update({
          fase_atual: newPhase,
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;

      secureLog('info', 'Fase do projeto atualizada', { projectId: project.id, newPhase });
      return true;
    } catch (error) {
      secureLog('error', 'Erro ao atualizar fase do projeto', error);
      toast.error('Erro ao atualizar fase do projeto');
      return false;
    }
  };

  // Função para navegação direta entre fases
  const handleDirectPhaseChange = async (phaseId: string) => {
    if (phaseId === activePhase) return; // Já está na fase

    setIsTransitioning(true);

    try {
      const success = await updateProjectPhase(phaseId);

      if (success) {
        onPhaseChange(phaseId);
        const phaseName = phases.find(p => p.id === phaseId)?.name || phaseId;
        toast.success(`Navegou para: ${phaseName}`);
      }
    } catch (error) {
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

      const { error } = await supabase
        .from('projetos_auditoria')
        .update({
          [`completude_${activePhase}`]: currentPhase?.completeness || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;

      toast.success('Progresso salvo com sucesso!');
      secureLog('info', 'Progresso da fase salvo', { projectId: project.id, phase: activePhase });
    } catch (error) {
      secureLog('error', 'Erro ao salvar progresso', error);
      toast.error('Erro ao salvar progresso');
    } finally {
      setSaving(false);
    }
  };

  const handlePhaseTransition = async (direction: 'next' | 'previous') => {
    setIsTransitioning(true);

    try {
      let newPhaseIndex;
      if (direction === 'next' && currentPhaseIndex < phases.length - 1) {
        newPhaseIndex = currentPhaseIndex + 1;
      } else if (direction === 'previous' && currentPhaseIndex > 0) {
        newPhaseIndex = currentPhaseIndex - 1;
      } else {
        return;
      }

      const newPhase = phases[newPhaseIndex];

      // Atualizar no banco de dados primeiro
      const success = await updateProjectPhase(newPhase.id);

      if (success) {
        onPhaseChange(newPhase.id);
        toast.success(`Fase alterada para: ${newPhase.name}`);
      }

    } catch (error) {
      console.error('Erro ao transicionar fase:', error);
    } finally {
      setIsTransitioning(false);
    }
  };

  const getPhaseColor = (color: string) => {
    // This simple component doesn't have the sophisticated status object, so we rely on active/completed logic embedded in render
    // However, the caller uses this function to style the buttons directly based on phase.id
    // But wait, the button usage below uses this function passing phase.color
    // AND it has inline logic for `isActive` and `isCompleted`.
    // We should simplify the inline logic class string instead of just changing this map.
    return ''; // Helper function usage refactored below
  };

  const getPhaseButtonClass = (phase: any, isActive: boolean, isCompleted: boolean, isAccessible: boolean) => {
    // User requested Blue for Active/Selected phase.
    if (isActive) {
      return 'border-blue-600 bg-blue-600 text-white font-semibold shadow-md ring-2 ring-blue-600/20 scale-105';
    }
    if (isCompleted) {
      return 'border-emerald-600 bg-emerald-600 text-white font-medium';
    }
    // Visited logic is harder here without prop, but generally if not active and not completed but accessible, it's future/todo.
    // If we wanted to show "visited" (Yellow) here we'd need more state.
    // For now, Green vs Blue vs Gray is safer.

    if (isAccessible) {
      return 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300';
    }
    return 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed opacity-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-700';
  };

  const renderPhaseContent = () => {
    switch (activePhase) {
      case 'planejamento':
        return <PlanningPhase project={project} />;
      case 'execucao':
        return <ExecutionPhase project={project} />;
      case 'achados':
        return <FindingsPhase project={project} />;
      case 'relatorio':
        return <ReportingPhase project={project} />;
      case 'followup':
        return <FollowUpPhase project={project} />;
      default:
        return <PlanningPhase project={project} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb de Fases */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {phases.map((phase, index) => {
            const IconComponent = phase.icon;
            const isActive = phase.id === activePhase;
            const isCompleted = phase.completeness >= 100;
            const isAccessible = getPhaseAccessibility(index);

            return (
              <React.Fragment key={phase.id}>
                <button
                  onClick={() => isAccessible && handleDirectPhaseChange(phase.id)}
                  disabled={!isAccessible}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${getPhaseButtonClass(phase, isActive, isCompleted, isAccessible)
                    }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-sm font-medium">{phase.name}</span>
                  {isCompleted && <CheckCircle className="h-3 w-3 text-primary" />}
                </button>

                {index < phases.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Controles de Navegação */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePhaseTransition('previous')}
            disabled={!canGoBack || isTransitioning}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => handlePhaseTransition('next')}
            disabled={!canAdvance || currentPhaseIndex >= phases.length - 1 || isTransitioning}
          >
            Próxima
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Informações da Fase Atual */}
      <Card className={`border-l-4 ${getPhaseColor(currentPhase?.color || 'blue')}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentPhase && (
                <currentPhase.icon className="h-6 w-6" />
              )}
              <div>
                <CardTitle className="text-xl">{currentPhase?.name}</CardTitle>
                <CardDescription>{currentPhase?.description}</CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Completude</p>
                <p className="text-lg font-bold">{Math.round(currentPhase?.completeness || 0)}%</p>
              </div>
              <Progress value={currentPhase?.completeness || 0} className="w-24 h-3" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Validações e Alertas */}
      {currentPhase && currentPhase.completeness < 80 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-primary">Atenção: Fase incompleta</p>
                <p className="text-sm text-muted-foreground">
                  Complete pelo menos 80% desta fase antes de avançar para a próxima.
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

      {/* Ações da Fase */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">
                Última atualização: {new Date().toLocaleString('pt-BR')}
              </span>
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