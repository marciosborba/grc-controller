import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  Plus,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Shield,
  Clipboard,
  Eye,
  Search,
  Filter,
  BarChart3,
  Settings,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { SimpleEnhancedActionPlanCard } from './SimpleEnhancedActionPlanCard';
import { useActionPlansIntegration } from '@/hooks/useActionPlansIntegration';

export const ActionPlansDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Debug log to verify component mount
  React.useEffect(() => {
    console.log('🏁 ActionPlansDashboardStep1 Mounted');
  }, []);

  const {
    actionPlans,
    loading,
    getActionPlanMetrics,
    getActionPlansByModule,
    getOverduePlans,
    updateActionPlan,
    page,
    setPage,
    perPage,
    totalPages,
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
    metrics
  } = useActionPlansIntegration();

  // metrics are now loaded from the hook (server-side)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'em_execucao': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'planejado': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'vencido': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'critica': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'alta': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'baixa': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getModuleIcon = (modulo: string) => {
    switch (modulo) {
      case 'risk_management': return <Shield className="h-4 w-4" />;
      case 'compliance': return <FileText className="h-4 w-4" />;
      case 'assessments': return <Clipboard className="h-4 w-4" />;
      case 'privacy': return <Eye className="h-4 w-4" />;
      case 'tprm': return <Target className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Activity className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando planos de ação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex justify-between items-start w-full sm:w-auto gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestão de Planos de Ação</h1>
            <p className="text-sm text-muted-foreground mt-1">Central de Gestão e Acompanhamento de Planos de Ação</p>
          </div>
          <Button size="icon" className="shrink-0 sm:hidden mt-0" onClick={() => navigate('/action-plans/new')}>
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <div className="w-full sm:w-auto space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2">
          <div className="relative w-full sm:w-[250px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar planos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>

          <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={`flex-1 sm:flex-none justify-center ${statusFilter !== 'all' || priorityFilter !== 'all' ? "bg-muted border-primary" : ""}`}>
                  <Filter className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Filtros Avançados</span>
                  <span className="inline sm:hidden ml-2">Filtros</span>
                  {(statusFilter !== 'all' || priorityFilter !== 'all') && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5 rounded-full text-[10px]">
                      {(statusFilter !== 'all' ? 1 : 0) + (priorityFilter !== 'all' ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Filtros</h4>
                    <p className="text-sm text-muted-foreground">
                      Refine sua busca por status e prioridade.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="status">Status</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger id="status" className="col-span-2 h-8">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="planejado">Planejado</SelectItem>
                          <SelectItem value="em_execucao">Em Execução</SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
                          <SelectItem value="atrasado">Atrasado</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="priority">Prioridade</Label>
                      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger id="priority" className="col-span-2 h-8">
                          <SelectValue placeholder="Selecione" />
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
                  </div>
                  {(statusFilter !== 'all' || priorityFilter !== 'all') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStatusFilter('all');
                        setPriorityFilter('all');
                      }}
                      className="w-full mt-2"
                    >
                      Limpar Filtros
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex-1 sm:flex-none flex items-center bg-muted/30 p-1 rounded-md">
              <span className="text-xs text-muted-foreground pl-2 hidden lg:inline-block border-r pr-2 mr-2">Ordernar por</span>
              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={(value) => {
                  const [newSortBy, newSortOrder] = value.split('-');
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder as 'asc' | 'desc');
                }}
              >
                <SelectTrigger className="w-full sm:w-[150px] lg:w-[180px] h-9 bg-background shadow-sm">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-desc">Mais Recentes</SelectItem>
                  <SelectItem value="created_at-asc">Mais Antigos</SelectItem>
                  <SelectItem value="title-asc">Título (A-Z)</SelectItem>
                  <SelectItem value="title-desc">Título (Z-A)</SelectItem>
                  <SelectItem value="origin_name-asc">Origem (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="hidden sm:flex w-full sm:w-auto mt-2 sm:mt-0" onClick={() => navigate('/action-plans/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano
            </Button>
          </div>
        </div>
      </div>

      {/* Métricas Principais - Premium Storytelling */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Card 1: Panorama Geral */}
        <Card className="relative overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-2 sm:p-3 opacity-10">
            <Target className="h-16 w-16 sm:h-24 sm:w-24" />
          </div>
          <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-sm sm:text-lg font-bold flex items-center gap-2 text-primary">
              Panorama Geral
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="flex items-baseline gap-1 sm:gap-2 mb-1 sm:mb-2">
              <span className="text-2xl sm:text-3xl font-bold text-foreground">{metrics.total}</span>
              <span className="text-xs sm:text-sm text-muted-foreground leading-tight">planos totais</span>
            </div>
            <p className="text-muted-foreground font-medium text-xs sm:text-sm leading-tight sm:leading-relaxed mb-3 sm:mb-4">
              Taxa de conclusão atual de <span className="text-green-600 font-bold">{metrics.completionRate}%</span>.
            </p>
            <Progress value={metrics.completionRate} className="h-2" />
          </CardContent>
        </Card>

        {/* Card 2: Status Operacional */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 p-2 sm:p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity className="h-16 w-16 sm:h-24 sm:w-24 text-blue-500" />
          </div>
          <CardContent className="p-3 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl sm:rounded-2xl shrink-0">
              <Activity className="h-5 w-5 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Em Execução</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                {metrics.inProgress}
              </h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 leading-tight">
                + {metrics.completed} concluídos
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Atenção Necessária */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group border-l-4 border-l-red-500/50">
          <div className="absolute top-0 right-0 p-2 sm:p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertTriangle className="h-16 w-16 sm:h-24 sm:w-24 text-red-500" />
          </div>
          <CardContent className="p-3 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 bg-red-100 dark:bg-red-900/30 rounded-xl sm:rounded-2xl shrink-0">
              <AlertTriangle className="h-5 w-5 sm:h-8 sm:w-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Atrasados</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-500">
                {metrics.overdue}
              </h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 leading-tight">
                + {metrics.critical} de prioridade crítica
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Performance */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 p-2 sm:p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <BarChart3 className="h-16 w-16 sm:h-24 sm:w-24 text-purple-500" />
          </div>
          <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-sm sm:text-lg font-bold text-foreground">
              Progresso Médio
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="flex items-baseline gap-1 sm:gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-blue-600">
                {metrics.avgProgress}%
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground">global</span>
            </div>
            <p className="text-[10px] sm:text-sm text-muted-foreground mt-1 sm:mt-2 leading-tight">
              {metrics.nearDeadline > 0 ? `${metrics.nearDeadline} planos próximos do prazo.` : 'Prazos sob controle.'}
            </p>
            <div className="mt-4 w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-blue-500" style={{ width: `${metrics.avgProgress}%` }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Módulos de Origem */}
      {/* Módulos de Origem */}
      {/* Módulos de Origem - Premium Navigation */}
      <h3 className="text-lg font-semibold mt-6 sm:mt-8 mb-4">Filtrar por Módulo</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6">
        {[
          { id: 'risk_management', title: 'Riscos', icon: Shield, color: 'red', desc: 'Planos de mitigação' },
          { id: 'compliance', title: 'Conformidade', icon: FileText, color: 'blue', desc: 'Ações corretivas' },
          { id: 'assessments', title: 'Avaliações', icon: Clipboard, color: 'green', desc: 'Planos de melhoria' },
          { id: 'privacy', title: 'Privacidade', icon: Eye, color: 'purple', desc: 'Adequação LGPD' },
          { id: 'tprm', title: 'TPRM', icon: Target, color: 'orange', desc: 'Gestão de terceiros' },
          { id: 'audit', title: 'Auditoria', icon: Search, color: 'indigo', desc: 'Achados e Correções' }
        ].map((module) => {
          const Icon = module.icon;
          const count = getActionPlansByModule(module.id).length;

          return (
            <Card
              key={module.id}
              className={`relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer border-t-4 border-t-${module.color}-500`}
              onClick={() => setSearchTerm(module.title)} /* Filter simply by clicking */
            >
              <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon className={`h-12 w-12 sm:h-24 sm:w-24 text-${module.color}-500`} />
              </div>
              <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm sm:text-lg">
                  <div className={`w-fit p-1.5 sm:p-2 rounded-lg bg-${module.color}-100 dark:bg-${module.color}-900/20 group-hover:bg-${module.color}-200 dark:group-hover:bg-${module.color}-900/40 transition-colors`}>
                    <Icon className={`h-4 w-4 sm:h-6 sm:w-6 text-${module.color}-600 dark:text-${module.color}-400`} />
                  </div>
                  <span className="truncate">{module.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <p className="text-muted-foreground mb-2 sm:mb-4 text-[10px] sm:text-xs font-medium uppercase tracking-wider line-clamp-1">
                  {module.desc}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg sm:text-2xl font-bold">{count}</span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline-block">planos</span>
                  </div>

                  <div className={`flex items-center text-xs font-medium text-${module.color}-600 group-hover:translate-x-1 transition-transform`}>
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Planos de Ação Recentes */}
      <Card className="border-0 bg-transparent sm:bg-card sm:border shadow-none sm:shadow">
        <CardHeader className="px-1 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Target className="h-5 w-5" />
            Planos de Ação Recentes
          </CardTitle>
          <CardDescription>
            Últimos planos criados ou atualizados
          </CardDescription>
        </CardHeader>
        <CardContent className="px-1 sm:px-6">
          <div className="space-y-3 sm:space-y-4">
            {actionPlans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum plano de ação encontrado.</p>
              </div>
            ) : (
              actionPlans.map(plan => (
                <SimpleEnhancedActionPlanCard
                  key={plan.id}
                  actionPlan={plan}
                  isExpandedByDefault={false}
                  showModuleLink={true}
                  onUpdate={(updatedPlan) => {
                    updateActionPlan(plan.id, updatedPlan);
                  }}
                />
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {totalItems > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t gap-2">
              <p className="text-xs text-muted-foreground w-full text-center sm:text-left sm:w-auto">
                Mostrando {((page - 1) * perPage) + 1}–{Math.min(page * perPage, totalItems)} de {totalItems} planos
              </p>
              <div className="flex items-center gap-1.5 w-full justify-center sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-7 px-2 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-0.5" />
                  <span className="hidden sm:inline">Anterior</span>
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
                  disabled={page === totalPages || totalPages === 0}
                  className="h-7 px-2 text-xs"
                >
                  <span className="hidden sm:inline">Próxima</span>
                  <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};