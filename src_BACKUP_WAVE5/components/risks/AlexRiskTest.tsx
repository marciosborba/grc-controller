import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { RiskRegistrationData } from './wizard/RiskRegistrationWizard';

interface AlexRiskTestProps {
  onComplete: (riskData: RiskRegistrationData) => void;
  onCancel: () => void;
}

export const AlexRiskTest: React.FC<AlexRiskTestProps> = ({
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Análise Alex Risk - Teste
            </span>
          </h2>
          <p className="text-muted-foreground">
            Versão de teste para debug - Processo inteligente e assistido por IA
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>Alex Risk - Etapa {currentStep} de 7</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-white rounded-lg border">
            <h4 className="font-medium text-purple-900 mb-2">🤖 Alex Risk diz:</h4>
            <p className="text-purple-700">
              {currentStep === 1 && "Vamos começar identificando seu risco. Esta é a etapa mais importante!"}
              {currentStep === 2 && "Agora vamos analisar o impacto e probabilidade do risco identificado."}
              {currentStep === 3 && "Hora de classificar usando a metodologia GUT (Gravidade, Urgência, Tendência)."}
              {currentStep === 4 && "Vou recomendar a melhor estratégia de tratamento para este risco."}
              {currentStep === 5 && "Vamos criar um plano de ação detalhado."}
              {currentStep === 6 && "Identificar stakeholders e definir comunicação."}
              {currentStep === 7 && "Configurar monitoramento e KPIs para acompanhamento."}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-lg font-medium">Etapa {currentStep}: {
              currentStep === 1 ? 'Identificação' :
              currentStep === 2 ? 'Análise' :
              currentStep === 3 ? 'Classificação GUT' :
              currentStep === 4 ? 'Estratégia' :
              currentStep === 5 ? 'Plano de Ação' :
              currentStep === 6 ? 'Comunicação' :
              'Monitoramento'
            }</p>
            <p className="text-sm text-muted-foreground mt-2">
              Esta é uma versão de teste para verificar se o modal funciona corretamente.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Navegação */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onCancel : () => setCurrentStep(currentStep - 1)}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>{currentStep === 1 ? 'Cancelar' : 'Anterior'}</span>
        </Button>

        {currentStep === 7 ? (
          <Button
            onClick={() => onComplete({ risk_title: 'Teste Alex Risk Concluído', risk_category: 'test' })}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white"
          >
            <CheckCircle className="h-5 w-5" />
            <span>Concluir Teste</span>
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white"
          >
            <span>Próximo</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};