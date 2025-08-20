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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Kanban,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  Target,
  Plus,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import type { Risk, RiskFilters, RiskStatus } from '@/types/risk-management';

interface KanbanViewProps {
  risks: Risk[];
  searchTerm: string;
  filters?: RiskFilters;
  onUpdate: (riskId: string, data: any) => void;
}

interface KanbanColumn {
  id: RiskStatus;
  title: string;
  color: string;
  description: string;
}

interface SortableRiskCardProps {
  risk: Risk;
  onUpdate: (riskId: string, data: any) => void;
}

const SortableRiskCard: React.FC<SortableRiskCardProps> = ({ risk, onUpdate }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: risk.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Muito Alto': return 'border-l-red-500 bg-red-50';
      case 'Alto': return 'border-l-orange-500 bg-orange-50';
      case 'Médio': return 'border-l-yellow-500 bg-yellow-50';
      case 'Baixo': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getRiskLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'Muito Alto': return 'border-red-200 bg-red-100 text-red-800';
      case 'Alto': return 'border-orange-200 bg-orange-100 text-orange-800';
      case 'Médio': return 'border-yellow-200 bg-yellow-100 text-yellow-800';
      case 'Baixo': return 'border-green-200 bg-green-100 text-green-800';
      default: return 'border-gray-200 bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const isOverdue = () => {
    if (!risk.dueDate || risk.status === 'Fechado') return false;
    return new Date(risk.dueDate) < new Date();
  };

  const getProgressValue = () => {
    switch (risk.status) {
      case 'Identificado': return 20;
      case 'Avaliado': return 40;
      case 'Em Tratamento': return 60;
      case 'Monitorado': return 80;
      case 'Fechado': return 100;
      case 'Reaberto': return 30;
      default: return 0;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 border-l-4 rounded-lg shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${getRiskLevelColor(risk.riskLevel)}`}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{risk.name}</h4>
            <p className="text-xs text-muted-foreground">{risk.category}</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Edit className="h-3 w-3 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Eye className="h-3 w-3 mr-2" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-3 w-3 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Nível de Risco e Score */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={`text-xs ${getRiskLevelBadgeColor(risk.riskLevel)}`}>
            {risk.riskLevel}
          </Badge>
          <span className="text-xs font-mono font-bold">Score: {risk.riskScore}</span>
        </div>

        {/* Progresso */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{getProgressValue()}%</span>
          </div>
          <Progress value={getProgressValue()} className="h-1" />
        </div>

        {/* Descrição */}
        {risk.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {risk.description}
          </p>
        )}

        {/* Footer */}
        <div className="space-y-2">
          {/* Responsável */}
          {risk.assignedTo && (
            <div className="flex items-center space-x-1 text-xs">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground truncate">{risk.assignedTo}</span>
            </div>
          )}

          {/* Data de Vencimento */}
          {risk.dueDate && (
            <div className={`flex items-center space-x-1 text-xs ${isOverdue() ? 'text-red-600' : 'text-muted-foreground'}`}>
              <Calendar className="h-3 w-3" />
              <span>{formatDate(risk.dueDate)}</span>
              {isOverdue() && <AlertTriangle className="h-3 w-3 text-red-500" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const KanbanView: React.FC<KanbanViewProps> = ({
  risks,
  searchTerm,
  filters = {},
  onUpdate
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { toast } = useToast();

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

  const columns: KanbanColumn[] = [
    {
      id: 'Identificado',
      title: 'Identificado',
      color: 'border-blue-200 bg-blue-50',
      description: 'Riscos recém identificados'
    },
    {
      id: 'Avaliado',
      title: 'Avaliado',
      color: 'border-purple-200 bg-purple-50',
      description: 'Análise de risco concluída'
    },
    {
      id: 'Em Tratamento',
      title: 'Em Tratamento',
      color: 'border-indigo-200 bg-indigo-50',
      description: 'Ações de mitigação em andamento'
    },
    {
      id: 'Monitorado',
      title: 'Monitorado',
      color: 'border-teal-200 bg-teal-50',
      description: 'Acompanhamento contínuo'
    },
    {
      id: 'Fechado',
      title: 'Fechado',
      color: 'border-gray-200 bg-gray-50',
      description: 'Riscos resolvidos'
    }
  ];

  // Filtrar riscos
  const filteredRisks = useMemo(() => {
    return risks.filter(risk => {
      // Busca por termo
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!risk.name.toLowerCase().includes(term) &&
            !risk.description?.toLowerCase().includes(term) &&
            !risk.category.toLowerCase().includes(term) &&
            !risk.assignedTo?.toLowerCase().includes(term)) {
          return false;
        }
      }

      // Aplicar filtros
      if (filters?.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(risk.category)) return false;
      }

      if (filters?.levels && filters.levels.length > 0) {
        if (!filters.levels.includes(risk.riskLevel)) return false;
      }

      if (filters?.statuses && filters.statuses.length > 0) {
        if (!filters.statuses.includes(risk.status)) return false;
      }

      if (filters?.showOverdue) {
        const now = new Date();
        if (!risk.dueDate || risk.dueDate > now || risk.status === 'Fechado') {
          return false;
        }
      }

      return true;
    });
  }, [risks, searchTerm, filters]);

  // Agrupar riscos por status
  const risksByStatus = useMemo(() => {
    const grouped = columns.reduce((acc, column) => {
      acc[column.id] = filteredRisks.filter(risk => risk.status === column.id);
      return acc;
    }, {} as Record<RiskStatus, Risk[]>);

    return grouped;
  }, [filteredRisks, columns]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeRisk = filteredRisks.find(r => r.id === active.id);
    if (!activeRisk) return;

    // Se mudou de coluna
    const overId = over.id as string;
    const newStatus = columns.find(col => 
      col.id === overId || risksByStatus[col.id]?.some(r => r.id === overId)
    );

    if (newStatus && activeRisk.status !== newStatus.id) {
      onUpdate(activeRisk.id, { status: newStatus.id });
      
      toast({
        title: '✅ Status Atualizado',
        description: `Risco movido para "${newStatus.title}"`,
      });
    }
  };

  const getColumnStats = (columnId: RiskStatus) => {
    const risks = risksByStatus[columnId] || [];
    const highPriority = risks.filter(r => r.riskLevel === 'Muito Alto' || r.riskLevel === 'Alto').length;
    const overdue = risks.filter(r => {
      if (!r.dueDate || r.status === 'Fechado') return false;
      return new Date(r.dueDate) < new Date();
    }).length;

    return { total: risks.length, highPriority, overdue };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Kanban className="h-5 w-5" />
            <span>Kanban Board - Workflow de Riscos</span>
            <Badge variant="secondary">{filteredRisks.length} riscos</Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {columns.map((column) => {
            const stats = getColumnStats(column.id);
            const risks = risksByStatus[column.id] || [];

            return (
              <Card key={column.id} className={`${column.color} border-2`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {column.title}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {stats.total}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {column.description}
                  </p>
                  
                  {/* Estatísticas da coluna */}
                  {(stats.highPriority > 0 || stats.overdue > 0) && (
                    <div className="flex items-center space-x-2 text-xs">
                      {stats.highPriority > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {stats.highPriority} alta prioridade
                        </Badge>
                      )}
                      {stats.overdue > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {stats.overdue} atrasados
                        </Badge>
                      )}
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0">
                  <SortableContext 
                    items={risks.map(r => r.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3 min-h-[400px]">
                      {risks.map((risk) => (
                        <SortableRiskCard
                          key={risk.id}
                          risk={risk}
                          onUpdate={onUpdate}
                        />
                      ))}
                      
                      {/* Área de Drop vazia */}
                      {risks.length === 0 && (
                        <div 
                          className="border-2 border-dashed border-muted rounded-lg p-8 text-center text-muted-foreground"
                        >
                          <Target className="mx-auto h-8 w-8 mb-2" />
                          <p className="text-sm">Arraste riscos aqui</p>
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Overlay durante drag */}
        <DragOverlay>
          {activeId ? (
            <div className="rotate-2 opacity-90">
              {(() => {
                const draggedRisk = filteredRisks.find(r => r.id === activeId);
                return draggedRisk ? (
                  <SortableRiskCard risk={draggedRisk} onUpdate={onUpdate} />
                ) : null;
              })()}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Estado vazio */}
      {filteredRisks.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Kanban className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Nenhum risco encontrado
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || Object.keys(filters).length > 0 
                  ? 'Tente ajustar os filtros ou termo de busca'
                  : 'Nenhum risco foi identificado ainda'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};