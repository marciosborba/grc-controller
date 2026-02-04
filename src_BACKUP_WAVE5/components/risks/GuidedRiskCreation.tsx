import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search,
  AlertTriangle,
  Brain,
  Target,
  Shield,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Save,
  Eye,
  Lightbulb,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  Plus,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth} from '@/contexts/AuthContextOptimized';
import { useToast } from '@/hooks/use-toast';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import { AIRiskRegistrationWizard } from '../ai/AIRiskRegistrationWizard';

interface RiskFormData {
  // Step 1: Identification
  title: string;
  description: string;
  source: string;
  category: string;
  
  // Step 2: Context
  business_context: string;
  stakeholders: string[];
  affected_processes: string[];
  
  // Step 3: Analysis
  probability: number;
  impact: number;
  vulnerability: number;
  existing_controls: string[];
  
  // Step 4: Classification
  risk_level: string;
  priority: string;
  owner: string;
  
  // Step 5: Treatment Strategy
  treatment_strategy: string;
  treatment_rationale: string;
  target_date: string;
  budget_required: number;
}

interface FormStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  fields: string[];
  validation: (data: RiskFormData) => string[];
}

export const GuidedRiskCreation: React.FC<{ onComplete?: (riskId: string) => void }> = ({ onComplete }) => {
  const { tenantSettings } = useTenantSettings();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<RiskFormData>({
    title: '',
    description: '',
    source: '',
    category: '',
    business_context: '',
    stakeholders: [],
    affected_processes: [],
    probability: 3,
    impact: 3,
    vulnerability: 3,
    existing_controls: [],
    risk_level: '',
    priority: 'medium',
    owner: '',
    treatment_strategy: '',
    treatment_rationale: '',
    target_date: '',
    budget_required: 0
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAIWizard, setShowAIWizard] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  const steps: FormStep[] = [
    {
      id: 'identification',
      title: 'Identificação do Risco',
      description: 'Descreva o risco identificado de forma clara e objetiva',
      icon: Search,
      fields: ['title', 'description', 'source', 'category'],
      validation: (data) => {
        const errors = [];
        if (!data.title.trim()) errors.push('Título é obrigatório');
        if (!data.description.trim()) errors.push('Descrição é obrigatória');
        if (!data.category) errors.push('Categoria é obrigatória');
        return errors;
      }
    },
    {
      id: 'context',
      title: 'Contexto do Negócio',
      description: 'Defina o contexto e as partes interessadas afetadas',
      icon: Users,
      fields: ['business_context', 'stakeholders', 'affected_processes'],
      validation: (data) => {
        const errors = [];
        if (!data.business_context.trim()) errors.push('Contexto do negócio é obrigatório');
        if (data.stakeholders.length === 0) errors.push('Pelo menos um stakeholder deve ser definido');
        return errors;
      }
    },
    {
      id: 'analysis',
      title: 'Análise do Risco',
      description: 'Avalie a probabilidade, impacto e vulnerabilidade',
      icon: Brain,
      fields: ['probability', 'impact', 'vulnerability', 'existing_controls'],
      validation: (data) => {
        const errors = [];
        if (data.probability < 1 || data.probability > 5) errors.push('Probabilidade deve estar entre 1 e 5');
        if (data.impact < 1 || data.impact > 5) errors.push('Impacto deve estar entre 1 e 5');
        return errors;
      }
    },
    {
      id: 'classification',
      title: 'Classificação',
      description: 'Classifique o risco e defina responsabilidades',
      icon: Target,
      fields: ['risk_level', 'priority', 'owner'],
      validation: (data) => {
        const errors = [];
        if (!data.owner.trim()) errors.push('Responsável pelo risco é obrigatório');
        return errors;
      }
    },
    {
      id: 'treatment',
      title: 'Estratégia de Tratamento',
      description: 'Defina como o risco será tratado',
      icon: Shield,
      fields: ['treatment_strategy', 'treatment_rationale', 'target_date', 'budget_required'],
      validation: (data) => {
        const errors = [];
        if (!data.treatment_strategy) errors.push('Estratégia de tratamento é obrigatória');
        if (!data.treatment_rationale.trim()) errors.push('Justificativa é obrigatória');
        return errors;
      }
    }
  ];

  useEffect(() => {
    fetchTemplates();
    calculateRiskLevel();
  }, [formData.probability, formData.impact, formData.vulnerability]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('risk_library_templates')
        .select('*')
        .eq('is_public', true)
        .limit(5);

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar templates:', error);
    }
  };

  const calculateRiskLevel = () => {
    const score = (formData.probability * formData.impact * formData.vulnerability) / 5;
    const isMatrix4x4 = tenantSettings?.risk_matrix?.type === '4x4';
    let level = '';
    
    if (isMatrix4x4) {
      // Matriz 4x4: Baixo (1-2), Médio (3-6), Alto (7-12), Crítico (13-16)
      if (score >= 13) level = 'Crítico';
      else if (score >= 7) level = 'Alto';
      else if (score >= 3) level = 'Médio';
      else level = 'Baixo';
    } else {
      // Matriz 5x5: Muito Baixo (1-2), Baixo (3-4), Médio (5-8), Alto (9-19), Muito Alto (20-25)
      if (score >= 20) level = 'Muito Alto';
      else if (score >= 9) level = 'Alto';
      else if (score >= 5) level = 'Médio';
      else if (score >= 3) level = 'Baixo';
      else level = 'Muito Baixo';
    }
    
    setFormData(prev => ({ ...prev, risk_level: level }));
  };

  const validateCurrentStep = (): boolean => {
    const currentStepData = steps[currentStep];
    const errors = currentStepData.validation(formData);
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setValidationErrors([]);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setValidationErrors([]);
    }
  };

  const saveRisk = async () => {
    if (!validateCurrentStep()) return;

    setLoading(true);
    try {
      const riskData = {
        title: formData.title,
        description: formData.description,
        risk_category: formData.category,
        probability: formData.probability,
        impact_score: formData.impact,
        likelihood_score: formData.probability,
        vulnerability_score: formData.vulnerability,
        risk_level: formData.risk_level,
        status: 'open',
        source: formData.source,
        business_context: formData.business_context,
        stakeholders: formData.stakeholders,
        affected_processes: formData.affected_processes,
        existing_controls: formData.existing_controls,
        priority: formData.priority,
        assigned_to: formData.owner,
        treatment_strategy: formData.treatment_strategy,
        treatment_rationale: formData.treatment_rationale,
        target_date: formData.target_date || null,
        budget_required: formData.budget_required,
        created_by: user?.id,
        tenant_id: user?.tenant_id
      };

      const { data, error } = await supabase
        .from('risk_assessments')
        .insert([riskData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Risco Criado',
        description: `Risco "${formData.title}" criado com sucesso`,
      });

      if (onComplete) {
        onComplete(data.id);
      }
    } catch (error: any) {
      console.error('Erro ao salvar risco:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao criar risco',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const useTemplate = (template: any) => {
    setFormData({
      ...formData,
      title: template.name,
      description: template.description,
      category: template.category,
      probability: template.probability || 3,
      impact: template.impact || 3,
      vulnerability: template.vulnerability || 3,
      existing_controls: template.controls || [],
      treatment_strategy: template.treatment_strategy || ''
    });
    setShowTemplates(false);
    toast({
      title: 'Template Aplicado',
      description: `Template "${template.name}" aplicado com sucesso`,
    });
  };

  const addArrayItem = (field: keyof RiskFormData, value: string) => {
    if (value.trim()) {
      const currentArray = formData[field] as string[];
      setFormData({
        ...formData,
        [field]: [...currentArray, value.trim()]
      });
    }
  };

  const removeArrayItem = (field: keyof RiskFormData, index: number) => {
    const currentArray = formData[field] as string[];
    setFormData({
      ...formData,
      [field]: currentArray.filter((_, i) => i !== index)
    });
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  // Show AI Wizard if requested
  if (showAIWizard) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2 mb-4">
          <Button variant="outline" onClick={() => setShowAIWizard(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Formulário Manual
          </Button>
        </div>
        <AIRiskRegistrationWizard 
          onComplete={(riskData, riskId) => {
            if (onComplete && riskId) {
              onComplete(riskId);
            }
            setShowAIWizard(false);
          }}
          onClose={() => setShowAIWizard(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate flex items-center space-x-2">
            <Plus className="h-8 w-8 text-primary" />
            <span>Criar Novo Risco</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Processo guiado para identificação e registro de riscos corporativos
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowAIWizard(true)}
            className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100"
          >
            <Brain className="h-4 w-4 mr-2 text-purple-600" />
            ALEX RISK
          </Button>
          
          <Button variant="outline" onClick={() => setShowTemplates(!showTemplates)}>
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </Button>
          
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Prévia
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Progresso: Etapa {currentStep + 1} de {steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            
            <div className="flex justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex flex-col items-center space-y-1">
                    <div className={`p-2 rounded-full ${
                      index < currentStep ? 'bg-green-100 text-green-600' :
                      index === currentStep ? 'bg-primary/10 text-primary' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs text-center max-w-16 truncate">
                      {step.title.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Panel */}
      {showTemplates && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Templates Disponíveis</span>
              <Button size="sm" variant="outline" onClick={() => setShowTemplates(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-all"
                  onClick={() => useTemplate(template)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{template.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span>Nível: {template.risk_level}</span>
                    <span>⭐ {template.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Step Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <StepIcon className="h-5 w-5" />
            <span>{currentStepData.title}</span>
          </CardTitle>
          <p className="text-muted-foreground">{currentStepData.description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Corrija os seguintes erros:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Step 1: Identification */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título do Risco *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Falha no sistema de pagamentos"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição Detalhada *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Descreva o risco de forma clara e objetiva..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Operacional">Operacional</SelectItem>
                      <SelectItem value="Financeiro">Financeiro</SelectItem>
                      <SelectItem value="Estratégico">Estratégico</SelectItem>
                      <SelectItem value="Compliance">Compliance</SelectItem>
                      <SelectItem value="Tecnológico">Tecnológico</SelectItem>
                      <SelectItem value="ESG">ESG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="source">Fonte de Identificação</Label>
                  <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Como foi identificado?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Auditoria Interna">Auditoria Interna</SelectItem>
                      <SelectItem value="Auditoria Externa">Auditoria Externa</SelectItem>
                      <SelectItem value="Análise de Processo">Análise de Processo</SelectItem>
                      <SelectItem value="Incidente">Incidente</SelectItem>
                      <SelectItem value="Brainstorming">Brainstorming</SelectItem>
                      <SelectItem value="Regulamentação">Regulamentação</SelectItem>
                      <SelectItem value="Stakeholder">Stakeholder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Context */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="business_context">Contexto do Negócio *</Label>
                <Textarea
                  id="business_context"
                  value={formData.business_context}
                  onChange={(e) => setFormData({ ...formData, business_context: e.target.value })}
                  rows={3}
                  placeholder="Explique o contexto de negócio onde este risco se manifesta..."
                />
              </div>
              
              <div>
                <Label>Stakeholders Afetados *</Label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Ex: Clientes, Funcionários, Acionistas..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addArrayItem('stakeholders', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addArrayItem('stakeholders', input.value);
                        input.value = '';
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.stakeholders.map((stakeholder, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <span>{stakeholder}</span>
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeArrayItem('stakeholders', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Processos Afetados</Label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Ex: Vendas, Produção, Atendimento..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addArrayItem('affected_processes', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addArrayItem('affected_processes', input.value);
                        input.value = '';
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.affected_processes.map((process, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <span>{process}</span>
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeArrayItem('affected_processes', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Analysis */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="probability">Probabilidade (1-5)</Label>
                  <Select 
                    value={formData.probability.toString()} 
                    onValueChange={(value) => setFormData({ ...formData, probability: parseInt(value) })}
                  >
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
                
                <div>
                  <Label htmlFor="impact">Impacto (1-5)</Label>
                  <Select 
                    value={formData.impact.toString()} 
                    onValueChange={(value) => setFormData({ ...formData, impact: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: tenantSettings?.risk_matrix?.type === '4x4' ? 4 : 5 }, (_, i) => {
                        const value = i + 1;
                        const label = tenantSettings?.risk_matrix?.impact_labels?.[i] || 
                          (tenantSettings?.risk_matrix?.type === '4x4' ? 
                            ['Insignificante', 'Menor', 'Moderado', 'Maior'][i] :
                            ['Insignificante', 'Menor', 'Moderado', 'Maior', 'Catastrófico'][i]
                          );
                        return (
                          <SelectItem key={value} value={value.toString()}>
                            {value} - {label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="vulnerability">Vulnerabilidade (1-5)</Label>
                  <Select 
                    value={formData.vulnerability.toString()} 
                    onValueChange={(value) => setFormData({ ...formData, vulnerability: parseInt(value) })}
                  >
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
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Nível de Risco Calculado:</span>
                  <Badge className={
                    formData.risk_level === 'Muito Alto' ? 'bg-red-100 text-red-800' :
                    formData.risk_level === 'Alto' ? 'bg-orange-100 text-orange-800' :
                    formData.risk_level === 'Médio' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                    formData.risk_level === 'Baixo' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {formData.risk_level}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Score: {((formData.probability * formData.impact * formData.vulnerability) / 5).toFixed(1)}
                </p>
              </div>
              
              <div>
                <Label>Controles Existentes</Label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Ex: Backup diário, Firewall, Segregação de funções..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addArrayItem('existing_controls', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addArrayItem('existing_controls', input.value);
                        input.value = '';
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.existing_controls.map((control, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <span>{control}</span>
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeArrayItem('existing_controls', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Classification */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nível de Risco</Label>
                  <Input value={formData.risk_level} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Calculado automaticamente baseado na análise
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
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
              </div>
              
              <div>
                <Label htmlFor="owner">Responsável pelo Risco *</Label>
                <Input
                  id="owner"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  placeholder="Nome do responsável pelo gerenciamento do risco"
                />
              </div>
            </div>
          )}

          {/* Step 5: Treatment */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="treatment_strategy">Estratégia de Tratamento *</Label>
                <Select 
                  value={formData.treatment_strategy} 
                  onValueChange={(value) => setFormData({ ...formData, treatment_strategy: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a estratégia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mitigar">Mitigar - Reduzir probabilidade/impacto</SelectItem>
                    <SelectItem value="Transferir">Transferir - Seguros, contratos</SelectItem>
                    <SelectItem value="Aceitar">Aceitar - Assumir o risco</SelectItem>
                    <SelectItem value="Evitar">Evitar - Eliminar a atividade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="treatment_rationale">Justificativa da Estratégia *</Label>
                <Textarea
                  id="treatment_rationale"
                  value={formData.treatment_rationale}
                  onChange={(e) => setFormData({ ...formData, treatment_rationale: e.target.value })}
                  rows={3}
                  placeholder="Explique por que esta estratégia foi escolhida..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target_date">Data Alvo</Label>
                  <Input
                    id="target_date"
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="budget_required">Orçamento Necessário (R$)</Label>
                  <Input
                    id="budget_required"
                    type="number"
                    value={formData.budget_required}
                    onChange={(e) => setFormData({ ...formData, budget_required: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        
        <div className="flex space-x-2">
          {currentStep < steps.length - 1 ? (
            <Button onClick={nextStep}>
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={saveRisk} disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Criar Risco
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};