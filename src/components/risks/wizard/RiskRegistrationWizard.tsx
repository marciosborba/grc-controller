import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Brain,
  FileText,
  Target,
  BarChart3,
  Shield,
  ClipboardList,
  Users,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Importar os steps
import { Step1Identification } from './steps/Step1Identification';
import { Step2Analysis } from './steps/Step2Analysis';
import { Step3Classification } from './steps/Step3Classification';
import { Step4Treatment } from './steps/Step4Treatment';
import { Step5ActionPlan } from './steps/Step5ActionPlan';
import { Step6Communication } from './steps/Step6Communication';
import { Step7Monitoring } from './steps/Step7Monitoring';

export interface RiskRegistrationData {
  // Step 1: Identification
  risk_title?: string;
  risk_description?: string;
  risk_category?: string;
  risk_source?: string;
  identification_date?: string;
  responsible_area?: string;
  
  // Step 2: Analysis
  methodology_id?: string;
  impact_score?: number;
  probability_score?: number;
  risk_score?: number;
  risk_level?: string;
  
  // Step 3: Classification (GUT)
  gravity_score?: number;
  urgency_score?: number;
  tendency_score?: number;
  gut_score?: number;
  gut_priority?: string;
  
  // Step 4: Treatment
  treatment_strategy?: string;
  treatment_rationale?: string;
  treatment_cost?: number;
  treatment_timeline?: string;
  
  // Step 5: Action Plan
  action_plans?: any[];
  
  // Step 6: Communication
  stakeholders?: any[];
  
  // Step 7: Monitoring
  monitoring_frequency?: string;
  monitoring_responsible?: string;
  review_date?: string;
  residual_risk_level?: string;
  residual_impact?: number;
  residual_probability?: number;
  residual_risk_score?: number;
  closure_criteria?: string;
  monitoring_notes?: string;
  kpi_definition?: string;
}

interface RiskRegistrationWizardProps {
  onComplete: (riskData: RiskRegistrationData) => void;
  onCancel: () => void;
  editMode?: boolean;
  existingRiskId?: string;
}

export const RiskRegistrationWizard: React.FC<RiskRegistrationWizardProps> = ({
  onComplete,
  onCancel,
  editMode = false,
  existingRiskId
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationData, setRegistrationData] = useState<RiskRegistrationData>({});
  const [registrationId, setRegistrationId] = useState<string | null>(existingRiskId || null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const steps = [
    {
      id: 1,
      title: 'Identificação',
      description: 'Dados básicos do risco',
      icon: FileText
    },
    {
      id: 2,
      title: 'Análise',
      description: 'Metodologia e avaliação',
      icon: BarChart3
    },
    {
      id: 3,
      title: 'Classificação',
      description: 'Metodologia GUT',
      icon: Target
    },
    {
      id: 4,
      title: 'Tratamento',
      description: 'Estratégia de resposta',
      icon: Shield
    },
    {
      id: 5,
      title: 'Plano de Ação',
      description: 'Atividades e responsáveis',
      icon: ClipboardList
    },
    {
      id: 6,
      title: 'Comunicação',
      description: 'Stakeholders e aprovação',
      icon: Users
    },
    {
      id: 7,
      title: 'Monitoramento',
      description: 'Acompanhamento e encerramento',
      icon: Eye
    }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);
  const progress = (currentStep / steps.length) * 100;

  // Carregar dados existentes se for modo de edição
  useEffect(() => {
    if (editMode && existingRiskId) {
      loadExistingRiskData();
    } else if (!editMode) {
      // Criar novo registro no Supabase
      createNewRiskRegistration();
    }
  }, [editMode, existingRiskId]);

  const loadExistingRiskData = async () => {
    if (!existingRiskId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('risk_registrations')
        .select('*')
        .eq('id', existingRiskId)
        .single();

      if (error) throw error;
      
      setRegistrationData(data);
      setRegistrationId(data.id);
    } catch (error) {
      console.error('Erro ao carregar dados do risco:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados do risco.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewRiskRegistration = async () => {
    if (!user?.tenant_id) return;
    
    try {
      const { data, error } = await supabase
        .from('risk_registrations')
        .insert({
          tenant_id: user.tenant_id,
          created_by: user.id,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;
      
      setRegistrationId(data.id);
    } catch (error) {
      console.error('Erro ao criar registro de risco:', error);
    }
  };

  const updateRegistrationData = (newData: Partial<RiskRegistrationData>) => {
    const updatedData = { ...registrationData, ...newData };
    setRegistrationData(updatedData);
    
    // Salvar no Supabase
    saveToSupabase(updatedData);
  };

  const saveToSupabase = async (data: RiskRegistrationData) => {
    if (!registrationId) return;
    
    try {
      const { error } = await supabase
        .from('risk_registrations')
        .update(data)
        .eq('id', registrationId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  };

  const handleNext = () => {
    // Validações por etapa
    if (!validateCurrentStep()) {
      return;
    }

    // Lógica especial para Step 4 (Treatment)
    if (currentStep === 4 && registrationData.treatment_strategy === 'accept') {
      // Pular Step 5 (Action Plan) se estratégia for aceitar
      setCurrentStep(6);
    } else if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }

    toast({
      title: '✅ Etapa Concluída',
      description: `Avançando para: ${steps[currentStep]?.title}`,
    });
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!registrationData.risk_title?.trim() || !registrationData.risk_category || !registrationData.risk_description?.trim()) {
          toast({
            title: '⚠️ Campos Obrigatórios',
            description: 'Por favor, preencha todos os campos obrigatórios.',
            variant: 'destructive'
          });
          return false;
        }
        break;
      case 2:
        if (!registrationData.methodology_id || !registrationData.impact_score || !registrationData.probability_score) {
          toast({
            title: '⚠️ Análise Incompleta',
            description: 'Por favor, complete a análise do risco.',
            variant: 'destructive'
          });
          return false;
        }
        break;
      case 3:
        if (!registrationData.gravity_score || !registrationData.urgency_score || !registrationData.tendency_score) {
          toast({
            title: '⚠️ Classificação GUT Incompleta',
            description: 'Por favor, complete a classificação GUT.',
            variant: 'destructive'
          });
          return false;
        }
        break;
      case 4:
        if (!registrationData.treatment_strategy || !registrationData.treatment_rationale?.trim()) {
          toast({
            title: '⚠️ Estratégia de Tratamento',
            description: 'Por favor, selecione uma estratégia e forneça justificativa.',
            variant: 'destructive'
          });
          return false;
        }
        break;
      case 5:
        // Action Plan é opcional se estratégia for 'accept'
        break;
      case 6:
        if (!registrationData.stakeholders || registrationData.stakeholders.length === 0) {
          toast({
            title: '⚠️ Stakeholders Necessários',
            description: 'Por favor, adicione pelo menos um stakeholder.',
            variant: 'destructive'
          });
          return false;
        }
        break;
      case 7:
        if (!registrationData.monitoring_frequency || !registrationData.monitoring_responsible || !registrationData.closure_criteria) {
          toast({
            title: '⚠️ Configuração de Monitoramento',
            description: 'Por favor, complete a configuração de monitoramento.',
            variant: 'destructive'
          });
          return false;
        }
        break;
    }
    return true;
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      // Lógica especial para Step 6 se veio do Step 4 (Accept strategy)
      if (currentStep === 6 && registrationData.treatment_strategy === 'accept') {
        setCurrentStep(4);
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const handleComplete = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setIsLoading(true);
    try {
      // Atualizar status para 'completed'
      const finalData = {
        ...registrationData,
        status: 'completed',
        completed_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('risk_registrations')
        .update(finalData)
        .eq('id', registrationId);

      if (error) throw error;

      onComplete(finalData);

      toast({
        title: '🎉 Registro de Risco Concluído',
        description: `Risco "${registrationData.risk_title}" foi registrado com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao finalizar registro:', error);
      toast({
        title: 'Erro ao finalizar',
        description: 'Não foi possível finalizar o registro do risco.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <Step1Identification
            data={registrationData}
            updateData={updateRegistrationData}
            registrationId={registrationId}
          />
        );
      case 2:
        return (
          <Step2Analysis
            data={registrationData}
            updateData={updateRegistrationData}
            registrationId={registrationId}
          />
        );
      case 3:
        return (
          <Step3Classification
            data={registrationData}
            updateData={updateRegistrationData}
            registrationId={registrationId}
          />
        );
      case 4:
        return (
          <Step4Treatment
            data={registrationData}
            updateData={updateRegistrationData}
            registrationId={registrationId}
          />
        );
      case 5:
        return (
          <Step5ActionPlan
            data={registrationData}
            updateData={updateRegistrationData}
            registrationId={registrationId}
          />
        );
      case 6:
        return (
          <Step6Communication
            data={registrationData}
            updateData={updateRegistrationData}
            registrationId={registrationId}
          />
        );
      case 7:
        return (
          <Step7Monitoring
            data={registrationData}
            updateData={updateRegistrationData}
            registrationId={registrationId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header do Wizard */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <Brain className="h-6 w-6 text-purple-600" />
              <span>Registro de Risco - Processo Guiado</span>
            </h2>
            <p className="text-muted-foreground">
              Processo inteligente com Alex Risk para registro e análise completa de riscos
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            Etapa {currentStep} de {steps.length}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progresso do Registro</span>
            <span>{Math.round(progress)}% concluído</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Navigation */}
        <div className="flex items-center justify-center space-x-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center space-x-2 p-3 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : isCompleted 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                  <div className="hidden sm:block">
                    <p className="font-medium text-sm">{step.title}</p>
                    <p className="text-xs opacity-80">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Conteúdo da Etapa Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {currentStepData && <currentStepData.icon className="h-5 w-5" />}
            <span>{currentStepData?.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navegação */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onCancel : handlePrevious}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>{currentStep === 1 ? 'Cancelar' : 'Anterior'}</span>
        </Button>

        <div className="flex items-center space-x-2">
          {/* Alex Risk Suggestions */}
          <Button
            variant="outline"
            className="flex items-center space-x-2 border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950/50"
          >
            <Brain className="h-4 w-4" />
            <span>Sugestões Alex Risk</span>
          </Button>

          {currentStep === steps.length ? (
            <Button
              onClick={handleComplete}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              <CheckCircle className="h-4 w-4" />
              <span>{isLoading ? 'Finalizando...' : 'Finalizar Registro'}</span>
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex items-center space-x-2"
            >
              <span>Próximo</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};