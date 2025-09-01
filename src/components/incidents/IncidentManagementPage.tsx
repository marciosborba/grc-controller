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
  AlertCircle, 
  Plus, 
  Search, 
  Filter,
  Download,
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle,
  Shield,
  Users,
  TrendingUp,
  Calendar as CalendarIcon,
  BarChart3,
  Activity,
  Eye,
  Archive,
  Target,
  FileCheck,
  Gauge
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { useIncidentManagement } from '@/hooks/useIncidentManagement';
import IncidentCard from './IncidentCard';
import SortableIncidentCard from './SortableIncidentCard';
import IncidentForm from './IncidentForm';
import type { 
  Incident, 
  IncidentFilters, 
  IncidentStatus, 
  IncidentSeverity,
  IncidentPriority,
  IncidentType,
  IncidentCategory 
} from '@/types/incident-management';
import { 
  INCIDENT_STATUSES, 
  INCIDENT_SEVERITIES, 
  INCIDENT_PRIORITIES,
  INCIDENT_TYPES,
  INCIDENT_CATEGORIES 
} from '@/types/incident-management';

const IncidentManagementPage = () => {
  const { user } = useAuth();
  const {
    incidents,
    profiles,
    createIncident,
    updateIncident,
    deleteIncident,
    duplicateIncident,
    getMetrics,
    filterIncidents,
    isCreatingIncident,
    isUpdatingIncident,
    isDeletingIncident,
    isIncidentsLoading,
    incidentsError
  } = useIncidentManagement();

  // Estados principais
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [sortedIncidents, setSortedIncidents] = useState<Incident[]>([]);
  const [isCardView, setIsCardView] = useState(true);

  // Estados de filtro
  const [filters, setFilters] = useState<IncidentFilters>({
    search_term: '',
    statuses: [],
    severities: [],
    priorities: [],
    types: [],
    categories: [],
    show_resolved: true,
    show_critical_only: false,
    show_overdue: false
  });

  // Atualizar incidentes ordenados quando os incidentes mudarem
  useEffect(() => {
    const filtered = filterIncidents(filters);
    setSortedIncidents(filtered);
  }, [incidents, filters, filterIncidents]);

  // Configuração do drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const metrics = getMetrics();

  // FUNÇÕES DE MANIPULAÇÃO

  const handleCreateIncident = async (data: any) => {
    try {
      await createIncident({
        ...data,
        reported_by: user?.id
      });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao criar incidente:', error);
    }
  };

  const handleUpdateIncident = async (incidentId: string, updates: any) => {
    try {
      await updateIncident({ 
        id: incidentId, 
        updates: {
          ...updates,
          updated_by: user?.id
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar incidente:', error);
    }
  };

  const handleDeleteIncident = async (incidentId: string) => {
    try {
      await deleteIncident(incidentId);
    } catch (error) {
      console.error('Erro ao excluir incidente:', error);
    }
  };

  const handleDuplicateIncident = async (incidentId: string) => {
    try {
      await duplicateIncident(incidentId);
    } catch (error) {
      console.error('Erro ao duplicar incidente:', error);
    }
  };

  const handleEdit = (incident: Incident) => {
    setEditingIncident(incident);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingIncident(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSortedIncidents((incidents) => {
        const oldIndex = incidents.findIndex((incident) => incident.id === active.id);
        const newIndex = incidents.findIndex((incident) => incident.id === over.id);

        return arrayMove(incidents, oldIndex, newIndex);
      });
    }
  };

  // FUNÇÕES DE FILTRO

  const updateFilter = (key: keyof IncidentFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search_term: '',
      statuses: [],
      severities: [],
      priorities: [],
      types: [],
      categories: [],
      show_resolved: true,
      show_critical_only: false,
      show_overdue: false
    });
  };

  const hasActiveFilters = () => {
    return !!(
      filters.search_term ||
      (filters.statuses && filters.statuses.length > 0) ||
      (filters.severities && filters.severities.length > 0) ||
      (filters.priorities && filters.priorities.length > 0) ||
      (filters.types && filters.types.length > 0) ||
      (filters.categories && filters.categories.length > 0) ||
      !filters.show_resolved ||
      filters.show_critical_only ||
      filters.show_overdue
    );
  };

  // FUNÇÕES AUXILIARES

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'contained': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-gray-100 text-gray-600';
      case 'escalated': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: IncidentStatus) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'investigating': return <Activity className="h-4 w-4" />;
      case 'contained': return <Shield className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <Archive className="h-4 w-4" />;
      case 'cancelled': return <Archive className="h-4 w-4" />;
      case 'escalated': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Verificar se há erros ou loading
  if (isIncidentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando incidentes...</p>
        </div>
      </div>
    );
  }

  if (incidentsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-2">Erro ao carregar incidentes</div>
          <p className="text-sm text-gray-500">{incidentsError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Gestão de Incidentes</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gerencie incidentes de segurança, resposta a incidentes e análise de causa raiz
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCardView(!isCardView)}
          >
            {isCardView ? <BarChart3 className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
            {isCardView ? 'Visão Lista' : 'Visão Cards'}
          </Button>
          
          <button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
            style={{
              backgroundColor: 'hsl(198 87% 50%)', // Azul primary-text
              color: 'white',
              border: '1px solid hsl(198 87% 50%)',
              padding: '8px 16px',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <Plus className="w-4 h-4" />
            Novo Incidente
          </button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingIncident ? 'Editar Incidente' : 'Novo Incidente'}
                </DialogTitle>
                <DialogDescription>
                  {editingIncident 
                    ? 'Edite as informações do incidente existente'
                    : 'Crie um novo incidente de segurança'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <IncidentForm
                incident={editingIncident || undefined}
                profiles={profiles}
                onSubmit={editingIncident ? 
                  (data) => handleUpdateIncident(editingIncident.id, data) : 
                  handleCreateIncident
                }
                onCancel={() => setIsDialogOpen(false)}
                isSubmitting={isCreatingIncident || isUpdatingIncident}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-blue-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Total</p>
                <p className="text-lg font-bold">{metrics.total_incidents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Abertos</p>
                <p className="text-lg font-bold">{metrics.incidents_by_status.open || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <Activity className="h-6 w-6 text-orange-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Investigando</p>
                <p className="text-lg font-bold">{metrics.incidents_by_status.investigating || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Resolvidos</p>
                <p className="text-lg font-bold">{metrics.incidents_by_status.resolved || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Críticos</p>
                <p className="text-lg font-bold">{metrics.incidents_by_severity.critical || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-purple-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Tempo Médio</p>
                <p className="text-lg font-bold">{Math.round(metrics.average_resolution_time || 0)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Filtros</h3>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar incidentes..."
                  value={filters.search_term || ''}
                  onChange={(e) => updateFilter('search_term', e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select 
                value={filters.types?.[0] || undefined} 
                onValueChange={(value) => updateFilter('types', value ? [value as IncidentType] : [])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os Tipos" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INCIDENT_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label.split(' - ')[0]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={filters.statuses?.[0] || undefined} 
                onValueChange={(value) => updateFilter('statuses', value ? [value as IncidentStatus] : [])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os Status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INCIDENT_STATUSES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label.split(' - ')[0]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={filters.severities?.[0] || undefined} 
                onValueChange={(value) => updateFilter('severities', value ? [value as IncidentSeverity] : [])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as Severidades" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INCIDENT_SEVERITIES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label.split(' - ')[0]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.show_critical_only || false}
                  onChange={(e) => updateFilter('show_critical_only', e.target.checked)}
                />
                <span className="text-sm">Apenas críticos</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.show_overdue || false}
                  onChange={(e) => updateFilter('show_overdue', e.target.checked)}
                />
                <span className="text-sm">Mostrar atrasados</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={!filters.show_resolved}
                  onChange={(e) => updateFilter('show_resolved', !e.target.checked)}
                />
                <span className="text-sm">Ocultar resolvidos</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Incidentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Incidentes ({sortedIncidents.length})
              {hasActiveFilters() && (
                <Badge variant="secondary" className="ml-2">
                  Filtrado
                </Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {sortedIncidents.length > 0 ? (
            <div className="space-y-4">
              {isCardView ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={sortedIncidents.map(incident => incident.id)} 
                    strategy={verticalListSortingStrategy}
                  >
                    {sortedIncidents.map((incident) => (
                      <SortableIncidentCard
                        key={incident.id}
                        incident={incident}
                        onUpdate={handleUpdateIncident}
                        onDelete={handleDeleteIncident}
                        onDuplicate={handleDuplicateIncident}
                        isUpdating={isUpdatingIncident}
                        isDeleting={isDeletingIncident}
                        canEdit={true}
                        canDelete={true}
                        canApprove={true}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="space-y-4">
                  {sortedIncidents.map((incident) => (
                    <IncidentCard
                      key={incident.id}
                      incident={incident}
                      onUpdate={handleUpdateIncident}
                      onDelete={handleDeleteIncident}
                      onDuplicate={handleDuplicateIncident}
                      isUpdating={isUpdatingIncident}
                      isDeleting={isDeletingIncident}
                      canEdit={true}
                      canDelete={true}
                      canApprove={true}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                {hasActiveFilters() 
                  ? 'Nenhum incidente encontrado' 
                  : 'Nenhum incidente cadastrado'
                }
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {hasActiveFilters() 
                  ? 'Tente ajustar os filtros para encontrar incidentes.' 
                  : 'Comece criando seu primeiro incidente de segurança.'
                }
              </p>
              {!hasActiveFilters() && (
                <div className="mt-6">
                  <button
                    onClick={() => setIsDialogOpen(true)}
                    style={{
                      backgroundColor: 'hsl(198 87% 50%)', // Azul primary-text
                      color: 'white',
                      border: '1px solid hsl(198 87% 50%)',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Novo Incidente
                  </button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IncidentManagementPage;