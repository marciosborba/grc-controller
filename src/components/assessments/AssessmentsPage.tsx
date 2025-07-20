import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  Calendar as CalendarIcon, 
  Edit, 
  Trash2, 
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Play,
  Pause
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Assessment {
  id: string;
  title: string;
  description: string | null;
  type: string;
  framework: string | null;
  status: string;
  questionnaire_data: any;
  responses: any;
  score: number | null;
  max_score: number | null;
  completion_percentage: number;
  due_date: string | null;
  completed_at: string | null;
  created_by: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

const AssessmentsPage = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [dueDate, setDueDate] = useState<Date>();
  
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    framework: '',
    status: 'draft',
    assigned_to: '',
    questionnaire_data: {} as any,
  });

  // Predefined assessment templates
  const assessmentTemplates = {
    iso27001: {
      title: 'Assessment ISO 27001',
      framework: 'ISO 27001',
      type: 'security',
      questions: [
        {
          id: 'q1',
          question: 'A organização possui uma política de segurança da informação documentada?',
          category: 'A.5 - Políticas de Segurança',
          type: 'boolean',
          required: true
        },
        {
          id: 'q2',
          question: 'Há um inventário de ativos de informação?',
          category: 'A.8 - Gestão de Ativos',
          type: 'boolean',
          required: true
        },
        {
          id: 'q3',
          question: 'A organização realiza análise de riscos periodicamente?',
          category: 'A.6 - Organização da Segurança',
          type: 'boolean',
          required: true
        },
        {
          id: 'q4',
          question: 'Qual a frequência de treinamentos em segurança?',
          category: 'A.7 - Segurança em Recursos Humanos',
          type: 'select',
          options: ['Mensal', 'Trimestral', 'Semestral', 'Anual', 'Esporádico'],
          required: true
        },
        {
          id: 'q5',
          question: 'A organização possui controles de acesso físico?',
          category: 'A.11 - Segurança Física',
          type: 'boolean',
          required: true
        }
      ]
    },
    lgpd: {
      title: 'Assessment LGPD',
      framework: 'LGPD',
      type: 'compliance',
      questions: [
        {
          id: 'q1',
          question: 'A organização possui um DPO (Data Protection Officer) nomeado?',
          category: 'Governança',
          type: 'boolean',
          required: true
        },
        {
          id: 'q2',
          question: 'Existe um registro de atividades de tratamento?',
          category: 'Documentação',
          type: 'boolean',
          required: true
        },
        {
          id: 'q3',
          question: 'A organização realiza DPIA quando necessário?',
          category: 'Avaliação de Impacto',
          type: 'boolean',
          required: true
        },
        {
          id: 'q4',
          question: 'Qual o prazo para notificação de incidentes à ANPD?',
          category: 'Gestão de Incidentes',
          type: 'select',
          options: ['24 horas', '48 horas', '72 horas', 'Prazo razoável'],
          required: true
        },
        {
          id: 'q5',
          question: 'A organização possui bases legais definidas para cada tratamento?',
          category: 'Bases Legais',
          type: 'boolean',
          required: true
        }
      ]
    },
    nist: {
      title: 'Assessment NIST Cybersecurity Framework',
      framework: 'NIST',
      type: 'security',
      questions: [
        {
          id: 'q1',
          question: 'A organização identifica e cataloga seus ativos críticos?',
          category: 'Identify',
          type: 'boolean',
          required: true
        },
        {
          id: 'q2',
          question: 'Existem controles implementados para proteger ativos críticos?',
          category: 'Protect',
          type: 'boolean',
          required: true
        },
        {
          id: 'q3',
          question: 'A organização possui capacidade de detecção de eventos de segurança?',
          category: 'Detect',
          type: 'boolean',
          required: true
        },
        {
          id: 'q4',
          question: 'Existe um plano de resposta a incidentes?',
          category: 'Respond',
          type: 'boolean',
          required: true
        },
        {
          id: 'q5',
          question: 'A organização possui plano de continuidade de negócios?',
          category: 'Recover',
          type: 'boolean',
          required: true
        }
      ]
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  useEffect(() => {
    let filtered = assessments;
    
    if (searchTerm) {
      filtered = filtered.filter(assessment => 
        assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.framework?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(assessment => assessment.type === typeFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(assessment => assessment.status === statusFilter);
    }
    
    setFilteredAssessments(filtered);
  }, [assessments, searchTerm, typeFilter, statusFilter]);

  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAssessments(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar assessments',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const assessmentData = {
        ...formData,
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
        created_by: user?.id,
        max_score: formData.questionnaire_data.questions?.length * 10 || 100,
        completion_percentage: 0,
      };

      if (editingAssessment) {
        const { error } = await supabase
          .from('assessments')
          .update(assessmentData)
          .eq('id', editingAssessment.id);
        
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Assessment atualizado com sucesso',
        });
      } else {
        const { error } = await supabase
          .from('assessments')
          .insert([assessmentData]);
        
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Assessment criado com sucesso',
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchAssessments();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao salvar assessment',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (assessment: Assessment) => {
    setEditingAssessment(assessment);
    setFormData({
      title: assessment.title,
      description: assessment.description || '',
      type: assessment.type,
      framework: assessment.framework || '',
      status: assessment.status,
      assigned_to: assessment.assigned_to || '',
      questionnaire_data: assessment.questionnaire_data || {},
    });
    setDueDate(assessment.due_date ? new Date(assessment.due_date) : undefined);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este assessment?')) return;
    
    try {
      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Assessment excluído com sucesso',
      });
      
      fetchAssessments();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao excluir assessment',
        variant: 'destructive',
      });
    }
  };

  const handleStartAssessment = async (assessment: Assessment) => {
    try {
      const { error } = await supabase
        .from('assessments')
        .update({ 
          status: 'in_progress',
          assigned_to: user?.id 
        })
        .eq('id', assessment.id);
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Assessment iniciado com sucesso',
      });
      
      fetchAssessments();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao iniciar assessment',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: '',
      framework: '',
      status: 'draft',
      assigned_to: '',
      questionnaire_data: {},
    });
    setDueDate(undefined);
    setEditingAssessment(null);
  };

  const selectTemplate = (templateKey: string) => {
    const template = assessmentTemplates[templateKey as keyof typeof assessmentTemplates];
    setFormData({
      ...formData,
      title: template.title,
      type: template.type,
      framework: template.framework,
      questionnaire_data: { questions: template.questions },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Rascunho';
      case 'in_progress': return 'Em Progresso';
      case 'completed': return 'Concluído';
      case 'overdue': return 'Atrasado';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      default: return <ClipboardCheck className="h-4 w-4" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'security': return 'Segurança';
      case 'compliance': return 'Compliance';
      case 'risk': return 'Risco';
      case 'privacy': return 'Privacidade';
      case 'operational': return 'Operacional';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Assessments</h1>
          <p className="text-muted-foreground">Gerencie avaliações de risco e compliance</p>
        </div>
        
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
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingAssessment && (
                <div>
                  <Label>Selecione um Template</Label>
                  <div className="grid grid-cols-1 gap-3 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="justify-start h-auto p-4"
                      onClick={() => selectTemplate('iso27001')}
                    >
                      <Target className="mr-3 h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">ISO 27001</div>
                        <div className="text-sm text-muted-foreground">
                          Avaliação de Sistema de Gestão de Segurança da Informação
                        </div>
                      </div>
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="justify-start h-auto p-4"
                      onClick={() => selectTemplate('lgpd')}
                    >
                      <CheckCircle className="mr-3 h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">LGPD</div>
                        <div className="text-sm text-muted-foreground">
                          Avaliação de Conformidade com a Lei Geral de Proteção de Dados
                        </div>
                      </div>
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="justify-start h-auto p-4"
                      onClick={() => selectTemplate('nist')}
                    >
                      <ClipboardCheck className="mr-3 h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">NIST Cybersecurity Framework</div>
                        <div className="text-sm text-muted-foreground">
                          Avaliação baseada no framework de cibersegurança do NIST
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    placeholder="Ex: Assessment ISO 27001 - Área TI"
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    placeholder="Descreva o objetivo e escopo do assessment..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Tipo *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({...formData, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="security">Segurança</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="risk">Risco</SelectItem>
                      <SelectItem value="privacy">Privacidade</SelectItem>
                      <SelectItem value="operational">Operacional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="framework">Framework</Label>
                  <Select
                    value={formData.framework}
                    onValueChange={(value) => setFormData({...formData, framework: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ISO 27001">ISO 27001</SelectItem>
                      <SelectItem value="LGPD">LGPD</SelectItem>
                      <SelectItem value="NIST">NIST</SelectItem>
                      <SelectItem value="SOX">SOX</SelectItem>
                      <SelectItem value="PCI DSS">PCI DSS</SelectItem>
                      <SelectItem value="COBIT">COBIT</SelectItem>
                      <SelectItem value="Custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="in_progress">Em Progresso</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Data de Vencimento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              {formData.questionnaire_data?.questions && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium mb-2">Preview do Questionário:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {formData.questionnaire_data.questions.map((q: any, index: number) => (
                      <div key={q.id} className="text-sm">
                        <span className="font-medium">{index + 1}.</span> {q.question}
                        {q.category && <span className="text-muted-foreground"> ({q.category})</span>}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Total de {formData.questionnaire_data.questions.length} perguntas
                  </p>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingAssessment ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar assessments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="security">Segurança</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="risk">Risco</SelectItem>
                <SelectItem value="privacy">Privacidade</SelectItem>
                <SelectItem value="operational">Operacional</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="in_progress">Em Progresso</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="overdue">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <ClipboardCheck className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{assessments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Em Progresso</p>
                <p className="text-2xl font-bold">
                  {assessments.filter(a => a.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold">
                  {assessments.filter(a => a.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Atrasados</p>
                <p className="text-2xl font-bold">
                  {assessments.filter(a => a.status === 'overdue').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Framework</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssessments.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-semibold">{assessment.title}</p>
                        {assessment.description && (
                          <p className="text-sm text-muted-foreground">{assessment.description.substring(0, 60)}...</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTypeText(assessment.type)}</Badge>
                    </TableCell>
                    <TableCell>
                      {assessment.framework ? (
                        <Badge variant="outline">{assessment.framework}</Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(assessment.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(assessment.status)}
                          {getStatusText(assessment.status)}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={assessment.completion_percentage} className="w-16" />
                        <span className="text-sm font-medium">{assessment.completion_percentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {assessment.due_date ? (
                        format(new Date(assessment.due_date), 'dd/MM/yyyy', { locale: ptBR })
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(assessment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {assessment.status === 'draft' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartAssessment(assessment)}
                            title="Iniciar Assessment"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(assessment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredAssessments.length === 0 && (
              <div className="text-center py-8">
                <ClipboardCheck className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                    ? 'Nenhum assessment encontrado com os filtros aplicados.'
                    : 'Nenhum assessment encontrado.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentsPage;