import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { 
  Target,
  Plus,
  Eye,
  Edit,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileCheck,
  Calendar,
  User,
  Building,
  BarChart3,
  Zap,
  Brain
} from 'lucide-react';
import { useVendorRiskManagement, VendorAssessment, AssessmentFilters } from '@/hooks/useVendorRiskManagement';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VendorKanbanViewProps {
  searchTerm: string;
  selectedFilter: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  count: number;
}

export const VendorKanbanView: React.FC<VendorKanbanViewProps> = ({
  searchTerm,
  selectedFilter
}) => {
  const {
    assessments,
    vendors,
    frameworks,
    fetchAssessments,
    fetchVendors,
    updateAssessment,
    loading
  } = useVendorRiskManagement();

  const [localFilters, setLocalFilters] = useState<AssessmentFilters>({});
  const [groupBy, setGroupBy] = useState<'status' | 'priority' | 'risk_level'>('status');

  // Load data on mount
  useEffect(() => {
    fetchAssessments({
      search: searchTerm,
      ...localFilters
    });
    fetchVendors();
  }, [searchTerm, localFilters, fetchAssessments, fetchVendors]);

  // Define columns based on groupBy
  const getColumns = (): KanbanColumn[] => {
    switch (groupBy) {
      case 'status':
        return [
          {
            id: 'draft',
            title: 'Rascunho',
            description: 'Assessments em preparação',
            icon: <Edit className="w-4 h-4" />,
            color: 'text-gray-600',
            bgColor: 'bg-gray-50 border-gray-200',
            count: assessments.filter(a => a.status === 'draft').length
          },
          {
            id: 'sent',
            title: 'Enviado',
            description: 'Aguardando resposta do fornecedor',
            icon: <Clock className="w-4 h-4" />,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 border-blue-200',
            count: assessments.filter(a => a.status === 'sent').length
          },
          {
            id: 'in_progress',
            title: 'Em Andamento',
            description: 'Sendo preenchido pelo fornecedor',
            icon: <BarChart3 className="w-4 h-4" />,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50 border-yellow-200',
            count: assessments.filter(a => a.status === 'in_progress').length
          },
          {
            id: 'completed',
            title: 'Concluído',
            description: 'Aguardando revisão interna',
            icon: <CheckCircle className="w-4 h-4" />,
            color: 'text-green-600',
            bgColor: 'bg-green-50 border-green-200',
            count: assessments.filter(a => a.status === 'completed').length
          },
          {
            id: 'approved',
            title: 'Aprovado',
            description: 'Assessment finalizado',
            icon: <CheckCircle className="w-4 h-4" />,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50 border-emerald-200',
            count: assessments.filter(a => a.status === 'approved').length
          },
          {
            id: 'rejected',
            title: 'Rejeitado',
            description: 'Necessita correções',
            icon: <XCircle className="w-4 h-4" />,
            color: 'text-red-600',
            bgColor: 'bg-red-50 border-red-200',
            count: assessments.filter(a => a.status === 'rejected').length
          }
        ];
      
      case 'priority':
        return [
          {
            id: 'low',
            title: 'Baixa Prioridade',
            description: 'Pode ser tratado quando conveniente',
            icon: <Clock className="w-4 h-4" />,
            color: 'text-green-600',
            bgColor: 'bg-green-50 border-green-200',
            count: assessments.filter(a => a.priority === 'low').length
          },
          {
            id: 'medium',
            title: 'Prioridade Média',
            description: 'Prazo padrão de execução',
            icon: <BarChart3 className="w-4 h-4" />,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 border-blue-200',
            count: assessments.filter(a => a.priority === 'medium').length
          },
          {
            id: 'high',
            title: 'Alta Prioridade',
            description: 'Requer atenção prioritária',
            icon: <AlertTriangle className="w-4 h-4" />,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 border-orange-200',
            count: assessments.filter(a => a.priority === 'high').length
          },
          {
            id: 'urgent',
            title: 'Urgente',
            description: 'Ação imediata necessária',
            icon: <Zap className="w-4 h-4" />,
            color: 'text-red-600',
            bgColor: 'bg-red-50 border-red-200',
            count: assessments.filter(a => a.priority === 'urgent').length
          }
        ];
        
      case 'risk_level':
        return [
          {
            id: 'low',
            title: 'Risco Baixo',
            description: 'Fornecedores de baixo risco',
            icon: <CheckCircle className="w-4 h-4" />,
            color: 'text-green-600',
            bgColor: 'bg-green-50 border-green-200',
            count: assessments.filter(a => a.risk_level === 'low').length
          },
          {
            id: 'medium',
            title: 'Risco Médio',
            description: 'Monitoramento regular necessário',
            icon: <BarChart3 className="w-4 h-4" />,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50 border-yellow-200',
            count: assessments.filter(a => a.risk_level === 'medium').length
          },
          {
            id: 'high',
            title: 'Risco Alto',
            description: 'Controles adicionais necessários',
            icon: <AlertTriangle className="w-4 h-4" />,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 border-orange-200',
            count: assessments.filter(a => a.risk_level === 'high').length
          },
          {
            id: 'critical',
            title: 'Risco Crítico',
            description: 'Ação imediata requerida',
            icon: <XCircle className="w-4 h-4" />,
            color: 'text-red-600',
            bgColor: 'bg-red-50 border-red-200',
            count: assessments.filter(a => a.risk_level === 'critical').length
          }
        ];
        
      default:
        return [];
    }
  };

  const columns = getColumns();

  // Get assessments for a specific column
  const getAssessmentsForColumn = (columnId: string): VendorAssessment[] => {
    return assessments.filter(assessment => {
      if (groupBy === 'status') {
        return assessment.status === columnId;
      } else if (groupBy === 'priority') {
        return assessment.priority === columnId;
      } else if (groupBy === 'risk_level') {
        return assessment.risk_level === columnId;
      }
      return false;
    });
  };

  // Handle drag end
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination || destination.droppableId === source.droppableId) {
      return;
    }

    const assessmentId = draggableId;
    const newValue = destination.droppableId;

    // Update assessment based on groupBy
    const updates: Partial<VendorAssessment> = {};
    if (groupBy === 'status') {
      updates.status = newValue as any;
    } else if (groupBy === 'priority') {
      updates.priority = newValue as any;
    } else if (groupBy === 'risk_level') {
      updates.risk_level = newValue as any;
    }

    await updateAssessment(assessmentId, updates);
  };

  // Get vendor name
  const getVendorName = (vendorId: string): string => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor?.name || 'Fornecedor não encontrado';
  };

  // Get framework name
  const getFrameworkName = (frameworkId: string): string => {
    const framework = frameworks.find(f => f.id === frameworkId);
    return framework?.name || 'Framework não encontrado';
  };

  // Get progress color
  const getProgressColor = (progress: number): string => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'approved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sent': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Check if assessment is overdue
  const isOverdue = (dueDate?: string): boolean => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  // Assessment Card Component
  const AssessmentCard: React.FC<{ assessment: VendorAssessment; index: number }> = ({ assessment, index }) => (
    <Draggable draggableId={assessment.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-3 ${snapshot.isDragging ? 'rotate-2 scale-105' : ''}`}
        >
          <Card className={`
            bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 
            hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing
            ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-400 ring-opacity-75' : ''}
          `}>
            <CardContent className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                    {assessment.assessment_name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {getVendorName(assessment.vendor_id)}
                  </p>
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  {isOverdue(assessment.due_date) && (
                    <Badge variant="destructive" className="text-xs px-1 py-0">
                      Vencido
                    </Badge>
                  )}
                  {groupBy !== 'priority' && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-1 py-0 ${
                        assessment.priority === 'urgent' ? 'border-red-200 text-red-700 bg-red-50' :
                        assessment.priority === 'high' ? 'border-orange-200 text-orange-700 bg-orange-50' :
                        assessment.priority === 'medium' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                        'border-green-200 text-green-700 bg-green-50'
                      }`}
                    >
                      {assessment.priority === 'urgent' ? 'Urgente' :
                       assessment.priority === 'high' ? 'Alta' :
                       assessment.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Framework */}
              <div className="flex items-center space-x-2">
                <FileCheck className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
                  {getFrameworkName(assessment.framework_id)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600 dark:text-slate-400">Progresso</span>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {assessment.progress_percentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor(assessment.progress_percentage)}`}
                    style={{ width: `${assessment.progress_percentage}%` }}
                  />
                </div>
              </div>

              {/* Due Date */}
              {assessment.due_date && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span className={`text-xs ${
                    isOverdue(assessment.due_date) 
                      ? 'text-red-600 font-medium' 
                      : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {format(new Date(assessment.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>
              )}

              {/* Risk Score */}
              {assessment.overall_score && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">Score</span>
                  </div>
                  <Badge variant="outline" className={`text-xs px-1 py-0 ${
                    assessment.overall_score >= 4.5 ? 'border-red-200 text-red-700 bg-red-50' :
                    assessment.overall_score >= 3.5 ? 'border-orange-200 text-orange-700 bg-orange-50' :
                    assessment.overall_score >= 2.5 ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                    'border-green-200 text-green-700 bg-green-50'
                  }`}>
                    {assessment.overall_score.toFixed(1)}/5.0
                  </Badge>
                </div>
              )}

              {/* Assessment Type */}
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs px-2 py-0">
                  {assessment.assessment_type === 'initial' ? 'Inicial' :
                   assessment.assessment_type === 'annual' ? 'Anual' :
                   assessment.assessment_type === 'reassessment' ? 'Reavaliação' :
                   assessment.assessment_type === 'incident_triggered' ? 'Por Incidente' :
                   'Ad-hoc'}
                </Badge>
                
                {/* ALEX Analysis Indicator */}
                {assessment.alex_analysis && (
                  <div className="flex items-center space-x-1">
                    <Brain className="w-3 h-3 text-blue-500" />
                    <span className="text-xs text-blue-600 font-medium">ALEX</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-1 pt-2 border-t border-slate-100 dark:border-slate-700">
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Eye className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Edit className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-purple-600" />
                <span>Assessments Kanban</span>
              </CardTitle>
              <CardDescription>
                Gerencie o fluxo de assessments dos fornecedores
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={groupBy} onValueChange={(value) => setGroupBy(value as any)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Agrupar por..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="priority">Prioridade</SelectItem>
                  <SelectItem value="risk_level">Nível de Risco</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Novo Assessment
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Select
              value={localFilters.assessment_type?.[0] || 'all'}
              onValueChange={(value) => 
                setLocalFilters(prev => ({
                  ...prev,
                  assessment_type: value === 'all' ? undefined : [value]
                }))
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="initial">Inicial</SelectItem>
                <SelectItem value="annual">Anual</SelectItem>
                <SelectItem value="reassessment">Reavaliação</SelectItem>
                <SelectItem value="incident_triggered">Por Incidente</SelectItem>
                <SelectItem value="ad_hoc">Ad-hoc</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={localFilters.framework_type?.[0] || 'all'}
              onValueChange={(value) => 
                setLocalFilters(prev => ({
                  ...prev,
                  framework_type: value === 'all' ? undefined : [value]
                }))
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="iso27001">ISO 27001</SelectItem>
                <SelectItem value="soc2">SOC 2</SelectItem>
                <SelectItem value="nist">NIST</SelectItem>
                <SelectItem value="pci_dss">PCI DSS</SelectItem>
                <SelectItem value="lgpd">LGPD</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Kanban Board */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {columns.map((column) => (
                <div key={column.id} className="space-y-3">
                  {/* Column Header */}
                  <Card className={`border-2 ${column.bgColor} ${column.color}`}>
                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          {column.icon}
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm truncate">{column.title}</h3>
                            <p className="text-xs opacity-75 truncate">{column.description}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="flex-shrink-0 ml-2">
                          {column.count}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Droppable Area */}
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`
                          min-h-[400px] p-2 rounded-lg transition-all duration-200
                          ${snapshot.isDraggingOver 
                            ? 'bg-blue-50 dark:bg-blue-950 ring-2 ring-blue-400 ring-opacity-50' 
                            : 'bg-slate-50/50 dark:bg-slate-900/50'
                          }
                        `}
                      >
                        {getAssessmentsForColumn(column.id).map((assessment, index) => (
                          <AssessmentCard
                            key={assessment.id}
                            assessment={assessment}
                            index={index}
                          />
                        ))}
                        {provided.placeholder}
                        
                        {/* Empty State */}
                        {getAssessmentsForColumn(column.id).length === 0 && (
                          <div className="flex flex-col items-center justify-center h-32 text-slate-400 dark:text-slate-600">
                            <FileCheck className="w-8 h-8 mb-2" />
                            <p className="text-sm text-center">
                              Nenhum assessment<br />nesta categoria
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Total Assessments
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {assessments.length}
                </p>
              </div>
              <FileCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Concluídos
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {assessments.filter(a => a.status === 'completed' || a.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                  Em Andamento
                </p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {assessments.filter(a => a.status === 'sent' || a.status === 'in_progress').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  Vencidos
                </p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {assessments.filter(a => a.due_date && isOverdue(a.due_date)).length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ALEX Vendor Insights for Kanban */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple-900 dark:text-purple-100">
            <Brain className="w-5 h-5" />
            <span>ALEX VENDOR - Insights do Kanban</span>
          </CardTitle>
          <CardDescription className="text-purple-700 dark:text-purple-300">
            Análises inteligentes baseadas no fluxo atual de assessments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-green-500" />
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  <strong>Fluxo Otimizado:</strong> 
                  {assessments.filter(a => a.status === 'in_progress').length > 0 
                    ? ` ${assessments.filter(a => a.status === 'in_progress').length} assessments em progresso estável`
                    : ' Nenhum assessment em andamento no momento'
                  }
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  <strong>Gargalos Identificados:</strong> 
                  {assessments.filter(a => a.status === 'sent').length > 5
                    ? ` Muitos assessments aguardando resposta (${assessments.filter(a => a.status === 'sent').length})`
                    : ' Fluxo balanceado sem gargalos críticos'
                  }
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  <strong>Automação Sugerida:</strong> Envio automático de lembretes para assessments vencidos
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1">
                  Próxima Ação Recomendada
                </h4>
                <p className="text-xs text-purple-800 dark:text-purple-200">
                  {assessments.filter(a => isOverdue(a.due_date)).length > 0
                    ? `Contactar fornecedores com assessments vencidos (${assessments.filter(a => isOverdue(a.due_date)).length})`
                    : 'Revisar assessments completados pendentes de aprovação'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorKanbanView;