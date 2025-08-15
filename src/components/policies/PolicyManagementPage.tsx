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
  Archive
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { usePolicyManagement } from '@/hooks/usePolicyManagement';
import PolicyCard from './PolicyCard';
import SortablePolicyCard from './SortablePolicyCard';
import PolicyForm from './PolicyForm';
import type { 
  Policy, 
  PolicyFilters, 
  PolicyCategory, 
  PolicyStatus, 
  DocumentType 
} from '@/types/policy-management';
import { POLICY_CATEGORIES, POLICY_STATUSES, DOCUMENT_TYPES } from '@/types/policy-management';

const PolicyManagementPage = () => {
  const { user } = useAuth();
  const {
    policies,
    profiles,
    createPolicy,
    updatePolicy,
    deletePolicy,
    getMetrics,
    filterPolicies,
    isCreatingPolicy,
    isUpdatingPolicy,
    isDeletingPolicy,
    isPoliciesLoading,
    policiesError
  } = usePolicyManagement();

  // Estados principais
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [sortedPolicies, setSortedPolicies] = useState<Policy[]>([]);
  const [isCardView, setIsCardView] = useState(true);

  // Estados de filtro
  const [filters, setFilters] = useState<PolicyFilters>({
    search_term: '',
    categories: [],
    statuses: [],
    document_types: [],
    show_expired: true,
    show_upcoming_reviews: false
  });

  // Atualizar políticas ordenadas quando as políticas mudarem
  useEffect(() => {
    const filtered = filterPolicies(filters);
    setSortedPolicies(filtered);
  }, [policies, filters, filterPolicies]);

  // Configuração do drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const metrics = getMetrics();

  // FUNÇÕES DE MANIPULAÇÃO

  const handleCreatePolicy = async (data: any) => {
    try {
      await createPolicy({
        ...data,
        created_by: user?.id
      });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao criar política:', error);
    }
  };

  const handleUpdatePolicy = async (policyId: string, updates: any) => {
    try {
      await updatePolicy({ 
        id: policyId, 
        updates: {
          ...updates,
          updated_by: user?.id
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar política:', error);
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta política? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      await deletePolicy(policyId);
    } catch (error) {
      console.error('Erro ao excluir política:', error);
    }
  };

  const handleEdit = (policy: Policy) => {
    setEditingPolicy(policy);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingPolicy(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSortedPolicies((policies) => {
        const oldIndex = policies.findIndex((policy) => policy.id === active.id);
        const newIndex = policies.findIndex((policy) => policy.id === over.id);

        return arrayMove(policies, oldIndex, newIndex);
      });
    }
  };

  // FUNÇÕES DE FILTRO

  const updateFilter = (key: keyof PolicyFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search_term: '',
      categories: [],
      statuses: [],
      document_types: [],
      show_expired: true,
      show_upcoming_reviews: false
    });
  };

  const hasActiveFilters = () => {
    return !!(
      filters.search_term ||
      (filters.categories && filters.categories.length > 0) ||
      (filters.statuses && filters.statuses.length > 0) ||
      (filters.document_types && filters.document_types.length > 0) ||
      !filters.show_expired ||
      filters.show_upcoming_reviews
    );
  };

  // FUNÇÕES AUXILIARES

  const getStatusColor = (status: PolicyStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'archived': return 'bg-gray-100 text-gray-600';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: PolicyStatus) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'pending_approval': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      case 'archived': return <Archive className="h-4 w-4" />;
      case 'under_review': return <Eye className="h-4 w-4" />;
      case 'expired': return <CalendarIcon className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // Verificar se há erros ou loading
  if (isPoliciesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando políticas...</p>
        </div>
      </div>
    );
  }

  if (policiesError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-2">Erro ao carregar políticas</div>
          <p className="text-sm text-gray-500">{policiesError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Gestão de Políticas e Procedimentos</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gerencie políticas corporativas, fluxos de aprovação e conformidade
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCardView(!isCardView)}
          >
            {isCardView ? <BarChart3 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
            {isCardView ? 'Visão Lista' : 'Visão Cards'}
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Política
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPolicy ? 'Editar Política' : 'Nova Política'}
                </DialogTitle>
                <DialogDescription>
                  {editingPolicy 
                    ? 'Edite as informações da política existente'
                    : 'Crie uma nova política corporativa'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <PolicyForm
                policy={editingPolicy || undefined}
                profiles={profiles}
                onSubmit={editingPolicy ? 
                  (data) => handleUpdatePolicy(editingPolicy.id, data) : 
                  handleCreatePolicy
                }
                onCancel={() => setIsDialogOpen(false)}
                isSubmitting={isCreatingPolicy || isUpdatingPolicy}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_policies}</div>
            <p className="text-xs text-muted-foreground">políticas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rascunhos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{metrics.policies_by_status.draft || 0}</div>
            <p className="text-xs text-muted-foreground">em elaboração</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aguardando</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{metrics.pending_approvals}</div>
            <p className="text-xs text-muted-foreground">aprovação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.policies_by_status.approved || 0}</div>
            <p className="text-xs text-muted-foreground">ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revisões</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.upcoming_reviews}</div>
            <p className="text-xs text-muted-foreground">próximas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{Math.round(metrics.compliance_rate)}%</div>
            <p className="text-xs text-muted-foreground">conformidade</p>
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
                  placeholder="Buscar políticas..."
                  value={filters.search_term || ''}
                  onChange={(e) => updateFilter('search_term', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select 
                value={filters.categories?.[0] || 'all'} 
                onValueChange={(value) => updateFilter('categories', value === 'all' ? [] : [value as PolicyCategory])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {Object.keys(POLICY_CATEGORIES).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select 
                value={filters.statuses?.[0] || 'all'} 
                onValueChange={(value) => updateFilter('statuses', value === 'all' ? [] : [value as PolicyStatus])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {Object.entries(POLICY_STATUSES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label.split(' - ')[0]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select 
                value={filters.document_types?.[0] || 'all'} 
                onValueChange={(value) => updateFilter('document_types', value === 'all' ? [] : [value as DocumentType])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {Object.keys(DOCUMENT_TYPES).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.show_upcoming_reviews}
                onChange={(e) => updateFilter('show_upcoming_reviews', e.target.checked)}
              />
              <span className="text-sm">Revisões próximas (30 dias)</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={!filters.show_expired}
                onChange={(e) => updateFilter('show_expired', !e.target.checked)}
              />
              <span className="text-sm">Ocultar expiradas</span>
            </label>
            
            {hasActiveFilters() && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <div className="space-y-4">
        {sortedPolicies.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma política encontrada</h3>
              <p className="text-muted-foreground text-center mb-4">
                {hasActiveFilters()
                  ? "Não há políticas que correspondam aos filtros selecionados."
                  : "Comece criando sua primeira política."}
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Política
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {isCardView ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={sortedPolicies.map(policy => policy.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  {sortedPolicies.map((policy) => (
                    <SortablePolicyCard
                      key={policy.id}
                      policy={policy}
                      onUpdate={handleUpdatePolicy}
                      onDelete={handleDeletePolicy}
                      isUpdating={isUpdatingPolicy}
                      isDeleting={isDeletingPolicy}
                      canEdit={true}
                      canDelete={true}
                      canApprove={true}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              <div className="space-y-4">
                {sortedPolicies.map((policy) => (
                  <PolicyCard
                    key={policy.id}
                    policy={policy}
                    onUpdate={handleUpdatePolicy}
                    onDelete={handleDeletePolicy}
                    isUpdating={isUpdatingPolicy}
                    isDeleting={isDeletingPolicy}
                    canEdit={true}
                    canDelete={true}
                    canApprove={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyManagementPage;