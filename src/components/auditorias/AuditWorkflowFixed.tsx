import React, { useState, useCallback, useRef } from 'react';
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
  // Novos campos para controle de navegação
  fases_visitadas?: string[];
  fase_maxima_atingida?: string;
}

interface AuditWorkflowProps {
  project: AuditProject;
  activePhase: string;
  onPhaseChange: (phase: string) => void;
}

export function AuditWorkflowFixed({ project, activePhase, onPhaseChange }: AuditWorkflowProps) {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [saving, setSaving] = useState(false);
  const lastClickTime = useRef(0);
  const DEBOUNCE_DELAY = 500; // 500ms de debounce

  const phases = [
    {
      id: 'planejamento',
      name: 'Planejamento',
      icon: Target,
      description: 'Definição de objetivos, escopo e recursos',
      completeness: project.completude_planejamento || 0,
      color: 'blue',
      minCompleteness: 0 // Navegação livre // Sempre acessível
    },
    {
      id: 'execucao',
      name: 'Execução',
      icon: Play,
      description: 'Trabalhos de campo e coleta de evidências',
      completeness: project.completude_execucao || 0,
      color: 'yellow',
      minCompleteness: 0 // Navegação livre // Requer 30% do planejamento
    },
    {
      id: 'achados',
      name: 'Achados',
      icon: AlertTriangle,
      description: 'Análise e classificação de apontamentos',
      completeness: project.completude_achados || 0,
      color: 'orange',
      minCompleteness: 0 // Navegação livre // Requer 50% da execução
    },
    {
      id: 'relatorio',
      name: 'Relatório',
      icon: FileText,
      description: 'Elaboração e revisão de relatórios',
      completeness: project.completude_relatorio || 0,
      color: 'purple',
      minCompleteness: 0 // Navegação livre // Requer 70% dos achados
    },
    {
      id: 'followup',
      name: 'Follow-up',
      icon: CheckCircle,
      description: 'Acompanhamento de implementação',
      completeness: project.completude_followup || 0,
      color: 'green',
      minCompleteness: 0 // Navegação livre // Requer 80% do relatório
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
  const handlePhaseClick = useCallback((phaseId: string) => {
    const now = Date.now();
    if (now - lastClickTime.current < DEBOUNCE_DELAY) {
      console.log('Clique ignorado por debounce');
      return;
    }
    lastClickTime.current = now;
    handleDirectPhaseChange(phaseId);
  }, []);

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



  const getPhaseColor = (color: string, status: any) => {
    if (status.isActive) {
      return 'border-primary bg-primary/10 text-primary';
    } else if (status.isCompleted) {
      return 'border-green-500 bg-green-50 text-green-700';
    } else if (status.isVisited) {
      return 'border-blue-300 bg-blue-50 text-blue-700';
    } else if (status.isAccessible) {
      return 'border-border bg-background text-foreground hover:border-border/80';
    } else {
      return 'border-muted bg-muted text-muted-foreground cursor-not-allowed opacity-60';
    }
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
      {/* Breadcrumb de Fases MELHORADO */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-2 flex-wrap">
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
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all cursor-pointer ${
                      getPhaseColor(phase.color, status)
                    } ${isTransitioning ? 'opacity-50 cursor-wait' : ''}`}
                    title={status.accessibilityReason}
                    type="button"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="text-sm font-medium">{phase.name}</span>
                    <span className="text-xs">({status.completeness}%)</span>
                    
                    {/* Ícones de status */}
                    {isTransitioning && status.isActive ? (
                      <div className="animate-spin h-3 w-3 border border-primary border-t-transparent rounded-full" />
                    ) : (
                      <>
                        {status.isCompleted && <CheckCircle className="h-3 w-3 text-green-600" />}
                        {status.isActive && <Clock className="h-3 w-3 text-primary" />}
                        {!status.isAccessible && <Lock className="h-3 w-3" />}
                        {status.isAccessible && !status.isActive && !status.isCompleted && <Unlock className="h-3 w-3" />}
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
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </React.Fragment>
            );
          })}
        </div>
        

      </div>

      {/* Informações da Fase Atual MELHORADAS */}
      <Card className={`border-l-4 border-l-primary`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentPhase && (
                <currentPhase.icon className="h-6 w-6" />
              )}
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  {currentPhase?.name}
                  <Badge variant="secondary">
                    {Math.round(currentPhase?.completeness || 0)}% completo
                  </Badge>
                </CardTitle>
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