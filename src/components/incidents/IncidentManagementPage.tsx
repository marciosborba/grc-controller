import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  AlertCircle,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  Shield,
  Activity,
  Archive,
  LayoutList,
  LayoutGrid,
  RefreshCw,
  BarChart3,
  Target,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useIncidentManagement } from '@/hooks/useIncidentManagement';
import IncidentDataTable from './IncidentDataTable';
import IncidentManagementModalSeverityFixed from './IncidentManagementModalSeverityFixed';
import type {
  Incident,
  IncidentFilters,
  IncidentStatus,
  IncidentSeverity,
  IncidentType
} from '@/types/incident-management';
import {
  INCIDENT_STATUSES,
  INCIDENT_SEVERITIES,
  INCIDENT_TYPES
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
    isIncidentsLoading,
    incidentsError,
    refetchIncidents
  } = useIncidentManagement();

  // Estados principais
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [sortedIncidents, setSortedIncidents] = useState<Incident[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

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
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao atualizar incidente:', error);
    }
  };

  const handleDeleteIncident = async (incidentId: string) => {
    if (confirm('Tem certeza que deseja excluir este incidente?')) {
      try {
        await deleteIncident(incidentId);
      } catch (error) {
        console.error('Erro ao excluir incidente:', error);
      }
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

  // Verificar se há erros ou loading
  if (isIncidentsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground font-medium">Carregando incidentes...</p>
        </div>
      </div>
    );
  }

  if (incidentsError) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center max-w-md mx-auto p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Erro ao carregar incidentes</h3>
          <p className="text-sm text-red-600 dark:text-red-300 mb-4">{incidentsError.message}</p>
          <Button variant="outline" onClick={() => refetchIncidents()} className="border-red-200 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/50">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Gestão de Incidentes</h1>
          <p className="text-muted-foreground mt-1">
            Monitore, rastreie e resolva incidentes de segurança em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => refetchIncidents()} title="Atualizar">
            <RefreshCw className="h-4 w-4" />
          </Button>

          <div className="bg-muted/50 p-1 rounded-lg border border-border flex items-center">
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-8 px-2"
            >
              <LayoutList className="h-4 w-4 mr-2" />
              Lista
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 px-2"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Cards
            </Button>
          </div>

          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Incidente
          </Button>
        </div>
      </div>

      {/* Métricas Cards */}
      {/* Métricas Cards - Premium Storytelling */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Panorama Geral */}
        <Card className="relative overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Shield className="h-24 w-24" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
              Panorama Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-foreground">{metrics.total_incidents}</span>
              <span className="text-sm text-muted-foreground">incidentes totais</span>
            </div>
            <p className="text-muted-foreground font-medium text-sm leading-relaxed mb-4">
              <span className="text-blue-600 font-bold flex items-center gap-1">
                <Activity className="h-3 w-3" /> +{metrics.incidents_trend_7_days}
              </span>
              novos incidentes nos últimos 7 dias.
            </p>
            <Progress value={75} className="h-2 opacity-50" />
            {/* Progress placeholder since we don't have a specific percentage metric for total */}
          </CardContent>
        </Card>

        {/* Card 2: Atenção Crítica */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group border-l-4 border-l-red-500/50">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertTriangle className="h-24 w-24 text-red-500" />
          </div>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Críticos & Abertos</p>
              <h3 className="text-3xl font-bold text-red-600 dark:text-red-500">
                {metrics.incidents_by_severity.critical || 0}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                {metrics.incidents_by_status.open || 0} aguardando triagem
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Status Operacional */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity className="h-24 w-24 text-orange-500" />
          </div>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl">
              <Activity className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Em Investigação</p>
              <h3 className="text-3xl font-bold text-foreground">
                {metrics.incidents_by_status.investigating || 0}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Tempo médio: {Math.round(metrics.average_resolution_time || 0)}h
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Eficiência de Resolução */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <CheckCircle className="h-24 w-24 text-green-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-foreground">
              Eficiência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-green-600">
                {Math.round((metrics.incidents_by_status.resolved || 0) / (metrics.total_incidents || 1) * 100)}%
              </span>
              <span className="text-sm text-muted-foreground">resolvidos</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Total de <span className="font-medium text-foreground">{metrics.incidents_by_status.resolved || 0}</span> incidentes mitigados.
            </p>
            <div className="mt-4 w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-green-500" style={{ width: `${Math.round((metrics.incidents_by_status.resolved || 0) / (metrics.total_incidents || 1) * 100)}%` }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card className="border-none shadow-sm bg-gray-50/50 dark:bg-gray-900/20">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar por título, descrição ou ID..."
                value={filters.search_term || ''}
                onChange={(e) => updateFilter('search_term', e.target.value)}
                className="pl-10 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <Select
                value={filters.statuses?.[0] || undefined}
                onValueChange={(value) => updateFilter('statuses', value ? [value as IncidentStatus] : [])}
              >
                <SelectTrigger className="w-[160px] bg-white dark:bg-gray-950">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
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
                <SelectTrigger className="w-[160px] bg-white dark:bg-gray-950">
                  <SelectValue placeholder="Severidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Severidades</SelectItem>
                  {Object.entries(INCIDENT_SEVERITIES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label.split(' - ')[0]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters() && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearFilters}
                  title="Limpar filtros"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Archive className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Dados */}
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm">
        <IncidentDataTable
          data={sortedIncidents}
          onEdit={handleEdit}
          onDelete={handleDeleteIncident}
          onDuplicate={handleDuplicateIncident}
          onView={handleEdit} // Por enquanto abre o modal de edição
        />
      </div>

      {/* Modal com Debug de Severity */}
      <IncidentManagementModalSeverityFixed
        incident={editingIncident}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={() => {
          refetchIncidents();
          resetForm();
        }}
      />
    </div>
  );
};

export default IncidentManagementPage;