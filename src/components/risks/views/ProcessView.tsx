import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  GitBranch,
  Search,
  Brain,
  Target,
  Shield,
  Eye,
  BarChart3,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Lightbulb,
  AlertTriangle,
  Users,
  Calendar,
  FileText,
  Zap,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import type { Risk, CreateRiskRequest, RiskCategory, TreatmentType } from '@/types/risk-management';
import { RISK_CATEGORIES, TREATMENT_TYPES } from '@/types/risk-management';

interface ProcessViewProps {
  risks: Risk[];
  onCreate: (data: CreateRiskRequest) => void;
  onUpdate: (riskId: string, data: any) => void;
}

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  alexSupport: string;
  status: 'pending' | 'in_progress' | 'completed';
  optional?: boolean;
}

interface GuidedFormData {
  // Identificação
  name: string;
  description: string;
  category: RiskCategory;
  
  // Análise
  probability: number;
  impact: number;
  analysisType: 'basic' | 'advanced';
  
  // Avaliação
  stakeholders: string[];
  existingControls: string[];
  
  // Classificação
  treatmentType: TreatmentType;
  
  // Tratamento
  assignedTo: string;
  dueDate?: Date;
  
  // Monitoramento
  reviewFrequency: 'weekly' | 'monthly' | 'quarterly';
  kris: string[];
}

export const ProcessView: React.FC<ProcessViewProps> = ({
  risks,
  onCreate,
  onUpdate
}) => {
  const { tenantSettings } = useTenantSettings();
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessActive, setIsProcessActive] = useState(true); // Iniciar automaticamente
  const [formData, setFormData] = useState<GuidedFormData>({
    name: '',
    description: '',
    category: 'Operacional',
    probability: 3,
    impact: 3,
    analysisType: 'basic',
    stakeholders: [],
    existingControls: [],
    treatmentType: 'Mitigar',
    assignedTo: '',
    reviewFrequency: 'monthly',
    kris: []
  });
  const [tempInputs, setTempInputs] = useState({
    stakeholder: '',
    control: '',
    kri: ''
  });

  const { user } = useAuth();
  const { toast } = useToast();
  
  // Inicializar processo automaticamente (toast removido para modal)
  // useEffect(() => {
  //   if (isProcessActive) {
  //     toast({
  //       title: '🚀 Processo Alex Risk Iniciado',
  //       description: 'Processo guiado de criação de riscos ativado com sucesso!',
  //     });
  //   }
  // }, []);

  const processSteps: ProcessStep[] = [
    {
      id: 'identify',
      title: 'Identificar',
      description: 'Identificação e registro do risco',
      icon: Search,
      color: 'text-blue-600',
      alexSupport: 'Alex Risk pode sugerir riscos baseado em dados históricos e benchmarks do setor',
      status: 'pending'
    },
    {
      id: 'analyze',
      title: 'Analisar',
      description: 'Análise qualitativa e quantitativa',
      icon: Brain,
      color: 'text-purple-600',
      alexSupport: 'Análise automática de probabilidade e impacto usando IA e dados de mercado',
      status: 'pending'
    },
    {
      id: 'evaluate',
      title: 'Avaliar',
      description: 'Avaliação de significância',
      icon: Target,
      color: 'text-indigo-600',
      alexSupport: 'Identificação automática de stakeholders e controles existentes',
      status: 'pending'
    },
    {
      id: 'classify',
      title: 'Classificar',
      description: 'Classificação e priorização',
      icon: FileText,
      color: 'text-green-600',
      alexSupport: 'Sugestão de estratégia de tratamento baseada em apetite ao risco',
      status: 'pending'
    },
    {
      id: 'treat',
      title: 'Tratar',
      description: 'Estratégia de tratamento',
      icon: Shield,
      color: 'text-orange-600',
      alexSupport: 'Geração automática de planos de ação e cronogramas',
      status: 'pending'
    },
    {
      id: 'monitor',
      title: 'Monitorar',
      description: 'Monitoramento contínuo',
      icon: Eye,
      color: 'text-teal-600',
      alexSupport: 'Configuração de KRIs e alertas inteligentes',
      status: 'pending'
    },
    {
      id: 'review',
      title: 'Revisar',
      description: 'Revisão periódica',
      icon: BarChart3,
      color: 'text-pink-600',
      alexSupport: 'Análise de efetividade e sugestões de melhoria',
      status: 'pending',
      optional: true
    },
    {
      id: 'close',
      title: 'Encerrar',
      description: 'Encerramento do risco',
      icon: CheckCircle,
      color: 'text-gray-600',
      alexSupport: 'Documentação automática e lições aprendidas',
      status: 'pending',
      optional: true
    }
  ];

  const startProcess = () => {
    setIsProcessActive(true);
    setCurrentStep(0);
    toast({
      title: '🚀 Processo Iniciado',
      description: 'Iniciando processo guiado de gestão de riscos com Alex Risk',
    });
  };

  const nextStep = () => {
    if (currentStep < processSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetProcess = () => {
    setIsProcessActive(false);
    setCurrentStep(0);
    setFormData({
      name: '',
      description: '',
      category: 'Operacional',
      probability: 3,
      impact: 3,
      analysisType: 'basic',
      stakeholders: [],
      existingControls: [],
      treatmentType: 'Mitigar',
      assignedTo: '',
      reviewFrequency: 'monthly',
      kris: []
    });
    setTempInputs({
      stakeholder: '',
      control: '',
      kri: ''
    });
  };

  const completeProcess = () => {
    const riskData: CreateRiskRequest = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      probability: formData.probability,
      impact: formData.impact,
      treatmentType: formData.treatmentType,
      owner: user?.id || '',
      assignedTo: formData.assignedTo,
      dueDate: formData.dueDate,
      analysisData: {
        riskType: 'Processo',
        matrixSize: tenantSettings?.risk_matrix?.type || '5x5',
        probabilityAnswers: [],
        impactAnswers: [],
        probabilityScore: formData.probability,
        impactScore: formData.impact,
        qualitativeRiskLevel: calculateRiskLevel(formData.probability * formData.impact),
        stakeholders: formData.stakeholders,
        existingControls: formData.existingControls,
        kris: formData.kris
      }
    };

    onCreate(riskData);
    
    toast({
      title: '✅ Risco Criado com Sucesso!',
      description: 'Processo Alex Risk concluído! O risco foi registrado no sistema.',
    });

    resetProcess();
    // O modal será fechado automaticamente pelo onCreate no componente pai
  };

  const calculateRiskLevel = (score: number) => {
    const isMatrix4x4 = tenantSettings?.risk_matrix?.type === '4x4';
    
    if (isMatrix4x4) {
      // Matriz 4x4: Baixo (1-2), Médio (3-6), Alto (7-12), Crítico (13-16)
      if (score >= 13) return 'Crítico';
      if (score >= 7) return 'Alto';
      if (score >= 3) return 'Médio';
      return 'Baixo';
    } else {
      // Matriz 5x5: Muito Baixo (1-2), Baixo (3-4), Médio (5-8), Alto (9-19), Muito Alto (20-25)
      if (score >= 20) return 'Muito Alto';
      if (score >= 9) return 'Alto';
      if (score >= 5) return 'Médio';
      if (score >= 3) return 'Baixo';
      return 'Muito Baixo';
    }
  };

  const addArrayItem = (field: 'stakeholders' | 'existingControls' | 'kris', tempField: 'stakeholder' | 'control' | 'kri') => {
    const value = tempInputs[tempField].trim();
    if (value) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value]
      }));
      setTempInputs(prev => ({
        ...prev,
        [tempField]: ''
      }));
    }
  };

  const removeArrayItem = (field: 'stakeholders' | 'existingControls' | 'kris', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const getStepIcon = (step: ProcessStep, index: number) => {
    const Icon = step.icon;
    const isActive = index === currentStep;
    const isCompleted = index < currentStep;
    
    return (
      <div 
        className={`p-3 rounded-full border-2 transition-all ${
          isActive ? 'border-primary bg-primary text-white' :
          isCompleted ? 'border-green-500 bg-green-500 text-white' :
          'border-gray-300 bg-white text-gray-400'
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
    );
  };

  const getProgressPercentage = () => {
    return Math.round(((currentStep + 1) / processSteps.length) * 100);
  };

  const renderStepContent = () => {
    const step = processSteps[currentStep];
    
    switch (step.id) {
      case 'identify':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="risk-name">Nome do Risco *</Label>
                <Input
                  id="risk-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Falha no sistema de pagamentos"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="risk-description">Descrição</Label>
                <Textarea
                  id="risk-description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descreva o risco identificado..."
                  rows={3}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="risk-category">Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({...formData, category: value as RiskCategory})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(RISK_CATEGORIES).map(([key, description]) => (
                      <SelectItem key={key} value={key} title={description}>
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900 dark:text-purple-100">Alex Risk Sugestão</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                    {step.alexSupport}
                  </p>
                  <Button size="sm" variant="outline" className="mt-2 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50">
                    <Zap className="h-3 w-3 mr-1" />
                    Sugerir Riscos
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'analyze':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="probability">Probabilidade (1-5) *</Label>
                <Select
                  value={formData.probability.toString()}
                  onValueChange={(value) => setFormData({...formData, probability: parseInt(value)})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Muito Baixa (&lt; 10%)</SelectItem>
                    <SelectItem value="2">2 - Baixa (10-30%)</SelectItem>
                    <SelectItem value="3">3 - Média (30-50%)</SelectItem>
                    <SelectItem value="4">4 - Alta (50-80%)</SelectItem>
                    <SelectItem value="5">5 - Muito Alta (&gt; 80%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="impact">Impacto (1-5) *</Label>
                <Select
                  value={formData.impact.toString()}
                  onValueChange={(value) => setFormData({...formData, impact: parseInt(value)})}
                >
                  <SelectTrigger className="mt-1">
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
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <Label className="text-sm font-medium">Resultado da Análise</Label>
              <div className="mt-2 flex items-center space-x-4">
                <div>
                  <span className="text-sm text-muted-foreground">Score de Risco:</span>
                  <span className="ml-2 text-lg font-bold">{formData.probability * formData.impact}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Nível:</span>
                  <Badge className="ml-2">
                    {calculateRiskLevel(formData.probability * formData.impact)}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900 dark:text-purple-100">Alex Risk Sugestão</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                    {step.alexSupport}
                  </p>
                  <Button size="sm" variant="outline" className="mt-2 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50">
                    <Zap className="h-3 w-3 mr-1" />
                    Análise Automática
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'evaluate':
        return (
          <div className="space-y-6">
            <div>
              <Label>Stakeholders Afetados</Label>
              <div className="mt-2 space-y-2">
                <div className="flex space-x-2">
                  <Input
                    value={tempInputs.stakeholder}
                    onChange={(e) => setTempInputs({...tempInputs, stakeholder: e.target.value})}
                    placeholder="Nome do stakeholder"
                    onKeyPress={(e) => e.key === 'Enter' && addArrayItem('stakeholders', 'stakeholder')}
                  />
                  <Button 
                    type="button" 
                    onClick={() => addArrayItem('stakeholders', 'stakeholder')}
                    size="sm"
                  >
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.stakeholders.map((stakeholder, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => removeArrayItem('stakeholders', index)}
                    >
                      {stakeholder} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <Label>Controles Existentes</Label>
              <div className="mt-2 space-y-2">
                <div className="flex space-x-2">
                  <Input
                    value={tempInputs.control}
                    onChange={(e) => setTempInputs({...tempInputs, control: e.target.value})}
                    placeholder="Descrição do controle"
                    onKeyPress={(e) => e.key === 'Enter' && addArrayItem('existingControls', 'control')}
                  />
                  <Button 
                    type="button" 
                    onClick={() => addArrayItem('existingControls', 'control')}
                    size="sm"
                  >
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.existingControls.map((control, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => removeArrayItem('existingControls', index)}
                    >
                      {control} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900 dark:text-purple-100">Alex Risk Sugestão</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                    {step.alexSupport}
                  </p>
                  <Button size="sm" variant="outline" className="mt-2 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50">
                    <Zap className="h-3 w-3 mr-1" />
                    Identificar Automaticamente
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'classify':
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="treatment-type">Estratégia de Tratamento *</Label>
              <Select
                value={formData.treatmentType}
                onValueChange={(value) => setFormData({...formData, treatmentType: value as TreatmentType})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TREATMENT_TYPES).map(([key, description]) => (
                    <SelectItem key={key} value={key} title={description}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900 dark:text-purple-100">Alex Risk Sugestão</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                    {step.alexSupport}
                  </p>
                  <Button size="sm" variant="outline" className="mt-2 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50">
                    <Zap className="h-3 w-3 mr-1" />
                    Sugerir Estratégia
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'treat':
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="assigned-to">Responsável pelo Tratamento</Label>
              <Input
                id="assigned-to"
                value={formData.assignedTo}
                onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                placeholder="Nome do responsável"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="due-date">Data de Vencimento</Label>
              <Input
                id="due-date"
                type="date"
                value={formData.dueDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => setFormData({
                  ...formData, 
                  dueDate: e.target.value ? new Date(e.target.value) : undefined
                })}
                className="mt-1"
              />
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900 dark:text-purple-100">Alex Risk Sugestão</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                    {step.alexSupport}
                  </p>
                  <Button size="sm" variant="outline" className="mt-2 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50">
                    <Zap className="h-3 w-3 mr-1" />
                    Gerar Plano de Ação
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'monitor':
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="review-frequency">Frequência de Revisão</Label>
              <Select
                value={formData.reviewFrequency}
                onValueChange={(value) => setFormData({...formData, reviewFrequency: value as 'weekly' | 'monthly' | 'quarterly'})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Key Risk Indicators (KRIs)</Label>
              <div className="mt-2 space-y-2">
                <div className="flex space-x-2">
                  <Input
                    value={tempInputs.kri}
                    onChange={(e) => setTempInputs({...tempInputs, kri: e.target.value})}
                    placeholder="Ex: Número de falhas por dia"
                    onKeyPress={(e) => e.key === 'Enter' && addArrayItem('kris', 'kri')}
                  />
                  <Button 
                    type="button" 
                    onClick={() => addArrayItem('kris', 'kri')}
                    size="sm"
                  >
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.kris.map((kri, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => removeArrayItem('kris', index)}
                    >
                      {kri} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900 dark:text-purple-100">Alex Risk Sugestão</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                    {step.alexSupport}
                  </p>
                  <Button size="sm" variant="outline" className="mt-2 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50">
                    <Zap className="h-3 w-3 mr-1" />
                    Configurar KRIs
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Processo Concluído!</h3>
            <p className="text-muted-foreground">
              Todos os passos foram concluídos. Clique em "Finalizar" para criar o risco.
            </p>
          </div>
        );
    }
  };

  if (!isProcessActive) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GitBranch className="h-5 w-5" />
              <span>Processo Guiado de Gestão de Riscos</span>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Overview do Processo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Iniciar Processo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play className="h-5 w-5 text-green-500" />
                <span>Iniciar Novo Processo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Inicie um processo guiado e inteligente para identificação, análise e tratamento de riscos corporativos com suporte do Alex Risk.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Processo padronizado em 8 etapas</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Suporte inteligente do Alex Risk</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Análise automática de probabilidade e impacto</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Geração de planos de ação personalizados</span>
                </div>
              </div>
              
              <Button onClick={startProcess} size="lg" className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Iniciar Processo Guiado
              </Button>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <span>Estatísticas dos Processos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{risks.length}</div>
                  <div className="text-sm text-muted-foreground">Riscos Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {risks.filter(r => r.status === 'Fechado').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Concluídos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {risks.filter(r => r.status === 'Em Tratamento').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Em Andamento</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {risks.filter(r => r.riskLevel === 'Muito Alto').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Críticos</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <span>Powered by Alex Risk AI</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Etapas do Processo */}
        <Card>
          <CardHeader>
            <CardTitle>Etapas do Processo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {processSteps.slice(0, 6).map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="text-center space-y-3">
                    <div className={`mx-auto p-3 rounded-lg ${step.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                      <Icon className={`h-6 w-6 ${step.color}`} />
                    </div>
                    <div>
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header do Processo Ativo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <GitBranch className="h-5 w-5" />
              <span>Processo Guiado - {processSteps[currentStep].title}</span>
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={resetProcess}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reiniciar
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progresso do Processo</span>
              <span>{getProgressPercentage()}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Stepper */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {processSteps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center space-y-2">
                {getStepIcon(step, index)}
                <div className="text-center">
                  <div className="text-xs font-medium">{step.title}</div>
                  {step.optional && (
                    <Badge variant="secondary" className="text-xs mt-1">Opcional</Badge>
                  )}
                </div>
                {index < processSteps.length - 1 && (
                  <ArrowRight className={`h-4 w-4 ${index < currentStep ? 'text-green-500' : 'text-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo da Etapa Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {(() => {
              const Icon = processSteps[currentStep].icon;
              return <Icon className={`h-5 w-5 ${processSteps[currentStep].color}`} />;
            })()}
            <span>{processSteps[currentStep].title}</span>
          </CardTitle>
          <p className="text-muted-foreground">
            {processSteps[currentStep].description}
          </p>
        </CardHeader>
        
        <CardContent>
          {renderStepContent()}
        </CardContent>
        
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            
            <div className="flex items-center space-x-2">
              {currentStep === processSteps.length - 1 ? (
                <Button onClick={completeProcess}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Finalizar Processo
                </Button>
              ) : (
                <Button onClick={nextStep}>
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};