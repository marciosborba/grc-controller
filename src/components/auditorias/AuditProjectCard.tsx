import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronDown, 
  ChevronRight, 
  Calendar, 
  User, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  BarChart3,
  Settings,
  Play,
  Pause,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Copy
} from 'lucide-react';
import { AuditWorkflowFixed } from './AuditWorkflowFixed';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';

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

interface AuditProjectCardProps {
  project: AuditProject;
  isExpanded: boolean;
  onToggleExpand: () => void;
  viewMode: 'grid' | 'list';
}

export function AuditProjectCard({ project, isExpanded, onToggleExpand, viewMode }: AuditProjectCardProps) {
  const [activePhase, setActivePhase] = useState(project.fase_atual || 'planejamento');

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

  const getPhaseIcon = (phase: string) => {
    const icons = {
      planejamento: Target,
      execucao: Play,
      achados: AlertTriangle,
      relatorio: FileText,
      followup: CheckCircle
    };
    return icons[phase] || Target;
  };

  const getPhaseCompleteness = (phase: string) => {
    // Sempre usar dados do projeto por simplicidade
    const value = Math.round(project[`completude_${phase}`] || 0);
    return value;
  };
  
  const getOverallProgress = () => {
    // Sempre usar progresso do projeto
    return project.progresso_geral || 0;
  };

  const phases = [
    { id: 'planejamento', name: 'Planejamento', icon: Target },
    { id: 'execucao', name: 'Execução', icon: Play },
    { id: 'achados', name: 'Achados', icon: AlertTriangle },
    { id: 'relatorio', name: 'Relatório', icon: FileText },
    { id: 'followup', name: 'Follow-up', icon: CheckCircle }
  ];

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não definido';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysRemaining = () => {
    if (!project.data_fim_prevista) return null;
    const today = new Date();
    const endDate = new Date(project.data_fim_prevista);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  if (viewMode === 'list' && !isExpanded) {
    return (
      <Card className="hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpand}
                className="p-1"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{project.codigo}</h3>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                  <Badge className={getPriorityColor(project.prioridade)}>
                    {project.prioridade}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{project.titulo}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{Math.round(getOverallProgress())}%</p>
                <Progress value={getOverallProgress()} className="w-20 h-2" />
              </div>
              
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Auditor Líder</p>
                <p className="text-sm font-medium">{project.auditor_lider}</p>
              </div>
              
              {daysRemaining !== null && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Prazo</p>
                  <p className={`text-sm font-medium ${daysRemaining < 0 ? 'text-red-600' : daysRemaining < 7 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {daysRemaining < 0 ? `${Math.abs(daysRemaining)} dias atrasado` : `${daysRemaining} dias`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`transition-all duration-300 ${isExpanded ? 'col-span-full' : 'hover:shadow-md'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpand}
              className="p-1 mt-1"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg">{project.codigo}</CardTitle>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
                <Badge className={getPriorityColor(project.prioridade)}>
                  {project.prioridade}
                </Badge>
              </div>
              <CardDescription className="text-base font-medium text-foreground">
                {project.titulo}
              </CardDescription>
              <p className="text-sm text-muted-foreground mt-1">{project.area_auditada}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Resumo do Projeto */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Auditor Líder</p>
              <p className="text-sm font-medium">{project.auditor_lider}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Prazo</p>
              <p className="text-sm font-medium">{formatDate(project.data_fim_prevista)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Progresso</p>
              <p className="text-sm font-medium">{Math.round(getOverallProgress())}%</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Apontamentos</p>
              <p className="text-sm font-medium">
                {project.total_apontamentos} 
                {project.apontamentos_criticos > 0 && (
                  <span className="text-red-600 ml-1">({project.apontamentos_criticos} críticos)</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Barra de Progresso Geral */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progresso Geral</span>
            <span className="text-sm text-muted-foreground">{Math.round(getOverallProgress())}%</span>
          </div>
          <Progress value={getOverallProgress()} className="h-3" />
        </div>

        {/* Indicadores de Fase */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {phases.map((phase, index) => {
            const IconComponent = phase.icon;
            const completeness = getPhaseCompleteness(phase.id);
            const isActive = phase.id === project.fase_atual;
            const isCompleted = completeness === 100;
            
            return (
              <div
                key={phase.id}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isActive 
                    ? 'border-primary bg-primary/5' 
                    : isCompleted 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border bg-muted'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <IconComponent className={`h-5 w-5 mb-1 ${
                    isActive ? 'text-primary' : isCompleted ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <span className="text-xs font-medium">{phase.name}</span>
                  <span className="text-xs text-muted-foreground">{Math.round(completeness)}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Workflow Expandido */}
        {isExpanded && (
          <div className="border-t pt-6">
            <AuditWorkflowFixed 
              project={project}
              activePhase={activePhase}
              onPhaseChange={setActivePhase}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}