import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Brain, 
  Target, 
  Users, 
  Calendar, 
  DollarSign,
  FileText,
  AlertTriangle,
  Lightbulb,
  Zap,
  Bot,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
// DatePicker component not available - will use Input for dates
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AuditPlanData {
  // Basic Information
  title: string;
  description: string;
  audit_type: string;
  audit_scope: string;
  scope_description: string;
  
  // Priority and Frequency
  priority: string;
  frequency: string;
  is_recurring: boolean;
  
  // Team
  lead_auditor: string;
  auditors: string[];
  auditee_contacts: string[];
  
  // Dates
  planned_start_date: Date | null;
  planned_end_date: Date | null;
  
  // Objectives and Criteria
  objectives: string[];
  audit_criteria: string[];
  applicable_regulations: string[];
  applicable_standards: string[];
  
  // Budget
  budgeted_hours: number;
  estimated_cost: number;
  
  // AI Configuration
  ai_assistant_enabled: boolean;
  automation_level: string;
}

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
}

interface AIRecommendation {
  type: 'suggestion' | 'warning' | 'enhancement';
  title: string;
  description: string;
  action?: string;
}

const AuditPlanningWizard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  
  const [formData, setFormData] = useState<AuditPlanData>({
    title: '',
    description: '',
    audit_type: '',
    audit_scope: '',
    scope_description: '',
    priority: '',
    frequency: '',
    is_recurring: false,
    lead_auditor: '',
    auditors: [],
    auditee_contacts: [],
    planned_start_date: null,
    planned_end_date: null,
    objectives: [],
    audit_criteria: [],
    applicable_regulations: [],
    applicable_standards: [],
    budgeted_hours: 0,
    estimated_cost: 0,
    ai_assistant_enabled: true,
    automation_level: 'Medium'
  });

  const steps: Step[] = [
    {
      id: 'basic',
      title: 'Informações Básicas',
      description: 'Defina o tipo, escopo e descrição da auditoria',
      icon: FileText,
      completed: false
    },
    {
      id: 'objectives',
      title: 'Objetivos e Critérios',
      description: 'Estabeleça objetivos e critérios de auditoria',
      icon: Target,
      completed: false
    },
    {
      id: 'team',
      title: 'Equipe e Cronograma',
      description: 'Defina a equipe e datas de execução',
      icon: Users,
      completed: false
    },
    {
      id: 'budget',
      title: 'Orçamento e Recursos',
      description: 'Estime custos e recursos necessários',
      icon: DollarSign,
      completed: false
    },
    {
      id: 'ai-config',
      title: 'Configuração de IA',
      description: 'Configure automações e assistência de IA',
      icon: Brain,
      completed: false
    },
    {
      id: 'review',
      title: 'Revisão e Confirmação',
      description: 'Revise todas as informações antes de criar',
      icon: Check,
      completed: false
    }
  ];

  const auditTypes = [
    'Internal Audit',
    'External Audit',
    'Financial Audit',
    'IT Audit',
    'Compliance Audit',
    'Operational Audit',
    'ESG Audit',
    'AI/ML Audit',
    'Cybersecurity Audit'
  ];

  const auditScopes = [
    'Organization-wide',
    'Department Specific',
    'Process Specific',
    'System Specific',
    'Location Specific',
    'Project Specific',
    'Custom'
  ];

  const priorities = ['Critical', 'High', 'Medium', 'Low'];
  const frequencies = ['Ad-hoc', 'Annual', 'Semi-annual', 'Quarterly', 'Monthly', 'Continuous'];
  const automationLevels = ['Low', 'Medium', 'High', 'Full'];

  // Mock users for team selection
  const availableAuditors = [
    { id: '1', name: 'Ana Silva', role: 'Senior Auditor' },
    { id: '2', name: 'Carlos Mendes', role: 'IT Auditor' },
    { id: '3', name: 'Marina Costa', role: 'Compliance Auditor' },
    { id: '4', name: 'Roberto Santos', role: 'Financial Auditor' }
  ];

  // AI Analysis trigger
  useEffect(() => {
    if (currentStep === 1 && formData.audit_type && formData.audit_scope) {
      triggerAIAnalysis();
    }
  }, [currentStep, formData.audit_type, formData.audit_scope]);

  const triggerAIAnalysis = async () => {
    setAiAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const recommendations: AIRecommendation[] = [];
    
    if (formData.audit_type === 'IT Audit') {
      recommendations.push({
        type: 'suggestion',
        title: 'Frameworks Recomendados',
        description: 'Para auditoria de TI, recomendo incluir COBIT 5, NIST Cybersecurity Framework e ISO 27001.',
        action: 'Adicionar frameworks'
      });
      
      recommendations.push({
        type: 'enhancement',
        title: 'Automação Avançada',
        description: 'Este tipo de auditoria se beneficia de automação alta para testes de controles de acesso.',
        action: 'Configurar automação'
      });
    }
    
    if (formData.audit_scope === 'Organization-wide') {
      recommendations.push({
        type: 'warning',
        title: 'Escopo Amplo',
        description: 'Escopo organizacional requer equipe maior e maior orçamento. Considere segmentar em fases.',
        action: 'Revisar escopo'
      });
    }

    recommendations.push({
      type: 'suggestion',
      title: 'Objetivos Sugeridos',
      description: 'Baseado no tipo de auditoria, sugiro incluir avaliação de controles internos e conformidade regulatória.',
      action: 'Aplicar sugestões'
    });

    setAiRecommendations(recommendations);
    setAiAnalyzing(false);
  };

  const updateFormData = (field: keyof AuditPlanData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addToArray = (field: keyof AuditPlanData, value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()]
      }));
    }
  };

  const removeFromArray = (field: keyof AuditPlanData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const validateStep = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Basic Information
        return !!(formData.title && formData.audit_type && formData.audit_scope && formData.priority);
      case 1: // Objectives
        return formData.objectives.length > 0 && formData.audit_criteria.length > 0;
      case 2: // Team and Schedule
        return !!(formData.lead_auditor && formData.planned_start_date && formData.planned_end_date);
      case 3: // Budget
        return formData.budgeted_hours > 0;
      case 4: // AI Config
        return true; // Always valid as it has defaults
      case 5: // Review
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
      toast({
        title: 'Campos Obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios antes de continuar.',
        variant: 'destructive'
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast({
        title: 'Erro de Validação',
        description: 'Por favor, verifique todos os campos obrigatórios.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Auditoria Criada com Sucesso!',
        description: 'A auditoria foi criada e está pronta para execução.',
      });
      
      navigate('/audit');
    } catch (error) {
      toast({
        title: 'Erro ao Criar Auditoria',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyAIRecommendation = (recommendation: AIRecommendation) => {
    if (recommendation.action === 'Adicionar frameworks') {
      updateFormData('applicable_standards', [...formData.applicable_standards, 'COBIT 5', 'NIST Cybersecurity Framework', 'ISO 27001']);
    } else if (recommendation.action === 'Configurar automação') {
      updateFormData('automation_level', 'High');
    } else if (recommendation.action === 'Aplicar sugestões') {
      const suggestedObjectives = ['Avaliar eficácia dos controles internos', 'Verificar conformidade regulatória', 'Identificar oportunidades de melhoria'];
      updateFormData('objectives', [...formData.objectives, ...suggestedObjectives]);
    }
    
    toast({
      title: 'Recomendação Aplicada',
      description: 'As sugestões de IA foram incorporadas ao plano de auditoria.',
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">
                Título da Auditoria *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                placeholder="Ex: Auditoria de Controles Internos SOX 2025"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Descrição
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Descreva o propósito e contexto da auditoria..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Tipo de Auditoria *</Label>
                <Select value={formData.audit_type} onValueChange={(value) => updateFormData('audit_type', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {auditTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Escopo *</Label>
                <Select value={formData.audit_scope} onValueChange={(value) => updateFormData('audit_scope', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o escopo" />
                  </SelectTrigger>
                  <SelectContent>
                    {auditScopes.map(scope => (
                      <SelectItem key={scope} value={scope}>{scope}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="scope_description" className="text-sm font-medium">
                Descrição do Escopo
              </Label>
              <Textarea
                id="scope_description"
                value={formData.scope_description}
                onChange={(e) => updateFormData('scope_description', e.target.value)}
                placeholder="Detalhe o escopo específico da auditoria..."
                className="mt-1"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Prioridade *</Label>
                <Select value={formData.priority} onValueChange={(value) => updateFormData('priority', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(priority => (
                      <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Frequência</Label>
                <Select value={formData.frequency} onValueChange={(value) => updateFormData('frequency', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map(frequency => (
                      <SelectItem key={frequency} value={frequency}>{frequency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_recurring"
                checked={formData.is_recurring}
                onCheckedChange={(checked) => updateFormData('is_recurring', checked)}
              />
              <Label htmlFor="is_recurring" className="text-sm">
                Auditoria recorrente
              </Label>
            </div>
          </div>
        );

      case 1: // Objectives and Criteria
        return (
          <div className="space-y-6">
            {/* AI Recommendations */}
            {aiAnalyzing && (
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-purple-600 animate-pulse" />
                    <span className="text-purple-800 font-medium">
                      Alex Audit analisando requisitos...
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {aiRecommendations.length > 0 && (
              <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <Sparkles className="h-5 w-5" />
                    Recomendações de IA
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiRecommendations.map((rec, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded-lg bg-white border border-purple-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {rec.type === 'suggestion' && <Lightbulb className="h-4 w-4 text-blue-600" />}
                            {rec.type === 'warning' && <AlertTriangle className="h-4 w-4 text-orange-600" />}
                            {rec.type === 'enhancement' && <Zap className="h-4 w-4 text-purple-600" />}
                            <span className="font-medium text-gray-900">{rec.title}</span>
                          </div>
                          <p className="text-sm text-gray-600">{rec.description}</p>
                        </div>
                        {rec.action && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => applyAIRecommendation(rec)}
                            className="ml-3 border-purple-200 text-purple-700 hover:bg-purple-50"
                          >
                            Aplicar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Objectives */}
            <div>
              <Label className="text-sm font-medium">Objetivos da Auditoria *</Label>
              <div className="mt-2 space-y-2">
                {formData.objectives.map((obj, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="outline" className="flex-1 justify-start p-2">
                      {obj}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromArray('objectives', index)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar objetivo..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('objectives', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Adicionar objetivo..."]') as HTMLInputElement;
                      if (input?.value) {
                        addToArray('objectives', input.value);
                        input.value = '';
                      }
                    }}
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>

            {/* Audit Criteria */}
            <div>
              <Label className="text-sm font-medium">Critérios de Auditoria *</Label>
              <div className="mt-2 space-y-2">
                {formData.audit_criteria.map((criteria, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="outline" className="flex-1 justify-start p-2">
                      {criteria}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromArray('audit_criteria', index)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar critério..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('audit_criteria', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Adicionar critério..."]') as HTMLInputElement;
                      if (input?.value) {
                        addToArray('audit_criteria', input.value);
                        input.value = '';
                      }
                    }}
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>

            {/* Standards and Regulations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Normas Aplicáveis</Label>
                <div className="mt-2 space-y-2">
                  {formData.applicable_standards.map((standard, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline" className="flex-1 justify-start p-2">
                        {standard}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromArray('applicable_standards', index)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Input
                    placeholder="Adicionar norma..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('applicable_standards', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Regulamentações</Label>
                <div className="mt-2 space-y-2">
                  {formData.applicable_regulations.map((regulation, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline" className="flex-1 justify-start p-2">
                        {regulation}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromArray('applicable_regulations', index)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Input
                    placeholder="Adicionar regulamentação..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('applicable_regulations', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Team and Schedule
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium">Auditor Líder *</Label>
              <Select value={formData.lead_auditor} onValueChange={(value) => updateFormData('lead_auditor', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o auditor líder" />
                </SelectTrigger>
                <SelectContent>
                  {availableAuditors.map(auditor => (
                    <SelectItem key={auditor.id} value={auditor.id}>
                      {auditor.name} - {auditor.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Equipe de Auditoria</Label>
              <div className="mt-2 space-y-2">
                {formData.auditors.map((auditorId, index) => {
                  const auditor = availableAuditors.find(a => a.id === auditorId);
                  return auditor ? (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline" className="flex-1 justify-start p-2">
                        {auditor.name} - {auditor.role}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromArray('auditors', index)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        ×
                      </Button>
                    </div>
                  ) : null;
                })}
                <Select onValueChange={(value) => {
                  if (!formData.auditors.includes(value)) {
                    updateFormData('auditors', [...formData.auditors, value]);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Adicionar auditor à equipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAuditors
                      .filter(auditor => !formData.auditors.includes(auditor.id) && auditor.id !== formData.lead_auditor)
                      .map(auditor => (
                        <SelectItem key={auditor.id} value={auditor.id}>
                          {auditor.name} - {auditor.role}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Data de Início *</Label>
                <Input
                  type="date"
                  value={formData.planned_start_date ? formData.planned_start_date.toISOString().split('T')[0] : ''}
                  onChange={(e) => updateFormData('planned_start_date', e.target.value ? new Date(e.target.value) : null)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Data de Término *</Label>
                <Input
                  type="date"
                  value={formData.planned_end_date ? formData.planned_end_date.toISOString().split('T')[0] : ''}
                  onChange={(e) => updateFormData('planned_end_date', e.target.value ? new Date(e.target.value) : null)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      case 3: // Budget and Resources
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budgeted_hours" className="text-sm font-medium">
                  Horas Orçadas *
                </Label>
                <Input
                  id="budgeted_hours"
                  type="number"
                  value={formData.budgeted_hours || ''}
                  onChange={(e) => updateFormData('budgeted_hours', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 120"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="estimated_cost" className="text-sm font-medium">
                  Custo Estimado (R$)
                </Label>
                <Input
                  id="estimated_cost"
                  type="number"
                  value={formData.estimated_cost || ''}
                  onChange={(e) => updateFormData('estimated_cost', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 50000"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Resource Estimation AI */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Brain className="h-5 w-5" />
                  Estimativa Inteligente de Recursos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Baseado no tipo e escopo:</span>
                    <span className="font-medium">80-150 horas</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Custo estimado:</span>
                    <span className="font-medium">R$ 40.000 - R$ 75.000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Duração sugerida:</span>
                    <span className="font-medium">6-8 semanas</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      updateFormData('budgeted_hours', 120);
                      updateFormData('estimated_cost', 60000);
                    }}
                    className="border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    Aplicar Estimativa de IA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4: // AI Configuration
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Assistente de IA Habilitado</Label>
                <p className="text-xs text-gray-600 mt-1">
                  Ative o Alex Audit para suporte inteligente durante a auditoria
                </p>
              </div>
              <Switch
                checked={formData.ai_assistant_enabled}
                onCheckedChange={(checked) => updateFormData('ai_assistant_enabled', checked)}
              />
            </div>

            {formData.ai_assistant_enabled && (
              <>
                <div>
                  <Label className="text-sm font-medium">Nível de Automação</Label>
                  <Select value={formData.automation_level} onValueChange={(value) => updateFormData('automation_level', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {automationLevels.map(level => (
                        <SelectItem key={level} value={level}>
                          {level} - {
                            level === 'Low' ? 'Sugestões básicas' :
                            level === 'Medium' ? 'Automação de procedimentos simples' :
                            level === 'High' ? 'Automação avançada com validação' :
                            'Automação completa com supervisão mínima'
                          }
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-800">
                      <Sparkles className="h-5 w-5" />
                      Recursos de IA Incluídos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Geração automática de procedimentos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Análise inteligente de evidências</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Detecção automatizada de achados</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Sugestões de recomendações</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Preenchimento automático de papéis de trabalho</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        );

      case 5: // Review
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Título:</span>
                    <span className="font-medium">{formData.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium">{formData.audit_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Escopo:</span>
                    <span className="font-medium">{formData.audit_scope}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prioridade:</span>
                    <span className="font-medium">{formData.priority}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cronograma e Equipe</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Início:</span>
                    <span className="font-medium">
                      {formData.planned_start_date?.toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Término:</span>
                    <span className="font-medium">
                      {formData.planned_end_date?.toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Auditor Líder:</span>
                    <span className="font-medium">
                      {availableAuditors.find(a => a.id === formData.lead_auditor)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Equipe:</span>
                    <span className="font-medium">{formData.auditors.length} membros</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Objetivos e Critérios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Objetivos:</span>
                    <span className="font-medium">{formData.objectives.length} definidos</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Critérios:</span>
                    <span className="font-medium">{formData.audit_criteria.length} definidos</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Normas:</span>
                    <span className="font-medium">{formData.applicable_standards.length} aplicáveis</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Regulamentações:</span>
                    <span className="font-medium">{formData.applicable_regulations.length} aplicáveis</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recursos e IA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Horas Orçadas:</span>
                    <span className="font-medium">{formData.budgeted_hours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Custo Estimado:</span>
                    <span className="font-medium">
                      R$ {formData.estimated_cost.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IA Habilitada:</span>
                    <span className="font-medium">
                      {formData.ai_assistant_enabled ? 'Sim' : 'Não'}
                    </span>
                  </div>
                  {formData.ai_assistant_enabled && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Automação:</span>
                      <span className="font-medium">{formData.automation_level}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/audit')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Nova Auditoria</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Crie uma nova auditoria com assistência de IA
          </p>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              Passo {currentStep + 1} de {steps.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progress)}% concluído
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1 sm:gap-2 mt-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col items-center p-1 sm:p-2 rounded-lg text-center transition-colors",
                  index === currentStep
                    ? "bg-primary/10 border-2 border-primary/20"
                    : index < currentStep
                    ? "bg-muted border-2 border-border"
                    : "bg-muted/50 border-2 border-border"
                )}
              >
                <step.icon className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5 mb-1",
                  index === currentStep
                    ? "text-blue-600"
                    : index < currentStep
                    ? "text-green-600"
                    : "text-gray-400"
                )} />
                <span className={cn(
                  "text-[10px] sm:text-xs font-medium truncate max-w-full",
                  index === currentStep
                    ? "text-blue-800"
                    : index < currentStep
                    ? "text-green-800"
                    : "text-gray-600"
                )}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(steps[currentStep].icon, { className: "h-5 w-5" })}
            {steps[currentStep].title}
          </CardTitle>
          <CardDescription>
            {steps[currentStep].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex flex-col xs:flex-row items-center justify-between gap-3 xs:gap-0">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>

        <div className="flex gap-2">
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Criar Auditoria
                </>
              )}
            </Button>
          ) : (
            <Button onClick={nextStep}>
              Próximo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditPlanningWizard;