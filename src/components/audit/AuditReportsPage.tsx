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
  ClipboardList, 
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
  PlayCircle,
  FileText,
  Building,
  Database
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth} from '@/contexts/AuthContextOptimized';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import AuditCard from './AuditCard';
import SortableAuditCard from './SortableAuditCard';
import type { Audit } from '@/types/audit-management';

const AuditReportsPage = () => {
  const { user } = useAuth();
  
  // Estados principais
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAudit, setEditingAudit] = useState<Audit | null>(null);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [filteredAudits, setFilteredAudits] = useState<Audit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');

  // Estados de carregamento
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados para drag and drop
  const [sortedAudits, setSortedAudits] = useState<Audit[]>([]);

  // Configuração do drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Mock data - substitua por dados reais da API
  useEffect(() => {
    const fetchAudits = async () => {
      setIsLoading(true);
      try {
        // Por enquanto, vamos usar dados mock
        const mockAudits: Audit[] = [
          {
            id: '1',
            title: 'Auditoria Interna - Processo de Compras',
            description: 'Auditoria do processo de compras e contratações para verificar aderência aos controles internos',
            audit_type: 'Internal Audit',
            audit_scope: 'Process Specific',
            scope_description: 'Processos de solicitação, aprovação, compra e recebimento de bens e serviços',
            status: 'Fieldwork',
            priority: 'High',
            current_phase: 'Control Testing',
            lead_auditor: 'Sandra Martins',
            auditor_id: user?.id || 'system',
            planned_start_date: new Date('2024-01-10'),
            planned_end_date: new Date('2024-02-28'),
            fieldwork_start_date: new Date('2024-01-15'),
            fieldwork_end_date: new Date('2024-02-20'),
            report_due_date: new Date('2024-03-05'),
            budgeted_hours: 160,
            actual_hours: 120,
            estimated_cost: 25000.00,
            actual_cost: 18500.00,
            overall_opinion: null,
            overall_rating: 3,
            executive_summary: null,
            key_findings_summary: 'Identificadas oportunidades de melhoria nos controles de aprovação e segregação de funções',
            objectives: ['Avaliar a efetividade dos controles no processo de compras', 'Verificar conformidade com políticas internas', 'Identificar oportunidades de melhoria'],
            audit_criteria: ['Política de Compras v2.1', 'Norma de Alçadas Financeiras', 'Código de Ética'],
            auditee_contacts: ['Fernando Costa - Gerente de Compras', 'Lucia Santos - Coordenadora Financeira'],
            auditors: ['Sandra Martins - Auditora Líder', 'Paulo Ribeiro - Auditor Sênior'],
            confidentiality_level: 'Internal',
            follow_up_required: true,
            follow_up_date: new Date('2024-06-01'),
            findings: [],
            created_by: user?.id || 'system',
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: '2',
            title: 'Auditoria Externa - Demonstrações Financeiras 2023',
            description: 'Auditoria independente das demonstrações financeiras do exercício de 2023',
            audit_type: 'External Audit',
            audit_scope: 'Organization-wide',
            scope_description: 'Demonstrações financeiras consolidadas da empresa e subsidiárias',
            status: 'Review',
            priority: 'Critical',
            current_phase: 'Reporting',
            lead_auditor: 'KPMG Auditores',
            auditor_id: null,
            planned_start_date: new Date('2024-01-02'),
            planned_end_date: new Date('2024-03-31'),
            fieldwork_start_date: new Date('2024-02-01'),
            fieldwork_end_date: new Date('2024-03-15'),
            report_due_date: new Date('2024-04-15'),
            budgeted_hours: 480,
            actual_hours: 465,
            estimated_cost: 150000.00,
            actual_cost: 148200.00,
            overall_opinion: 'Unqualified Opinion',
            overall_rating: 5,
            executive_summary: 'As demonstrações financeiras apresentam adequadamente a posição patrimonial e financeira da Companhia',
            key_findings_summary: 'Não foram identificadas deficiências significativas nos controles internos sobre demonstrações financeiras',
            objectives: ['Emitir opinião sobre as demonstrações financeiras', 'Avaliar controles internos relevantes', 'Verificar conformidade com normas contábeis'],
            audit_criteria: ['CPC - Comitê de Pronunciamentos Contábeis', 'Lei 6.404/76', 'Instruções CVM'],
            auditee_contacts: ['Ana Rodrigues - CFO', 'Marcos Alves - Controller', 'Beatriz Silva - Gerente Contábil'],
            auditors: ['João Mendes - Sócio KPMG', 'Patricia Lemos - Gerente KPMG', 'Rafael Costa - Supervisor KPMG'],
            confidentiality_level: 'Confidential',
            follow_up_required: false,
            follow_up_date: null,
            findings: [],
            created_by: user?.id || 'system',
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: '3',
            title: 'Auditoria de TI - Segurança da Informação',
            description: 'Avaliação dos controles de segurança da informação nos sistemas críticos',
            audit_type: 'IT Audit',
            audit_scope: 'IT Systems',
            scope_description: 'Controles de acesso, backup, monitoramento e segurança dos sistemas ERP, CRM e financeiro',
            status: 'Planning',
            priority: 'High',
            current_phase: 'Planning',
            lead_auditor: 'Carlos Mendes',
            auditor_id: user?.id || 'system',
            planned_start_date: new Date('2024-03-01'),
            planned_end_date: new Date('2024-04-30'),
            fieldwork_start_date: null,
            fieldwork_end_date: null,
            report_due_date: new Date('2024-05-15'),
            budgeted_hours: 200,
            actual_hours: 0,
            estimated_cost: 30000.00,
            actual_cost: 0,
            overall_opinion: null,
            overall_rating: null,
            executive_summary: null,
            key_findings_summary: null,
            objectives: ['Avaliar controles de segurança da informação', 'Verificar compliance com políticas de segurança', 'Identificar vulnerabilidades'],
            audit_criteria: ['Política de Segurança da Informação', 'ISO 27001', 'LGPD'],
            auditee_contacts: ['Roberto Silva - CISO', 'Marina Costa - Gerente de TI'],
            auditors: ['Carlos Mendes - Auditor de TI', 'Ana Paula - Especialista em Segurança'],
            confidentiality_level: 'Restricted',
            follow_up_required: true,
            follow_up_date: null,
            findings: [],
            created_by: user?.id || 'system',
            created_at: new Date(),
            updated_at: new Date()
          }
        ];

        setAudits(mockAudits);
        setFilteredAudits(mockAudits);
        setSortedAudits(mockAudits);
      } catch (error) {
        console.error('Error fetching audits:', error);
        toast.error('Erro ao carregar auditorias');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAudits();
  }, [user?.id]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = audits;

    if (searchTerm) {
      filtered = filtered.filter(audit => 
        audit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audit.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audit.lead_auditor?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(audit => audit.audit_type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(audit => audit.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(audit => audit.priority === priorityFilter);
    }

    if (phaseFilter !== 'all') {
      filtered = filtered.filter(audit => audit.current_phase === phaseFilter);
    }

    setFilteredAudits(filtered);
    setSortedAudits(filtered);
  }, [audits, searchTerm, typeFilter, statusFilter, priorityFilter, phaseFilter]);

  const handleCreateAudit = async (data: any) => {
    setIsCreating(true);
    try {
      // Mock create - substituir por chamada real à API
      const newAudit: Audit = {
        id: Date.now().toString(),
        ...data,
        created_by: user?.id || 'system',
        created_at: new Date(),
        updated_at: new Date(),
        findings: []
      };
      
      setAudits(prev => [...prev, newAudit]);
      setIsDialogOpen(false);
      toast.success('Auditoria criada com sucesso');
    } catch (error) {
      console.error('Error creating audit:', error);
      toast.error('Erro ao criar auditoria');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateAudit = async (id: string, updates: any) => {
    setIsUpdating(true);
    try {
      // Mock update - substituir por chamada real à API
      setAudits(prev => prev.map(audit => 
        audit.id === id 
          ? { ...audit, ...updates, updated_at: new Date() }
          : audit
      ));
      toast.success('Auditoria atualizada com sucesso');
    } catch (error) {
      console.error('Error updating audit:', error);
      toast.error('Erro ao atualizar auditoria');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAudit = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta auditoria?')) return;
    
    setIsDeleting(true);
    try {
      // Mock delete - substituir por chamada real à API
      setAudits(prev => prev.filter(audit => audit.id !== id));
      setSortedAudits(prev => prev.filter(audit => audit.id !== id));
      toast.success('Auditoria excluída com sucesso');
    } catch (error) {
      console.error('Error deleting audit:', error);
      toast.error('Erro ao excluir auditoria');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setEditingAudit(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setSortedAudits((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Estatísticas resumidas
  const stats = {
    total: audits.length,
    active: audits.filter(a => ['Planning', 'Fieldwork', 'Review'].includes(a.status)).length,
    completed: audits.filter(a => a.status === 'Closed').length,
    overdue: audits.filter(a => 
      a.planned_end_date && 
      new Date(a.planned_end_date) < new Date() && 
      a.status !== 'Closed'
    ).length,
    totalCost: audits.reduce((sum, a) => sum + (a.actual_cost || a.estimated_cost || 0), 0),
    avgProgress: audits.length > 0 
      ? Math.round(audits.reduce((sum, a) => {
          const phases = ['Planning', 'Risk Assessment', 'Control Testing', 'Substantive Testing', 'Reporting', 'Follow-up', 'Closure'];
          const currentIndex = phases.indexOf(a.current_phase);
          return sum + (currentIndex >= 0 ? ((currentIndex + 1) / phases.length) * 100 : 0);
        }, 0) / audits.length)
      : 0
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando auditorias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Gestão de Auditoria</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gerencie e monitore todas as auditorias internas e externas
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
          Nova Auditoria
        </button>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAudit ? 'Editar Auditoria' : 'Nova Auditoria'}
              </DialogTitle>
              <DialogDescription>
                Crie uma nova auditoria para acompanhar o processo de avaliação e controle.
              </DialogDescription>
            </DialogHeader>
            
            {/* Form content would go here - simplified for now */}
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Formulário de criação/edição de auditorias será implementado aqui.
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
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">auditorias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">em andamento</p>
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
            <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.avgProgress}%</div>
            <p className="text-xs text-muted-foreground">conclusão</p>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pesquisar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar auditorias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="Internal Audit">Auditoria Interna</SelectItem>
                  <SelectItem value="External Audit">Auditoria Externa</SelectItem>
                  <SelectItem value="Regulatory Audit">Auditoria Regulatória</SelectItem>
                  <SelectItem value="IT Audit">Auditoria de TI</SelectItem>
                  <SelectItem value="Financial Audit">Auditoria Financeira</SelectItem>
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
                  <SelectItem value="Fieldwork">Trabalho de Campo</SelectItem>
                  <SelectItem value="Review">Revisão</SelectItem>
                  <SelectItem value="Reporting">Relatório</SelectItem>
                  <SelectItem value="Closed">Concluída</SelectItem>
                  <SelectItem value="Cancelled">Cancelada</SelectItem>
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Fase</label>
              <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as fases" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as fases</SelectItem>
                  <SelectItem value="Planning">Planejamento</SelectItem>
                  <SelectItem value="Risk Assessment">Avaliação de Risco</SelectItem>
                  <SelectItem value="Control Testing">Teste de Controles</SelectItem>
                  <SelectItem value="Substantive Testing">Testes Substantivos</SelectItem>
                  <SelectItem value="Reporting">Relatório</SelectItem>
                  <SelectItem value="Follow-up">Acompanhamento</SelectItem>
                  <SelectItem value="Closure">Encerramento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <div className="space-y-4">
        {filteredAudits.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ClipboardList className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma auditoria encontrada</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all' || phaseFilter !== 'all'
                  ? "Não há auditorias que correspondam aos filtros selecionados."
                  : "Comece criando sua primeira auditoria."}
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Auditoria
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
              items={sortedAudits.map(a => a.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {sortedAudits.map((audit) => (
                  <SortableAuditCard
                    key={audit.id}
                    audit={audit}
                    onUpdate={handleUpdateAudit}
                    onDelete={handleDeleteAudit}
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

export default AuditReportsPage;