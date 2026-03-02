import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Plus,
  Filter,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Users,
  Calendar,
  ChevronRight,
  ChevronLeft,
  PlayCircle,
  PauseCircle,
  Settings,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { RiskLevelDisplay } from '@/components/ui/risk-level-display';
import { AuditProjectCard } from './AuditProjectCard';
import { NewAuditProjectDialog } from './NewAuditProjectDialog';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { secureLog } from '@/utils/securityLogger';
import { useAuditIntegration } from '@/hooks/useAuditIntegration';

interface AuditProject {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  status: 'planejamento' | 'execucao' | 'achados' | 'relatorio' | 'followup' | 'concluido' | 'suspenso';
  fase_atual: string;
  progresso_geral: number;
  auditor_lider: string;
  data_inicio: string;
  data_fim_prevista: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  area_auditada: string;
  tipo_auditoria: string;

  // Métricas calculadas
  total_trabalhos: number;
  trabalhos_concluidos: number;
  total_apontamentos: number;
  apontamentos_criticos: number;
  planos_acao: number;

  // Completude por fase
  completude_planejamento: number;
  completude_execucao: number;
  completude_achados: number;
  completude_relatorio: number;
  completude_followup: number;
}

interface DashboardMetrics {
  total_projetos: number;
  projetos_ativos: number;
  projetos_concluidos: number;
  projetos_atrasados: number;
  total_apontamentos: number;
  apontamentos_criticos: number;
  taxa_conclusao: number;
  cobertura_auditoria: number;
}

export function AuditDashboardNew() {
  const { user } = useAuth();

  const {
    projects,
    loading,
    metrics,
    page,
    setPage,
    perPage,
    totalItems,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    searchTerm,
    setSearchTerm,
    refresh // Get the refresh function to reload the list after creation
  } = useAuditIntegration();

  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const totalPages = Math.ceil(totalItems / perPage);

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Auditoria Interna</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Gestão Integrada de Projetos de Auditoria</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {/* Ordenação */}
          <div className="flex items-center gap-2">
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [newSortBy, newSortOrder] = value.split('-');
                setSortBy(newSortBy);
                setSortOrder(newSortOrder as 'asc' | 'desc');
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">Mais Recentes</SelectItem>
                <SelectItem value="created_at-asc">Mais Antigos</SelectItem>
                <SelectItem value="titulo-asc">Título (A-Z)</SelectItem>
                <SelectItem value="titulo-desc">Título (Z-A)</SelectItem>
                <SelectItem value="prioridade-desc">Maior Prioridade</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <NewAuditProjectDialog onProjectCreated={refresh} />
        </div>
      </div>

      {/* Métricas Principais */}
      {/* Premium Storytelling Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">

        {/* Card 1: Dynamic Narrative Card - Execution Status */}
        <Card className="relative overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all">
          <div className={`absolute top-0 right-0 p-3 opacity-10`}>
            {(metrics?.apontamentos_criticos || 0) > 0 ? <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 md:h-24 md:w-24" /> :
              (metrics?.projetos_atrasados || 0) > 0 ? <Clock className="h-12 w-12 sm:h-16 sm:w-16 md:h-24 md:w-24" /> : <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 md:h-24 md:w-24" />}
          </div>
          <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
            <CardTitle className={`text-xs sm:text-sm md:text-lg font-bold flex items-center gap-1.5 sm:gap-2 leading-tight ${(metrics?.apontamentos_criticos || 0) > 0 ? 'text-red-500' : (metrics?.projetos_atrasados || 0) > 0 ? 'text-orange-500' : 'text-emerald-500'}`}>
              <span className="truncate">{(metrics?.apontamentos_criticos || 0) > 0 ? 'Pontos Críticos' :
                (metrics?.projetos_atrasados || 0) > 0 ? 'Atrasos no Plano' : 'Execução Normal'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4 md:px-6 md:pb-6">
            <p className="text-muted-foreground font-medium text-[9px] sm:text-xs md:text-sm leading-tight sm:leading-relaxed line-clamp-3 md:line-clamp-none">
              {(metrics?.apontamentos_criticos || 0) > 0
                ? `${metrics?.apontamentos_criticos} pontos críticos.`
                : (metrics?.projetos_atrasados || 0) > 0
                  ? 'Existem atrasos no plano.'
                  : 'Projetos no cronograma.'}
            </p>
            <div className={`mt-2 sm:mt-4 inline-flex items-center px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] md:text-xs font-medium ${(metrics?.apontamentos_criticos || 0) > 0 ? 'bg-red-500/10 text-red-500' : (metrics?.projetos_atrasados || 0) > 0 ? 'bg-orange-500/10 text-orange-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
              {(metrics?.apontamentos_criticos || 0) > 0 ? 'Ação Requerida' : (metrics?.projetos_atrasados || 0) > 0 ? 'Atenção ao Prazo' : 'Em Conformidade'}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Total Projects (Reliable Data) */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <Target className="h-12 w-12 sm:h-16 sm:w-16 md:h-24 md:w-24 text-blue-500" />
          </div>
          <CardContent className="p-3 sm:p-4 md:p-6 flex items-center gap-2 sm:gap-3 md:gap-4 relative z-10">
            <div className="p-1.5 sm:p-2 md:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg sm:rounded-xl md:rounded-2xl shrink-0">
              <Target className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] sm:text-[10px] md:text-sm font-medium text-muted-foreground uppercase sm:normal-case tracking-wider sm:tracking-normal w-full truncate leading-none mb-0.5 md:mb-1">Total de Projetos</p>
              <h3 className="text-lg sm:text-xl md:text-3xl font-bold text-foreground leading-none">{metrics?.total_projetos || 0}</h3>
              <p className="text-[7px] sm:text-[9px] md:text-xs text-muted-foreground mt-0.5 lg:mt-1 truncate">
                {metrics?.projetos_concluidos || 0} concluídos
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Active Execution */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <PlayCircle className="h-12 w-12 sm:h-16 sm:w-16 md:h-24 md:w-24 text-purple-500" />
          </div>
          <CardContent className="p-3 sm:p-4 md:p-6 flex items-center gap-2 sm:gap-3 md:gap-4 relative z-10">
            <div className="p-1.5 sm:p-2 md:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg sm:rounded-xl md:rounded-2xl shrink-0">
              <PlayCircle className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] sm:text-[10px] md:text-sm font-medium text-muted-foreground uppercase sm:normal-case tracking-wider sm:tracking-normal w-full truncate leading-none mb-0.5 md:mb-1">Em Execução</p>
              <h3 className="text-lg sm:text-xl md:text-3xl font-bold text-foreground leading-none">{metrics?.projetos_ativos || 0}</h3>
              <p className="text-[7px] sm:text-[9px] md:text-xs text-muted-foreground mt-0.5 lg:mt-1 truncate">
                Atividades ativas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Compliance Rate */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 md:h-24 md:w-24 text-green-500" />
          </div>
          <CardHeader className="pb-0.5 sm:pb-1 md:pb-2 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6 relative z-10">
            <CardTitle className="text-xs sm:text-sm md:text-lg font-bold text-foreground leading-tight truncate">
              Taxa de Conclusão
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4 md:px-6 md:pb-6 relative z-10">
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-xl md:text-3xl font-bold text-green-600 leading-none">{Math.round(metrics?.taxa_conclusao || 0)}%</span>
              <span className="text-[8px] sm:text-[10px] md:text-sm text-muted-foreground truncate">geral</span>
            </div>
            <p className="text-[8px] sm:text-[9px] md:text-sm text-muted-foreground mt-0.5 sm:mt-1 md:mt-2 truncate">
              Avanço médio dos projetos.
            </p>
            <div className="mt-2 sm:mt-3 md:mt-4 w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full rounded-full" style={{ width: `${Math.round(metrics?.taxa_conclusao || 0)}%` }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap de Riscos */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Heatmap de Riscos
            </CardTitle>
            <CardDescription>
              Distribuição de riscos dos <strong>projetos visíveis</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RiskLevelDisplay
              risks={projects.map(p => ({
                risk_level: p.prioridade === 'critica' ? 'Muito Alto' :
                  p.prioridade === 'alta' ? 'Alto' :
                    p.prioridade === 'media' ? 'Médio' : 'Baixo'
              }))}
              size="sm"
              responsive={false}
              className="overflow-x-auto pb-2"
            />
          </CardContent>
        </Card>

        {/* Filtros e Busca */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Filtros e Pesquisa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar projeto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-8 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2 flex-wrap pb-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      <Filter className="h-3.5 w-3.5 mr-1.5" />
                      Filtros
                      {(statusFilter !== 'all' || priorityFilter !== 'all') && (
                        <Badge variant="secondary" className="ml-1.5 h-4 px-1 py-0 text-[9px]">
                          {(statusFilter !== 'all' ? 1 : 0) + (priorityFilter !== 'all' ? 1 : 0)}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4">
                    <div className="space-y-4">

                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Toos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="planejamento">Planejamento</SelectItem>
                            <SelectItem value="execucao">Execução</SelectItem>
                            <SelectItem value="achados">Achados</SelectItem>
                            <SelectItem value="relatorio">Relatório</SelectItem>
                            <SelectItem value="concluido">Concluído</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Prioridade</Label>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            <SelectItem value="critica">Crítica</SelectItem>
                            <SelectItem value="alta">Alta</SelectItem>
                            <SelectItem value="media">Média</SelectItem>
                            <SelectItem value="baixa">Baixa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setStatusFilter('all');
                          setPriorityFilter('all');
                        }}
                      >
                        Limpar Filtros
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 text-xs px-2.5"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 text-xs px-2.5"
                  onClick={() => setViewMode('list')}
                >
                  Lista
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Projetos */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base sm:text-lg font-semibold">Projetos de Auditoria</h2>
          <Badge variant="secondary" className="text-xs">{totalItems} projetos</Badge>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum projeto encontrado</h3>
              <p className="text-muted-foreground">Tente ajustar seus filtros ou crie um novo projeto.</p>
              <NewAuditProjectDialog
                onProjectCreated={refresh}
                trigger={
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Projeto
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-6' : 'space-y-4'}>
            {projects.map((project) => (
              <AuditProjectCard
                key={project.id}
                project={project}
                isExpanded={selectedProject === project.id}
                onToggleExpand={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Paginação */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border pt-3 gap-2">
          <p className="text-xs text-muted-foreground">
            Mostrando {((page - 1) * perPage) + 1}–{Math.min(page * perPage, totalItems)} de {totalItems} projetos
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-7 px-2 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-0.5" />
              Anterior
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = i + 1;
                if (totalPages > 5 && page > 3) {
                  p = page - 3 + i;
                  if (p > totalPages) p = totalPages - (4 - i);
                }
                return (
                  <Button
                    key={p}
                    variant={page === p ? "default" : "outline"}
                    size="icon"
                    className="h-7 w-7 text-xs"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-7 px-2 text-xs"
            >
              Próxima
              <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}