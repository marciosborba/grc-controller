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
  const [isTransitioning, setIsTransitioning] = useState(false);

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
      onPhaseChange(newPhase.id);
      
      // Aqui você pode adicionar lógica para atualizar o banco de dados
      // await updateProjectPhase(project.id, newPhase.id);
      
    } catch (error) {
      console.error('Erro ao transicionar fase:', error);
    } finally {
      setIsTransitioning(false);
    }
  };

  const getPhaseColor = (color: string) => {
    const colors = {
      blue: 'border-blue-500 bg-blue-50 text-blue-700',
      yellow: 'border-yellow-500 bg-yellow-50 text-yellow-700',
      orange: 'border-orange-500 bg-orange-50 text-orange-700',
      purple: 'border-purple-500 bg-purple-50 text-purple-700',
      green: 'border-green-500 bg-green-50 text-green-700'
    };
    return colors[color] || 'border-gray-500 bg-gray-50 text-gray-700';
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
            const isAccessible = index <= currentPhaseIndex || isCompleted;
            
            return (
              <React.Fragment key={phase.id}>
                <button
                  onClick={() => isAccessible && onPhaseChange(phase.id)}
                  disabled={!isAccessible}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                    isActive 
                      ? getPhaseColor(phase.color)
                      : isCompleted
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : isAccessible
                      ? 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                      : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-sm font-medium">{phase.name}</span>
                  {isCompleted && <CheckCircle className="h-3 w-3 text-green-600" />}
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
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Atenção: Fase incompleta</p>
                <p className="text-sm text-yellow-700">
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
              
              <Button size="sm">
                <Save className="h-4 w-4 mr-1" />
                Salvar Progresso
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}