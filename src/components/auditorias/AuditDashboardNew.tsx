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
    setSearchTerm
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
          <h1 className="text-3xl font-bold">Auditoria Interna</h1>
          <p className="text-muted-foreground">Gestão Integrada de Projetos de Auditoria</p>
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

          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <Card className="col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Projetos</p>
                <p className="text-3xl font-bold">{metrics?.total_projetos || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Projetos de auditoria</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projetos Ativos</p>
                <p className="text-3xl font-bold text-blue-600">{metrics?.projetos_ativos || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Em andamento</p>
              </div>
              <PlayCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-3xl font-bold text-green-600">{Math.round(metrics?.taxa_conclusao || 0)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Projetos concluídos</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Apontamentos Críticos</p>
                <p className="text-3xl font-bold text-red-600">{metrics?.apontamentos_criticos || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Requer atenção</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
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
              size="md"
              responsive={true}
            />
          </CardContent>
        </Card>

        {/* Filtros e Busca */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Filtros e Pesquisa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por título, código ou área..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros Avançados
                      {(statusFilter !== 'all' || priorityFilter !== 'all') && (
                        <Badge variant="secondary" className="ml-2 h-5 px-1.5">
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
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
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
          <h2 className="text-xl font-semibold">Projetos de Auditoria</h2>
          <Badge variant="secondary">{totalItems} projetos encontrados</Badge>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum projeto encontrado</h3>
              <p className="text-muted-foreground">Tente ajustar seus filtros ou crie um novo projeto.</p>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Criar Projeto
              </Button>
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
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {((page - 1) * perPage) + 1} a {Math.min(page * perPage, totalItems)} de {totalItems} projetos
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = i + 1;
                // Simple logic to show current page surroundings if totalPages > 5
                // enhancing this would require a complex pagination component
                // For now, simple logic: if page > 3, shift window
                if (totalPages > 5 && page > 3) {
                  p = page - 3 + i;
                  if (p > totalPages) p = totalPages - (4 - i);
                }

                return (
                  <Button
                    key={p}
                    variant={page === p ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8"
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
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}