import React, { useState, useMemo } from 'react';
import { CommunicationTab } from './CommunicationTab';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Activity,
  CheckCircle,
  Info,
  History,
  CheckSquare,
  Clipboard,
  Plus,
  Send,
  ClipboardList,
  MessageSquare,
  UserCheck,
  ThumbsUp,
  Mail,
  Inbox,
  FolderCheck,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import { useTenantSecurity } from '@/utils/tenantSecurity';
import type { Risk, RiskFilters, RiskStatus, TreatmentApprover } from '@/types/risk-management';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useRiskAcceptancePrint } from '@/hooks/useRiskAcceptancePrint';

interface ExpandableCardsViewProps {
  risks: Risk[];
  searchTerm: string;
  filters?: RiskFilters;
  onUpdate: (riskId: string, data: any) => void;
  onDelete: (riskId: string) => void;
  defaultTab?: 'open' | 'accepted' | 'closed';
  expandRiskId?: string;
}

type SortField = 'name' | 'category' | 'riskLevel' | 'riskScore' | 'status' | 'createdAt' | 'dueDate';
type SortDirection = 'asc' | 'desc';

export const ExpandableCardsView: React.FC<ExpandableCardsViewProps> = ({
  risks,
  searchTerm,
  filters = {},
  onUpdate,
  onDelete,
  defaultTab = 'open',
  expandRiskId,
}) => {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(
    expandRiskId ? new Set([expandRiskId]) : new Set()
  );
  const [editingCards, setEditingCards] = useState<Set<string>>(new Set());
  const [editForms, setEditForms] = useState<Record<string, any>>({});
  const [savingCards, setSavingCards] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [evidencePreview, setEvidencePreview] = useState<{ isOpen: boolean; url: string; title: string }>({ isOpen: false, url: '', title: '' });
  const [riskListTab, setRiskListTab] = useState<'open' | 'accepted' | 'closed'>(defaultTab);
  const [sendingEmail, setSendingEmail] = useState<Record<string, boolean>>({});
  const [residualWarningRiskId, setResidualWarningRiskId] = useState<string | null>(null);


  const { toast } = useToast();
  const { tenantSettings, isMatrix4x4, getRiskLevels, getMatrixLabels, getMatrixDimensions } = useTenantSettings();
  const { userTenantId } = useTenantSecurity();
  const { user } = useAuth();
  const { printRiskAcceptancePDF, printRiskAcceptanceDOC, isGenerating: isPrintGenerating } = useRiskAcceptancePrint();

  const matrixLabels = getMatrixLabels();
  const matrixDims = getMatrixDimensions();

  // Opções para dropdowns
  const statusOptions: RiskStatus[] = ['Identificado', 'Avaliado', 'Em Tratamento', 'Monitorado', 'Fechado', 'Reaberto'];
  const categoryOptions = ['Operacional', 'Financeiro', 'Tecnológico', 'Regulatório', 'Reputacional', 'Estratégico', 'Ambiental', 'Compliance', 'Mercado', 'Legal'];
  const treatmentOptions = ['Mitigar', 'Transferir', 'Evitar', 'Aceitar'];

  // Filtrar e ordenar riscos
  const processedRisks = useMemo(() => {
    const filtered = risks.filter(risk => {
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

      // Fallback para manter a ordem estável se os valores principais forem iguais
      if (sortField !== 'createdAt') {
        const aDate = new Date(a.createdAt || 0).getTime();
        const bDate = new Date(b.createdAt || 0).getTime();
        if (aDate !== bDate) return bDate - aDate; // Mais recentes primeiro
      }
      return a.id.localeCompare(b.id);
    });

    return filtered;
    return filtered;
  }, [risks, searchTerm, filters, sortField, sortDirection]);

  const handleValidateActionPlan = async (planId: string, riskId: string) => {
    try {
      const { error } = await supabase
        .from('risk_registration_action_plans')
        .update({
          status: 'Concluído',
          analyst_validation_status: 'approved'
        })
        .eq('id', planId);

      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Plano de ação validado pelo analista.' });

      onUpdate(riskId, {});
    } catch (err: any) {
      toast({ title: 'Erro ao validar o plano', description: err.message, variant: 'destructive' });
    }
  };

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
        responsibleArea: risk.responsibleArea || '',
        identificationDate: risk.identifiedDate ? new Date(risk.identifiedDate).toISOString().split('T')[0] : '',

        // Análise
        analysisMethodology: risk.analysisMethodology || '',
        probability: risk.probability,
        impact: risk.impact,
        causes: risk.causes || '',
        consequences: risk.consequences || '',

        // Classificação GUT
        gut_gravity: risk.gut_gravity || '',
        gut_urgency: risk.gut_urgency || '',
        gut_tendency: risk.gut_tendency || '',
        gut_priority: risk.gut_priority || '',
        category: risk.category,
        subcategory: risk.subcategory || '',
        riskType: risk.riskType || '',
        nature: risk.nature || '',
        temporality: risk.temporality || '',
        tags: risk.tags || '',
        department: risk.department || '',
        relatedProcess: risk.relatedProcess || '',
        regulations: risk.regulations || '',

        // Tratamento
        treatmentType: risk.treatmentType || 'Mitigar',
        treatment_rationale: risk.treatment_rationale || '',
        treatment_cost: risk.treatment_cost || '',
        treatment_timeline: risk.treatment_timeline ? new Date(risk.treatment_timeline).toISOString().split('T')[0] : '',
        treatment_evidence: (risk as any).treatment_evidence || '',
        acceptance_type: (risk as any).acceptance_type || 'temporario',
        treatment_approvers: (risk as any).treatment_approvers || [],
        status: risk.status,
        assignedTo: risk.assignedTo || '',
        dueDate: risk.dueDate ? new Date(risk.dueDate).toISOString().split('T')[0] : '',

        // Plano de Ação
        action_plan_responsible: risk.action_plan_responsible || '',
        action_plan_due_date: risk.action_plan_due_date ? new Date(risk.action_plan_due_date).toISOString().split('T')[0] : '',
        activity_1_name: risk.activity_1_name || '',
        activity_1_description: risk.activity_1_description || '',
        activity_1_responsible: risk.activity_1_responsible || '',
        activity_1_email: risk.activity_1_email || '',
        activity_1_priority: risk.activity_1_priority || '',
        activity_1_status: risk.activity_1_status || '',
        activity_1_due_date: risk.activity_1_due_date ? new Date(risk.activity_1_due_date).toISOString().split('T')[0] : '',

        // Comunicação
        awareness_person_1_name: risk.awareness_person_1_name || '',
        awareness_person_1_position: risk.awareness_person_1_position || '',
        awareness_person_1_email: risk.awareness_person_1_email || '',
        approval_person_1_name: risk.approval_person_1_name || '',
        approval_person_1_position: risk.approval_person_1_position || '',
        approval_person_1_email: risk.approval_person_1_email || '',
        approval_person_1_status: risk.approval_person_1_status || '',
        stakeholders: risk.risk_stakeholders || [],

        // Monitoramento
        monitoring_frequency: risk.monitoring_frequency || '',
        monitoring_responsible: risk.monitoring_responsible || '',
        residual_impact: risk.residual_impact || '',
        residual_likelihood: risk.residual_likelihood || '',
        residual_score: risk.residual_score || '',
        closure_criteria: risk.closure_criteria || '',
        closure_notes: risk.closure_notes || '',
        closure_date: risk.closure_date ? new Date(risk.closure_date).toISOString().split('T')[0] : '',

        // Campos legados
        historical_events: risk.historical_events || '',
        root_causes: risk.root_causes || '',
        controls_effectiveness: risk.controls_effectiveness || '',
        existing_controls: risk.existing_controls || '',
        indicators: risk.indicators || '',
        reviewFrequency: risk.reviewFrequency || '',
        nextReview: risk.nextReview ? new Date(risk.nextReview).toISOString().split('T')[0] : '',
        existingControls: risk.existingControls || '',
        communicationPlan: risk.communicationPlan || '',
        communicationChannel: risk.communicationChannel || '',
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

    // Validar dados residuais antes de fechar o risco
    if (formData.status === 'Fechado') {
      const currentRisk = risks?.find((r: any) => r.id === riskId);
      const hasResidualInForm = formData.residual_impact && formData.residual_likelihood;
      const hasResidualInDB = currentRisk?.residual_impact && (currentRisk as any)?.residual_likelihood;
      if (!hasResidualInForm && !hasResidualInDB) {
        setResidualWarningRiskId(riskId);
        return;
      }
    }

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
        treatment_rationale: formData.treatment_rationale,
        treatment_cost: formData.treatment_cost,
        treatment_timeline: formData.treatment_timeline,
        treatment_evidence: formData.treatment_evidence,
        acceptance_type: formData.acceptance_type,
        treatment_approvers: formData.treatment_approvers,
        status: formData.status,
        actionPlan: formData.actionPlan,
        assignedTo: formData.assignedTo,

        // Plano de Ação - Atividades detalhadas
        action_plan_responsible: formData.action_plan_responsible || null,
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
        historical_events: formData.historical_events || null,
        root_causes: formData.root_causes || null,
        controls_effectiveness: formData.controls_effectiveness || null,
        existing_controls: formData.existing_controls || null,
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
      if (formData.action_plan_due_date) {
        updateData.action_plan_due_date = new Date(formData.action_plan_due_date);
      }
      if (formData.treatment_timeline) {
        updateData.treatment_timeline = new Date(formData.treatment_timeline);
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

  const getTreatmentStrategyColor = (strategy: string) => {
    switch (strategy?.toLowerCase()) {
      case 'accept':
      case 'aceitar':
        return 'bg-red-500 text-white border-red-600';
      case 'mitigate':
      case 'mitigar':
        return 'bg-yellow-500 text-white border-yellow-600';
      case 'transfer':
      case 'transferir':
        return 'bg-blue-500 text-white border-blue-600';
      case 'avoid':
      case 'evitar':
        return 'bg-green-500 text-white border-green-600';
      default:
        return 'bg-gray-500 text-white border-gray-600';
    }
  };

  const translateTreatmentStrategy = (strategy: string): string => {
    if (!strategy) return 'Não definido';

    const translations: Record<string, string> = {
      'accept': 'Aceitar',
      'mitigate': 'Mitigar',
      'transfer': 'Transferir',
      'avoid': 'Evitar'
    };

    const cleanStrategy = strategy.trim().toLowerCase();

    for (const [key, value] of Object.entries(translations)) {
      if (key.toLowerCase() === cleanStrategy) {
        return value;
      }
    }

    return strategy;
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const isOverdue = (risk: Risk) => {
    if (!risk.dueDate || risk.status === 'Fechado') return false;
    return new Date(risk.dueDate) < new Date();
  };

  // Tab categorization helpers
  const isRiskAccepted = (risk: Risk): boolean => {
    const normalizedTreatment = (risk.treatmentType || risk.treatment_strategy || '').toLowerCase();
    const isAccept = normalizedTreatment === 'aceitar' || normalizedTreatment === 'accept';
    const approvers: TreatmentApprover[] = (risk as any).treatment_approvers || [];
    const allApproved = approvers.length > 0 && approvers.every((a) => a.approved);
    return isAccept && allApproved;
  };

  const isRiskClosed = (risk: Risk): boolean => {
    return risk.status === 'Fechado';
  };

  const getRiskTab = (risk: Risk): 'accepted' | 'closed' | 'open' => {
    if (isRiskClosed(risk)) return 'closed';
    if (isRiskAccepted(risk)) return 'accepted';
    return 'open';
  };

  // Quando expandRiskId é fornecido (navegação da matriz), abrir o tab correto e expandir o card
  React.useEffect(() => {
    if (!expandRiskId || risks.length === 0) return;
    const risk = risks.find(r => r.id === expandRiskId);
    if (!risk) return;
    setRiskListTab(getRiskTab(risk));
    setTimeout(() => {
      const el = document.getElementById(`risk-card-${expandRiskId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }, [expandRiskId, risks]);

  const sendApprovalEmail = async (riskId: string, approver: TreatmentApprover, risk: Risk) => {
    const key = `${riskId}-${approver.id}`;
    setSendingEmail(prev => ({ ...prev, [key]: true }));
    try {
      const { error } = await supabase.functions.invoke('risk-acceptance-notify', {
        body: {
          approverName: approver.name,
          approverEmail: approver.email,
          riskTitle: risk.name,
          riskLevel: risk.riskLevel,
          riskCategory: risk.category,
          riskDescription: risk.description || '',
          senderName: user?.profile?.full_name || user?.email || 'Sistema GRC',
          acceptanceType: (risk as any).acceptance_type || 'temporario',
          justification: (risk as any).treatment_rationale || '',
          riskId,
        },
      });
      if (error) throw error;
      // Mark sent_at in approvers
      const approvers: TreatmentApprover[] = (risk as any).treatment_approvers || [];
      const updated = approvers.map((a) =>
        a.id === approver.id ? { ...a, sent_at: new Date().toISOString() } : a
      );
      await supabase.from('risk_registrations').update({ treatment_approvers: updated }).eq('id', riskId);
      onUpdate(riskId, { treatment_approvers: updated });
      toast({ title: '📧 E-mail enviado', description: `Notificação enviada para ${approver.email}` });
    } catch (err: any) {
      toast({ title: 'Erro ao enviar e-mail', description: err.message, variant: 'destructive' });
    } finally {
      setSendingEmail(prev => ({ ...prev, [key]: false }));
    }
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
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Riscos Detalhados</span>
              <Badge variant="secondary" className="px-2">{processedRisks.length} riscos</Badge>
            </CardTitle>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Ordenação */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground font-medium px-1 sm:px-0">Ordenar por:</span>
                <div className="flex items-center bg-muted/30 rounded-lg p-1 border">
                  <Button
                    variant={sortField === 'name' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => handleSort('name')}
                    className="flex-1 sm:flex-none items-center space-x-1 h-8 text-xs px-2 sm:px-3 rounded-md mx-0.5"
                  >
                    <span>Nome</span>
                    {getSortIcon('name')}
                  </Button>
                  <Button
                    variant={sortField === 'riskLevel' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => handleSort('riskLevel')}
                    className="flex-1 sm:flex-none items-center space-x-1 h-8 text-xs px-2 sm:px-3 rounded-md mx-0.5"
                  >
                    <span>Nível</span>
                    {getSortIcon('riskLevel')}
                  </Button>
                  <Button
                    variant={sortField === 'createdAt' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => handleSort('createdAt')}
                    className="flex-1 sm:flex-none items-center space-x-1 h-8 text-xs px-2 sm:px-3 rounded-md mx-0.5"
                  >
                    <span>Data</span>
                    {getSortIcon('createdAt')}
                  </Button>
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={exportToCSV} className="h-10 sm:h-auto flex items-center justify-center bg-muted/20 hover:bg-muted/50 w-full sm:w-auto mt-1 sm:mt-0">
                <Download className="h-4 w-4 sm:mr-1.5" />
                <span className="ml-1 sm:ml-0">Exportar</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 3-Tab Risk List: Abertos / Aceitos / Encerrados */}
      <Tabs value={riskListTab} onValueChange={(v) => setRiskListTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="open" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Inbox className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Riscos em Aberto</span>
            <Badge variant="secondary" className="ml-1 text-[10px] h-5 px-1.5">
              {processedRisks.filter(r => getRiskTab(r) === 'open').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="accepted" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <ThumbsUp className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Riscos Aceitos</span>
            <Badge variant="secondary" className="ml-1 text-[10px] h-5 px-1.5">
              {processedRisks.filter(r => getRiskTab(r) === 'accepted').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="closed" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <FolderCheck className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Riscos Encerrados</span>
            <Badge variant="secondary" className="ml-1 text-[10px] h-5 px-1.5">
              {processedRisks.filter(r => getRiskTab(r) === 'closed').length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {(['open', 'accepted', 'closed'] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <div className="space-y-4">
              {processedRisks.filter(r => getRiskTab(r) === tab).length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {tab === 'open' ? 'Nenhum risco em aberto' : tab === 'accepted' ? 'Nenhum risco aceito' : 'Nenhum risco encerrado'}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {searchTerm || Object.keys(filters).length > 0
                          ? 'Tente ajustar os filtros de busca.'
                          : tab === 'accepted' ? 'Riscos com tratamento "Aceitar" e todos aprovadores confirmados aparecerão aqui.' : tab === 'closed' ? 'Riscos com status "Fechado" aparecerão aqui.' : 'Não há riscos em aberto.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                processedRisks.filter(r => getRiskTab(r) === tab).map((risk) => {
            const isExpanded = expandedCards.has(risk.id);
            const isEditing = editingCards.has(risk.id);
            const editForm = editForms[risk.id] || {};
            const overdue = isOverdue(risk);

            return (
              <Card
                key={risk.id}
                id={`risk-card-${risk.id}`}
                className={`border-l-4 transition-all ${overdue ? 'border-l-red-500 bg-red-50 dark:bg-red-950/20' : 'border-l-primary'
                  } ${isExpanded ? 'shadow-md' : 'hover:shadow-sm'} ${expandRiskId === risk.id ? 'ring-2 ring-primary ring-offset-2' : ''}`}
              >
                <CardHeader className="pb-3 px-4 sm:px-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <Input
                          value={editForm.name || ''}
                          onChange={(e) => updateEditForm(risk.id, 'name', e.target.value)}
                          className="font-semibold text-base flex-1"
                          placeholder="Nome do risco"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Select value={editForm.category || ''} onValueChange={(value) => updateEditForm(risk.id, 'category', value)}>
                          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Categoria" /></SelectTrigger>
                          <SelectContent>
                            {categoryOptions.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Select value={editForm.status || ''} onValueChange={(value) => updateEditForm(risk.id, 'status', value)}>
                          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                          <SelectContent>
                            {statusOptions.map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <Input
                          value={editForm.assignedTo || ''}
                          onChange={(e) => updateEditForm(risk.id, 'assignedTo', e.target.value)}
                          placeholder="Responsável"
                          className="h-8 text-xs"
                        />
                        <Input
                          type="date"
                          value={editForm.dueDate || ''}
                          onChange={(e) => updateEditForm(risk.id, 'dueDate', e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          onClick={() => saveEditing(risk.id)}
                          disabled={savingCards.has(risk.id)}
                          className="h-8 text-xs"
                        >
                          {savingCards.has(risk.id) ? (
                            <><div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2" />Salvando...</>
                          ) : (
                            <><Save className="h-3.5 w-3.5 mr-1" />Salvar</>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelEditing(risk.id)}
                          disabled={savingCards.has(risk.id)}
                          className="h-8 text-xs"
                        >
                          <X className="h-3.5 w-3.5 mr-1" />Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {/* Top Row: Info/Title and Actions */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-1.5">
                          {/* Code, Status & Name in a natural flow */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {risk.riskCode && (
                              <Badge variant="secondary" className="text-[10px] sm:text-xs font-mono bg-blue-50 text-blue-700 border-blue-200 px-1.5 py-0 h-5">
                                {risk.riskCode}
                              </Badge>
                            )}
                            {overdue && (
                              <Badge variant="destructive" className="text-[10px] sm:text-xs px-1.5 py-0 h-5 animate-pulse flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> Atrasado
                              </Badge>
                            )}
                            {risk.status === ('draft' as any) && (
                              <Badge variant="outline" className="text-[10px] sm:text-xs text-amber-600 border-amber-300 bg-amber-50 px-1.5 py-0 h-5 flex items-center gap-1">
                                <Info className="h-3 w-3" /> Rascunho
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100 leading-tight pr-2">
                            {risk.name}
                          </h3>
                        </div>

                        {/* Action Buttons & Prominent Risk Level */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {/* Destaque Nível de Risco - Sempre visível */}
                          <Badge className={`${getRiskLevelColor(risk.riskLevel)} border shadow-sm text-xs sm:text-sm px-3 py-1 uppercase tracking-wider font-bold`}>
                            {risk.riskLevel}
                          </Badge>

                          <div className="flex items-center bg-muted/50 rounded-lg p-0.5 mt-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-white dark:hover:bg-gray-800 rounded-md text-gray-500 hover:text-blue-600" onClick={() => startEditing(risk)} title="Editar risco">
                              <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-white dark:hover:bg-gray-800 rounded-md text-gray-500 hover:text-red-600" onClick={() => handleDelete(risk)} title="Excluir risco">
                              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-white dark:hover:bg-gray-800 rounded-md text-gray-500" onClick={() => toggleExpanded(risk.id)} title={isExpanded ? "Recolher card" : "Expandir card"}>
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Middle Row: Badges */}
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <Badge className={`${getCategoryColor(risk.category)} border-transparent text-[10px] sm:text-xs px-2 py-0 h-5`}>
                          {risk.category}
                        </Badge>
                        <Badge className={`${getStatusColor(risk.status)} border-transparent text-[10px] sm:text-xs px-2 py-0 h-5`}>
                          {risk.status}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] sm:text-xs px-2 py-0 h-5 text-muted-foreground">
                          Score: {risk.riskScore}
                        </Badge>
                        {risk.treatmentType && (
                          <Badge className={`${getTreatmentStrategyColor(risk.treatmentType)} border-transparent text-[10px] sm:text-xs px-2 py-0 h-5`}>
                            {translateTreatmentStrategy(risk.treatmentType)}
                          </Badge>
                        )}
                      </div>

                      {/* Bottom Row: Organic Metadata Flow */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] sm:text-xs text-muted-foreground mt-1">
                        <div className="flex items-center gap-1.5" title="Responsável">
                          <User className="h-3.5 w-3.5" />
                          <span className="truncate max-w-[150px]">{risk.assignedTo || 'Não atribuído'}</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Data de Vencimento">
                          <Calendar className={`h-3.5 w-3.5 ${overdue ? 'text-red-500' : ''}`} />
                          <span className={overdue ? 'text-red-600 font-medium' : ''}>
                            {risk.dueDate ? formatDate(risk.dueDate) : 'Sem prazo'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Data de Criação">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{formatDate(risk.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="border-t pt-4">
                      <Tabs defaultValue="identification" className="w-full">
                        <div className="relative w-full">
                          <div className="overflow-x-auto pb-2 -mb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            <TabsList className="flex w-max min-w-full justify-start h-auto p-1 bg-muted/50 rounded-lg">
                              <TabsTrigger value="identification" className="flex items-center gap-1.5 text-xs whitespace-nowrap px-3 py-1.5 flex-shrink-0">
                                <FileText className="h-3.5 w-3.5" />
                                Identificação
                              </TabsTrigger>
                              <TabsTrigger value="analysis" className="flex items-center gap-1.5 text-xs whitespace-nowrap px-3 py-1.5 flex-shrink-0">
                                <BarChart3 className="h-3.5 w-3.5" />
                                Análise
                              </TabsTrigger>
                              <TabsTrigger value="evaluation" className="flex items-center gap-1.5 text-xs whitespace-nowrap px-3 py-1.5 flex-shrink-0">
                                <CheckSquare className="h-3.5 w-3.5" />
                                Avaliação
                              </TabsTrigger>
                              <TabsTrigger value="context" className="flex items-center gap-1.5 text-xs whitespace-nowrap px-3 py-1.5 flex-shrink-0">
                                <History className="h-3.5 w-3.5" />
                                Contexto
                              </TabsTrigger>
                              <TabsTrigger value="controls" className="flex items-center gap-1.5 text-xs whitespace-nowrap px-3 py-1.5 flex-shrink-0">
                                <Shield className="h-3.5 w-3.5" />
                                Controles
                              </TabsTrigger>
                              <TabsTrigger value="action-plan" className="flex items-center gap-1.5 text-xs whitespace-nowrap px-3 py-1.5 flex-shrink-0">
                                <ClipboardList className="h-3.5 w-3.5" />
                                Planos de Ação
                              </TabsTrigger>
                              <TabsTrigger value="treatment" className="flex items-center gap-1.5 text-xs whitespace-nowrap px-3 py-1.5 flex-shrink-0">
                                <Target className="h-3.5 w-3.5" />
                                Tratamento
                              </TabsTrigger>
                              <TabsTrigger value="communication" className="flex items-center gap-1.5 text-xs whitespace-nowrap px-3 py-1.5 flex-shrink-0">
                                <MessageSquare className="h-3.5 w-3.5" />
                                Comunicação
                              </TabsTrigger>
                              <TabsTrigger value="monitoring" className="flex items-center gap-1.5 text-xs whitespace-nowrap px-3 py-1.5 flex-shrink-0">
                                <Eye className="h-3.5 w-3.5" />
                                Monitoramento
                              </TabsTrigger>
                              {isRiskAccepted(risk) && (
                                <TabsTrigger value="carta-risco" className="flex items-center gap-1.5 text-xs whitespace-nowrap px-3 py-1.5 flex-shrink-0 text-emerald-700 dark:text-emerald-400 data-[state=active]:text-emerald-700 data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-950/40">
                                  <FileText className="h-3.5 w-3.5" />
                                  Carta de Risco
                                </TabsTrigger>
                              )}
                            </TabsList>
                          </div>
                        </div>

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

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                <p className="text-sm">{formatDate(risk.identifiedDate) || formatDate(risk.createdAt)}</p>
                              )}
                            </div>

                            <div>
                              <Label className="text-sm font-medium mb-2 block">Área Responsável</Label>
                              {isEditing ? (
                                <Input
                                  value={editForm.responsibleArea || ''}
                                  onChange={(e) => updateEditForm(risk.id, 'responsibleArea', e.target.value)}
                                  placeholder="Ex: TI, RH, Financeiro, Operações"
                                />
                              ) : (
                                <p className="text-sm">{risk.responsibleArea || 'Não informado'}</p>
                              )}
                            </div>
                          </div>

                          {/* Campos Complementares */}
                          <div className="mt-6 border-t pt-4">
                            <h4 className="font-medium mb-4 text-muted-foreground">Classificação Complementar</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

                            <div className="mb-4">
                              <Label className="text-sm font-medium mb-2 block">Tags/Palavras-chave</Label>
                              {isEditing ? (
                                <Input
                                  value={editForm.tags || ''}
                                  onChange={(e) => updateEditForm(risk.id, 'tags', e.target.value)}
                                  placeholder="Ex: cibersegurança, LGPD, continuidade, fraude (separadas por vírgula)"
                                />
                              ) : (
                                <div className="flex flex-wrap gap-1">
                                  {(risk.tags || '').split(',').filter((tag: string) => tag.trim()).map((tag: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {tag.trim()}
                                    </Badge>
                                  )) || <span className="text-sm text-muted-foreground">Nenhuma tag definida</span>}
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                          </div>
                        </TabsContent>

                        {/* Etapa 3: Avaliação */}
                        <TabsContent value="evaluation" className="space-y-4 mt-4">
                          <div className="border rounded-lg p-4 bg-card">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <CheckSquare className="h-4 w-4" />
                              Avaliação (Matriz GUT)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-4">Metodologia de Gravidade, Urgência e Tendência.</p>
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
                        </TabsContent>

                        {/* Etapa 4: Contexto */}
                        <TabsContent value="context" className="space-y-4 mt-4">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Histórico e Contexto
                          </h4>
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Eventos Anteriores</Label>
                              {isEditing ? (
                                <Textarea
                                  value={editForm.historical_events || ''}
                                  onChange={(e) => updateEditForm(risk.id, 'historical_events', e.target.value)}
                                  placeholder="Houve incidentes anteriores relacionados a este risco?"
                                  rows={3}
                                />
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  {risk.historical_events || 'Nenhum evento anterior registrado.'}
                                </p>
                              )}
                            </div>
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Causas Raiz (Root Cause)</Label>
                              {isEditing ? (
                                <Textarea
                                  value={editForm.root_causes || ''}
                                  onChange={(e) => updateEditForm(risk.id, 'root_causes', e.target.value)}
                                  placeholder="Quais as origens deste risco?"
                                  rows={3}
                                />
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  {risk.root_causes || 'Nenhuma causa raiz registrada.'}
                                </p>
                              )}
                            </div>
                          </div>
                        </TabsContent>

                        {/* Etapa 5: Controles */}
                        <TabsContent value="controls" className="space-y-4 mt-4">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Avaliação de Controles Existentes
                          </h4>
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Efetividade Geral dos Controles Mapeados</Label>
                              {isEditing ? (
                                <Select value={editForm.controls_effectiveness || ''} onValueChange={(value) => updateEditForm(risk.id, 'controls_effectiveness', value)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione a efetividade atual..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="ineffective">Inefetivo (Ausente ou falho)</SelectItem>
                                    <SelectItem value="partially_effective">Parcialmente Efetivo</SelectItem>
                                    <SelectItem value="effective">Efetivo</SelectItem>
                                    <SelectItem value="highly_effective">Altamente Efetivo</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge variant="outline">
                                  {risk.controls_effectiveness === 'ineffective' ? 'Inefetivo' :
                                    risk.controls_effectiveness === 'partially_effective' ? 'Parcialmente Efetivo' :
                                      risk.controls_effectiveness === 'effective' ? 'Efetivo' :
                                        risk.controls_effectiveness === 'highly_effective' ? 'Altamente Efetivo' : 'Não avaliado'}
                                </Badge>
                              )}
                            </div>
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Descrição dos Controles Atuais</Label>
                              {isEditing ? (
                                <Textarea
                                  value={editForm.existing_controls || ''}
                                  onChange={(e) => updateEditForm(risk.id, 'existing_controls', e.target.value)}
                                  placeholder="Descreva as defesas atuais para este risco..."
                                  rows={4}
                                />
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  {risk.existing_controls || 'Nenhuma descrição fornecida.'}
                                </p>
                              )}
                            </div>
                          </div>
                        </TabsContent>

                        {/* Conteúdo movido para a aba Identificação */}

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
                              <Label className="text-sm font-medium mb-2 block">Probabilidade ({risk.probability}/{matrixDims.rows})</Label>
                              {isEditing ? (
                                <div className="space-y-2">
                                  <Select value={editForm.probability?.toString() || ''} onValueChange={(value) => updateEditForm(risk.id, 'probability', parseInt(value))}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {matrixLabels.likelihood.map((label, idx) => (
                                        <SelectItem key={idx} value={(idx + 1).toString()}>{idx + 1} - {label}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{risk.probability}/{matrixDims.rows}</Badge>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-500 h-2 rounded-full"
                                      style={{ width: `${(risk.probability / matrixDims.rows) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            <div>
                              <Label className="text-sm font-medium mb-2 block">Impacto ({risk.impact}/{matrixDims.cols})</Label>
                              {isEditing ? (
                                <Select value={editForm.impact?.toString() || ''} onValueChange={(value) => updateEditForm(risk.id, 'impact', parseInt(value))}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {matrixLabels.impact.map((label, idx) => (
                                      <SelectItem key={idx} value={(idx + 1).toString()}>{idx + 1} - {label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{risk.impact}/{matrixDims.cols}</Badge>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-orange-500 h-2 rounded-full"
                                      style={{ width: `${(risk.impact / matrixDims.cols) * 100}%` }}
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
                                  {(() => {
                                    // Função de tradução para estratégias de tratamento
                                    const translateTreatmentStrategy = (strategy: string): string => {
                                      if (!strategy) return 'Não definido';

                                      const translations: Record<string, string> = {
                                        'mitigate': 'Mitigar',
                                        'transfer': 'Transferir',
                                        'avoid': 'Evitar',
                                        'accept': 'Aceitar',
                                        'Mitigar': 'Mitigar',
                                        'Transferir': 'Transferir',
                                        'Evitar': 'Evitar',
                                        'Aceitar': 'Aceitar'
                                      };

                                      const cleanStrategy = strategy.trim().toLowerCase();

                                      for (const [key, value] of Object.entries(translations)) {
                                        if (key.toLowerCase() === cleanStrategy) {
                                          return value;
                                        }
                                      }

                                      return strategy;
                                    };

                                    const result = translateTreatmentStrategy(risk.treatmentType || '');
                                    return result;
                                  })()}
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
                            <Label className="text-sm font-medium mb-2 block">Justificativa do Tratamento</Label>
                            {isEditing ? (
                              <Textarea
                                value={editForm.treatment_rationale || ''}
                                onChange={(e) => updateEditForm(risk.id, 'treatment_rationale', e.target.value)}
                                placeholder="Justifique a estratégia de tratamento escolhida"
                                rows={3}
                              />
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                {risk.treatment_rationale || 'Nenhuma justificativa fornecida'}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Custo Estimado</Label>
                              {isEditing ? (
                                <Input
                                  type="number"
                                  value={editForm.treatment_cost || ''}
                                  onChange={(e) => updateEditForm(risk.id, 'treatment_cost', parseFloat(e.target.value))}
                                  placeholder="Valor em R$"
                                />
                              ) : (
                                <p className="text-sm">
                                  {risk.treatment_cost ?
                                    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(risk.treatment_cost)
                                    : 'Não informado'}
                                </p>
                              )}
                            </div>

                            <div>
                              <Label className="text-sm font-medium mb-2 block">Cronograma</Label>
                              {isEditing ? (
                                <Input
                                  type="date"
                                  value={editForm.treatment_timeline || ''}
                                  onChange={(e) => updateEditForm(risk.id, 'treatment_timeline', e.target.value)}
                                  placeholder="Data de conclusão"
                                />
                              ) : (
                                <p className="text-sm">{formatDate(risk.treatment_timeline) || 'Não definido'}</p>
                              )}
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

                          {/* Evidência do Tratamento */}
                          <div>
                            <Label className="text-sm font-medium mb-2 block flex items-center gap-1.5">
                              <CheckSquare className="h-4 w-4" />
                              Evidência do Tratamento
                            </Label>
                            {isEditing ? (
                              <Textarea
                                value={editForm.treatment_evidence || ''}
                                onChange={(e) => updateEditForm(risk.id, 'treatment_evidence', e.target.value)}
                                placeholder="Descreva ou cole URL da evidência do tratamento aplicado..."
                                rows={2}
                              />
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                {(risk as any).treatment_evidence || 'Nenhuma evidência registrada'}
                              </p>
                            )}
                          </div>

                          {/* Seção específica para Aceitar */}
                          {((isEditing ? editForm.treatmentType : risk.treatmentType) === 'Aceitar' ||
                            (isEditing ? editForm.treatmentType : (risk as any).treatment_strategy)?.toLowerCase() === 'accept') && (
                            <div className="border rounded-lg p-4 space-y-4 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
                              <h6 className="font-semibold text-sm flex items-center gap-2 text-orange-800 dark:text-orange-200">
                                <UserCheck className="h-4 w-4" />
                                Configuração de Aceite de Risco
                              </h6>

                              {/* Tipo de Aceite */}
                              <div>
                                <Label className="text-sm font-medium mb-2 block">Tipo de Aceite</Label>
                                {isEditing ? (
                                  <div className="flex gap-3">
                                    {(['temporario', 'definitivo'] as const).map((type) => (
                                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                          type="radio"
                                          name={`acceptance_type_${risk.id}`}
                                          value={type}
                                          checked={(editForm.acceptance_type || 'temporario') === type}
                                          onChange={() => updateEditForm(risk.id, 'acceptance_type', type)}
                                          className="accent-orange-500"
                                        />
                                        <span className="text-sm capitalize">{type === 'temporario' ? 'Temporário' : 'Definitivo'}</span>
                                      </label>
                                    ))}
                                  </div>
                                ) : (
                                  <Badge variant="outline" className="capitalize">
                                    {(risk as any).acceptance_type === 'definitivo' ? 'Definitivo' : 'Temporário'}
                                  </Badge>
                                )}
                              </div>

                              {/* Aprovadores */}
                              <div>
                                <Label className="text-sm font-medium mb-3 block flex items-center gap-1.5">
                                  <Users className="h-4 w-4" />
                                  Aprovadores
                                  <span className="text-xs text-muted-foreground font-normal ml-1">(receberão e-mail: Carta de Risco)</span>
                                </Label>

                                {/* Lista de aprovadores existentes */}
                                {((isEditing ? (editForm.treatment_approvers || []) : ((risk as any).treatment_approvers || []))).map((approver: TreatmentApprover) => (
                                  <div key={approver.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 border rounded-lg bg-background mb-2">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium truncate">{approver.name}</span>
                                        {approver.approved ? (
                                          <Badge className="bg-green-100 text-green-800 text-[10px] h-5 flex-shrink-0">
                                            <CheckCircle className="h-3 w-3 mr-1" /> Aprovado
                                          </Badge>
                                        ) : (
                                          <Badge variant="outline" className="text-[10px] h-5 flex-shrink-0">
                                            <Clock className="h-3 w-3 mr-1" /> Pendente
                                          </Badge>
                                        )}
                                      </div>
                                      <span className="text-xs text-muted-foreground">{approver.email}</span>
                                      {approver.sent_at && (
                                        <span className="text-xs text-muted-foreground block">
                                          E-mail enviado em {formatDate(approver.sent_at)}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs"
                                        disabled={sendingEmail[`${risk.id}-${approver.id}`]}
                                        onClick={() => sendApprovalEmail(risk.id, approver, risk)}
                                      >
                                        {sendingEmail[`${risk.id}-${approver.id}`] ? (
                                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                        ) : (
                                          <Mail className="h-3 w-3 mr-1" />
                                        )}
                                        {approver.sent_at ? 'Reenviar' : 'Enviar'}
                                      </Button>
                                      {isEditing && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                          onClick={() => {
                                            const current: TreatmentApprover[] = editForm.treatment_approvers || [];
                                            updateEditForm(risk.id, 'treatment_approvers', current.filter(a => a.id !== approver.id));
                                          }}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ))}

                                {/* Add approver form - only in edit mode */}
                                {isEditing && (
                                  <div className="border border-dashed rounded-lg p-3 space-y-2 bg-muted/20">
                                    <p className="text-xs font-medium text-muted-foreground">Adicionar Aprovador</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      <Input
                                        placeholder="Nome do aprovador"
                                        className="h-8 text-xs"
                                        value={editForm._newApproverName || ''}
                                        onChange={(e) => updateEditForm(risk.id, '_newApproverName', e.target.value)}
                                      />
                                      <Input
                                        type="email"
                                        placeholder="email@empresa.com"
                                        className="h-8 text-xs"
                                        value={editForm._newApproverEmail || ''}
                                        onChange={(e) => updateEditForm(risk.id, '_newApproverEmail', e.target.value)}
                                      />
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 text-xs"
                                      onClick={() => {
                                        const name = editForm._newApproverName?.trim();
                                        const email = editForm._newApproverEmail?.trim();
                                        if (!name || !email) return;
                                        const current: TreatmentApprover[] = editForm.treatment_approvers || [];
                                        const newApprover: TreatmentApprover = {
                                          id: `approver-${Date.now()}`,
                                          name,
                                          email,
                                          approved: false,
                                        };
                                        updateEditForm(risk.id, 'treatment_approvers', [...current, newApprover]);
                                        updateEditForm(risk.id, '_newApproverName', '');
                                        updateEditForm(risk.id, '_newApproverEmail', '');
                                      }}
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Adicionar
                                    </Button>
                                  </div>
                                )}

                                {/* All approved indicator */}
                                {(() => {
                                  const approvers: TreatmentApprover[] = (risk as any).treatment_approvers || [];
                                  if (approvers.length > 0 && approvers.every(a => a.approved)) {
                                    return (
                                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
                                        <ThumbsUp className="h-4 w-4 text-green-600 flex-shrink-0" />
                                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                          Todos os aprovadores confirmaram. Este risco será movido para "Riscos Aceitos".
                                        </span>
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            </div>
                          )}
                        </TabsContent>

                        {/* Etapa 5: Plano de Ação */}
                        <TabsContent value="action-plan" className="space-y-4 mt-4">
                          {/* Atividades do Plano de Ação */}
                          <div className="border rounded-lg p-4 bg-card">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Clipboard className="h-4 w-4" />
                              Atividades do Plano de Ação
                              {risk.risk_action_plans && risk.risk_action_plans.length > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                  {risk.risk_action_plans.length} atividade{risk.risk_action_plans.length > 1 ? 's' : ''}
                                </Badge>
                              )}
                            </h4>

                            {/* Lista de Atividades das Tabelas Relacionadas */}
                            <Tabs defaultValue="pending" className="w-full">
                              <TabsList className="mb-4 bg-muted w-full justify-start">
                                <TabsTrigger value="pending" className="data-[state=active]:bg-background">
                                  Em Aberto ({risk.risk_action_plans?.filter(p => p.status !== 'completed' && p.status !== 'Concluído').length || 0})
                                </TabsTrigger>
                                <TabsTrigger value="completed" className="data-[state=active]:bg-background">
                                  Concluídos ({risk.risk_action_plans?.filter(p => p.status === 'completed' || p.status === 'Concluído').length || 0})
                                </TabsTrigger>
                              </TabsList>

                              {['pending', 'completed'].map(tab => {
                                const plansInTab = risk.risk_action_plans?.filter(p =>
                                  tab === 'completed'
                                    ? (p.status === 'completed' || p.status === 'Concluído')
                                    : (p.status !== 'completed' && p.status !== 'Concluído')
                                ) || [];

                                return (
                                  <TabsContent key={tab} value={tab} className="space-y-3 m-0 outline-none">
                                    {plansInTab.length > 0 ? (
                                      plansInTab.map((actionPlan, index) => (
                                        <div key={actionPlan.id || index} className="border rounded p-3 bg-card border-green-200 dark:border-green-800">
                                          <div className="flex items-center justify-between mb-3">
                                            <Badge variant="outline" className="text-xs">
                                              Atividade {index + 1}
                                            </Badge>
                                            <Badge variant="outline">
                                              {actionPlan.priority === 'low' ? '🟢 Baixa' :
                                                actionPlan.priority === 'medium' ? '🟡 Média' :
                                                  actionPlan.priority === 'high' ? '🟠 Alta' :
                                                    actionPlan.priority === 'critical' ? '🔴 Crítica' : 'Não definida'}
                                            </Badge>
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                            <div>
                                              <Label className="text-sm font-medium mb-1 block">Nome da Atividade</Label>
                                              <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                                {actionPlan.activity_name || actionPlan.name || 'Atividade não definida'}
                                              </p>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium mb-1 block">Status</Label>
                                              <Badge variant="outline">
                                                {actionPlan.status}
                                              </Badge>
                                            </div>
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                            <div>
                                              <Label className="text-sm font-medium mb-1 block">Responsável</Label>
                                              <p className="text-sm text-gray-900 dark:text-gray-100">
                                                {actionPlan.responsible_name || actionPlan.responsible_person || 'Não atribuído'}
                                              </p>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium mb-1 block">E-mail</Label>
                                              <p className="text-sm text-gray-900 dark:text-gray-100">
                                                {actionPlan.responsible_email || 'Não informado'}
                                              </p>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium mb-1 block">Prazo</Label>
                                              <p className="text-sm text-gray-900 dark:text-gray-100">
                                                {formatDate(actionPlan.due_date || actionPlan.target_date) || 'Não definido'}
                                              </p>
                                            </div>
                                          </div>

                                          {(actionPlan.activity_description || actionPlan.description) && (
                                            <div className="mb-3">
                                              <Label className="text-sm font-medium mb-1 block">Descrição da Atividade</Label>
                                              <p className="text-sm text-muted-foreground">
                                                {actionPlan.activity_description || actionPlan.description}
                                              </p>
                                            </div>
                                          )}

                                          {/* Evidências com Preview */}
                                          {actionPlan.evidence_url && (
                                            <div className="mt-3 flex items-center gap-2 bg-muted/30 p-2 rounded border border-border">
                                              <FileText className="h-4 w-4 text-blue-500" />
                                              <span className="text-xs text-muted-foreground flex-1 truncate">{actionPlan.evidence_name || 'Evidência Anexada'}</span>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 text-xs text-blue-600 px-2"
                                                onClick={() => setEvidencePreview({ isOpen: true, url: actionPlan.evidence_url, title: actionPlan.activity_name || actionPlan.name || 'Evidência' })}
                                              >
                                                <Eye className="h-3 w-3 mr-1" /> Preview
                                              </Button>
                                            </div>
                                          )}

                                          {/* Botão de Validação do Analista */}
                                          {actionPlan.status !== 'completed' && actionPlan.status !== 'Concluído' && (
                                            <div className="mt-3 flex justify-end">
                                              <Button
                                                variant="default"
                                                size="sm"
                                                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                                onClick={() => handleValidateActionPlan(actionPlan.id, risk.id)}
                                              >
                                                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Validar Analista
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-sm text-muted-foreground italic">Nenhuma atividade nesta categoria.</p>
                                    )}
                                  </TabsContent>
                                );
                              })}
                            </Tabs>
                          </div>

                          {/* Resumo do Plano de Ação */}
                          <div className="border rounded-lg p-4 bg-card">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Activity className="h-4 w-4" />
                              Resumo do Plano
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium mb-2 block">Responsável Geral</Label>
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
                                <Label className="text-sm font-medium mb-2 block">Prazo Geral</Label>
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

                            <div className="mt-4">
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
                            <div className="mt-4">
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
                                  className={`h-2 rounded-full transition-all ${risk.status === 'Fechado' ? 'bg-green-500 w-full' :
                                    risk.status === 'Monitorado' ? 'bg-blue-500 w-3/4' :
                                      risk.status === 'Em Tratamento' ? 'bg-yellow-500 w-1/2' :
                                        risk.status === 'Avaliado' ? 'bg-orange-500 w-1/4' : 'bg-gray-400 w-0'
                                    }`}
                                />
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        {/* Etapa 6: Comunicação */}
                        <TabsContent value="communication" className="mt-4">
                          <CommunicationTab risk={risk} user={user} userTenantId={userTenantId} />
                        </TabsContent>

                        {/* Etapa 7: Monitoramento */}
                        <TabsContent value="monitoring" className="space-y-4 mt-4">
                          <div>
                            <Label className="text-sm font-medium mb-2 block">Indicadores de Monitoramento</Label>
                            {isEditing ? (
                              <Textarea
                                value={editForm.monitoring_indicators?.join('\n') || ''}
                                onChange={(e) => updateEditForm(risk.id, 'monitoring_indicators', e.target.value.split('\n'))}
                                placeholder="Defina os KPIs e métricas para monitorar este risco (um por linha)"
                                rows={4}
                              />
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                {risk.monitoring_indicators && risk.monitoring_indicators.length > 0 ? (
                                  <ul className="list-disc list-inside space-y-1">
                                    {risk.monitoring_indicators.map((indicator, index) => (
                                      <li key={index}>{indicator}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  'Nenhum indicador definido'
                                )}
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Frequência de Monitoramento</Label>
                              {isEditing ? (
                                <Select value={editForm.monitoring_frequency || ''} onValueChange={(value) => updateEditForm(risk.id, 'monitoring_frequency', value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="daily">Diário</SelectItem>
                                    <SelectItem value="weekly">Semanal</SelectItem>
                                    <SelectItem value="monthly">Mensal</SelectItem>
                                    <SelectItem value="quarterly">Trimestral</SelectItem>
                                    <SelectItem value="annually">Anual</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge variant="outline">
                                  {risk.monitoring_frequency === 'daily' ? 'Diário' :
                                    risk.monitoring_frequency === 'weekly' ? 'Semanal' :
                                      risk.monitoring_frequency === 'monthly' ? 'Mensal' :
                                        risk.monitoring_frequency === 'quarterly' ? 'Trimestral' :
                                          risk.monitoring_frequency === 'annually' ? 'Anual' :
                                            risk.monitoring_frequency || 'Não definido'}
                                </Badge>
                              )}
                            </div>

                            <div>
                              <Label className="text-sm font-medium mb-2 block">Responsável pelo Monitoramento</Label>
                              {isEditing ? (
                                <Input
                                  value={editForm.monitoring_responsible || ''}
                                  onChange={(e) => updateEditForm(risk.id, 'monitoring_responsible', e.target.value)}
                                  placeholder="Nome do responsável"
                                />
                              ) : (
                                <span className="text-sm">
                                  {risk.monitoring_responsible || 'Não atribuído'}
                                </span>
                              )}
                            </div>

                            <div>
                              <Label className="text-sm font-medium mb-2 block">Próxima Revisão</Label>
                              {isEditing ? (
                                <Input
                                  type="date"
                                  value={editForm.review_date || ''}
                                  onChange={(e) => updateEditForm(risk.id, 'review_date', e.target.value)}
                                />
                              ) : (
                                <span className="text-sm">
                                  {formatDate(risk.review_date) || 'Não agendado'}
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium mb-2 block">Notas de Monitoramento</Label>
                            {isEditing ? (
                              <Textarea
                                value={editForm.monitoring_notes || ''}
                                onChange={(e) => updateEditForm(risk.id, 'monitoring_notes', e.target.value)}
                                placeholder="Notas sobre o processo de monitoramento"
                                rows={3}
                              />
                            ) : (
                              <p className="text-sm text-muted-foreground whitespace-pre-line">
                                {risk.monitoring_notes || 'Nenhuma nota de monitoramento'}
                              </p>
                            )}
                          </div>

                          {/* Risco Residual */}
                          <div className="border rounded-lg p-4 bg-card">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Risco Residual (Após Tratamento)
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div>
                                <Label className="text-sm font-medium mb-2 block">Impacto Residual</Label>
                                {isEditing ? (
                                  <Select value={editForm.residual_impact?.toString() || ''} onValueChange={(value) => updateEditForm(risk.id, 'residual_impact', parseInt(value))}>
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
                                  <Badge variant="outline">
                                    {risk.residual_impact || 'N/A'}/5
                                  </Badge>
                                )}
                              </div>

                              <div>
                                <Label className="text-sm font-medium mb-2 block">Probabilidade Residual</Label>
                                {isEditing ? (
                                  <Select value={editForm.residual_likelihood?.toString() || ''} onValueChange={(value) => updateEditForm(risk.id, 'residual_likelihood', parseInt(value))}>
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
                                ) : (
                                  <Badge variant="outline">
                                    {risk.residual_likelihood || 'N/A'}/5
                                  </Badge>
                                )}
                              </div>

                              <div>
                                <Label className="text-sm font-medium mb-2 block">Score Residual</Label>
                                <Badge className="text-lg px-3 py-1">
                                  {risk.residual_score || (risk.residual_impact && risk.residual_likelihood ? risk.residual_impact * risk.residual_likelihood : 'N/A')}
                                </Badge>
                              </div>

                              <div>
                                <Label className="text-sm font-medium mb-2 block">Nível Residual</Label>
                                <Badge className={`${getRiskLevelColor(risk.residual_risk_level || 'Médio')} text-xs`}>
                                  {risk.residual_risk_level || 'Não calculado'}
                                </Badge>
                              </div>
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

                        {/* CARTA DE RISCO — only for accepted risks */}
                        {isRiskAccepted(risk) && (
                          <TabsContent value="carta-risco" className="space-y-6 mt-4">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex-shrink-0">
                                  <FileText className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">Carta de Aceite de Risco</h4>
                                  <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-0.5">
                                    Documento formal de aceitação do risco. Todos os aprovadores confirmaram.
                                  </p>
                                </div>
                              </div>
                              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 flex-shrink-0">
                                <CheckCircle className="h-3 w-3 mr-1" /> Aceito
                              </Badge>
                            </div>

                            {/* Risk summary */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {[
                                { label: 'Risco', value: risk.name },
                                { label: 'Categoria', value: risk.category },
                                { label: 'Nível', value: risk.riskLevel },
                                { label: 'Score', value: String(risk.riskScore) },
                                { label: 'Tipo de Aceite', value: (risk as any).acceptance_type === 'definitivo' ? 'Definitivo' : 'Temporário' },
                                { label: 'Responsável', value: risk.assignedTo || risk.owner || '—' },
                              ].map(({ label, value }) => (
                                <div key={label} className="p-3 bg-muted/40 rounded-lg">
                                  <p className="text-xs text-muted-foreground font-medium uppercase">{label}</p>
                                  <p className="text-sm font-semibold mt-0.5 truncate" title={value}>{value || '—'}</p>
                                </div>
                              ))}
                            </div>

                            {/* Justification */}
                            {(risk as any).treatment_rationale && (
                              <div className="p-4 border rounded-lg bg-card">
                                <Label className="text-sm font-medium mb-2 block">Justificativa do Aceite</Label>
                                <p className="text-sm text-muted-foreground">{(risk as any).treatment_rationale}</p>
                              </div>
                            )}

                            {/* Approvers */}
                            {(() => {
                              const approvers: TreatmentApprover[] = (risk as any).treatment_approvers || [];
                              if (approvers.length === 0) return null;
                              return (
                                <div className="p-4 border rounded-lg bg-card">
                                  <Label className="text-sm font-medium mb-3 block flex items-center gap-1.5">
                                    <UserCheck className="h-4 w-4 text-emerald-600" />
                                    Aprovadores
                                  </Label>
                                  <div className="space-y-2">
                                    {approvers.map((a) => (
                                      <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <div>
                                          <p className="text-sm font-medium">{a.name}</p>
                                          <p className="text-xs text-muted-foreground">{a.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {a.approved ? (
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                                              <CheckCircle className="h-3 w-3 mr-1" />
                                              Aprovado {a.approved_at ? `em ${formatDate(a.approved_at)}` : ''}
                                            </Badge>
                                          ) : (
                                            <Badge variant="outline" className="text-xs">
                                              <Clock className="h-3 w-3 mr-1" /> Pendente
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}

                            {/* PDF / DOC actions */}
                            <div className="p-4 border rounded-lg bg-card">
                              <Label className="text-sm font-medium mb-3 block">Emitir Documento</Label>
                              <p className="text-xs text-muted-foreground mb-4">
                                Gere a Carta de Aceite de Risco em PDF ou Word com todos os dados do risco, aprovadores e justificativas.
                              </p>
                              <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                  disabled={isPrintGenerating}
                                  onClick={() => {
                                    const approvers: TreatmentApprover[] = (risk as any).treatment_approvers || [];
                                    const firstApprover = approvers[0];
                                    printRiskAcceptancePDF({
                                      id: risk.id,
                                      risk_id: risk.id,
                                      riskCode: (risk as any).riskCode,
                                      risk_title: risk.name,
                                      risk_description: risk.description || '',
                                      risk_category: risk.category,
                                      risk_level: risk.riskLevel,
                                      risk_score: risk.riskScore,
                                      residual_risk_score: (risk as any).residual_score || risk.riskScore,
                                      acceptance_reason: (risk as any).treatment_rationale || '',
                                      accepted_by: firstApprover?.name || risk.assignedTo || risk.owner || 'Aprovado',
                                      accepted_by_role: '',
                                      accepted_by_email: firstApprover?.email || '',
                                      acceptance_date: firstApprover?.approved_at || new Date().toISOString(),
                                      review_schedule: 'annual',
                                      next_review_date: risk.dueDate?.toISOString() || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
                                      status: 'active',
                                      monitoring_frequency: (risk as any).monitoring_frequency || 'Mensal',
                                      created_at: risk.createdAt.toISOString(),
                                      updated_at: risk.updatedAt.toISOString(),
                                      probability_score: risk.probability,
                                      impact_score: risk.impact,
                                    });
                                  }}
                                >
                                  {isPrintGenerating ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Download className="h-4 w-4 mr-2" />
                                  )}
                                  Gerar PDF
                                </Button>
                                <Button
                                  variant="outline"
                                  className="flex-1"
                                  disabled={isPrintGenerating}
                                  onClick={() => {
                                    const approvers: TreatmentApprover[] = (risk as any).treatment_approvers || [];
                                    const firstApprover = approvers[0];
                                    printRiskAcceptanceDOC({
                                      id: risk.id,
                                      risk_id: risk.id,
                                      riskCode: (risk as any).riskCode,
                                      risk_title: risk.name,
                                      risk_description: risk.description || '',
                                      risk_category: risk.category,
                                      risk_level: risk.riskLevel,
                                      risk_score: risk.riskScore,
                                      residual_risk_score: (risk as any).residual_score || risk.riskScore,
                                      acceptance_reason: (risk as any).treatment_rationale || '',
                                      accepted_by: firstApprover?.name || risk.assignedTo || risk.owner || 'Aprovado',
                                      accepted_by_role: '',
                                      accepted_by_email: firstApprover?.email || '',
                                      acceptance_date: firstApprover?.approved_at || new Date().toISOString(),
                                      review_schedule: 'annual',
                                      next_review_date: risk.dueDate?.toISOString() || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
                                      status: 'active',
                                      monitoring_frequency: (risk as any).monitoring_frequency || 'Mensal',
                                      created_at: risk.createdAt.toISOString(),
                                      updated_at: risk.updatedAt.toISOString(),
                                      probability_score: risk.probability,
                                      impact_score: risk.impact,
                                    });
                                  }}
                                >
                                  {isPrintGenerating ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <FileText className="h-4 w-4 mr-2" />
                                  )}
                                  Gerar Word (.docx)
                                </Button>
                              </div>
                            </div>
                          </TabsContent>
                        )}
                      </Tabs>
                    </div>
                  </CardContent>
                )}
                </Card>
              );
            })
          )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* ── Dialog: Risco Residual obrigatório para fechar ── */}
      <Dialog open={!!residualWarningRiskId} onOpenChange={(open) => { if (!open) setResidualWarningRiskId(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              Risco Residual não preenchido
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Para encerrar este risco é obrigatório informar o <strong>Impacto Residual</strong> e a{' '}
              <strong>Probabilidade Residual</strong> — dados que registram o nível de risco remanescente após as ações de tratamento.
            </p>
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3 text-sm text-amber-800 dark:text-amber-300 space-y-1">
              <p className="font-medium">Como preencher:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Abra o card do risco e acesse a aba <strong>Monitoramento</strong></li>
                <li>Edite o risco (clique em Editar)</li>
                <li>Preencha os campos <strong>Impacto Residual</strong> e <strong>Probabilidade Residual</strong></li>
                <li>Salve e então altere o status para Fechado</li>
              </ol>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setResidualWarningRiskId(null)}>
                Entendido
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Preview de Evidência */}
      <Dialog open={evidencePreview.isOpen} onOpenChange={(open) => setEvidencePreview(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{evidencePreview.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden rounded-md border bg-muted/30 relative flex items-center justify-center min-h-[500px]">
            {evidencePreview.url ? (
              evidencePreview.url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                <img src={evidencePreview.url} alt="Evidence" className="max-w-full max-h-full object-contain" />
              ) : evidencePreview.url.match(/\.pdf$/i) ? (
                <iframe src={`${evidencePreview.url}#toolbar=0`} className="w-full h-full border-0 min-h-[60vh]"></iframe>
              ) : (
                <div className="text-center p-8 bg-card rounded-lg shadow-sm border max-w-sm">
                  <FileText className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Este tipo de arquivo não suporta preview direto.
                  </p>
                  <Button asChild>
                    <a href={evidencePreview.url} target="_blank" rel="noopener noreferrer" download>
                      <Download className="h-4 w-4 mr-2" /> Baixar Arquivo
                    </a>
                  </Button>
                </div>
              )
            ) : (
              <p className="text-sm text-muted-foreground">URL não encontrada.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
};

// Exportação default para compatibilidade
export default ExpandableCardsView;