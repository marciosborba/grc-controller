import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Scale,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  Target,
  Gauge
} from 'lucide-react';

interface Step3Props {
  data: any;
  updateData: (data: any) => void;
  registrationId?: string | null;
  onSave?: () => void;
}

// Escalas GUT padronizadas
const GUT_SCALES = {
  gravity: [
    { 
      value: 5, 
      label: 'Extremamente Grave', 
      description: 'Impactos extremos, ameaça à continuidade do negócio',
      color: 'bg-red-600',
      examples: 'Falha total de sistemas críticos, violação regulatória grave, perda de licença'
    },
    { 
      value: 4, 
      label: 'Muito Grave', 
      description: 'Impactos severos nos objetivos organizacionais',
      color: 'bg-red-500',
      examples: 'Perda significativa de clientes, multas regulatórias, danos à reputação'
    },
    { 
      value: 3, 
      label: 'Grave', 
      description: 'Impactos consideráveis mas controláveis',
      color: 'bg-orange-500',
      examples: 'Atrasos em projetos críticos, custos adicionais significativos'
    },
    { 
      value: 2, 
      label: 'Pouco Grave', 
      description: 'Impactos limitados e facilmente gerenciáveis',
      color: 'bg-yellow-500',
      examples: 'Pequenos atrasos operacionais, custos menores não previstos'
    },
    { 
      value: 1, 
      label: 'Sem Gravidade', 
      description: 'Impactos mínimos ou imperceptíveis',
      color: 'bg-green-500',
      examples: 'Inconvenientes menores, ajustes de rotina'
    }
  ],
  urgency: [
    { 
      value: 5, 
      label: 'Ação Imediata', 
      description: 'Requer ação imediata (horas/dias)',
      color: 'bg-red-600',
      examples: 'Situações de emergência, falhas críticas em andamento'
    },
    { 
      value: 4, 
      label: 'Com Alguma Urgência', 
      description: 'Requer ação rápida (semanas)',
      color: 'bg-red-500',
      examples: 'Problemas que podem escalar rapidamente'
    },
    { 
      value: 3, 
      label: 'Normal', 
      description: 'Prazo normal de resposta (meses)',
      color: 'bg-orange-500',
      examples: 'Situações dentro do cronograma padrão'
    },
    { 
      value: 2, 
      label: 'Pode Esperar', 
      description: 'Pode ser tratado posteriormente (trimestres)',
      color: 'bg-yellow-500',
      examples: 'Melhorias de processo, otimizações'
    },
    { 
      value: 1, 
      label: 'Não Tem Pressa', 
      description: 'Sem urgência específica (anual ou mais)',
      color: 'bg-green-500',
      examples: 'Projetos de longo prazo, revisões estratégicas'
    }
  ],
  tendency: [
    { 
      value: 5, 
      label: 'Piorar Rapidamente', 
      description: 'Tende a piorar muito rapidamente se não tratado',
      color: 'bg-red-600',
      examples: 'Problemas com efeito cascata, deterioração exponencial'
    },
    { 
      value: 4, 
      label: 'Piorar', 
      description: 'Tende a piorar progressivamente',
      color: 'bg-red-500',
      examples: 'Problemas que tendem a crescer ao longo do tempo'
    },
    { 
      value: 3, 
      label: 'Permanecer Igual', 
      description: 'Tende a permanecer no mesmo nível',
      color: 'bg-orange-500',
      examples: 'Situações estáveis, problemas constantes'
    },
    { 
      value: 2, 
      label: 'Melhorar', 
      description: 'Tende a melhorar naturalmente',
      color: 'bg-yellow-500',
      examples: 'Situações temporárias, problemas que se auto-resolvem'
    },
    { 
      value: 1, 
      label: 'Melhorar Rapidamente', 
      description: 'Tende a se resolver rapidamente sem intervenção',
      color: 'bg-green-500',
      examples: 'Problemas temporários, sazonais'
    }
  ]
};

// Função para calcular prioridade GUT
const calculateGUTPriority = (gravity: number, urgency: number, tendency: number) => {
  const score = gravity * urgency * tendency;
  
  if (score >= 100) return { level: 'Crítica', color: 'bg-red-600', description: 'Máxima prioridade - Ação imediata' };
  if (score >= 50) return { level: 'Alta', color: 'bg-red-500', description: 'Alta prioridade - Ação em curto prazo' };
  if (score >= 25) return { level: 'Média', color: 'bg-orange-500', description: 'Prioridade média - Ação em médio prazo' };
  if (score >= 10) return { level: 'Baixa', color: 'bg-yellow-500', description: 'Baixa prioridade - Pode aguardar' };
  return { level: 'Muito Baixa', color: 'bg-green-500', description: 'Prioridade muito baixa - Monitoramento' };
};

export const Step3Classification: React.FC<Step3Props> = ({
  data,
  updateData
}) => {
  const [gravity, setGravity] = useState(data.gut_gravity || 1);
  const [urgency, setUrgency] = useState(data.gut_urgency || 1);
  const [tendency, setTendency] = useState(data.gut_tendency || 1);
  const [gutScore, setGutScore] = useState(0);
  const [priority, setPriority] = useState<any>({});

  // Calcular score e prioridade GUT
  useEffect(() => {
    if (gravity >= 1 && urgency >= 1 && tendency >= 1) {
      const score = gravity * urgency * tendency;
      const priorityData = calculateGUTPriority(gravity, urgency, tendency);
      
      setGutScore(score);
      setPriority(priorityData);
      
      updateData({
        gut_gravity: gravity,
        gut_urgency: urgency,
        gut_tendency: tendency,
        gut_priority: priorityData.level
      });
    }
  }, [gravity, urgency, tendency, updateData]);

  const renderGUTFactor = (
    factor: 'gravity' | 'urgency' | 'tendency',
    value: number,
    setValue: (value: number) => void,
    icon: React.ReactNode,
    title: string,
    subtitle: string
  ) => {
    const scales = GUT_SCALES[factor];
    const selectedScale = scales.find(s => s.value === value);

    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
          </CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select 
              value={value.toString()} 
              onValueChange={(val) => setValue(parseInt(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível..." />
              </SelectTrigger>
              <SelectContent>
                {scales.map((scale) => (
                  <SelectItem key={scale.value} value={scale.value.toString()}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${scale.color}`} />
                      {scale.value} - {scale.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedScale && (
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${selectedScale.color} bg-opacity-10 border`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-4 h-4 rounded-full ${selectedScale.color}`} />
                    <span className="font-semibold">{selectedScale.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedScale.description}
                  </p>
                  <p className="text-xs italic">
                    <strong>Exemplos:</strong> {selectedScale.examples}
                  </p>
                </div>
              </div>
            )}

            {/* Escala visual */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Escala de Avaliação:</Label>
              {scales.map((scale, index) => (
                <div 
                  key={scale.value}
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-all ${
                    value === scale.value 
                      ? 'bg-primary/10 border-primary' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setValue(scale.value)}
                >
                  <div className={`w-3 h-3 rounded-full ${scale.color}`} />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{scale.value} - {scale.label}</div>
                    <div className="text-xs text-muted-foreground">{scale.description}</div>
                  </div>
                  {value === scale.value && <CheckCircle className="h-4 w-4 text-primary" />}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const isComplete = gravity > 0 && urgency > 0 && tendency > 0;

  return (
    <div className="space-y-6">
      {/* Introdução à Metodologia GUT */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Classificação GUT (Gravidade, Urgência e Tendência)
          </CardTitle>
          <CardDescription>
            Utilize a metodologia GUT para priorizar o tratamento deste risco com base em critérios objetivos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Metodologia GUT:</strong> Ferramenta para priorização que avalia três dimensões:
              <ul className="mt-2 space-y-1 text-sm">
                <li>• <strong>Gravidade:</strong> Intensidade dos danos se o risco se materializar</li>
                <li>• <strong>Urgência:</strong> Prazo necessário para tratar o risco</li>
                <li>• <strong>Tendência:</strong> Evolução natural do risco ao longo do tempo</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Avaliação dos Fatores GUT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {renderGUTFactor(
          'gravity',
          gravity,
          setGravity,
          <AlertTriangle className="h-5 w-5 text-red-500" />,
          'Gravidade (G)',
          'Intensidade dos danos ou impactos'
        )}

        {renderGUTFactor(
          'urgency',
          urgency,
          setUrgency,
          <Clock className="h-5 w-5 text-orange-500" />,
          'Urgência (U)',
          'Prazo para tratar o risco'
        )}

        {renderGUTFactor(
          'tendency',
          tendency,
          setTendency,
          <TrendingUp className="h-5 w-5 text-blue-500" />,
          'Tendência (T)',
          'Evolução natural do risco'
        )}
      </div>

      {/* Resultado da Classificação GUT */}
      {isComplete && (
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-background to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-primary" />
              Resultado da Classificação GUT
            </CardTitle>
            <CardDescription>
              Score calculado e prioridade de tratamento determinada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cálculo */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Cálculo GUT
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Gravidade (G):</span>
                    <Badge variant="outline" className="font-mono">{gravity}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Urgência (U):</span>
                    <Badge variant="outline" className="font-mono">{urgency}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tendência (T):</span>
                    <Badge variant="outline" className="font-mono">{tendency}</Badge>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Score GUT:</span>
                      <Badge className="font-mono text-lg px-3 py-1">
                        {gravity} × {urgency} × {tendency} = {gutScore}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prioridade */}
              <div className="space-y-4">
                <h4 className="font-semibold">Prioridade de Tratamento</h4>
                <div className="text-center">
                  <Badge 
                    className={`${priority.color} text-white text-xl px-6 py-3 mb-3`}
                  >
                    Prioridade {priority.level}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {priority.description}
                  </p>
                </div>

                {/* Escala de Prioridade */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Escala de Prioridade:</Label>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-red-600" />
                      <span>Crítica (&ge;100): Ação imediata</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span>Alta (50-99): Curto prazo</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      <span>Média (25-49): Médio prazo</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span>Baixa (10-24): Longo prazo</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span>Muito Baixa (&lt;10): Monitoramento</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Barra de Progresso Visual */}
            <div className="mt-6">
              <Label className="text-sm font-medium">Posição na Escala GUT</Label>
              <Progress value={(gutScore / 125) * 100} className="mt-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0</span>
                <span className="font-medium">Score: {gutScore}</span>
                <span>125</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status da Etapa */}
      <Card className="bg-slate-50 dark:bg-slate-900">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                isComplete ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <span className="text-sm font-medium">
                Status da Etapa 3: Classificação GUT
              </span>
            </div>
            <div className="text-right">
              {isComplete ? (
                <div>
                  <div className="text-sm font-semibold text-green-600">Completa</div>
                  <div className="text-xs text-muted-foreground">
                    Prioridade: {priority.level}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-amber-600">
                  {[gravity, urgency, tendency].filter(v => v > 0).length}/3 fatores avaliados
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};