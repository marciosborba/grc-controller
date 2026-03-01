import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  AlertTriangle,
  GripHorizontal
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
  bgConfig: string;
  description: string;
  icon: React.ComponentType<any>;
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
    title: 'Planejamento',
    color: 'text-muted-foreground',
    bgConfig: 'bg-muted/50 border-muted',
    description: 'Definição do escopo',
    icon: Edit,
  },
  {
    id: 'sent',
    title: 'Aguardando Fornecedor',
    color: 'text-blue-500',
    bgConfig: 'bg-blue-500/5 border-blue-200/50 dark:border-blue-900/50',
    description: 'Convite enviado',
    icon: Send,
  },
  {
    id: 'in_progress',
    title: 'Preenchimento',
    color: 'text-amber-500',
    bgConfig: 'bg-amber-500/5 border-amber-200/50 dark:border-amber-900/50',
    description: 'Fornecedor respondendo',
    icon: Clock,
  },
  {
    id: 'completed',
    title: 'Em Análise Interna',
    color: 'text-indigo-500',
    bgConfig: 'bg-indigo-500/5 border-indigo-200/50 dark:border-indigo-900/50',
    description: 'Revisão de respostas',
    icon: FileCheck,
  },
  {
    id: 'approved',
    title: 'Homologado',
    color: 'text-green-500',
    bgConfig: 'bg-green-500/5 border-green-200/50 dark:border-green-900/50',
    description: 'Aprovado pelo GRC',
    icon: CheckCircle2,
  },
  {
    id: 'rejected',
    title: 'Revisão Necessária',
    color: 'text-red-500',
    bgConfig: 'bg-red-500/5 border-red-200/50 dark:border-red-900/50',
    description: 'Devolvido para ajustes',
    icon: XCircle,
  },
  {
    id: 'expired',
    title: 'Vencido',
    color: 'text-destructive',
    bgConfig: 'bg-destructive/5 border-destructive/20',
    description: 'Prazo expirado',
    icon: AlertTriangle,
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
      case 'critical': return 'bg-red-500/10 text-red-600 border-red-200/50 dark:border-red-900/50';
      case 'high': return 'bg-orange-500/10 text-orange-600 border-orange-200/50 dark:border-orange-900/50';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200/50 dark:border-yellow-900/50';
      case 'low': return 'bg-green-500/10 text-green-600 border-green-200/50 dark:border-green-900/50';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/10 text-red-600 border-red-200/50 dark:border-red-900/50';
      case 'high': return 'bg-orange-500/10 text-orange-600 border-orange-200/50 dark:border-orange-900/50';
      case 'medium': return 'bg-blue-500/10 text-blue-600 border-blue-200/50 dark:border-blue-900/50';
      case 'low': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
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
      className={`
        mb-3 relative group transition-all duration-200 hover:shadow-md border bg-card
        ${isOverdue() ? 'border-l-4 border-l-red-500 dark:border-l-red-500' :
          isDueSoon() ? 'border-l-4 border-l-amber-500 dark:border-l-amber-500' :
            'border-l-4 border-l-primary/30'}
        ${isDragging ? 'rotate-2 scale-105 shadow-xl z-50 ring-2 ring-primary' : ''}
      `}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 p-1 text-muted-foreground/20 hover:text-foreground cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripHorizontal className="h-4 w-4" />
      </div>

      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 pr-6">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-foreground truncate" title={assessment.assessment_name}>
              {assessment.assessment_name}
            </h4>
            <div className="flex items-center gap-1 mt-1">
              <Building className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground truncate">
                {assessment.vendor_registry?.name || 'Fornecedor não identificado'}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 absolute top-2 right-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
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
              <DropdownMenuItem onClick={() => { }}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link className="mr-2 h-4 w-4" />
                Link Público
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Progress */}
        {assessment.progress_percentage > 0 && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-muted-foreground uppercase font-medium">Progresso</span>
              <span className="text-xs font-semibold text-foreground">
                {assessment.progress_percentage}%
              </span>
            </div>
            <Progress
              value={assessment.progress_percentage}
              className="h-1.5"
            />
          </div>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge
            variant="outline"
            className={`text-xs border ${getPriorityColor(assessment.priority)}`}
          >
            {assessment.priority}
          </Badge>

          {assessment.risk_level && (
            <Badge
              variant="outline"
              className={`text-xs border ${getRiskLevelColor(assessment.risk_level)}`}
            >
              Risco {assessment.risk_level}
            </Badge>
          )}

          {isOverdue() && (
            <Badge variant="destructive" className="text-xs">
              Vencido
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground/80 pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            <span>
              {assessment.due_date
                ? format(new Date(assessment.due_date), 'dd MMM', { locale: ptBR })
                : 'Sem prazo'
              }
            </span>
          </div>

          {assessment.overall_score && (
            <div className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded text-foreground font-medium">
              <Brain className="h-3 w-3 text-primary" />
              <span>
                {assessment.overall_score.toFixed(1)}
              </span>
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
    <div className="flex-1 w-full h-full flex flex-col">
      <div className={`
        rounded-xl border h-full flex flex-col shadow-sm transition-all
        ${column.bgConfig} bg-opacity-40
      `}>
        {/* Column Header */}
        <div className="p-4 border-b border-inherit bg-background/50 backdrop-blur-sm rounded-t-xl shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg shadow-sm bg-background border border-border/50`}>
                <column.icon className={`h-4 w-4 ${column.color}`} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">
                  {column.title}
                </h3>
                <span className="text-xs text-muted-foreground">{column.description}</span>
              </div>
            </div>
            <Badge variant="secondary" className="font-mono text-xs">
              {assessments.length}
            </Badge>
          </div>

          {(stats.highPriority > 0 || stats.overdue > 0) && (
            <div className="flex gap-2 text-[10px] mt-2">
              {stats.highPriority > 0 && (
                <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">
                  <AlertCircle className="h-3 w-3" />
                  {stats.highPriority} urgente
                </span>
              )}
              {stats.overdue > 0 && (
                <span className="flex items-center gap-1 text-red-600 dark:text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                  <AlertTriangle className="h-3 w-3" />
                  {stats.overdue} vencido
                </span>
              )}
            </div>
          )}
        </div>

        {/* Column Content */}
        <div ref={setNodeRef} className="flex-1 p-2 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 -mr-3 pr-3">
            <div className="pb-4 min-h-[150px]">
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
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground/40 border-2 border-dashed border-muted rounded-xl bg-muted/20 m-2">
                  <column.icon className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm font-medium">Vazio</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
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

    const activeAssessment = filteredAssessments.find(a => a.id === activeId);
    if (!activeAssessment) return;

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
    <div className="space-y-6 h-full flex flex-col">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 shrink-0 px-1 sm:px-0">
        <Card className="bg-card border-none shadow-sm ring-1 ring-border">
          <CardContent className="p-2.5 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-xl bg-primary/10 text-primary w-fit">
                <FileCheck className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-sm font-medium text-muted-foreground truncate">Total de Assessments</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground leading-none">{filteredAssessments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-none shadow-sm ring-1 ring-border">
          <CardContent className="p-2.5 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit">
                <Clock className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-sm font-medium text-muted-foreground truncate">Em Progresso</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground leading-none">
                  {assessmentsByStatus.in_progress.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-none shadow-sm ring-1 ring-border">
          <CardContent className="p-2.5 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 w-fit">
                <CheckCircle2 className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-sm font-medium text-muted-foreground truncate">Aprovados</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground leading-none">
                  {assessmentsByStatus.approved.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-none shadow-sm ring-1 ring-border">
          <CardContent className="p-2.5 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 w-fit">
                <AlertCircle className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-sm font-medium text-muted-foreground truncate">Atrasados</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground leading-none">
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
      <div className="flex-1 min-h-0 pb-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Desktop View */}
          <div className="hidden lg:flex overflow-x-auto gap-4 h-full min-w-max pb-2 px-1 lg:px-0">
            {KANBAN_COLUMNS.map((column) => (
              <div key={column.id} className="shrink-0 w-auto flex-1 min-w-[320px]">
                <DroppableColumn
                  column={column}
                  assessments={assessmentsByStatus[column.id]}
                  stats={getColumnStats(assessmentsByStatus[column.id])}
                  onUpdate={handleUpdateAssessment}
                  onView={handleViewAssessment}
                />
              </div>
            ))}
          </div>

          {/* Mobile View (Tabs) */}
          <div className="lg:hidden h-full flex flex-col px-1">
            <Tabs defaultValue={KANBAN_COLUMNS[0].id} className="flex-1 flex flex-col h-full min-h-0">
              <div
                className="w-full shrink-0 border-b border-border/40 overflow-x-auto touch-pan-x flex"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <TabsList className="w-max inline-flex h-12 items-center justify-start rounded-none bg-transparent p-0">
                  {KANBAN_COLUMNS.map((column) => (
                    <TabsTrigger
                      key={column.id}
                      value={column.id}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-none border-b-2 border-transparent px-3 py-2 text-xs sm:text-sm sm:px-4 sm:py-3 font-medium text-muted-foreground transition-all hover:bg-muted/50 data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-background"
                    >
                      <column.icon className={`mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4 ${column.color}`} />
                      {column.title}
                      <Badge variant="secondary" className="ml-1.5 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center text-[9px] sm:text-[10px]">
                        {assessmentsByStatus[column.id].length}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <div className="flex-1 overflow-hidden mt-3">
                {KANBAN_COLUMNS.map((column) => (
                  <TabsContent key={column.id} value={column.id} className="h-full m-0 p-0 outline-none focus-visible:ring-0">
                    <DroppableColumn
                      column={column}
                      assessments={assessmentsByStatus[column.id]}
                      stats={getColumnStats(assessmentsByStatus[column.id])}
                      onUpdate={handleUpdateAssessment}
                      onView={handleViewAssessment}
                    />
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="rotate-2 scale-105 shadow-xl cursor-grabbing">
                <Card className="bg-card border-2 border-primary">
                  <CardContent className="p-4">
                    <div className="font-semibold text-sm text-foreground">
                      {filteredAssessments.find(a => a.id === activeId)?.assessment_name}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Assessment Details Dialog */}
      {selectedAssessment && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">{selectedAssessment.status}</Badge>
                {selectedAssessment.updated_at && (
                  <span className="text-xs text-muted-foreground">Updated: {new Date(selectedAssessment.updated_at).toLocaleDateString()}</span>
                )}
              </div>
              <DialogTitle className="text-xl">{selectedAssessment.assessment_name}</DialogTitle>
              <DialogDescription>
                <span className="flex items-center gap-2 mt-1">
                  <Building className="h-4 w-4" />
                  {selectedAssessment.vendor_registry?.name}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-6 py-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Prioridade</p>
                <Badge variant="secondary">{selectedAssessment.priority}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Risco</p>
                <Badge variant={selectedAssessment.risk_level === 'high' ? 'destructive' : 'outline'}>
                  {selectedAssessment.risk_level || 'N/A'}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Score</p>
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="font-bold text-lg">{selectedAssessment.overall_score?.toFixed(1) || '0.0'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{selectedAssessment.progress_percentage}%</span>
              </div>
              <Progress value={selectedAssessment.progress_percentage} className="h-2" />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                Fechar
              </Button>
              <Button>
                Ver Detalhes Completos
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};