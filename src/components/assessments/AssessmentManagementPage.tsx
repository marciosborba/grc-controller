import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { 
  FileCheck,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Users,
  TrendingUp,
  Calendar as CalendarIcon,
  BarChart3,
  Activity,
  Eye,
  Archive,
  Target,
  Shield,
  Gauge
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { useAssessmentManagement } from '@/hooks/useAssessmentManagement';
import AssessmentCard from './AssessmentCard';
import SortableAssessmentCard from './SortableAssessmentCard';
import AssessmentForm from './AssessmentForm';
import type { 
  Assessment, 
  AssessmentFilters, 
  AssessmentStatus, 
  AssessmentPriority,
  AssessmentType 
} from '@/types/assessment-management';
import { 
  ASSESSMENT_STATUSES, 
  ASSESSMENT_PRIORITIES, 
  ASSESSMENT_TYPES 
} from '@/types/assessment-management';

const AssessmentManagementPage = () => {
  const { user } = useAuth();
  const {
    assessments,
    frameworks,
    profiles,
    createAssessment,
    updateAssessment,
    deleteAssessment,
    duplicateAssessment,
    getMetrics,
    filterAssessments,
    isCreatingAssessment,
    isUpdatingAssessment,
    isDeletingAssessment,
    isAssessmentsLoading,
    assessmentsError
  } = useAssessmentManagement();

  // Estados principais
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [sortedAssessments, setSortedAssessments] = useState<Assessment[]>([]);
  const [isCardView, setIsCardView] = useState(true);

  // Estados de filtro
  const [filters, setFilters] = useState<AssessmentFilters>({
    search_term: '',
    statuses: [],
    types: [],
    priorities: [],
    frameworks: [],
    show_overdue: false,
    show_upcoming_deadlines: false
  });

  // Atualizar assessments ordenados quando os assessments mudarem
  useEffect(() => {
    const filtered = filterAssessments(filters);
    setSortedAssessments(filtered);
  }, [assessments, filters, filterAssessments]);

  // Configuração do drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const metrics = getMetrics();

  // FUNÇÕES DE MANIPULAÇÃO

  const handleCreateAssessment = async (data: any) => {
    try {
      await createAssessment({
        ...data,
        created_by: user?.id
      });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao criar assessment:', error);
    }
  };

  const handleUpdateAssessment = async (assessmentId: string, updates: any) => {
    try {
      await updateAssessment({ 
        id: assessmentId, 
        updates: {
          ...updates,
          updated_by: user?.id
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar assessment:', error);
    }
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    try {
      await deleteAssessment(assessmentId);
    } catch (error) {
      console.error('Erro ao excluir assessment:', error);
    }
  };

  const handleDuplicateAssessment = async (assessmentId: string) => {
    try {
      await duplicateAssessment(assessmentId);
    } catch (error) {
      console.error('Erro ao duplicar assessment:', error);
    }
  };

  const handleEdit = (assessment: Assessment) => {
    setEditingAssessment(assessment);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingAssessment(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSortedAssessments((assessments) => {
        const oldIndex = assessments.findIndex((assessment) => assessment.id === active.id);
        const newIndex = assessments.findIndex((assessment) => assessment.id === over.id);

        return arrayMove(assessments, oldIndex, newIndex);
      });
    }
  };

  // FUNÇÕES DE FILTRO

  const updateFilter = (key: keyof AssessmentFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search_term: '',
      statuses: [],
      types: [],
      priorities: [],
      frameworks: [],
      show_overdue: false,
      show_upcoming_deadlines: false
    });
  };

  const hasActiveFilters = () => {
    return !!(
      filters.search_term ||
      (filters.statuses && filters.statuses.length > 0) ||
      (filters.types && filters.types.length > 0) ||
      (filters.priorities && filters.priorities.length > 0) ||
      (filters.frameworks && filters.frameworks.length > 0) ||
      filters.show_overdue ||
      filters.show_upcoming_deadlines
    );
  };

  // FUNÇÕES AUXILIARES

  const getStatusColor = (status: AssessmentStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'not_started': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: AssessmentStatus) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'not_started': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <Activity className="h-4 w-4" />;
      case 'under_review': return <Eye className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <Archive className="h-4 w-4" />;
      case 'expired': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileCheck className="h-4 w-4" />;
    }
  };

  // Verificar se há erros ou loading
  if (isAssessmentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando assessments...</p>
        </div>
      </div>
    );
  }

  if (assessmentsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-2">Erro ao carregar assessments</div>
          <p className="text-sm text-gray-500">{assessmentsError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Gestão de Assessments</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gerencie assessments de conformidade, auditorias e avaliações de maturidade
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCardView(!isCardView)}
          >
            {isCardView ? <BarChart3 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
            {isCardView ? 'Visão Lista' : 'Visão Cards'}
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Assessment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAssessment ? 'Editar Assessment' : 'Novo Assessment'}
                </DialogTitle>
                <DialogDescription>
                  {editingAssessment 
                    ? 'Edite as informações do assessment existente'
                    : 'Crie um novo assessment de conformidade'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <AssessmentForm
                assessment={editingAssessment || undefined}
                frameworks={frameworks}
                profiles={profiles}
                onSubmit={editingAssessment ? 
                  (data) => handleUpdateAssessment(editingAssessment.id, data) : 
                  handleCreateAssessment
                }
                onCancel={() => setIsDialogOpen(false)}
                isSubmitting={isCreatingAssessment || isUpdatingAssessment}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_assessments}</div>
            <p className="text-xs text-muted-foreground">assessments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Iniciados</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{metrics.assessments_by_status.not_started || 0}</div>
            <p className="text-xs text-muted-foreground">pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{metrics.assessments_by_status.in_progress || 0}</div>
            <p className="text-xs text-muted-foreground">em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.assessments_by_status.completed || 0}</div>
            <p className="text-xs text-muted-foreground">finalizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Prazos</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.upcoming_deadlines}</div>
            <p className="text-xs text-muted-foreground">vencimentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{Math.round(metrics.compliance_score_average)}%</div>
            <p className="text-xs text-muted-foreground">média</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pesquisar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar assessments..."
                  value={filters.search_term || ''}
                  onChange={(e) => updateFilter('search_term', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select 
                value={filters.types?.[0] || 'all'} 
                onValueChange={(value) => updateFilter('types', value === 'all' ? [] : [value as AssessmentType])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {Object.entries(ASSESSMENT_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label.split(' - ')[0]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select 
                value={filters.statuses?.[0] || 'all'} 
                onValueChange={(value) => updateFilter('statuses', value === 'all' ? [] : [value as AssessmentStatus])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {Object.entries(ASSESSMENT_STATUSES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label.split(' - ')[0]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridade</label>
              <Select 
                value={filters.priorities?.[0] || 'all'} 
                onValueChange={(value) => updateFilter('priorities', value === 'all' ? [] : [value as AssessmentPriority])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as prioridades</SelectItem>
                  {Object.entries(ASSESSMENT_PRIORITIES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label.split(' - ')[0]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.show_upcoming_deadlines || false}
                onChange={(e) => updateFilter('show_upcoming_deadlines', e.target.checked)}
              />
              <span className="text-sm">Próximos prazos (30 dias)</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={!filters.show_overdue}
                onChange={(e) => updateFilter('show_overdue', !e.target.checked)}
              />
              <span className="text-sm">Ocultar atrasados</span>
            </label>
            
            {hasActiveFilters() && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <div className="space-y-4">
        {sortedAssessments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileCheck className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum assessment encontrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                {hasActiveFilters()
                  ? "Não há assessments que correspondam aos filtros selecionados."
                  : "Comece criando seu primeiro assessment."}
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Assessment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {isCardView ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={sortedAssessments.map(assessment => assessment.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  {sortedAssessments.map((assessment) => (
                    <SortableAssessmentCard
                      key={assessment.id}
                      assessment={assessment}
                      onUpdate={handleUpdateAssessment}
                      onDelete={handleDeleteAssessment}
                      onDuplicate={handleDuplicateAssessment}
                      isUpdating={isUpdatingAssessment}
                      isDeleting={isDeletingAssessment}
                      canEdit={true}
                      canDelete={true}
                      canApprove={true}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              <div className="space-y-4">
                {sortedAssessments.map((assessment) => (
                  <AssessmentCard
                    key={assessment.id}
                    assessment={assessment}
                    onUpdate={handleUpdateAssessment}
                    onDelete={handleDeleteAssessment}
                    onDuplicate={handleDuplicateAssessment}
                    isUpdating={isUpdatingAssessment}
                    isDeleting={isDeletingAssessment}
                    canEdit={true}
                    canDelete={true}
                    canApprove={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentManagementPage;