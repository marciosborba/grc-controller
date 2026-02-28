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
  RefreshCw,
  BarChart3,
  Target,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useIncidentManagement } from '@/hooks/useIncidentManagement';
import IncidentCard from './IncidentCard';
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

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Atualizar incidentes ordenados quando os incidentes mudarem
  useEffect(() => {
    const filtered = filterIncidents(filters);
    setSortedIncidents(filtered);
    setCurrentPage(1);
  }, [incidents, filters, filterIncidents]);

  // Lógica de Paginação
  const totalPages = Math.ceil(sortedIncidents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, sortedIncidents.length);
  const currentIncidents = sortedIncidents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
      <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mb-2 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Gestão de Incidentes</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Monitore, rastreie e resolva incidentes de segurança em tempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end sm:justify-start gap-2 sm:gap-3 w-full sm:w-auto mt-2 sm:mt-0">

          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 h-9 flex-1 sm:flex-none"
          >
            <Plus className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="whitespace-nowrap text-xs sm:text-sm">Novo Incidente</span>
          </Button>
        </div>
      </div>

      {/* Métricas Cards - Premium Storytelling */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Card 1: Panorama Geral */}
        <Card className="relative overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Shield className="h-24 w-24" />
          </div>
          <CardHeader className="pb-1 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-lg font-bold flex items-center gap-1 sm:gap-2 text-primary leading-tight">
              Panorama Geral
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-0 sm:gap-2 mb-1 sm:mb-2">
              <span className="text-xl sm:text-3xl font-bold text-foreground">{metrics.total_incidents}</span>
              <span className="text-[10px] sm:text-sm text-muted-foreground leading-tight">incidentes totais</span>
            </div>
            <p className="text-muted-foreground font-medium text-[10px] sm:text-sm leading-tight sm:leading-relaxed mb-2 sm:mb-4">
              <span className="text-blue-600 font-bold flex items-center gap-1">
                <Activity className="h-3 w-3" /> +{metrics.incidents_trend_7_days}
              </span>
              <span className="block mt-0.5 sm:mt-1">novos (7 dias)</span>
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
          <CardContent className="p-3 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="p-1.5 sm:p-3 bg-red-100 dark:bg-red-900/30 rounded-lg sm:rounded-2xl shrink-0">
              <AlertTriangle className="h-4 w-4 sm:h-8 sm:w-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-[10px] sm:text-sm font-medium text-muted-foreground leading-tight sm:leading-normal">Críticos & Abertos</p>
              <h3 className="text-xl sm:text-3xl font-bold text-red-600 dark:text-red-500">
                {metrics.incidents_by_severity.critical || 0}
              </h3>
              <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 font-medium leading-tight sm:leading-normal">
                {metrics.incidents_by_status.open || 0} na triagem
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Status Operacional */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity className="h-24 w-24 text-orange-500" />
          </div>
          <CardContent className="p-3 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="p-1.5 sm:p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg sm:rounded-2xl shrink-0">
              <Activity className="h-4 w-4 sm:h-8 sm:w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-[10px] sm:text-sm font-medium text-muted-foreground leading-tight sm:leading-normal">Em Investigação</p>
              <h3 className="text-xl sm:text-3xl font-bold text-foreground">
                {metrics.incidents_by_status.investigating || 0}
              </h3>
              <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 flex items-center leading-tight sm:leading-normal">
                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                Média: {Math.round(metrics.average_resolution_time || 0)}h
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Eficiência de Resolução */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <CheckCircle className="h-24 w-24 text-green-500" />
          </div>
          <CardHeader className="pb-1 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-lg font-bold text-foreground leading-tight">
              Eficiência
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-0 sm:gap-2">
              <span className="text-xl sm:text-3xl font-bold text-green-600">
                {Math.round((metrics.incidents_by_status.resolved || 0) / (metrics.total_incidents || 1) * 100)}%
              </span>
              <span className="text-[10px] sm:text-sm text-muted-foreground leading-tight">resolvidos</span>
            </div>
            <p className="text-[9px] sm:text-sm text-muted-foreground mt-1 sm:mt-2 leading-tight">
              <span className="font-medium text-foreground">{metrics.incidents_by_status.resolved || 0}</span> mitigados
            </p>
            <div className="mt-4 w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-green-500" style={{ width: `${Math.round((metrics.incidents_by_status.resolved || 0) / (metrics.total_incidents || 1) * 100)}%` }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card className="border-none shadow-sm bg-gray-50/50 dark:bg-gray-900/20">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar por título, descrição ou ID..."
                value={filters.search_term || ''}
                onChange={(e) => updateFilter('search_term', e.target.value)}
                className="pl-9 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-sm h-10"
              />
            </div>

            <div className="flex flex-wrap flex-row gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 items-center">
              <Select
                value={filters.statuses?.[0] || undefined}
                onValueChange={(value) => updateFilter('statuses', value ? [value as IncidentStatus] : [])}
              >
                <SelectTrigger className="w-[140px] sm:w-[160px] bg-white dark:bg-gray-950 h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  {Object.entries(INCIDENT_STATUSES).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-xs sm:text-sm">
                      {label.split(' - ')[0]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.severities?.[0] || undefined}
                onValueChange={(value) => updateFilter('severities', value ? [value as IncidentSeverity] : [])}
              >
                <SelectTrigger className="w-[140px] sm:w-[160px] bg-white dark:bg-gray-950 h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Severidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Severidades</SelectItem>
                  {Object.entries(INCIDENT_SEVERITIES).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-xs sm:text-sm">
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
                  className="text-muted-foreground hover:text-foreground h-10 w-10 shrink-0"
                >
                  <Archive className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid Rendering */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentIncidents.length === 0 ? (
          <div className="col-span-full h-24 flex items-center justify-center bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 text-muted-foreground w-full">
            Nenhum incidente encontrado.
          </div>
        ) : (
          currentIncidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onUpdate={(id, updates) => updateIncident({ id, updates })}
              onDelete={handleDeleteIncident}
              onDuplicate={handleDuplicateIncident}
            />
          ))
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-center gap-4 mt-8 pb-4">
          <span className="text-sm text-gray-400">
            Mostrando {startIndex + 1}–{endIndex} de {sortedIncidents.length} planos
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-10 w-10 bg-[#1A1D24] hover:bg-[#252A36] border-transparent text-gray-300 rounded-lg disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(page)}
                className={`h-10 w-10 border-transparent rounded-lg text-base font-medium transition-colors ${currentPage === page
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-[#1A1D24] text-gray-300 hover:bg-[#252A36]'
                  }`}
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-10 w-10 bg-[#1A1D24] hover:bg-[#252A36] border-transparent text-gray-300 rounded-lg disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

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