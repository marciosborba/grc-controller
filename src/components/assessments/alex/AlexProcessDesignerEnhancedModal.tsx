import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Settings2, Edit, Workflow, BarChart3, FileText, Network, 
  Save, Plus, Grid, Eye, Boxes, Map, Settings, PlayCircle,
  Download, RefreshCw, Share2, Globe, X, Maximize2, Minimize2,
  Trash2, Move, GripVertical, Columns, RotateCcw, Database,
  Upload, Star, Hash, Mail, Calendar, Clock, ChevronDown,
  CheckSquare, Circle, Sliders, Zap, Sparkles, Layout,
  ArrowRight, CheckCircle, AlertCircle, Users, Timer,
  GitBranch, MessageSquare, Bell, Gauge, TrendingUp,
  BarChart, PieChart, LineChart, Award, Shield, Cog,
  Lock, Phone, Link, CalendarDays, ToggleLeft, Image,
  Minus, Palette, Tag, PenTool
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContextOptimized';

// ==================== INTERFACES EXPANDIDAS ====================

// Form Builder Interfaces
interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  rowId: string;
  rowIndex: number;
  column: number;
  width: number;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    regex?: string;
    customMessage?: string;
  };
  conditionalLogic?: {
    showWhen?: {
      fieldId: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
      value: any;
    };
    requiredWhen?: {
      fieldId: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
      value: any;
    };
  };
  calculatedValue?: {
    formula: string;
    dependsOn: string[];
  };
}

interface FormRow {
  id: string;
  columns: number;
  height: string;
  columnWidths: string[];
}

// Workflow Engine Interfaces
interface WorkflowNode {
  id: string;
  type: 'start' | 'task' | 'decision' | 'parallel' | 'end' | 'timer' | 'notification';
  label: string;
  position: { x: number; y: number };
  data: {
    assignedTo?: string[];
    dueDate?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    formId?: string;
    condition?: string;
    timerDuration?: string;
    notificationTemplate?: string;
  };
  connections: string[]; // IDs dos próximos nós
}

interface WorkflowInstance {
  id: string;
  processId: string;
  status: 'draft' | 'active' | 'completed' | 'suspended' | 'error';
  currentNodes: string[];
  processData: Record<string, any>;
  participants: string[];
  startedAt: string;
  completedAt?: string;
  slaDeadline?: string;
}

// Process Template Interfaces
interface ProcessTemplate {
  id: string;
  name: string;
  description: string;
  category: 'compliance' | 'audit' | 'risk' | 'policy' | 'incident' | 'assessment' | 'custom';
  icon: string;
  tags: string[];
  formStructure: FormRow[];
  formFields: FormField[];
  workflowNodes: WorkflowNode[];
  analytics: {
    kpis: string[];
    reports: string[];
  };
  integrations: string[];
  estimatedTime: string;
  complexity: 'simple' | 'medium' | 'complex';
}

// Analytics & Reporting Interfaces
interface ProcessMetrics {
  completionRate: number;
  averageTime: number;
  bottlenecks: string[];
  slaCompliance: number;
  userSatisfaction: number;
  errorRate: number;
}

interface AlexProcessDesignerEnhancedModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  initialData?: any;
  onSave?: (data: any) => void;
}

const AlexProcessDesignerEnhancedModal: React.FC<AlexProcessDesignerEnhancedModalProps> = ({
  isOpen,
  onClose,
  mode = 'create',
  initialData,
  onSave
}) => {
  const { user } = useAuth();
  const [activeLayer, setActiveLayer] = useState<'template' | 'form' | 'workflow' | 'analytics' | 'reports' | 'integrations'>('template');
  const [isMaximized, setIsMaximized] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProcessTemplate | null>(null);
  
  // Estados do Form Builder
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [draggedField, setDraggedField] = useState<any | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<number | null>(null);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [formRows, setFormRows] = useState<FormRow[]>([]);
  
  // Estados do Workflow Engine
  const [workflowNodes, setWorkflowNodes] = useState<WorkflowNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  
  // Estados do Processo
  const [processName, setProcessName] = useState('');
  const [processDescription, setProcessDescription] = useState('');
  const [processCategory, setProcessCategory] = useState<'compliance' | 'audit' | 'risk' | 'policy' | 'incident' | 'assessment' | 'custom'>('custom');
  
  // ==================== TEMPLATES PRÉ-CONFIGURADOS ====================
  const processTemplates: ProcessTemplate[] = [
    {
      id: 'compliance-basic',
      name: 'Avaliação de Compliance Básica',
      description: 'Template para avaliações de conformidade regulatória',
      category: 'compliance',
      icon: 'Shield',
      tags: ['LGPD', 'SOX', 'ISO27001'],
      estimatedTime: '2-4 semanas',
      complexity: 'medium',
      formStructure: [],
      formFields: [],
      workflowNodes: [],
      analytics: { kpis: ['Conformidade', 'Tempo de Resposta'], reports: ['Relatório de Gaps'] },
      integrations: ['email', 'webhook']
    },
    {
      id: 'risk-assessment',
      name: 'Avaliação de Riscos',
      description: 'Processo completo de identificação e avaliação de riscos',
      category: 'risk',
      icon: 'AlertCircle',
      tags: ['Riscos', 'Impacto', 'Probabilidade'],
      estimatedTime: '1-2 semanas',
      complexity: 'medium',
      formStructure: [],
      formFields: [],
      workflowNodes: [],
      analytics: { kpis: ['Nível de Risco', 'Planos de Ação'], reports: ['Matriz de Riscos'] },
      integrations: ['email', 'dashboard']
    },
    {
      id: 'audit-checklist',
      name: 'Checklist de Auditoria',
      description: 'Template para auditorias internas e externas',
      category: 'audit',
      icon: 'CheckCircle',
      tags: ['Auditoria', 'Checklist', 'Evidências'],
      estimatedTime: '1-3 semanas',
      complexity: 'simple',
      formStructure: [],
      formFields: [],
      workflowNodes: [],
      analytics: { kpis: ['Conformidade', 'Não-conformidades'], reports: ['Relatório de Auditoria'] },
      integrations: ['file-upload', 'email']
    },
    {
      id: 'incident-management',
      name: 'Gestão de Incidentes',
      description: 'Workflow para registro e tratamento de incidentes de segurança',
      category: 'incident',
      icon: 'AlertCircle',
      tags: ['Incidentes', 'Segurança', 'Resposta'],
      estimatedTime: '1-2 dias',
      complexity: 'simple',
      formStructure: [],
      formFields: [],
      workflowNodes: [],
      analytics: { kpis: ['Tempo de Resposta', 'Taxa de Resolução'], reports: ['Log de Incidentes'] },
      integrations: ['notification', 'escalation']
    },
    {
      id: 'policy-review',
      name: 'Revisão de Políticas',
      description: 'Processo de revisão e aprovação de políticas organizacionais',
      category: 'policy',
      icon: 'FileText',
      tags: ['Políticas', 'Revisão', 'Aprovação'],
      estimatedTime: '2-6 semanas',
      complexity: 'complex',
      formStructure: [],
      formFields: [],
      workflowNodes: [],
      analytics: { kpis: ['Políticas Atualizadas', 'Tempo de Aprovação'], reports: ['Status das Políticas'] },
      integrations: ['document-management', 'approval-workflow']
    },
    {
      id: 'custom-blank',
      name: 'Processo Personalizado',
      description: 'Começar do zero com um processo totalmente customizado',
      category: 'custom',
      icon: 'Sparkles',
      tags: ['Personalizado', 'Flexível'],
      estimatedTime: 'Variável',
      complexity: 'simple',
      formStructure: [],
      formFields: [],
      workflowNodes: [],
      analytics: { kpis: [], reports: [] },
      integrations: []
    }
  ];

  // Definição dos tipos de campos disponíveis
  const fieldTypes = {
    basic: [
      { type: 'text', label: 'Texto', icon: Edit, color: 'bg-blue-100', description: 'Campo de texto simples' },
      { type: 'number', label: 'Número', icon: Hash, color: 'bg-green-100', description: 'Números e valores' },
      { type: 'email', label: 'Email', icon: Mail, color: 'bg-yellow-100', description: 'Endereço de email' },
      { type: 'password', label: 'Senha', icon: Lock, color: 'bg-gray-100', description: 'Campo de senha' },
      { type: 'phone', label: 'Telefone', icon: Phone, color: 'bg-green-100', description: 'Número de telefone' },
      { type: 'url', label: 'URL', icon: Link, color: 'bg-blue-100', description: 'Endereço web' },
      { type: 'date', label: 'Data', icon: Calendar, color: 'bg-purple-100', description: 'Seletor de data' },
      { type: 'time', label: 'Hora', icon: Clock, color: 'bg-pink-100', description: 'Seletor de hora' },
      { type: 'datetime', label: 'Data/Hora', icon: Calendar, color: 'bg-indigo-100', description: 'Data e hora juntas' },
      { type: 'select', label: 'Seleção', icon: ChevronDown, color: 'bg-indigo-100', description: 'Lista de opções' },
      { type: 'textarea', label: 'Texto Longo', icon: FileText, color: 'bg-cyan-100', description: 'Área de texto expandida' }
    ],
    advanced: [
      { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, color: 'bg-orange-100', description: 'Múltiplas seleções' },
      { type: 'radio', label: 'Radio', icon: Circle, color: 'bg-red-100', description: 'Seleção única' },
      { type: 'dropdown', label: 'Dropdown', icon: ChevronDown, color: 'bg-slate-100', description: 'Lista suspensa avançada' },
      { type: 'switch', label: 'Switch', icon: ToggleLeft, color: 'bg-teal-100', description: 'Interruptor on/off' },
      { type: 'file', label: 'Upload', icon: Upload, color: 'bg-teal-100', description: 'Upload de arquivos' },
      { type: 'image', label: 'Imagem', icon: Image, color: 'bg-purple-100', description: 'Upload de imagem' },
      { type: 'rating', label: 'Avaliação', icon: Star, color: 'bg-amber-100', description: 'Sistema de estrelas' },
      { type: 'slider', label: 'Slider', icon: Sliders, color: 'bg-lime-100', description: 'Controle deslizante' },
      { type: 'range', label: 'Faixa', icon: Minus, color: 'bg-gray-100', description: 'Seleção de faixa' },
      { type: 'color', label: 'Cor', icon: Palette, color: 'bg-pink-100', description: 'Seletor de cor' },
      { type: 'tags', label: 'Tags', icon: Tag, color: 'bg-cyan-100', description: 'Múltiplas tags' }
    ],
    workflow: [
      { type: 'approval', label: 'Aprovação', icon: CheckCircle, color: 'bg-emerald-100', description: 'Campo de aprovação' },
      { type: 'assignee', label: 'Responsável', icon: Users, color: 'bg-violet-100', description: 'Atribuir responsável' },
      { type: 'priority', label: 'Prioridade', icon: Zap, color: 'bg-red-100', description: 'Nível de prioridade' },
      { type: 'status', label: 'Status', icon: Gauge, color: 'bg-blue-100', description: 'Status do processo' },
      { type: 'due_date', label: 'Prazo', icon: CalendarDays, color: 'bg-orange-100', description: 'Data limite' },
      { type: 'comments', label: 'Comentários', icon: MessageSquare, color: 'bg-green-100', description: 'Área de comentários' },
      { type: 'signature', label: 'Assinatura', icon: PenTool, color: 'bg-indigo-100', description: 'Assinatura digital' },
      { type: 'timer', label: 'Cronômetro', icon: Timer, color: 'bg-yellow-100', description: 'Controle de tempo' }
    ]
  };

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormFields(initialData.formFields || []);
      setFormRows(initialData.formRows || []);
      setWorkflowNodes(initialData.workflowNodes || []);
      setProcessName(initialData.processName || '');
      setProcessDescription(initialData.processDescription || '');
      setProcessCategory(initialData.processCategory || 'custom');
    }
  }, [initialData, mode]);

  useEffect(() => {
    if (selectedTemplate && selectedTemplate.id !== 'custom-blank') {
      loadTemplate(selectedTemplate);
    }
  }, [selectedTemplate]);

  if (!isOpen) return null;

  // ==================== TEMPLATE MANAGEMENT ====================
  const loadTemplate = useCallback((template: ProcessTemplate) => {
    setProcessName(template.name);
    setProcessDescription(template.description);
    setProcessCategory(template.category);
    
    // Carregar estrutura pré-definida baseada no tipo do template
    if (template.id === 'compliance-basic') {
      const basicComplianceStructure = createComplianceTemplate();
      setFormFields(basicComplianceStructure.fields);
      setFormRows(basicComplianceStructure.rows);
      setWorkflowNodes(basicComplianceStructure.workflow);
    } else if (template.id === 'risk-assessment') {
      const riskAssessmentStructure = createRiskAssessmentTemplate();
      setFormFields(riskAssessmentStructure.fields);
      setFormRows(riskAssessmentStructure.rows);
      setWorkflowNodes(riskAssessmentStructure.workflow);
    } else if (template.id === 'audit-checklist') {
      const auditChecklistStructure = createAuditChecklistTemplate();
      setFormFields(auditChecklistStructure.fields);
      setFormRows(auditChecklistStructure.rows);
      setWorkflowNodes(auditChecklistStructure.workflow);
    }
    
    setHasUnsavedChanges(true);
    setActiveLayer('form');
    toast.success(`Template "${template.name}" carregado!`);
  }, []);

  const handleSave = () => {
    if (!processName.trim()) {
      toast.error('Nome do processo é obrigatório!');
      return;
    }

    const data = {
      processName,
      processDescription,
      processCategory,
      layer: activeLayer,
      formFields,
      formRows,
      workflowNodes,
      template: selectedTemplate,
      timestamp: new Date().toISOString(),
      user: user?.id,
      metadata: {
        estimatedTime: selectedTemplate?.estimatedTime,
        complexity: selectedTemplate?.complexity,
        tags: selectedTemplate?.tags || []
      }
    };
    
    if (onSave) {
      onSave(data);
    }
    
    setHasUnsavedChanges(false);
    toast.success(`Processo "${processName}" ${mode === 'create' ? 'criado' : 'salvo'} com sucesso!`);
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('Você tem alterações não salvas. Deseja sair mesmo assim?')) {
        resetModal();
        onClose();
      }
    } else {
      resetModal();
      onClose();
    }
  };

  const resetModal = () => {
    setActiveLayer('template');
    setFormFields([]);
    setFormRows([]);
    setWorkflowNodes([]);
    setSelectedField(null);
    setSelectedNode(null);
    setSelectedTemplate(null);
    setProcessName('');
    setProcessDescription('');
    setProcessCategory('custom');
    setHasUnsavedChanges(false);
    setShowPreview(false);
  };

  // ==================== TEMPLATE CREATION FUNCTIONS ====================
  
  const createComplianceTemplate = useCallback(() => {
    const rows: FormRow[] = [
      { id: 'row_1', columns: 2, height: 'auto', columnWidths: ['2fr', '1fr'] },
      { id: 'row_2', columns: 1, height: 'auto', columnWidths: ['1fr'] },
      { id: 'row_3', columns: 3, height: 'auto', columnWidths: ['1fr', '1fr', '1fr'] },
      { id: 'row_4', columns: 2, height: 'large', columnWidths: ['1fr', '1fr'] }
    ];
    
    const fields: FormField[] = [
      {
        id: 'field_framework', type: 'select', label: 'Framework de Compliance', required: true,
        rowId: 'row_1', rowIndex: 0, column: 0, width: 1, placeholder: 'Selecione o framework',
        options: ['LGPD', 'ISO 27001', 'SOX', 'PCI-DSS', 'NIST', 'Outro']
      },
      {
        id: 'field_priority', type: 'select', label: 'Prioridade', required: true,
        rowId: 'row_1', rowIndex: 0, column: 1, width: 1, placeholder: 'Nível de prioridade',
        options: ['Baixa', 'Média', 'Alta', 'Crítica']
      },
      {
        id: 'field_description', type: 'textarea', label: 'Descrição da Avaliação', required: true,
        rowId: 'row_2', rowIndex: 1, column: 0, width: 1, placeholder: 'Descreva o escopo e objetivos da avaliação...'
      },
      {
        id: 'field_score', type: 'select', label: 'Nível de Conformidade', required: true,
        rowId: 'row_3', rowIndex: 2, column: 0, width: 1, placeholder: 'Avalie o nível',
        options: ['1 - Não Conforme', '2 - Parcialmente Conforme', '3 - Conforme', '4 - Totalmente Conforme', '5 - Excelente']
      },
      {
        id: 'field_impact', type: 'select', label: 'Impacto do Gap', required: true,
        rowId: 'row_3', rowIndex: 2, column: 1, width: 1, placeholder: 'Nível de impacto',
        options: ['Baixo', 'Médio', 'Alto', 'Muito Alto']
      },
      {
        id: 'field_deadline', type: 'date', label: 'Prazo para Conformidade', required: true,
        rowId: 'row_3', rowIndex: 2, column: 2, width: 1, placeholder: ''
      },
      {
        id: 'field_evidence', type: 'file', label: 'Evidências', required: false,
        rowId: 'row_4', rowIndex: 3, column: 0, width: 1, placeholder: 'Upload de evidências'
      },
      {
        id: 'field_action_plan', type: 'textarea', label: 'Plano de Ação', required: false,
        rowId: 'row_4', rowIndex: 3, column: 1, width: 1, placeholder: 'Descreva as ações corretivas necessárias...'
      }
    ];
    
    const workflow: WorkflowNode[] = [
      {
        id: 'start', type: 'start', label: 'Início da Avaliação', position: { x: 100, y: 100 },
        data: {}, connections: ['assessment']
      },
      {
        id: 'assessment', type: 'task', label: 'Preenchimento da Avaliação', position: { x: 300, y: 100 },
        data: { assignedTo: ['respondent'], priority: 'medium' }, connections: ['review']
      },
      {
        id: 'review', type: 'task', label: 'Revisão Técnica', position: { x: 500, y: 100 },
        data: { assignedTo: ['auditor'], priority: 'high' }, connections: ['approval']
      },
      {
        id: 'approval', type: 'decision', label: 'Aprovação Final', position: { x: 700, y: 100 },
        data: { assignedTo: ['manager'], condition: 'score >= 3' }, connections: ['end', 'correction']
      },
      {
        id: 'correction', type: 'task', label: 'Correção/Melhoria', position: { x: 700, y: 250 },
        data: { assignedTo: ['respondent'], priority: 'high' }, connections: ['review']
      },
      {
        id: 'end', type: 'end', label: 'Avaliação Concluída', position: { x: 900, y: 100 },
        data: {}, connections: []
      }
    ];
    
    return { rows, fields, workflow };
  }, []);
  
  const createRiskAssessmentTemplate = useCallback(() => {
    const rows: FormRow[] = [
      { id: 'row_1', columns: 2, height: 'auto', columnWidths: ['1fr', '1fr'] },
      { id: 'row_2', columns: 1, height: 'auto', columnWidths: ['1fr'] },
      { id: 'row_3', columns: 3, height: 'auto', columnWidths: ['1fr', '1fr', '1fr'] },
      { id: 'row_4', columns: 2, height: 'auto', columnWidths: ['1fr', '1fr'] }
    ];
    
    const fields: FormField[] = [
      {
        id: 'risk_category', type: 'select', label: 'Categoria do Risco', required: true,
        rowId: 'row_1', rowIndex: 0, column: 0, width: 1, placeholder: 'Selecione a categoria',
        options: ['Operacional', 'Financeiro', 'Estratégico', 'Regulatório', 'Reputacional', 'Tecnológico']
      },
      {
        id: 'risk_owner', type: 'select', label: 'Responsável pelo Risco', required: true,
        rowId: 'row_1', rowIndex: 0, column: 1, width: 1, placeholder: 'Selecione o responsável',
        options: ['TI', 'Financeiro', 'RH', 'Operações', 'Compliance', 'Jurídico']
      },
      {
        id: 'risk_description', type: 'textarea', label: 'Descrição do Risco', required: true,
        rowId: 'row_2', rowIndex: 1, column: 0, width: 1, placeholder: 'Descreva detalhadamente o risco identificado...'
      },
      {
        id: 'probability', type: 'select', label: 'Probabilidade', required: true,
        rowId: 'row_3', rowIndex: 2, column: 0, width: 1, placeholder: 'Nível de probabilidade',
        options: ['1 - Muito Baixa', '2 - Baixa', '3 - Média', '4 - Alta', '5 - Muito Alta']
      },
      {
        id: 'impact', type: 'select', label: 'Impacto', required: true,
        rowId: 'row_3', rowIndex: 2, column: 1, width: 1, placeholder: 'Nível de impacto',
        options: ['1 - Insignificante', '2 - Baixo', '3 - Moderado', '4 - Alto', '5 - Catastrófico']
      },
      {
        id: 'risk_level', type: 'select', label: 'Nível do Risco (P x I)', required: true,
        rowId: 'row_3', rowIndex: 2, column: 2, width: 1, placeholder: 'Calculado automaticamente',
        options: ['1-4 - Baixo', '5-9 - Médio', '10-14 - Alto', '15-25 - Crítico'],
        calculatedValue: { formula: 'probability * impact', dependsOn: ['probability', 'impact'] }
      },
      {
        id: 'current_controls', type: 'textarea', label: 'Controles Atuais', required: false,
        rowId: 'row_4', rowIndex: 3, column: 0, width: 1, placeholder: 'Descreva os controles existentes...'
      },
      {
        id: 'action_plan', type: 'textarea', label: 'Plano de Tratamento', required: true,
        rowId: 'row_4', rowIndex: 3, column: 1, width: 1, placeholder: 'Descreva as ações de mitigação...'
      }
    ];
    
    const workflow: WorkflowNode[] = [
      {
        id: 'start', type: 'start', label: 'Identificação do Risco', position: { x: 100, y: 100 },
        data: {}, connections: ['assessment']
      },
      {
        id: 'assessment', type: 'task', label: 'Avaliação de Risco', position: { x: 300, y: 100 },
        data: { assignedTo: ['risk_analyst'], priority: 'medium' }, connections: ['validation']
      },
      {
        id: 'validation', type: 'task', label: 'Validação pelo Gestor', position: { x: 500, y: 100 },
        data: { assignedTo: ['risk_manager'], priority: 'high' }, connections: ['treatment']
      },
      {
        id: 'treatment', type: 'task', label: 'Definição do Tratamento', position: { x: 700, y: 100 },
        data: { assignedTo: ['risk_owner'], priority: 'high' }, connections: ['approval']
      },
      {
        id: 'approval', type: 'decision', label: 'Aprovação do Plano', position: { x: 900, y: 100 },
        data: { assignedTo: ['cro'], condition: 'risk_level > 10' }, connections: ['end', 'revision']
      },
      {
        id: 'revision', type: 'task', label: 'Revisão do Plano', position: { x: 900, y: 250 },
        data: { assignedTo: ['risk_analyst'], priority: 'high' }, connections: ['treatment']
      },
      {
        id: 'end', type: 'end', label: 'Risco Cadastrado', position: { x: 1100, y: 100 },
        data: {}, connections: []
      }
    ];
    
    return { rows, fields, workflow };
  }, []);
  
  const createAuditChecklistTemplate = useCallback(() => {
    const rows: FormRow[] = [
      { id: 'row_1', columns: 2, height: 'auto', columnWidths: ['2fr', '1fr'] },
      { id: 'row_2', columns: 1, height: 'auto', columnWidths: ['1fr'] },
      { id: 'row_3', columns: 2, height: 'auto', columnWidths: ['1fr', '1fr'] },
      { id: 'row_4', columns: 1, height: 'large', columnWidths: ['1fr'] }
    ];
    
    const fields: FormField[] = [
      {
        id: 'audit_area', type: 'select', label: 'Área de Auditoria', required: true,
        rowId: 'row_1', rowIndex: 0, column: 0, width: 1, placeholder: 'Selecione a área',
        options: ['TI', 'Financeiro', 'RH', 'Operações', 'Compliance', 'Qualidade', 'Segurança']
      },
      {
        id: 'audit_type', type: 'select', label: 'Tipo de Auditoria', required: true,
        rowId: 'row_1', rowIndex: 0, column: 1, width: 1, placeholder: 'Tipo da auditoria',
        options: ['Interna', 'Externa', 'Regulatória', 'Certificação', 'Due Diligence']
      },
      {
        id: 'audit_scope', type: 'textarea', label: 'Escopo da Auditoria', required: true,
        rowId: 'row_2', rowIndex: 1, column: 0, width: 1, placeholder: 'Descreva o escopo e objetivos da auditoria...'
      },
      {
        id: 'compliance_status', type: 'select', label: 'Status de Conformidade', required: true,
        rowId: 'row_3', rowIndex: 2, column: 0, width: 1, placeholder: 'Status atual',
        options: ['Conforme', 'Não Conforme', 'Parcialmente Conforme', 'Não Aplicável', 'Pendente']
      },
      {
        id: 'finding_severity', type: 'select', label: 'Severidade do Achado', required: false,
        rowId: 'row_3', rowIndex: 2, column: 1, width: 1, placeholder: 'Nível de severidade',
        options: ['Baixa', 'Média', 'Alta', 'Crítica'],
        conditionalLogic: { showWhen: { fieldId: 'compliance_status', operator: 'equals', value: 'Não Conforme' } }
      },
      {
        id: 'observations', type: 'textarea', label: 'Observações e Evidências', required: false,
        rowId: 'row_4', rowIndex: 3, column: 0, width: 1, placeholder: 'Descreva os achados, evidências coletadas e recomendações...'
      }
    ];
    
    const workflow: WorkflowNode[] = [
      {
        id: 'start', type: 'start', label: 'Início da Auditoria', position: { x: 100, y: 100 },
        data: {}, connections: ['planning']
      },
      {
        id: 'planning', type: 'task', label: 'Planejamento', position: { x: 300, y: 100 },
        data: { assignedTo: ['auditor'], priority: 'medium' }, connections: ['execution']
      },
      {
        id: 'execution', type: 'task', label: 'Execução da Auditoria', position: { x: 500, y: 100 },
        data: { assignedTo: ['auditor'], priority: 'high' }, connections: ['review']
      },
      {
        id: 'review', type: 'task', label: 'Revisão dos Achados', position: { x: 700, y: 100 },
        data: { assignedTo: ['auditee'], priority: 'medium' }, connections: ['reporting']
      },
      {
        id: 'reporting', type: 'task', label: 'Elaboração do Relatório', position: { x: 900, y: 100 },
        data: { assignedTo: ['auditor'], priority: 'high' }, connections: ['end']
      },
      {
        id: 'end', type: 'end', label: 'Auditoria Concluída', position: { x: 1100, y: 100 },
        data: {}, connections: []
      }
    ];
    
    return { rows, fields, workflow };
  }, []);

  // ==================== FUNÇÕES DE GERENCIAMENTO DE LINHAS ====================

  const addNewRow = useCallback((columns: number = 2) => {
    const newRow: FormRow = {
      id: `row_${Date.now()}`,
      columns: columns,
      height: 'auto',
      columnWidths: Array(columns).fill('1fr')
    };
    setFormRows(prev => [...prev, newRow]);
    setHasUnsavedChanges(true);
    toast.success(`Nova linha adicionada com ${columns} coluna${columns > 1 ? 's' : ''}!`);
  }, []);

  const removeRow = useCallback((rowId: string) => {
    if (formRows.length <= 1) {
      toast.error('Deve haver pelo menos uma linha no formulário');
      return;
    }
    
    // Remover campos da linha
    const fieldsToRemove = formFields.filter(field => field.rowId === rowId);
    const remainingFields = formFields.filter(field => field.rowId !== rowId);
    
    setFormFields(remainingFields);
    setFormRows(prev => prev.filter(row => row.id !== rowId));
    setHasUnsavedChanges(true);
    
    if (fieldsToRemove.length > 0) {
      toast.info(`${fieldsToRemove.length} campo(s) removido(s) junto com a linha`);
    }
    toast.success('Linha removida!');
  }, [formRows, formFields]);

  const updateRowColumns = useCallback((rowId: string, columns: number) => {
    setFormRows(prev => prev.map(row => {
      if (row.id === rowId) {
        const newColumnWidths = Array(columns).fill('1fr');
        // Preservar larguras existentes quando possível
        for (let i = 0; i < Math.min(columns, row.columnWidths.length); i++) {
          newColumnWidths[i] = row.columnWidths[i];
        }
        return { ...row, columns, columnWidths: newColumnWidths };
      }
      return row;
    }));
    
    // Ajustar campos que excedem o novo número de colunas
    setFormFields(prev => prev.map(field => {
      if (field.rowId === rowId && field.column >= columns) {
        return { ...field, column: columns - 1 };
      }
      return field;
    }));
    
    setHasUnsavedChanges(true);
    toast.success(`Linha atualizada para ${columns} coluna${columns > 1 ? 's' : ''}!`);
  }, []);

  const updateRowHeight = useCallback((rowId: string, height: string) => {
    setFormRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, height } : row
    ));
    setHasUnsavedChanges(true);
    toast.success('Altura da linha atualizada!');
  }, []);

  const updateColumnWidth = useCallback((rowId: string, columnIndex: number, width: string) => {
    setFormRows(prev => prev.map(row => {
      if (row.id === rowId) {
        const newColumnWidths = [...row.columnWidths];
        newColumnWidths[columnIndex] = width;
        return { ...row, columnWidths: newColumnWidths };
      }
      return row;
    }));
    setHasUnsavedChanges(true);
    toast.success(`Largura da coluna ${columnIndex + 1} atualizada!`);
  }, []);

  // ==================== FUNÇÕES DE DRAG AND DROP ====================

  const handleDragStart = useCallback((e: React.DragEvent, field: any, isNewField: boolean = false) => {
    const dragData = { ...field, isNewField };
    setDraggedField(dragData);
    
    // Configurar dados do drag
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    
    // Visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    // Restaurar visual
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedField(null);
    setDragOverColumn(null);
    setSelectedRow(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, rowId: string, column: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    
    setDragOverColumn(column);
    setSelectedRow(rowId);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Só limpar se realmente saiu da área (não é um filho)
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    
    setDragOverColumn(null);
    setSelectedRow(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetRowId: string, targetColumn: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragOverColumn(null);
    setSelectedRow(null);
    
    let dragData;
    try {
      // Tentar pegar dados do dataTransfer primeiro
      const transferData = e.dataTransfer.getData('text/plain');
      if (transferData) {
        dragData = JSON.parse(transferData);
      } else {
        dragData = draggedField;
      }
    } catch {
      dragData = draggedField;
    }
    
    if (!dragData) {
      setDraggedField(null);
      return;
    }
    
    const targetRowIndex = formRows.findIndex(r => r.id === targetRowId);
    
    // Verificar se já existe um campo nesta posição
    const existingField = formFields.find(f => f.rowId === targetRowId && f.column === targetColumn);
    
    if (dragData.isNewField) {
      // Se já existe campo na posição, não permite adicionar
      if (existingField) {
        toast.error('Já existe um campo nesta posição. Escolha outra coluna.');
        setDraggedField(null);
        return;
      }
      
      // Adicionando novo campo
      const newField: FormField = {
        id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: dragData.type,
        label: dragData.label ? `${dragData.label}` : `Campo ${dragData.type}`,
        required: false,
        placeholder: dragData.type === 'textarea' ? 'Digite sua resposta detalhada aqui...' : 
                    dragData.type === 'email' ? 'exemplo@email.com' :
                    dragData.type === 'number' ? '0' :
                    'Digite aqui...',
        options: ['select', 'radio', 'checkbox'].includes(dragData.type) ? ['Opção 1', 'Opção 2', 'Opção 3'] : undefined,
        rowId: targetRowId,
        rowIndex: targetRowIndex,
        column: targetColumn,
        width: 1,
        validation: {
          minLength: ['text', 'textarea', 'email'].includes(dragData.type) ? 0 : undefined,
          maxLength: ['text', 'textarea', 'email'].includes(dragData.type) ? 255 : undefined,
          min: dragData.type === 'number' ? 0 : undefined,
          max: dragData.type === 'number' ? 100 : undefined
        }
      };
      
      setFormFields(prev => [...prev, newField]);
      setSelectedField(newField);
      setHasUnsavedChanges(true);
      toast.success(`✅ Campo "${dragData.label}" adicionado com sucesso!`);
      
    } else {
      // Movendo campo existente
      if (existingField && existingField.id !== dragData.id) {
        toast.error('Já existe um campo nesta posição. Escolha outra coluna.');
        setDraggedField(null);
        return;
      }
      
      setFormFields(prev => prev.map(field => {
        if (field.id === dragData.id) {
          return {
            ...field,
            rowId: targetRowId,
            rowIndex: targetRowIndex,
            column: targetColumn
          };
        }
        return field;
      }));
      setHasUnsavedChanges(true);
      toast.success(`✅ Campo "${dragData.label}" movido com sucesso!`);
    }
    
    setDraggedField(null);
  }, [draggedField, formRows, formFields]);

  // ==================== FUNÇÕES DE EDIÇÃO DE CAMPOS ====================

  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setFormFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
    
    if (selectedField && selectedField.id === fieldId) {
      setSelectedField(prev => prev ? { ...prev, ...updates } : null);
    }
    
    setHasUnsavedChanges(true);
  }, [selectedField]);

  const deleteField = useCallback((fieldId: string) => {
    setFormFields(prev => prev.filter(field => field.id !== fieldId));
    
    if (selectedField && selectedField.id === fieldId) {
      setSelectedField(null);
    }
    
    setHasUnsavedChanges(true);
    toast.success('Campo removido!');
  }, [selectedField]);

  const clearCanvas = useCallback(() => {
    if (window.confirm('Deseja limpar todo o canvas? Esta ação não pode ser desfeita.')) {
      setFormFields([]);
      setFormRows([]);
      setSelectedField(null);
      setHasUnsavedChanges(true);
      toast.success('Canvas limpo!');
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-2xl transition-all duration-300 ${
        isMaximized 
          ? 'w-full h-full max-w-none max-h-none rounded-none' 
          : 'w-[95vw] h-[95vh] max-w-7xl'
      }`}>
        
        {/* Header do Modal */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative p-3 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-xl shadow-lg">
              <Settings2 className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {mode === 'create' ? 'Criar Novo' : 'Editar'} - Process Designer Enhanced
                </h1>
                {processName && (
                  <h2 className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                    {processName}
                  </h2>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedTemplate 
                    ? `Template: ${selectedTemplate.name} • ${selectedTemplate.complexity} • ${selectedTemplate.estimatedTime}`
                    : 'Arquitetura de 5 Camadas: Templates • Form Builder • Workflow • Analytics • Integrations'
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {selectedTemplate && (
                <Badge className={`${
                  selectedTemplate.category === 'compliance' ? 'bg-blue-100 text-blue-800' :
                  selectedTemplate.category === 'risk' ? 'bg-red-100 text-red-800' :
                  selectedTemplate.category === 'audit' ? 'bg-green-100 text-green-800' :
                  selectedTemplate.category === 'incident' ? 'bg-orange-100 text-orange-800' :
                  selectedTemplate.category === 'policy' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedTemplate.category}
                </Badge>
              )}
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                v5.0.0 Template-Driven
              </Badge>
            </div>
            {hasUnsavedChanges && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                Não salvo
              </Badge>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? "Restaurar" : "Maximizar"}
            >
              {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <div className="flex items-center gap-2">
              {activeLayer !== 'template' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? 'Editor' : 'Preview'}
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSave}
                disabled={!processName.trim() || (!formFields.length && !workflowNodes.length)}
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Processo
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Navegação das Camadas */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-6">
            <Tabs value={activeLayer} onValueChange={(value) => setActiveLayer(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-6 bg-gray-100 dark:bg-gray-700">
                <TabsTrigger value="template" className="flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  <span className="hidden sm:inline">Templates</span>
                  <span className="sm:hidden">Temp</span>
                </TabsTrigger>
                <TabsTrigger value="form" className="flex items-center gap-2" disabled={!selectedTemplate}>
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Form Builder</span>
                  <span className="sm:hidden">Forms</span>
                </TabsTrigger>
                <TabsTrigger value="workflow" className="flex items-center gap-2" disabled={!selectedTemplate}>
                  <Workflow className="h-4 w-4" />
                  <span className="hidden sm:inline">Workflow</span>
                  <span className="sm:hidden">Flow</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2" disabled={!selectedTemplate}>
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                  <span className="sm:hidden">Charts</span>
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2" disabled={!selectedTemplate}>
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Reports</span>
                  <span className="sm:hidden">Reports</span>
                </TabsTrigger>
                <TabsTrigger value="integrations" className="flex items-center gap-2" disabled={!selectedTemplate}>
                  <Network className="h-4 w-4" />
                  <span className="hidden sm:inline">Integrations</span>
                  <span className="sm:hidden">APIs</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {/* Conteúdo das Camadas */}
        <div className="flex-1 p-6 overflow-auto" style={{ height: 'calc(100vh - 140px)' }}>
          <Tabs value={activeLayer} className="w-full h-full">
            
            {/* NOVA CAMADA: Template Selection */}
            <TabsContent value="template" className="space-y-6 h-full">
              <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Escolha um Template</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Selecione um template pré-configurado ou inicie do zero com um processo personalizado
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {processTemplates.map((template) => {
                    const IconComponent = template.icon === 'Shield' ? Shield :
                      template.icon === 'AlertCircle' ? AlertCircle :
                      template.icon === 'CheckCircle' ? CheckCircle :
                      template.icon === 'FileText' ? FileText :
                      template.icon === 'Sparkles' ? Sparkles : Cog;
                    
                    const isSelected = selectedTemplate?.id === template.id;
                    
                    return (
                      <Card 
                        key={template.id} 
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          isSelected 
                            ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => {
                          setSelectedTemplate(template);
                          setProcessName(template.name);
                          setProcessDescription(template.description);
                          setProcessCategory(template.category);
                          setHasUnsavedChanges(true);
                        }}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-lg ${
                                template.category === 'compliance' ? 'bg-blue-100 text-blue-600' :
                                template.category === 'risk' ? 'bg-red-100 text-red-600' :
                                template.category === 'audit' ? 'bg-green-100 text-green-600' :
                                template.category === 'incident' ? 'bg-orange-100 text-orange-600' :
                                template.category === 'policy' ? 'bg-purple-100 text-purple-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                <IconComponent className="h-6 w-6" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{template.name}</CardTitle>
                                <Badge className={`mt-1 text-xs ${
                                  template.complexity === 'simple' ? 'bg-green-100 text-green-800' :
                                  template.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {template.complexity}
                                </Badge>
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle className="h-6 w-6 text-purple-600" />
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            {template.description}
                          </p>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Tempo estimado:</span>
                              <span className="font-medium">{template.estimatedTime}</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              {template.tags.slice(0, 3).map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {template.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{template.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                            
                            {template.analytics.kpis.length > 0 && (
                              <div className="text-xs text-gray-500">
                                <strong>KPIs:</strong> {template.analytics.kpis.join(', ')}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                {selectedTemplate && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          Template Selecionado: {selectedTemplate.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {selectedTemplate.description}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-4">
                            <Label className="text-sm font-medium w-32">Nome do Processo:</Label>
                            <Input
                              value={processName}
                              onChange={(e) => {
                                setProcessName(e.target.value);
                                setHasUnsavedChanges(true);
                              }}
                              placeholder="Digite o nome do seu processo..."
                              className="max-w-md"
                            />
                          </div>
                          
                          <div className="flex items-start gap-4">
                            <Label className="text-sm font-medium w-32 mt-2">Descrição:</Label>
                            <Textarea
                              value={processDescription}
                              onChange={(e) => {
                                setProcessDescription(e.target.value);
                                setHasUnsavedChanges(true);
                              }}
                              placeholder="Descreva o objetivo e escopo do processo..."
                              rows={3}
                              className="max-w-md"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => {
                          if (!processName.trim()) {
                            toast.error('Nome do processo é obrigatório!');
                            return;
                          }
                          loadTemplate(selectedTemplate);
                        }}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        disabled={!processName.trim()}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Continuar com Template
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            {/* CAMADA 1: Form Builder com Canvas Dinâmico */}
            <TabsContent value="form" className="space-y-6 h-full">
              <div className="flex h-full gap-6">
                
                {/* Biblioteca de Componentes */}
                <div className="w-44 flex-shrink-0 min-w-0">
                  <Card className="h-full flex flex-col overflow-hidden">
                    <CardHeader className="pb-1 px-2 pt-2 flex-shrink-0">
                      <CardTitle className="text-xs flex items-center gap-1 truncate">
                        <Boxes className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">Campos</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-1 pb-2 flex-1 min-h-0 overflow-y-auto">
                      <div className="space-y-1 w-full overflow-hidden">
                        
                        {/* Campos Básicos */}
                        <div className="w-full overflow-hidden">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1 px-1">
                            Básicos
                          </h4>
                          <div className="space-y-0.5 w-full">
                            {fieldTypes.basic.map((field, index) => (
                              <div
                                key={index}
                                className="group flex items-center gap-1 p-1 border rounded cursor-grab active:cursor-grabbing transition-all hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950 w-full overflow-hidden"
                                draggable
                                onDragStart={(e) => handleDragStart(e, field, true)}
                                onDragEnd={handleDragEnd}
                                title={field.description}
                              >
                                <div className={`p-0.5 rounded ${field.color} flex-shrink-0`}>
                                  <field.icon className="h-2 w-2 text-gray-700" />
                                </div>
                                <span className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate flex-1 overflow-hidden">{field.label}</span>
                                <GripVertical className="h-2 w-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Campos Avançados */}
                        <div className="w-full overflow-hidden">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1 px-1">
                            Avançados
                          </h4>
                          <div className="space-y-0.5 w-full">
                            {fieldTypes.advanced.map((field, index) => (
                              <div
                                key={index}
                                className="group flex items-center gap-1 p-1 border rounded cursor-grab active:cursor-grabbing transition-all hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950 w-full overflow-hidden"
                                draggable
                                onDragStart={(e) => handleDragStart(e, field, true)}
                                onDragEnd={handleDragEnd}
                                title={field.description}
                              >
                                <div className={`p-0.5 rounded ${field.color} flex-shrink-0`}>
                                  <field.icon className="h-2 w-2 text-gray-700" />
                                </div>
                                <span className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate flex-1 overflow-hidden">{field.label}</span>
                                <GripVertical className="h-2 w-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Campos de Workflow */}
                        <div className="w-full overflow-hidden">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1 px-1">
                            Workflow
                          </h4>
                          <div className="space-y-0.5 w-full">
                            {fieldTypes.workflow.map((field, index) => (
                              <div
                                key={index}
                                className="group flex items-center gap-1 p-1 border rounded cursor-grab active:cursor-grabbing transition-all hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-950 w-full overflow-hidden"
                                draggable
                                onDragStart={(e) => handleDragStart(e, field, true)}
                                onDragEnd={handleDragEnd}
                                title={field.description}
                              >
                                <div className={`p-0.5 rounded ${field.color} flex-shrink-0`}>
                                  <field.icon className="h-2 w-2 text-gray-700" />
                                </div>
                                <span className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate flex-1 overflow-hidden">{field.label}</span>
                                <GripVertical className="h-2 w-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Canvas de Edição */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="bg-white dark:bg-gray-800 border rounded-lg shadow-sm flex flex-col h-full">
                    <div className="p-4 flex-shrink-0">
                      <div className="h-full">{/* Remove duplicate wrapper */}
                        {/* Header do Formulário com Controles */}
                        <div className="mb-4 flex-shrink-0">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-semibold mb-2">Canvas de Formulário</h3>
                              <p className="text-muted-foreground">Arraste campos da biblioteca e organize em linhas</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {formRows.length} linha{formRows.length !== 1 ? 's' : ''} • {formFields.length} campo{formFields.length !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                          
                          {/* Controles do Canvas */}
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nova linha:</span>
                              <Select onValueChange={(value) => addNewRow(parseInt(value))}>
                                <SelectTrigger className="w-36 h-8">
                                  <SelectValue placeholder="Colunas" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-2 bg-blue-200 rounded-sm"></div>
                                      <span>1 Coluna</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="2">
                                    <div className="flex items-center gap-2">
                                      <div className="flex gap-0.5">
                                        <div className="w-2 h-2 bg-blue-200 rounded-sm"></div>
                                        <div className="w-2 h-2 bg-blue-200 rounded-sm"></div>
                                      </div>
                                      <span>2 Colunas</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="3">
                                    <div className="flex items-center gap-2">
                                      <div className="flex gap-0.5">
                                        <div className="w-1.5 h-2 bg-blue-200 rounded-sm"></div>
                                        <div className="w-1.5 h-2 bg-blue-200 rounded-sm"></div>
                                        <div className="w-1.5 h-2 bg-blue-200 rounded-sm"></div>
                                      </div>
                                      <span>3 Colunas</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="4">
                                    <div className="flex items-center gap-2">
                                      <div className="flex gap-0.5">
                                        <div className="w-1 h-2 bg-blue-200 rounded-sm"></div>
                                        <div className="w-1 h-2 bg-blue-200 rounded-sm"></div>
                                        <div className="w-1 h-2 bg-blue-200 rounded-sm"></div>
                                        <div className="w-1 h-2 bg-blue-200 rounded-sm"></div>
                                      </div>
                                      <span>4 Colunas</span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={clearCanvas}
                              className="h-7 px-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Limpar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                        
                    {/* Canvas Vazio ou com Conteúdo - movido para fora do flex-shrink-0 */}
                    <div className="flex-1 min-h-0 p-4">
                      {formFields.length === 0 && formRows.length === 0 ? (
                        <div 
                          className={`h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg transition-colors ${
                            draggedField ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          <div className="text-center">
                            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <h4 className="text-lg font-medium mb-2">Canvas Vazio</h4>
                            <p className="text-sm mb-4">
                              {draggedField ? 'Solte o campo aqui para começar' : 'Use o dropdown acima para adicionar linhas ou arraste campos da biblioteca'}
                            </p>
                            <div className="space-y-2">
                              <Button onClick={() => addNewRow(2)} variant="outline">
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar Primeira Linha (2 colunas)
                              </Button>
                              <div className="text-xs text-muted-foreground">
                                Ou use o dropdown "Nova linha" acima
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 h-full overflow-y-auto">
                            {/* Renderizar linhas */}
                            {formRows.map((row, rowIndex) => {
                              const rowFields = formFields.filter(field => field.rowId === row.id);
                              
                              return (
                                <div key={row.id} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                                  {/* Header da Linha */}
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-xs font-medium">Linha {rowIndex + 1}</h4>
                                      <Badge variant="outline" className="text-xs px-1 py-0">
                                        {row.columns}col
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1">
                                        <Label className="text-xs">Cols:</Label>
                                        <Select 
                                          value={row.columns.toString()} 
                                          onValueChange={(value) => updateRowColumns(row.id, parseInt(value))}
                                        >
                                          <SelectTrigger className="w-12 h-6">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="1">1</SelectItem>
                                            <SelectItem value="2">2</SelectItem>
                                            <SelectItem value="3">3</SelectItem>
                                            <SelectItem value="4">4</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Label className="text-xs">Alt:</Label>
                                        <Select 
                                          value={row.height} 
                                          onValueChange={(value) => updateRowHeight(row.id, value)}
                                        >
                                          <SelectTrigger className="w-16 h-6">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="auto">Auto</SelectItem>
                                            <SelectItem value="small">Pequena</SelectItem>
                                            <SelectItem value="medium">Média</SelectItem>
                                            <SelectItem value="large">Grande</SelectItem>
                                            <SelectItem value="xl">Extra</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <Button 
                                        size="sm" 
                                        variant="ghost"
                                        onClick={() => removeRow(row.id)}
                                        disabled={formRows.length <= 1}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  {/* Grid de Colunas da Linha */}
                                  <div 
                                    className={`grid gap-2 ${
                                      row.height === 'small' ? 'min-h-12' :
                                      row.height === 'medium' ? 'min-h-20' :
                                      row.height === 'large' ? 'min-h-32' :
                                      row.height === 'xl' ? 'min-h-48' :
                                      'min-h-16' // auto
                                    }`}
                                    style={{ gridTemplateColumns: row.columnWidths.join(' ') }}
                                  >
                                    {Array.from({ length: row.columns }, (_, columnIndex) => {
                                      const columnFields = rowFields.filter(field => field.column === columnIndex);
                                      
                                      return (
                                        <div 
                                          key={`${row.id}-${columnIndex}`}
                                          className={`min-h-16 border-2 border-dashed rounded p-1.5 transition-all duration-200 ${
                                            dragOverColumn === columnIndex && selectedRow === row.id
                                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-lg scale-105' 
                                              : draggedField
                                                ? 'border-gray-400 dark:border-gray-500 bg-gray-50 dark:bg-gray-800'
                                                : 'border-gray-300 dark:border-gray-600'
                                          }`}
                                          onDragOver={(e) => handleDragOver(e, row.id, columnIndex)}
                                          onDragEnter={handleDragEnter}
                                          onDragLeave={handleDragLeave}
                                          onDrop={(e) => handleDrop(e, row.id, columnIndex)}
                                        >
                                          <div className="flex items-center justify-between mb-1">
                                            <div className="text-xs text-muted-foreground">
                                              {columnIndex + 1}
                                            </div>
                                            <Select 
                                              value={row.columnWidths[columnIndex] || '1fr'} 
                                              onValueChange={(value) => updateColumnWidth(row.id, columnIndex, value)}
                                            >
                                              <SelectTrigger className="w-12 h-4 text-xs">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="auto">Auto</SelectItem>
                                                <SelectItem value="1fr">1fr</SelectItem>
                                                <SelectItem value="2fr">2fr</SelectItem>
                                                <SelectItem value="3fr">3fr</SelectItem>
                                                <SelectItem value="200px">200px</SelectItem>
                                                <SelectItem value="300px">300px</SelectItem>
                                                <SelectItem value="400px">400px</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                  
                                          <div className="space-y-1">
                                            {columnFields.length === 0 ? (
                                              <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
                                                {draggedField ? (
                                                  <>
                                                    <div className="w-8 h-8 border-2 border-dashed border-blue-400 rounded-full flex items-center justify-center mb-2">
                                                      <Plus className="h-4 w-4 text-blue-500" />
                                                    </div>
                                                    <div className="text-xs text-blue-600 font-medium">Solte aqui</div>
                                                    <div className="text-xs text-gray-500">Coluna {columnIndex + 1}</div>
                                                  </>
                                                ) : (
                                                  <>
                                                    <Boxes className="h-6 w-6 text-gray-400 mb-1" />
                                                    <div className="text-xs">Arraste um campo</div>
                                                    <div className="text-xs text-gray-400">Coluna {columnIndex + 1}</div>
                                                  </>
                                                )}
                                              </div>
                                            ) : (
                                              columnFields.map((field) => (
                                                <div 
                                                  key={field.id} 
                                                  className={`p-1.5 border rounded cursor-pointer transition-all group ${
                                                    selectedField?.id === field.id 
                                                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                                                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                  }`}
                                                  draggable
                                                  onDragStart={(e) => handleDragStart(e, field, false)}
                                                  onDragEnd={handleDragEnd}
                                                  onClick={() => setSelectedField(field)}
                                                >
                                                  <div className="flex items-center justify-between mb-1">
                                                    <Label className="font-medium text-xs truncate">{field.label}</Label>
                                                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                      <Button 
                                                        size="sm" 
                                                        variant="ghost"
                                                        className="h-4 w-4 p-0"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setSelectedField(field);
                                                        }}
                                                      >
                                                        <Edit className="h-2 w-2" />
                                                      </Button>
                                                      <Button 
                                                        size="sm" 
                                                        variant="ghost"
                                                        className="h-4 w-4 p-0"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          deleteField(field.id);
                                                        }}
                                                      >
                                                        <Trash2 className="h-2 w-2" />
                                                      </Button>
                                                    </div>
                                                  </div>
                                          
                                                  {/* Preview do Campo */}
                                                  <div className="pointer-events-none">
                                                    {field.type === 'text' && (
                                                      <Input placeholder={field.placeholder || 'Digite...'} disabled className="text-xs h-6" />
                                                    )}
                                                    {field.type === 'textarea' && (
                                                      <Textarea placeholder={field.placeholder || 'Digite...'} disabled rows={1} className="text-xs h-6 resize-none" />
                                                    )}
                                                    {field.type === 'number' && (
                                                      <Input type="number" placeholder="0" disabled className="text-xs h-6" />
                                                    )}
                                                    {field.type === 'date' && (
                                                      <Input type="date" disabled className="text-xs h-6" />
                                                    )}
                                                    {field.type === 'time' && (
                                                      <Input type="time" disabled className="text-xs h-6" />
                                                    )}
                                                    {field.type === 'select' && (
                                                      <Select disabled>
                                                        <SelectTrigger className="text-xs h-6">
                                                          <SelectValue placeholder="Selecione" />
                                                        </SelectTrigger>
                                                      </Select>
                                                    )}
                                                    {field.type === 'checkbox' && (
                                                      <div className="flex items-center space-x-1">
                                                        <input type="checkbox" disabled className="scale-75" />
                                                        <Label className="text-xs">Opção</Label>
                                                      </div>
                                                    )}
                                                    {field.type === 'radio' && (
                                                      <div className="flex items-center space-x-1">
                                                        <input type="radio" disabled className="scale-75" />
                                                        <Label className="text-xs">Opção 1</Label>
                                                      </div>
                                                    )}
                                                    {field.type === 'file' && (
                                                      <div className="border border-dashed border-gray-300 rounded p-1 text-center">
                                                        <Upload className="h-3 w-3 mx-auto text-gray-400" />
                                                        <div className="text-xs text-gray-500">Arquivo</div>
                                                      </div>
                                                    )}
                                                    {field.type === 'rating' && (
                                                      <div className="flex gap-0.5">
                                                        {Array.from({ length: 5 }, (_, i) => (
                                                          <Star key={i} className="h-3 w-3 text-gray-300" />
                                                        ))}
                                                      </div>
                                                    )}
                                                    {field.type === 'slider' && (
                                                      <div className="py-1">
                                                        <input type="range" disabled className="w-full h-1" />
                                                      </div>
                                                    )}
                                                  </div>
                                                  
                                                  <div className="mt-1 text-xs text-muted-foreground flex items-center justify-between">
                                                    <span>Tipo: {field.type}</span>
                                                    <div className="flex items-center gap-1">
                                                      {field.required && <Badge variant="secondary" className="text-xs px-1 py-0">Req</Badge>}
                                                      <span className="text-xs">☰</span>
                                                    </div>
                                                  </div>
                                                </div>
                                              ))
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Painel de Propriedades */}
                <div className="w-64 flex-shrink-0 min-h-0">
                  <Card className="h-full flex flex-col">
                    <CardHeader className="flex-shrink-0 pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Propriedades
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
                      {selectedField ? (
                        <div className="space-y-3 pr-2">
                          {/* Informações básicas do campo */}
                          <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-xs font-medium">Tipo: {selectedField.type}</span>
                            </div>
                            <div className="text-xs text-gray-500">ID: {selectedField.id}</div>
                          </div>

                          {/* Label do Campo */}
                          <div>
                            <Label className="text-xs font-semibold">Label do Campo</Label>
                            <Input
                              value={selectedField.label}
                              onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                              className="h-8 text-xs mt-1"
                              placeholder="Nome do campo"
                            />
                          </div>
                          
                          {/* Placeholder - para campos de entrada */}
                          {['text', 'textarea', 'email', 'password', 'number', 'phone', 'url'].includes(selectedField.type) && (
                            <div>
                              <Label className="text-xs font-semibold">Placeholder</Label>
                              <Input
                                value={selectedField.placeholder || ''}
                                onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                                className="h-8 text-xs mt-1"
                                placeholder="Texto de exemplo..."
                              />
                            </div>
                          )}

                          {/* Descrição/Ajuda */}
                          <div>
                            <Label className="text-xs font-semibold">Descrição/Ajuda</Label>
                            <Textarea
                              value={selectedField.description || ''}
                              onChange={(e) => updateField(selectedField.id, { description: e.target.value })}
                              className="h-12 text-xs mt-1 resize-none"
                              placeholder="Texto de ajuda..."
                            />
                          </div>

                          {/* Propriedades específicas por tipo de campo */}
                          
                          {/* Select/Radio/Dropdown - Opções */}
                          {(['select', 'dropdown', 'radio', 'approval', 'priority', 'status', 'tags'].includes(selectedField.type)) && (
                            <div>
                              <Label className="text-xs font-semibold">Opções</Label>
                              <Textarea
                                value={(selectedField.options || []).join('\n')}
                                onChange={(e) => updateField(selectedField.id, { 
                                  options: e.target.value.split('\n').filter(opt => opt.trim()) 
                                })}
                                className="h-16 text-xs mt-1 resize-none"
                                placeholder={selectedField.type === 'approval' ? 'Aprovado\nReprovado\nPendente' : 
                                          selectedField.type === 'priority' ? 'Baixa\nMédia\nAlta\nCrítica' :
                                          selectedField.type === 'status' ? 'Não Iniciado\nEm Andamento\nConcluído\nCancelado' :
                                          selectedField.type === 'tags' ? 'Tag1\nTag2\nTag3' :
                                          selectedField.type === 'dropdown' ? 'Opção A\nOpção B\nOpção C\nOpção D' :
                                          'Opção 1\nOpção 2\nOpção 3'}
                              />
                            </div>
                          )}

                          {/* Dropdown - Configurações específicas */}
                          {selectedField.type === 'dropdown' && (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="searchable"
                                  checked={selectedField.searchable || false}
                                  onChange={(e) => updateField(selectedField.id, { searchable: e.target.checked })}
                                  className="h-3 w-3"
                                />
                                <Label htmlFor="searchable" className="text-xs">Permitir pesquisa</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="multiple"
                                  checked={selectedField.multiple || false}
                                  onChange={(e) => updateField(selectedField.id, { multiple: e.target.checked })}
                                  className="h-3 w-3"
                                />
                                <Label htmlFor="multiple" className="text-xs">Seleção múltipla</Label>
                              </div>
                              <div>
                                <Label className="text-xs font-semibold">Texto quando vazio</Label>
                                <Input
                                  value={selectedField.emptyText || ''}
                                  onChange={(e) => updateField(selectedField.id, { emptyText: e.target.value })}
                                  className="h-7 text-xs mt-1"
                                  placeholder="Selecione uma opção..."
                                />
                              </div>
                            </div>
                          )}

                          {/* Color - Valor padrão */}
                          {selectedField.type === 'color' && (
                            <div>
                              <Label className="text-xs font-semibold">Cor Padrão</Label>
                              <Input
                                type="color"
                                value={selectedField.defaultValue || '#000000'}
                                onChange={(e) => updateField(selectedField.id, { defaultValue: e.target.value })}
                                className="h-8 w-16 mt-1"
                              />
                            </div>
                          )}

                          {/* Switch - Labels */}
                          {selectedField.type === 'switch' && (
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs font-semibold">Label ON</Label>
                                <Input
                                  value={selectedField.onLabel || 'Sim'}
                                  onChange={(e) => updateField(selectedField.id, { onLabel: e.target.value })}
                                  className="h-7 text-xs mt-1"
                                  placeholder="Sim"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-semibold">Label OFF</Label>
                                <Input
                                  value={selectedField.offLabel || 'Não'}
                                  onChange={(e) => updateField(selectedField.id, { offLabel: e.target.value })}
                                  className="h-7 text-xs mt-1"
                                  placeholder="Não"
                                />
                              </div>
                            </div>
                          )}

                          {/* Image - Tipos aceitos */}
                          {selectedField.type === 'image' && (
                            <div>
                              <Label className="text-xs font-semibold">Formatos Aceitos</Label>
                              <Input
                                value={selectedField.accept || '.jpg,.jpeg,.png,.gif,.webp'}
                                onChange={(e) => updateField(selectedField.id, { accept: e.target.value })}
                                className="h-8 text-xs mt-1"
                                placeholder=".jpg,.jpeg,.png,.gif"
                              />
                            </div>
                          )}

                          {/* Phone - Formato */}
                          {selectedField.type === 'phone' && (
                            <div>
                              <Label className="text-xs font-semibold">Formato</Label>
                              <Select 
                                value={selectedField.format || 'br'} 
                                onValueChange={(value) => updateField(selectedField.id, { format: value })}
                              >
                                <SelectTrigger className="h-7 text-xs mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="br">Brasil (11) 99999-9999</SelectItem>
                                  <SelectItem value="us">EUA (999) 999-9999</SelectItem>
                                  <SelectItem value="international">Internacional +XX</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* Timer - Unidade */}
                          {selectedField.type === 'timer' && (
                            <div>
                              <Label className="text-xs font-semibold">Unidade</Label>
                              <Select 
                                value={selectedField.unit || 'minutes'} 
                                onValueChange={(value) => updateField(selectedField.id, { unit: value })}
                              >
                                <SelectTrigger className="h-7 text-xs mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="seconds">Segundos</SelectItem>
                                  <SelectItem value="minutes">Minutos</SelectItem>
                                  <SelectItem value="hours">Horas</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* Number - Min/Max */}
                          {selectedField.type === 'number' && (
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs font-semibold">Valor Mínimo</Label>
                                <Input
                                  type="number"
                                  value={selectedField.min || ''}
                                  onChange={(e) => updateField(selectedField.id, { min: e.target.value ? Number(e.target.value) : undefined })}
                                  className="h-8 text-xs mt-1"
                                  placeholder="0"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-semibold">Valor Máximo</Label>
                                <Input
                                  type="number"
                                  value={selectedField.max || ''}
                                  onChange={(e) => updateField(selectedField.id, { max: e.target.value ? Number(e.target.value) : undefined })}
                                  className="h-8 text-xs mt-1"
                                  placeholder="100"
                                />
                              </div>
                            </div>
                          )}

                          {/* Textarea - Linhas */}
                          {selectedField.type === 'textarea' && (
                            <div>
                              <Label className="text-xs font-semibold">Número de Linhas</Label>
                              <Input
                                type="number"
                                value={selectedField.rows || 3}
                                onChange={(e) => updateField(selectedField.id, { rows: Number(e.target.value) || 3 })}
                                className="h-8 text-xs mt-1"
                                min="1"
                                max="10"
                              />
                            </div>
                          )}

                          {/* Rating - Máximo */}
                          {selectedField.type === 'rating' && (
                            <div>
                              <Label className="text-xs font-semibold">Máximo de Estrelas</Label>
                              <Input
                                type="number"
                                value={selectedField.maxRating || 5}
                                onChange={(e) => updateField(selectedField.id, { maxRating: Number(e.target.value) || 5 })}
                                className="h-8 text-xs mt-1"
                                min="1"
                                max="10"
                              />
                            </div>
                          )}

                          {/* Slider - Min/Max/Step */}
                          {selectedField.type === 'slider' && (
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs font-semibold">Min</Label>
                                  <Input
                                    type="number"
                                    value={selectedField.min || 0}
                                    onChange={(e) => updateField(selectedField.id, { min: Number(e.target.value) || 0 })}
                                    className="h-8 text-xs mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs font-semibold">Max</Label>
                                  <Input
                                    type="number"
                                    value={selectedField.max || 100}
                                    onChange={(e) => updateField(selectedField.id, { max: Number(e.target.value) || 100 })}
                                    className="h-8 text-xs mt-1"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs font-semibold">Passo</Label>
                                <Input
                                  type="number"
                                  value={selectedField.step || 1}
                                  onChange={(e) => updateField(selectedField.id, { step: Number(e.target.value) || 1 })}
                                  className="h-8 text-xs mt-1"
                                  min="0.1"
                                />
                              </div>
                            </div>
                          )}

                          {/* File - Tipos aceitos */}
                          {selectedField.type === 'file' && (
                            <div>
                              <Label className="text-xs font-semibold">Tipos de Arquivo Aceitos</Label>
                              <Input
                                value={selectedField.accept || ''}
                                onChange={(e) => updateField(selectedField.id, { accept: e.target.value })}
                                className="h-8 text-xs mt-1"
                                placeholder=".pdf,.doc,.docx,.jpg,.png"
                              />
                              <div className="text-xs text-gray-500 mt-1">Use vírgulas para separar extensões</div>
                            </div>
                          )}

                          {/* Validações */}
                          <div className="space-y-1.5 pt-2 border-t">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="required"
                                checked={selectedField.required || false}
                                onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                                className="h-3 w-3"
                              />
                              <Label htmlFor="required" className="text-xs">Obrigatório</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="readonly"
                                checked={selectedField.readonly || false}
                                onChange={(e) => updateField(selectedField.id, { readonly: e.target.checked })}
                                className="h-3 w-3"
                              />
                              <Label htmlFor="readonly" className="text-xs">Só leitura</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="disabled"
                                checked={selectedField.disabled || false}
                                onChange={(e) => updateField(selectedField.id, { disabled: e.target.checked })}
                                className="h-3 w-3"
                              />
                              <Label htmlFor="disabled" className="text-xs">Desabilitado</Label>
                            </div>
                          </div>

                          {/* Width do campo */}
                          <div>
                            <Label className="text-xs font-semibold">Largura</Label>
                            <Select 
                              value={selectedField.width || 'full'} 
                              onValueChange={(value) => updateField(selectedField.id, { width: value })}
                            >
                              <SelectTrigger className="h-7 text-xs mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="full">100%</SelectItem>
                                <SelectItem value="half">50%</SelectItem>
                                <SelectItem value="third">33%</SelectItem>
                                <SelectItem value="quarter">25%</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Botão de remoção */}
                          <div className="pt-3 border-t">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteField(selectedField.id)}
                              className="w-full h-7 text-xs"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Remover
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Settings className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            Nenhum campo selecionado
                          </div>
                          <div className="text-xs text-gray-400">
                            Clique em um campo no canvas para editar suas propriedades
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* CAMADA 2: Workflow Engine Visual */}
            <TabsContent value="workflow" className="space-y-6 h-full">
              <div className="h-full flex gap-6">
                
                {/* Paleta de Nós do Workflow */}
                <div className="w-64 flex-shrink-0">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        Elementos do Workflow
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-auto">
                      <div className="space-y-4">
                        
                        {/* Nós de Controle */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            Controle de Fluxo
                          </h4>
                          <div className="space-y-1">
                            <div className="p-2 border rounded cursor-grab flex items-center gap-2 hover:bg-green-50">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-xs font-medium">Início</span>
                            </div>
                            <div className="p-2 border rounded cursor-grab flex items-center gap-2 hover:bg-red-50">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span className="text-xs font-medium">Fim</span>
                            </div>
                            <div className="p-2 border rounded cursor-grab flex items-center gap-2 hover:bg-yellow-50">
                              <div className="w-3 h-3 bg-yellow-500 rounded transform rotate-45"></div>
                              <span className="text-xs font-medium">Decisão</span>
                            </div>
                            <div className="p-2 border rounded cursor-grab flex items-center gap-2 hover:bg-purple-50">
                              <div className="w-3 h-3 bg-purple-500 rounded"></div>
                              <span className="text-xs font-medium">Paralelo</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Tarefas */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            Tarefas
                          </h4>
                          <div className="space-y-1">
                            <div className="p-2 border rounded cursor-grab flex items-center gap-2 hover:bg-blue-50">
                              <Users className="h-3 w-3 text-blue-600" />
                              <span className="text-xs font-medium">Tarefa de Usuário</span>
                            </div>
                            <div className="p-2 border rounded cursor-grab flex items-center gap-2 hover:bg-indigo-50">
                              <Cog className="h-3 w-3 text-indigo-600" />
                              <span className="text-xs font-medium">Tarefa Automática</span>
                            </div>
                            <div className="p-2 border rounded cursor-grab flex items-center gap-2 hover:bg-teal-50">
                              <CheckCircle className="h-3 w-3 text-teal-600" />
                              <span className="text-xs font-medium">Aprovação</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Eventos */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            Eventos
                          </h4>
                          <div className="space-y-1">
                            <div className="p-2 border rounded cursor-grab flex items-center gap-2 hover:bg-orange-50">
                              <Timer className="h-3 w-3 text-orange-600" />
                              <span className="text-xs font-medium">Timer</span>
                            </div>
                            <div className="p-2 border rounded cursor-grab flex items-center gap-2 hover:bg-pink-50">
                              <Bell className="h-3 w-3 text-pink-600" />
                              <span className="text-xs font-medium">Notificação</span>
                            </div>
                            <div className="p-2 border rounded cursor-grab flex items-center gap-2 hover:bg-cyan-50">
                              <MessageSquare className="h-3 w-3 text-cyan-600" />
                              <span className="text-xs font-medium">Mensagem</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Canvas do Workflow */}
                <div className="flex-1">
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Designer de Workflow</CardTitle>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Simular
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Validar
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="h-full overflow-auto">
                      <div className="relative w-full h-96 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                        
                        {workflowNodes.length === 0 ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center text-gray-500 dark:text-gray-400">
                              <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <h4 className="text-lg font-medium mb-2">Canvas de Workflow</h4>
                              <p className="text-sm mb-4">
                                {selectedTemplate 
                                  ? 'Workflow pré-configurado carregado. Personalize conforme necessário.'
                                  : 'Arraste elementos da paleta para criar seu workflow'
                                }
                              </p>
                              {selectedTemplate && (
                                <Button 
                                  onClick={() => loadTemplate(selectedTemplate)}
                                  className="mt-2"
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Recarregar Template
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="relative w-full h-full overflow-hidden">
                            {/* Renderizar nós do workflow */}
                            {workflowNodes.map((node) => (
                              <div
                                key={node.id}
                                className={`absolute p-3 rounded-lg border cursor-pointer transition-all hover:shadow-lg ${
                                  selectedNode?.id === node.id 
                                    ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950' 
                                    : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                                } ${
                                  node.type === 'start' ? 'border-green-500' :
                                  node.type === 'end' ? 'border-red-500' :
                                  node.type === 'decision' ? 'border-yellow-500' :
                                  node.type === 'parallel' ? 'border-purple-500' :
                                  'border-blue-500'
                                }`}
                                style={{
                                  left: `${node.position.x}px`,
                                  top: `${node.position.y}px`,
                                  minWidth: '120px',
                                  maxWidth: '150px'
                                }}
                                onClick={() => setSelectedNode(node)}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  {node.type === 'start' && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}
                                  {node.type === 'end' && <div className="w-3 h-3 bg-red-500 rounded-full"></div>}
                                  {node.type === 'task' && <Users className="h-3 w-3 text-blue-600" />}
                                  {node.type === 'decision' && <div className="w-3 h-3 bg-yellow-500 rounded transform rotate-45"></div>}
                                  {node.type === 'parallel' && <div className="w-3 h-3 bg-purple-500 rounded"></div>}
                                  {node.type === 'timer' && <Timer className="h-3 w-3 text-orange-600" />}
                                  {node.type === 'notification' && <Bell className="h-3 w-3 text-pink-600" />}
                                  <span className="text-xs font-medium truncate">{node.label}</span>
                                </div>
                                
                                <div className="text-xs text-gray-500 space-y-1">
                                  {node.data.assignedTo && (
                                    <div>👤 {node.data.assignedTo.join(', ')}</div>
                                  )}
                                  {node.data.priority && (
                                    <Badge className={`text-xs px-1 py-0 ${
                                      node.data.priority === 'high' || node.data.priority === 'critical' 
                                        ? 'bg-red-100 text-red-800' 
                                        : node.data.priority === 'medium' 
                                          ? 'bg-yellow-100 text-yellow-800' 
                                          : 'bg-green-100 text-green-800'
                                    }`}>
                                      {node.data.priority}
                                    </Badge>
                                  )}
                                </div>
                                
                                {/* Conectores de saída */}
                                {node.connections.map((connectionId, idx) => {
                                  const targetNode = workflowNodes.find(n => n.id === connectionId);
                                  if (!targetNode) return null;
                                  
                                  return (
                                    <svg
                                      key={`${node.id}-${connectionId}`}
                                      className="absolute pointer-events-none"
                                      style={{
                                        left: '100%',
                                        top: '50%',
                                        width: `${Math.abs(targetNode.position.x - node.position.x - 120)}px`,
                                        height: `${Math.abs(targetNode.position.y - node.position.y)}px`,
                                        transform: `translate(0, -50%)`
                                      }}
                                    >
                                      <defs>
                                        <marker id={`arrow-${node.id}-${idx}`} markerWidth="10" markerHeight="10" refX="9" refY="2" orient="auto" className="fill-gray-400">
                                          <polygon points="0 0, 10 2, 0 4" />
                                        </marker>
                                      </defs>
                                      <path
                                        d={`M 0 ${Math.abs(targetNode.position.y - node.position.y) > 50 ? 0 : Math.abs(targetNode.position.y - node.position.y)/2} L ${Math.abs(targetNode.position.x - node.position.x - 120)} ${targetNode.position.y - node.position.y < 0 ? 0 : Math.abs(targetNode.position.y - node.position.y)}`}
                                        stroke="#9CA3AF"
                                        strokeWidth="2"
                                        fill="none"
                                        markerEnd={`url(#arrow-${node.id}-${idx})`}
                                      />
                                    </svg>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Propriedades do Nó Selecionado */}
                <div className="w-64 flex-shrink-0">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Propriedades do Nó
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-auto">
                      {selectedNode ? (
                        <div className="space-y-4">
                          <div>
                            <Label className="text-xs">Nome do Nó</Label>
                            <Input
                              value={selectedNode.label}
                              onChange={(e) => {
                                const updatedNodes = workflowNodes.map(node => 
                                  node.id === selectedNode.id ? { ...node, label: e.target.value } : node
                                );
                                setWorkflowNodes(updatedNodes);
                                setSelectedNode({ ...selectedNode, label: e.target.value });
                                setHasUnsavedChanges(true);
                              }}
                              className="h-8 text-xs"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-xs">Tipo</Label>
                            <Select 
                              value={selectedNode.type}
                              onValueChange={(value: any) => {
                                const updatedNodes = workflowNodes.map(node => 
                                  node.id === selectedNode.id ? { ...node, type: value } : node
                                );
                                setWorkflowNodes(updatedNodes);
                                setSelectedNode({ ...selectedNode, type: value });
                                setHasUnsavedChanges(true);
                              }}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="start">Início</SelectItem>
                                <SelectItem value="task">Tarefa</SelectItem>
                                <SelectItem value="decision">Decisão</SelectItem>
                                <SelectItem value="parallel">Paralelo</SelectItem>
                                <SelectItem value="timer">Timer</SelectItem>
                                <SelectItem value="notification">Notificação</SelectItem>
                                <SelectItem value="end">Fim</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {(selectedNode.type === 'task' || selectedNode.type === 'decision') && (
                            <>
                              <div>
                                <Label className="text-xs">Responsável</Label>
                                <Select>
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Selecionar papel" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="respondent">Respondente</SelectItem>
                                    <SelectItem value="auditor">Auditor</SelectItem>
                                    <SelectItem value="manager">Gestor</SelectItem>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label className="text-xs">Prioridade</Label>
                                <Select 
                                  value={selectedNode.data.priority}
                                  onValueChange={(value: any) => {
                                    const updatedNodes = workflowNodes.map(node => 
                                      node.id === selectedNode.id 
                                        ? { ...node, data: { ...node.data, priority: value } } 
                                        : node
                                    );
                                    setWorkflowNodes(updatedNodes);
                                    setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, priority: value } });
                                    setHasUnsavedChanges(true);
                                  }}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Baixa</SelectItem>
                                    <SelectItem value="medium">Média</SelectItem>
                                    <SelectItem value="high">Alta</SelectItem>
                                    <SelectItem value="critical">Crítica</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </>
                          )}
                          
                          {selectedNode.type === 'decision' && (
                            <div>
                              <Label className="text-xs">Condição</Label>
                              <Textarea
                                value={selectedNode.data.condition || ''}
                                onChange={(e) => {
                                  const updatedNodes = workflowNodes.map(node => 
                                    node.id === selectedNode.id 
                                      ? { ...node, data: { ...node.data, condition: e.target.value } } 
                                      : node
                                  );
                                  setWorkflowNodes(updatedNodes);
                                  setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, condition: e.target.value } });
                                  setHasUnsavedChanges(true);
                                }}
                                className="h-16 text-xs"
                                placeholder="Ex: score >= 3"
                              />
                            </div>
                          )}
                          
                          <div className="pt-4 border-t">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const updatedNodes = workflowNodes.filter(node => node.id !== selectedNode.id);
                                setWorkflowNodes(updatedNodes);
                                setSelectedNode(null);
                                setHasUnsavedChanges(true);
                                toast.success('Nó removido!');
                              }}
                              className="w-full"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remover Nó
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Selecione um nó no canvas para editar suas propriedades
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* CAMADA 3: Analytics & Dashboard */}
            <TabsContent value="analytics" className="space-y-6 h-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                
                {/* Painel de KPIs */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Gauge className="h-5 w-5" />
                        KPIs do Processo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">85%</div>
                          <div className="text-sm text-blue-800 dark:text-blue-400">Taxa de Conclusão</div>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">3.2d</div>
                          <div className="text-sm text-green-800 dark:text-green-400">Tempo Médio</div>
                        </div>
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">92%</div>
                          <div className="text-sm text-yellow-800 dark:text-yellow-400">SLA Compliance</div>
                        </div>
                        <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">4.6/5</div>
                          <div className="text-sm text-purple-800 dark:text-purple-400">Satisfação</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart className="h-5 w-5" />
                        Gráficos de Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Processos Concluídos</span>
                          <span className="text-sm text-gray-600">156 / 180</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Dentro do Prazo</span>
                          <span className="text-sm text-gray-600">134 / 156</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '86%' }}></div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Sem Retrabalho</span>
                          <span className="text-sm text-gray-600">128 / 156</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '82%' }}></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Painel de Configuração de Dashboards */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Configurar Dashboard
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Métricas Principais</Label>
                        <div className="mt-2 space-y-2">
                          {[
                            { id: 'completion_rate', label: 'Taxa de Conclusão', enabled: true },
                            { id: 'average_time', label: 'Tempo Médio de Conclusão', enabled: true },
                            { id: 'sla_compliance', label: 'Conformidade com SLA', enabled: true },
                            { id: 'user_satisfaction', label: 'Satisfação do Usuário', enabled: false },
                            { id: 'error_rate', label: 'Taxa de Erros', enabled: false },
                            { id: 'rework_rate', label: 'Taxa de Retrabalho', enabled: true },
                          ].map((metric) => (
                            <div key={metric.id} className="flex items-center justify-between">
                              <Label className="text-sm">{metric.label}</Label>
                              <Switch checked={metric.enabled} />
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Tipos de Gráficos</Label>
                        <div className="mt-2 grid grid-cols-3 gap-2">
                          <Button variant="outline" size="sm" className="flex flex-col items-center gap-1 h-16">
                            <BarChart className="h-4 w-4" />
                            <span className="text-xs">Barras</span>
                          </Button>
                          <Button variant="outline" size="sm" className="flex flex-col items-center gap-1 h-16">
                            <LineChart className="h-4 w-4" />
                            <span className="text-xs">Linhas</span>
                          </Button>
                          <Button variant="outline" size="sm" className="flex flex-col items-center gap-1 h-16">
                            <PieChart className="h-4 w-4" />
                            <span className="text-xs">Pizza</span>
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Período de Análise</Label>
                        <Select>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Selecionar período" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7d">Últimos 7 dias</SelectItem>
                            <SelectItem value="30d">Últimos 30 dias</SelectItem>
                            <SelectItem value="90d">Últimos 90 dias</SelectItem>
                            <SelectItem value="1y">Último ano</SelectItem>
                            <SelectItem value="custom">Período personalizado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button className="w-full">
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Configuração do Dashboard
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Alertas e Notificações
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded">
                          <div>
                            <div className="font-medium text-sm">SLA em Risco</div>
                            <div className="text-xs text-gray-600">Quando processo exceder 80% do prazo</div>
                          </div>
                          <Switch checked />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded">
                          <div>
                            <div className="font-medium text-sm">Baixa Performance</div>
                            <div className="text-xs text-gray-600">Taxa de conclusão abaixo de 70%</div>
                          </div>
                          <Switch checked />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded">
                          <div>
                            <div className="font-medium text-sm">Meta Atingida</div>
                            <div className="text-xs text-gray-600">100% de conclusão em um período</div>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* CAMADA 4: Sistema de Relatórios */}
            <TabsContent value="reports" className="space-y-6 h-full">
              <div className="h-full flex gap-6">
                
                {/* Lista de Relatórios Disponíveis */}
                <div className="w-80 flex-shrink-0">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Relatórios Disponíveis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-auto">
                      <div className="space-y-4">
                        
                        {/* Relatórios Operacionais */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            Operacionais
                          </h4>
                          <div className="space-y-2">
                            <div className="p-3 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                              <div className="font-medium text-sm">Status dos Processos</div>
                              <div className="text-xs text-gray-600">Visão atual de todos os processos</div>
                            </div>
                            <div className="p-3 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                              <div className="font-medium text-sm">Performance por Usuário</div>
                              <div className="text-xs text-gray-600">Métricas individuais dos participantes</div>
                            </div>
                            <div className="p-3 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                              <div className="font-medium text-sm">Bottlenecks Identificados</div>
                              <div className="text-xs text-gray-600">Pontos de gargalo no fluxo</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Relatórios Analíticos */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            Analíticos
                          </h4>
                          <div className="space-y-2">
                            <div className="p-3 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                              <div className="font-medium text-sm">Tendências Históricas</div>
                              <div className="text-xs text-gray-600">Análise temporal dos dados</div>
                            </div>
                            <div className="p-3 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                              <div className="font-medium text-sm">Comparação entre Períodos</div>
                              <div className="text-xs text-gray-600">Evolução da performance</div>
                            </div>
                            <div className="p-3 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                              <div className="font-medium text-sm">Previsão de Demanda</div>
                              <div className="text-xs text-gray-600">Projeções baseadas em histórico</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Relatórios de Compliance */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            Compliance
                          </h4>
                          <div className="space-y-2">
                            <div className="p-3 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 bg-blue-50 dark:bg-blue-950">
                              <div className="font-medium text-sm">Relatório de Auditoria</div>
                              <div className="text-xs text-gray-600">Documentação completa para auditores</div>
                              <Badge className="mt-1 text-xs">Recomendado</Badge>
                            </div>
                            <div className="p-3 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                              <div className="font-medium text-sm">Conformidade Regulatória</div>
                              <div className="text-xs text-gray-600">Atendimento à regulamentações</div>
                            </div>
                            <div className="p-3 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                              <div className="font-medium text-sm">Log de Ações</div>
                              <div className="text-xs text-gray-600">Rastro completo de atividades</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Builder de Relatórios */}
                <div className="flex-1">
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Report Builder</CardTitle>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="h-full overflow-auto">
                      <div className="space-y-6">
                        
                        {/* Configurações do Relatório */}
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">Nome do Relatório</Label>
                              <Input 
                                placeholder="Ex: Relatório de Performance Mensal" 
                                className="mt-1"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium">Tipo de Relatório</Label>
                              <Select>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Selecionar tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="operational">Operacional</SelectItem>
                                  <SelectItem value="analytical">Analítico</SelectItem>
                                  <SelectItem value="compliance">Compliance</SelectItem>
                                  <SelectItem value="executive">Executivo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium">Formato de Saída</Label>
                              <div className="mt-2 flex gap-2">
                                <Button variant="outline" size="sm">PDF</Button>
                                <Button variant="outline" size="sm">Excel</Button>
                                <Button variant="outline" size="sm">Word</Button>
                                <Button variant="outline" size="sm">HTML</Button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">Período de Dados</Label>
                              <div className="mt-1 grid grid-cols-2 gap-2">
                                <Input type="date" />
                                <Input type="date" />
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium">Filtros</Label>
                              <div className="mt-2 space-y-2">
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Por departamento" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="it">TI</SelectItem>
                                    <SelectItem value="finance">Financeiro</SelectItem>
                                    <SelectItem value="hr">RH</SelectItem>
                                  </SelectContent>
                                </Select>
                                
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Por status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="completed">Concluídos</SelectItem>
                                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                                    <SelectItem value="overdue">Atrasados</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium">Agendamento</Label>
                              <Select>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Manual" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="manual">Manual</SelectItem>
                                  <SelectItem value="daily">Diário</SelectItem>
                                  <SelectItem value="weekly">Semanal</SelectItem>
                                  <SelectItem value="monthly">Mensal</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        
                        {/* Seções do Relatório */}
                        <div>
                          <Label className="text-sm font-medium">Seções do Relatório</Label>
                          <div className="mt-2 space-y-2">
                            {[
                              { id: 'summary', label: 'Resumo Executivo', enabled: true },
                              { id: 'kpis', label: 'Indicadores Principais', enabled: true },
                              { id: 'details', label: 'Detalhamento dos Dados', enabled: true },
                              { id: 'trends', label: 'Análise de Tendências', enabled: false },
                              { id: 'recommendations', label: 'Recomendações', enabled: false },
                              { id: 'appendix', label: 'Apêndices', enabled: false },
                            ].map((section) => (
                              <div key={section.id} className="flex items-center justify-between p-2 border rounded">
                                <Label className="text-sm">{section.label}</Label>
                                <Switch checked={section.enabled} />
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Preview do Relatório */}
                        <div>
                          <Label className="text-sm font-medium">Preview</Label>
                          <div className="mt-2 p-6 border rounded-lg bg-white dark:bg-gray-800">
                            <div className="text-center mb-6">
                              <h2 className="text-xl font-bold">Relatório de Performance</h2>
                              <p className="text-gray-600">Período: Janeiro 2024</p>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded">
                                  <div className="text-2xl font-bold text-blue-600">156</div>
                                  <div className="text-sm">Processos</div>
                                </div>
                                <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded">
                                  <div className="text-2xl font-bold text-green-600">92%</div>
                                  <div className="text-sm">Conclusão</div>
                                </div>
                                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded">
                                  <div className="text-2xl font-bold text-yellow-600">3.2d</div>
                                  <div className="text-sm">Tempo Médio</div>
                                </div>
                              </div>
                              
                              <div className="text-center text-gray-500 text-sm">
                                ... conteúdo detalhado do relatório ...
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* CAMADA 5: Sistema de Integrações */}
            <TabsContent value="integrations" className="space-y-6 h-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                
                {/* Integrações Disponíveis */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Network className="h-5 w-5" />
                        Integrações Disponíveis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        
                        {/* Notificações */}
                        <div>
                          <h4 className="font-semibold text-sm mb-3">Notificações</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border rounded">
                              <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-blue-600" />
                                <div>
                                  <div className="font-medium text-sm">Email SMTP</div>
                                  <div className="text-xs text-gray-600">Notificações por email</div>
                                </div>
                              </div>
                              <Switch checked />
                            </div>
                            
                            <div className="flex items-center justify-between p-3 border rounded">
                              <div className="flex items-center gap-3">
                                <MessageSquare className="h-5 w-5 text-green-600" />
                                <div>
                                  <div className="font-medium text-sm">WhatsApp Business</div>
                                  <div className="text-xs text-gray-600">Mensagens instantâneas</div>
                                </div>
                              </div>
                              <Switch />
                            </div>
                            
                            <div className="flex items-center justify-between p-3 border rounded">
                              <div className="flex items-center gap-3">
                                <Bell className="h-5 w-5 text-purple-600" />
                                <div>
                                  <div className="font-medium text-sm">Push Notifications</div>
                                  <div className="text-xs text-gray-600">Notificações no navegador</div>
                                </div>
                              </div>
                              <Switch checked />
                            </div>
                          </div>
                        </div>
                        
                        {/* Sistemas Externos */}
                        <div>
                          <h4 className="font-semibold text-sm mb-3">Sistemas Externos</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border rounded">
                              <div className="flex items-center gap-3">
                                <Database className="h-5 w-5 text-blue-600" />
                                <div>
                                  <div className="font-medium text-sm">ERP Integration</div>
                                  <div className="text-xs text-gray-600">SAP, Oracle, Dynamics</div>
                                </div>
                              </div>
                              <Button size="sm" variant="outline">Configurar</Button>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 border rounded">
                              <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-yellow-600" />
                                <div>
                                  <div className="font-medium text-sm">Active Directory</div>
                                  <div className="text-xs text-gray-600">Sincronização de usuários</div>
                                </div>
                              </div>
                              <Switch />
                            </div>
                            
                            <div className="flex items-center justify-between p-3 border rounded">
                              <div className="flex items-center gap-3">
                                <BarChart3 className="h-5 w-5 text-green-600" />
                                <div>
                                  <div className="font-medium text-sm">BI Tools</div>
                                  <div className="text-xs text-gray-600">Tableau, Power BI</div>
                                </div>
                              </div>
                              <Button size="sm" variant="outline">Configurar</Button>
                            </div>
                          </div>
                        </div>
                        
                        {/* APIs e Webhooks */}
                        <div>
                          <h4 className="font-semibold text-sm mb-3">APIs e Webhooks</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border rounded">
                              <div className="flex items-center gap-3">
                                <Globe className="h-5 w-5 text-indigo-600" />
                                <div>
                                  <div className="font-medium text-sm">REST API</div>
                                  <div className="text-xs text-gray-600">Acesso programático completo</div>
                                </div>
                              </div>
                              <Badge className="text-xs bg-green-100 text-green-800">Ativo</Badge>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 border rounded">
                              <div className="flex items-center gap-3">
                                <Zap className="h-5 w-5 text-orange-600" />
                                <div>
                                  <div className="font-medium text-sm">Webhooks</div>
                                  <div className="text-xs text-gray-600">Eventos em tempo real</div>
                                </div>
                              </div>
                              <Button size="sm" variant="outline">Gerenciar</Button>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 border rounded">
                              <div className="flex items-center gap-3">
                                <Sparkles className="h-5 w-5 text-purple-600" />
                                <div>
                                  <div className="font-medium text-sm">Zapier</div>
                                  <div className="text-xs text-gray-600">1000+ integrações automáticas</div>
                                </div>
                              </div>
                              <Switch />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Configuração de Integrações */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Configurar Integração
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      
                      {/* Configuração de Email */}
                      <div>
                        <h4 className="font-semibold text-sm mb-3">Configuração de Email</h4>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm">Servidor SMTP</Label>
                            <Input placeholder="smtp.company.com" className="mt-1" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm">Porta</Label>
                              <Input placeholder="587" className="mt-1" />
                            </div>
                            <div>
                              <Label className="text-sm">Segurança</Label>
                              <Select>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="TLS" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="tls">TLS</SelectItem>
                                  <SelectItem value="ssl">SSL</SelectItem>
                                  <SelectItem value="none">Nenhuma</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm">Usuário</Label>
                              <Input placeholder="sistema@company.com" className="mt-1" />
                            </div>
                            <div>
                              <Label className="text-sm">Senha</Label>
                              <Input type="password" placeholder="••••••••" className="mt-1" />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Templates de Mensagem */}
                      <div>
                        <h4 className="font-semibold text-sm mb-3">Templates de Mensagem</h4>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm">Processo Iniciado</Label>
                            <Textarea 
                              placeholder="Olá {nome}, um novo processo foi iniciado: {processo}..."
                              rows={3}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Tarefa Atribuída</Label>
                            <Textarea 
                              placeholder="Você tem uma nova tarefa: {tarefa}. Prazo: {prazo}..."
                              rows={3}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Processo Concluído</Label>
                            <Textarea 
                              placeholder="O processo {processo} foi concluído com sucesso..."
                              rows={3}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Configuração de Webhooks */}
                      <div>
                        <h4 className="font-semibold text-sm mb-3">Webhooks</h4>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm">URL do Endpoint</Label>
                            <Input placeholder="https://api.company.com/webhook" className="mt-1" />
                          </div>
                          <div>
                            <Label className="text-sm">Eventos</Label>
                            <div className="mt-2 space-y-2">
                              {[
                                { id: 'process_started', label: 'Processo Iniciado' },
                                { id: 'task_assigned', label: 'Tarefa Atribuída' },
                                { id: 'task_completed', label: 'Tarefa Concluída' },
                                { id: 'process_completed', label: 'Processo Concluído' },
                                { id: 'sla_warning', label: 'Alerta de SLA' },
                              ].map((event) => (
                                <div key={event.id} className="flex items-center space-x-2">
                                  <input type="checkbox" id={event.id} className="rounded" />
                                  <label htmlFor={event.id} className="text-sm">{event.label}</label>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm">Método HTTP</Label>
                              <Select>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="POST" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="post">POST</SelectItem>
                                  <SelectItem value="put">PUT</SelectItem>
                                  <SelectItem value="patch">PATCH</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-sm">Content-Type</Label>
                              <Select>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="JSON" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="json">application/json</SelectItem>
                                  <SelectItem value="form">application/x-www-form-urlencoded</SelectItem>
                                  <SelectItem value="xml">application/xml</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button className="flex-1">
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Configuração
                        </Button>
                        <Button variant="outline">
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Testar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AlexProcessDesignerEnhancedModal;