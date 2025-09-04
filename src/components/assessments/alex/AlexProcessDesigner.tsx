import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings2,
  Plus,
  Edit,
  Trash2,
  Move,
  ArrowRight,
  ArrowDown,
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
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { useAlexAssessment } from '@/hooks/useAlexAssessment';
import { useIsMobile } from '@/hooks/useIsMobile';

interface ProcessStep {
  id: string;
  name: string;
  description: string;
  type: 'start' | 'task' | 'decision' | 'end' | 'parallel' | 'merge';
  assignee_role: string;
  estimated_duration: number;
  dependencies: string[];
  conditions?: {
    approval_required: boolean;
    evidence_required: boolean;
    review_required: boolean;
    custom_validation?: string;
  };
  automation?: {
    trigger_events: string[];
    actions: string[];
    notifications: string[];
  };
  position: { x: number; y: number };
}

interface ProcessTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  industry: string;
  complexity: 'simple' | 'moderate' | 'complex';
  steps: ProcessStep[];
  metadata: {
    created_by: string;
    created_at: string;
    usage_count: number;
    avg_rating: number;
    tags: string[];
  };
  is_adaptive: boolean;
  adaptive_rules: {
    role_based_variations: any[];
    context_adaptations: any[];
    ai_optimization_enabled: boolean;
  };
}

const AlexProcessDesigner: React.FC = () => {
  const isMobile = useIsMobile();
  const { tenantConfig, saveTenantConfiguration } = useAlexAssessment();
  
  const [selectedTemplate, setSelectedTemplate] = useState<ProcessTemplate | null>(null);
  const [isDesigning, setIsDesigning] = useState(false);
  const [currentProcess, setCurrentProcess] = useState<ProcessTemplate | null>(null);
  const [draggedStep, setDraggedStep] = useState<ProcessStep | null>(null);
  const [showStepDialog, setShowStepDialog] = useState(false);
  const [editingStep, setEditingStep] = useState<ProcessStep | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Mock templates for demonstration
  const [processTemplates] = useState<ProcessTemplate[]>([
    {
      id: 'iso-27001-process',
      name: 'ISO 27001 - Processo Adaptativo',
      description: 'Processo customizável para assessments ISO 27001 que se adapta ao perfil da organização',
      category: 'Information Security',
      industry: 'Technology',
      complexity: 'complex',
      steps: [
        {
          id: 'start',
          name: 'Início do Assessment',
          description: 'Configuração inicial e definição de escopo',
          type: 'start',
          assignee_role: 'coordinator',
          estimated_duration: 2,
          dependencies: [],
          position: { x: 100, y: 100 }
        },
        {
          id: 'scope-definition',
          name: 'Definição de Escopo',
          description: 'Identificar sistemas, processos e ativos no escopo',
          type: 'task',
          assignee_role: 'analyst',
          estimated_duration: 8,
          dependencies: ['start'],
          conditions: {
            approval_required: true,
            evidence_required: false,
            review_required: true
          },
          position: { x: 100, y: 200 }
        },
        {
          id: 'risk-assessment',
          name: 'Avaliação de Riscos',
          description: 'Identificação e avaliação dos riscos de segurança',
          type: 'parallel',
          assignee_role: 'risk_analyst',
          estimated_duration: 16,
          dependencies: ['scope-definition'],
          conditions: {
            approval_required: false,
            evidence_required: true,
            review_required: true
          },
          automation: {
            trigger_events: ['scope_approved'],
            actions: ['create_risk_register', 'assign_risk_owners'],
            notifications: ['risk_team', 'coordinators']
          },
          position: { x: 300, y: 200 }
        }
      ],
      metadata: {
        created_by: 'system',
        created_at: new Date().toISOString(),
        usage_count: 47,
        avg_rating: 4.8,
        tags: ['ISO 27001', 'Security', 'Risk Management']
      },
      is_adaptive: true,
      adaptive_rules: {
        role_based_variations: [
          {
            role: 'small_company',
            modifications: {
              'risk-assessment': { estimated_duration: 8, assignee_role: 'coordinator' }
            }
          }
        ],
        context_adaptations: [
          {
            condition: 'first_assessment',
            add_steps: ['training_session', 'tool_setup']
          }
        ],
        ai_optimization_enabled: true
      }
    },
    {
      id: 'sox-compliance-process',
      name: 'SOX - Workflow Financeiro',
      description: 'Processo adaptativo para compliance SOX com foco em controles financeiros',
      category: 'Financial Compliance',
      industry: 'Financial Services',
      complexity: 'complex',
      steps: [],
      metadata: {
        created_by: 'system',
        created_at: new Date().toISOString(),
        usage_count: 23,
        avg_rating: 4.5,
        tags: ['SOX', 'Financial', 'Compliance']
      },
      is_adaptive: true,
      adaptive_rules: {
        role_based_variations: [],
        context_adaptations: [],
        ai_optimization_enabled: true
      }
    },
    {
      id: 'gdpr-privacy-process',
      name: 'GDPR - Processo de Privacidade',
      description: 'Workflow adaptativo para compliance GDPR/LGPD com personalizações por região',
      category: 'Privacy',
      industry: 'Multi-Industry',
      complexity: 'moderate',
      steps: [],
      metadata: {
        created_by: 'system',
        created_at: new Date().toISOString(),
        usage_count: 35,
        avg_rating: 4.7,
        tags: ['GDPR', 'LGPD', 'Privacy', 'Data Protection']
      },
      is_adaptive: true,
      adaptive_rules: {
        role_based_variations: [],
        context_adaptations: [],
        ai_optimization_enabled: true
      }
    }
  ]);

  const stepTypes = [
    { value: 'start', label: 'Início', icon: PlayCircle, color: 'bg-green-100 text-green-800' },
    { value: 'task', label: 'Tarefa', icon: Target, color: 'bg-blue-100 text-blue-800' },
    { value: 'decision', label: 'Decisão', icon: GitBranch, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'parallel', label: 'Paralelo', icon: ArrowRight, color: 'bg-purple-100 text-purple-800' },
    { value: 'end', label: 'Fim', icon: CheckCircle, color: 'bg-red-100 text-red-800' }
  ];

  const roleOptions = [
    { value: 'coordinator', label: 'Coordenador' },
    { value: 'analyst', label: 'Analista' },
    { value: 'auditor', label: 'Auditor' },
    { value: 'reviewer', label: 'Revisor' },
    { value: 'approver', label: 'Aprovador' },
    { value: 'risk_analyst', label: 'Analista de Risco' },
    { value: 'compliance_officer', label: 'Oficial de Compliance' }
  ];

  const startDesigning = (template: ProcessTemplate) => {
    setCurrentProcess({ ...template });
    setIsDesigning(true);
    setPreviewMode(false);
  };

  const addNewStep = () => {
    if (!currentProcess) return;

    const newStep: ProcessStep = {
      id: `step_${Date.now()}`,
      name: 'Nova Etapa',
      description: 'Descreva esta etapa do processo',
      type: 'task',
      assignee_role: 'analyst',
      estimated_duration: 4,
      dependencies: [],
      position: { x: 200, y: 300 }
    };

    setCurrentProcess(prev => prev ? {
      ...prev,
      steps: [...prev.steps, newStep]
    } : null);
  };

  const updateStep = (updatedStep: ProcessStep) => {
    if (!currentProcess) return;

    setCurrentProcess(prev => prev ? {
      ...prev,
      steps: prev.steps.map(step => 
        step.id === updatedStep.id ? updatedStep : step
      )
    } : null);
  };

  const deleteStep = (stepId: string) => {
    if (!currentProcess) return;

    setCurrentProcess(prev => prev ? {
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    } : null);
  };

  const saveProcess = async () => {
    if (!currentProcess) return;

    try {
      // Here you would save to the backend
      toast.success('Processo salvo com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar processo');
    }
  };

  const optimizeWithAI = async () => {
    if (!currentProcess) return;

    try {
      toast.success('Processo otimizado pela IA!');
      // Here you would call AI optimization
    } catch (error) {
      toast.error('Erro na otimização IA');
    }
  };

  const StepCard = ({ step }: { step: ProcessStep }) => {
    const stepType = stepTypes.find(t => t.value === step.type);
    const Icon = stepType?.icon || Target;

    return (
      <Card 
        className={`cursor-move border-2 transition-all hover:shadow-lg ${
          draggedStep?.id === step.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
        }`}
        draggable
        onDragStart={() => setDraggedStep(step)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded ${stepType?.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm">{step.name}</CardTitle>
                <Badge variant="outline" className="text-xs mt-1">
                  {roleOptions.find(r => r.value === step.assignee_role)?.label}
                </Badge>
              </div>
            </div>
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => {
                  setEditingStep(step);
                  setShowStepDialog(true);
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => deleteStep(step.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{step.description}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            {step.estimated_duration}h
            {step.conditions?.approval_required && (
              <Badge variant="secondary" className="text-xs">Aprovação</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const ProcessCanvas = () => {
    if (!currentProcess) return null;

    return (
      <div className="relative w-full h-96 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 overflow-auto">
        <div className="absolute inset-4 grid grid-cols-3 gap-4">
          {currentProcess.steps.map((step) => (
            <div
              key={step.id}
              style={{
                gridColumn: Math.floor(step.position.x / 200) + 1,
                gridRow: Math.floor(step.position.y / 150) + 1
              }}
            >
              <StepCard step={step} />
            </div>
          ))}
        </div>

        {currentProcess.steps.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Canvas Vazio
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Adicione etapas para começar a desenhar seu processo
              </p>
              <Button onClick={addNewStep}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeira Etapa
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const StepEditDialog = () => {
    const [stepData, setStepData] = useState<ProcessStep>(
      editingStep || {
        id: `step_${Date.now()}`,
        name: '',
        description: '',
        type: 'task',
        assignee_role: 'analyst',
        estimated_duration: 4,
        dependencies: [],
        position: { x: 200, y: 300 }
      }
    );

    const handleSave = () => {
      if (editingStep) {
        updateStep(stepData);
      } else {
        setCurrentProcess(prev => prev ? {
          ...prev,
          steps: [...prev.steps, stepData]
        } : null);
      }
      setShowStepDialog(false);
      setEditingStep(null);
    };

    return (
      <Dialog open={showStepDialog} onOpenChange={setShowStepDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingStep ? 'Editar Etapa' : 'Nova Etapa'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stepName">Nome da Etapa</Label>
                <Input
                  id="stepName"
                  value={stepData.name}
                  onChange={(e) => setStepData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Revisão de Controles"
                />
              </div>
              <div>
                <Label htmlFor="stepType">Tipo</Label>
                <Select
                  value={stepData.type}
                  onValueChange={(value: any) => setStepData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stepTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="stepDescription">Descrição</Label>
              <Textarea
                id="stepDescription"
                value={stepData.description}
                onChange={(e) => setStepData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o que deve ser feito nesta etapa..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assigneeRole">Responsável</Label>
                <Select
                  value={stepData.assignee_role}
                  onValueChange={(value) => setStepData(prev => ({ ...prev, assignee_role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="duration">Duração Estimada (horas)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={stepData.estimated_duration}
                  onChange={(e) => setStepData(prev => ({ 
                    ...prev, 
                    estimated_duration: parseInt(e.target.value) || 0 
                  }))}
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Condições Especiais</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={stepData.conditions?.approval_required || false}
                    onChange={(e) => setStepData(prev => ({
                      ...prev,
                      conditions: {
                        ...prev.conditions,
                        approval_required: e.target.checked,
                        evidence_required: prev.conditions?.evidence_required || false,
                        review_required: prev.conditions?.review_required || false
                      }
                    }))}
                  />
                  <span className="text-sm">Requer Aprovação</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={stepData.conditions?.evidence_required || false}
                    onChange={(e) => setStepData(prev => ({
                      ...prev,
                      conditions: {
                        ...prev.conditions,
                        approval_required: prev.conditions?.approval_required || false,
                        evidence_required: e.target.checked,
                        review_required: prev.conditions?.review_required || false
                      }
                    }))}
                  />
                  <span className="text-sm">Requer Evidência</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={stepData.conditions?.review_required || false}
                    onChange={(e) => setStepData(prev => ({
                      ...prev,
                      conditions: {
                        ...prev.conditions,
                        approval_required: prev.conditions?.approval_required || false,
                        evidence_required: prev.conditions?.evidence_required || false,
                        review_required: e.target.checked
                      }
                    }))}
                  />
                  <span className="text-sm">Requer Revisão</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowStepDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingStep ? 'Atualizar' : 'Criar'} Etapa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings2 className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Process Designer
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Crie e personalize workflows adaptativos para seus assessments
            </p>
          </div>
        </div>
        
        {isDesigning && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? 'Editar' : 'Visualizar'}
            </Button>
            <Button variant="outline" onClick={optimizeWithAI}>
              <Brain className="h-4 w-4 mr-2" />
              Otimizar com IA
            </Button>
            <Button onClick={saveProcess}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Processo
            </Button>
          </div>
        )}
      </div>

      {!isDesigning ? (
        /* Template Selection */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Templates de Processo Disponíveis</h2>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">{template.category}</Badge>
                        <Badge 
                          className={
                            template.complexity === 'simple' ? 'bg-green-100 text-green-800' :
                            template.complexity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }
                        >
                          {template.complexity}
                        </Badge>
                        {template.is_adaptive && (
                          <Badge className="bg-purple-100 text-purple-800">
                            <Brain className="h-3 w-3 mr-1" />
                            Adaptativo
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {template.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{template.steps.length} etapas</span>
                    <span>{template.metadata.usage_count} usos</span>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      {template.metadata.avg_rating}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      onClick={() => startDesigning(template)}
                      className="flex-1"
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
                      Ver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* Process Designer Interface */
        <div className="space-y-6">
          {/* Designer Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="h-5 w-5" />
                    {currentProcess?.name}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {currentProcess?.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsDesigning(false)}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Voltar
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Tools Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Ferramentas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase">
                      Etapas
                    </Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {stepTypes.map(type => {
                        const Icon = type.icon;
                        return (
                          <Button
                            key={type.value}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingStep(null);
                              setShowStepDialog(true);
                            }}
                            className="flex flex-col gap-1 h-auto p-2"
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-xs">{type.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase">
                      Ações
                    </Label>
                    <div className="space-y-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={addNewStep}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Nova Etapa
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={optimizeWithAI}
                      >
                        <Brain className="h-3 w-3 mr-1" />
                        Otimizar IA
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Canvas */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Canvas de Processo</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="secondary">
                        {currentProcess?.steps.length || 0} etapas
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ProcessCanvas />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Step Edit Dialog */}
      <StepEditDialog />
    </div>
  );
};

export default AlexProcessDesigner;