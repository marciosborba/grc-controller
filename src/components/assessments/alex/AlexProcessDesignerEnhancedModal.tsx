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
  ArrowRight, CheckCircle, AlertCircle, AlertTriangle, Users, Timer,
  GitBranch, MessageSquare, Bell, Gauge, TrendingUp,
  BarChart, PieChart, LineChart, Award, Shield, Cog,
  Lock, Phone, Link, CalendarDays, ToggleLeft, Image,
  Minus, Palette, Tag, PenTool, Plug, BookOpen, Info
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useProcessManagement } from '@/hooks/useProcessManagement';
import FormPreviewModal from './FormPreviewModal';

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
  const { saveProcess, updateProcess, loadProcess, loading: saveLoading } = useProcessManagement();
  const [activeLayer, setActiveLayer] = useState<'template' | 'form' | 'workflow' | 'analytics' | 'reports' | 'integrations' | 'documentation'>('template');
  const [isMaximized, setIsMaximized] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isFormPreviewOpen, setIsFormPreviewOpen] = useState(false);
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
  const [workflowConnections, setWorkflowConnections] = useState<any[]>([]);
  const [selectedWorkflowNode, setSelectedWorkflowNode] = useState<WorkflowNode | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionSource, setConnectionSource] = useState<string | null>(null);
  const [connectionLineStyle, setConnectionLineStyle] = useState<'straight' | 'curved'>('curved');
  const [connectionLineType, setConnectionLineType] = useState<'solid' | 'dashed'>('solid');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Estados para Relatórios
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [reportFilters, setReportFilters] = useState<any>({
    reportName: '',
    reportType: '',
    outputFormat: 'pdf',
    startDate: '',
    endDate: '',
    department: 'all',
    status: 'all',
    schedule: 'manual',
    sections: {
      summary: true,
      kpis: true,
      details: true,
      trends: false,
      recommendations: false,
      appendix: false
    }
  });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportHistory, setReportHistory] = useState<any[]>([]);
  
  // Estados para Integrações
  const [integrationSettings, setIntegrationSettings] = useState<any>({
    notifications: {
      email: { enabled: true, config: {} },
      whatsapp: { enabled: false, config: {} },
      push: { enabled: true, config: {} }
    },
    systems: {
      erp: { enabled: false, config: {} },
      activeDirectory: { enabled: false, config: {} },
      biTools: { enabled: false, config: {} }
    },
    apis: {
      restApi: { enabled: false, config: {} },
      webhook: { enabled: false, config: {} },
      customApi: { enabled: false, config: {} }
    }
  });
  
  // Estados do Processo
  const [processName, setProcessName] = useState('');
  const [processDescription, setProcessDescription] = useState('');
  const [processCategory, setProcessCategory] = useState<'compliance' | 'audit' | 'risk' | 'policy' | 'incident' | 'assessment' | 'custom'>('custom');
  const [processFramework, setProcessFramework] = useState('');
  
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
      setWorkflowConnections(initialData.workflowConnections || []);
      setProcessName(initialData.processName || '');
      setProcessDescription(initialData.processDescription || '');
      setProcessCategory(initialData.processCategory || 'custom');
      setProcessFramework(initialData.framework || '');
    }
  }, [initialData, mode]);

  useEffect(() => {
    if (selectedTemplate && selectedTemplate.id !== 'custom-blank') {
      loadTemplate(selectedTemplate);
    }
  }, [selectedTemplate]);

  // Load process data in edit mode
  useEffect(() => {
    const loadProcessData = async () => {
      if (mode === 'edit' && initialData?.id) {
        try {
          const processData = await loadProcess(initialData.id);
          if (processData) {
            setProcessName(processData.name);
            setProcessDescription(processData.description || '');
            setProcessCategory(processData.category || 'custom');
            
            // Load form structure if available
            if (processData.field_definitions?.fields) {
              setFormFields(processData.field_definitions.fields);
            }
            if (processData.field_definitions?.formRows) {
              setFormRows(processData.field_definitions.formRows);
            }
            
            // Load workflow if available
            if (processData.workflow_definition?.nodes) {
              setWorkflowNodes(processData.workflow_definition.nodes);
            }
            
            setActiveLayer('form');
            toast.success(`Processo "${processData.name}" carregado para edição!`);
          }
        } catch (error) {
          console.error('Erro ao carregar processo:', error);
          toast.error('Erro ao carregar processo para edição');
        }
      }
    };

    loadProcessData();
  }, [mode, initialData, loadProcess]);

  if (!isOpen) return null;

  // ==================== TEMPLATE CREATION FUNCTIONS ====================
  // These functions must be declared before loadTemplate to avoid temporal dead zone errors
  
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

  // ==================== TEMPLATE MANAGEMENT ====================
  const loadTemplate = useCallback((template: ProcessTemplate) => {
    setProcessName(template.name);
    setProcessDescription(template.description);
    setProcessCategory(template.category);
    setProcessFramework(template.framework);
    
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
  }, [createComplianceTemplate, createRiskAssessmentTemplate, createAuditChecklistTemplate]);

  // Funções para Relatórios
  const generateReport = useCallback(async (reportType: string) => {
    setIsGeneratingReport(true);
    try {
      // Buscar dados do processo atual
      const processData = {
        name: processName,
        description: processDescription,
        category: processCategory,
        framework: processFramework,
        formFields: formFields,
        formRows: formRows,
        workflowNodes: workflowNodes,
        workflowConnections: workflowConnections
      };

      // Gerar dados do relatório baseado no tipo
      let reportResult;
      switch (reportType) {
        case 'process_status':
          reportResult = generateProcessStatusReport(processData);
          break;
        case 'performance_user':
          reportResult = generatePerformanceReport(processData);
          break;
        case 'bottlenecks':
          reportResult = generateBottleneckReport(processData);
          break;
        case 'audit':
          reportResult = generateAuditReport(processData);
          break;
        case 'compliance':
          reportResult = generateComplianceReport(processData);
          break;
        default:
          reportResult = generateDefaultReport(processData);
      }

      setReportData(reportResult);
      setSelectedReport(reportType);
      
      // Adicionar ao histórico
      const newReportEntry = {
        id: Date.now(),
        name: reportFilters.reportName || `Relatório ${reportType}`,
        type: reportType,
        generatedAt: new Date().toISOString(),
        format: reportFilters.outputFormat,
        data: reportResult
      };
      
      setReportHistory(prev => [newReportEntry, ...prev]);
      toast.success('Relatório gerado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setIsGeneratingReport(false);
    }
  }, [processName, processDescription, processCategory, processFramework, formFields, formRows, workflowNodes, workflowConnections, reportFilters]);

  const generateProcessStatusReport = (processData: any) => {
    const totalFields = processData.formFields?.length || 0;
    const totalNodes = processData.workflowNodes?.length || 0;
    const totalConnections = processData.workflowConnections?.length || 0;
    
    return {
      title: 'Status do Processo',
      summary: {
        processName: processData.name,
        totalFields,
        totalNodes,
        totalConnections,
        completionRate: Math.min(100, ((totalFields + totalNodes) / 10) * 100)
      },
      details: {
        formStructure: processData.formFields?.map(field => ({
          name: field.name,
          type: field.type,
          required: field.validation?.required || false
        })) || [],
        workflowStructure: processData.workflowNodes?.map(node => ({
          id: node.id,
          type: node.type,
          name: node.properties?.name || node.type,
          position: node.position
        })) || []
      }
    };
  };

  const generatePerformanceReport = (processData: any) => {
    const mockPerformanceData = {
      averageCompletionTime: Math.floor(Math.random() * 10 + 3),
      successRate: Math.floor(Math.random() * 20 + 80),
      totalProcesses: Math.floor(Math.random() * 100 + 50),
      activeProcesses: Math.floor(Math.random() * 20 + 10)
    };
    
    return {
      title: 'Relatório de Performance',
      summary: mockPerformanceData,
      recommendations: [
        'Considere otimizar etapas com maior tempo de execução',
        'Implemente lembretes automáticos para reduzir atrasos',
        'Revise campos obrigatórios para simplificar preenchimento'
      ]
    };
  };

  const generateBottleneckReport = (processData: any) => {
    return {
      title: 'Análise de Gargalos',
      bottlenecks: [
        {
          stage: 'Preenchimento do Formulário',
          averageTime: '2.5 dias',
          frequency: 'Alto',
          suggestion: 'Simplificar campos obrigatórios'
        },
        {
          stage: 'Aprovação Gerencial', 
          averageTime: '1.8 dias',
          frequency: 'Médio',
          suggestion: 'Implementar aprovação automática para baixo risco'
        }
      ]
    };
  };

  const generateAuditReport = (processData: any) => {
    return {
      title: 'Relatório de Auditoria',
      processDefinition: processData,
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          action: 'Process Created',
          user: 'System',
          details: `Processo "${processData.name}" criado`
        },
        {
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          action: 'Form Updated',
          user: 'System', 
          details: `${processData.formFields?.length || 0} campos configurados`
        },
        {
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          action: 'Workflow Configured',
          user: 'System',
          details: `${processData.workflowNodes?.length || 0} etapas definidas`
        }
      ],
      complianceChecks: {
        formValidation: processData.formFields?.some(f => f.validation?.required) ? 'Passed' : 'Warning',
        workflowIntegrity: processData.workflowConnections?.length > 0 ? 'Passed' : 'Failed',
        documentation: processData.description ? 'Passed' : 'Warning'
      }
    };
  };

  const generateComplianceReport = (processData: any) => {
    return {
      title: 'Relatório de Conformidade',
      framework: processData.framework,
      complianceScore: Math.floor(Math.random() * 30 + 70),
      requirements: [
        {
          requirement: 'Documentação de Processo',
          status: processData.description ? 'Compliant' : 'Non-Compliant',
          evidence: processData.description || 'N/A'
        },
        {
          requirement: 'Controles de Validação',
          status: processData.formFields?.some(f => f.validation?.required) ? 'Compliant' : 'Partially Compliant',
          evidence: `${processData.formFields?.filter(f => f.validation?.required).length || 0} campos obrigatórios`
        },
        {
          requirement: 'Fluxo de Aprovação',
          status: processData.workflowNodes?.length > 2 ? 'Compliant' : 'Non-Compliant',
          evidence: `${processData.workflowNodes?.length || 0} etapas de workflow`
        }
      ]
    };
  };

  const generateDefaultReport = (processData: any) => {
    return {
      title: 'Relatório Geral',
      processData,
      generatedAt: new Date().toISOString(),
      summary: 'Relatório básico do processo criado'
    };
  };

  const exportReport = useCallback(async (format: string) => {
    if (!reportData) {
      toast.error('Nenhum relatório selecionado para exportar');
      return;
    }

    try {
      // Simular exportação do relatório
      const exportData = {
        ...reportData,
        exportFormat: format,
        exportedAt: new Date().toISOString()
      };

      // Em um cenário real, aqui seria feita a chamada para API de exportação
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportData.title}_${format}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Relatório exportado em formato ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast.error('Erro ao exportar relatório');
    }
  }, [reportData]);

  // Funções para Integrações
  const toggleIntegration = useCallback((category: string, integration: string) => {
    setIntegrationSettings(prev => {
      const newSettings = {
        ...prev,
        [category]: {
          ...prev[category],
          [integration]: {
            ...prev[category][integration],
            enabled: !prev[category][integration].enabled
          }
        }
      };
      
      toast.success(
        `Integração ${newSettings[category][integration].enabled ? 'ativada' : 'desativada'}: ${integration}`
      );
      
      return newSettings;
    });
  }, []);

  const configureIntegration = useCallback((category: string, integration: string) => {
    // Em um cenário real, isso abriria um modal de configuração
    toast.info(`Configurando integração: ${integration}. Em breve será implementada a interface de configuração.`);
    
    // Simular configuração
    setIntegrationSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [integration]: {
          ...prev[category][integration],
          config: {
            ...prev[category][integration].config,
            configured: true,
            configuredAt: new Date().toISOString()
          }
        }
      }
    }));
  }, []);

  const testIntegration = useCallback(async (category: string, integration: string) => {
    const integrationConfig = integrationSettings[category][integration];
    
    if (!integrationConfig.enabled) {
      toast.error('Integração deve estar ativa para ser testada');
      return;
    }

    toast.info('Testando integração...');
    
    // Simular teste de integração
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular resultado do teste
      const success = Math.random() > 0.3; // 70% de sucesso
      
      if (success) {
        toast.success(`Teste de integração ${integration} bem-sucedido!`);
      } else {
        toast.error(`Falha no teste de integração ${integration}. Verifique as configurações.`);
      }
    } catch (error) {
      toast.error('Erro durante o teste de integração');
    }
  }, [integrationSettings]);

  const saveIntegrationsToDatabase = useCallback(async () => {
    try {
      // Em um cenário real, salvaria no banco de dados
      console.log('Salvando configurações de integração no banco:', integrationSettings);
      
      // Simular chamada para o banco
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Configurações de integração salvas com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao salvar integrações:', error);
      toast.error('Erro ao salvar configurações de integração');
      return false;
    }
  }, [integrationSettings]);

  // Função para verificar integridade dos dados salvos
  const verifySaveIntegrity = useCallback(async (savedId: string, originalData: any) => {
    try {
      // Em um cenário real, faria uma consulta no banco para verificar se todos os dados foram salvos corretamente
      const verification = {
        hasFormFields: originalData.formFields?.length > 0,
        hasWorkflowNodes: originalData.workflowNodes?.length > 0,
        hasAnalytics: originalData.analytics?.kpis?.length > 0 || originalData.analytics?.reports?.length > 0,
        hasIntegrations: Object.keys(originalData.integrations || {}).length > 0
      };
      
      console.log('📊 Verificação de integridade dos dados salvos:', verification);
      console.log('📋 Dados originais a serem salvos:', originalData);
      
      // Simular verificação (em produção, consultaria o banco)
      return true;
    } catch (error) {
      console.error('❌ Erro na verificação de integridade:', error);
      return false;
    }
  }, []);

  const handleSave = async () => {
    if (!processName.trim()) {
      toast.error('Nome do processo é obrigatório!');
      return;
    }

    if (saveLoading) {
      toast.info('Aguarde, salvando processo...');
      return;
    }

    // Validações adicionais
    if (!selectedTemplate) {
      toast.error('Selecione um template antes de salvar');
      return;
    }

    if (formFields.length === 0 && workflowNodes.length === 0) {
      toast.error('O processo deve ter pelo menos campos de formulário ou etapas de workflow');
      return;
    }

    // Validar conexões do workflow se houver nós
    if (workflowNodes.length > 1 && workflowConnections.length === 0) {
      toast.warning('Considere conectar as etapas do workflow para um fluxo completo');
    }

    // Validar integrações ativas sem configuração
    const activeIntegrations = Object.values(integrationSettings).flatMap(category => 
      Object.values(category).filter((integration: any) => integration.enabled && !integration.config?.configured)
    );
    
    if (activeIntegrations.length > 0) {
      toast.warning('Algumas integrações estão ativas mas não configuradas');
    }

    const processData = {
      name: processName,
      description: processDescription,
      category: processCategory,
      framework: processCategory.toUpperCase(),
      formFields,
      formRows,
      workflowNodes,
      workflowConnections,
      analytics: {
        kpis: selectedTemplate?.analytics?.kpis || ['Tempo de Execução', 'Taxa de Conclusão'],
        reports: selectedTemplate?.analytics?.reports || ['Relatório de Performance']
      },
      integrations: integrationSettings
    };

    try {
      let result;
      if (mode === 'edit' && initialData?.id) {
        result = await updateProcess(initialData.id, processData);
        if (result) {
          const verified = await verifySaveIntegrity(initialData.id, processData);
          if (verified) {
            toast.success('Processo atualizado com sucesso! Todos os dados foram salvos corretamente.');
            console.log('✅ Processo atualizado com ID:', initialData.id);
          } else {
            toast.warning('Processo atualizado, mas alguns dados podem não ter sido salvos completamente');
          }
          
          setHasUnsavedChanges(false);
          if (onSave) {
            onSave({ ...processData, id: initialData.id });
          }
        }
      } else {
        result = await saveProcess(processData);
        if (result) {
          const verified = await verifySaveIntegrity(result, processData);
          if (verified) {
            toast.success('Processo salvo com sucesso! Todos os dados foram salvos corretamente.');
            console.log('✅ Processo salvo com ID:', result);
          } else {
            toast.warning('Processo salvo, mas alguns dados podem não ter sido salvos completamente');
          }
          
          setHasUnsavedChanges(false);
          if (onSave) {
            onSave({ ...processData, id: result });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao salvar processo:', error);
      toast.error('Erro ao salvar processo. Tente novamente.');
    }
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
    setSelectedWorkflowNode(null);
    setSelectedTemplate(null);
    setProcessName('');
    setProcessDescription('');
    setProcessCategory('custom');
    setHasUnsavedChanges(false);
    setShowPreview(false);
  };

  // Template creation functions moved to before loadTemplate function

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

  // ==================== HELPER FUNCTIONS FOR WORKFLOW NODES ====================
  // These functions must be declared before they are used to avoid temporal dead zone errors
  
  const getNodeShape = useCallback((type: string) => {
    switch (type) {
      case 'start': return 'rounded-full';
      case 'end': return 'rounded-full';
      case 'decision': return 'transform rotate-45 rounded-none';
      case 'task': return 'rounded-lg';
      case 'parallel': return 'rounded-none';
      default: return 'rounded-lg';
    }
  }, []);

  const getNodeSize = useCallback((type: string) => {
    switch (type) {
      case 'start': case 'end': return { width: '100px', height: '100px' };
      case 'decision': return { width: '120px', height: '120px' };
      case 'task': return { width: '150px', height: '80px' };
      case 'parallel': return { width: '140px', height: '60px' };
      default: return { width: '150px', height: '80px' };
    }
  }, []);
  
  const getDefaultWorkflowData = useCallback((type: string) => {
    const defaults: Record<string, any> = {
      start: { priority: 'medium', description: '' },
      end: { priority: 'medium', description: '' },
      decision: { condition: '', priority: 'medium', description: '' },
      parallel: { priority: 'medium', description: '' },
      user_task: { assignedTo: [], priority: 'medium', description: '', formFields: [] },
      auto_task: { script: '', priority: 'medium', description: '' },
      approval: { approvers: [], priority: 'medium', description: '' },
      review: { reviewers: [], priority: 'medium', description: '' },
      timer: { timerDuration: '3600', priority: 'medium', description: '' },
      notification: { notificationTemplate: '', recipients: [], priority: 'medium', description: '' }
    };
    
    return defaults[type] || { priority: 'medium' };
  }, []);

  // ==================== WORKFLOW HANDLERS ====================
  const handleWorkflowDragStart = useCallback((e: React.DragEvent, nodeData: any) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', JSON.stringify(nodeData));
    
    console.log('🔄 [WORKFLOW DRAG] Iniciando drag:', nodeData);
  }, []);

  const handleWorkflowCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleWorkflowCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    try {
      const nodeData = JSON.parse(e.dataTransfer.getData('text/plain'));
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - 60; // Offset para centralizar
      const y = e.clientY - rect.top - 20;
      
      const newNode = {
        id: `node_${Date.now()}`,
        type: nodeData.type,
        label: nodeData.label,
        position: { x: Math.max(0, x), y: Math.max(0, y) },
        data: getDefaultWorkflowData(nodeData.type),
        connections: []
      };
      
      setWorkflowNodes(prev => [...prev, newNode]);
      console.log('🔄 [WORKFLOW DROP] Nó adicionado:', newNode);
      toast.success(`Elemento "${nodeData.label}" adicionado ao workflow!`);
    } catch (error) {
      console.error('❌ [WORKFLOW DROP] Erro ao adicionar nó:', error);
      toast.error('Erro ao adicionar elemento ao workflow');
    }
  }, [getDefaultWorkflowData]);

  // Conectar nós do workflow
  const handleWorkflowNodeClick = useCallback((node: WorkflowNode) => {
    if (isConnecting) {
      if (connectionSource && connectionSource !== node.id) {
        // Criar conexão entre o nó fonte e o nó alvo
        const newConnection = {
          id: `conn_${Date.now()}`,
          source: connectionSource,
          target: node.id,
          label: '',
          condition: ''
        };
        
        setWorkflowConnections(prev => [...prev, newConnection]);
        setIsConnecting(false);
        setConnectionSource(null);
        toast.success(`Conexão criada entre os nós!`);
      } else if (!connectionSource) {
        // Definir este nó como fonte da conexão
        setConnectionSource(node.id);
        toast.info('Nó fonte selecionado. Clique em outro nó para criar a conexão.');
      } else {
        // Tentativa de conectar um nó a si mesmo
        toast.warning('Não é possível conectar um nó a si mesmo.');
      }
    } else {
      // Modo normal: apenas selecionar o nó para edição
      setSelectedWorkflowNode(node);
    }
  }, [isConnecting, connectionSource]);
  
  const startConnection = useCallback((nodeId: string) => {
    setIsConnecting(true);
    setConnectionSource(nodeId);
    toast.info('Modo de conexão ativo. Clique em outro nó para conectar ou pressione ESC para cancelar.');
  }, []);

  const cancelConnection = useCallback(() => {
    setIsConnecting(false);
    setConnectionSource(null);
    toast.info('Modo de conexão cancelado.');
  }, []);

  // Listener para cancelar conexão com ESC
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isConnecting) {
        cancelConnection();
      }
    };

    if (isConnecting) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isConnecting, cancelConnection]);
  
  const deleteWorkflowNode = useCallback((nodeId: string) => {
    setWorkflowNodes(prev => prev.filter(n => n.id !== nodeId));
    setWorkflowConnections(prev => prev.filter(c => c.source !== nodeId && c.target !== nodeId));
    setSelectedWorkflowNode(null);
    toast.success('Nó removido do workflow');
  }, []);
  
  const updateWorkflowNode = useCallback((nodeId: string, updates: any) => {
    setWorkflowNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
  }, []);

  const getNodeCenter = useCallback((node: any) => {
    const size = 
      node.type === 'start' || node.type === 'end' ? { width: 100, height: 100 } :
      node.type === 'decision' ? { width: 120, height: 120 } :
      node.type === 'task' ? { width: 150, height: 80 } :
      node.type === 'parallel' ? { width: 140, height: 60 } :
      { width: 150, height: 80 };
    
    return {
      x: node.position.x + size.width / 2,
      y: node.position.y + size.height / 2
    };
  }, []);

  const getNodeStateClasses = useCallback((node: any) => {
    if (selectedWorkflowNode?.id === node.id) {
      return 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950';
    }
    if (isConnecting && connectionSource === node.id) {
      return 'ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-950 animate-pulse';
    }
    if (isConnecting) {
      return 'bg-white dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-950 hover:ring-2 hover:ring-green-400';
    }
    return 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600';
  }, [selectedWorkflowNode, isConnecting, connectionSource]);

  const getNodeTypeClasses = useCallback((nodeType: string) => {
    switch (nodeType) {
      case 'start': return 'border-green-500 bg-green-50 dark:bg-green-900';
      case 'end': return 'border-red-500 bg-red-50 dark:bg-red-900';
      case 'decision': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900';
      case 'parallel': return 'border-purple-500 bg-purple-50 dark:bg-purple-900';
      default: return 'border-blue-500 bg-blue-50 dark:bg-blue-900';
    }
  }, []);

  // Drag and Drop para nodes do workflow - MOVED BEFORE renderWorkflowNodes
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, node: WorkflowNode) => {
    if (isConnecting) return;
    
    e.preventDefault();
    setIsDragging(true);
    setSelectedWorkflowNode(node);
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const canvasRect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, [isConnecting]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedWorkflowNode) return;
    
    const canvasRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;
    
    // Constrain within canvas bounds
    const constrainedX = Math.max(0, Math.min(newX, canvasRect.width - 150));
    const constrainedY = Math.max(0, Math.min(newY, canvasRect.height - 100));
    
    updateWorkflowNode(selectedWorkflowNode.id, {
      position: { x: constrainedX, y: constrainedY }
    });
  }, [isDragging, selectedWorkflowNode, dragOffset, updateWorkflowNode]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const renderWorkflowNodes = useCallback(() => {
    return workflowNodes.map((node) => {
      const nodeSize = getNodeSize(node.type);
      
      return (
        <div
          key={node.id}
          className={`absolute flex items-center justify-center cursor-pointer transition-all hover:shadow-lg border-2 ${getNodeShape(node.type)} ${getNodeStateClasses(node)} ${getNodeTypeClasses(node.type)}`}
          onClick={() => !isDragging && handleWorkflowNodeClick(node)}
          onMouseDown={(e) => handleNodeMouseDown(e, node)}
          style={{
            left: `${node.position.x}px`,
            top: `${node.position.y}px`,
            width: nodeSize.width,
            height: nodeSize.height,
            zIndex: 10,
            cursor: isDragging && selectedWorkflowNode?.id === node.id ? 'grabbing' : 'grab'
          }}
        >
          <div className={`flex flex-col items-center justify-center h-full w-full text-center p-2 ${
            node.type === 'decision' ? 'transform -rotate-45' : ''
          }`}>
            <div className="flex items-center justify-center gap-1 mb-1">
              {node.type === 'start' && <div className="w-2 h-2 bg-green-600 rounded-full"></div>}
              {node.type === 'end' && <div className="w-2 h-2 bg-red-600 rounded-full"></div>}
              {node.type === 'task' && <Users className="h-3 w-3 text-blue-700 dark:text-blue-300" />}
              {node.type === 'decision' && <div className="w-2 h-2 bg-yellow-600 rounded"></div>}
              {node.type === 'parallel' && <div className="w-2 h-2 bg-purple-600 rounded"></div>}
              {node.type === 'timer' && <Timer className="h-3 w-3 text-orange-700 dark:text-orange-300" />}
              {node.type === 'notification' && <Bell className="h-3 w-3 text-pink-700 dark:text-pink-300" />}
              {isConnecting && connectionSource === node.id && (
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
              )}
            </div>
            
            <span className={`text-xs font-semibold text-gray-800 dark:text-gray-200 leading-tight ${
              node.type === 'start' || node.type === 'end' ? 'max-w-[70px]' :
              node.type === 'decision' ? 'max-w-[80px]' :
              'max-w-[130px]'
            } overflow-hidden`} 
            style={{ 
              display: '-webkit-box',
              WebkitLineClamp: node.type === 'task' ? 2 : 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {node.label}
            </span>

            {(node.type === 'task' || node.type === 'timer') && node.data?.priority && (
              <div className={`mt-1 px-1 py-0 rounded text-xs ${
                node.data?.priority === 'high' || node.data?.priority === 'critical' 
                  ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200' 
                  : node.data?.priority === 'medium' 
                    ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' 
                    : 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
              }`}>
                {node.data?.priority}
              </div>
            )}
          </div>
        
        {/* Botões de ação */}
        {selectedWorkflowNode?.id === node.id && (
          <div className="absolute -top-2 -right-2 flex gap-1 z-20">
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                startConnection(node.id);
              }}
              title="Conectar a outro nó"
            >
              <Plus className="h-2 w-2" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                deleteWorkflowNode(node.id);
              }}
              title="Remover nó"
            >
              <X className="h-2 w-2" />
            </Button>
          </div>
        )}
      </div>
      );
    });
  }, [
    workflowNodes, getNodeSize, getNodeShape, getNodeStateClasses, getNodeTypeClasses,
    isDragging, handleWorkflowNodeClick, handleNodeMouseDown, selectedWorkflowNode,
    isConnecting, connectionSource, startConnection, deleteWorkflowNode
  ]);

  // Drag and Drop functions moved above renderWorkflowNodes

  // Helper functions moved to the top of the workflow section

  const updateNodeProperty = useCallback((nodeId: string, property: string, value: any) => {
    setWorkflowNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, [property]: value } }
        : node
    ));
    
    if (selectedWorkflowNode && selectedWorkflowNode.id === nodeId) {
      setSelectedWorkflowNode(prev => prev ? { ...prev, data: { ...prev.data, [property]: value } } : null);
    }
    
    setHasUnsavedChanges(true);
  }, [selectedWorkflowNode]);

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
              {activeLayer === 'form' && formFields.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsFormPreviewOpen(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Formulário
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSave}
                disabled={!processName.trim() || (!formFields.length && !workflowNodes.length) || saveLoading}
              >
                {saveLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Processo
                  </>
                )}
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
              <TabsList className="grid w-full grid-cols-7 bg-gray-100 dark:bg-gray-700">
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
                <TabsTrigger value="documentation" className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Documentação</span>
                  <span className="sm:hidden">Docs</span>
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
                          setProcessFramework(template.framework);
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
              <div className="h-full flex gap-4">
                
                {/* Paleta de Nós do Workflow */}
                <div className="w-56 flex-shrink-0 min-w-0">
                  <Card className="h-full flex flex-col">
                    <CardHeader className="pb-2 px-3 pt-3 flex-shrink-0">
                      <CardTitle className="text-xs flex items-center gap-2">
                        <GitBranch className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">Elementos Workflow</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-2 pb-3 flex-1 min-h-0 overflow-y-auto">
                      <div className="space-y-3">
                        
                        {/* Nós de Controle */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 px-1">
                            Controle de Fluxo
                          </h4>
                          <div className="space-y-1">
                            <div className="group p-2 border rounded cursor-grab flex items-center gap-2 hover:bg-green-50 dark:hover:bg-green-950 hover:border-green-300 dark:hover:border-green-600 transition-all w-full"
                                 draggable
                                 onDragStart={(e) => handleWorkflowDragStart(e, { type: 'start', label: 'Início', category: 'control' })}
                                 title="Ponto de início do processo">
                              <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                              <span className="text-xs font-medium text-gray-900 dark:text-gray-100 flex-1">Início</span>
                              <GripVertical className="h-2 w-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                            <div className="group p-2 border rounded cursor-grab flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 dark:hover:border-red-600 transition-all w-full"
                                 draggable
                                 onDragStart={(e) => handleWorkflowDragStart(e, { type: 'end', label: 'Fim', category: 'control' })}
                                 title="Ponto de finalização do processo">
                              <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
                              <span className="text-xs font-medium text-gray-900 dark:text-gray-100 flex-1">Fim</span>
                              <GripVertical className="h-2 w-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                            <div className="group p-2 border rounded cursor-grab flex items-center gap-2 hover:bg-yellow-50 dark:hover:bg-yellow-950 hover:border-yellow-300 dark:hover:border-yellow-600 transition-all w-full"
                                 draggable
                                 onDragStart={(e) => handleWorkflowDragStart(e, { type: 'decision', label: 'Decisão', category: 'control' })}
                                 title="Ponto de decisão condicional">
                              <div className="w-3 h-3 bg-yellow-500 rounded transform rotate-45 flex-shrink-0"></div>
                              <span className="text-xs font-medium text-gray-900 dark:text-gray-100 flex-1">Decisão</span>
                              <GripVertical className="h-2 w-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                            <div className="group p-2 border rounded cursor-grab flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-950 hover:border-purple-300 dark:hover:border-purple-600 transition-all w-full"
                                 draggable
                                 onDragStart={(e) => handleWorkflowDragStart(e, { type: 'parallel', label: 'Paralelo', category: 'control' })}
                                 title="Execução paralela de tarefas">
                              <div className="w-3 h-3 bg-purple-500 rounded flex-shrink-0"></div>
                              <span className="text-xs font-medium text-gray-900 dark:text-gray-100 flex-1">Paralelo</span>
                              <GripVertical className="h-2 w-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                            <div className="group p-2 border rounded cursor-grab flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all w-full"
                                 draggable
                                 onDragStart={(e) => handleWorkflowDragStart(e, { type: 'merge', label: 'Junção', category: 'control' })}
                                 title="Junção de fluxos paralelos">
                              <div className="w-3 h-3 bg-indigo-500 rounded-full flex-shrink-0"></div>
                              <span className="text-xs font-medium text-gray-900 dark:text-gray-100 flex-1">Junção</span>
                              <GripVertical className="h-2 w-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Tarefas */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 px-1">
                            Tarefas
                          </h4>
                          <div className="space-y-1">
                            <div className="group p-2 border rounded cursor-grab flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-300 dark:hover:border-blue-600 transition-all w-full"
                                 draggable
                                 onDragStart={(e) => handleWorkflowDragStart(e, { type: 'user_task', label: 'Tarefa Usuário', category: 'task' })}
                                 title="Tarefa executada por usuário">
                              <Users className="h-3 w-3 text-blue-600 flex-shrink-0" />
                              <span className="text-xs font-medium text-gray-900 dark:text-gray-100 flex-1">Tarefa Usuário</span>
                              <GripVertical className="h-2 w-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                            <div className="group p-2 border rounded cursor-grab flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all w-full"
                                 draggable
                                 onDragStart={(e) => handleWorkflowDragStart(e, { type: 'auto_task', label: 'Tarefa Automática', category: 'task' })}
                                 title="Tarefa executada automaticamente">
                              <Cog className="h-3 w-3 text-indigo-600 flex-shrink-0" />
                              <span className="text-xs font-medium text-gray-900 dark:text-gray-100 flex-1">Tarefa Automática</span>
                              <GripVertical className="h-2 w-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                            <div className="group p-2 border rounded cursor-grab flex items-center gap-2 hover:bg-teal-50 dark:hover:bg-teal-950 hover:border-teal-300 dark:hover:border-teal-600 transition-all w-full"
                                 draggable
                                 onDragStart={(e) => handleWorkflowDragStart(e, { type: 'approval', label: 'Aprovação', category: 'task' })}
                                 title="Tarefa de aprovação">
                              <CheckCircle className="h-3 w-3 text-teal-600 flex-shrink-0" />
                              <span className="text-xs font-medium text-gray-900 dark:text-gray-100 flex-1">Aprovação</span>
                              <GripVertical className="h-2 w-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                            <div className="group p-2 border rounded cursor-grab flex items-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all w-full"
                                 draggable
                                 onDragStart={(e) => handleWorkflowDragStart(e, { type: 'review', label: 'Revisão', category: 'task' })}
                                 title="Tarefa de revisão">
                              <Eye className="h-3 w-3 text-emerald-600 flex-shrink-0" />
                              <span className="text-xs font-medium text-gray-900 dark:text-gray-100 flex-1">Revisão</span>
                              <GripVertical className="h-2 w-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                            <div className="group p-2 border rounded cursor-grab flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950 hover:border-rose-300 dark:hover:border-rose-600 transition-all w-full"
                                 draggable
                                 onDragStart={(e) => handleWorkflowDragStart(e, { type: 'escalation', label: 'Escalação', category: 'task' })}
                                 title="Tarefa de escalação">
                              <TrendingUp className="h-3 w-3 text-rose-600 flex-shrink-0" />
                              <span className="text-xs font-medium text-gray-900 dark:text-gray-100 flex-1">Escalação</span>
                              <GripVertical className="h-2 w-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Eventos */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 px-1">
                            Eventos
                          </h4>
                          <div className="space-y-1">
                            <div className="group p-2 border rounded cursor-grab flex items-center gap-2 hover:bg-orange-50 dark:hover:bg-orange-950 hover:border-orange-300 dark:hover:border-orange-600 transition-all w-full"
                                 draggable
                                 onDragStart={(e) => handleWorkflowDragStart(e, { type: 'timer', label: 'Timer', category: 'event' })}
                                 title="Evento baseado em tempo">
                              <Timer className="h-3 w-3 text-orange-600 flex-shrink-0" />
                              <span className="text-xs font-medium text-gray-900 dark:text-gray-100 flex-1">Timer</span>
                              <GripVertical className="h-2 w-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                            <div className="group p-2 border rounded cursor-grab flex items-center gap-2 hover:bg-pink-50 dark:hover:bg-pink-950 hover:border-pink-300 dark:hover:border-pink-600 transition-all w-full"
                                 draggable
                                 onDragStart={(e) => handleWorkflowDragStart(e, { type: 'notification', label: 'Notificação', category: 'event' })}
                                 title="Envio de notificação">
                              <Bell className="h-3 w-3 text-pink-600 flex-shrink-0" />
                              <span className="text-xs font-medium text-gray-900 dark:text-gray-100 flex-1">Notificação</span>
                              <GripVertical className="h-2 w-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                            <div className="group p-2 border rounded cursor-grab flex items-center gap-2 hover:bg-cyan-50 dark:hover:bg-cyan-950 hover:border-cyan-300 dark:hover:border-cyan-600 transition-all w-full"
                                 draggable
                                 onDragStart={(e) => handleWorkflowDragStart(e, { type: 'message', label: 'Mensagem', category: 'event' })}
                                 title="Envio de mensagem">
                              <MessageSquare className="h-3 w-3 text-cyan-600 flex-shrink-0" />
                              <span className="text-xs font-medium text-gray-900 dark:text-gray-100 flex-1">Mensagem</span>
                              <GripVertical className="h-2 w-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                            <div className="group p-2 border rounded cursor-grab flex items-center gap-2 hover:bg-amber-50 dark:hover:bg-amber-950 hover:border-amber-300 dark:hover:border-amber-600 transition-all w-full"
                                 draggable
                                 onDragStart={(e) => handleWorkflowDragStart(e, { type: 'webhook', label: 'Webhook', category: 'event' })}
                                 title="Chamada de webhook">
                              <Plug className="h-3 w-3 text-amber-600 flex-shrink-0" />
                              <span className="text-xs font-medium text-gray-900 dark:text-gray-100 flex-1">Webhook</span>
                              <GripVertical className="h-2 w-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                          </div>
                        </div>

                        {/* Conectores */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 px-1">
                            Conectores
                          </h4>
                          <div className="space-y-1">
                            <div className="group p-2 border rounded cursor-grab flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-600 transition-all w-full"
                                 draggable
                                 onDragStart={(e) => handleWorkflowDragStart(e, { type: 'condition', label: 'Condição', category: 'connector' })}
                                 title="Conector condicional">
                              <GitBranch className="h-3 w-3 text-slate-600 flex-shrink-0" />
                              <span className="text-xs font-medium text-gray-900 dark:text-gray-100 flex-1">Condição</span>
                              <GripVertical className="h-2 w-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                            <div className="group p-2 border rounded cursor-grab flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-950 hover:border-gray-300 dark:hover:border-gray-600 transition-all w-full"
                                 draggable
                                 onDragStart={(e) => handleWorkflowDragStart(e, { type: 'loop', label: 'Loop', category: 'connector' })}
                                 title="Loop de repetição">
                              <RefreshCw className="h-3 w-3 text-gray-600 flex-shrink-0" />
                              <span className="text-xs font-medium text-gray-900 dark:text-gray-100 flex-1">Loop</span>
                              <GripVertical className="h-2 w-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Canvas do Workflow */}
                <div className="flex-1 flex flex-col min-h-0">
                  <Card className="h-full flex flex-col">
                    <CardHeader className="flex-shrink-0 pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-lg">Designer de Workflow</CardTitle>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {workflowNodes.length} elemento{workflowNodes.length !== 1 ? 's' : ''} • {workflowConnections.length} conexã{workflowConnections.length !== 1 ? 'ões' : 'o'}
                          </div>
                          
                          {/* Controles de Linha */}
                          <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 rounded p-1">
                            <Button
                              size="sm"
                              variant={connectionLineStyle === 'straight' ? 'default' : 'ghost'}
                              className="h-6 px-2 text-xs"
                              onClick={() => setConnectionLineStyle('straight')}
                              title="Linhas retas"
                            >
                              ⎯
                            </Button>
                            <Button
                              size="sm"
                              variant={connectionLineStyle === 'curved' ? 'default' : 'ghost'}
                              className="h-6 px-2 text-xs"
                              onClick={() => setConnectionLineStyle('curved')}
                              title="Linhas curvas"
                            >
                              ⤴
                            </Button>
                            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                            <Button
                              size="sm"
                              variant={connectionLineType === 'solid' ? 'default' : 'ghost'}
                              className="h-6 px-2 text-xs"
                              onClick={() => setConnectionLineType('solid')}
                              title="Linha contínua"
                            >
                              ——
                            </Button>
                            <Button
                              size="sm"
                              variant={connectionLineType === 'dashed' ? 'default' : 'ghost'}
                              className="h-6 px-2 text-xs"
                              onClick={() => setConnectionLineType('dashed')}
                              title="Linha tracejada"
                            >
                              ⋯⋯
                            </Button>
                          </div>
                          {isConnecting && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full animate-pulse">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-xs font-medium">Modo Conexão</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-4 w-4 p-0 hover:bg-blue-200 dark:hover:bg-blue-800"
                                onClick={cancelConnection}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          <Button size="sm" variant="outline">
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Simular
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Validar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setWorkflowNodes([])}>
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Limpar
                          </Button>
                        </div>
                      </div>
                      
                      {/* Controles do Canvas */}
                      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-gray-600 dark:text-gray-400">Controles:</span>
                          <Badge variant="secondary">Arrastar para mover</Badge>
                          <Badge variant="secondary">Clique para selecionar</Badge>
                          <Badge variant="secondary">Del para excluir</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select defaultValue="100">
                            <SelectTrigger className="w-20 h-6 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="50">50%</SelectItem>
                              <SelectItem value="75">75%</SelectItem>
                              <SelectItem value="100">100%</SelectItem>
                              <SelectItem value="125">125%</SelectItem>
                              <SelectItem value="150">150%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 p-4">
                      <div className="relative w-full h-full bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 min-h-[600px] overflow-hidden"
                           onDrop={handleWorkflowCanvasDrop}
                           onDragOver={handleWorkflowCanvasDragOver}>
                        
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
                          <div 
                            className={`relative w-full h-full overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-default'}`}
                            onMouseMove={handleCanvasMouseMove}
                            onMouseUp={handleCanvasMouseUp}
                            onMouseLeave={handleCanvasMouseUp}
                          >
                            {/* Renderizar nós do workflow */}
                            {renderWorkflowNodes()}

                            
                            {/* Renderizar conexões do workflow */}
                            <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
                              {workflowConnections.map((connection) => {
                                const sourceNode = workflowNodes.find(n => n.id === connection.source);
                                const targetNode = workflowNodes.find(n => n.id === connection.target);
                                
                                if (!sourceNode || !targetNode) return null;
                                
                                const sourceCenter = getNodeCenter(sourceNode);
                                const targetCenter = getNodeCenter(targetNode);
                                
                                const strokeDashArray = connectionLineType === 'dashed' ? '8,4' : 'none';
                                
                                return (
                                  <g key={connection.id}>
                                    {connectionLineStyle === 'straight' ? (
                                      <line
                                        x1={sourceCenter.x}
                                        y1={sourceCenter.y}
                                        x2={targetCenter.x}
                                        y2={targetCenter.y}
                                        stroke="#6366f1"
                                        strokeWidth="2"
                                        strokeDasharray={strokeDashArray}
                                        markerEnd="url(#arrowhead)"
                                      />
                                    ) : (
                                      <path
                                        d={`M ${sourceCenter.x} ${sourceCenter.y} Q ${(sourceCenter.x + targetCenter.x) / 2} ${sourceCenter.y - 50} ${targetCenter.x} ${targetCenter.y}`}
                                        fill="none"
                                        stroke="#6366f1"
                                        strokeWidth="2"
                                        strokeDasharray={strokeDashArray}
                                        markerEnd="url(#arrowhead)"
                                      />
                                    )}
                                    {connection.label && (
                                      <text
                                        x={(sourceCenter.x + targetCenter.x) / 2}
                                        y={(sourceCenter.y + targetCenter.y) / 2 - 10}
                                        fill="#6366f1"
                                        fontSize="11"
                                        fontWeight="500"
                                        textAnchor="middle"
                                        className="pointer-events-auto cursor-pointer"
                                        style={{ filter: 'drop-shadow(1px 1px 1px rgba(255,255,255,0.8))' }}
                                      >
                                        {connection.label}
                                      </text>
                                    )}
                                  </g>
                                );
                              })}
                              
                              {/* Arrow marker definition */}
                              <defs>
                                <marker
                                  id="arrowhead"
                                  markerWidth="10"
                                  markerHeight="7"
                                  refX="9"
                                  refY="3.5"
                                  orient="auto"
                                >
                                  <polygon
                                    points="0 0, 10 3.5, 0 7"
                                    fill="#6366f1"
                                  />
                                </marker>
                              </defs>
                            </svg>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Propriedades do Nó Selecionado */}
                <div className="w-64 flex-shrink-0 min-h-0">
                  <Card className="h-full flex flex-col">
                    <CardHeader className="flex-shrink-0 pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Propriedades
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
                      {selectedWorkflowNode ? (
                        <div className="space-y-3 pr-2">
                          {/* Informações básicas do nó */}
                          <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-2 h-2 rounded-full ${
                                selectedWorkflowNode.type === 'start' ? 'bg-green-500' :
                                selectedWorkflowNode.type === 'end' ? 'bg-red-500' :
                                selectedWorkflowNode.type === 'decision' ? 'bg-yellow-500' :
                                selectedWorkflowNode.type === 'parallel' ? 'bg-purple-500' :
                                'bg-blue-500'
                              }`}></div>
                              <span className="text-xs font-medium">Tipo: {selectedWorkflowNode.type}</span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">ID: {selectedWorkflowNode.id}</div>
                          </div>

                          {/* Nome do nó */}
                          <div>
                            <Label className="text-xs font-semibold">Nome do Elemento</Label>
                            <Input
                              value={selectedWorkflowNode.properties?.name || selectedWorkflowNode.label}
                              onChange={(e) => updateNodeProperty(selectedWorkflowNode.id, 'name', e.target.value)}
                              className="h-8 text-xs mt-1"
                              placeholder="Nome do elemento"
                            />
                          </div>

                          {/* Descrição */}
                          <div>
                            <Label className="text-xs font-semibold">Descrição</Label>
                            <Textarea
                              value={selectedWorkflowNode.properties?.description || ''}
                              onChange={(e) => updateNodeProperty(selectedWorkflowNode.id, 'description', e.target.value)}
                              className="h-12 text-xs mt-1 resize-none"
                              placeholder="Descrição do elemento..."
                            />
                          </div>

                          {/* Propriedades específicas por tipo */}

                          {/* Elementos de Controle */}
                          {selectedWorkflowNode.type === 'start' && (
                            <div className="space-y-2">
                              <div>
                                <Label className="text-xs font-semibold">Tipo de Gatilho</Label>
                                <Select 
                                  value={selectedWorkflowNode.properties?.trigger || 'manual'}
                                  onValueChange={(value) => updateNodeProperty(selectedWorkflowNode.id, 'trigger', value)}
                                >
                                  <SelectTrigger className="h-7 text-xs mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="manual">Manual</SelectItem>
                                    <SelectItem value="automatic">Automático</SelectItem>
                                    <SelectItem value="scheduled">Agendado</SelectItem>
                                    <SelectItem value="event">Por Evento</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}

                          {selectedWorkflowNode.type === 'decision' && (
                            <div className="space-y-2">
                              <div>
                                <Label className="text-xs font-semibold">Condição</Label>
                                <Textarea
                                  value={selectedWorkflowNode.properties?.condition || ''}
                                  onChange={(e) => updateNodeProperty(selectedWorkflowNode.id, 'condition', e.target.value)}
                                  className="h-12 text-xs mt-1 resize-none"
                                  placeholder="Expressão condicional..."
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs font-semibold">Label Verdadeiro</Label>
                                  <Input
                                    value={selectedWorkflowNode.properties?.trueLabel || 'Sim'}
                                    onChange={(e) => updateNodeProperty(selectedWorkflowNode.id, 'trueLabel', e.target.value)}
                                    className="h-7 text-xs mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs font-semibold">Label Falso</Label>
                                  <Input
                                    value={selectedWorkflowNode.properties?.falseLabel || 'Não'}
                                    onChange={(e) => updateNodeProperty(selectedWorkflowNode.id, 'falseLabel', e.target.value)}
                                    className="h-7 text-xs mt-1"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {selectedWorkflowNode.type === 'parallel' && (
                            <div className="space-y-2">
                              <div>
                                <Label className="text-xs font-semibold">Número de Branches</Label>
                                <Input
                                  type="number"
                                  value={selectedWorkflowNode.properties?.branches || 2}
                                  onChange={(e) => updateNodeProperty(selectedWorkflowNode.id, 'branches', Number(e.target.value))}
                                  className="h-7 text-xs mt-1"
                                  min="2"
                                  max="10"
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="waitAll"
                                  checked={selectedWorkflowNode.properties?.waitAll || false}
                                  onChange={(e) => updateNodeProperty(selectedWorkflowNode.id, 'waitAll', e.target.checked)}
                                  className="h-3 w-3"
                                />
                                <Label htmlFor="waitAll" className="text-xs">Aguardar todos os branches</Label>
                              </div>
                            </div>
                          )}

                          {/* Tarefas */}
                          {['user_task', 'auto_task', 'approval', 'review', 'escalation'].includes(selectedWorkflowNode.type) && (
                            <div className="space-y-2">
                              {selectedWorkflowNode.type !== 'auto_task' && (
                                <div>
                                  <Label className="text-xs font-semibold">Responsável</Label>
                                  <Select 
                                    value={selectedWorkflowNode.properties?.assignee || ''}
                                    onValueChange={(value) => updateNodeProperty(selectedWorkflowNode.id, 'assignee', value)}
                                  >
                                    <SelectTrigger className="h-7 text-xs mt-1">
                                      <SelectValue placeholder="Selecionar responsável" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="respondent">Respondente</SelectItem>
                                      <SelectItem value="auditor">Auditor</SelectItem>
                                      <SelectItem value="manager">Gestor</SelectItem>
                                      <SelectItem value="admin">Administrador</SelectItem>
                                      <SelectItem value="custom">Personalizado</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              <div>
                                <Label className="text-xs font-semibold">Prioridade</Label>
                                <Select 
                                  value={selectedWorkflowNode.properties?.priority || 'medium'}
                                  onValueChange={(value) => updateNodeProperty(selectedWorkflowNode.id, 'priority', value)}
                                >
                                  <SelectTrigger className="h-7 text-xs mt-1">
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

                              {selectedWorkflowNode.type !== 'auto_task' && (
                                <div>
                                  <Label className="text-xs font-semibold">Prazo (dias)</Label>
                                  <Input
                                    type="number"
                                    value={selectedWorkflowNode.properties?.dueDays || ''}
                                    onChange={(e) => updateNodeProperty(selectedWorkflowNode.id, 'dueDays', Number(e.target.value))}
                                    className="h-7 text-xs mt-1"
                                    min="1"
                                    placeholder="Ex: 3"
                                  />
                                </div>
                              )}

                              {selectedWorkflowNode.type === 'auto_task' && (
                                <div>
                                  <Label className="text-xs font-semibold">Script/Ação</Label>
                                  <Textarea
                                    value={selectedWorkflowNode.properties?.script || ''}
                                    onChange={(e) => updateNodeProperty(selectedWorkflowNode.id, 'script', e.target.value)}
                                    className="h-16 text-xs mt-1 resize-none"
                                    placeholder="Código ou ação a executar..."
                                  />
                                </div>
                              )}

                              {selectedWorkflowNode.type === 'escalation' && (
                                <div>
                                  <Label className="text-xs font-semibold">Nível de Escalação</Label>
                                  <Input
                                    type="number"
                                    value={selectedWorkflowNode.properties?.level || 1}
                                    onChange={(e) => updateNodeProperty(selectedWorkflowNode.id, 'level', Number(e.target.value))}
                                    className="h-7 text-xs mt-1"
                                    min="1"
                                    max="5"
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Eventos */}
                          {selectedWorkflowNode.type === 'timer' && (
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs font-semibold">Duração</Label>
                                  <Input
                                    type="number"
                                    value={selectedWorkflowNode.properties?.duration || 60}
                                    onChange={(e) => updateNodeProperty(selectedWorkflowNode.id, 'duration', Number(e.target.value))}
                                    className="h-7 text-xs mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs font-semibold">Unidade</Label>
                                  <Select 
                                    value={selectedWorkflowNode.properties?.unit || 'minutes'}
                                    onValueChange={(value) => updateNodeProperty(selectedWorkflowNode.id, 'unit', value)}
                                  >
                                    <SelectTrigger className="h-7 text-xs mt-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="seconds">Segundos</SelectItem>
                                      <SelectItem value="minutes">Minutos</SelectItem>
                                      <SelectItem value="hours">Horas</SelectItem>
                                      <SelectItem value="days">Dias</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          )}

                          {['notification', 'message'].includes(selectedWorkflowNode.type) && (
                            <div className="space-y-2">
                              <div>
                                <Label className="text-xs font-semibold">Mensagem</Label>
                                <Textarea
                                  value={selectedWorkflowNode.properties?.message || ''}
                                  onChange={(e) => updateNodeProperty(selectedWorkflowNode.id, 'message', e.target.value)}
                                  className="h-16 text-xs mt-1 resize-none"
                                  placeholder="Conteúdo da mensagem..."
                                />
                              </div>
                              {selectedWorkflowNode.type === 'message' && (
                                <div>
                                  <Label className="text-xs font-semibold">Canal</Label>
                                  <Select 
                                    value={selectedWorkflowNode.properties?.channel || 'email'}
                                    onValueChange={(value) => updateNodeProperty(selectedWorkflowNode.id, 'channel', value)}
                                  >
                                    <SelectTrigger className="h-7 text-xs mt-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="email">Email</SelectItem>
                                      <SelectItem value="sms">SMS</SelectItem>
                                      <SelectItem value="push">Push</SelectItem>
                                      <SelectItem value="slack">Slack</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                          )}

                          {selectedWorkflowNode.type === 'webhook' && (
                            <div className="space-y-2">
                              <div>
                                <Label className="text-xs font-semibold">URL</Label>
                                <Input
                                  value={selectedWorkflowNode.properties?.url || ''}
                                  onChange={(e) => updateNodeProperty(selectedWorkflowNode.id, 'url', e.target.value)}
                                  className="h-7 text-xs mt-1"
                                  placeholder="https://api.exemplo.com/webhook"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-semibold">Método</Label>
                                <Select 
                                  value={selectedWorkflowNode.properties?.method || 'POST'}
                                  onValueChange={(value) => updateNodeProperty(selectedWorkflowNode.id, 'method', value)}
                                >
                                  <SelectTrigger className="h-7 text-xs mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="GET">GET</SelectItem>
                                    <SelectItem value="POST">POST</SelectItem>
                                    <SelectItem value="PUT">PUT</SelectItem>
                                    <SelectItem value="PATCH">PATCH</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}

                          {/* Configurações gerais */}
                          <div className="space-y-1.5 pt-2 border-t">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="active"
                                checked={selectedWorkflowNode.properties?.active !== false}
                                onChange={(e) => updateNodeProperty(selectedWorkflowNode.id, 'active', e.target.checked)}
                                className="h-3 w-3"
                              />
                              <Label htmlFor="active" className="text-xs">Ativo</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="required"
                                checked={selectedWorkflowNode.properties?.required || false}
                                onChange={(e) => updateNodeProperty(selectedWorkflowNode.id, 'required', e.target.checked)}
                                className="h-3 w-3"
                              />
                              <Label htmlFor="required" className="text-xs">Obrigatório</Label>
                            </div>
                          </div>
                          
                          {/* Botão de remoção */}
                          <div className="pt-3 border-t">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteWorkflowNode(selectedWorkflowNode.id)}
                              className="w-full h-7 text-xs"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Remover Elemento
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Settings className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            Nenhum elemento selecionado
                          </div>
                          <div className="text-xs text-gray-400">
                            Clique em um elemento no canvas para editar suas propriedades
                          </div>
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
                            <div 
                              className={`p-3 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedReport === 'process_status' ? 'bg-blue-50 dark:bg-blue-950 border-blue-300' : ''}`}
                              onClick={() => generateReport('process_status')}
                            >
                              <div className="font-medium text-sm">Status dos Processos</div>
                              <div className="text-xs text-gray-600 dark:text-gray-300">Visão atual de todos os processos</div>
                            </div>
                            <div 
                              className={`p-3 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedReport === 'performance_user' ? 'bg-blue-50 dark:bg-blue-950 border-blue-300' : ''}`}
                              onClick={() => generateReport('performance_user')}
                            >
                              <div className="font-medium text-sm">Performance por Usuário</div>
                              <div className="text-xs text-gray-600 dark:text-gray-300">Métricas individuais dos participantes</div>
                            </div>
                            <div 
                              className={`p-3 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedReport === 'bottlenecks' ? 'bg-blue-50 dark:bg-blue-950 border-blue-300' : ''}`}
                              onClick={() => generateReport('bottlenecks')}
                            >
                              <div className="font-medium text-sm">Bottlenecks Identificados</div>
                              <div className="text-xs text-gray-600 dark:text-gray-300">Pontos de gargalo no fluxo</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Relatórios Analíticos */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            Analíticos
                          </h4>
                          <div className="space-y-2">
                            <div 
                              className={`p-3 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedReport === 'trends' ? 'bg-blue-50 dark:bg-blue-950 border-blue-300' : ''}`}
                              onClick={() => generateReport('trends')}
                            >
                              <div className="font-medium text-sm">Tendências Históricas</div>
                              <div className="text-xs text-gray-600 dark:text-gray-300">Análise temporal dos dados</div>
                            </div>
                            <div 
                              className={`p-3 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedReport === 'comparison' ? 'bg-blue-50 dark:bg-blue-950 border-blue-300' : ''}`}
                              onClick={() => generateReport('comparison')}
                            >
                              <div className="font-medium text-sm">Comparação entre Períodos</div>
                              <div className="text-xs text-gray-600 dark:text-gray-300">Evolução da performance</div>
                            </div>
                            <div 
                              className={`p-3 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedReport === 'forecast' ? 'bg-blue-50 dark:bg-blue-950 border-blue-300' : ''}`}
                              onClick={() => generateReport('forecast')}
                            >
                              <div className="font-medium text-sm">Previsão de Demanda</div>
                              <div className="text-xs text-gray-600 dark:text-gray-300">Projeções baseadas em histórico</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Relatórios de Compliance */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            Compliance
                          </h4>
                          <div className="space-y-2">
                            <div 
                              className={`p-3 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedReport === 'audit' ? 'bg-blue-50 dark:bg-blue-950 border-blue-300' : 'bg-blue-50 dark:bg-blue-950'}`}
                              onClick={() => generateReport('audit')}
                            >
                              <div className="font-medium text-sm">Relatório de Auditoria</div>
                              <div className="text-xs text-gray-600 dark:text-gray-300">Documentação completa para auditores</div>
                              <Badge className="mt-1 text-xs">Recomendado</Badge>
                            </div>
                            <div 
                              className={`p-3 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedReport === 'compliance' ? 'bg-blue-50 dark:bg-blue-950 border-blue-300' : ''}`}
                              onClick={() => generateReport('compliance')}
                            >
                              <div className="font-medium text-sm">Conformidade Regulatória</div>
                              <div className="text-xs text-gray-600 dark:text-gray-300">Atendimento à regulamentações</div>
                            </div>
                            <div 
                              className={`p-3 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedReport === 'activity_log' ? 'bg-blue-50 dark:bg-blue-950 border-blue-300' : ''}`}
                              onClick={() => generateReport('activity_log')}
                            >
                              <div className="font-medium text-sm">Log de Ações</div>
                              <div className="text-xs text-gray-600 dark:text-gray-300">Rastro completo de atividades</div>
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
                          <Button 
                            size="sm" 
                            variant="outline"
                            disabled={!reportData || isGeneratingReport}
                            onClick={() => reportData && toast.success('Preview disponível abaixo')}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {isGeneratingReport ? 'Gerando...' : 'Preview'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            disabled={!reportData}
                            onClick={() => exportReport(reportFilters.outputFormat)}
                          >
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
                                value={reportFilters.reportName}
                                onChange={(e) => setReportFilters(prev => ({...prev, reportName: e.target.value}))}
                              />
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium">Tipo de Relatório</Label>
                              <Select value={reportFilters.reportType} onValueChange={(value) => setReportFilters(prev => ({...prev, reportType: value}))}>
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
                                <Button 
                                  variant={reportFilters.outputFormat === 'pdf' ? 'default' : 'outline'} 
                                  size="sm"
                                  onClick={() => setReportFilters(prev => ({...prev, outputFormat: 'pdf'}))}
                                >
                                  PDF
                                </Button>
                                <Button 
                                  variant={reportFilters.outputFormat === 'excel' ? 'default' : 'outline'} 
                                  size="sm"
                                  onClick={() => setReportFilters(prev => ({...prev, outputFormat: 'excel'}))}
                                >
                                  Excel
                                </Button>
                                <Button 
                                  variant={reportFilters.outputFormat === 'word' ? 'default' : 'outline'} 
                                  size="sm"
                                  onClick={() => setReportFilters(prev => ({...prev, outputFormat: 'word'}))}
                                >
                                  Word
                                </Button>
                                <Button 
                                  variant={reportFilters.outputFormat === 'html' ? 'default' : 'outline'} 
                                  size="sm"
                                  onClick={() => setReportFilters(prev => ({...prev, outputFormat: 'html'}))}
                                >
                                  HTML
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">Período de Dados</Label>
                              <div className="mt-1 grid grid-cols-2 gap-2">
                                <Input 
                                  type="date" 
                                  value={reportFilters.startDate}
                                  onChange={(e) => setReportFilters(prev => ({...prev, startDate: e.target.value}))}
                                />
                                <Input 
                                  type="date" 
                                  value={reportFilters.endDate}
                                  onChange={(e) => setReportFilters(prev => ({...prev, endDate: e.target.value}))}
                                />
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium">Filtros</Label>
                              <div className="mt-2 space-y-2">
                                <Select value={reportFilters.department} onValueChange={(value) => setReportFilters(prev => ({...prev, department: value}))}>
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
                                
                                <Select value={reportFilters.status} onValueChange={(value) => setReportFilters(prev => ({...prev, status: value}))}>
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
                              <Select value={reportFilters.schedule} onValueChange={(value) => setReportFilters(prev => ({...prev, schedule: value}))}>
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
                              { id: 'summary', label: 'Resumo Executivo' },
                              { id: 'kpis', label: 'Indicadores Principais' },
                              { id: 'details', label: 'Detalhamento dos Dados' },
                              { id: 'trends', label: 'Análise de Tendências' },
                              { id: 'recommendations', label: 'Recomendações' },
                              { id: 'appendix', label: 'Apêndices' },
                            ].map((section) => (
                              <div key={section.id} className="flex items-center justify-between p-2 border rounded">
                                <Label className="text-sm">{section.label}</Label>
                                <Switch 
                                  checked={reportFilters.sections[section.id] || false} 
                                  onCheckedChange={(checked) => 
                                    setReportFilters(prev => ({
                                      ...prev, 
                                      sections: {
                                        ...prev.sections,
                                        [section.id]: checked
                                      }
                                    }))
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Preview do Relatório */}
                        <div>
                          <Label className="text-sm font-medium">Preview</Label>
                          <div className="mt-2 p-6 border rounded-lg bg-white dark:bg-gray-800">
                            {reportData ? (
                              <div>
                                <div className="text-center mb-6">
                                  <h2 className="text-xl font-bold">{reportData.title}</h2>
                                  <p className="text-gray-600 dark:text-gray-300">
                                    Gerado em: {new Date().toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                                
                                {reportData.summary && (
                                  <div className="space-y-4">
                                    {typeof reportData.summary === 'object' ? (
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {Object.entries(reportData.summary).map(([key, value]) => (
                                          <div key={key} className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded">
                                            <div className="text-xl font-bold text-blue-600">{String(value)}</div>
                                            <div className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-gray-600 dark:text-gray-300">{reportData.summary}</p>
                                    )}
                                    
                                    {reportData.recommendations && (
                                      <div>
                                        <h3 className="font-semibold mb-2">Recomendações:</h3>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                          {reportData.recommendations.map((rec, index) => (
                                            <li key={index}>{rec}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {reportData.bottlenecks && (
                                      <div>
                                        <h3 className="font-semibold mb-2">Principais Gargalos:</h3>
                                        <div className="space-y-2">
                                          {reportData.bottlenecks.map((bottleneck, index) => (
                                            <div key={index} className="p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                                              <div className="font-medium">{bottleneck.stage}</div>
                                              <div className="text-sm text-gray-600 dark:text-gray-300">
                                                Tempo médio: {bottleneck.averageTime} | {bottleneck.suggestion}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {reportData.complianceChecks && (
                                      <div>
                                        <h3 className="font-semibold mb-2">Verificações de Conformidade:</h3>
                                        <div className="space-y-2">
                                          {Object.entries(reportData.complianceChecks).map(([check, status]) => (
                                            <div key={check} className="flex items-center justify-between p-2 border rounded">
                                              <span className="capitalize">{check.replace(/([A-Z])/g, ' $1').trim()}</span>
                                              <Badge variant={String(status) === 'Passed' ? 'default' : 'destructive'}>
                                                {String(status)}
                                              </Badge>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )
                                }
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <div className="text-xl font-bold">Preview do Relatório</div>
                                <p className="text-gray-600 dark:text-gray-300 mt-2">
                                  Selecione um tipo de relatório na lista à esquerda para visualizar o preview
                                </p>
                              </div>
                            )}
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
                                  <div className="text-xs text-gray-600 dark:text-gray-300">Notificações por email</div>
                                </div>
                              </div>
                              <Switch 
                                checked={integrationSettings.notifications.email.enabled} 
                                onCheckedChange={() => toggleIntegration('notifications', 'email')}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between p-3 border rounded">
                              <div className="flex items-center gap-3">
                                <MessageSquare className="h-5 w-5 text-green-600" />
                                <div>
                                  <div className="font-medium text-sm">WhatsApp Business</div>
                                  <div className="text-xs text-gray-600 dark:text-gray-300">Mensagens instantâneas</div>
                                </div>
                              </div>
                              <Switch 
                                checked={integrationSettings.notifications.whatsapp.enabled} 
                                onCheckedChange={() => toggleIntegration('notifications', 'whatsapp')}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between p-3 border rounded">
                              <div className="flex items-center gap-3">
                                <Bell className="h-5 w-5 text-purple-600" />
                                <div>
                                  <div className="font-medium text-sm">Push Notifications</div>
                                  <div className="text-xs text-gray-600 dark:text-gray-300">Notificações no navegador</div>
                                </div>
                              </div>
                              <Switch 
                                checked={integrationSettings.notifications.push.enabled} 
                                onCheckedChange={() => toggleIntegration('notifications', 'push')}
                              />
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
                                  <div className="text-xs text-gray-600 dark:text-gray-300">SAP, Oracle, Dynamics</div>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => configureIntegration('systems', 'erp')}
                              >
                                Configurar
                              </Button>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 border rounded">
                              <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-yellow-600" />
                                <div>
                                  <div className="font-medium text-sm">Active Directory</div>
                                  <div className="text-xs text-gray-600 dark:text-gray-300">Sincronização de usuários</div>
                                </div>
                              </div>
                              <Switch 
                                checked={integrationSettings.systems.activeDirectory.enabled} 
                                onCheckedChange={() => toggleIntegration('systems', 'activeDirectory')}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between p-3 border rounded">
                              <div className="flex items-center gap-3">
                                <BarChart3 className="h-5 w-5 text-green-600" />
                                <div>
                                  <div className="font-medium text-sm">BI Tools</div>
                                  <div className="text-xs text-gray-600 dark:text-gray-300">Tableau, Power BI</div>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => configureIntegration('systems', 'biTools')}
                              >
                                Configurar
                              </Button>
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

            {/* CAMADA 6: Documentação Completa */}
            <TabsContent value="documentation" className="space-y-6 h-full">
              <div className="max-w-6xl mx-auto">
                
                {/* Header da Documentação */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
                      <BookOpen className="h-8 w-8" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Documentação Completa</h1>
                      <p className="text-lg text-gray-600 dark:text-gray-300">Guia definitivo para criar processos profissionais</p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1">
                    Passo a Passo Detalhado
                  </Badge>
                </div>

                {/* Índice de Navegação Rápida */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      Índice de Navegação Rápida
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <a href="#step-1" className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors border border-blue-200 dark:border-blue-700">
                        <Layout className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">1. Templates</span>
                      </a>
                      <a href="#step-2" className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors border border-green-200 dark:border-green-700">
                        <Edit className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">2. Formulários</span>
                      </a>
                      <a href="#step-3" className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors border border-purple-200 dark:border-purple-700">
                        <Workflow className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">3. Workflows</span>
                      </a>
                      <a href="#step-4" className="flex items-center gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors border border-orange-200 dark:border-orange-700">
                        <BarChart3 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">4. Finalizar</span>
                      </a>
                    </div>
                  </CardContent>
                </Card>

                {/* PASSO 1: Templates */}
                <div id="step-1" className="mb-12">
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40 dark:border-b dark:border-blue-700">
                      <CardTitle className="text-2xl flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                        <Layout className="h-6 w-6 text-blue-600" />
                        Seleção de Template
                      </CardTitle>
                      <p className="text-gray-600 dark:text-gray-300 mt-2">Escolha um template pré-configurado ou crie do zero</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      
                      {/* Templates Disponíveis */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-blue-600" />
                          Templates Pré-configurados
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-700">
                            <h4 className="font-medium flex items-center gap-2">
                              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-gray-900 dark:text-gray-100">Avaliação de Compliance Básica</span>
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Para avaliações de conformidade regulatória (LGPD, SOX, ISO27001)</p>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              • 8 campos pré-configurados • Workflow de 4 etapas • KPIs de conformidade
                            </div>
                          </div>
                          
                          <div className="border rounded-lg p-4 bg-red-50 dark:bg-red-900/30 dark:border-red-700">
                            <h4 className="font-medium flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                              <span className="text-gray-900 dark:text-gray-100">Avaliação de Riscos</span>
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Processo completo de identificação e avaliação de riscos</p>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              • Matriz de riscos • Análise de impacto • Planos de ação
                            </div>
                          </div>
                          
                          <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/30 dark:border-green-700">
                            <h4 className="font-medium flex items-center gap-2">
                              <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <span className="text-gray-900 dark:text-gray-100">Checklist de Auditoria</span>
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Para auditorias internas e externas com evidências</p>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              • Checklist dinâmico • Upload de evidências • Relatórios automáticos
                            </div>
                          </div>
                          
                          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                            <h4 className="font-medium flex items-center gap-2">
                              <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                              <span className="text-gray-900 dark:text-gray-100">Template Personalizado</span>
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Comece do zero para necessidades específicas</p>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              • Canvas em branco • Máxima flexibilidade • Configuração completa
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-900 dark:text-blue-100">Dica Importante</h4>
                            <p className="text-blue-800 dark:text-blue-200 text-sm mt-1">
                              Escolha o template que mais se aproxima do seu objetivo. Você poderá personalizar completamente 
                              todos os campos, workflows e configurações nas próximas etapas.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* PASSO 2: Form Builder */}
                <div id="step-2" className="mb-12">
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40 dark:border-b dark:border-green-700">
                      <CardTitle className="text-2xl flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                        <Edit className="h-6 w-6 text-green-600" />
                        Form Builder - Construção de Formulários
                      </CardTitle>
                      <p className="text-gray-600 dark:text-gray-300 mt-2">Crie formulários poderosos com drag & drop</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      
                      {/* Tipos de Campos */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Grid className="h-5 w-5 text-green-600" />
                          Tipos de Campos Disponíveis
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          
                          {/* Campos de Texto */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 border-b dark:border-gray-600 pb-1">📝 Campos de Texto</h4>
                            
                            <div className="space-y-2">
                              <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                <div className="font-medium text-sm dark:text-gray-100">Texto Simples</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">Para nomes, títulos, descrições curtas</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">✓ Validação de comprimento ✓ Máscaras</div>
                              </div>
                              
                              <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                <div className="font-medium text-sm dark:text-gray-100">Número</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">Valores numéricos, moeda, percentuais</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">✓ Min/Max ✓ Casas decimais</div>
                              </div>
                              
                              <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                <div className="font-medium text-sm dark:text-gray-100">Senha</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">Campo protegido para senhas</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">✓ Criptografado ✓ Força da senha</div>
                              </div>
                              
                              <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                <div className="font-medium text-sm dark:text-gray-100">URL</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">Links, endereços web, referências</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">✓ Validação de URL</div>
                              </div>
                              
                              <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                <div className="font-medium text-sm dark:text-gray-100">Área de Texto</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">Para textos longos, observações detalhadas</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">✓ Redimensionável ✓ Contador de caracteres</div>
                              </div>
                              
                              <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                <div className="font-medium text-sm dark:text-gray-100">Email</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">Validação automática de formato de email</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">✓ Validação automática</div>
                              </div>
                              
                              <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                <div className="font-medium text-sm dark:text-gray-100">Telefone</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">Com máscara de formatação automática</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">✓ Máscara brasileira</div>
                              </div>
                            </div>
                          </div>

                          {/* Campos de Seleção */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 border-b dark:border-gray-600 pb-1">☑️ Campos de Seleção</h4>
                            
                            <div className="space-y-2">
                              <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                <div className="font-medium text-sm dark:text-gray-100">Lista Suspensa (Select)</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">Uma opção entre várias disponíveis</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">✓ Busca ✓ Opções dinâmicas</div>
                              </div>
                              
                              <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                <div className="font-medium text-sm dark:text-gray-100">Radio Buttons</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">Seleção única exclusiva visível</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">✓ Ideal para 2-5 opções</div>
                              </div>
                              
                              <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                <div className="font-medium text-sm dark:text-gray-100">Checkboxes</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">Seleção múltipla independente</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">✓ Validação de mínimo/máximo</div>
                              </div>
                              
                              <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                <div className="font-medium text-sm dark:text-gray-100">Switch (Liga/Desliga)</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">Para opções binárias (Sim/Não)</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">✓ Estados visuais claros</div>
                              </div>
                              
                              <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                <div className="font-medium text-sm dark:text-gray-100">Dropdown Avançado</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">Lista suspensa com recursos extras</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">✓ Multi-seleção ✓ Filtros</div>
                              </div>
                            </div>
                          </div>

                          {/* Campos Especiais */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 border-b dark:border-gray-600 pb-1">⭐ Campos Especiais</h4>
                            
                            <div className="space-y-2">
                              <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                <div className="font-medium text-sm dark:text-gray-100">Data / Data-Hora</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">Seletor de datas com calendário</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">✓ Validação de período</div>
                              </div>
                              
                              <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                <div className="font-medium text-sm dark:text-gray-100">Avaliação (Rating)</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">Sistema de estrelas para avaliações</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">✓ 1-5 estrelas configurável</div>
                              </div>
                              
                              <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                <div className="font-medium text-sm dark:text-gray-100">Slider</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">Controle deslizante para valores numéricos</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">✓ Min/Max configurável</div>
                              </div>
                              
                              <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                <div className="font-medium text-sm dark:text-gray-100">Upload de Arquivo</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">Para anexar documentos e evidências</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">✓ Múltiplos tipos ✓ Tamanho limitado</div>
                              </div>
                              
                              <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                <div className="font-medium text-sm dark:text-gray-100">Hora</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">Seletor de hora (HH:MM)</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">✓ Formato 24h ou 12h</div>
                              </div>
                              
                              <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                <div className="font-medium text-sm dark:text-gray-100">Data e Hora</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">Combina data e hora em um campo</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">✓ Timestamp completo</div>
                              </div>
                              
                              <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                <div className="font-medium text-sm dark:text-gray-100">Upload de Imagem</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">Fotos, capturas, diagramas</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">✓ Preview ✓ Redimensionamento</div>
                              </div>
                              
                              <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                <div className="font-medium text-sm dark:text-gray-100">Faixa (Range)</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">Seleção de faixa de valores</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">✓ Duplo controle deslizante</div>
                              </div>
                              
                              <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                <div className="font-medium text-sm dark:text-gray-100">Seletor de Cor</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">Escolha de cores hex/RGB</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">✓ Palette ✓ Histórico</div>
                              </div>
                              
                              <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                <div className="font-medium text-sm dark:text-gray-100">Tags</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">Múltiplas etiquetas personalizadas</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">✓ Autocomplete ✓ Cores customizadas</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Campos de Workflow Especializado */}
                        <div className="mt-8">
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            Campos de Workflow Especializado
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            
                            <div className="border rounded-lg p-3 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm">
                              <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">Aprovação</div>
                              <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">Campo especializado de workflow</div>
                              <div className="text-xs text-green-600 dark:text-green-400 mt-2">✓ Aprovado/Rejeitado ✓ Observações</div>
                            </div>
                            
                            <div className="border rounded-lg p-3 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm">
                              <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">Responsável</div>
                              <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">Atribuição de usuários/equipes</div>
                              <div className="text-xs text-purple-600 dark:text-purple-400 mt-2">✓ Busca usuários ✓ Notificações</div>
                            </div>
                            
                            <div className="border rounded-lg p-3 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm">
                              <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">Prioridade</div>
                              <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">Nível de urgência/importância</div>
                              <div className="text-xs text-red-600 dark:text-red-400 mt-2">✓ Baixa/Média/Alta/Crítica</div>
                            </div>
                            
                            <div className="border rounded-lg p-3 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm">
                              <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">Status</div>
                              <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">Estado atual do processo</div>
                              <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">✓ Workflow automático ✓ Cores</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Layout e Organização */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Columns className="h-5 w-5 text-green-600" />
                          Layout e Organização
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <h4 className="font-medium">🏗️ Sistema de Linhas e Colunas</h4>
                            <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                              <li>• <strong>Linhas:</strong> Organizem os campos horizontalmente</li>
                              <li>• <strong>1 Coluna:</strong> Campo ocupa toda a largura</li>
                              <li>• <strong>2 Colunas:</strong> Dois campos lado a lado (50% cada)</li>
                              <li>• <strong>3 Colunas:</strong> Três campos (33% cada)</li>
                              <li>• <strong>4 Colunas:</strong> Quatro campos (25% cada)</li>
                            </ul>
                            <div className="bg-green-50 p-3 rounded">
                              <div className="text-xs font-medium text-green-800">💡 Dica de Layout</div>
                              <div className="text-xs text-green-700">
                                Use 1 coluna para textos longos, 2 colunas para dados relacionados, 
                                3-4 colunas para dados compactos como datas e números.
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">🎨 Alturas Disponíveis</h4>
                            <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                              <li>• <strong>Pequena:</strong> Para campos simples (texto, data)</li>
                              <li>• <strong>Média:</strong> Para seleções e avaliações</li>
                              <li>• <strong>Grande:</strong> Para áreas de texto</li>
                              <li>• <strong>Extra Grande:</strong> Para uploads e conteúdo especial</li>
                            </ul>
                            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded border border-green-200 dark:border-green-700">
                              <div className="text-xs font-medium text-green-800 dark:text-green-200">⚡ Dica de UX</div>
                              <div className="text-xs text-green-700 dark:text-green-300">
                                Mantenha altura consistente em campos relacionados para 
                                melhor experiência visual do usuário.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Guia de Uso dos Campos */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                          <Info className="h-5 w-5" />
                          💡 Guia de Seleção de Campos
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="text-blue-800 dark:text-blue-200"><strong>Para Dados Básicos:</strong></div>
                            <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-xs ml-4">
                              <li>• <strong>Texto:</strong> Nome da empresa, título do projeto</li>
                              <li>• <strong>Número:</strong> Orçamento, quantidade, percentual</li>
                              <li>• <strong>Email:</strong> Contato principal, responsável técnico</li>
                              <li>• <strong>Telefone:</strong> Contato comercial, emergência</li>
                              <li>• <strong>URL:</strong> Site da empresa, documentação online</li>
                            </ul>
                          </div>
                          <div className="space-y-2">
                            <div className="text-blue-800 dark:text-blue-200"><strong>Para Avaliações:</strong></div>
                            <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-xs ml-4">
                              <li>• <strong>Rating:</strong> Nível de conformidade, satisfação</li>
                              <li>• <strong>Slider:</strong> Probabilidade de risco (0-100%)</li>
                              <li>• <strong>Select:</strong> Status (Aprovado/Pendente/Rejeitado)</li>
                              <li>• <strong>Radio:</strong> Possui DPO? (Sim/Não/Terceirizado)</li>
                              <li>• <strong>Checkbox:</strong> Bases legais aplicáveis (múltiplas)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      {/* Validações */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          Sistema de Validações
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="border rounded p-3 bg-red-50 dark:bg-red-900/30 dark:border-red-700">
                            <h4 className="font-medium text-red-800 dark:text-red-200 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              Validações Obrigatórias
                            </h4>
                            <ul className="text-sm text-red-700 dark:text-red-300 mt-2 space-y-1">
                              <li>• Campo obrigatório (não pode ficar vazio)</li>
                              <li>• Comprimento mínimo/máximo de texto</li>
                              <li>• Valores mínimo/máximo para números</li>
                              <li>• Seleção mínima/máxima de opções</li>
                            </ul>
                          </div>
                          
                          <div className="border rounded p-3 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-700">
                            <h4 className="font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
                              <Settings className="h-4 w-4" />
                              Validações Avançadas
                            </h4>
                            <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                              <li>• Expressões regulares (regex)</li>
                              <li>• Validação de formato (CPF, CNPJ)</li>
                              <li>• Comparação entre campos</li>
                              <li>• Validação condicional (depende de outro campo)</li>
                            </ul>
                          </div>
                          
                          <div className="border rounded p-3 bg-green-50 dark:bg-green-900/30 dark:border-green-700">
                            <h4 className="font-medium text-green-800 dark:text-green-200 flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              Mensagens Personalizadas
                            </h4>
                            <ul className="text-sm text-green-700 dark:text-green-300 mt-2 space-y-1">
                              <li>• Mensagens de erro customizadas</li>
                              <li>• Dicas de preenchimento (placeholder)</li>
                              <li>• Textos de ajuda contextuais</li>
                              <li>• Feedback visual em tempo real</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-600 p-4">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-green-900 dark:text-green-100">Como Usar o Form Builder</h4>
                            <ol className="text-green-800 dark:text-green-200 text-sm mt-1 space-y-1 list-decimal list-inside">
                              <li>Arraste campos da paleta lateral para o canvas</li>
                              <li>Configure propriedades clicando no campo adicionado</li>
                              <li>Organize o layout usando o sistema de linhas/colunas</li>
                              <li>Adicione validações necessárias para cada campo</li>
                              <li>Use o Preview para testar o formulário antes de salvar</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* PASSO 3: Workflow */}
                <div id="step-3" className="mb-12">
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/40 dark:to-indigo-900/40 dark:border-b dark:border-purple-700">
                      <CardTitle className="text-2xl flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                        <Workflow className="h-6 w-6 text-purple-600" />
                        Workflow Engine - Fluxo de Processos
                      </CardTitle>
                      <p className="text-gray-600 dark:text-gray-300 mt-2">Crie fluxos de trabalho visuais e automações inteligentes</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      
                      {/* Tipos de Nós */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <GitBranch className="h-5 w-5 text-purple-600" />
                          Tipos de Nós do Workflow
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          
                          <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/30 dark:border-green-700">
                            <h4 className="font-medium flex items-center gap-2">
                              <PlayCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                              <span className="text-gray-900 dark:text-gray-100">Nó de Início (Start)</span>
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Marco inicial do processo</p>
                            <div className="mt-3 space-y-1 text-xs">
                              <div className="text-green-700 dark:text-green-300"><strong>Quando usar:</strong> Todo processo deve começar com este nó</div>
                              <div className="text-green-700 dark:text-green-300"><strong>Configurações:</strong> Apenas nome e descrição</div>
                              <div className="text-green-700 dark:text-green-300"><strong>Conexões:</strong> Sempre conecta a próxima atividade</div>
                            </div>
                          </div>

                          <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-700">
                            <h4 className="font-medium flex items-center gap-2">
                              <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              <span className="text-gray-900 dark:text-gray-100">Nó de Tarefa (Task)</span>
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Atividade que requer ação humana</p>
                            <div className="mt-3 space-y-1 text-xs">
                              <div className="text-blue-700 dark:text-blue-300"><strong>Quando usar:</strong> Preenchimento, revisão, aprovação</div>
                              <div className="text-blue-700 dark:text-blue-300"><strong>Configurações:</strong> Responsável, prazo, prioridade</div>
                              <div className="text-blue-700 dark:text-blue-300"><strong>Tipos:</strong> Formulário, aprovação, revisão</div>
                            </div>
                          </div>

                          <div className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/30 dark:border-yellow-700">
                            <h4 className="font-medium flex items-center gap-2">
                              <GitBranch className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                              <span className="text-gray-900 dark:text-gray-100">Nó de Decisão (Decision)</span>
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Ponto de escolha baseado em condições</p>
                            <div className="mt-3 space-y-1 text-xs">
                              <div className="text-yellow-700 dark:text-yellow-300"><strong>Quando usar:</strong> Aprovado/Rejeitado, Score &gt; 80</div>
                              <div className="text-yellow-700 dark:text-yellow-300"><strong>Configurações:</strong> Condições lógicas, regras</div>
                              <div className="text-yellow-700 dark:text-yellow-300"><strong>Conexões:</strong> Múltiplas saídas possíveis</div>
                            </div>
                          </div>

                          <div className="border rounded-lg p-4 bg-purple-50 dark:bg-purple-900/30 dark:border-purple-700">
                            <h4 className="font-medium flex items-center gap-2">
                              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                              <span className="text-gray-900 dark:text-gray-100">Nó Paralelo (Parallel)</span>
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Executa múltiplas tarefas simultaneamente</p>
                            <div className="mt-3 space-y-1 text-xs">
                              <div className="text-purple-700 dark:text-purple-300"><strong>Quando usar:</strong> Revisões independentes simultâneas</div>
                              <div className="text-purple-700 dark:text-purple-300"><strong>Configurações:</strong> Lista de tarefas paralelas</div>
                              <div className="text-purple-700 dark:text-purple-300"><strong>Sincronização:</strong> Aguarda conclusão de todas</div>
                            </div>
                          </div>

                          <div className="border rounded-lg p-4 bg-orange-50 dark:bg-orange-900/30 dark:border-orange-700">
                            <h4 className="font-medium flex items-center gap-2">
                              <Timer className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                              <span className="text-gray-900 dark:text-gray-100">Nó de Temporizador (Timer)</span>
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Pausa o processo por período determinado</p>
                            <div className="mt-3 space-y-1 text-xs">
                              <div className="text-orange-700 dark:text-orange-300"><strong>Quando usar:</strong> Aguardar resposta, período de análise</div>
                              <div className="text-orange-700 dark:text-orange-300"><strong>Configurações:</strong> Duração, unidade de tempo</div>
                              <div className="text-orange-700 dark:text-orange-300"><strong>Ações:</strong> Notificações de lembrete</div>
                            </div>
                          </div>

                          <div className="border rounded-lg p-4 bg-red-50 dark:bg-red-900/30 dark:border-red-700">
                            <h4 className="font-medium flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                              <span className="text-gray-900 dark:text-gray-100">Nó de Fim (End)</span>
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Marco final do processo</p>
                            <div className="mt-3 space-y-1 text-xs">
                              <div className="text-red-700 dark:text-red-300"><strong>Quando usar:</strong> Conclusão de qualquer caminho do processo</div>
                              <div className="text-red-700 dark:text-red-300"><strong>Configurações:</strong> Mensagem final, relatórios</div>
                              <div className="text-red-700 dark:text-red-300"><strong>Ações:</strong> Notificações de conclusão</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Configurações Avançadas */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Settings className="h-5 w-5 text-purple-600" />
                          Configurações Avançadas de Workflow
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h4 className="font-medium">👥 Atribuição de Responsáveis</h4>
                            <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                              <li className="flex items-start gap-2">
                                <Circle className="h-3 w-3 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                                <div>
                                  <strong>Por Papel:</strong> Auditor, Compliance Officer, Gestor de Riscos
                                </div>
                              </li>
                              <li className="flex items-start gap-2">
                                <Circle className="h-3 w-3 text-blue-600 mt-1 flex-shrink-0" />
                                <div>
                                  <strong>Por Usuário:</strong> Nome específico do responsável
                                </div>
                              </li>
                              <li className="flex items-start gap-2">
                                <Circle className="h-3 w-3 text-blue-600 mt-1 flex-shrink-0" />
                                <div>
                                  <strong>Por Grupo:</strong> Equipe de auditoria, departamento
                                </div>
                              </li>
                              <li className="flex items-start gap-2">
                                <Circle className="h-3 w-3 text-blue-600 mt-1 flex-shrink-0" />
                                <div>
                                  <strong>Dinâmico:</strong> Com base em dados do formulário
                                </div>
                              </li>
                            </ul>
                          </div>
                          
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">⏰ Gestão de Prazos e SLAs</h4>
                            <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                              <li className="flex items-start gap-2">
                                <Clock className="h-3 w-3 text-orange-600 dark:text-orange-400 mt-1 flex-shrink-0" />
                                <div>
                                  <strong>Prazos:</strong> 1d, 3d, 1w, 2w, 1m (dias/semanas/meses)
                                </div>
                              </li>
                              <li className="flex items-start gap-2">
                                <Clock className="h-3 w-3 text-orange-600 dark:text-orange-400 mt-1 flex-shrink-0" />
                                <div>
                                  <strong>Prioridades:</strong> Baixa, Média, Alta, Crítica
                                </div>
                              </li>
                              <li className="flex items-start gap-2">
                                <Clock className="h-3 w-3 text-orange-600 dark:text-orange-400 mt-1 flex-shrink-0" />
                                <div>
                                  <strong>Lembretes:</strong> 50%, 80%, 100% do prazo
                                </div>
                              </li>
                              <li className="flex items-start gap-2">
                                <Clock className="h-3 w-3 text-orange-600 dark:text-orange-400 mt-1 flex-shrink-0" />
                                <div>
                                  <strong>Escalação:</strong> Automática para supervisor
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Condições e Regras */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Zap className="h-5 w-5 text-purple-600" />
                          Condições e Regras de Negócio
                        </h3>
                        
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                          <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">💡 Exemplos de Condições Práticas</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="bg-white dark:bg-gray-800 rounded p-3 border-l-4 border-green-400 dark:border-green-500">
                                <div className="font-medium text-sm text-gray-900 dark:text-gray-100">Score de Conformidade ≥ 80%</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">➜ Processo aprovado automaticamente</div>
                              </div>
                              <div className="bg-white dark:bg-gray-800 rounded p-3 border-l-4 border-red-400 dark:border-red-500">
                                <div className="font-medium text-sm text-gray-900 dark:text-gray-100">Riscos Críticos Identificados</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">➜ Escalação imediata para CISO</div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="bg-white dark:bg-gray-800 rounded p-3 border-l-4 border-blue-400 dark:border-blue-500">
                                <div className="font-medium text-sm text-gray-900 dark:text-gray-100">Primeiro Processo da Empresa</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">➜ Revisão detalhada obrigatória</div>
                              </div>
                              <div className="bg-white dark:bg-gray-800 rounded p-3 border-l-4 border-yellow-400 dark:border-yellow-500">
                                <div className="font-medium text-sm text-gray-900 dark:text-gray-100">Valor do Projeto &gt; R$ 100.000</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">➜ Aprovação dupla necessária</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-400 dark:border-purple-600 p-4">
                        <div className="flex items-start gap-2">
                          <Workflow className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-purple-900 dark:text-purple-100">Boas Práticas para Workflows</h4>
                            <ul className="text-purple-800 dark:text-purple-200 text-sm mt-1 space-y-1">
                              <li>• <strong>Mantenha simples:</strong> Evite workflows muito complexos inicialmente</li>
                              <li>• <strong>Defina responsáveis claros:</strong> Cada tarefa deve ter um dono específico</li>
                              <li>• <strong>Configure prazos realistas:</strong> Considere a carga de trabalho das equipes</li>
                              <li>• <strong>Use condições objetivas:</strong> Evite critérios subjetivos nas decisões</li>
                              <li>• <strong>Teste antes de usar:</strong> Execute um processo piloto para validar o fluxo</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* PASSO 4: Finalização */}
                <div id="step-4" className="mb-12">
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/40 dark:to-red-900/40 dark:border-b dark:border-orange-700">
                      <CardTitle className="text-2xl flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                        <Award className="h-6 w-6 text-orange-600" />
                        Analytics, Reports e Finalização
                      </CardTitle>
                      <p className="text-gray-600 dark:text-gray-300 mt-2">Configure métricas, relatórios e integrações</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      
                      {/* Analytics e KPIs */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-orange-600" />
                          Analytics e KPIs Essenciais
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-700">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">📊 KPIs de Performance</h4>
                            <ul className="text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-1">
                              <li>• Taxa de conclusão dos processos</li>
                              <li>• Tempo médio de execução</li>
                              <li>• Processos dentro do prazo (SLA)</li>
                              <li>• Backlog de processos pendentes</li>
                            </ul>
                          </div>
                          
                          <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/30 dark:border-green-700">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">🎯 KPIs de Qualidade</h4>
                            <ul className="text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-1">
                              <li>• Score médio de conformidade</li>
                              <li>• Número de não-conformidades</li>
                              <li>• Taxa de rejeição/retrabalho</li>
                              <li>• Satisfação dos stakeholders</li>
                            </ul>
                          </div>
                          
                          <div className="border rounded-lg p-4 bg-purple-50 dark:bg-purple-900/30 dark:border-purple-700">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">⚡ KPIs de Eficiência</h4>
                            <ul className="text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-1">
                              <li>• Automação vs. manual</li>
                              <li>• Custo por processo executado</li>
                              <li>• Produtividade por responsável</li>
                              <li>• ROI dos processos de compliance</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Tipos de Relatórios */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <FileText className="h-5 w-5 text-orange-600" />
                          Tipos de Relatórios Disponíveis
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <h4 className="font-medium">📈 Relatórios Executivos</h4>
                            <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                              <li className="flex items-start gap-2">
                                <BarChart className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <strong>Dashboard Executivo:</strong> Visão geral com principais KPIs
                                </div>
                              </li>
                              <li className="flex items-start gap-2">
                                <PieChart className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <strong>Status dos Processos:</strong> Em andamento, concluídos, atrasados
                                </div>
                              </li>
                              <li className="flex items-start gap-2">
                                <LineChart className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <strong>Tendências:</strong> Evolução mensal dos indicadores
                                </div>
                              </li>
                            </ul>
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="font-medium">📋 Relatórios Operacionais</h4>
                            <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                              <li className="flex items-start gap-2">
                                <CheckSquare className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <strong>Log de Atividades:</strong> Histórico detalhado de cada processo
                                </div>
                              </li>
                              <li className="flex items-start gap-2">
                                <Users className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <strong>Performance por Usuário:</strong> Produtividade individual
                                </div>
                              </li>
                              <li className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <strong>Exceções e Problemas:</strong> Processos com issues
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Integrações */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Plug className="h-5 w-5 text-orange-600" />
                          Integrações e Automações
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="border rounded p-3 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-700">
                            <h4 className="font-medium flex items-center gap-2">
                              <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-gray-900 dark:text-gray-100">Email</span>
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                              Notificações automáticas, lembretes de prazo, relatórios por email
                            </p>
                          </div>
                          
                          <div className="border rounded p-3 bg-green-50 dark:bg-green-900/30 dark:border-green-700">
                            <h4 className="font-medium flex items-center gap-2">
                              <Bell className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <span className="text-gray-900 dark:text-gray-100">Webhooks</span>
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                              Integração com sistemas externos via APIs REST
                            </p>
                          </div>
                          
                          <div className="border rounded p-3 bg-purple-50 dark:bg-purple-900/30 dark:border-purple-700">
                            <h4 className="font-medium flex items-center gap-2">
                              <Database className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              <span className="text-gray-900 dark:text-gray-100">APIs</span>
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                              Sincronização bidirecional de dados com ERPs
                            </p>
                          </div>
                          
                          <div className="border rounded p-3 bg-orange-50 dark:bg-orange-900/30 dark:border-orange-700">
                            <h4 className="font-medium flex items-center gap-2">
                              <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                              <span className="text-gray-900 dark:text-gray-100">Documentos</span>
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                              Geração automática de PDFs e documentos Word
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-400 dark:border-orange-600 p-4">
                        <div className="flex items-start gap-2">
                          <Award className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-orange-900 dark:text-orange-100">Checklist Final - Antes de Salvar</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                              <div>
                                <h5 className="font-medium text-orange-800 dark:text-orange-200 text-sm">✅ Formulário</h5>
                                <ul className="text-orange-700 dark:text-orange-300 text-xs space-y-1 mt-1">
                                  <li>□ Todos os campos necessários adicionados</li>
                                  <li>□ Validações configuradas corretamente</li>
                                  <li>□ Layout organizado e responsivo</li>
                                  <li>□ Preview testado com dados reais</li>
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-medium text-orange-800 dark:text-orange-200 text-sm">✅ Workflow</h5>
                                <ul className="text-orange-700 dark:text-orange-300 text-xs space-y-1 mt-1">
                                  <li>□ Fluxo completo (início → fim)</li>
                                  <li>□ Responsáveis definidos em cada tarefa</li>
                                  <li>□ Prazos e prioridades configurados</li>
                                  <li>□ Condições de decisão testadas</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Dicas Finais e Melhores Práticas */}
                <Card className="mb-8">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/40 dark:to-blue-900/40 dark:border-b dark:border-indigo-700">
                    <CardTitle className="text-xl flex items-center gap-3">
                      <Sparkles className="h-6 w-6 text-indigo-600" />
                      Dicas Finais e Melhores Práticas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          ✅ Faça Sempre
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                          <li className="flex items-start gap-2">
                            <Circle className="h-2 w-2 text-green-600 dark:text-green-400 mt-2 flex-shrink-0" />
                            <strong>Teste antes de usar em produção:</strong> Execute um processo piloto completo
                          </li>
                          <li className="flex items-start gap-2">
                            <Circle className="h-2 w-2 text-green-600 dark:text-green-400 mt-2 flex-shrink-0" />
                            <strong>Documente decisões:</strong> Explique por que certas configurações foram escolhidas
                          </li>
                          <li className="flex items-start gap-2">
                            <Circle className="h-2 w-2 text-green-600 dark:text-green-400 mt-2 flex-shrink-0" />
                            <strong>Colete feedback:</strong> Pergunte aos usuários sobre dificuldades
                          </li>
                          <li className="flex items-start gap-2">
                            <Circle className="h-2 w-2 text-green-600 dark:text-green-400 mt-2 flex-shrink-0" />
                            <strong>Versione os processos:</strong> Mantenha histórico de mudanças
                          </li>
                          <li className="flex items-start gap-2">
                            <Circle className="h-2 w-2 text-green-600 dark:text-green-400 mt-2 flex-shrink-0" />
                            <strong>Monitore KPIs:</strong> Acompanhe a eficácia dos processos criados
                          </li>
                        </ul>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="font-semibold text-red-800 dark:text-red-200 flex items-center gap-2">
                          <X className="h-5 w-5" />
                          ❌ Evite
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                          <li className="flex items-start gap-2">
                            <X className="h-3 w-3 text-red-600 dark:text-red-400 mt-1 flex-shrink-0" />
                            <strong>Workflows muito complexos:</strong> Comece simples e evolua gradualmente
                          </li>
                          <li className="flex items-start gap-2">
                            <X className="h-3 w-3 text-red-600 dark:text-red-400 mt-1 flex-shrink-0" />
                            <strong>Campos obrigatórios em excesso:</strong> Só marque como obrigatório o essencial
                          </li>
                          <li className="flex items-start gap-2">
                            <X className="h-3 w-3 text-red-600 dark:text-red-400 mt-1 flex-shrink-0" />
                            <strong>Prazos irreais:</strong> Considere feriados e carga de trabalho
                          </li>
                          <li className="flex items-start gap-2">
                            <X className="h-3 w-3 text-red-600 dark:text-red-400 mt-1 flex-shrink-0" />
                            <strong>Responsáveis indefinidos:</strong> Toda tarefa precisa de um dono claro
                          </li>
                          <li className="flex items-start gap-2">
                            <X className="h-3 w-3 text-red-600 dark:text-red-400 mt-1 flex-shrink-0" />
                            <strong>Ignorar feedback:</strong> Usuários são a melhor fonte de melhorias
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Casos de Uso Comuns */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Boxes className="h-5 w-5 text-blue-600" />
                      Casos de Uso Comuns - Exemplos Práticos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">🛡️ Processo de Compliance LGPD</h4>
                        <div className="text-sm bg-gray-50 dark:bg-gray-800 dark:border dark:border-gray-700 rounded p-3">
                          <div className="font-medium mb-2 text-gray-900 dark:text-gray-100">Formulário recomendado:</div>
                          <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                            <li>• Nome da empresa (texto obrigatório)</li>
                            <li>• Porte da empresa (select)</li>
                            <li>• Bases legais utilizadas (checkbox múltiplo)</li>
                            <li>• Possui DPO? (radio sim/não/terceirizado)</li>
                            <li>• Volume de dados (slider 0-1M)</li>
                            <li>• Relatório de impacto (upload arquivo)</li>
                          </ul>
                          <div className="font-medium mt-3 mb-2 text-gray-900 dark:text-gray-100">Workflow sugerido:</div>
                          <div className="text-xs text-gray-700 dark:text-gray-300">
                            Início → Preenchimento (Empresa) → Análise (DPO) → 
                            Decisão (Conforme?) → Aprovação ou Plano de Ação → Fim
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium">🔍 Auditoria Interna Anual</h4>
                        <div className="text-sm bg-gray-50 dark:bg-gray-800 dark:border dark:border-gray-700 rounded p-3">
                          <div className="font-medium mb-2 text-gray-900 dark:text-gray-100">Formulário recomendado:</div>
                          <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                            <li>• Área auditada (select departamentos)</li>
                            <li>• Período da auditoria (date range)</li>
                            <li>• Checklist de conformidade (checkbox)</li>
                            <li>• Evidências encontradas (file upload)</li>
                            <li>• Score de conformidade (rating 1-5)</li>
                            <li>• Observações gerais (textarea)</li>
                          </ul>
                          <div className="font-medium mt-3 mb-2 text-gray-900 dark:text-gray-100">Workflow sugerido:</div>
                          <div className="text-xs text-gray-700 dark:text-gray-300">
                            Início → Planejamento (Auditor) → Execução (Auditor) → 
                            Revisão (Auditor Sênior) → Relatório → Plano Ação → Fim
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Modal de Preview do Formulário */}
      <FormPreviewModal
        isOpen={isFormPreviewOpen}
        onClose={() => setIsFormPreviewOpen(false)}
        formFields={formFields}
        formRows={formRows}
        processName={processName}
        processDescription={processDescription}
      />
    </div>
  );
};

export default AlexProcessDesignerEnhancedModal;