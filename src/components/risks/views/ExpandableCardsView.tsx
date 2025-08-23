import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  ChevronDown,
  ChevronUp,
  Edit,
  Save,
  X,
  Calendar,
  User,
  Users,
  Target,
  AlertTriangle,
  FileText,
  Clock,
  Tag,
  BarChart3,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Trash2,
  Eye,
  Search,
  Calculator,
  Shield,
  Clipboard,
  MessageSquare,
  Activity,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import type { Risk, RiskFilters, RiskStatus } from '@/types/risk-management';

interface ExpandableCardsViewProps {
  risks: Risk[];
  searchTerm: string;
  filters?: RiskFilters;
  onUpdate: (riskId: string, data: any) => void;
  onDelete: (riskId: string) => void;
}

type SortField = 'name' | 'category' | 'riskLevel' | 'riskScore' | 'status' | 'createdAt' | 'dueDate';
type SortDirection = 'asc' | 'desc';

export const ExpandableCardsView: React.FC<ExpandableCardsViewProps> = ({
  risks,
  searchTerm,
  filters = {},
  onUpdate,
  onDelete
}) => {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [editingCards, setEditingCards] = useState<Set<string>>(new Set());
  const [editForms, setEditForms] = useState<Record<string, any>>({});
  const [savingCards, setSavingCards] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const { toast } = useToast();
  const { tenantSettings, isMatrix4x4, getRiskLevels } = useTenantSettings();

  // Opções para dropdowns
  const statusOptions: RiskStatus[] = ['Identificado', 'Avaliado', 'Em Tratamento', 'Monitorado', 'Fechado', 'Reaberto'];
  const categoryOptions = ['Operacional', 'Financeiro', 'Tecnológico', 'Regulatório', 'Reputacional', 'Estratégico', 'Ambiental', 'Compliance', 'Mercado', 'Legal'];
  const treatmentOptions = ['Mitigar', 'Transferir', 'Evitar', 'Aceitar'];

  // Filtrar e ordenar riscos
  const processedRisks = useMemo(() => {
    let filtered = risks.filter(risk => {
      // Busca por termo
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!risk.name.toLowerCase().includes(term) &&
            !risk.description?.toLowerCase().includes(term) &&
            !risk.category.toLowerCase().includes(term) &&
            !risk.assignedTo?.toLowerCase().includes(term)) {
          return false;
        }
      }

      // Aplicar filtros
      if (filters?.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(risk.category)) return false;
      }

      if (filters?.levels && filters.levels.length > 0) {
        if (!filters.levels.includes(risk.riskLevel)) return false;
      }

      if (filters?.statuses && filters.statuses.length > 0) {
        if (!filters.statuses.includes(risk.status)) return false;
      }

      if (filters?.showOverdue) {
        const now = new Date();
        if (!risk.dueDate || risk.dueDate > now || risk.status === 'Fechado') {
          return false;
        }
      }

      return true;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Tratamento especial para datas
      if (sortField === 'createdAt' || sortField === 'dueDate') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      // Tratamento especial para texto
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [risks, searchTerm, filters, sortField, sortDirection]);

  const toggleExpanded = (riskId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(riskId)) {
      newExpanded.delete(riskId);
    } else {
      newExpanded.add(riskId);
    }
    setExpandedCards(newExpanded);
  };

  const startEditing = (risk: Risk) => {
    const newEditing = new Set(editingCards);
    newEditing.add(risk.id);
    setEditingCards(newEditing);

    // Inicializar form de edição com todos os campos
    setEditForms(prev => ({
      ...prev,
      [risk.id]: {
        // Identificação
        name: risk.name,
        description: risk.description || '',
        source: risk.source || '',
        identificationDate: risk.identificationDate ? new Date(risk.identificationDate).toISOString().split('T')[0] : '',
        
        // Classificação
        category: risk.category,
        subcategory: risk.subcategory || '',
        riskType: risk.riskType || '',
        nature: risk.nature || '',
        temporality: risk.temporality || '',
        tags: risk.tags || '',
        department: risk.department || '',
        relatedProcess: risk.relatedProcess || '',
        regulations: risk.regulations || '',
        
        // Análise
        probability: risk.probability,
        impact: risk.impact,
        causes: risk.causes || '',
        consequences: risk.consequences || '',
        
        // Avaliação
        evaluationCriteria: risk.evaluationCriteria || '',
        tolerance: risk.tolerance || '',
        
        // Tratamento
        treatmentType: risk.treatmentType || 'Mitigar',
        status: risk.status,
        actionPlan: risk.actionPlan || '',
        assignedTo: risk.assignedTo || '',
        dueDate: risk.dueDate ? new Date(risk.dueDate).toISOString().split('T')[0] : '',
        
        // Monitoramento
        indicators: risk.indicators || '',
        reviewFrequency: risk.reviewFrequency || '',
        nextReview: risk.nextReview ? new Date(risk.nextReview).toISOString().split('T')[0] : '',
        existingControls: risk.existingControls || '',
        
        // Comunicação
        stakeholders: risk.stakeholders || '',
        communicationPlan: risk.communicationPlan || '',
        communicationChannel: risk.communicationChannel || '',
        
        // Revisão
        lessonsLearned: risk.lessonsLearned || '',
        reviewStatus: risk.reviewStatus || '',
        controlEffectiveness: risk.controlEffectiveness || ''
      }
    }));

    // Expandir card automaticamente ao editar
    const newExpanded = new Set(expandedCards);
    newExpanded.add(risk.id);
    setExpandedCards(newExpanded);
  };

  const cancelEditing = (riskId: string) => {
    const newEditing = new Set(editingCards);
    newEditing.delete(riskId);
    setEditingCards(newEditing);

    // Remover form de edição
    setEditForms(prev => {
      const newForms = { ...prev };
      delete newForms[riskId];
      return newForms;
    });
  };

  const saveEditing = async (riskId: string) => {
    const formData = editForms[riskId];
    if (!formData) return;

    // Mostrar estado de carregamento
    const newSaving = new Set(savingCards);
    newSaving.add(riskId);
    setSavingCards(newSaving);

    try {
      // Preparar dados completos para atualização
      const updateData: any = {
        // Identificação
        name: formData.name,
        description: formData.description,
        source: formData.source,
        
        // Análise - Incluindo metodologia
        analysisMethodology: formData.analysisMethodology,
        probability: parseInt(formData.probability) || 1,
        impact: parseInt(formData.impact) || 1,
        causes: formData.causes,
        consequences: formData.consequences,
        evaluationCriteria: formData.evaluationCriteria,
        tolerance: formData.tolerance,
        
        // Classificação - Incluindo GUT
        gut_gravity: parseInt(formData.gut_gravity) || null,
        gut_urgency: parseInt(formData.gut_urgency) || null,
        gut_tendency: parseInt(formData.gut_tendency) || null,
        category: formData.category,
        subcategory: formData.subcategory,
        riskType: formData.riskType,
        nature: formData.nature,
        temporality: formData.temporality,
        tags: formData.tags,
        department: formData.department,
        relatedProcess: formData.relatedProcess,
        regulations: formData.regulations,
        
        // Tratamento
        treatmentType: formData.treatmentType,
        status: formData.status,
        actionPlan: formData.actionPlan,
        assignedTo: formData.assignedTo,
        
        // Plano de Ação - Atividades detalhadas
        activity_1_name: formData.activity_1_name,
        activity_1_description: formData.activity_1_description,
        activity_1_responsible: formData.activity_1_responsible,
        activity_1_email: formData.activity_1_email,
        activity_1_priority: formData.activity_1_priority,
        activity_1_status: formData.activity_1_status,
        
        // Comunicação - Pessoas detalhadas
        awareness_person_1_name: formData.awareness_person_1_name,
        awareness_person_1_position: formData.awareness_person_1_position,
        awareness_person_1_email: formData.awareness_person_1_email,
        approval_person_1_name: formData.approval_person_1_name,
        approval_person_1_position: formData.approval_person_1_position,
        approval_person_1_email: formData.approval_person_1_email,
        approval_person_1_status: formData.approval_person_1_status,
        stakeholders: formData.stakeholders,
        communicationPlan: formData.communicationPlan,
        communicationChannel: formData.communicationChannel,
        
        // Monitoramento
        indicators: formData.indicators,
        reviewFrequency: formData.reviewFrequency,
        existingControls: formData.existingControls,
        lessonsLearned: formData.lessonsLearned,
        reviewStatus: formData.reviewStatus,
        controlEffectiveness: formData.controlEffectiveness,
        
        // Datas
        updatedAt: new Date()
      };

      // Processar datas
      if (formData.identificationDate) {
        updateData.identificationDate = new Date(formData.identificationDate);
      }
      if (formData.dueDate) {
        updateData.dueDate = new Date(formData.dueDate);
      }
      if (formData.nextReview) {
        updateData.nextReview = new Date(formData.nextReview);
      }
      if (formData.activity_1_due_date) {
        updateData.activity_1_due_date = new Date(formData.activity_1_due_date);
      }

      // Calcular riskScore se probabilidade ou impacto mudaram
      if (formData.probability && formData.impact) {
        updateData.riskScore = formData.probability * formData.impact;
      }

      await onUpdate(riskId, updateData);

      // Sair do modo de edição
      cancelEditing(riskId);

      toast({
        title: '✅ Risco Atualizado',
        description: 'Todas as alterações foram salvas com sucesso no banco de dados.',
      });

    } catch (error) {
      console.error('Erro ao salvar risco:', error);
      toast({
        title: '❌ Erro ao Salvar',
        description: 'Não foi possível salvar as alterações. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      // Remover estado de carregamento
      const newSaving = new Set(savingCards);
      newSaving.delete(riskId);
      setSavingCards(newSaving);
    }
  };

  const updateEditForm = (riskId: string, field: string, value: any) => {
    setEditForms(prev => ({
      ...prev,
      [riskId]: {
        ...prev[riskId],
        [field]: value
      }
    }));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  // Funções de cores e ícones
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Muito Alto':
      case 'Crítico':
        return 'border-red-500 bg-red-100 text-red-900 dark:border-red-400 dark:bg-red-950/30 dark:text-red-300';
      case 'Alto':
        return 'border-orange-500 bg-orange-100 text-orange-900 dark:border-orange-400 dark:bg-orange-950/30 dark:text-orange-300';
      case 'Médio':
        return 'border-yellow-500 bg-yellow-100 text-yellow-900 dark:border-yellow-400 dark:bg-yellow-950/30 dark:text-yellow-300';
      case 'Baixo':
        return 'border-green-500 bg-green-100 text-green-900 dark:border-green-400 dark:bg-green-950/30 dark:text-green-300';
      case 'Muito Baixo':
        return 'border-blue-500 bg-blue-100 text-blue-900 dark:border-blue-400 dark:bg-blue-950/30 dark:text-blue-300';
      default:
        return 'border-gray-500 bg-gray-100 text-gray-900 dark:border-gray-400 dark:bg-gray-950/30 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Identificado':
        return 'bg-blue-500 text-white border-blue-600';
      case 'Avaliado':
        return 'bg-purple-500 text-white border-purple-600';
      case 'Em Tratamento':
        return 'bg-indigo-500 text-white border-indigo-600';
      case 'Monitorado':
        return 'bg-teal-500 text-white border-teal-600';
      case 'Fechado':
        return 'bg-gray-500 text-white border-gray-600';
      case 'Reaberto':
        return 'bg-orange-500 text-white border-orange-600';
      default:
        return 'bg-gray-500 text-white border-gray-600';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'operacional':
        return 'bg-blue-500 text-white border-blue-600';
      case 'financeiro':
        return 'bg-green-500 text-white border-green-600';
      case 'tecnológico':
      case 'tecnologico':
        return 'bg-purple-500 text-white border-purple-600';
      case 'regulatório':
      case 'regulatorio':
        return 'bg-red-500 text-white border-red-600';
      case 'reputacional':
        return 'bg-orange-500 text-white border-orange-600';
      case 'estratégico':
      case 'estrategico':
        return 'bg-indigo-500 text-white border-indigo-600';
      case 'ambiental':
        return 'bg-emerald-500 text-white border-emerald-600';
      case 'compliance':
        return 'bg-yellow-500 text-white border-yellow-600';
      case 'mercado':
        return 'bg-cyan-500 text-white border-cyan-600';
      case 'legal':
        return 'bg-rose-500 text-white border-rose-600';
      default:
        return 'bg-gray-500 text-white border-gray-600';
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const isOverdue = (risk: Risk) => {
    if (!risk.dueDate || risk.status === 'Fechado') return false;
    return new Date(risk.dueDate) < new Date();
  };

  const handleDelete = (risk: Risk) => {
    if (confirm(`Tem certeza que deseja excluir o risco "${risk.name}"?`)) {
      onDelete(risk.id);
      toast({
        title: '🗑️ Risco Excluído',
        description: 'O risco foi removido permanentemente.',
      });
    }
  };

  const exportToCSV = () => {
    const headers = ['Nome', 'Categoria', 'Nível', 'Score', 'Status', 'Responsável', 'Criado em', 'Vencimento'];
    const csvData = processedRisks.map(risk => [
      risk.name,
      risk.category,
      risk.riskLevel,
      risk.riskScore.toString(),
      risk.status,
      risk.assignedTo || '',
      formatDate(risk.createdAt),
      formatDate(risk.dueDate)
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `riscos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: '📊 Exportação Concluída',
      description: 'Os dados foram exportados para CSV.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Riscos Detalhados</span>
              <Badge variant="secondary">{processedRisks.length} riscos</Badge>
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              {/* Ordenação */}
              <div className="flex items-center space-x-1">
                <span className="text-sm text-muted-foreground">Ordenar por:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-1"
                >
                  <span>Nome</span>
                  {getSortIcon('name')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort('riskLevel')}
                  className="flex items-center space-x-1"
                >
                  <span>Nível</span>
                  {getSortIcon('riskLevel')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort('createdAt')}
                  className="flex items-center space-x-1"
                >
                  <span>Data</span>
                  {getSortIcon('createdAt')}
                </Button>
              </div>

              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-1" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Cards dos Riscos */}
      <div className="space-y-4">
        {processedRisks.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Nenhum risco encontrado
                </h3>
                <p className="text-gray-500">
                  {searchTerm || Object.keys(filters).length > 0 
                    ? 'Tente ajustar os filtros de busca.' 
                    : 'Não há riscos para exibir.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          processedRisks.map((risk) => {
            const isExpanded = expandedCards.has(risk.id);
            const isEditing = editingCards.has(risk.id);
            const editForm = editForms[risk.id] || {};
            const overdue = isOverdue(risk);

            return (
              <Card 
                key={risk.id} 
                className={`border-l-4 transition-all ${
                  overdue ? 'border-l-red-500 bg-red-50 dark:bg-red-950/20' : 'border-l-primary'
                } ${isExpanded ? 'shadow-md' : 'hover:shadow-sm'}`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Título e badges principais */}
                      <div className="flex items-center gap-3 mb-2">
                        {isEditing ? (
                          <Input
                            value={editForm.name || ''}
                            onChange={(e) => updateEditForm(risk.id, 'name', e.target.value)}
                            className="font-semibold text-lg flex-1"
                            placeholder="Nome do risco"
                          />
                        ) : (
                          <h3 className="font-semibold text-lg truncate">{risk.name}</h3>
                        )}
                        
                        {overdue && (
                          <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
                        )}
                      </div>

                      {/* Badges de informações */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={`${getRiskLevelColor(risk.riskLevel)} border text-xs`}>
                          {risk.riskLevel}
                        </Badge>
                        
                        {isEditing ? (
                          <Select value={editForm.category || ''} onValueChange={(value) => updateEditForm(risk.id, 'category', value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categoryOptions.map(category => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={`${getCategoryColor(risk.category)} text-xs`}>
                            {risk.category}
                          </Badge>
                        )}

                        {isEditing ? (
                          <Select value={editForm.status || ''} onValueChange={(value) => updateEditForm(risk.id, 'status', value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map(status => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={`${getStatusColor(risk.status)} text-xs`}>
                            {risk.status}
                          </Badge>
                        )}

                        <Badge variant="outline" className="text-xs">
                          Score: {risk.riskScore}
                        </Badge>
                      </div>

                      {/* Informações básicas */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {isEditing ? (
                            <Input
                              value={editForm.assignedTo || ''}
                              onChange={(e) => updateEditForm(risk.id, 'assignedTo', e.target.value)}
                              placeholder="Responsável"
                              className="text-sm"
                            />
                          ) : (
                            <span>{risk.assignedTo || 'Não atribuído'}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {isEditing ? (
                            <Input
                              type="date"
                              value={editForm.dueDate || ''}
                              onChange={(e) => updateEditForm(risk.id, 'dueDate', e.target.value)}
                              className="text-sm"
                            />
                          ) : (
                            <span className={overdue ? 'text-red-600 font-medium' : ''}>
                              {formatDate(risk.dueDate) || 'Não definido'}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Criado: {formatDate(risk.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => saveEditing(risk.id)}
                            disabled={savingCards.has(risk.id)}
                            className="relative"
                          >
                            {savingCards.has(risk.id) ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                <span className="ml-2">Salvando...</span>
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4" />
                                <span className="ml-2 hidden sm:inline">Salvar</span>
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => cancelEditing(risk.id)}
                            disabled={savingCards.has(risk.id)}
                          >
                            <X className="h-4 w-4" />
                            <span className="ml-2 hidden sm:inline">Cancelar</span>
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => startEditing(risk)}
                            className="hover:bg-blue-50 hover:border-blue-300"
                            title="Editar risco"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="ml-2 hidden lg:inline">Editar</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDelete(risk)}
                            className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                            title="Excluir risco"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="ml-2 hidden lg:inline">Excluir</span>
                          </Button>
                        </>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(risk.id)}
                        title={isExpanded ? "Recolher card" : "Expandir card"}
                        className="hover:bg-gray-100"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="border-t pt-4">
                      <Tabs defaultValue="identification" className="w-full">
                        <TabsList className="grid w-full grid-cols-7">
                          <TabsTrigger value="identification" className="flex items-center gap-1 text-xs">
                            <FileText className="h-3 w-3" />
                            Identificação
                          </TabsTrigger>
                          <TabsTrigger value="analysis" className="flex items-center gap-1 text-xs">
                            <BarChart3 className="h-3 w-3" />
                            Análise
                          </TabsTrigger>
                          <TabsTrigger value="classification" className="flex items-center gap-1 text-xs">
                            <Target className="h-3 w-3" />
                            Classificação
                          </TabsTrigger>
                          <TabsTrigger value="treatment" className="flex items-center gap-1 text-xs">
                            <Shield className="h-3 w-3" />
                            Tratamento
                          </TabsTrigger>
                          <TabsTrigger value="action-plan" className="flex items-center gap-1 text-xs">
                            <Clipboard className="h-3 w-3" />
                            Plano de Ação
                          </TabsTrigger>
                          <TabsTrigger value="communication" className="flex items-center gap-1 text-xs">
                            <MessageSquare className="h-3 w-3" />
                            Comunicação
                          </TabsTrigger>
                          <TabsTrigger value="monitoring" className="flex items-center gap-1 text-xs">
                            <Eye className="h-3 w-3" />
                            Monitoramento
                          </TabsTrigger>
                        </TabsList>

                        {/* Etapa 1: Identificação */}
                        <TabsContent value="identification" className="space-y-4 mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Nome do Risco</Label>
                              {isEditing ? (
                                <Input
                                  value={editForm.name || ''}
                                  onChange={(e) => updateEditForm(risk.id, 'name', e.target.value)}
                                  placeholder="Nome do risco"
                                />
                              ) : (
                                <p className="text-sm">{risk.name}</p>
                              )}
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Categoria</Label>
                              {isEditing ? (
                                <Select value={editForm.category || ''} onValueChange={(value) => updateEditForm(risk.id, 'category', value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categoryOptions.map(category => (
                                      <SelectItem key={category} value={category}>{category}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge className={`${getCategoryColor(risk.category)} text-xs`}>
                                  {risk.category}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium mb-2 block">Descrição</Label>
                            {isEditing ? (
                              <Textarea
                                value={editForm.description || ''}
                                onChange={(e) => updateEditForm(risk.id, 'description', e.target.value)}
                                placeholder="Descrição detalhada do risco"
                                rows={3}
                              />
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                {risk.description || 'Nenhuma descrição fornecida.'}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Fonte do Risco</Label>
                              {isEditing ? (
                                <Input
                                  value={editForm.source || ''}
                                  onChange={(e) => updateEditForm(risk.id, 'source', e.target.value)}
                                  placeholder="Ex: Auditoria interna, análise de processo"
                                />
                              ) : (
                                <p className="text-sm">{risk.source || 'Não informado'}</p>
                              )}
                            </div>

                            <div>
                              <Label className="text-sm font-medium mb-2 block">Data de Identificação</Label>
                              {isEditing ? (
                                <Input
                                  type="date"
                                  value={editForm.identificationDate || ''}
                                  onChange={(e) => updateEditForm(risk.id, 'identificationDate', e.target.value)}
                                />
                              ) : (
                                <p className="text-sm">{formatDate(risk.identificationDate) || formatDate(risk.createdAt)}</p>
                              )}
                            </div>
                          </div>
                        </TabsContent>

                        {/* Etapa 2: Classificação */}
                        <TabsContent value="classification" className="space-y-4 mt-4">
                          {/* Metodologia GUT */}
                          <div className="border rounded-lg p-4 bg-card">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Metodologia GUT (Gravidade, Urgência, Tendência)
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <Label className="text-sm font-medium mb-2 block">Gravidade (G)</Label>
                                {isEditing ? (
                                  <Select value={editForm.gut_gravity?.toString() || ''} onValueChange={(value) => updateEditForm(risk.id, 'gut_gravity', parseInt(value))}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="5">5 - Extremamente Grave</SelectItem>
                                      <SelectItem value="4">4 - Muito Grave</SelectItem>
                                      <SelectItem value="3">3 - Grave</SelectItem>
                                      <SelectItem value="2">2 - Pouco Grave</SelectItem>
                                      <SelectItem value="1">1 - Sem Gravidade</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">{risk.gut_gravity || 'N/A'}/5</Badge>
                                    <div className="text-xs text-muted-foreground">
                                      {risk.gut_gravity === 5 ? 'Extremamente Grave' :
                                       risk.gut_gravity === 4 ? 'Muito Grave' :
                                       risk.gut_gravity === 3 ? 'Grave' :
                                       risk.gut_gravity === 2 ? 'Pouco Grave' :
                                       risk.gut_gravity === 1 ? 'Sem Gravidade' : 'Não definido'}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div>
                                <Label className="text-sm font-medium mb-2 block">Urgência (U)</Label>
                                {isEditing ? (
                                  <Select value={editForm.gut_urgency?.toString() || ''} onValueChange={(value) => updateEditForm(risk.id, 'gut_urgency', parseInt(value))}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="5">5 - Ação Imediata</SelectItem>
                                      <SelectItem value="4">4 - Com Alguma Urgência</SelectItem>
                                      <SelectItem value="3">3 - Normal</SelectItem>
                                      <SelectItem value="2">2 - Pode Esperar</SelectItem>
                                      <SelectItem value="1">1 - Não Tem Pressa</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">{risk.gut_urgency || 'N/A'}/5</Badge>
                                    <div className="text-xs text-muted-foreground">
                                      {risk.gut_urgency === 5 ? 'Ação Imediata' :
                                       risk.gut_urgency === 4 ? 'Com Alguma Urgência' :
                                       risk.gut_urgency === 3 ? 'Normal' :
                                       risk.gut_urgency === 2 ? 'Pode Esperar' :
                                       risk.gut_urgency === 1 ? 'Não Tem Pressa' : 'Não definido'}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div>
                                <Label className="text-sm font-medium mb-2 block">Tendência (T)</Label>
                                {isEditing ? (
                                  <Select value={editForm.gut_tendency?.toString() || ''} onValueChange={(value) => updateEditForm(risk.id, 'gut_tendency', parseInt(value))}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="5">5 - Piorar Rapidamente</SelectItem>
                                      <SelectItem value="4">4 - Piorar a Médio Prazo</SelectItem>
                                      <SelectItem value="3">3 - Piorar a Longo Prazo</SelectItem>
                                      <SelectItem value="2">2 - Permanecer Estável</SelectItem>
                                      <SelectItem value="1">1 - Melhorar</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">{risk.gut_tendency || 'N/A'}/5</Badge>
                                    <div className="text-xs text-muted-foreground">
                                      {risk.gut_tendency === 5 ? 'Piorar Rapidamente' :
                                       risk.gut_tendency === 4 ? 'Piorar a Médio Prazo' :
                                       risk.gut_tendency === 3 ? 'Piorar a Longo Prazo' :
                                       risk.gut_tendency === 2 ? 'Permanecer Estável' :
                                       risk.gut_tendency === 1 ? 'Melhorar' : 'Não definido'}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Score GUT Calculado */}
                            <div className="border-t pt-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Score GUT:</Label>
                                <div className="flex items-center gap-2">
                                  <Badge className="text-lg px-3 py-1">
                                    {(risk.gut_gravity || 0) * (risk.gut_urgency || 0) * (risk.gut_tendency || 0)}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    ({risk.gut_gravity || 0} × {risk.gut_urgency || 0} × {risk.gut_tendency || 0})
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Categoria Principal</Label>
                              {isEditing ? (
                                <Select value={editForm.category || ''} onValueChange={(value) => updateEditForm(risk.id, 'category', value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categoryOptions.map(category => (
                                      <SelectItem key={category} value={category}>{category}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge className={`${getCategoryColor(risk.category)} text-xs`}>
                                  {risk.category}
                                </Badge>
                              )}
                            </div>

                            <div>
                              <Label className="text-sm font-medium mb-2 block">Subcategoria</Label>
                              {isEditing ? (
                                <Input
                                  value={editForm.subcategory || ''}
                                  onChange={(e) => updateEditForm(risk.id, 'subcategory', e.target.value)}
                                  placeholder="Ex: Sistemas críticos, Dados pessoais"
                                />
                              ) : (
                                <p className="text-sm">{risk.subcategory || 'Não informado'}</p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Tipo de Risco</Label>
                              {isEditing ? (
                                <Select value={editForm.riskType || ''} onValueChange={(value) => updateEditForm(risk.id, 'riskType', value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Interno">Interno</SelectItem>
                                    <SelectItem value="Externo">Externo</SelectItem>
                                    <SelectItem value="Misto">Misto</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge variant="outline">
                                  {risk.riskType || 'Não classificado'}
                                </Badge>
                              )}
                            </div>

                            <div>
                              <Label className="text-sm font-medium mb-2 block">Natureza</Label>
                              {isEditing ? (
                                <Select value={editForm.nature || ''} onValueChange={(value) => updateEditForm(risk.id, 'nature', value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Quantitativo">Quantitativo</SelectItem>
                                    <SelectItem value="Qualitativo">Qualitativo</SelectItem>
                                    <SelectItem value="Híbrido">Híbrido</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge variant="outline">
                                  {risk.nature || 'Não definido'}
                                </Badge>
                              )}
                            </div>

                            <div>
                              <Label className="text-sm font-medium mb-2 block">Temporalidade</Label>
                              {isEditing ? (
                                <Select value={editForm.temporality || ''} onValueChange={(value) => updateEditForm(risk.id, 'temporality', value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Curto Prazo">Curto Prazo (0-1 ano)</SelectItem>
                                    <SelectItem value="Médio Prazo">Médio Prazo (1-3 anos)</SelectItem>
                                    <SelectItem value="Longo Prazo">Longo Prazo (3+ anos)</SelectItem>
                                    <SelectItem value="Imediato">Imediato</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge variant="outline">
                                  {risk.temporality || 'Não definido'}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium mb-2 block">Tags/Palavras-chave</Label>
                            {isEditing ? (
                              <Input
                                value={editForm.tags || ''}
                                onChange={(e) => updateEditForm(risk.id, 'tags', e.target.value)}
                                placeholder="Ex: cibersegurança, LGPD, continuidade, fraude (separadas por vírgula)"
                              />
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {(risk.tags || '').split(',').filter(tag => tag.trim()).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag.trim()}
                                  </Badge>
                                )) || <span className="text-sm text-muted-foreground">Nenhuma tag definida</span>}
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Área/Departamento</Label>
                              {isEditing ? (
                                <Input
                                  value={editForm.department || ''}
                                  onChange={(e) => updateEditForm(risk.id, 'department', e.target.value)}
                                  placeholder="Ex: TI, RH, Financeiro, Operações"
                                />
                              ) : (
                                <p className="text-sm">{risk.department || 'Não informado'}</p>
                              )}
                            </div>

                            <div>
                              <Label className="text-sm font-medium mb-2 block">Processo Relacionado</Label>
                              {isEditing ? (
                                <Input
                                  value={editForm.relatedProcess || ''}
                                  onChange={(e) => updateEditForm(risk.id, 'relatedProcess', e.target.value)}
                                  placeholder="Ex: Gestão de TI, Atendimento ao Cliente"
                                />
                              ) : (
                                <p className="text-sm">{risk.relatedProcess || 'Não informado'}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium mb-2 block">Regulamentações Aplicáveis</Label>
                            {isEditing ? (
                              <Textarea
                                value={editForm.regulations || ''}
                                onChange={(e) => updateEditForm(risk.id, 'regulations', e.target.value)}
                                placeholder="Ex: LGPD, SOX, ISO 27001, BACEN, CVM"
                                rows={2}
                              />
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                {risk.regulations || 'Nenhuma regulamentação específica'}
                              </p>
                            )}
                          </div>
                        </TabsContent>

                        {/* Etapa 3: Análise */}
                        <TabsContent value="analysis" className="space-y-4 mt-4">
                          {/* Metodologia de Análise */}
                          <div className="border rounded-lg p-4 bg-card">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <BarChart3 className="h-4 w-4" />
                              Metodologia de Análise
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium mb-2 block">Metodologia Selecionada</Label>
                                {isEditing ? (
                                  <Select value={editForm.analysisMethodology || ''} onValueChange={(value) => updateEditForm(risk.id, 'analysisMethodology', value)}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione uma metodologia..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="qualitative">📊 Análise Qualitativa</SelectItem>
                                      <SelectItem value="quantitative">💰 Análise Quantitativa</SelectItem>
                                      <SelectItem value="semi_quantitative">⚖️ Análise Semi-Quantitativa</SelectItem>
                                      <SelectItem value="nist">🛡️ NIST Cybersecurity Framework</SelectItem>
                                      <SelectItem value="iso31000">🌐 ISO 31000</SelectItem>
                                      <SelectItem value="monte_carlo">🎲 Simulação Monte Carlo</SelectItem>
                                      <SelectItem value="fair">📈 FAIR (Factor Analysis)</SelectItem>
                                      <SelectItem value="bow_tie">🎯 Bow-Tie Analysis</SelectItem>
                                      <SelectItem value="fmea">🔧 FMEA</SelectItem>
                                      <SelectItem value="risco_si_simplificado">📋 Risco SI Simplificado</SelectItem>
                                      <SelectItem value="metodologia_fornecedor">🏢 Metodologia Fornecedor</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">
                                      {risk.analysisMethodology ? 
                                        (risk.analysisMethodology === 'qualitative' ? '📊 Análise Qualitativa' :
                                         risk.analysisMethodology === 'quantitative' ? '💰 Análise Quantitativa' :
                                         risk.analysisMethodology === 'semi_quantitative' ? '⚖️ Análise Semi-Quantitativa' :
                                         risk.analysisMethodology === 'nist' ? '🛡️ NIST Cybersecurity Framework' :
                                         risk.analysisMethodology === 'iso31000' ? '🌐 ISO 31000' :
                                         risk.analysisMethodology === 'monte_carlo' ? '🎲 Simulação Monte Carlo' :
                                         risk.analysisMethodology === 'fair' ? '📈 FAIR (Factor Analysis)' :
                                         risk.analysisMethodology === 'bow_tie' ? '🎯 Bow-Tie Analysis' :
                                         risk.analysisMethodology === 'fmea' ? '🔧 FMEA' :
                                         risk.analysisMethodology === 'risco_si_simplificado' ? '📋 Risco SI Simplificado' :
                                         risk.analysisMethodology === 'metodologia_fornecedor' ? '🏢 Metodologia Fornecedor' :
                                         risk.analysisMethodology) 
                                        : 'Não definido'}
                                    </Badge>
                                  </div>
                                )}
                              </div>

                              <div>
                                <Label className="text-sm font-medium mb-2 block">Complexidade</Label>
                                <div className="text-sm text-muted-foreground">
                                  {risk.analysisMethodology === 'qualitative' ? 'Baixa (15-30 min)' :
                                   risk.analysisMethodology === 'quantitative' ? 'Alta (45-90 min)' :
                                   risk.analysisMethodology === 'semi_quantitative' ? 'Média (30-45 min)' :
                                   risk.analysisMethodology === 'nist' ? 'Alta (60-120 min)' :
                                   risk.analysisMethodology === 'iso31000' ? 'Média (45-90 min)' :
                                   risk.analysisMethodology === 'monte_carlo' ? 'Muito Alta (120-240 min)' :
                                   risk.analysisMethodology === 'fair' ? 'Muito Alta (90-180 min)' :
                                   risk.analysisMethodology === 'bow_tie' ? 'Alta (60-120 min)' :
                                   risk.analysisMethodology === 'fmea' ? 'Alta (90-180 min)' :
                                   risk.analysisMethodology === 'risco_si_simplificado' ? 'Baixa (20-40 min)' :
                                   risk.analysisMethodology === 'metodologia_fornecedor' ? 'Média (30-60 min)' :
                                   'Não avaliado'}
                                </div>
                              </div>
                            </div>

                            {risk.analysisMethodology && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-xs text-muted-foreground">
                                  <strong>Melhor uso:</strong> {
                                    risk.analysisMethodology === 'qualitative' ? 'Riscos operacionais, processos gerais' :
                                    risk.analysisMethodology === 'quantitative' ? 'Riscos financeiros, investimentos' :
                                    risk.analysisMethodology === 'semi_quantitative' ? 'Riscos estratégicos, projetos' :
                                    risk.analysisMethodology === 'nist' ? 'Riscos de segurança cibernética, tecnologia' :
                                    risk.analysisMethodology === 'iso31000' ? 'Todos os tipos de riscos, governança' :
                                    risk.analysisMethodology === 'monte_carlo' ? 'Riscos financeiros complexos, projetos de investimento' :
                                    risk.analysisMethodology === 'fair' ? 'Riscos de segurança da informação, análise econômica' :
                                    risk.analysisMethodology === 'bow_tie' ? 'Riscos de segurança, operacionais críticos' :
                                    risk.analysisMethodology === 'fmea' ? 'Processos técnicos, manufatura' :
                                    risk.analysisMethodology === 'risco_si_simplificado' ? 'Avaliação rápida e estruturada, riscos de TI' :
                                    risk.analysisMethodology === 'metodologia_fornecedor' ? 'Avaliação de riscos de fornecedores e terceiros' :
                                    'Uso geral'
                                  }
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Probabilidade ({risk.probability}/5)</Label>
                              {isEditing ? (
                                <div className="space-y-2">
                                  <Select value={editForm.probability?.toString() || ''} onValueChange={(value) => updateEditForm(risk.id, 'probability', parseInt(value))}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1">1 - Muito Baixa</SelectItem>
                                      <SelectItem value="2">2 - Baixa</SelectItem>
                                      <SelectItem value="3">3 - Média</SelectItem>
                                      <SelectItem value="4">4 - Alta</SelectItem>
                                      <SelectItem value="5">5 - Muito Alta</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{risk.probability}/5</Badge>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-500 h-2 rounded-full" 
                                      style={{ width: `${(risk.probability / 5) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            <div>
                              <Label className="text-sm font-medium mb-2 block">Impacto ({risk.impact}/5)</Label>
                              {isEditing ? (
                                <Select value={editForm.impact?.toString() || ''} onValueChange={(value) => updateEditForm(risk.id, 'impact', parseInt(value))}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1">1 - Muito Baixo</SelectItem>
                                    <SelectItem value="2">2 - Baixo</SelectItem>
                                    <SelectItem value="3">3 - Médio</SelectItem>
                                    <SelectItem value="4">4 - Alto</SelectItem>
                                    <SelectItem value="5">5 - Muito Alto</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{risk.impact}/5</Badge>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-orange-500 h-2 rounded-full" 
                                      style={{ width: `${(risk.impact / 5) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium mb-2 block">Causas do Risco</Label>
                            {isEditing ? (
                              <Textarea
                                value={editForm.causes || ''}
                                onChange={(e) => updateEditForm(risk.id, 'causes', e.target.value)}
                                placeholder="Descreva as principais causas que podem originar este risco"
                                rows={2}
                              />
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                {risk.causes || 'Não informado'}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label className="text-sm font-medium mb-2 block">Consequências</Label>
                            {isEditing ? (
                              <Textarea
                                value={editForm.consequences || ''}
                                onChange={(e) => updateEditForm(risk.id, 'consequences', e.target.value)}
                                placeholder="Descreva os possíveis impactos e consequências"
                                rows={2}
                              />
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                {risk.consequences || 'Não informado'}
                              </p>
                            )}
                          </div>
                        </TabsContent>


                        {/* Etapa 4: Tratamento */}
                        <TabsContent value="treatment" className="space-y-4 mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Estratégia de Tratamento</Label>
                              {isEditing ? (
                                <Select value={editForm.treatmentType || ''} onValueChange={(value) => updateEditForm(risk.id, 'treatmentType', value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Mitigar">Mitigar - Reduzir probabilidade/impacto</SelectItem>
                                    <SelectItem value="Transferir">Transferir - Compartilhar com terceiros</SelectItem>
                                    <SelectItem value="Evitar">Evitar - Eliminar a atividade de risco</SelectItem>
                                    <SelectItem value="Aceitar">Aceitar - Assumir o risco</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge variant="outline" className="text-sm">
                                  {risk.treatmentType || 'Não definido'}
                                </Badge>
                              )}
                            </div>

                            <div>
                              <Label className="text-sm font-medium mb-2 block">Status do Tratamento</Label>
                              {isEditing ? (
                                <Select value={editForm.status || ''} onValueChange={(value) => updateEditForm(risk.id, 'status', value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {statusOptions.map(status => (
                                      <SelectItem key={status} value={status}>{status}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge className={`${getStatusColor(risk.status)} text-xs`}>
                                  {risk.status}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium mb-2 block">Plano de Ação</Label>
                            {isEditing ? (
                              <Textarea
                                value={editForm.actionPlan || ''}
                                onChange={(e) => updateEditForm(risk.id, 'actionPlan', e.target.value)}
                                placeholder="Descreva as ações específicas para tratar este risco"
                                rows={3}
                              />
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                {risk.actionPlan || 'Nenhum plano de ação definido'}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Responsável</Label>
                              {isEditing ? (
                                <Input
                                  value={editForm.assignedTo || ''}
                                  onChange={(e) => updateEditForm(risk.id, 'assignedTo', e.target.value)}
                                  placeholder="Nome do responsável"
                                />
                              ) : (
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{risk.assignedTo || 'Não atribuído'}</span>
                                </div>
                              )}
                            </div>

                            <div>
                              <Label className="text-sm font-medium mb-2 block">Prazo</Label>
                              {isEditing ? (
                                <Input
                                  type="date"
                                  value={editForm.dueDate || ''}
                                  onChange={(e) => updateEditForm(risk.id, 'dueDate', e.target.value)}
                                />
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className={`text-sm ${overdue ? 'text-red-600 font-medium' : ''}`}>
                                    {formatDate(risk.dueDate) || 'Não definido'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TabsContent>

                        {/* Etapa 5: Plano de Ação */}
                        <TabsContent value="action-plan" className="space-y-4 mt-4">
                          {/* Atividades do Plano de Ação */}
                          <div className="border rounded-lg p-4 bg-card">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Clipboard className="h-4 w-4" />
                              Atividades do Plano de Ação
                            </h4>
                            
                            {/* Lista de Atividades */}
                            <div className="space-y-3">
                              {/* Atividade 1 */}
                              <div className="border rounded p-3 bg-card border-green-200 dark:border-green-800">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                  <div>
                                    <Label className="text-sm font-medium mb-1 block">Nome da Atividade</Label>
                                    {isEditing ? (
                                      <Input
                                        value={editForm.activity_1_name || ''}
                                        onChange={(e) => updateEditForm(risk.id, 'activity_1_name', e.target.value)}
                                        placeholder="Ex: Implementar controles de segurança"
                                      />
                                    ) : (
                                      <p className="text-sm text-gray-900 dark:text-gray-100">{risk.activity_1_name || 'Atividade não definida'}</p>
                                    )}
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium mb-1 block">Prioridade</Label>
                                    {isEditing ? (
                                      <Select value={editForm.activity_1_priority || ''} onValueChange={(value) => updateEditForm(risk.id, 'activity_1_priority', value)}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="low">🟢 Baixa</SelectItem>
                                          <SelectItem value="medium">🟡 Média</SelectItem>
                                          <SelectItem value="high">🟠 Alta</SelectItem>
                                          <SelectItem value="critical">🔴 Crítica</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    ) : (
                                      <Badge variant="outline">
                                        {risk.activity_1_priority === 'low' ? '🟢 Baixa' :
                                         risk.activity_1_priority === 'medium' ? '🟡 Média' :
                                         risk.activity_1_priority === 'high' ? '🟠 Alta' :
                                         risk.activity_1_priority === 'critical' ? '🔴 Crítica' : 'Não definida'}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                  <div>
                                    <Label className="text-sm font-medium mb-1 block">Responsável</Label>
                                    {isEditing ? (
                                      <Input
                                        value={editForm.activity_1_responsible || ''}
                                        onChange={(e) => updateEditForm(risk.id, 'activity_1_responsible', e.target.value)}
                                        placeholder="Nome do responsável"
                                      />
                                    ) : (
                                      <p className="text-sm text-gray-900 dark:text-gray-100">{risk.activity_1_responsible || 'Não atribuído'}</p>
                                    )}
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium mb-1 block">E-mail</Label>
                                    {isEditing ? (
                                      <Input
                                        value={editForm.activity_1_email || ''}
                                        onChange={(e) => updateEditForm(risk.id, 'activity_1_email', e.target.value)}
                                        placeholder="email@empresa.com"
                                      />
                                    ) : (
                                      <p className="text-sm text-gray-900 dark:text-gray-100">{risk.activity_1_email || 'Não informado'}</p>
                                    )}
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium mb-1 block">Prazo</Label>
                                    {isEditing ? (
                                      <Input
                                        type="date"
                                        value={editForm.activity_1_due_date || ''}
                                        onChange={(e) => updateEditForm(risk.id, 'activity_1_due_date', e.target.value)}
                                      />
                                    ) : (
                                      <p className="text-sm text-gray-900 dark:text-gray-100">{formatDate(risk.activity_1_due_date) || 'Não definido'}</p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="mb-3">
                                  <Label className="text-sm font-medium mb-1 block">Descrição da Atividade</Label>
                                  {isEditing ? (
                                    <Textarea
                                      value={editForm.activity_1_description || ''}
                                      onChange={(e) => updateEditForm(risk.id, 'activity_1_description', e.target.value)}
                                      placeholder="Descreva detalhadamente esta atividade"
                                      rows={2}
                                    />
                                  ) : (
                                    <p className="text-sm text-muted-foreground">{risk.activity_1_description || 'Nenhuma descrição'}</p>
                                  )}
                                </div>
                                
                                <div>
                                  <Label className="text-sm font-medium mb-1 block">Status</Label>
                                  {isEditing ? (
                                    <Select value={editForm.activity_1_status || ''} onValueChange={(value) => updateEditForm(risk.id, 'activity_1_status', value)}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">⏳ Pendente</SelectItem>
                                        <SelectItem value="in_progress">🔄 Em Andamento</SelectItem>
                                        <SelectItem value="completed">✅ Concluída</SelectItem>
                                        <SelectItem value="cancelled">❌ Cancelada</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <Badge variant="outline">
                                      {risk.activity_1_status === 'pending' ? '⏳ Pendente' :
                                       risk.activity_1_status === 'in_progress' ? '🔄 Em Andamento' :
                                       risk.activity_1_status === 'completed' ? '✅ Concluída' :
                                       risk.activity_1_status === 'cancelled' ? '❌ Cancelada' : 'Não definido'}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Nota para adicionar mais atividades */}
                              <div className="text-center p-4 border-2 border-dashed border-muted-foreground/20 rounded">
                                <p className="text-sm text-muted-foreground">
                                  💡 <strong>Dica:</strong> Para adicionar mais atividades, use o formulário completo de registro de riscos ou edite no banco de dados
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Responsável</Label>
                              {isEditing ? (
                                <Input
                                  value={editForm.assignedTo || ''}
                                  onChange={(e) => updateEditForm(risk.id, 'assignedTo', e.target.value)}
                                  placeholder="Nome do responsável"
                                />
                              ) : (
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{risk.assignedTo || 'Não atribuído'}</span>
                                </div>
                              )}
                            </div>

                            <div>
                              <Label className="text-sm font-medium mb-2 block">Prazo para Conclusão</Label>
                              {isEditing ? (
                                <Input
                                  type="date"
                                  value={editForm.dueDate || ''}
                                  onChange={(e) => updateEditForm(risk.id, 'dueDate', e.target.value)}
                                />
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className={`text-sm ${overdue ? 'text-red-600 font-medium' : ''}`}>
                                    {formatDate(risk.dueDate) || 'Não definido'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium mb-2 block">Status do Plano</Label>
                            {isEditing ? (
                              <Select value={editForm.status || ''} onValueChange={(value) => updateEditForm(risk.id, 'status', value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {statusOptions.map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge className={`${getStatusColor(risk.status)} text-xs`}>
                                {risk.status}
                              </Badge>
                            )}
                          </div>

                          {/* Progresso visual */}
                          <div className="border rounded-lg p-4 bg-card">
                            <div className="flex justify-between items-center mb-2">
                              <Label className="text-sm font-medium">Progresso das Ações</Label>
                              <span className="text-sm text-muted-foreground">
                                {risk.status === 'Fechado' ? '100%' : 
                                 risk.status === 'Monitorado' ? '75%' :
                                 risk.status === 'Em Tratamento' ? '50%' :
                                 risk.status === 'Avaliado' ? '25%' : '0%'}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${
                                  risk.status === 'Fechado' ? 'bg-green-500 w-full' :
                                  risk.status === 'Monitorado' ? 'bg-blue-500 w-3/4' :
                                  risk.status === 'Em Tratamento' ? 'bg-yellow-500 w-1/2' :
                                  risk.status === 'Avaliado' ? 'bg-orange-500 w-1/4' : 'bg-gray-400 w-0'
                                }`}
                              />
                            </div>
                          </div>
                        </TabsContent>

                        {/* Etapa 6: Comunicação */}
                        <TabsContent value="communication" className="space-y-4 mt-4">
                          {/* Stakeholders para Comunicação */}
                          <div className="border rounded-lg p-4 bg-card">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Pessoas que devem ser comunicadas
                            </h4>
                            
                            <div className="space-y-4">
                              {/* Para Ciência */}
                              <div>
                                <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                                  <Eye className="h-3 w-3" />
                                  Para Ciência (Awareness)
                                </h5>
                                <div className="space-y-2">
                                  {/* Pessoa 1 para ciência */}
                                  <div className="border rounded p-3 bg-card border-blue-200 dark:border-blue-800">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                      <div>
                                        <Label className="text-xs font-medium mb-1 block">Nome</Label>
                                        {isEditing ? (
                                          <Input
                                            value={editForm.awareness_person_1_name || ''}
                                            onChange={(e) => updateEditForm(risk.id, 'awareness_person_1_name', e.target.value)}
                                            placeholder="Nome completo"
                                          />
                                        ) : (
                                          <p className="text-sm">{risk.awareness_person_1_name || 'Não informado'}</p>
                                        )}
                                      </div>
                                      <div>
                                        <Label className="text-xs font-medium mb-1 block">Cargo</Label>
                                        {isEditing ? (
                                          <Input
                                            value={editForm.awareness_person_1_position || ''}
                                            onChange={(e) => updateEditForm(risk.id, 'awareness_person_1_position', e.target.value)}
                                            placeholder="Ex: Gerente de TI"
                                          />
                                        ) : (
                                          <p className="text-sm">{risk.awareness_person_1_position || 'Não informado'}</p>
                                        )}
                                      </div>
                                      <div>
                                        <Label className="text-xs font-medium mb-1 block">E-mail</Label>
                                        {isEditing ? (
                                          <Input
                                            value={editForm.awareness_person_1_email || ''}
                                            onChange={(e) => updateEditForm(risk.id, 'awareness_person_1_email', e.target.value)}
                                            placeholder="email@empresa.com"
                                          />
                                        ) : (
                                          <p className="text-sm">{risk.awareness_person_1_email || 'Não informado'}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Para Aprovação */}
                              <div>
                                <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                                  <Shield className="h-3 w-3" />
                                  Para Aprovação (Approval)
                                </h5>
                                <div className="space-y-2">
                                  {/* Pessoa 1 para aprovação */}
                                  <div className="border rounded p-3 bg-card border-orange-200 dark:border-orange-800">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                      <div>
                                        <Label className="text-xs font-medium mb-1 block">Nome</Label>
                                        {isEditing ? (
                                          <Input
                                            value={editForm.approval_person_1_name || ''}
                                            onChange={(e) => updateEditForm(risk.id, 'approval_person_1_name', e.target.value)}
                                            placeholder="Nome completo"
                                          />
                                        ) : (
                                          <p className="text-sm">{risk.approval_person_1_name || 'Não informado'}</p>
                                        )}
                                      </div>
                                      <div>
                                        <Label className="text-xs font-medium mb-1 block">Cargo</Label>
                                        {isEditing ? (
                                          <Select value={editForm.approval_person_1_position || ''} onValueChange={(value) => updateEditForm(risk.id, 'approval_person_1_position', value)}>
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="CEO / Presidente">CEO / Presidente</SelectItem>
                                              <SelectItem value="CFO / Diretor Financeiro">CFO / Diretor Financeiro</SelectItem>
                                              <SelectItem value="CRO / Chief Risk Officer">CRO / Chief Risk Officer</SelectItem>
                                              <SelectItem value="CISO / Chief Information Security Officer">CISO</SelectItem>
                                              <SelectItem value="Diretor de Compliance">Diretor de Compliance</SelectItem>
                                              <SelectItem value="Gerente de Riscos">Gerente de Riscos</SelectItem>
                                              <SelectItem value="Auditor Interno">Auditor Interno</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        ) : (
                                          <p className="text-sm">{risk.approval_person_1_position || 'Não informado'}</p>
                                        )}
                                      </div>
                                      <div>
                                        <Label className="text-xs font-medium mb-1 block">E-mail</Label>
                                        {isEditing ? (
                                          <Input
                                            value={editForm.approval_person_1_email || ''}
                                            onChange={(e) => updateEditForm(risk.id, 'approval_person_1_email', e.target.value)}
                                            placeholder="email@empresa.com"
                                          />
                                        ) : (
                                          <p className="text-sm">{risk.approval_person_1_email || 'Não informado'}</p>
                                        )}
                                      </div>
                                      <div>
                                        <Label className="text-xs font-medium mb-1 block">Status</Label>
                                        {isEditing ? (
                                          <Select value={editForm.approval_person_1_status || ''} onValueChange={(value) => updateEditForm(risk.id, 'approval_person_1_status', value)}>
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="pending">⏳ Pendente</SelectItem>
                                              <SelectItem value="acknowledged">👁️ Tomou Ciência</SelectItem>
                                              <SelectItem value="approved">✅ Aprovado</SelectItem>
                                              <SelectItem value="rejected">❌ Rejeitado</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        ) : (
                                          <Badge variant="outline">
                                            {risk.approval_person_1_status === 'pending' ? '⏳ Pendente' :
                                             risk.approval_person_1_status === 'acknowledged' ? '👁️ Tomou Ciência' :
                                             risk.approval_person_1_status === 'approved' ? '✅ Aprovado' :
                                             risk.approval_person_1_status === 'rejected' ? '❌ Rejeitado' : 'Não definido'}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Nota para adicionar mais pessoas */}
                              <div className="text-center p-3 border-2 border-dashed border-muted-foreground/20 rounded">
                                <p className="text-xs text-muted-foreground">
                                  💡 <strong>Dica:</strong> Para adicionar mais pessoas, use o formulário completo de registro de riscos
                                </p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium mb-2 block">Plano de Comunicação</Label>
                            {isEditing ? (
                              <Textarea
                                value={editForm.communicationPlan || ''}
                                onChange={(e) => updateEditForm(risk.id, 'communicationPlan', e.target.value)}
                                placeholder="Descreva como e quando comunicar sobre este risco"
                                rows={2}
                              />
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                {risk.communicationPlan || 'Nenhum plano definido'}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Canal de Comunicação</Label>
                              {isEditing ? (
                                <Select value={editForm.communicationChannel || ''} onValueChange={(value) => updateEditForm(risk.id, 'communicationChannel', value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="email">E-mail</SelectItem>
                                    <SelectItem value="reuniao">Reunião</SelectItem>
                                    <SelectItem value="relatorio">Relatório</SelectItem>
                                    <SelectItem value="dashboard">Dashboard</SelectItem>
                                    <SelectItem value="sistema">Sistema</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge variant="outline">
                                  {risk.communicationChannel || 'Não definido'}
                                </Badge>
                              )}
                            </div>

                            <div>
                              <Label className="text-sm font-medium mb-2 block">Última Comunicação</Label>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(risk.lastCommunication) || 'Nunca'}
                              </span>
                            </div>
                          </div>
                        </TabsContent>

                        {/* Etapa 7: Monitoramento */}
                        <TabsContent value="monitoring" className="space-y-4 mt-4">
                          <div>
                            <Label className="text-sm font-medium mb-2 block">Indicadores de Monitoramento</Label>
                            {isEditing ? (
                              <Textarea
                                value={editForm.indicators || ''}
                                onChange={(e) => updateEditForm(risk.id, 'indicators', e.target.value)}
                                placeholder="Defina os KPIs e métricas para monitorar este risco"
                                rows={2}
                              />
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                {risk.indicators || 'Nenhum indicador definido'}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Frequência de Revisão</Label>
                              {isEditing ? (
                                <Select value={editForm.reviewFrequency || ''} onValueChange={(value) => updateEditForm(risk.id, 'reviewFrequency', value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="semanal">Semanal</SelectItem>
                                    <SelectItem value="mensal">Mensal</SelectItem>
                                    <SelectItem value="trimestral">Trimestral</SelectItem>
                                    <SelectItem value="semestral">Semestral</SelectItem>
                                    <SelectItem value="anual">Anual</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge variant="outline">
                                  {risk.reviewFrequency || 'Não definido'}
                                </Badge>
                              )}
                            </div>

                            <div>
                              <Label className="text-sm font-medium mb-2 block">Próxima Revisão</Label>
                              {isEditing ? (
                                <Input
                                  type="date"
                                  value={editForm.nextReview || ''}
                                  onChange={(e) => updateEditForm(risk.id, 'nextReview', e.target.value)}
                                />
                              ) : (
                                <span className="text-sm">
                                  {formatDate(risk.nextReview) || 'Não agendado'}
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium mb-2 block">Controles Existentes</Label>
                            {isEditing ? (
                              <Textarea
                                value={editForm.existingControls || ''}
                                onChange={(e) => updateEditForm(risk.id, 'existingControls', e.target.value)}
                                placeholder="Liste os controles já implementados"
                                rows={2}
                              />
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                {risk.existingControls || 'Nenhum controle informado'}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label className="text-sm font-medium mb-2 block">Lições Aprendidas</Label>
                            {isEditing ? (
                              <Textarea
                                value={editForm.lessonsLearned || ''}
                                onChange={(e) => updateEditForm(risk.id, 'lessonsLearned', e.target.value)}
                                placeholder="Registre as lições aprendidas durante o gerenciamento deste risco"
                                rows={2}
                              />
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                {risk.lessonsLearned || 'Nenhuma lição registrada'}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Status de Revisão</Label>
                              {isEditing ? (
                                <Select value={editForm.reviewStatus || ''} onValueChange={(value) => updateEditForm(risk.id, 'reviewStatus', value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pendente">Pendente</SelectItem>
                                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                                    <SelectItem value="concluido">Concluído</SelectItem>
                                    <SelectItem value="aprovado">Aprovado</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge variant="outline">
                                  {risk.reviewStatus || 'Pendente'}
                                </Badge>
                              )}
                            </div>

                            <div>
                              <Label className="text-sm font-medium mb-2 block">Eficácia dos Controles</Label>
                              {isEditing ? (
                                <Select value={editForm.controlEffectiveness || ''} onValueChange={(value) => updateEditForm(risk.id, 'controlEffectiveness', value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="baixa">Baixa</SelectItem>
                                    <SelectItem value="media">Média</SelectItem>
                                    <SelectItem value="alta">Alta</SelectItem>
                                    <SelectItem value="excelente">Excelente</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge variant="outline">
                                  {risk.controlEffectiveness || 'Não avaliado'}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Histórico de Revisões */}
                          <div className="border-t pt-4">
                            <Label className="text-sm font-medium mb-2 block">Histórico de Revisões</Label>
                            <div className="space-y-2">
                              {risk.reviewHistory?.length > 0 ? (
                                risk.reviewHistory.map((review: any, index: number) => (
                                  <div key={index} className="p-2 border rounded text-sm">
                                    <div className="flex justify-between items-start">
                                      <span className="font-medium">{review.reviewer}</span>
                                      <span className="text-muted-foreground">{formatDate(review.date)}</span>
                                    </div>
                                    <p className="text-muted-foreground mt-1">{review.comments}</p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground">Nenhuma revisão registrada</p>
                              )}
                            </div>
                          </div>

                          {/* Metadados */}
                          <div className="pt-4 border-t">
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div className="flex justify-between">
                                <span>Criado por: {risk.createdBy || 'Sistema'}</span>
                                <span>Criado em: {formatDate(risk.createdAt)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Última atualização por: {risk.updatedBy || 'Sistema'}</span>
                                <span>Atualizado em: {formatDate(risk.updatedAt)}</span>
                              </div>
                            </div>
                          </div>
                        </TabsContent>


                      </Tabs>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};