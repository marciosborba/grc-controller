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
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Download,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  FileCheck,
  Users,
  TrendingUp,
  Calendar as CalendarIcon,
  BarChart3,
  Activity,
  Eye,
  Archive,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ComplianceCard from './ComplianceCard';
import SortableComplianceCard from './SortableComplianceCard';
import type { ComplianceAssessment } from '@/types/compliance-management';

const CompliancePage = () => {
  const { user } = useAuth();
  
  // Estados principais
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<ComplianceAssessment | null>(null);
  const [assessments, setAssessments] = useState<ComplianceAssessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<ComplianceAssessment[]>([]);
  const [sortedAssessments, setSortedAssessments] = useState<ComplianceAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [frameworkFilter, setFrameworkFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Estados de carregamento
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Mock data - substitua por dados reais da API
  useEffect(() => {
    const fetchAssessments = async () => {
      setIsLoading(true);
      try {
        // Por enquanto, vamos usar dados mock
        const mockAssessments: ComplianceAssessment[] = [
          {
            id: '1',
            title: 'Avaliação LGPD - Sistema de CRM',
            description: 'Avaliação de conformidade com a Lei Geral de Proteção de Dados para o sistema de Customer Relationship Management',
            compliance_framework: 'LGPD',
            assessment_type: 'Privacy Impact Assessment',
            status: 'In Progress',
            priority: 'High',
            current_phase: 'Data Collection',
            overall_maturity_level: 3,
            lead_assessor: 'Maria Silva',
            business_owner: 'João Santos',
            planned_start_date: new Date('2024-01-15'),
            planned_completion_date: new Date('2024-03-30'),
            actual_start_date: new Date('2024-01-18'),
            scope_description: 'Avaliação completa dos processos de coleta, armazenamento e processamento de dados pessoais no sistema CRM',
            assessment_methodology: 'Questionários estruturados, entrevistas com stakeholders, análise documental e testes técnicos',
            created_by: user?.id || 'system',
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: '2',
            title: 'Assessment ISO 27001 - Segurança da Informação',
            description: 'Avaliação de conformidade com os controles da ISO 27001:2022 para certificação',
            compliance_framework: 'ISO 27001',
            assessment_type: 'Certification Assessment',
            status: 'Planning',
            priority: 'Critical',
            current_phase: 'Planning',
            overall_maturity_level: 2,
            lead_assessor: 'Carlos Pereira',
            business_owner: 'Ana Costa',
            planned_start_date: new Date('2024-02-01'),
            planned_completion_date: new Date('2024-06-15'),
            actual_start_date: null,
            scope_description: 'Avaliação de todos os 93 controles da ISO 27001 aplicáveis à organização',
            assessment_methodology: 'Gap analysis, documentação de evidências, testes de controles e preparação para auditoria externa',
            created_by: user?.id || 'system',
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: '3',
            title: 'Compliance SOX - Controles Financeiros',
            description: 'Avaliação de conformidade com os controles internos da Lei Sarbanes-Oxley',
            compliance_framework: 'SOX',
            assessment_type: 'Financial Controls Assessment',
            status: 'Completed',
            priority: 'Medium',
            current_phase: 'Reporting',
            overall_maturity_level: 4,
            lead_assessor: 'Roberto Lima',
            business_owner: 'Patricia Oliveira',
            planned_start_date: new Date('2023-10-01'),
            planned_completion_date: new Date('2024-01-31'),
            actual_start_date: new Date('2023-10-05'),
            scope_description: 'Avaliação dos controles internos sobre demonstrações financeiras conforme seção 404 da SOX',
            assessment_methodology: 'Walkthrough de processos, testes de efetividade operacional e documentação de deficiências',
            created_by: user?.id || 'system',
            created_at: new Date('2023-10-01'),
            updated_at: new Date()
          }
        ];

        setAssessments(mockAssessments);
        setFilteredAssessments(mockAssessments);
        setSortedAssessments(mockAssessments);
      } catch (error) {
        console.error('Error fetching assessments:', error);
        toast.error('Erro ao carregar avaliações de compliance');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessments();
  }, [user?.id]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = assessments;

    if (searchTerm) {
      filtered = filtered.filter(assessment => 
        assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.compliance_framework.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (frameworkFilter !== 'all') {
      filtered = filtered.filter(assessment => assessment.compliance_framework === frameworkFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(assessment => assessment.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(assessment => assessment.priority === priorityFilter);
    }

    setFilteredAssessments(filtered);
    setSortedAssessments(filtered);
  }, [assessments, searchTerm, frameworkFilter, statusFilter, priorityFilter]);

  const handleCreateAssessment = async (data: any) => {
    setIsCreating(true);
    try {
      // Mock create - substituir por chamada real à API
      const newAssessment: ComplianceAssessment = {
        id: Date.now().toString(),
        ...data,
        created_by: user?.id || 'system',
        created_at: new Date(),
        updated_at: new Date()
      };
      
      setAssessments(prev => [...prev, newAssessment]);
      setIsDialogOpen(false);
      toast.success('Avaliação de compliance criada com sucesso');
    } catch (error) {
      console.error('Error creating assessment:', error);
      toast.error('Erro ao criar avaliação de compliance');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateAssessment = async (id: string, updates: any) => {
    setIsUpdating(true);
    try {
      // Mock update - substituir por chamada real à API
      setAssessments(prev => prev.map(assessment => 
        assessment.id === id 
          ? { ...assessment, ...updates, updated_at: new Date() }
          : assessment
      ));
      toast.success('Avaliação de compliance atualizada com sucesso');
    } catch (error) {
      console.error('Error updating assessment:', error);
      toast.error('Erro ao atualizar avaliação de compliance');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta avaliação?')) return;
    
    setIsDeleting(true);
    try {
      // Mock delete - substituir por chamada real à API
      setAssessments(prev => prev.filter(assessment => assessment.id !== id));
      setSortedAssessments(prev => prev.filter(assessment => assessment.id !== id));
      toast.success('Avaliação de compliance excluída com sucesso');
    } catch (error) {
      console.error('Error deleting assessment:', error);
      toast.error('Erro ao excluir avaliação de compliance');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setEditingAssessment(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setSortedAssessments((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning': return 'border-blue-300 bg-blue-50 text-blue-800';
      case 'In Progress': return 'border-orange-300 bg-orange-50 text-orange-800';
      case 'Review': return 'border-purple-300 bg-purple-50 text-purple-800';
      case 'Completed': return 'border-green-300 bg-green-50 text-green-800';
      case 'On Hold': return 'border-yellow-300 bg-yellow-50 text-yellow-800';
      default: return 'border-gray-300 bg-gray-50 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Planning': return 'Planejamento';
      case 'In Progress': return 'Em Andamento';
      case 'Review': return 'Revisão';
      case 'Completed': return 'Concluído';
      case 'On Hold': return 'Suspenso';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-600';
      case 'High': return 'text-orange-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // Estatísticas resumidas
  const stats = {
    total: assessments.length,
    inProgress: assessments.filter(a => a.status === 'In Progress').length,
    completed: assessments.filter(a => a.status === 'Completed').length,
    overdue: assessments.filter(a => 
      a.planned_completion_date && 
      new Date(a.planned_completion_date) < new Date() && 
      a.status !== 'Completed'
    ).length,
    avgMaturity: assessments.length > 0 
      ? Math.round(assessments.reduce((sum, a) => sum + (a.overall_maturity_level || 0), 0) / assessments.length * 10) / 10
      : 0
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando avaliações de compliance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Gestão de Conformidade</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Monitore a conformidade com frameworks regulatórios
          </p>
        </div>
        
        <button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
              style={{
                backgroundColor: 'hsl(var(--primary))', // Usa variável CSS primary
                color: 'white', // Texto branco para melhor contraste
                border: '1px solid hsl(var(--primary))',
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
          Nova Avaliação
        </button>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAssessment ? 'Editar Avaliação' : 'Nova Avaliação'}
              </DialogTitle>
              <DialogDescription>
                Crie uma nova avaliação de compliance para acompanhar a conformidade com frameworks regulatórios.
              </DialogDescription>
            </DialogHeader>
            
            {/* Form content would go here - simplified for now */}
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Formulário de criação/edição de avaliações será implementado aqui.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">avaliações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">finalizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">vencidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maturidade Média</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.avgMaturity}</div>
            <p className="text-xs text-muted-foreground">de 5.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pesquisar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar avaliações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Framework</label>
              <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os frameworks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os frameworks</SelectItem>
                  <SelectItem value="LGPD">LGPD</SelectItem>
                  <SelectItem value="ISO 27001">ISO 27001</SelectItem>
                  <SelectItem value="SOX">SOX</SelectItem>
                  <SelectItem value="NIST">NIST</SelectItem>
                  <SelectItem value="PCI DSS">PCI DSS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="Planning">Planejamento</SelectItem>
                  <SelectItem value="In Progress">Em Andamento</SelectItem>
                  <SelectItem value="Review">Revisão</SelectItem>
                  <SelectItem value="Completed">Concluído</SelectItem>
                  <SelectItem value="On Hold">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridade</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as prioridades</SelectItem>
                  <SelectItem value="Critical">Crítica</SelectItem>
                  <SelectItem value="High">Alta</SelectItem>
                  <SelectItem value="Medium">Média</SelectItem>
                  <SelectItem value="Low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <div className="space-y-4">
        {sortedAssessments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Shield className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma avaliação encontrada</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || frameworkFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? "Não há avaliações que correspondam aos filtros selecionados."
                  : "Comece criando sua primeira avaliação de compliance."}
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Avaliação
              </Button>
            </CardContent>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={sortedAssessments.map(a => a.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {sortedAssessments.map((assessment) => (
                  <SortableComplianceCard
                    key={assessment.id}
                    item={assessment}
                    onUpdate={handleUpdateAssessment}
                    onDelete={handleDeleteAssessment}
                    canEdit={true}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default CompliancePage;