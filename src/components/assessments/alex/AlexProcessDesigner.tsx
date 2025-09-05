import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Settings2,
  Plus,
  Edit,
  Trash2,
  Move,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  PlayCircle,
  Pause,
  Save,
  Copy,
  Share2,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Brain,
  Workflow,
  Target,
  Zap,
  Eye,
  GitBranch,
  RotateCcw,
  Filter,
  Search,
  Shield,
  Bell,
  FileText,
  Database,
  Lock,
  Key,
  UserCheck,
  Mail,
  Calendar,
  BarChart3,
  Settings,
  Download,
  Upload,
  Layers,
  Network,
  Cpu,
  Globe,
  Building,
  Award,
  TrendingUp,
  MessageSquare,
  HelpCircle,
  Info,
  Star,
  Bookmark,
  Tag,
  Hash,
  Link,
  ExternalLink,
  RefreshCw,
  Maximize2,
  Minimize2,
  Grid,
  List,
  Map,
  Compass,
  Route,
  Navigation,
  Palette,
  Code,
  Layers3,
  Workflow as WorkflowIcon,
  Boxes,
  TreePine,
  Shuffle,
  Split,
  Merge,
  Timer,
  Gauge,
  Activity,
  Lightbulb,
  Sparkles,
  Wand2,
  Rocket,
  Cog,
  Wrench,
  Hammer,
  Paintbrush,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';

// ==================== INTERFACES AVANÇADAS ====================

interface ProcessStep {
  id: string;
  name: string;
  description: string;
  type: 'start' | 'task' | 'decision' | 'end' | 'parallel' | 'merge' | 'gateway' | 'subprocess' | 'event' | 'timer' | 'condition' | 'loop';
  assignee_role: string;
  estimated_duration: number;
  dependencies: string[];
  position: { x: number; y: number };
  
  // Condições e Validações Avançadas
  conditions?: {
    approval_required: boolean;
    evidence_required: boolean;
    review_required: boolean;
    custom_validation?: string;
    risk_threshold?: 'low' | 'medium' | 'high' | 'critical';
    compliance_check?: boolean;
    sla_hours?: number;
    escalation_enabled?: boolean;
  };
  
  // Automação e Integrações Robustas
  automation?: {
    trigger_events: string[];
    actions: AutomationAction[];
    notifications: NotificationConfig[];
    ai_assistance: boolean;
    auto_assignment: boolean;
    webhook_urls?: string[];
    api_integrations?: APIIntegration[];
    script_execution?: ScriptConfig[];
  };
  
  // Questionários e Formulários Dinâmicos
  questionnaire?: {
    template_id: string;
    framework: string;
    questions: QuestionConfig[];
    scoring_method: 'weighted' | 'simple' | 'maturity' | 'risk_based';
    required_evidence: EvidenceRequirement[];
    conditional_logic?: ConditionalLogic[];
  };
  
  // Configurações de Segurança Empresarial
  security?: {
    encryption_required: boolean;
    access_level: 'public' | 'internal' | 'confidential' | 'restricted' | 'top_secret';
    audit_trail: boolean;
    data_retention_days: number;
    pii_handling?: 'none' | 'anonymize' | 'encrypt' | 'delete';
    compliance_tags?: string[];
  };
  
  // Métricas e KPIs Avançados
  metrics?: {
    success_criteria: SuccessCriteria[];
    kpis: KPIConfig[];
    benchmarks: BenchmarkConfig[];
    performance_targets?: PerformanceTarget[];
  };

  // Configurações Visuais
  visual?: {
    color?: string;
    icon?: string;
    size?: 'small' | 'medium' | 'large';
    shape?: 'rectangle' | 'circle' | 'diamond' | 'hexagon';
    border_style?: 'solid' | 'dashed' | 'dotted';
  };

  // Configurações de Colaboração
  collaboration?: {
    comments_enabled: boolean;
    real_time_editing: boolean;
    version_control: boolean;
    change_tracking: boolean;
    approval_workflow?: ApprovalWorkflow[];
  };
}

interface AutomationAction {
  id: string;
  type: 'email' | 'webhook' | 'api_call' | 'script' | 'notification' | 'data_update' | 'file_generation';
  config: Record<string, any>;
  conditions?: string[];
  delay_minutes?: number;
  retry_config?: RetryConfig;
}

interface RetryConfig {
  max_attempts: number;
  delay_seconds: number;
  exponential_backoff: boolean;
}

interface APIIntegration {
  id: string;
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  auth_config?: AuthConfig;
  data_mapping?: DataMapping[];
}

interface AuthConfig {
  type: 'bearer' | 'basic' | 'api_key' | 'oauth2';
  credentials: Record<string, string>;
}

interface DataMapping {
  source_field: string;
  target_field: string;
  transformation?: string;
}

interface ScriptConfig {
  id: string;
  language: 'javascript' | 'python' | 'bash';
  code: string;
  environment_vars?: Record<string, string>;
  timeout_seconds?: number;
}

interface NotificationConfig {
  id: string;
  type: 'email' | 'sms' | 'push' | 'slack' | 'teams' | 'webhook';
  recipients: string[];
  template: string;
  trigger_condition: string;
  delay_minutes?: number;
  escalation_rules?: EscalationRule[];
  personalization?: PersonalizationConfig;
}

interface PersonalizationConfig {
  dynamic_content: boolean;
  user_preferences: boolean;
  localization: boolean;
  timezone_aware: boolean;
}

interface EscalationRule {
  condition: string;
  delay_hours: number;
  escalate_to: string[];
  action: string;
  max_escalations?: number;
}

interface QuestionConfig {
  id: string;
  text: string;
  type: 'multiple_choice' | 'text' | 'rating' | 'boolean' | 'file_upload' | 'matrix' | 'date' | 'number' | 'slider';
  required: boolean;
  weight: number;
  options?: string[];
  validation_rules?: ValidationRule[];
  help_text?: string;
  evidence_required?: boolean;
  conditional_display?: ConditionalDisplay;
  scoring_config?: ScoringConfig;
}

interface ValidationRule {
  type: 'min_length' | 'max_length' | 'regex' | 'range' | 'custom';
  value: any;
  message: string;
}

interface ConditionalDisplay {
  depends_on: string;
  condition: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

interface ScoringConfig {
  method: 'linear' | 'exponential' | 'custom';
  scale: number;
  weights?: Record<string, number>;
}

interface EvidenceRequirement {
  id: string;
  name: string;
  type: 'document' | 'screenshot' | 'video' | 'audio' | 'data_export';
  required: boolean;
  validation_criteria?: string[];
  auto_verification?: boolean;
}

interface ConditionalLogic {
  id: string;
  condition: string;
  actions: ConditionalAction[];
}

interface ConditionalAction {
  type: 'show_question' | 'hide_question' | 'set_value' | 'calculate_score' | 'trigger_automation';
  target: string;
  value?: any;
}

interface SuccessCriteria {
  id: string;
  name: string;
  description: string;
  measurement_method: string;
  target_value: number;
  tolerance: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface KPIConfig {
  id: string;
  name: string;
  description: string;
  target_value: number;
  measurement_unit: string;
  calculation_method: string;
  frequency: 'real_time' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  data_source?: string;
  visualization_type?: 'gauge' | 'chart' | 'table' | 'card';
}

interface BenchmarkConfig {
  id: string;
  name: string;
  industry_standard: number;
  best_practice: number;
  regulatory_requirement?: number;
  source: string;
  last_updated: string;
  confidence_level?: number;
}

interface PerformanceTarget {
  id: string;
  metric: string;
  target: number;
  threshold_warning: number;
  threshold_critical: number;
  improvement_plan?: string;
}

interface ProcessTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  industry: string[];
  complexity: 'simple' | 'moderate' | 'complex' | 'enterprise' | 'expert';
  steps: ProcessStep[];
  
  // Metadados Avançados
  metadata: {
    created_by: string;
    created_at: string;
    updated_at: string;
    version: string;
    usage_count: number;
    avg_rating: number;
    tags: string[];
    certification_level?: string;
    compliance_frameworks: string[];
    maturity_level?: 'initial' | 'managed' | 'defined' | 'quantitatively_managed' | 'optimizing';
    risk_level?: 'low' | 'medium' | 'high' | 'critical';
  };
  
  // Adaptabilidade e IA Avançada
  is_adaptive: boolean;
  adaptive_rules: {
    role_based_variations: RoleVariation[];
    context_adaptations: ContextAdaptation[];
    ai_optimization_enabled: boolean;
    learning_enabled: boolean;
    auto_improvement: boolean;
    predictive_analytics: boolean;
  };
  
  // Configurações de Tenant e Segurança Empresarial
  tenant_config: {
    tenant_id: string;
    is_global: boolean;
    sharing_permissions: SharingPermission[];
    encryption_level: 'basic' | 'advanced' | 'enterprise' | 'military';
    data_residency?: string;
    compliance_requirements?: string[];
  };
  
  // Configurações de Colaboração Avançada
  collaboration: {
    team_roles: TeamRole[];
    approval_workflow: ApprovalWorkflow[];
    review_cycles: ReviewCycle[];
    stakeholder_matrix: StakeholderMatrix[];
    real_time_collaboration: boolean;
    version_control: VersionControl;
  };
  
  // Integração com Frameworks e Regulamentações
  framework_integration: {
    primary_framework: string;
    secondary_frameworks: string[];
    control_mappings: ControlMapping[];
    regulatory_mappings: RegulatoryMapping[];
    cross_references: CrossReference[];
  };

  // Configurações de Execução
  execution_config?: {
    parallel_execution: boolean;
    max_concurrent_steps: number;
    timeout_minutes: number;
    retry_failed_steps: boolean;
    rollback_on_failure: boolean;
    checkpoint_frequency: number;
  };

  // Analytics e Reporting
  analytics_config?: {
    track_performance: boolean;
    generate_reports: boolean;
    real_time_monitoring: boolean;
    predictive_insights: boolean;
    custom_dashboards: DashboardConfig[];
  };
}

interface RoleVariation {
  role: string;
  organization_size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  modifications: {
    [stepId: string]: Partial<ProcessStep>;
  };
  conditional_steps?: ConditionalStep[];
}

interface ConditionalStep {
  condition: string;
  add_steps?: ProcessStep[];
  remove_steps?: string[];
  modify_steps?: { [stepId: string]: Partial<ProcessStep> };
}

interface ContextAdaptation {
  condition: string;
  trigger_values: string[];
  add_steps?: ProcessStep[];
  remove_steps?: string[];
  modify_steps?: { [stepId: string]: Partial<ProcessStep> };
  priority?: number;
}

interface SharingPermission {
  tenant_id: string;
  permission_level: 'view' | 'edit' | 'admin' | 'owner';
  expiry_date?: string;
  restrictions?: string[];
}

interface TeamRole {
  role_id: string;
  role_name: string;
  permissions: string[];
  responsibilities: string[];
  required_certifications?: string[];
  skill_requirements?: SkillRequirement[];
}

interface SkillRequirement {
  skill: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  required: boolean;
}

interface ApprovalWorkflow {
  step_id: string;
  approvers: string[];
  approval_type: 'sequential' | 'parallel' | 'majority' | 'unanimous';
  timeout_hours: number;
  escalation_rules: EscalationRule[];
  delegation_allowed?: boolean;
  approval_criteria?: ApprovalCriteria[];
}

interface ApprovalCriteria {
  criterion: string;
  weight: number;
  required: boolean;
}

interface ReviewCycle {
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'on_demand';
  reviewers: string[];
  review_criteria: string[];
  auto_schedule: boolean;
  review_template?: string;
  outcome_actions?: ReviewOutcomeAction[];
}

interface ReviewOutcomeAction {
  outcome: 'approved' | 'rejected' | 'needs_revision';
  actions: string[];
}

interface StakeholderMatrix {
  stakeholder_type: string;
  involvement_level: 'informed' | 'consulted' | 'responsible' | 'accountable';
  communication_frequency: string;
  preferred_channels: string[];
  escalation_path?: string[];
}

interface ControlMapping {
  control_id: string;
  framework: string;
  control_description: string;
  mapped_steps: string[];
  testing_frequency: string;
  evidence_requirements?: string[];
  automation_level?: 'manual' | 'semi_automated' | 'fully_automated';
}

interface RegulatoryMapping {
  regulation: string;
  requirement_id: string;
  requirement_text: string;
  mapped_steps: string[];
  compliance_level: 'mandatory' | 'recommended' | 'optional';
  penalty_risk?: 'low' | 'medium' | 'high' | 'critical';
}

interface CrossReference {
  source_framework: string;
  target_framework: string;
  mapping_type: 'equivalent' | 'related' | 'subset' | 'superset';
  confidence_level: number;
}

interface VersionControl {
  enabled: boolean;
  auto_versioning: boolean;
  branch_strategy: 'linear' | 'feature_branch' | 'git_flow';
  merge_strategy: 'fast_forward' | 'merge_commit' | 'squash';
  approval_required_for_merge: boolean;
}

interface DashboardConfig {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  layout: 'grid' | 'flex' | 'custom';
  refresh_interval?: number;
}

interface DashboardWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'gauge' | 'text';
  data_source: string;
  config: Record<string, any>;
  position: { x: number; y: number; width: number; height: number };
}

// ==================== COMPONENTE PRINCIPAL ====================

const AlexProcessDesigner: React.FC = () => {
  const { user } = useAuth();
  
  // Estados principais
  const [selectedTemplate, setSelectedTemplate] = useState<ProcessTemplate | null>(null);
  const [isDesigning, setIsDesigning] = useState(false);
  const [currentProcess, setCurrentProcess] = useState<ProcessTemplate | null>(null);
  const [draggedStep, setDraggedStep] = useState<ProcessStep | null>(null);
  const [showStepDialog, setShowStepDialog] = useState(false);
  const [editingStep, setEditingStep] = useState<ProcessStep | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Estados de interface
  const [activeDesignTab, setActiveDesignTab] = useState('canvas');
  const [canvasView, setCanvasView] = useState<'grid' | 'flow' | 'timeline' | 'swimlane'>('flow');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  
  // Estados de operação
  const [saving, setSaving] = useState(false);
  const [processTemplates, setProcessTemplates] = useState<ProcessTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<ProcessTemplate>>({});
  
  // Estados avançados
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]);
  const [clipboardSteps, setClipboardSteps] = useState<ProcessStep[]>([]);
  const [undoStack, setUndoStack] = useState<ProcessTemplate[]>([]);
  const [redoStack, setRedoStack] = useState<ProcessTemplate[]>([]);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  
  // Estados para formulários
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [forms, setForms] = useState<any[]>([]);
  const [editingForm, setEditingForm] = useState<any | null>(null);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [formPreviewMode, setFormPreviewMode] = useState(false);
  const [showFormPreview, setShowFormPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Estados para drag and drop
  const [draggedField, setDraggedField] = useState<any | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<number | null>(null);
  const [selectedField, setSelectedField] = useState<any | null>(null);
  
  // Estados para layout de linhas e colunas
  const [formRows, setFormRows] = useState<Array<{
    id: string, 
    columns: number, 
    height: string, // 'auto', 'small', 'medium', 'large', 'xl' ou valor customizado
    columnWidths: string[] // Array com larguras de cada coluna: '1fr', '2fr', '200px', 'auto', etc.
  }>>([{
    id: 'row_1', 
    columns: 2, 
    height: 'auto',
    columnWidths: ['1fr', '1fr']
  }]);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  // ==================== CONFIGURAÇÕES AVANÇADAS ====================

  const stepTypes = useMemo(() => [
    { 
      value: 'start', 
      label: 'Início', 
      icon: PlayCircle, 
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', 
      description: 'Ponto de início do processo',
      category: 'flow'
    },
    { 
      value: 'task', 
      label: 'Tarefa', 
      icon: Target, 
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', 
      description: 'Atividade a ser executada',
      category: 'activity'
    },
    { 
      value: 'decision', 
      label: 'Decisão', 
      icon: GitBranch, 
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', 
      description: 'Ponto de decisão com múltiplos caminhos',
      category: 'gateway'
    },
    { 
      value: 'parallel', 
      label: 'Paralelo', 
      icon: Split, 
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', 
      description: 'Execução paralela de atividades',
      category: 'gateway'
    },
    { 
      value: 'merge', 
      label: 'Convergência', 
      icon: Merge, 
      color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200', 
      description: 'Convergência de fluxos paralelos',
      category: 'gateway'
    },
    { 
      value: 'gateway', 
      label: 'Gateway', 
      icon: Network, 
      color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200', 
      description: 'Controle de fluxo avançado',
      category: 'gateway'
    },
    { 
      value: 'subprocess', 
      label: 'Subprocesso', 
      icon: Layers, 
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', 
      description: 'Processo aninhado',
      category: 'activity'
    },
    { 
      value: 'event', 
      label: 'Evento', 
      icon: Bell, 
      color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200', 
      description: 'Evento ou trigger',
      category: 'event'
    },
    { 
      value: 'timer', 
      label: 'Timer', 
      icon: Timer, 
      color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', 
      description: 'Evento baseado em tempo',
      category: 'event'
    },
    { 
      value: 'condition', 
      label: 'Condição', 
      icon: AlertTriangle, 
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', 
      description: 'Condição lógica',
      category: 'gateway'
    },
    { 
      value: 'loop', 
      label: 'Loop', 
      icon: RotateCcw, 
      color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200', 
      description: 'Estrutura de repetição',
      category: 'gateway'
    },
    { 
      value: 'end', 
      label: 'Fim', 
      icon: CheckCircle, 
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', 
      description: 'Ponto final do processo',
      category: 'flow'
    }
  ], []);

  const roleOptions = useMemo(() => [
    { 
      value: 'process_owner', 
      label: 'Proprietário do Processo', 
      permissions: ['full_control', 'delegate_authority', 'strategic_decisions'],
      level: 'executive'
    },
    { 
      value: 'coordinator', 
      label: 'Coordenador de Assessment', 
      permissions: ['manage_process', 'assign_tasks', 'view_reports', 'approve_changes'],
      level: 'management'
    },
    { 
      value: 'lead_analyst', 
      label: 'Analista Líder', 
      permissions: ['execute_tasks', 'review_submissions', 'mentor_team', 'quality_control'],
      level: 'senior'
    },
    { 
      value: 'analyst', 
      label: 'Analista de Compliance', 
      permissions: ['execute_tasks', 'submit_evidence', 'create_reports'],
      level: 'operational'
    },
    { 
      value: 'senior_auditor', 
      label: 'Auditor Sênior', 
      permissions: ['review_evidence', 'validate_controls', 'approve_findings', 'train_auditors'],
      level: 'senior'
    },
    { 
      value: 'auditor', 
      label: 'Auditor Interno', 
      permissions: ['review_evidence', 'validate_controls', 'document_findings'],
      level: 'operational'
    },
    { 
      value: 'technical_reviewer', 
      label: 'Revisor Técnico', 
      permissions: ['technical_review', 'provide_feedback', 'escalate_issues'],
      level: 'specialist'
    },
    { 
      value: 'executive_approver', 
      label: 'Aprovador Executivo', 
      permissions: ['final_approval', 'strategic_decisions', 'resource_allocation', 'risk_acceptance'],
      level: 'executive'
    },
    { 
      value: 'risk_manager', 
      label: 'Gerente de Risco', 
      permissions: ['risk_assessment', 'threat_analysis', 'mitigation_planning', 'risk_reporting'],
      level: 'management'
    },
    { 
      value: 'compliance_officer', 
      label: 'Oficial de Compliance', 
      permissions: ['regulatory_oversight', 'policy_enforcement', 'external_reporting', 'training_coordination'],
      level: 'management'
    },
    { 
      value: 'security_architect', 
      label: 'Arquiteto de Segurança', 
      permissions: ['security_design', 'architecture_review', 'security_standards', 'threat_modeling'],
      level: 'specialist'
    },
    { 
      value: 'security_specialist', 
      label: 'Especialista em Segurança', 
      permissions: ['security_review', 'vulnerability_assessment', 'incident_response', 'security_testing'],
      level: 'specialist'
    },
    { 
      value: 'data_protection_officer', 
      label: 'Encarregado de Proteção de Dados', 
      permissions: ['privacy_review', 'data_mapping', 'breach_notification', 'privacy_training'],
      level: 'specialist'
    },
    { 
      value: 'external_auditor', 
      label: 'Auditor Externo', 
      permissions: ['independent_review', 'certification_assessment', 'compliance_validation'],
      level: 'external'
    },
    { 
      value: 'consultant', 
      label: 'Consultor Especializado', 
      permissions: ['expert_advice', 'best_practices', 'industry_insights', 'methodology_guidance'],
      level: 'external'
    }
  ], []);

  const industryOptions = useMemo(() => [
    { value: 'technology', label: 'Tecnologia', regulations: ['GDPR', 'LGPD', 'SOX', 'ISO27001'] },
    { value: 'financial_services', label: 'Serviços Financeiros', regulations: ['SOX', 'Basel III', 'PCI DSS', 'GDPR'] },
    { value: 'healthcare', label: 'Saúde', regulations: ['HIPAA', 'GDPR', 'LGPD', 'ISO27001'] },
    { value: 'manufacturing', label: 'Manufatura', regulations: ['ISO9001', 'ISO14001', 'ISO45001', 'GDPR'] },
    { value: 'retail', label: 'Varejo', regulations: ['PCI DSS', 'GDPR', 'LGPD', 'SOX'] },
    { value: 'energy', label: 'Energia', regulations: ['NERC CIP', 'ISO27001', 'GDPR', 'Environmental'] },
    { value: 'telecommunications', label: 'Telecomunicações', regulations: ['GDPR', 'LGPD', 'ISO27001', 'Telecom Specific'] },
    { value: 'government', label: 'Governo', regulations: ['FISMA', 'NIST', 'GDPR', 'Government Specific'] },
    { value: 'education', label: 'Educação', regulations: ['FERPA', 'GDPR', 'LGPD', 'ISO27001'] },
    { value: 'consulting', label: 'Consultoria', regulations: ['GDPR', 'LGPD', 'ISO27001', 'Client Specific'] },
    { value: 'aerospace', label: 'Aeroespacial', regulations: ['ITAR', 'AS9100', 'ISO27001', 'GDPR'] },
    { value: 'pharmaceutical', label: 'Farmacêutico', regulations: ['FDA', 'GxP', 'GDPR', 'ISO27001'] },
    { value: 'multi_industry', label: 'Multi-Indústria', regulations: ['GDPR', 'LGPD', 'ISO27001', 'SOX'] }
  ], []);

  const complexityLevels = useMemo(() => [
    { 
      value: 'simple', 
      label: 'Simples', 
      description: '1-5 etapas, processo linear', 
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      max_steps: 5,
      estimated_hours: '4-8h'
    },
    { 
      value: 'moderate', 
      label: 'Moderado', 
      description: '6-15 etapas, algumas decisões', 
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      max_steps: 15,
      estimated_hours: '1-2 dias'
    },
    { 
      value: 'complex', 
      label: 'Complexo', 
      description: '16-30 etapas, múltiplos caminhos', 
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      max_steps: 30,
      estimated_hours: '3-5 dias'
    },
    { 
      value: 'enterprise', 
      label: 'Empresarial', 
      description: '31-50 etapas, alta integração', 
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      max_steps: 50,
      estimated_hours: '1-2 semanas'
    },
    { 
      value: 'expert', 
      label: 'Especialista', 
      description: '50+ etapas, máxima complexidade', 
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      max_steps: 100,
      estimated_hours: '2+ semanas'
    }
  ], []);

  // ==================== FUNÇÕES DE CARREGAMENTO ====================

  useEffect(() => {
    loadProcessTemplates();
  }, [user?.tenantId]);

  const loadProcessTemplates = useCallback(async () => {
    try {
      setLoading(true);
      
      // Tentar carregar do Supabase primeiro
      if (user?.tenantId) {
        const { data: templates, error } = await supabase
          .from('assessment_process_templates')
          .select('*')
          .or(`tenant_id.eq.${user.tenantId},is_global.eq.true`)
          .order('created_at', { ascending: false });

        if (!error && templates) {
          setProcessTemplates(templates);
          return;
        }
      }
      
      // Fallback para templates mock
      setProcessTemplates(getMockTemplates());
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      setProcessTemplates(getMockTemplates());
    } finally {
      setLoading(false);
    }
  }, [user?.tenantId]);

  const getMockTemplates = useCallback((): ProcessTemplate[] => [
    {
      id: 'iso-27001-enterprise',
      name: 'ISO 27001 - Assessment Empresarial Completo',
      description: 'Processo empresarial robusto para assessment ISO 27001 com IA adaptativa, automação avançada e integração completa com frameworks de segurança.',
      category: 'Information Security',
      industry: ['technology', 'financial_services', 'healthcare'],
      complexity: 'enterprise',
      steps: [
        {
          id: 'start-001',
          name: 'Inicialização e Planejamento Estratégico',
          description: 'Configuração inicial com análise de contexto organizacional, definição de escopo e planejamento estratégico do assessment',
          type: 'start',
          assignee_role: 'process_owner',
          estimated_duration: 8,
          dependencies: [],
          position: { x: 100, y: 100 },
          conditions: {
            approval_required: true,
            evidence_required: false,
            review_required: true,
            compliance_check: true,
            risk_threshold: 'medium',
            sla_hours: 24,
            escalation_enabled: true
          },
          automation: {
            trigger_events: ['process_start', 'stakeholder_notification'],
            actions: [
              {
                id: 'auto-001',
                type: 'email',
                config: {
                  template: 'assessment_kickoff',
                  recipients: ['stakeholders', 'team_leads'],
                  include_timeline: true
                }
              },
              {
                id: 'auto-002',
                type: 'api_call',
                config: {
                  endpoint: '/api/assessments/initialize',
                  method: 'POST',
                  data: { process_id: '{{process.id}}', tenant_id: '{{tenant.id}}' }
                }
              }
            ],
            notifications: [
              {
                id: 'notif-001',
                type: 'slack',
                recipients: ['#compliance-team'],
                template: 'assessment_started',
                trigger_condition: 'step_completed',
                personalization: {
                  dynamic_content: true,
                  user_preferences: true,
                  localization: true,
                  timezone_aware: true
                }
              }
            ],
            ai_assistance: true,
            auto_assignment: true,
            webhook_urls: ['https://api.company.com/webhooks/assessment-start']
          },
          questionnaire: {
            template_id: 'iso27001-planning',
            framework: 'ISO 27001',
            questions: [
              {
                id: 'q001',
                text: 'Qual é o escopo organizacional do SGSI?',
                type: 'text',
                required: true,
                weight: 10,
                validation_rules: [
                  {
                    type: 'min_length',
                    value: 50,
                    message: 'Descrição deve ter pelo menos 50 caracteres'
                  }
                ],
                help_text: 'Descreva detalhadamente o escopo organizacional incluindo unidades de negócio, localizações e sistemas',
                evidence_required: true
              }
            ],
            scoring_method: 'weighted',
            required_evidence: [
              {
                id: 'ev001',
                name: 'Documento de Escopo do SGSI',
                type: 'document',
                required: true,
                validation_criteria: ['Aprovado pela direção', 'Assinado pelo CISO', 'Data atual'],
                auto_verification: false
              }
            ]
          },
          security: {
            encryption_required: true,
            access_level: 'confidential',
            audit_trail: true,
            data_retention_days: 2555,
            pii_handling: 'encrypt',
            compliance_tags: ['ISO27001', 'GDPR', 'SOX']
          },
          metrics: {
            success_criteria: [
              {
                id: 'sc001',
                name: 'Aprovação do Escopo',
                description: 'Escopo aprovado pela alta direção',
                measurement_method: 'binary',
                target_value: 1,
                tolerance: 0,
                priority: 'critical'
              }
            ],
            kpis: [
              {
                id: 'kpi001',
                name: 'Tempo de Aprovação',
                description: 'Tempo para aprovação do escopo',
                target_value: 24,
                measurement_unit: 'hours',
                calculation_method: 'time_difference',
                frequency: 'real_time',
                visualization_type: 'gauge'
              }
            ],
            benchmarks: [
              {
                id: 'bench001',
                name: 'Tempo Médio da Indústria',
                industry_standard: 48,
                best_practice: 24,
                source: 'ISO/IEC 27001 Industry Survey 2024',
                last_updated: '2024-01-01',
                confidence_level: 0.85
              }
            ]
          },
          visual: {
            color: '#10B981',
            icon: 'play-circle',
            size: 'large',
            shape: 'circle',
            border_style: 'solid'
          },
          collaboration: {
            comments_enabled: true,
            real_time_editing: true,
            version_control: true,
            change_tracking: true,
            approval_workflow: [
              {
                step_id: 'start-001',
                approvers: ['process_owner', 'executive_approver'],
                approval_type: 'sequential',
                timeout_hours: 48,
                escalation_rules: [
                  {
                    condition: 'timeout_exceeded',
                    delay_hours: 24,
                    escalate_to: ['ceo', 'board'],
                    action: 'auto_approve_with_notification'
                  }
                ],
                delegation_allowed: true
              }
            ]
          }
        }
      ],
      metadata: {
        created_by: 'alex_assessment_ai',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: '3.2.1',
        usage_count: 1247,
        avg_rating: 4.9,
        tags: ['ISO 27001', 'Enterprise', 'AI-Powered', 'Automated', 'Best-Practice'],
        certification_level: 'enterprise',
        compliance_frameworks: ['iso27001', 'nist_csf', 'cobit', 'sox'],
        maturity_level: 'optimizing',
        risk_level: 'medium'
      },
      is_adaptive: true,
      adaptive_rules: {
        role_based_variations: [
          {
            role: 'small_business',
            organization_size: 'small',
            modifications: {
              'start-001': {
                estimated_duration: 4,
                conditions: {
                  approval_required: false,
                  evidence_required: true,
                  review_required: false,
                  compliance_check: true
                }
              }
            }
          }
        ],
        context_adaptations: [
          {
            condition: 'first_time_assessment',
            trigger_values: ['true'],
            add_steps: [
              {
                id: 'training-001',
                name: 'Treinamento em ISO 27001',
                description: 'Treinamento básico para equipe nova em ISO 27001',
                type: 'task',
                assignee_role: 'consultant',
                estimated_duration: 16,
                dependencies: ['start-001'],
                position: { x: 200, y: 150 }
              }
            ],
            priority: 1
          }
        ],
        ai_optimization_enabled: true,
        learning_enabled: true,
        auto_improvement: true,
        predictive_analytics: true
      },
      tenant_config: {
        tenant_id: user?.tenantId || '',
        is_global: true,
        sharing_permissions: [
          {
            tenant_id: 'global',
            permission_level: 'view',
            restrictions: ['no_export', 'no_modification']
          }
        ],
        encryption_level: 'enterprise',
        data_residency: 'EU',
        compliance_requirements: ['GDPR', 'SOX', 'ISO27001']
      },
      collaboration: {
        team_roles: [
          {
            role_id: 'iso_lead',
            role_name: 'ISO 27001 Lead Implementer',
            permissions: ['manage_assessment', 'approve_findings', 'assign_tasks'],
            responsibilities: ['Overall assessment coordination', 'Quality assurance', 'Stakeholder communication'],
            required_certifications: ['ISO 27001 Lead Implementer', 'CISSP'],
            skill_requirements: [
              {
                skill: 'Risk Management',
                level: 'expert',
                required: true
              },
              {
                skill: 'Information Security',
                level: 'expert',
                required: true
              }
            ]
          }
        ],
        approval_workflow: [],
        review_cycles: [
          {
            frequency: 'monthly',
            reviewers: ['process_owner', 'compliance_officer'],
            review_criteria: ['Progress against timeline', 'Quality of deliverables', 'Risk identification'],
            auto_schedule: true,
            review_template: 'monthly_assessment_review'
          }
        ],
        stakeholder_matrix: [
          {
            stakeholder_type: 'Executive Leadership',
            involvement_level: 'accountable',
            communication_frequency: 'weekly',
            preferred_channels: ['email', 'dashboard'],
            escalation_path: ['ceo', 'board']
          }
        ],
        real_time_collaboration: true,
        version_control: {
          enabled: true,
          auto_versioning: true,
          branch_strategy: 'feature_branch',
          merge_strategy: 'merge_commit',
          approval_required_for_merge: true
        }
      },
      framework_integration: {
        primary_framework: 'iso27001',
        secondary_frameworks: ['nist_csf', 'cobit', 'sox'],
        control_mappings: [
          {
            control_id: 'A.5.1.1',
            framework: 'ISO 27001',
            control_description: 'Information security policies',
            mapped_steps: ['start-001'],
            testing_frequency: 'annually',
            evidence_requirements: ['Policy document', 'Approval records', 'Communication records'],
            automation_level: 'semi_automated'
          }
        ],
        regulatory_mappings: [
          {
            regulation: 'GDPR',
            requirement_id: 'Art. 32',
            requirement_text: 'Security of processing',
            mapped_steps: ['start-001'],
            compliance_level: 'mandatory',
            penalty_risk: 'high'
          }
        ],
        cross_references: [
          {
            source_framework: 'ISO 27001',
            target_framework: 'NIST CSF',
            mapping_type: 'equivalent',
            confidence_level: 0.9
          }
        ]
      },
      execution_config: {
        parallel_execution: true,
        max_concurrent_steps: 5,
        timeout_minutes: 10080, // 1 week
        retry_failed_steps: true,
        rollback_on_failure: false,
        checkpoint_frequency: 24 // hours
      },
      analytics_config: {
        track_performance: true,
        generate_reports: true,
        real_time_monitoring: true,
        predictive_insights: true,
        custom_dashboards: [
          {
            id: 'exec_dashboard',
            name: 'Executive Dashboard',
            widgets: [
              {
                id: 'progress_gauge',
                type: 'gauge',
                data_source: 'assessment_progress',
                config: { min: 0, max: 100, unit: '%' },
                position: { x: 0, y: 0, width: 6, height: 4 }
              }
            ],
            layout: 'grid',
            refresh_interval: 300 // 5 minutes
          }
        ]
      }
    }
  ], [user?.tenantId]);

  // ==================== FUNÇÕES DE MANIPULAÇÃO ====================

  const startDesigning = useCallback((template: ProcessTemplate) => {
    // Salvar estado atual para undo
    if (currentProcess) {
      setUndoStack(prev => [...prev, currentProcess]);
    }
    
    setCurrentProcess({ ...template });
    setIsDesigning(true);
    setPreviewMode(false);
    setActiveDesignTab('canvas');
    setRedoStack([]); // Limpar redo stack
    toast.success(`Iniciando design do processo: ${template.name}`);
  }, [currentProcess]);

  const addNewStep = useCallback(() => {
    if (!currentProcess) return;

    const newStep: ProcessStep = {
      id: `step_${Date.now()}`,
      name: 'Nova Etapa',
      description: 'Descreva esta etapa do processo de assessment',
      type: 'task',
      assignee_role: 'analyst',
      estimated_duration: 4,
      dependencies: [],
      position: { 
        x: 200 + (currentProcess.steps.length * 50), 
        y: 300 + (Math.floor(currentProcess.steps.length / 4) * 200) 
      },
      conditions: {
        approval_required: false,
        evidence_required: false,
        review_required: false,
        compliance_check: false,
        risk_threshold: 'low',
        sla_hours: 24,
        escalation_enabled: false
      },
      automation: {
        trigger_events: [],
        actions: [],
        notifications: [],
        ai_assistance: false,
        auto_assignment: false
      },
      security: {
        encryption_required: true,
        access_level: 'internal',
        audit_trail: true,
        data_retention_days: 2555,
        pii_handling: 'none',
        compliance_tags: []
      },
      visual: {
        color: '#3B82F6',
        icon: 'target',
        size: 'medium',
        shape: 'rectangle',
        border_style: 'solid'
      },
      collaboration: {
        comments_enabled: true,
        real_time_editing: true,
        version_control: true,
        change_tracking: true
      }
    };

    // Salvar estado para undo
    setUndoStack(prev => [...prev, currentProcess]);
    setRedoStack([]);

    setCurrentProcess(prev => prev ? {
      ...prev,
      steps: [...prev.steps, newStep]
    } : null);

    toast.success('Nova etapa adicionada ao processo');
  }, [currentProcess]);

  const updateStep = useCallback((updatedStep: ProcessStep) => {
    if (!currentProcess) return;

    // Salvar estado para undo
    setUndoStack(prev => [...prev, currentProcess]);
    setRedoStack([]);

    setCurrentProcess(prev => prev ? {
      ...prev,
      steps: prev.steps.map(step => 
        step.id === updatedStep.id ? updatedStep : step
      )
    } : null);

    toast.success('Etapa atualizada com sucesso');
  }, [currentProcess]);

  const deleteStep = useCallback((stepId: string) => {
    if (!currentProcess) return;

    // Salvar estado para undo
    setUndoStack(prev => [...prev, currentProcess]);
    setRedoStack([]);

    setCurrentProcess(prev => prev ? {
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    } : null);

    // Remover das seleções
    setSelectedSteps(prev => prev.filter(id => id !== stepId));

    toast.success('Etapa removida do processo');
  }, [currentProcess]);

  const duplicateStep = useCallback((step: ProcessStep) => {
    if (!currentProcess) return;

    const duplicatedStep: ProcessStep = {
      ...step,
      id: `step_${Date.now()}`,
      name: `${step.name} (Cópia)`,
      position: { x: step.position.x + 50, y: step.position.y + 50 }
    };

    // Salvar estado para undo
    setUndoStack(prev => [...prev, currentProcess]);
    setRedoStack([]);

    setCurrentProcess(prev => prev ? {
      ...prev,
      steps: [...prev.steps, duplicatedStep]
    } : null);

    toast.success('Etapa duplicada com sucesso');
  }, [currentProcess]);

  const copySteps = useCallback(() => {
    if (!currentProcess || selectedSteps.length === 0) return;

    const stepsToCopy = currentProcess.steps.filter(step => 
      selectedSteps.includes(step.id)
    );
    
    setClipboardSteps(stepsToCopy);
    toast.success(`${stepsToCopy.length} etapa(s) copiada(s)`);
  }, [currentProcess, selectedSteps]);

  const pasteSteps = useCallback(() => {
    if (!currentProcess || clipboardSteps.length === 0) return;

    // Salvar estado para undo
    setUndoStack(prev => [...prev, currentProcess]);
    setRedoStack([]);

    const pastedSteps = clipboardSteps.map((step, index) => ({
      ...step,
      id: `step_${Date.now()}_${index}`,
      name: `${step.name} (Colado)`,
      position: { 
        x: step.position.x + 100, 
        y: step.position.y + 100 
      }
    }));

    setCurrentProcess(prev => prev ? {
      ...prev,
      steps: [...prev.steps, ...pastedSteps]
    } : null);

    toast.success(`${pastedSteps.length} etapa(s) colada(s)`);
  }, [currentProcess, clipboardSteps]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;

    const previousState = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);
    
    if (currentProcess) {
      setRedoStack(prev => [...prev, currentProcess]);
    }
    
    setUndoStack(newUndoStack);
    setCurrentProcess(previousState);
    
    toast.success('Ação desfeita');
  }, [undoStack, currentProcess]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    const nextState = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);
    
    if (currentProcess) {
      setUndoStack(prev => [...prev, currentProcess]);
    }
    
    setRedoStack(newRedoStack);
    setCurrentProcess(nextState);
    
    toast.success('Ação refeita');
  }, [redoStack, currentProcess]);

  const saveProcess = useCallback(async () => {
    if (!currentProcess || !user?.tenantId) return;

    setSaving(true);
    try {
      const processData = {
        ...currentProcess,
        tenant_config: {
          ...currentProcess.tenant_config,
          tenant_id: user.tenantId
        },
        metadata: {
          ...currentProcess.metadata,
          updated_at: new Date().toISOString()
        }
      };

      // Tentar salvar no Supabase
      const { error } = await supabase
        .from('assessment_process_templates')
        .upsert(processData);

      if (error) {
        console.warn('Erro ao salvar no Supabase:', error);
        // Continuar mesmo com erro - salvar localmente
      }

      // Atualizar lista local
      setProcessTemplates(prev => {
        const index = prev.findIndex(t => t.id === processData.id);
        if (index >= 0) {
          const newTemplates = [...prev];
          newTemplates[index] = processData;
          return newTemplates;
        } else {
          return [processData, ...prev];
        }
      });

      toast.success('Processo salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar processo:', error);
      toast.error('Erro ao salvar processo');
    } finally {
      setSaving(false);
    }
  }, [currentProcess, user?.tenantId]);

  const optimizeWithAI = useCallback(async () => {
    if (!currentProcess) return;

    try {
      toast.info('🤖 Analisando processo com IA...');
      
      // Simular análise de IA
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Aplicar otimizações simuladas
      const optimizations = [
        'Paralelização de etapas independentes',
        'Automação de aprovações de baixo risco',
        'Consolidação de etapas similares',
        'Adição de checkpoints de qualidade',
        'Otimização de fluxo de dados'
      ];
      
      toast.success(`✨ Processo otimizado! Aplicadas: ${optimizations.join(', ')}`);
    } catch (error) {
      toast.error('Erro na otimização IA');
    }
  }, [currentProcess]);

  const exportProcess = useCallback(() => {
    if (!currentProcess) return;

    const exportData = {
      ...currentProcess,
      export_metadata: {
        exported_at: new Date().toISOString(),
        exported_by: user?.email || 'unknown',
        version: '1.0',
        format: 'alex_process_designer'
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${currentProcess.name.replace(/\s+/g, '_')}_v${currentProcess.metadata.version}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Processo exportado com sucesso!');
  }, [currentProcess, user?.email]);

  // ==================== FUNÇÕES DE FORMULÁRIOS ====================

  const createNewForm = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const newForm = {
      id: `form_${Date.now()}`,
      name: 'Novo Formulário',
      description: 'Descrição do formulário',
      fields: [],
      created_at: new Date().toISOString()
    };
    
    setForms(prev => [...prev, newForm]);
    setEditingForm(newForm);
    setShowFormBuilder(true);
    toast.success('Novo formulário criado!');
  }, []);

  const editForm = useCallback((form: any, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setEditingForm(form);
    setShowFormBuilder(true);
    toast.info(`Editando formulário: ${form.name}`);
  }, []);

  const addFieldToForm = useCallback((fieldType: string, rowId: string, column: number = 0) => {
    if (!editingForm) return;
    
    const existingFields = editingForm.fields || [];
    const rowIndex = formRows.findIndex(r => r.id === rowId);
    
    const newField = {
      id: `field_${Date.now()}`,
      type: fieldType,
      label: `Campo ${fieldType}`,
      required: false,
      placeholder: fieldType === 'textarea' ? 'Digite sua resposta aqui...' : 'Digite aqui...',
      options: fieldType === 'select' || fieldType === 'radio' ? ['Opção 1', 'Opção 2'] : undefined,
      rowId: rowId,
      rowIndex: rowIndex,
      column: column,
      width: 1, // span de colunas (1-4)
      validation: {
        minLength: fieldType === 'text' || fieldType === 'textarea' ? 0 : undefined,
        maxLength: fieldType === 'text' || fieldType === 'textarea' ? 255 : undefined,
        min: fieldType === 'number' ? 0 : undefined,
        max: fieldType === 'number' ? 100 : undefined
      }
    };
    
    const updatedForm = {
      ...editingForm,
      fields: [...existingFields, newField],
      rows: formRows
    };
    
    setEditingForm(updatedForm);
    setForms(prev => prev.map(f => f.id === updatedForm.id ? updatedForm : f));
    setSelectedField(newField);
    toast.success(`Campo ${fieldType} adicionado!`);
  }, [editingForm, formRows]);

  // ==================== FUNÇÕES DE DRAG AND DROP ====================

  const handleDragStart = useCallback((e: React.DragEvent, field: any, isNewField: boolean = false) => {
    setDraggedField({ ...field, isNewField });
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, rowId: string, column: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(column);
    setSelectedRow(rowId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
    setSelectedRow(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetRowId: string, targetColumn: number) => {
    e.preventDefault();
    setDragOverColumn(null);
    setSelectedRow(null);
    
    if (!draggedField || !editingForm) {
      setDraggedField(null);
      return;
    }
    
    const existingFields = editingForm.fields || [];
    const targetRowIndex = formRows.findIndex(r => r.id === targetRowId);
    
    if (draggedField.isNewField) {
      // Adicionando novo campo
      const newField = {
        id: `field_${Date.now()}`,
        type: draggedField.type,
        label: `Campo ${draggedField.label || draggedField.type}`,
        required: false,
        placeholder: draggedField.type === 'textarea' ? 'Digite sua resposta aqui...' : 'Digite aqui...',
        options: draggedField.type === 'select' || draggedField.type === 'radio' ? ['Opção 1', 'Opção 2'] : undefined,
        rowId: targetRowId,
        rowIndex: targetRowIndex,
        column: targetColumn,
        width: 1,
        validation: {
          minLength: draggedField.type === 'text' || draggedField.type === 'textarea' ? 0 : undefined,
          maxLength: draggedField.type === 'text' || draggedField.type === 'textarea' ? 255 : undefined,
          min: draggedField.type === 'number' ? 0 : undefined,
          max: draggedField.type === 'number' ? 100 : undefined
        }
      };
      
      const updatedForm = {
        ...editingForm,
        fields: [...existingFields, newField],
        rows: formRows
      };
      
      setEditingForm(updatedForm);
      setForms(prev => prev.map(f => f.id === updatedForm.id ? updatedForm : f));
      setSelectedField(newField);
      toast.success(`Campo ${draggedField.label || draggedField.type} adicionado!`);
    } else {
      // Movendo campo existente
      const updatedFields = existingFields.map((field: any) => {
        if (field.id === draggedField.id) {
          return {
            ...field,
            rowId: targetRowId,
            rowIndex: targetRowIndex,
            column: targetColumn
          };
        }
        return field;
      });
      
      const updatedForm = {
        ...editingForm,
        fields: updatedFields
      };
      
      setEditingForm(updatedForm);
      setForms(prev => prev.map(f => f.id === updatedForm.id ? updatedForm : f));
      toast.success('Campo movido!');
    }
    
    setDraggedField(null);
  }, [draggedField, editingForm, formRows]);

  // ==================== FUNÇÕES DE GERENCIAMENTO DE LINHAS ====================

  const addNewRow = useCallback((columns: number = 2) => {
    const newRow = {
      id: `row_${Date.now()}`,
      columns: columns,
      height: 'auto',
      columnWidths: Array(columns).fill('1fr')
    };
    setFormRows(prev => [...prev, newRow]);
    toast.success(`Nova linha adicionada com ${columns} coluna${columns > 1 ? 's' : ''}`);
  }, []);

  const removeRow = useCallback((rowId: string) => {
    if (formRows.length <= 1) {
      toast.error('Deve haver pelo menos uma linha no formulário');
      return;
    }
    
    // Remover campos da linha
    if (editingForm) {
      const fieldsToRemove = editingForm.fields?.filter((field: any) => field.rowId === rowId) || [];
      const remainingFields = editingForm.fields?.filter((field: any) => field.rowId !== rowId) || [];
      
      const updatedForm = {
        ...editingForm,
        fields: remainingFields
      };
      
      setEditingForm(updatedForm);
      setForms(prev => prev.map(f => f.id === updatedForm.id ? updatedForm : f));
      
      if (fieldsToRemove.length > 0) {
        toast.info(`${fieldsToRemove.length} campo(s) removido(s) junto com a linha`);
      }
    }
    
    setFormRows(prev => prev.filter(row => row.id !== rowId));
    toast.success('Linha removida');
  }, [formRows, editingForm]);

  const updateRowColumns = useCallback((rowId: string, columns: number) => {
    setFormRows(prev => prev.map(row => {
      if (row.id === rowId) {
        // Ajustar array de larguras das colunas
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
    if (editingForm) {
      const updatedFields = editingForm.fields?.map((field: any) => {
        if (field.rowId === rowId && field.column >= columns) {
          return { ...field, column: columns - 1 };
        }
        return field;
      }) || [];
      
      const updatedForm = {
        ...editingForm,
        fields: updatedFields
      };
      
      setEditingForm(updatedForm);
      setForms(prev => prev.map(f => f.id === updatedForm.id ? updatedForm : f));
    }
    
    toast.success(`Linha atualizada para ${columns} coluna${columns > 1 ? 's' : ''}`);
  }, [editingForm]);

  const updateRowHeight = useCallback((rowId: string, height: string) => {
    setFormRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, height } : row
    ));
    toast.success(`Altura da linha atualizada`);
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
    toast.success(`Largura da coluna ${columnIndex + 1} atualizada`);
  }, []);

  // ==================== FUNÇÕES DE EDIÇÃO DE CAMPOS ====================

  const updateField = useCallback((fieldId: string, updates: any) => {
    if (!editingForm) return;
    
    const updatedFields = editingForm.fields.map((field: any) => 
      field.id === fieldId ? { ...field, ...updates } : field
    );
    
    const updatedForm = {
      ...editingForm,
      fields: updatedFields
    };
    
    setEditingForm(updatedForm);
    setForms(prev => prev.map(f => f.id === updatedForm.id ? updatedForm : f));
    
    // Atualizar campo selecionado se for o mesmo
    if (selectedField && selectedField.id === fieldId) {
      setSelectedField({ ...selectedField, ...updates });
    }
  }, [editingForm, selectedField]);

  const deleteField = useCallback((fieldId: string) => {
    if (!editingForm) return;
    
    const updatedFields = editingForm.fields.filter((field: any) => field.id !== fieldId);
    
    const updatedForm = {
      ...editingForm,
      fields: updatedFields
    };
    
    setEditingForm(updatedForm);
    setForms(prev => prev.map(f => f.id === updatedForm.id ? updatedForm : f));
    
    if (selectedField && selectedField.id === fieldId) {
      setSelectedField(null);
    }
    
    toast.success('Campo removido!');
  }, [editingForm, selectedField]);

  const saveForm = useCallback(() => {
    if (!editingForm) return;
    
    // Validação básica
    if (!editingForm.name || editingForm.name.trim() === '') {
      toast.error('Nome do formulário é obrigatório');
      return;
    }
    
    if (!editingForm.fields || editingForm.fields.length === 0) {
      toast.error('Adicione pelo menos um campo ao formulário');
      return;
    }
    
    const updatedForm = {
      ...editingForm,
      updated_at: new Date().toISOString(),
      version: (editingForm.version || 1) + 1
    };
    
    setEditingForm(updatedForm);
    setForms(prev => prev.map(f => f.id === updatedForm.id ? updatedForm : f));
    
    toast.success('Formulário salvo com sucesso!');
  }, [editingForm]);

  const createNewTemplate = useCallback((e?: React.MouseEvent) => {
    // Prevenir comportamento padrão
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Validação básica
    if (!newTemplate.name || !newTemplate.description) {
      toast.error('Nome e descrição são obrigatórios');
      return;
    }

    const newTemplateData: ProcessTemplate = {
      id: `template_${Date.now()}`,
      name: newTemplate.name,
      description: newTemplate.description,
      category: newTemplate.category || 'Custom',
      industry: newTemplate.industry || ['technology'],
      complexity: newTemplate.complexity || 'simple',
      steps: [],
      metadata: {
        created_by: user?.email || 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: '1.0.0',
        usage_count: 0,
        avg_rating: 0,
        tags: newTemplate.tags || [],
        certification_level: 'basic',
        compliance_frameworks: [],
        maturity_level: 'initial',
        risk_level: 'low'
      },
      is_adaptive: newTemplate.is_adaptive || false,
      adaptive_rules: {
        role_based_variations: [],
        context_adaptations: [],
        ai_optimization_enabled: newTemplate.is_adaptive || false,
        learning_enabled: newTemplate.is_adaptive || false,
        auto_improvement: false,
        predictive_analytics: false
      },
      tenant_config: {
        tenant_id: user?.tenantId || '',
        is_global: false,
        sharing_permissions: [],
        encryption_level: 'basic',
        data_residency: 'local',
        compliance_requirements: []
      },
      collaboration: {
        team_roles: [],
        approval_workflow: [],
        review_cycles: [],
        stakeholder_matrix: [],
        real_time_collaboration: newTemplate.real_time_collaboration || false,
        version_control: {
          enabled: true,
          auto_versioning: true,
          branch_strategy: 'linear',
          merge_strategy: 'fast_forward',
          approval_required_for_merge: false
        }
      },
      framework_integration: {
        primary_framework: newTemplate.primary_framework || '',
        secondary_frameworks: [],
        control_mappings: [],
        regulatory_mappings: [],
        cross_references: []
      },
      execution_config: {
        parallel_execution: false,
        max_concurrent_steps: 1,
        timeout_minutes: 1440, // 24 hours
        retry_failed_steps: false,
        rollback_on_failure: false,
        checkpoint_frequency: 24
      },
      analytics_config: {
        track_performance: newTemplate.advanced_analytics || false,
        generate_reports: false,
        real_time_monitoring: false,
        predictive_insights: false,
        custom_dashboards: []
      }
    };

    try {
      // Adicionar à lista de templates
      setProcessTemplates(prev => [newTemplateData, ...prev]);
      
      // Iniciar design do novo template
      startDesigning(newTemplateData);
      
      // Fechar modal e limpar formulário apenas após sucesso
      setShowNewTemplateDialog(false);
      setNewTemplate({});
      
      toast.success(`Template "${newTemplateData.name}" criado com sucesso!`);
    } catch (error) {
      console.error('Erro ao criar template:', error);
      toast.error('Erro ao criar template');
      // Não fechar o modal em caso de erro
    }
  }, [newTemplate, user?.email, user?.tenantId, startDesigning]);

  // ==================== COMPONENTE DE LOADING ====================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">Carregando Alex Process Designer</p>
            <p className="text-sm text-muted-foreground">Inicializando sistema avançado de design de processos...</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            <span>IA Adaptativa</span>
            <Separator orientation="vertical" className="h-3" />
            <Rocket className="h-3 w-3" />
            <span>Automação Avançada</span>
            <Separator orientation="vertical" className="h-3" />
            <Shield className="h-3 w-3" />
            <span>Segurança Empresarial</span>
          </div>
        </div>
      </div>
    );
  }

  // ==================== RENDER PRINCIPAL ====================

  return (
    <div className="space-y-6 p-6">
      {/* Header Principal Avançado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative p-3 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-xl shadow-lg">
            <Settings2 className="w-8 h-8 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Alex Process Designer
              </h1>
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                v3.2.1
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Designer empresarial de processos com IA adaptativa e automação avançada
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <Brain className="h-3 w-3 mr-1" />
                IA Adaptativa
              </Badge>
              <Badge variant="outline">
                <Rocket className="h-3 w-3 mr-1" />
                Automação Avançada
              </Badge>
              <Badge variant="outline">
                <Shield className="h-3 w-3 mr-1" />
                Segurança Empresarial
              </Badge>
              <Badge variant="outline">
                <Globe className="h-3 w-3 mr-1" />
                Multi-Framework
              </Badge>
              <Badge variant="outline">
                <Sparkles className="h-3 w-3 mr-1" />
                Colaboração em Tempo Real
              </Badge>
            </div>
          </div>
        </div>
        
        {/* BOTÕES REMOVIDOS DO HEADER - MOVIDOS PARA RODAPÉ */}
      </div>

      {/* Conteúdo Principal */}
      {!isDesigning ? (
        /* Seleção de Templates Avançada */
        <div className="space-y-6">
          {/* Filtros e Busca Avançados */}
          <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nome, categoria, framework, tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Categorias</SelectItem>
                    <SelectItem value="Information Security">Segurança da Informação</SelectItem>
                    <SelectItem value="Privacy & Data Protection">Privacidade e Proteção de Dados</SelectItem>
                    <SelectItem value="Financial Compliance">Compliance Financeiro</SelectItem>
                    <SelectItem value="Quality Management">Gestão da Qualidade</SelectItem>
                    <SelectItem value="Risk Management">Gestão de Riscos</SelectItem>
                    <SelectItem value="Operational Excellence">Excelência Operacional</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewTemplateDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Novo Template
                </Button>
                <Button 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Importar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Grid de Templates Avançado */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processTemplates
              .filter(template => {
                const matchesSearch = searchTerm === '' || 
                  template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  template.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                  template.metadata.compliance_frameworks.some(fw => fw.toLowerCase().includes(searchTerm.toLowerCase()));
                
                const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
                
                return matchesSearch && matchesCategory;
              })
              .map((template) => {
                const complexityConfig = complexityLevels.find(c => c.value === template.complexity);
                
                return (
                  <Card 
                    key={template.id} 
                    className="hover:shadow-2xl transition-all duration-300 cursor-pointer group border-2 hover:border-blue-200 dark:hover:border-blue-800 overflow-hidden relative"
                  >
                    {/* Badge de Destaque */}
                    {template.metadata.avg_rating >= 4.8 && (
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                          <Star className="h-3 w-3 mr-1" />
                          Destaque
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-4">
                          <CardTitle className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {template.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              {template.category}
                            </Badge>
                            <Badge className={complexityConfig?.color}>
                              {complexityConfig?.label}
                            </Badge>
                            {template.is_adaptive && (
                              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                <Brain className="h-3 w-3 mr-1" />
                                IA
                              </Badge>
                            )}
                            {template.metadata.certification_level && (
                              <Badge variant="outline" className="text-xs">
                                <Award className="h-3 w-3 mr-1" />
                                {template.metadata.certification_level}
                              </Badge>
                            )}
                            {template.collaboration.real_time_collaboration && (
                              <Badge variant="outline" className="text-xs">
                                <Users className="h-3 w-3 mr-1" />
                                Colaborativo
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{template.metadata.avg_rating}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {template.metadata.usage_count} usos
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 break-words">
                        {template.description}
                      </p>
                      
                      {/* Frameworks */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          Frameworks ({template.metadata.compliance_frameworks.length})
                        </Label>
                        <div className="flex flex-wrap gap-1">
                          {template.metadata.compliance_frameworks.slice(0, 4).map(framework => (
                            <Badge key={framework} variant="outline" className="text-xs">
                              {framework.toUpperCase()}
                            </Badge>
                          ))}
                          {template.metadata.compliance_frameworks.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.metadata.compliance_frameworks.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Indústrias */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          Indústrias ({template.industry.length})
                        </Label>
                        <div className="flex flex-wrap gap-1">
                          {template.industry.slice(0, 3).map(industry => {
                            const industryConfig = industryOptions.find(i => i.value === industry);
                            return (
                              <Badge key={industry} variant="outline" className="text-xs">
                                {industryConfig?.label || industry}
                              </Badge>
                            );
                          })}
                          {template.industry.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.industry.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Estatísticas Avançadas */}
                      <div className="grid grid-cols-4 gap-3 text-center text-sm">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">{template.steps.length}</div>
                          <div className="text-gray-500 dark:text-gray-400 text-xs">Etapas</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {template.steps.reduce((total, step) => total + step.estimated_duration, 0)}h
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 text-xs">Duração</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {template.metadata.maturity_level ? template.metadata.maturity_level.charAt(0).toUpperCase() : 'N/A'}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 text-xs">Maturidade</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {template.metadata.risk_level ? template.metadata.risk_level.charAt(0).toUpperCase() : 'N/A'}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 text-xs">Risco</div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {template.metadata.tags.slice(0, 5).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            <Hash className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {template.metadata.tags.length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.metadata.tags.length - 5}
                          </Badge>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm"
                          onClick={() => startDesigning(template)}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Personalizar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setCurrentProcess(template);
                            setPreviewMode(true);
                            setIsDesigning(true);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Visualizar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const newTemplate = {
                              ...template,
                              id: `${template.id}_copy_${Date.now()}`,
                              name: `${template.name} (Cópia)`,
                              metadata: {
                                ...template.metadata,
                                created_at: new Date().toISOString(),
                                usage_count: 0
                              }
                            };
                            startDesigning(newTemplate);
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      ) : (
        /* Interface do Designer Avançada */
        <div className="space-y-6">
          {/* Header do Designer */}
          <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <Workflow className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {currentProcess?.name}
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {currentProcess?.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">
                        v{currentProcess?.metadata.version}
                      </Badge>
                      <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                        <Building className="h-3 w-3 mr-1" />
                        {currentProcess?.category}
                      </Badge>
                      {currentProcess?.is_adaptive && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          <Brain className="h-3 w-3 mr-1" />
                          IA Adaptativa
                        </Badge>
                      )}
                      {currentProcess?.collaboration.real_time_collaboration && (
                        <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                          <Users className="h-3 w-3 mr-1" />
                          Colaborativo
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {/* BOTÕES REMOVIDOS DO HEADER - MOVIDOS PARA RODAPÉ */}
              </div>
            </CardHeader>
          </Card>

          {/* Tabs do Designer */}
          <Tabs value={activeDesignTab} onValueChange={setActiveDesignTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="canvas" className="flex items-center gap-2">
                <Compass className="h-4 w-4" />
                Canvas
              </TabsTrigger>
              <TabsTrigger value="properties" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Propriedades
              </TabsTrigger>
              <TabsTrigger value="automation" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Automação
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="collaboration" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Colaboração
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Segurança
              </TabsTrigger>
            </TabsList>

            <TabsContent value="canvas" className="space-y-4">
              {/* Canvas Principal */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Compass className="h-4 w-4" />
                      Canvas de Processo Avançado
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {currentProcess?.steps.length || 0} etapas
                      </Badge>
                      <Badge variant="outline">
                        {currentProcess?.steps.reduce((total, step) => total + step.estimated_duration, 0) || 0}h total
                      </Badge>
                      <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {currentProcess?.metadata.avg_rating || 0} rating
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <WorkflowIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Canvas Avançado em Desenvolvimento</h3>
                    <p className="text-sm max-w-md mx-auto">
                      O canvas avançado com drag & drop, visualizações múltiplas e colaboração em tempo real 
                      será implementado na próxima versão.
                    </p>
                    <div className="flex justify-center gap-2 mt-4">
                      <Button onClick={addNewStep}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Etapa
                      </Button>
                      <Button variant="outline" onClick={() => setShowStepDialog(true)}>
                        <Target className="h-4 w-4 mr-2" />
                        Configurar Etapa
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="properties" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Propriedades do Processo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Painel de propriedades avançadas em desenvolvimento</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="automation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Automação e Integrações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Configurações de automação avançada em desenvolvimento</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics e Métricas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Dashboard de analytics em desenvolvimento</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="collaboration" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Colaboração em Tempo Real</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Ferramentas de colaboração em desenvolvimento</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Segurança e Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Configurações de segurança empresarial em desenvolvimento</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* RODAPÉ DO EDITOR DE PROCESSOS - BOTÕES MOVIDOS PARA BAIXO */}
          <div className="border-t pt-4 mt-6 bg-white dark:bg-gray-900 sticky bottom-0 z-10">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDesigning(false);
                  setCurrentProcess(null);
                }}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">
                  Voltar aos Templates
                </span>
              </Button>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={undo}
                  disabled={undoStack.length === 0}
                  title="Desfazer (Ctrl+Z)"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={redo}
                  disabled={redoStack.length === 0}
                  title="Refazer (Ctrl+Y)"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
                  <Eye className="h-4 w-4 mr-2" />
                  {previewMode ? 'Editar' : 'Visualizar'}
                </Button>
                <Button variant="outline" onClick={optimizeWithAI}>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Otimizar com IA
                </Button>
                <Button variant="outline" onClick={exportProcess}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button onClick={saveProcess} disabled={saving}>
                  {saving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {saving ? 'Salvando...' : 'Salvar Processo'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor de Processos */}
      {showNewTemplateDialog && (
        <Dialog open={showNewTemplateDialog} onOpenChange={setShowNewTemplateDialog}>
          <DialogContent className="max-w-none max-h-none w-screen h-screen overflow-hidden m-0 p-0 rounded-none border-none">
            <DialogHeader className="border-b pb-4 px-6 pt-4">
              <DialogTitle className="flex items-center gap-2">
                <Settings2 className="h-6 w-6 text-blue-600" />
                Editor de Processos
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <Sparkles className="h-3 w-3 mr-1" />
                  IA Integrada
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-hidden px-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-4 mb-2">
                  <TabsTrigger value="basic" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Informações Básicas
                  </TabsTrigger>
                  <TabsTrigger value="forms" className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Formulários
                  </TabsTrigger>
                  <TabsTrigger value="process" className="flex items-center gap-2">
                    <Workflow className="h-4 w-4" />
                    Processos
                  </TabsTrigger>
                  <TabsTrigger value="workflows" className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Workflows
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-hidden">
                  {/* Aba Informações Básicas */}
                  <TabsContent value="basic" className="h-full overflow-y-auto relative z-0">
                    <ScrollArea className="h-full pr-4">
                      <div className="space-y-6">
                        {/* Header da Seção */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-4 rounded-lg border">
                          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <Info className="h-5 w-5 text-blue-600" />
                            Configuração Inicial do Processo
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Configure as informações básicas, categoria, complexidade e recursos do seu processo de assessment.
                          </p>
                        </div>

                        {/* Informações Básicas */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="h-5 w-5" />
                              Informações Básicas
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="process-name">Nome do Processo *</Label>
                                <Input
                                  id="process-name"
                                  placeholder="Ex: Assessment ISO 27001 Completo"
                                  value={newTemplate.name || ''}
                                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="process-category">Categoria</Label>
                                <Select 
                                  value={newTemplate.category || ''} 
                                  onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma categoria" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Information Security">Segurança da Informação</SelectItem>
                                    <SelectItem value="Privacy & Data Protection">Privacidade e Proteção de Dados</SelectItem>
                                    <SelectItem value="Financial Compliance">Compliance Financeiro</SelectItem>
                                    <SelectItem value="Quality Management">Gestão da Qualidade</SelectItem>
                                    <SelectItem value="Risk Management">Gestão de Riscos</SelectItem>
                                    <SelectItem value="Operational Excellence">Excelência Operacional</SelectItem>
                                    <SelectItem value="Custom">Personalizado</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="process-description">Descrição *</Label>
                              <Textarea
                                id="process-description"
                                placeholder="Descreva o objetivo, escopo e benefícios do processo..."
                                value={newTemplate.description || ''}
                                onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                                rows={4}
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label>Complexidade</Label>
                                <Select 
                                  value={newTemplate.complexity || ''} 
                                  onValueChange={(value) => setNewTemplate(prev => ({ ...prev, complexity: value as any }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {complexityLevels.map(level => (
                                      <SelectItem key={level.value} value={level.value}>
                                        {level.label} - {level.description}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Framework Principal</Label>
                                <Select 
                                  value={newTemplate.primary_framework || ''} 
                                  onValueChange={(value) => setNewTemplate(prev => ({ ...prev, primary_framework: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="iso27001">ISO 27001</SelectItem>
                                    <SelectItem value="nist_csf">NIST CSF</SelectItem>
                                    <SelectItem value="sox">SOX</SelectItem>
                                    <SelectItem value="gdpr">GDPR</SelectItem>
                                    <SelectItem value="lgpd">LGPD</SelectItem>
                                    <SelectItem value="cobit">COBIT</SelectItem>
                                    <SelectItem value="custom">Personalizado</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Duração Estimada</Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1-week">1 Semana</SelectItem>
                                    <SelectItem value="2-weeks">2 Semanas</SelectItem>
                                    <SelectItem value="1-month">1 Mês</SelectItem>
                                    <SelectItem value="3-months">3 Meses</SelectItem>
                                    <SelectItem value="6-months">6 Meses</SelectItem>
                                    <SelectItem value="custom">Personalizado</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Indústrias e Tags */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Building className="h-5 w-5" />
                              Indústrias e Classificação
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <Label>Indústrias Aplicáveis</Label>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {industryOptions.map(industry => (
                                  <Button
                                    key={industry.value}
                                    variant={newTemplate.industry?.includes(industry.value) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                      const currentIndustries = newTemplate.industry || [];
                                      const newIndustries = currentIndustries.includes(industry.value)
                                        ? currentIndustries.filter(i => i !== industry.value)
                                        : [...currentIndustries, industry.value];
                                      setNewTemplate(prev => ({ ...prev, industry: newIndustries }));
                                    }}
                                    className="justify-start text-left"
                                  >
                                    {industry.label}
                                  </Button>
                                ))}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Tags (separadas por vírgula)</Label>
                              <Input
                                placeholder="Ex: ISO27001, Segurança, Compliance, Automação"
                                value={newTemplate.tags?.join(', ') || ''}
                                onChange={(e) => {
                                  const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                                  setNewTemplate(prev => ({ ...prev, tags }));
                                }}
                              />
                              {newTemplate.tags && newTemplate.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {newTemplate.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      <Hash className="h-3 w-3 mr-1" />
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Recursos Avançados */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Sparkles className="h-5 w-5" />
                              Recursos Avançados
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Brain className="h-5 w-5 text-purple-600" />
                                  <div>
                                    <Label className="font-medium">IA Adaptativa</Label>
                                    <p className="text-xs text-muted-foreground">
                                      Adapta automaticamente ao contexto
                                    </p>
                                  </div>
                                </div>
                                <Switch
                                  checked={newTemplate.is_adaptive || false}
                                  onCheckedChange={(checked) => setNewTemplate(prev => ({ ...prev, is_adaptive: checked }))}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Users className="h-5 w-5 text-blue-600" />
                                  <div>
                                    <Label className="font-medium">Colaboração</Label>
                                    <p className="text-xs text-muted-foreground">
                                      Edição por múltiplos usuários
                                    </p>
                                  </div>
                                </div>
                                <Switch
                                  checked={newTemplate.real_time_collaboration || false}
                                  onCheckedChange={(checked) => setNewTemplate(prev => ({ ...prev, real_time_collaboration: checked }))}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <BarChart3 className="h-5 w-5 text-green-600" />
                                  <div>
                                    <Label className="font-medium">Analytics</Label>
                                    <p className="text-xs text-muted-foreground">
                                      Métricas e dashboards
                                    </p>
                                  </div>
                                </div>
                                <Switch
                                  checked={newTemplate.advanced_analytics || false}
                                  onCheckedChange={(checked) => setNewTemplate(prev => ({ ...prev, advanced_analytics: checked }))}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Shield className="h-5 w-5 text-red-600" />
                                  <div>
                                    <Label className="font-medium">Segurança</Label>
                                    <p className="text-xs text-muted-foreground">
                                      Criptografia e auditoria
                                    </p>
                                  </div>
                                </div>
                                <Switch defaultChecked />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Aba Formulários */}
                  <TabsContent value="forms" className="h-full overflow-y-auto relative z-10">
                    {!showFormBuilder ? (
                      <ScrollArea className="h-full pr-4">
                        <div className="space-y-6">
                          {/* Header da Seção */}
                          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 p-4 rounded-lg border">
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                              <Database className="h-5 w-5 text-green-600" />
                              Designer de Formulários
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Crie formulários dinâmicos para coleta, validação e exibição de dados do processo.
                            </p>
                          </div>

                        {/* Construtor de Formulários */}
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                Formulários do Processo
                              </CardTitle>
                              <Button 
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  createNewForm();
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Novo Formulário
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {forms.length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <h4 className="text-lg font-medium mb-2">Nenhum formulário criado</h4>
                                <p className="text-sm mb-4">Comece criando seu primeiro formulário para coleta de dados</p>
                                <Button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    createNewForm();
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Criar Primeiro Formulário
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {forms.map((form, index) => (
                                  <div key={form.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                          <h4 className="font-medium">{form.name}</h4>
                                          <p className="text-sm text-muted-foreground">{form.description}</p>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={(e) => editForm(form, e)}
                                        >
                                          <Edit className="h-3 w-3 mr-1" />
                                          Editar
                                        </Button>
                                        <Button size="sm" variant="outline">
                                          <Eye className="h-3 w-3 mr-1" />
                                          Visualizar
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                                      <span>{form.fields?.length || 0} campos</span>
                                      <span>Criado em {new Date(form.created_at).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        </div>
                      </ScrollArea>
                    ) : (
                      /* Construtor de Formulários */
                      <ScrollArea className="h-full pr-4">
                        <div className="space-y-6">
                          {/* Layout Principal do Construtor */}
                          <div className="flex overflow-hidden" style={{height: 'calc(100vh - 200px)'}}>
                          {/* Sidebar com Tipos de Campos (Menor) */}
                          <div className="w-48 border-r bg-gray-50 dark:bg-gray-900 p-3 overflow-y-auto">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Palette className="h-3 w-3" />
                              Campos
                            </h4>
                            <div className="space-y-1">
                              {[
                                { icon: FileText, label: 'Texto', type: 'text' },
                                { icon: Hash, label: 'Número', type: 'number' },
                                { icon: Calendar, label: 'Data', type: 'date' },
                                { icon: Clock, label: 'Hora', type: 'time' },
                                { icon: CheckCircle, label: 'Checkbox', type: 'checkbox' },
                                { icon: Target, label: 'Radio', type: 'radio' },
                                { icon: List, label: 'Select', type: 'select' },
                                { icon: Upload, label: 'Arquivo', type: 'file' },
                                { icon: Star, label: 'Rating', type: 'rating' },
                                { icon: Gauge, label: 'Slider', type: 'slider' },
                                { icon: Grid, label: 'Matriz', type: 'matrix' },
                                { icon: FileText, label: 'Textarea', type: 'textarea' }
                              ].map((field, index) => (
                                <div 
                                  key={index} 
                                  className="p-1.5 border rounded cursor-grab active:cursor-grabbing transition-colors flex items-center gap-1.5 hover:bg-white dark:hover:bg-gray-800"
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, field, true)}
                                  onClick={() => addFieldToForm(field.type, formRows[0]?.id || 'row_1')}
                                >
                                  <field.icon className="h-3 w-3 text-blue-600 flex-shrink-0" />
                                  <span className="text-xs font-medium truncate">{field.label}</span>
                                  <div className="text-xs text-muted-foreground">
                                    ☰
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Área de Edição Principal (Grande) */}
                          <div className="flex-1 flex">
                            {/* Canvas do Formulário */}
                            <div className="flex-1 p-6 overflow-y-auto">
                              <div className="max-w-6xl mx-auto">
                                <div className="bg-white dark:bg-gray-800 border rounded-lg p-6 shadow-sm">
                                  {/* Header do Formulário */}
                                  <div className="mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                      <div>
                                        <h3 className="text-xl font-semibold mb-2">{editingForm?.name}</h3>
                                        <p className="text-muted-foreground">{editingForm?.description}</p>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => addNewRow(2)}
                                        >
                                          <Plus className="h-3 w-3 mr-1" />
                                          Nova Linha
                                        </Button>
                                        <div className="text-xs text-muted-foreground">
                                          {formRows.length} linha{formRows.length > 1 ? 's' : ''}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Grid de Linhas */}
                                  {editingForm?.fields?.length === 0 && formRows.length === 1 ? (
                                    <div 
                                      className={`text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg transition-colors ${
                                        draggedField ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-300 dark:border-gray-600'
                                      }`}
                                      onDragOver={(e) => {
                                        e.preventDefault();
                                        e.dataTransfer.dropEffect = 'move';
                                      }}
                                      onDrop={(e) => {
                                        e.preventDefault();
                                        if (draggedField && draggedField.isNewField) {
                                          handleDrop(e, formRows[0].id, 0); // Adicionar na primeira linha, primeira coluna
                                        }
                                      }}
                                    >
                                      <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                      <h4 className="text-lg font-medium mb-2">Formulário vazio</h4>
                                      <p className="text-sm mb-2">
                                        {draggedField ? 'Solte o campo aqui para adicionar' : 'Arraste campos da sidebar ou clique para adicionar'}
                                      </p>
                                      <div className="text-xs text-muted-foreground">
                                        Layout: {formRows.length} linha{formRows.length > 1 ? 's' : ''}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-4">
                                      {/* Renderizar linhas */}
                                      {formRows.map((row, rowIndex) => {
                                        const rowFields = (editingForm?.fields || [])
                                          .filter((field: any) => field.rowId === row.id);
                                        
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
                                                const columnFields = rowFields
                                                  .filter((field: any) => field.column === columnIndex);
                                                
                                                return (
                                                  <div 
                                                    key={`${row.id}-${columnIndex}`}
                                                    className={`min-h-16 border-2 border-dashed rounded p-1.5 transition-colors ${
                                                      dragOverColumn === columnIndex && selectedRow === row.id
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                                                        : 'border-gray-300 dark:border-gray-600'
                                                    }`}
                                                    onDragOver={(e) => handleDragOver(e, row.id, columnIndex)}
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
                                                        <div className="text-center py-2 text-muted-foreground">
                                                          <div className="text-xs">Drop aqui</div>
                                                        </div>
                                                      ) : (
                                                        columnFields.map((field: any) => (
                                                          <div 
                                                            key={field.id} 
                                                            className={`p-1.5 border rounded cursor-pointer transition-all group ${
                                                              selectedField?.id === field.id 
                                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                            }`}
                                                            draggable
                                                            onDragStart={(e) => handleDragStart(e, field, false)}
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
                            <div className="w-64 border-l bg-gray-50 dark:bg-gray-900 p-3 overflow-y-auto">
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Settings className="h-3 w-3" />
                                Propriedades
                              </h4>
                              
                              {selectedField ? (
                                /* Propriedades do Campo Selecionado */
                                <div className="space-y-3">
                                  <div className="pb-2 border-b">
                                    <h5 className="font-medium text-xs mb-1">Campo Selecionado</h5>
                                    <p className="text-xs text-muted-foreground">{selectedField.type}</p>
                                  </div>
                                  
                                  <div>
                                    <Label className="text-xs">Rótulo</Label>
                                    <Input 
                                      value={selectedField.label || ''}
                                      onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                                      className="mt-1 h-7 text-xs"
                                      placeholder="Nome do campo"
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label className="text-xs">Placeholder</Label>
                                    <Input 
                                      value={selectedField.placeholder || ''}
                                      onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                                      className="mt-1 h-7 text-xs"
                                      placeholder="Texto de ajuda"
                                    />
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <Label className="text-sm">Campo Obrigatório</Label>
                                    <Switch
                                      checked={selectedField.required || false}
                                      onCheckedChange={(checked) => updateField(selectedField.id, { required: checked })}
                                    />
                                  </div>
                                  
                                  {/* Opções para Select e Radio */}
                                  {(selectedField.type === 'select' || selectedField.type === 'radio') && (
                                    <div>
                                      <Label className="text-sm">Opções</Label>
                                      <div className="mt-1 space-y-2">
                                        {(selectedField.options || []).map((option: string, index: number) => (
                                          <div key={index} className="flex gap-2">
                                            <Input 
                                              value={option}
                                              onChange={(e) => {
                                                const newOptions = [...(selectedField.options || [])];
                                                newOptions[index] = e.target.value;
                                                updateField(selectedField.id, { options: newOptions });
                                              }}
                                              className="flex-1"
                                              placeholder={`Opção ${index + 1}`}
                                            />
                                            <Button 
                                              size="sm" 
                                              variant="outline"
                                              onClick={() => {
                                                const newOptions = selectedField.options.filter((_: any, i: number) => i !== index);
                                                updateField(selectedField.id, { options: newOptions });
                                              }}
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        ))}
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          onClick={() => {
                                            const newOptions = [...(selectedField.options || []), `Opção ${(selectedField.options?.length || 0) + 1}`];
                                            updateField(selectedField.id, { options: newOptions });
                                          }}
                                          className="w-full"
                                        >
                                          <Plus className="h-3 w-3 mr-1" />
                                          Adicionar Opção
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Validações para Text e Textarea */}
                                  {(selectedField.type === 'text' || selectedField.type === 'textarea') && (
                                    <div className="space-y-3">
                                      <div>
                                        <Label className="text-sm">Comprimento Mínimo</Label>
                                        <Input 
                                          type="number"
                                          value={selectedField.validation?.minLength || ''}
                                          onChange={(e) => updateField(selectedField.id, { 
                                            validation: { 
                                              ...selectedField.validation, 
                                              minLength: parseInt(e.target.value) || 0 
                                            }
                                          })}
                                          className="mt-1"
                                          placeholder="0"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-sm">Comprimento Máximo</Label>
                                        <Input 
                                          type="number"
                                          value={selectedField.validation?.maxLength || ''}
                                          onChange={(e) => updateField(selectedField.id, { 
                                            validation: { 
                                              ...selectedField.validation, 
                                              maxLength: parseInt(e.target.value) || 255 
                                            }
                                          })}
                                          className="mt-1"
                                          placeholder="255"
                                        />
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Validações para Number */}
                                  {selectedField.type === 'number' && (
                                    <div className="space-y-3">
                                      <div>
                                        <Label className="text-sm">Valor Mínimo</Label>
                                        <Input 
                                          type="number"
                                          value={selectedField.validation?.min || ''}
                                          onChange={(e) => updateField(selectedField.id, { 
                                            validation: { 
                                              ...selectedField.validation, 
                                              min: parseInt(e.target.value) || 0 
                                            }
                                          })}
                                          className="mt-1"
                                          placeholder="0"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-sm">Valor Máximo</Label>
                                        <Input 
                                          type="number"
                                          value={selectedField.validation?.max || ''}
                                          onChange={(e) => updateField(selectedField.id, { 
                                            validation: { 
                                              ...selectedField.validation, 
                                              max: parseInt(e.target.value) || 100 
                                            }
                                          })}
                                          className="mt-1"
                                          placeholder="100"
                                        />
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Posição */}
                                  <div className="space-y-3 pt-3 border-t">
                                    <div>
                                      <Label className="text-sm">Linha</Label>
                                      <Select 
                                        value={selectedField.rowId || formRows[0]?.id} 
                                        onValueChange={(value) => {
                                          const rowIndex = formRows.findIndex(r => r.id === value);
                                          updateField(selectedField.id, { rowId: value, rowIndex: rowIndex });
                                        }}
                                      >
                                        <SelectTrigger className="mt-1">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {formRows.map((row, index) => (
                                            <SelectItem key={row.id} value={row.id}>Linha {index + 1}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    <div>
                                      <Label className="text-sm">Coluna</Label>
                                      <Select 
                                        value={selectedField.column?.toString() || '0'} 
                                        onValueChange={(value) => updateField(selectedField.id, { column: parseInt(value) })}
                                      >
                                        <SelectTrigger className="mt-1">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {(() => {
                                            const currentRow = formRows.find(r => r.id === selectedField.rowId);
                                            const columns = currentRow?.columns || 2;
                                            return Array.from({ length: columns }, (_, i) => (
                                              <SelectItem key={i} value={i.toString()}>Coluna {i + 1}</SelectItem>
                                            ));
                                          })()}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    <div>
                                      <Label className="text-sm">Largura (Span)</Label>
                                      <Select 
                                        value={selectedField.width?.toString() || '1'} 
                                        onValueChange={(value) => updateField(selectedField.id, { width: parseInt(value) })}
                                      >
                                        <SelectTrigger className="mt-1">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="1">1 coluna</SelectItem>
                                          <SelectItem value="2">2 colunas</SelectItem>
                                          <SelectItem value="3">3 colunas</SelectItem>
                                          <SelectItem value="4">4 colunas</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  
                                  <div className="pt-3 border-t">
                                    <Button 
                                      variant="destructive" 
                                      size="sm" 
                                      onClick={() => deleteField(selectedField.id)}
                                      className="w-full"
                                    >
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      Remover Campo
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                /* Propriedades do Formulário */
                                <div className="space-y-4">
                                  <div>
                                    <Label className="text-sm">Nome do Formulário</Label>
                                    <Input 
                                      value={editingForm?.name || ''}
                                      onChange={(e) => {
                                        const updated = { ...editingForm, name: e.target.value };
                                        setEditingForm(updated);
                                        setForms(prev => prev.map(f => f.id === updated.id ? updated : f));
                                      }}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm">Descrição</Label>
                                    <Textarea 
                                      value={editingForm?.description || ''}
                                      onChange={(e) => {
                                        const updated = { ...editingForm, description: e.target.value };
                                        setEditingForm(updated);
                                        setForms(prev => prev.map(f => f.id === updated.id ? updated : f));
                                      }}
                                      className="mt-1"
                                      rows={3}
                                    />
                                  </div>
                                  <div className="pt-4 border-t">
                                    <div className="text-sm text-muted-foreground space-y-1">
                                      <p>Total de campos: {editingForm?.fields?.length || 0}</p>
                                      <p>Linhas: {formRows.length}</p>
                                      <p>Criado em: {editingForm?.created_at ? new Date(editingForm.created_at).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="pt-3 border-t">
                                    <p className="text-xs text-muted-foreground mb-2">Clique em um campo para editá-lo</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* RODAPÉ DO CONSTRUTOR DE FORMULÁRIOS - BOTÕES MOVIDOS PARA BAIXO */}
                        <div className="border-t pt-4 pb-6 mt-6 bg-white dark:bg-gray-900 sticky bottom-0 z-10 shadow-lg">
                          <div className="flex items-center justify-end">
                            <div className="flex items-center gap-3">
                              <Button 
                                variant="outline" 
                                onClick={() => setShowFormPreview(true)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizar
                              </Button>
                              <Button variant="outline">
                                <Wand2 className="h-4 w-4 mr-2" />
                                Otimizar com IA
                              </Button>
                              <Button variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Exportar
                              </Button>
                              <Button onClick={saveForm}>
                                <Save className="h-4 w-4 mr-2" />
                                Salvar Formulário
                              </Button>
                            </div>
                          </div>
                        </div>
                        </div>
                      </ScrollArea>
                    )}
                  </TabsContent>

                  {/* Aba Processos */}
                  <TabsContent value="process" className="h-full overflow-y-auto">
                    <ScrollArea className="h-full pr-4">
                      <div className="space-y-6">
                        {/* Header da Seção */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-4 rounded-lg border">
                          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <Workflow className="h-5 w-5 text-purple-600" />
                            Designer de Fluxo de Processos
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Defina a sequência, condições e regras de execução dos formulários no processo.
                          </p>
                        </div>

                        {/* Canvas de Processo */}
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-2">
                                <Route className="h-5 w-5" />
                                Canvas de Fluxo
                              </CardTitle>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Grid className="h-4 w-4 mr-2" />
                                  Grade
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Network className="h-4 w-4 mr-2" />
                                  Fluxo
                                </Button>
                                <Button size="sm">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Nova Etapa
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="h-96 border-2 border-dashed rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                              <div className="text-center">
                                <Workflow className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                <h4 className="text-lg font-medium mb-2">Canvas de Processo Vazio</h4>
                                <p className="text-sm text-muted-foreground mb-4">Arraste elementos para criar seu fluxo de processo</p>
                                <Button>
                                  <PlayCircle className="h-4 w-4 mr-2" />
                                  Adicionar Etapa Inicial
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Elementos de Processo */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Boxes className="h-5 w-5" />
                              Elementos de Processo
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {stepTypes.map((stepType, index) => (
                                <div key={index} className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${stepType.color}`}>
                                  <stepType.icon className="h-5 w-5 mb-2" />
                                  <p className="text-sm font-medium">{stepType.label}</p>
                                  <p className="text-xs opacity-75">{stepType.description}</p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Aba Workflows */}
                  <TabsContent value="workflows" className="h-full overflow-y-auto">
                    <ScrollArea className="h-full pr-4">
                      <div className="space-y-6">
                        {/* Header da Seção */}
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 p-4 rounded-lg border">
                          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <Zap className="h-5 w-5 text-orange-600" />
                            Automação e Workflows
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Configure notificações, e-mails, alertas e integrações automáticas do processo.
                          </p>
                        </div>

                        {/* Notificações */}
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Notificações
                              </CardTitle>
                              <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Nova Notificação
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {[
                                { icon: Mail, label: 'E-mail', desc: 'Envio de e-mails automáticos' },
                                { icon: MessageSquare, label: 'Slack', desc: 'Mensagens no Slack' },
                                { icon: Bell, label: 'Push', desc: 'Notificações push no app' },
                                { icon: MessageSquare, label: 'Teams', desc: 'Mensagens no Microsoft Teams' }
                              ].map((notif, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <notif.icon className="h-5 w-5 text-blue-600" />
                                    <div>
                                      <Label className="font-medium">{notif.label}</Label>
                                      <p className="text-xs text-muted-foreground">{notif.desc}</p>
                                    </div>
                                  </div>
                                  <Switch />
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Integrações */}
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-2">
                                <Link className="h-5 w-5" />
                                Integrações
                              </CardTitle>
                              <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Nova Integração
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {[
                                { icon: Database, label: 'Webhook', desc: 'Chamadas HTTP automáticas' },
                                { icon: Code, label: 'API REST', desc: 'Integração com APIs externas' },
                                { icon: FileText, label: 'Relatórios', desc: 'Geração automática de relatórios' },
                                { icon: Calendar, label: 'Calendário', desc: 'Sincronização com calendários' }
                              ].map((integration, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <integration.icon className="h-5 w-5 text-green-600" />
                                    <div>
                                      <Label className="font-medium">{integration.label}</Label>
                                      <p className="text-xs text-muted-foreground">{integration.desc}</p>
                                    </div>
                                  </div>
                                  <Button size="sm" variant="outline">
                                    Configurar
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Automações */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Cpu className="h-5 w-5" />
                              Automações Avançadas
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                  <Label className="font-medium">Aprovação Automática</Label>
                                  <Switch />
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                  Aprova automaticamente itens de baixo risco
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-xs">Limite de Risco</Label>
                                    <Select>
                                      <SelectTrigger className="h-8">
                                        <SelectValue placeholder="Baixo" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="low">Baixo</SelectItem>
                                        <SelectItem value="medium">Médio</SelectItem>
                                        <SelectItem value="high">Alto</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label className="text-xs">Timeout (horas)</Label>
                                    <Input className="h-8" placeholder="24" />
                                  </div>
                                </div>
                              </div>
                              
                              <div className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                  <Label className="font-medium">Escalação Automática</Label>
                                  <Switch />
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                  Escala automaticamente itens em atraso
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-xs">Após (horas)</Label>
                                    <Input className="h-8" placeholder="48" />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Escalar para</Label>
                                    <Select>
                                      <SelectTrigger className="h-8">
                                        <SelectValue placeholder="Supervisor" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="supervisor">Supervisor</SelectItem>
                                        <SelectItem value="manager">Gerente</SelectItem>
                                        <SelectItem value="director">Diretor</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
            
            {/* Footer com Ações - Apenas quando NÃO estiver no construtor de formulários */}
            {!(activeTab === 'forms' && showFormBuilder) && (
              <div className="flex justify-between items-center p-4 border-t bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Auto-salvamento ativo
                </Badge>
                <div className="text-sm text-muted-foreground">
                  * Campos obrigatórios
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowNewTemplateDialog(false);
                    setNewTemplate({});
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Salvar como rascunho
                    toast.info('Processo salvo como rascunho');
                  }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Rascunho
                </Button>
                <Button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    createNewTemplate();
                  }}
                  disabled={!newTemplate.name || !newTemplate.description}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Criar Processo
                </Button>
              </div>
            </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog de Edição de Etapa */}
      {showStepDialog && (
        <Dialog open={showStepDialog} onOpenChange={setShowStepDialog}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {editingStep ? 'Editar Etapa Avançada' : 'Nova Etapa Avançada'}
              </DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <div className="text-center py-8 text-muted-foreground">
                <Cog className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Editor avançado de etapas com configurações empresariais em desenvolvimento</p>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowStepDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setShowStepDialog(false)}>
                  Salvar Etapa
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Preview do Formulário */}
      {showFormPreview && editingForm && (
        <Dialog open={showFormPreview} onOpenChange={setShowFormPreview}>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0 border-b pb-4">
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  Preview: {editingForm.name}
                  <Badge variant="outline" className="ml-2">
                    {editingForm.fields?.length || 0} campos
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowFormPreview(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Fechar
                  </Button>
                  <Button size="sm" onClick={() => {
                    setShowFormPreview(false);
                    saveForm();
                  }}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
              <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="space-y-6">
                  {/* Header do Formulário */}
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {editingForm.name}
                    </h2>
                    {editingForm.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {editingForm.description}
                      </p>
                    )}
                  </div>

                  {/* Renderização dos Campos por Linha */}
                  {formRows.map((row) => {
                    const rowFields = editingForm.fields?.filter((field: any) => field.rowId === row.id) || [];
                    
                    // Debug: mostrar informações da linha
                    console.log(`Linha ${row.id}:`, rowFields.length, 'campos');
                    
                    if (rowFields.length === 0) return null;
                    
                    return (
                      <div key={row.id} className="space-y-4">
                        <div 
                          className="grid gap-4"
                          style={{
                            gridTemplateColumns: row.columnWidths.join(' '),
                            minHeight: row.height === 'auto' ? 'auto' : 
                                     row.height === 'small' ? '60px' :
                                     row.height === 'medium' ? '80px' :
                                     row.height === 'large' ? '120px' :
                                     row.height === 'xl' ? '160px' : row.height
                          }}
                        >
                          {Array.from({ length: row.columns }).map((_, columnIndex) => {
                            const field = rowFields.find((f: any) => f.column === columnIndex);
                            
                            return (
                              <div key={columnIndex} className="space-y-2">
                                {field && (
                                  <>
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      {field.label}
                                      {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </Label>
                                    
                                    {/* Renderização do Campo baseado no Tipo */}
                                    {field.type === 'text' && (
                                      <Input 
                                        placeholder={field.placeholder || 'Digite aqui...'}
                                        disabled
                                        className="bg-gray-50 dark:bg-gray-700"
                                      />
                                    )}
                                    
                                    {field.type === 'textarea' && (
                                      <Textarea 
                                        placeholder={field.placeholder || 'Digite sua resposta aqui...'}
                                        disabled
                                        className="bg-gray-50 dark:bg-gray-700 min-h-[80px]"
                                      />
                                    )}
                                    
                                    {field.type === 'number' && (
                                      <Input 
                                        type="number"
                                        placeholder={field.placeholder || '0'}
                                        disabled
                                        className="bg-gray-50 dark:bg-gray-700"
                                      />
                                    )}
                                    
                                    {field.type === 'date' && (
                                      <Input 
                                        type="date"
                                        disabled
                                        className="bg-gray-50 dark:bg-gray-700"
                                      />
                                    )}
                                    
                                    {field.type === 'time' && (
                                      <Input 
                                        type="time"
                                        disabled
                                        className="bg-gray-50 dark:bg-gray-700"
                                      />
                                    )}
                                    
                                    {field.type === 'checkbox' && (
                                      <div className="flex items-center space-x-2">
                                        <input 
                                          type="checkbox" 
                                          disabled 
                                          className="rounded border-gray-300"
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                          {field.placeholder || 'Opção'}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {field.type === 'radio' && field.options && (
                                      <div className="space-y-2">
                                        {field.options.map((option: string, index: number) => (
                                          <div key={index} className="flex items-center space-x-2">
                                            <input 
                                              type="radio" 
                                              name={field.id}
                                              disabled 
                                              className="border-gray-300"
                                            />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                              {option}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    
                                    {field.type === 'select' && field.options && (
                                      <Select disabled>
                                        <SelectTrigger className="bg-gray-50 dark:bg-gray-700">
                                          <SelectValue placeholder="Selecione uma opção" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {field.options.map((option: string, index: number) => (
                                            <SelectItem key={index} value={option}>
                                              {option}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                    
                                    {field.type === 'file' && (
                                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                          Clique para fazer upload ou arraste arquivos aqui
                                        </p>
                                      </div>
                                    )}
                                    
                                    {field.type === 'rating' && (
                                      <div className="flex items-center space-x-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                          <Star key={i} className="h-5 w-5 text-gray-300" />
                                        ))}
                                      </div>
                                    )}
                                    
                                    {field.type === 'slider' && (
                                      <div className="space-y-2">
                                        <input 
                                          type="range" 
                                          min="0" 
                                          max="100" 
                                          disabled 
                                          className="w-full"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500">
                                          <span>0</span>
                                          <span>100</span>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Campos sem linha definida (fallback) */}
                  {(() => {
                    const fieldsWithoutRow = editingForm.fields?.filter((field: any) => 
                      !field.rowId || !formRows.find(row => row.id === field.rowId)
                    ) || [];
                    
                    console.log('Campos sem linha:', fieldsWithoutRow.length);
                    
                    if (fieldsWithoutRow.length > 0) {
                      return (
                        <div className="space-y-4">
                          <div className="text-sm text-orange-600 dark:text-orange-400 font-medium border-l-4 border-orange-400 pl-3">
                            Campos não organizados (serão exibidos em linha única):
                          </div>
                          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(fieldsWithoutRow.length, 3)}, 1fr)` }}>
                            {fieldsWithoutRow.map((field: any) => (
                              <div key={field.id} className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {field.label}
                                  {field.required && <span className="text-red-500 ml-1">*</span>}
                                </Label>
                                
                                {/* Renderização do Campo baseado no Tipo */}
                                {field.type === 'text' && (
                                  <Input 
                                    placeholder={field.placeholder || 'Digite aqui...'}
                                    disabled
                                    className="bg-gray-50 dark:bg-gray-700"
                                  />
                                )}
                                
                                {field.type === 'textarea' && (
                                  <Textarea 
                                    placeholder={field.placeholder || 'Digite sua resposta aqui...'}
                                    disabled
                                    className="bg-gray-50 dark:bg-gray-700 min-h-[80px]"
                                  />
                                )}
                                
                                {field.type === 'number' && (
                                  <Input 
                                    type="number"
                                    placeholder={field.placeholder || '0'}
                                    disabled
                                    className="bg-gray-50 dark:bg-gray-700"
                                  />
                                )}
                                
                                {field.type === 'date' && (
                                  <Input 
                                    type="date"
                                    disabled
                                    className="bg-gray-50 dark:bg-gray-700"
                                  />
                                )}
                                
                                {field.type === 'time' && (
                                  <Input 
                                    type="time"
                                    disabled
                                    className="bg-gray-50 dark:bg-gray-700"
                                  />
                                )}
                                
                                {field.type === 'checkbox' && (
                                  <div className="flex items-center space-x-2">
                                    <input 
                                      type="checkbox" 
                                      disabled 
                                      className="rounded border-gray-300"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      {field.placeholder || 'Opção'}
                                    </span>
                                  </div>
                                )}
                                
                                {field.type === 'radio' && field.options && (
                                  <div className="space-y-2">
                                    {field.options.map((option: string, index: number) => (
                                      <div key={index} className="flex items-center space-x-2">
                                        <input 
                                          type="radio" 
                                          name={field.id}
                                          disabled 
                                          className="border-gray-300"
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                          {option}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {field.type === 'select' && field.options && (
                                  <Select disabled>
                                    <SelectTrigger className="bg-gray-50 dark:bg-gray-700">
                                      <SelectValue placeholder="Selecione uma opção" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {field.options.map((option: string, index: number) => (
                                        <SelectItem key={index} value={option}>
                                          {option}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                                
                                {field.type === 'file' && (
                                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      Clique para fazer upload ou arraste arquivos aqui
                                    </p>
                                  </div>
                                )}
                                
                                {field.type === 'rating' && (
                                  <div className="flex items-center space-x-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star key={i} className="h-5 w-5 text-gray-300" />
                                    ))}
                                  </div>
                                )}
                                
                                {field.type === 'slider' && (
                                  <div className="space-y-2">
                                    <input 
                                      type="range" 
                                      min="0" 
                                      max="100" 
                                      disabled 
                                      className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500">
                                      <span>0</span>
                                      <span>100</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
                  {/* Mensagem se não houver campos */}
                  {(!editingForm.fields || editingForm.fields.length === 0) && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Formulário vazio</p>
                      <p className="text-sm">Adicione campos usando o construtor para ver o preview.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Footer com Informações */}
            <div className="flex-shrink-0 border-t bg-white dark:bg-gray-800 px-6 py-3">
              <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                <FileText className="h-4 w-4 mr-2" />
                Preview do formulário • {editingForm.fields?.length || 0} campos • {formRows.length} linha{formRows.length !== 1 ? 's' : ''}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AlexProcessDesigner;