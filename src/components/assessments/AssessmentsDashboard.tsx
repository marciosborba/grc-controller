import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  FileText, CheckCircle, Activity, Award, Search, Filter, Plus, Clock, ChevronLeft, ChevronRight, Target, Trash2, Edit, Calendar
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { useNavigate } from 'react-router-dom';
import { useAssessmentIntegration } from '@/hooks/useAssessmentIntegration';
import { toast } from 'sonner';

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

      {/* Métricas Principais (Server Side) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atrasados</p>
                <p className="text-2xl font-bold text-red-600">{metrics.overdue}</p>
                <p className="text-xs text-muted-foreground mt-1">Prazo Expirado</p>
              </div>
              <Activity className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.active}</p>
                <p className="text-xs text-muted-foreground mt-1">Ativos agora</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">{metrics.completed}</p>
                <p className="text-xs text-muted-foreground mt-1">Finalizados</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Maturidade Média</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.avgMaturity}%</p>
                <p className="text-xs text-muted-foreground mt-1">Global</p>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca (Overview Mode) */}
      <div className="flex items-center gap-4 bg-background p-4 rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
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
            </SelectContent>
          </Select>
        </div>
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

      {/* Lista de Assessments */}
      <div className="grid gap-4">
        {assessments.map(assessment => (
          <Card key={assessment.id} className="hover:shadow-md transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{assessment.titulo}</h3>
                    <Badge variant="outline" className={getStatusColor(assessment.status)}>
                      {assessment.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                    {assessment.descricao || 'Sem descrição'}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      <span>{assessment.framework?.nome || 'Personalizado'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{assessment.data_fim_planejada ? new Date(assessment.data_fim_planejada).toLocaleDateString() : 'Sem prazo'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 min-w-[150px]">
                  <div className="text-right w-full">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progresso</span>
                      <span>{assessment.percentual_conclusao || 0}%</span>
                    </div>
                    <Progress value={assessment.percentual_conclusao} className="h-2" />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditClick(assessment)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/assessments/${assessment.id}`)}>
                      Abrir
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50">
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
            <div className="grid grid-cols-2 gap-4">
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