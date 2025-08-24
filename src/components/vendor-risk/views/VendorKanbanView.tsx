import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useDroppable,
} from '@dnd-kit/core';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Clock,
  User,
  Calendar,
  Building,
  MoreHorizontal,
  Edit,
  Eye,
  Send,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileCheck,
  Brain,
  Link,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { VendorAssessment } from '@/hooks/useVendorRiskManagement';
import useVendorRiskManagement from '@/hooks/useVendorRiskManagement';

export interface VendorKanbanViewProps {
  assessments: VendorAssessment[];
  searchTerm: string;
  selectedFilter: string;
}

type AssessmentStatus = 'draft' | 'sent' | 'in_progress' | 'completed' | 'approved' | 'rejected' | 'expired';

interface KanbanColumn {
  id: AssessmentStatus;
  title: string;
  color: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string;
}

interface SortableAssessmentCardProps {
  assessment: VendorAssessment;
  onUpdate: (assessmentId: string, data: any) => void;
  onView: (assessment: VendorAssessment) => void;
}

interface DroppableColumnProps {
  column: KanbanColumn;
  assessments: VendorAssessment[];
  stats: { total: number; highPriority: number; overdue: number };
  onUpdate: (assessmentId: string, data: any) => void;
  onView: (assessment: VendorAssessment) => void;
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'draft',
    title: 'Rascunho',
    color: 'text-slate-600',
    description: 'Em preparação',
    icon: Edit,
    gradient: 'from-slate-500 to-slate-600'
  },
  {
    id: 'sent',
    title: 'Enviado',
    color: 'text-blue-600',
    description: 'Aguardando resposta',
    icon: Send,
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 'in_progress',
    title: 'Em Progresso',
    color: 'text-amber-600',
    description: 'Em preenchimento',
    icon: Clock,
    gradient: 'from-amber-500 to-amber-600'
  },
  {
    id: 'completed',
    title: 'Completado',
    color: 'text-indigo-600',
    description: 'Aguardando revisão',
    icon: FileCheck,
    gradient: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 'approved',
    title: 'Aprovado',
    color: 'text-green-600',
    description: 'Concluído com sucesso',
    icon: CheckCircle2,
    gradient: 'from-green-500 to-green-600'
  },
  {
    id: 'rejected',
    title: 'Rejeitado',
    color: 'text-red-600',
    description: 'Necessita correções',
    icon: XCircle,
    gradient: 'from-red-500 to-red-600'
  },
  {
    id: 'expired',
    title: 'Expirado',
    color: 'text-gray-600',
    description: 'Prazo vencido',
    icon: AlertTriangle,
    gradient: 'from-gray-500 to-gray-600'
  }
];

const SortableAssessmentCard: React.FC<SortableAssessmentCardProps> = ({
  assessment,
  onUpdate,
  onView
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: assessment.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getRiskLevelColor = (level?: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isDueSoon = () => {
    if (!assessment.due_date) return false;
    const dueDate = new Date(assessment.due_date);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  const isOverdue = () => {
    if (!assessment.due_date) return false;
    const dueDate = new Date(assessment.due_date);
    const today = new Date();
    return dueDate < today;
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        mb-3 cursor-grab active:cursor-grabbing transition-all duration-200 
        hover:shadow-md border-l-4 
        ${isOverdue() ? 'border-l-red-500 bg-red-50/50' : 
          isDueSoon() ? 'border-l-amber-500 bg-amber-50/50' : 
          'border-l-primary/30'}
        ${isDragging ? 'rotate-3 scale-105 shadow-lg' : ''}
      `}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-gray-900 truncate">
              {assessment.assessment_name}
            </h4>
            <div className="flex items-center gap-1 mt-1">
              <Building className="h-3 w-3 text-gray-500" />
              <span className="text-xs text-gray-600 truncate">
                {assessment.vendor_registry?.name || 'Fornecedor não identificado'}
              </span>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onView(assessment)}>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link className="mr-2 h-4 w-4" />
                Link Público
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Brain className="mr-2 h-4 w-4" />
                Análise Alex
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Progress */}
        {assessment.progress_percentage > 0 && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">Progresso</span>
              <span className="text-xs font-semibold text-gray-800">
                {assessment.progress_percentage}%
              </span>
            </div>
            <Progress 
              value={assessment.progress_percentage} 
              className="h-2"
            />
          </div>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge 
            variant="outline" 
            className={`text-xs ${getPriorityColor(assessment.priority)}`}
          >
            {assessment.priority}
          </Badge>
          
          {assessment.risk_level && (
            <Badge 
              variant="outline" 
              className={`text-xs ${getRiskLevelColor(assessment.risk_level)}`}
            >
              {assessment.risk_level}
            </Badge>
          )}

          {assessment.assessment_type && (
            <Badge variant="secondary" className="text-xs">
              {assessment.assessment_type}
            </Badge>
          )}

          {isOverdue() && (
            <Badge variant="destructive" className="text-xs">
              Vencido
            </Badge>
          )}

          {isDueSoon() && !isOverdue() && (
            <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 border-amber-200">
              Vence em breve
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>
              {assessment.due_date 
                ? format(new Date(assessment.due_date), 'dd/MM/yyyy', { locale: ptBR })
                : 'Sem prazo'
              }
            </span>
          </div>
          
          {assessment.overall_score && (
            <div className="flex items-center gap-1">
              <span className="font-semibold">
                {assessment.overall_score.toFixed(1)}
              </span>
              <span>/5.0</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const DroppableColumn: React.FC<DroppableColumnProps> = ({
  column,
  assessments,
  stats,
  onUpdate,
  onView
}) => {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div className="flex-1 min-w-80">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${column.gradient} text-white`}>
                <column.icon className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className={`text-sm font-semibold ${column.color}`}>
                  {column.title}
                </CardTitle>
                <p className="text-xs text-gray-500">{column.description}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-lg font-bold ${column.color}`}>
                {assessments.length}
              </div>
              <div className="text-xs text-gray-500">assessments</div>
            </div>
          </div>
          
          {(stats.highPriority > 0 || stats.overdue > 0) && (
            <div className="flex gap-2 text-xs">
              {stats.highPriority > 0 && (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  {stats.highPriority} urgente
                </Badge>
              )}
              {stats.overdue > 0 && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {stats.overdue} vencido
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
        
        <CardContent ref={setNodeRef} className="pt-0 pb-4 min-h-96 max-h-96 overflow-y-auto">
          <SortableContext items={assessments.map(a => a.id)} strategy={verticalListSortingStrategy}>
            {assessments.map((assessment) => (
              <SortableAssessmentCard
                key={assessment.id}
                assessment={assessment}
                onUpdate={onUpdate}
                onView={onView}
              />
            ))}
          </SortableContext>
          
          {assessments.length === 0 && (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <column.icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum assessment</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const VendorKanbanView: React.FC<VendorKanbanViewProps> = ({
  assessments,
  searchTerm,
  selectedFilter
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<VendorAssessment | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const { toast } = useToast();
  const { updateAssessment } = useVendorRiskManagement();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filtrar assessments
  const filteredAssessments = useMemo(() => {
    return assessments.filter(assessment => {
      const matchesSearch = searchTerm === '' || 
        assessment.assessment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.vendor_registry?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = selectedFilter === 'all' || 
        assessment.status === selectedFilter ||
        assessment.priority === selectedFilter ||
        assessment.risk_level === selectedFilter;

      return matchesSearch && matchesFilter;
    });
  }, [assessments, searchTerm, selectedFilter]);

  // Agrupar por status
  const assessmentsByStatus = useMemo(() => {
    const groups: Record<AssessmentStatus, VendorAssessment[]> = {
      draft: [],
      sent: [],
      in_progress: [],
      completed: [],
      approved: [],
      rejected: [],
      expired: []
    };

    filteredAssessments.forEach(assessment => {
      if (groups[assessment.status]) {
        groups[assessment.status].push(assessment);
      }
    });

    return groups;
  }, [filteredAssessments]);

  // Calcular estatísticas por coluna
  const getColumnStats = (assessments: VendorAssessment[]) => {
    const today = new Date();
    return {
      total: assessments.length,
      highPriority: assessments.filter(a => a.priority === 'urgent' || a.priority === 'high').length,
      overdue: assessments.filter(a => {
        if (!a.due_date) return false;
        return new Date(a.due_date) < today;
      }).length
    };
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Encontrar o assessment que está sendo movido
    const activeAssessment = filteredAssessments.find(a => a.id === activeId);
    if (!activeAssessment) return;

    // Se mudou de coluna, atualizar status
    if (overId !== activeAssessment.status) {
      try {
        await updateAssessment(activeId, { status: overId as AssessmentStatus });
        toast({
          title: 'Status atualizado',
          description: `Assessment movido para ${KANBAN_COLUMNS.find(c => c.id === overId)?.title}`,
        });
      } catch (error) {
        toast({
          title: 'Erro ao atualizar',
          description: 'Não foi possível mover o assessment.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleViewAssessment = (assessment: VendorAssessment) => {
    setSelectedAssessment(assessment);
    setShowDetailsDialog(true);
  };

  const handleUpdateAssessment = async (assessmentId: string, data: any) => {
    try {
      await updateAssessment(assessmentId, data);
      toast({
        title: 'Assessment atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <FileCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{filteredAssessments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Em Progresso</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assessmentsByStatus.in_progress.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Aprovados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assessmentsByStatus.approved.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Atrasados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.values(assessmentsByStatus).flat().filter(a => {
                    if (!a.due_date) return false;
                    return new Date(a.due_date) < new Date();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((column) => (
            <DroppableColumn
              key={column.id}
              column={column}
              assessments={assessmentsByStatus[column.id]}
              stats={getColumnStats(assessmentsByStatus[column.id])}
              onUpdate={handleUpdateAssessment}
              onView={handleViewAssessment}
            />
          ))}
        </div>
        
        <DragOverlay>
          {activeId ? (
            <div className="rotate-3 scale-105 shadow-lg">
              <Card className="mb-3 border-l-4 border-l-primary/30">
                <CardContent className="p-4">
                  <div className="font-semibold text-sm text-gray-900">
                    {filteredAssessments.find(a => a.id === activeId)?.assessment_name}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Assessment Details Dialog */}
      {selectedAssessment && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedAssessment.assessment_name}</DialogTitle>
              <DialogDescription>
                {selectedAssessment.vendor_registry?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Status:</span>
                  <Badge className="ml-2">{selectedAssessment.status}</Badge>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Prioridade:</span>
                  <Badge variant="outline" className="ml-2">{selectedAssessment.priority}</Badge>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Progresso:</span>
                  <span className="ml-2">{selectedAssessment.progress_percentage}%</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Tipo:</span>
                  <span className="ml-2">{selectedAssessment.assessment_type}</span>
                </div>
              </div>
              
              {selectedAssessment.due_date && (
                <div className="text-sm">
                  <span className="font-medium text-gray-600">Data limite:</span>
                  <span className="ml-2">
                    {format(new Date(selectedAssessment.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>
              )}
              
              {selectedAssessment.overall_score && (
                <div className="text-sm">
                  <span className="font-medium text-gray-600">Score:</span>
                  <span className="ml-2 font-semibold">{selectedAssessment.overall_score.toFixed(1)}/5.0</span>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                Fechar
              </Button>
              <Button>
                Editar Assessment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};