import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, Clock, SkipForward } from 'lucide-react';
import { GUT_RESPONSE_OPTIONS, GUT_QUESTIONS } from '@/data/risk-assessment-questions';

interface GUTMatrixSectionProps {
  onComplete: (gravity: number, urgency: number, tendency: number) => void;
  onSkip: () => void;
}

const GUTMatrixSection: React.FC<GUTMatrixSectionProps> = ({ onComplete, onSkip }) => {
  const [gravity, setGravity] = useState<number | null>(null);
  const [urgency, setUrgency] = useState<number | null>(null);
  const [tendency, setTendency] = useState<number | null>(null);

  const calculateGUTScore = () => {
    if (gravity && urgency && tendency) {
      return gravity * urgency * tendency;
    }
    return 0;
  };

  const getGUTPriority = (score: number) => {
    if (score >= 100) return { label: 'Muito Alta', color: 'bg-red-100 text-red-800' };
    if (score >= 64) return { label: 'Alta', color: 'bg-orange-100 text-orange-800' };
    if (score >= 27) return { label: 'Média', color: 'bg-yellow-100 text-yellow-800' };
    if (score >= 8) return { label: 'Baixa', color: 'bg-blue-100 text-blue-800' };
    return { label: 'Muito Baixa', color: 'bg-green-100 text-green-800' };
  };

  const canComplete = gravity !== null && urgency !== null && tendency !== null;
  const gutScore = calculateGUTScore();
  const priority = getGUTPriority(gutScore);

  const handleComplete = () => {
    if (canComplete) {
      onComplete(gravity!, urgency!, tendency!);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Zap className="h-5 w-5" />
            Matriz GUT - Priorização
          </CardTitle>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Avalie a Gravidade, Urgência e Tendência para determinar a prioridade de tratamento do risco
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Gravidade */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-600" />
              <Label className="text-base font-medium">
                Gravidade: {GUT_QUESTIONS.gravity}
              </Label>
            </div>
            <RadioGroup
              value={gravity?.toString()}
              onValueChange={(value) => setGravity(parseInt(value))}
            >
              {GUT_RESPONSE_OPTIONS.map((option) => (
                <div key={`gravity-${option.value}`} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={option.value.toString()} 
                    id={`gravity-${option.value}`} 
                  />
                  <Label 
                    htmlFor={`gravity-${option.value}`} 
                    className="flex-1 cursor-pointer py-1 px-2 rounded hover:bg-white/50 transition-colors"
                  >
                    <span className="font-medium">{option.value}</span> - {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Urgência */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <Label className="text-base font-medium">
                Urgência: {GUT_QUESTIONS.urgency}
              </Label>
            </div>
            <RadioGroup
              value={urgency?.toString()}
              onValueChange={(value) => setUrgency(parseInt(value))}
            >
              {GUT_RESPONSE_OPTIONS.map((option) => (
                <div key={`urgency-${option.value}`} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={option.value.toString()} 
                    id={`urgency-${option.value}`} 
                  />
                  <Label 
                    htmlFor={`urgency-${option.value}`} 
                    className="flex-1 cursor-pointer py-1 px-2 rounded hover:bg-white/50 transition-colors"
                  >
                    <span className="font-medium">{option.value}</span> - {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Tendência */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <Label className="text-base font-medium">
                Tendência: {GUT_QUESTIONS.tendency}
              </Label>
            </div>
            <RadioGroup
              value={tendency?.toString()}
              onValueChange={(value) => setTendency(parseInt(value))}
            >
              {GUT_RESPONSE_OPTIONS.map((option) => (
                <div key={`tendency-${option.value}`} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={option.value.toString()} 
                    id={`tendency-${option.value}`} 
                  />
                  <Label 
                    htmlFor={`tendency-${option.value}`} 
                    className="flex-1 cursor-pointer py-1 px-2 rounded hover:bg-white/50 transition-colors"
                  >
                    <span className="font-medium">{option.value}</span> - {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Resultado GUT */}
          {canComplete && (
            <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <h6 className="font-medium mb-3">Resultado da Análise GUT</h6>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{gravity}</div>
                  <div className="text-muted-foreground">Gravidade</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{urgency}</div>
                  <div className="text-muted-foreground">Urgência</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{tendency}</div>
                  <div className="text-muted-foreground">Tendência</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{gutScore}</div>
                  <Badge className={priority.color} variant="outline">
                    {priority.label}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onSkip}>
              <SkipForward className="h-4 w-4 mr-2" />
              Pular GUT
            </Button>
            
            <Button 
              onClick={handleComplete}
              disabled={!canComplete}
              className="min-w-[120px]"
            >
              Concluir Análise
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Explicação da Matriz GUT */}
      <Card className="border-muted">
        <CardContent className="pt-4">
          <h6 className="font-medium mb-3">Como funciona a Matriz GUT</h6>
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Gravidade:</strong> Intensidade dos danos se o risco se materializar</p>
            <p><strong>Urgência:</strong> Necessidade de resolução rápida do risco</p>
            <p><strong>Tendência:</strong> Probabilidade do risco piorar ao longo do tempo</p>
            <p className="pt-2 border-t">
              <strong>Score GUT:</strong> Gravidade × Urgência × Tendência = {gutScore > 0 ? gutScore : 'Aguardando avaliação'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GUTMatrixSection;