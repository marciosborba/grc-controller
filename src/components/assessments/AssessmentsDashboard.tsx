import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  FileText, CheckCircle, Activity, Award, Search, Filter, Plus, Clock, ChevronLeft, ChevronRight, Target, Trash2, Edit, Calendar, AlertCircle, Eye, AlertTriangle
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { useNavigate } from 'react-router-dom';
import { useAssessmentIntegration } from '@/hooks/useAssessmentIntegration';
import { toast } from 'sonner';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const STATUS_COLORS: Record<string, string> = {
  'concluido': '#10b981', // emerald-500
  'em_andamento': '#8b5cf6', // violet-500
  'em_execucao': '#a855f7', // purple-500
  'planejado': '#3b82f6', // blue-500
  'aguardando_revisao': '#f97316', // orange-500
  'cancelado': '#ef4444', // red-500
};

export default function AssessmentsDashboard() {
  const { user } = useAuth();
  const effectiveTenantId = useCurrentTenantId();
  const navigate = useNavigate();

  // New Integration Hook
  const {
    assessments,
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
    frameworks,
    availableUsers,
    createAssessment,
    updateAssessment,
    deleteAssessment,
    addAssessmentEvaluators,
    refreshList
  } = useAssessmentIntegration();

  // Aggregations for Charts
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    assessments.forEach(a => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.replace('_', ' '),
      key: name,
      value
    })).sort((a, b) => b.value - a.value);
  }, [assessments]);

  const frameworkData = useMemo(() => {
    const counts: Record<string, number> = {};
    assessments.forEach(a => {
      const fwName = a.framework?.nome || 'Customizado';
      counts[fwName] = (counts[fwName] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5
  }, [assessments]);

  // Edit Dialog State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<any>(null);

  const handleEditClick = (assessment: any) => {
    setEditingAssessment({
      ...assessment,
      data_fim_planejada: assessment.data_fim_planejada ? assessment.data_fim_planejada.split('T')[0] : ''
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingAssessment) return;
    try {
      await updateAssessment(editingAssessment.id, {
        titulo: editingAssessment.titulo,
        descricao: editingAssessment.descricao,
        data_fim_planejada: editingAssessment.data_fim_planejada,
        status: editingAssessment.status
      });
      toast.success('Assessment atualizado com sucesso');
      setIsEditOpen(false);
      refreshList();
    } catch (err) {
      toast.error('Erro ao atualizar assessment');
    }
  };

  const totalPages = Math.ceil(totalItems / perPage);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'planejado': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200',
      'em_andamento': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200',
      'em_execucao': 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200',
      'concluido': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200',
      'aguardando_revisao': 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200',
      'cancelado': 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-200'
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  if (loading && assessments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions Bar - Moved here from Hub Header for context actions */}
      <div className="flex justify-end">
        <Button onClick={() => navigate('/assessments/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Assessment
        </Button>
      </div>

      {/* Premium Storytelling Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

        {/* Card 1: Dynamic Narrative Card */}
        <Card className="relative overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all">
          <div className={`absolute top-0 right-0 p-3 opacity-10`}>
            {metrics.overdue > 0 ? <AlertTriangle className="h-16 w-16 sm:h-24 sm:w-24" /> : <CheckCircle className="h-16 w-16 sm:h-24 sm:w-24" />}
          </div>
          <CardHeader className="pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className={`text-base sm:text-lg font-bold flex items-center gap-2 ${metrics.overdue > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {metrics.overdue > 0 ? 'Atenção Necessária' : 'Boa Conformidade'}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            <p className="text-muted-foreground font-medium text-sm leading-relaxed">
              {metrics.overdue > 0
                ? `${metrics.overdue} assessments estão atrasados e requerem ação imediata.`
                : 'Todos os assessments estão dentro do prazo previsto.'}
            </p>
            <div className={`mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${metrics.overdue > 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
              {metrics.overdue > 0 ? 'Atrasos Detectados' : 'Em Dia'}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Total Assessments (Reliable Data) */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <FileText className="h-16 w-16 sm:h-24 sm:w-24 text-blue-500" />
          </div>
          <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl sm:rounded-2xl">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] sm:text-sm font-medium text-muted-foreground uppercase sm:normal-case tracking-wider sm:tracking-normal w-full">Total de Assessments</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground">{metrics.total}</h3>
              <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Registrados na base</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Compliance Rate */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <Award className="h-16 w-16 sm:h-24 sm:w-24 text-emerald-500" />
          </div>
          <CardHeader className="pb-1 sm:pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-sm sm:text-lg font-bold text-foreground">
              Taxa de Conclusão
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-emerald-600">{metrics.complianceRate}%</span>
              <span className="text-[10px] sm:text-sm text-muted-foreground">do total</span>
            </div>
            <p className="text-[9px] sm:text-sm text-muted-foreground mt-1 sm:mt-2">
              {metrics.completed} de {metrics.total} assessments finalizados.
            </p>
            <div className="mt-3 sm:mt-4 w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${metrics.complianceRate}%` }}></div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Active Status Distribution */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity className="h-16 w-16 sm:h-24 sm:w-24 text-purple-500" />
          </div>
          <CardContent className="p-4 sm:p-6 pb-4 sm:pb-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-sm font-medium text-muted-foreground">Em Andamento</span>
                <span className="text-sm sm:text-base font-bold text-purple-600">{metrics.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-sm font-medium text-muted-foreground">Aguardando Revisão</span>
                <span className="text-sm sm:text-base font-bold text-orange-600">{metrics.reviewPending}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-sm font-medium text-muted-foreground">Planejados</span>
                <span className="text-sm sm:text-base font-bold text-blue-600">{metrics.pending}</span>
              </div>
              <div className="w-full bg-secondary h-1 sm:h-1.5 rounded-full overflow-hidden mt-1 sm:mt-2">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(metrics.active / Math.max(metrics.total, 1)) * 100}%` }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[220px] sm:h-[300px] pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.key] || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [value, 'Assessments']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  layout="horizontal"
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Framework Usage */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">Assessments por Framework</CardTitle>
          </CardHeader>
          <CardContent className="h-[220px] sm:h-[300px] pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={frameworkData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} strokeOpacity={0.5} />
                <XAxis type="number" allowDecimals={false} hide />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10 }} interval={0} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Bar dataKey="value" name="Qtd" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca (Overview Mode) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 bg-background p-3 sm:p-4 rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 sm:h-10 text-xs sm:text-sm"
          />
        </div>
        {/* Ordenação */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={(value) => {
              const [newSortBy, newSortOrder] = value.split('-');
              setSortBy(newSortBy);
              setSortOrder(newSortOrder as 'asc' | 'desc');
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px] h-9 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at-desc">Mais Recentes</SelectItem>
              <SelectItem value="created_at-asc">Mais Antigos</SelectItem>
              <SelectItem value="titulo-asc">Título (A-Z)</SelectItem>
              <SelectItem value="titulo-desc">Título (Z-A)</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-9 sm:h-10 text-xs sm:text-sm px-3 shrink-0">
                <Filter className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Filtros Avançados</span>
                {(statusFilter !== 'all' || priorityFilter !== 'all') && (
                  <Badge variant="secondary" className="ml-1 sm:ml-2 h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-xs">
                    {(statusFilter !== 'all' ? 1 : 0) + (priorityFilter !== 'all' ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-2rem)] sm:w-80 p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="planejado">Planejado</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="em_execucao">Em Execução</SelectItem>
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
        </div>
      </div>

      {/* Lista de Assessments */}
      <div className="grid gap-4">
        {assessments.map(assessment => (
          <Card key={assessment.id} className="hover:shadow-md transition-all">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="font-semibold text-base sm:text-lg leading-tight">{assessment.titulo}</h3>
                    <Badge variant="outline" className={`w-fit text-[10px] sm:text-xs px-2 py-0 h-5 ${getStatusColor(assessment.status)}`}>
                      {assessment.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2 sm:line-clamp-1">
                    {assessment.descricao || 'Sem descrição'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-[10px] sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                      <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="truncate max-w-[120px] sm:max-w-none">{assessment.framework?.nome || 'Personalizado'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{assessment.data_fim_planejada ? new Date(assessment.data_fim_planejada).toLocaleDateString() : 'Sem prazo'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-border">
                  <div className="text-left sm:text-right w-full sm:min-w-[150px]">
                    <div className="flex justify-between items-center text-[10px] sm:text-xs mb-1.5">
                      <span className="text-muted-foreground uppercase tracking-wider font-medium">Progresso</span>
                      <span className="font-bold">{assessment.percentual_conclusao || 0}%</span>
                    </div>
                    <Progress value={assessment.percentual_conclusao} className="h-2" />
                  </div>
                  <div className="flex sm:items-center justify-end gap-2 mt-auto sm:mt-2 w-full">
                    <Button size="sm" variant="outline" className="flex-1 sm:flex-none h-9 sm:h-8 text-xs justify-center" onClick={() => handleEditClick(assessment)}>
                      <Edit className="h-3.5 w-3.5 mr-1.5 sm:mr-1" />
                      <span className="inline">Editar</span>
                    </Button>
                    <Button size="sm" variant="default" className="flex-1 sm:flex-none h-9 sm:h-8 text-xs justify-center" onClick={() => navigate(`/assessments/${assessment.id}`)}>
                      <Eye className="h-3.5 w-3.5 mr-1.5 sm:mr-1" />
                      Detalhes
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="shrink-0 h-9 sm:h-8 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 sm:px-2 border-red-200 hover:border-red-300">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Assessment?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Todos as respostas e evidências associadas serão perdidas.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={async () => {
                              try {
                                await deleteAssessment(assessment.id);
                                toast.success('Assessment excluído com sucesso');
                                refreshList();
                              } catch (err) {
                                toast.error('Erro ao excluir assessment');
                              }
                            }}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {assessments.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            Nenhum assessment encontrado.
          </div>
        )}
      </div>

      {/* Paginação */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {((page - 1) * perPage) + 1} a {Math.min(page * perPage, totalItems)} de {totalItems} assessments
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
              <span className="text-sm font-medium">
                Página {page} de {totalPages}
              </span>
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
      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Assessment</DialogTitle>
            <DialogDescription>Atualize os detalhes do assessment abaixo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={editingAssessment?.titulo || ''}
                onChange={e => setEditingAssessment({ ...editingAssessment, titulo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={editingAssessment?.descricao || ''}
                onChange={e => setEditingAssessment({ ...editingAssessment, descricao: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Fim Planejada</Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={editingAssessment?.data_fim_planejada || ''}
                    onChange={e => setEditingAssessment({ ...editingAssessment, data_fim_planejada: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editingAssessment?.status || 'planejado'}
                  onValueChange={val => setEditingAssessment({ ...editingAssessment, status: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planejado">Planejado</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="em_execucao">Em Execução</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdate}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}