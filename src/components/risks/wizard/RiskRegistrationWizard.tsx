import React, { useState } from 'react';
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
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Importar os steps
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2MethodologySelection } from './Step2MethodologySelection';
import { Step3RiskAnalysis } from './Step3RiskAnalysis';

export interface RiskBasicInfo {
  name: string;
  category: string;
  description: string;
  responsible: string;
  department: string;
  identificationDate: string;
  source: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface SelectedMethodology {
  id: string;
  name: string;
  description: string;
  framework: string;
  complexity: 'basic' | 'intermediate' | 'advanced';
  estimatedTime: string;
}

export interface RiskAnalysisData {
  methodology: SelectedMethodology;
  analysisData: Record<string, any>;
  calculations: Record<string, any>;
  recommendations: string[];
}

interface RiskRegistrationWizardProps {
  onComplete: (riskData: {
    basicInfo: RiskBasicInfo;
    methodology: SelectedMethodology;
    analysis: RiskAnalysisData;
  }) => void;
  onCancel: () => void;
}

export const RiskRegistrationWizard: React.FC<RiskRegistrationWizardProps> = ({
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [basicInfo, setBasicInfo] = useState<RiskBasicInfo>({
    name: '',
    category: '',
    description: '',
    responsible: '',
    department: '',
    identificationDate: new Date().toISOString().split('T')[0],
    source: '',
    priority: 'medium'
  });
  const [selectedMethodology, setSelectedMethodology] = useState<SelectedMethodology | null>(null);
  const [analysisData, setAnalysisData] = useState<RiskAnalysisData | null>(null);
  
  const { toast } = useToast();

  const steps = [
    {
      id: 1,
      title: 'Dados Básicos',
      description: 'Informações iniciais do risco',
      icon: FileText,
      component: Step1BasicInfo
    },
    {
      id: 2,
      title: 'Metodologia',
      description: 'Escolha do framework de análise',
      icon: Target,
      component: Step2MethodologySelection
    },
    {
      id: 3,
      title: 'Análise',
      description: 'Avaliação detalhada do risco',
      icon: BarChart3,
      component: Step3RiskAnalysis
    }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);
  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep === 1) {
      // Validar dados básicos
      if (!basicInfo.name.trim() || !basicInfo.category || !basicInfo.description.trim()) {
        toast({
          title: '⚠️ Campos Obrigatórios',
          description: 'Por favor, preencha todos os campos obrigatórios.',
          variant: 'destructive'
        });
        return;
      }
    }
    
    if (currentStep === 2) {
      // Validar metodologia selecionada
      if (!selectedMethodology) {
        toast({
          title: '⚠️ Metodologia Necessária',
          description: 'Por favor, selecione uma metodologia de análise.',
          variant: 'destructive'
        });
        return;
      }
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      toast({
        title: '✅ Etapa Concluída',
        description: `Avançando para: ${steps[currentStep]?.title}`,
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (!analysisData) {
      toast({
        title: '⚠️ Análise Incompleta',
        description: 'Por favor, complete a análise do risco.',
        variant: 'destructive'
      });
      return;
    }

    onComplete({
      basicInfo,
      methodology: selectedMethodology!,
      analysis: analysisData
    });

    toast({
      title: '🎉 Risco Registrado',
      description: `Risco "${basicInfo.name}" foi registrado com sucesso usando ${selectedMethodology?.name}.`,
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1BasicInfo
            data={basicInfo}
            onChange={setBasicInfo}
          />
        );
      case 2:
        return (
          <Step2MethodologySelection
            selectedMethodology={selectedMethodology}
            onSelect={setSelectedMethodology}
            riskContext={basicInfo}
          />
        );
      case 3:
        return (
          <Step3RiskAnalysis
            basicInfo={basicInfo}
            methodology={selectedMethodology!}
            data={analysisData}
            onChange={setAnalysisData}
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
            >
              <CheckCircle className="h-4 w-4" />
              <span>Finalizar Registro</span>
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