import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import type {
  RiskAnalysisType,
  RiskAssessmentAnswer
} from '@/types/risk-management';
import {
  RISK_ASSESSMENT_QUESTIONS,
  ASSESSMENT_RESPONSE_OPTIONS
} from '@/data/risk-assessment-questions';

interface RiskAssessmentQuestionsProps {
  riskType: RiskAnalysisType;
  currentQuestionIndex: number;
  currentAssessmentType: 'probability' | 'impact';
  onAnswer: (answer: RiskAssessmentAnswer) => void;
  probabilityAnswers: RiskAssessmentAnswer[];
  impactAnswers: RiskAssessmentAnswer[];
  onCancel: () => void;
}

const RiskAssessmentQuestions: React.FC<RiskAssessmentQuestionsProps> = React.memo(({
  riskType,
  currentQuestionIndex,
  currentAssessmentType,
  onAnswer,
  probabilityAnswers,
  impactAnswers,
  onCancel
}) => {
  const [selectedValue, setSelectedValue] = React.useState<number | null>(null);

  const currentQuestions = RISK_ASSESSMENT_QUESTIONS[riskType][currentAssessmentType];
  const currentQuestion = currentQuestions[currentQuestionIndex];

  // Reset seleção quando mudar de questão
  React.useEffect(() => {
    setSelectedValue(null);
  }, [currentQuestionIndex, currentAssessmentType]);

  // Calcular progresso
  const totalQuestions = RISK_ASSESSMENT_QUESTIONS[riskType].probability.length +
    RISK_ASSESSMENT_QUESTIONS[riskType].impact.length;
  const answeredQuestions = probabilityAnswers.length + impactAnswers.length;
  // Incluir a pergunta atual no progresso (pergunta sendo respondida conta como +1)
  const currentProgress = answeredQuestions + 1; // +1 para a pergunta atual
  const progress = Math.min((currentProgress / totalQuestions) * 100, 100);


  const handleAnswer = () => {
    if (selectedValue !== null && currentQuestion) {
      const selectedOption = ASSESSMENT_RESPONSE_OPTIONS.find(opt => opt.value === selectedValue);
      if (selectedOption) {
        const answer: RiskAssessmentAnswer = {
          questionId: currentQuestion.id,
          value: selectedValue,
          label: selectedOption.label
        };
        // Reset imediato antes de enviar a resposta
        setSelectedValue(null);
        onAnswer(answer);
      }
    }
  };

  const getAssessmentTypeTitle = (type: 'probability' | 'impact') => {
    return type === 'probability' ? 'Avaliação de Probabilidade' : 'Avaliação de Impacto';
  };

  const getAssessmentTypeDescription = (type: 'probability' | 'impact') => {
    return type === 'probability'
      ? 'Avalie a probabilidade de este risco se materializar'
      : 'Avalie o potencial impacto se este risco se materializar';
  };

  return (
    <div className="space-y-4">
      {/* Header com progresso */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="outline" className="mb-2">{riskType}</Badge>
            <h5 className="text-lg font-semibold">{getAssessmentTypeTitle(currentAssessmentType)}</h5>
            <p className="text-sm text-muted-foreground">
              {getAssessmentTypeDescription(currentAssessmentType)}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Questão {currentProgress} de {totalQuestions}</span>
            <span>{Math.round(progress)}% concluído</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Questão atual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {currentQuestion?.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            key={`${currentAssessmentType}-${currentQuestionIndex}`}
            value={selectedValue !== null ? selectedValue.toString() : ""}
            onValueChange={(value) => setSelectedValue(parseInt(value))}
          >
            {ASSESSMENT_RESPONSE_OPTIONS.map((option) => {
              const uniqueId = `${currentAssessmentType}-${currentQuestionIndex}-option-${option.value}`;
              return (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value.toString()} id={uniqueId} />
                  <Label
                    htmlFor={uniqueId}
                    className="flex-1 cursor-pointer py-2 px-3 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-medium">{option.value}</span> - {option.label}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>

          <div className="flex justify-between pt-4">
            <div className="flex items-center text-sm text-muted-foreground">
              {currentAssessmentType === 'probability' && (
                <span>Questões de probabilidade: {probabilityAnswers.length}/{RISK_ASSESSMENT_QUESTIONS[riskType].probability.length}</span>
              )}
              {currentAssessmentType === 'impact' && (
                <span>
                  Probabilidade concluída ✓ | Questões de impacto: {impactAnswers.length}/{RISK_ASSESSMENT_QUESTIONS[riskType].impact.length}
                </span>
              )}
            </div>

            <Button
              onClick={handleAnswer}
              disabled={selectedValue === null}
              className="min-w-[120px]"
            >
              {answeredQuestions + 1 === totalQuestions ? 'Finalizar' : 'Próxima'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Indicador de seção */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${currentAssessmentType === 'probability' || probabilityAnswers.length === RISK_ASSESSMENT_QUESTIONS[riskType].probability.length
            ? 'text-primary' : 'text-muted-foreground'
            }`}>
            <div className={`w-2 h-2 rounded-full ${probabilityAnswers.length === RISK_ASSESSMENT_QUESTIONS[riskType].probability.length
              ? 'bg-green-500'
              : currentAssessmentType === 'probability'
                ? 'bg-primary'
                : 'bg-muted-foreground'
              }`} />
            <span className="text-sm">Probabilidade</span>
          </div>

          <div className="w-8 h-px bg-muted-foreground" />

          <div className={`flex items-center space-x-2 ${currentAssessmentType === 'impact' ? 'text-primary' : 'text-muted-foreground'
            }`}>
            <div className={`w-2 h-2 rounded-full ${currentAssessmentType === 'impact' ? 'bg-primary' : 'bg-muted-foreground'
              }`} />
            <span className="text-sm">Impacto</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default RiskAssessmentQuestions;