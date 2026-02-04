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
  PointerActivationConstraint,
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
  Kanban,
  AlertTriangle,
  AlertCircle,
  Clock,
  User,
  Calendar,
  Target,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  XCircle,
  CheckCircle2,
  Activity,
  BarChart3,
  PlayCircle
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Risk, RiskFilters, RiskStatus } from '@/types/risk-management';

interface KanbanViewProps {
  risks: Risk[];
  searchTerm: string;
  filters?: RiskFilters;
  onUpdate: (riskId: string, data: any) => void;
  onDelete?: (riskId: string) => void;
}

interface KanbanColumn {
  id: RiskStatus;
  title: string;
  color: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string;
}

interface SortableRiskCardProps {
  risk: Risk;
  onUpdate: (riskId: string, data: any) => void;
  onDelete?: (riskId: string) => void;
}

interface DroppableColumnProps {
  column: KanbanColumn;
  risks: Risk[];
  stats: { total: number; highPriority: number; overdue: number };
  onUpdate: (riskId: string, data: any) => void;
  onDelete?: (riskId: string) => void;
}

const SortableRiskCard: React.FC<SortableRiskCardProps> = ({ risk, onUpdate, onDelete }) => {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    assignedTo: '',
    status: ''
  });
  const { toast } = useToast();

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
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  // Função para cores de nível de risco com suporte completo ao dark mode
  const getRiskLevelConfig = (level: string) => {
    switch (level) {
      case 'Muito Alto':
      case 'Crítico':
        return { 
          color: 'border-l-red-500 bg-card hover:bg-red-50/50 dark:hover:bg-red-950/20 border-border',
          badge: 'border-red-500 bg-red-100 text-red-900 dark:border-red-400 dark:bg-red-950/30 dark:text-red-300',
          icon: XCircle,
          iconColor: 'text-red-500 dark:text-red-400',
          emoji: '🔴'
        };
      case 'Alto': 
        return { 
          color: 'border-l-orange-500 bg-card hover:bg-orange-50/50 dark:hover:bg-orange-950/20 border-border',
          badge: 'border-orange-500 bg-orange-100 text-orange-900 dark:border-orange-400 dark:bg-orange-950/30 dark:text-orange-300',
          icon: AlertCircle,
          iconColor: 'text-orange-500 dark:text-orange-400',
          emoji: '🟠'
        };
      case 'Médio': 
        return { 
          color: 'border-l-yellow-500 bg-card hover:bg-yellow-50/50 dark:hover:bg-yellow-950/20 border-border',
          badge: 'border-yellow-500 bg-yellow-100 text-yellow-900 dark:border-yellow-400 dark:bg-yellow-950/30 dark:text-yellow-300',
          icon: AlertTriangle,
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          emoji: '🟡'
        };
      case 'Baixo': 
        return { 
          color: 'border-l-green-500 bg-card hover:bg-green-50/50 dark:hover:bg-green-950/20 border-border',
          badge: 'border-green-500 bg-green-100 text-green-900 dark:border-green-400 dark:bg-green-950/30 dark:text-green-300',
          icon: CheckCircle2,
          iconColor: 'text-green-500 dark:text-green-400',
          emoji: '🟢'
        };
      case 'Muito Baixo':
        return { 
          color: 'border-l-blue-500 bg-card hover:bg-blue-50/50 dark:hover:bg-blue-950/20 border-border',
          badge: 'border-blue-500 bg-blue-100 text-blue-900 dark:border-blue-400 dark:bg-blue-950/30 dark:text-blue-300',
          icon: CheckCircle2,
          iconColor: 'text-blue-500 dark:text-blue-400',
          emoji: '🔵'
        };
      default: 
        return { 
          color: 'border-l-gray-500 bg-card hover:bg-gray-50/50 dark:hover:bg-gray-950/20 border-border',
          badge: 'border-gray-500 bg-gray-100 text-gray-900 dark:border-gray-400 dark:bg-gray-950/30 dark:text-gray-300',
          icon: Activity,
          iconColor: 'text-gray-500 dark:text-gray-400',
          emoji: '⚪'
        };
    }
  };

  // Função para cores de status seguindo padrão do módulo
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Identificado':
        return {
          color: 'bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-700',
          emoji: '🔍'
        };
      case 'Avaliado':
        return {
          color: 'bg-purple-500 text-white border-purple-600 dark:bg-purple-600 dark:border-purple-700',
          emoji: '📊'
        };
      case 'Em Tratamento':
        return {
          color: 'bg-indigo-500 text-white border-indigo-600 dark:bg-indigo-600 dark:border-indigo-700',
          emoji: '🛠️'
        };
      case 'Monitorado':
        return {
          color: 'bg-teal-500 text-white border-teal-600 dark:bg-teal-600 dark:border-teal-700',
          emoji: '👁️'
        };
      case 'Fechado':
        return {
          color: 'bg-gray-500 text-white border-gray-600 dark:bg-gray-600 dark:border-gray-700',
          emoji: '✅'
        };
      case 'Reaberto':
        return {
          color: 'bg-orange-500 text-white border-orange-600 dark:bg-orange-600 dark:border-orange-700',
          emoji: '🔄'
        };
      default:
        return {
          color: 'bg-gray-500 text-white border-gray-600 dark:bg-gray-600 dark:border-gray-700',
          emoji: '📝'
        };
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
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

  const getProgressColor = () => {
    const value = getProgressValue();
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-blue-500';
    if (value >= 40) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const riskConfig = getRiskLevelConfig(risk.riskLevel);
  const statusConfig = getStatusConfig(risk.status);

  // Handlers para as ações
  const handleView = () => {
    setIsViewDialogOpen(true);
  };

  const handleEdit = () => {
    setEditForm({
      name: risk.name,
      description: risk.description || '',
      assignedTo: risk.assignedTo || '',
      status: risk.status
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    onUpdate(risk.id, {
      name: editForm.name,
      description: editForm.description,
      assignedTo: editForm.assignedTo,
      status: editForm.status
    });

    setIsEditDialogOpen(false);
    toast({
      title: '✅ Risco Atualizado',
      description: 'As alterações foram salvas com sucesso.',
    });
  };

  const handleDelete = () => {
    if (confirm(`Tem certeza que deseja excluir o risco "${risk.name}"?`)) {
      onDelete?.(risk.id);
      toast({
        title: '🗑️ Risco Excluído',
        description: 'O risco foi removido permanentemente.',
      });
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={`
          p-3 border-l-4 rounded-lg shadow-sm hover:shadow-md 
          transition-all duration-200 relative
          ${riskConfig.color}
          ${isDragging ? 'opacity-50 rotate-2 scale-105' : ''}
          ${isOverdue() ? 'ring-2 ring-red-200 dark:ring-red-800' : ''}
        `}
      >
        {/* Área de Drag - Handle invisível */}
        <div 
          {...listeners}
          className="absolute inset-0 cursor-grab active:cursor-grabbing z-0"
          style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
        />
        
      <div className="space-y-2.5 relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <h4 className="font-medium text-xs truncate text-foreground leading-tight">{risk.name}</h4>
              {isOverdue() && (
                <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate opacity-75">{risk.category}</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 hover:bg-muted/50 relative z-20"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 z-50">
              <DropdownMenuItem 
                className="text-xs" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleView();
                }}
              >
                <Eye className="h-3.5 w-3.5 mr-2" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-xs" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
              >
                <Edit className="h-3.5 w-3.5 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-xs text-destructive" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Badges Row */}
        <div className="flex items-center justify-between gap-2">
          <Badge className={`${riskConfig.badge} border text-[10px] font-medium px-1.5 py-0.5 shrink-0`}>
            <span className="mr-1 text-[10px]">{riskConfig.emoji}</span>
            <span className="truncate text-[10px]">{risk.riskLevel}</span>
          </Badge>
          <div className="text-right shrink-0">
            <div className="text-xs font-mono font-bold text-foreground">{risk.riskScore}</div>
            <div className="text-xs text-muted-foreground leading-none opacity-75">Score</div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge className={`${statusConfig.color} text-[10px] font-medium px-2 py-0.5 max-w-full`}>
            <span className="mr-1 text-[10px]">{statusConfig.emoji}</span>
            <span className="truncate text-[10px]">{risk.status}</span>
          </Badge>
        </div>

        {/* Progresso */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground opacity-75">Progresso</span>
            <span className="font-medium text-foreground text-xs">{getProgressValue()}%</span>
          </div>
          <Progress value={getProgressValue()} className="h-1.5" />
        </div>

        {/* Descrição */}
        {risk.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed opacity-75">
            {risk.description}
          </p>
        )}

        {/* Footer */}
        <div className="space-y-1.5 pt-2 border-t border-border">
          {/* Responsável */}
          <div className="flex items-center gap-1.5 text-xs">
            <User className="h-3 w-3 text-muted-foreground flex-shrink-0 opacity-75" />
            <span className="text-muted-foreground truncate text-xs opacity-75">
              {risk.assignedTo || 'Não atribuído'}
            </span>
          </div>

          {/* Data de Vencimento */}
          <div className={`flex items-center gap-1.5 text-xs ${
            isOverdue() ? 'text-destructive font-medium' : 'text-muted-foreground opacity-75'
          }`}>
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span className="truncate text-xs">
              {risk.dueDate ? formatDate(risk.dueDate) : 'Sem prazo'}
              {isOverdue() && ' (Atrasado)'}
            </span>
          </div>
        </div>
      </div>
      </div>
      
      {/* Dialog de Visualização */}
    <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Detalhes do Risco
          </DialogTitle>
          <DialogDescription>
            Visualização completa das informações do risco.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Nome</Label>
            <p className="text-sm text-muted-foreground mt-1">{risk.name}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Descrição</Label>
            <p className="text-sm text-muted-foreground mt-1">{risk.description || 'Sem descrição'}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Categoria</Label>
              <p className="text-sm text-muted-foreground mt-1">{risk.category}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Nível de Risco</Label>
              <p className="text-sm text-muted-foreground mt-1">{risk.riskLevel}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Score</Label>
              <p className="text-sm text-muted-foreground mt-1">{risk.riskScore}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <p className="text-sm text-muted-foreground mt-1">{risk.status}</p>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Responsável</Label>
            <p className="text-sm text-muted-foreground mt-1">{risk.assignedTo || 'Não atribuído'}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Data de Criação</Label>
              <p className="text-sm text-muted-foreground mt-1">{formatDate(risk.createdAt)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Data de Vencimento</Label>
              <p className="text-sm text-muted-foreground mt-1">{risk.dueDate ? formatDate(risk.dueDate) : 'Sem prazo'}</p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
    {/* Dialog de Edição */}
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Risco
          </DialogTitle>
          <DialogDescription>
            Faça as alterações necessárias no risco selecionado.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">
              Nome
            </Label>
            <Input
              id="edit-name"
              value={editForm.name}
              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-description" className="text-right">
              Descrição
            </Label>
            <Textarea
              id="edit-description"
              value={editForm.description}
              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
              className="col-span-3"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-assigned" className="text-right">
              Responsável
            </Label>
            <Input
              id="edit-assigned"
              value={editForm.assignedTo}
              onChange={(e) => setEditForm({...editForm, assignedTo: e.target.value})}
              className="col-span-3"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveEdit}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

const DroppableColumn: React.FC<DroppableColumnProps> = ({ column, risks, stats, onUpdate, onDelete }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      columnId: column.id,
    },
  });

  return (
    <Card 
      key={column.id} 
      className={`${column.color} border shadow-sm ${
        isOver ? 'ring-2 ring-primary ring-opacity-50 bg-primary/5' : ''
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${column.gradient} text-white shadow-sm`}>
              <column.icon className="h-3.5 w-3.5" />
            </div>
            <CardTitle className="text-xs font-semibold text-foreground">
              {column.title}
            </CardTitle>
          </div>
          <Badge variant="secondary" className="text-[10px] font-medium px-2 py-0.5">
            {stats.total}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {column.description}
        </p>
        
        {/* Estatísticas da coluna */}
        {(stats.highPriority > 0 || stats.overdue > 0) && (
          <div className="flex flex-wrap items-center gap-1 mt-2">
            {stats.highPriority > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">
                🔴 {stats.highPriority}
              </Badge>
            )}
            {stats.overdue > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">
                ⏰ {stats.overdue}
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
          <div 
            ref={setNodeRef}
            className={`space-y-2.5 min-h-[400px] transition-colors ${
              isOver ? 'bg-primary/5 rounded-lg' : ''
            }`}
            data-column-id={column.id}
          >
            {risks.map((risk) => (
              <SortableRiskCard
                key={risk.id}
                risk={risk}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
            
            {/* Área de Drop vazia */}
            {risks.length === 0 && (
              <div 
                className={`border-2 border-dashed border-muted rounded-lg p-6 text-center text-muted-foreground hover:border-primary/50 transition-colors ${
                  isOver ? 'border-primary bg-primary/10' : ''
                }`}
              >
                <div className={`p-2.5 rounded-full ${column.gradient} text-white mx-auto mb-2 w-fit shadow-sm`}>
                  <Target className="h-5 w-5" />
                </div>
                <p className="text-xs font-medium mb-1">Arraste riscos aqui</p>
                <p className="text-xs opacity-60">Para {column.title.toLowerCase()}</p>
              </div>
            )}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  );
};

export const KanbanView: React.FC<KanbanViewProps> = ({
  risks,
  searchTerm,
  filters = {},
  onUpdate,
  onDelete
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
        delay: 100,
        tolerance: 5,
      } as PointerActivationConstraint,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns: KanbanColumn[] = [
    {
      id: 'Identificado',
      title: 'Identificado',
      color: 'border-blue-200 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-950/20',
      gradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
      description: 'Riscos recém identificados',
      icon: AlertCircle
    },
    {
      id: 'Avaliado',
      title: 'Avaliado',
      color: 'border-purple-200 bg-purple-50/30 dark:border-purple-800 dark:bg-purple-950/20',
      gradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
      description: 'Análise de risco concluída',
      icon: BarChart3
    },
    {
      id: 'Em Tratamento',
      title: 'Em Tratamento',
      color: 'border-indigo-200 bg-indigo-50/30 dark:border-indigo-800 dark:bg-indigo-950/20',
      gradient: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
      description: 'Mitigação em andamento',
      icon: PlayCircle
    },
    {
      id: 'Monitorado',
      title: 'Monitorado',
      color: 'border-teal-200 bg-teal-50/30 dark:border-teal-800 dark:bg-teal-950/20',
      gradient: 'bg-gradient-to-r from-teal-500 to-teal-600',
      description: 'Acompanhamento',
      icon: Activity
    },
    {
      id: 'Fechado',
      title: 'Fechado',
      color: 'border-gray-200 bg-gray-50/30 dark:border-gray-700 dark:bg-gray-800/20',
      gradient: 'bg-gradient-to-r from-gray-500 to-gray-600',
      description: 'Riscos resolvidos',
      icon: CheckCircle2
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

    if (!over) {
      console.log('🔴 Drag cancelado - sem destino');
      return;
    }

    const activeRisk = filteredRisks.find(r => r.id === active.id);
    if (!activeRisk) {
      console.log('🔴 Risco não encontrado:', active.id);
      return;
    }

    console.log('🟡 Drag detectado:', {
      activeId: active.id,
      overId: over.id,
      activeRiskStatus: activeRisk.status
    });

    // Determinar o novo status baseado no destino
    let newStatus: KanbanColumn | undefined;
    
    // Primeiro, verificar se foi dropado diretamente em uma coluna
    const overElement = over.data?.current?.sortable?.containerId || over.id;
    newStatus = columns.find(col => col.id === overElement);
    
    // Se não encontrou, verificar se foi dropado em outro card
    if (!newStatus) {
      const targetRisk = filteredRisks.find(r => r.id === over.id);
      if (targetRisk) {
        newStatus = columns.find(col => col.id === targetRisk.status);
      }
    }
    
    // Se ainda não encontrou, tentar pelos dados do elemento
    if (!newStatus) {
      const overData = over.data?.current;
      if (overData?.columnId) {
        newStatus = columns.find(col => col.id === overData.columnId);
      }
    }

    console.log('🟡 Status determinado:', newStatus?.id);

    if (newStatus && activeRisk.status !== newStatus.id) {
      console.log('✅ Atualizando status:', {
        riskId: activeRisk.id,
        riskName: activeRisk.name,
        from: activeRisk.status,
        to: newStatus.id,
        newStatusType: typeof newStatus.id
      });
      
      // Garantir que o status é uma string válida
      const statusToUpdate = newStatus.id as RiskStatus;
      
      onUpdate(activeRisk.id, { status: statusToUpdate });
      
      toast({
        title: '✅ Status Atualizado',
        description: `Risco "${activeRisk.name}" movido para "${newStatus.title}"`,
      });
    } else {
      console.log('🔴 Nenhuma mudança de status necessária');
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

  const getOverallStats = () => {
    const total = filteredRisks.length;
    const highPriority = filteredRisks.filter(r => r.riskLevel === 'Muito Alto' || r.riskLevel === 'Alto').length;
    const overdue = filteredRisks.filter(r => {
      if (!r.dueDate || r.status === 'Fechado') return false;
      return new Date(r.dueDate) < new Date();
    }).length;
    const completed = filteredRisks.filter(r => r.status === 'Fechado').length;
    
    return { total, highPriority, overdue, completed };
  };

  const overallStats = getOverallStats();

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm">
                <Kanban className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">Kanban Board - Workflow de Riscos</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5 opacity-75">Gerencie o fluxo de trabalho dos riscos</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-[10px] font-medium px-2 py-1">
                {filteredRisks.length} riscos
              </Badge>
              {overallStats.overdue > 0 && (
                <Badge variant="destructive" className="text-[10px] font-medium px-2 py-1">
                  ⏰ {overallStats.overdue} atrasados
                </Badge>
              )}
              {overallStats.highPriority > 0 && (
                <Badge variant="destructive" className="text-[10px] font-medium px-2 py-1">
                  🔴 {overallStats.highPriority} alta prioridade
                </Badge>
              )}
            </div>
          </div>
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
              <DroppableColumn
                key={column.id}
                column={column}
                risks={risks}
                stats={stats}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
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
                  <SortableRiskCard risk={draggedRisk} onUpdate={onUpdate} onDelete={onDelete} />
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
              <h3 className="text-base font-medium text-muted-foreground mb-2">
                Nenhum risco encontrado
              </h3>
              <p className="text-sm text-muted-foreground">
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