import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Search, MoreHorizontal, Trash2, Edit3, Filter, Copy } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateAssessmentDialog } from './CreateAssessmentDialog';
import { AssessmentStats } from './AssessmentStats';
import { useAssessments } from '@/hooks/useAssessments';
import { useToast } from '@/hooks/use-toast';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Não Iniciado':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'Em Andamento':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Em Revisão':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Concluído':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const isOverdue = (dueDate: string | null) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

export const AssessmentManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { assessments, isLoading, deleteAssessment, createAssessment } = useAssessments();
  const isMobile = useIsMobile();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    assessment: any;
    confirmText: string;
  }>({
    isOpen: false,
    assessment: null,
    confirmText: '',
  });

  const filteredAssessments = assessments?.filter(assessment => {
    const matchesSearch = assessment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.framework?.short_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleDelete = async () => {
    if (deleteDialog.confirmText !== deleteDialog.assessment?.name) {
      toast({
        title: "Erro",
        description: "O nome do assessment não confere.",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteAssessment(deleteDialog.assessment.id);
      toast({
        title: "Sucesso",
        description: "Assessment excluído com sucesso.",
      });
      setDeleteDialog({ isOpen: false, assessment: null, confirmText: '' });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir assessment.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async (assessment: any) => {
    try {
      await createAssessment({
        name: `${assessment.name} (Cópia)`,
        framework_id_on_creation: assessment.framework_id_on_creation,
        due_date: assessment.due_date,
      });
      toast({
        title: "Sucesso",
        description: "Assessment duplicado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao duplicar assessment.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
        <div>
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold tracking-tight`}>
            Gestão de Assessments
          </h1>
          <p className="text-muted-foreground">
            Gerencie o ciclo de vida completo dos seus assessments de conformidade
          </p>
        </div>
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'gap-2'}`}>
          <Button
            variant="outline"
            onClick={() => navigate('/assessments/frameworks')}
            className="flex items-center gap-2"
            size={isMobile ? "sm" : "default"}
          >
            <FileText className="h-4 w-4" />
            {isMobile ? 'Frameworks' : 'Gerenciar Frameworks'}
          </Button>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2"
            size={isMobile ? "sm" : "default"}
          >
            <Plus className="h-4 w-4" />
            {isMobile ? 'Novo' : 'Novo Assessment'}
          </Button>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Lista de Assessments</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <AssessmentStats assessments={assessments || []} />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">

      {/* Search and Filters */}
      <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center space-x-2'}`}>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="Não Iniciado">Não Iniciado</SelectItem>
              <SelectItem value="Em Andamento">Em Andamento</SelectItem>
              <SelectItem value="Em Revisão">Em Revisão</SelectItem>
              <SelectItem value="Concluído">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Assessments Table */}
      <Card>
        <CardContent className={isMobile ? "p-2" : "p-0"}>
          <div className={isMobile ? "overflow-x-auto" : ""}>
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Assessment</TableHead>
                {!isMobile && <TableHead>Framework</TableHead>}
                <TableHead>Status</TableHead>
                {!isMobile && <TableHead>Progresso</TableHead>}
                {!isMobile && <TableHead>Prazo</TableHead>}
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Carregando assessments...
                  </TableCell>
                </TableRow>
              ) : filteredAssessments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {searchTerm ? 'Nenhum assessment encontrado.' : 'Nenhum assessment criado ainda.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssessments.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{assessment.name}</div>
                        {isMobile && (
                          <div className="mt-1 space-y-1">
                            <Badge variant="secondary" className="mr-1 text-xs">
                              {assessment.framework?.short_name || 'N/A'}
                            </Badge>
                            <div className="flex items-center space-x-2 mt-1">
                              <Progress value={assessment.progress || 0} className="w-[60px]" />
                              <span className="text-xs text-muted-foreground">
                                {assessment.progress || 0}%
                              </span>
                            </div>
                            <div className={`text-xs ${isOverdue(assessment.due_date) ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                              {formatDate(assessment.due_date)}
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    {!isMobile && (
                      <TableCell>
                        <Badge variant="secondary">
                          {assessment.framework?.short_name || 'N/A'}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge className={getStatusColor(assessment.status)}>
                        {isMobile ? assessment.status.substring(0, 10) : assessment.status}
                      </Badge>
                    </TableCell>
                    {!isMobile && (
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={assessment.progress || 0} className="w-[60px]" />
                          <span className="text-sm text-muted-foreground">
                            {assessment.progress || 0}%
                          </span>
                        </div>
                      </TableCell>
                    )}
                    {!isMobile && (
                      <TableCell>
                        <span className={isOverdue(assessment.due_date) ? 'text-destructive font-medium' : ''}>
                          {formatDate(assessment.due_date)}
                        </span>
                      </TableCell>
                    )}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => navigate(`/assessments/${assessment.id}`)}
                            className="cursor-pointer"
                          >
                            <Edit3 className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicate(assessment)}
                            className="cursor-pointer"
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteDialog({
                              isOpen: true,
                              assessment,
                              confirmText: '',
                            })}
                            className="cursor-pointer text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

        </TabsContent>
      </Tabs>

      {/* Create Assessment Dialog */}
      <CreateAssessmentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false);
          toast({
            title: "Sucesso",
            description: "Assessment criado com sucesso.",
          });
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => 
        setDeleteDialog(prev => ({ ...prev, isOpen: open }))
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o assessment
                <span className="font-semibold"> "{deleteDialog.assessment?.name}"</span> e
                todos os dados associados.
              </p>
              <p>
                Para confirmar, digite o nome do assessment abaixo:
              </p>
              <Input
                value={deleteDialog.confirmText}
                onChange={(e) => setDeleteDialog(prev => ({
                  ...prev,
                  confirmText: e.target.value
                }))}
                placeholder={deleteDialog.assessment?.name}
                className="mt-2"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteDialog.confirmText !== deleteDialog.assessment?.name}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Assessment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};