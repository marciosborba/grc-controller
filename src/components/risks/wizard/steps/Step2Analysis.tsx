import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Calculator, 
  Info, 
  TrendingUp, 
  Zap, 
  AlertCircle,
  CheckCircle,
  Target
} from 'lucide-react';
import { useTenantSettings } from '@/hooks/useTenantSettings';

interface Step2Props {
  data: any;
  updateData: (data: any) => void;
  registrationId?: string | null;
  onSave?: () => void;
}

const METHODOLOGIES = [
  {
    value: 'qualitative',
    name: 'Análise Qualitativa',
    description: 'Avaliação baseada em escalas descritivas de impacto e probabilidade',
    icon: '📊',
    complexity: 'Baixa',
    timeRequired: '15-30 min',
    bestFor: 'Riscos operacionais, processos gerais'
  },
  {
    value: 'quantitative',
    name: 'Análise Quantitativa',
    description: 'Avaliação baseada em valores monetários e percentuais específicos',
    icon: '💰',
    complexity: 'Alta',
    timeRequired: '45-90 min',
    bestFor: 'Riscos financeiros, investimentos'
  },
  {
    value: 'semi_quantitative',
    name: 'Análise Semi-Quantitativa',
    description: 'Combinação de escalas qualitativas com valores numéricos',
    icon: '⚖️',
    complexity: 'Média',
    timeRequired: '30-45 min',
    bestFor: 'Riscos estratégicos, projetos'
  },
  {
    value: 'bow_tie',
    name: 'Bow-Tie Analysis',
    description: 'Análise estruturada de causas e consequências com barreiras',
    icon: '🎯',
    complexity: 'Alta',
    timeRequired: '60-120 min',
    bestFor: 'Riscos de segurança, operacionais críticos'
  },
  {
    value: 'fmea',
    name: 'FMEA',
    description: 'Análise de Modo de Falha e Efeitos com detectabilidade',
    icon: '🔧',
    complexity: 'Alta',
    timeRequired: '90-180 min',
    bestFor: 'Processos técnicos, manufatura'
  }
];

const QUALITATIVE_SCALES = {
  impact: [
    { value: 1, label: 'Insignificante', description: 'Impacto mínimo nas operações', color: 'bg-green-500' },
    { value: 2, label: 'Menor', description: 'Impacto limitado, facilmente gerenciável', color: 'bg-yellow-500' },
    { value: 3, label: 'Moderado', description: 'Impacto significativo mas controlável', color: 'bg-orange-400' },
    { value: 4, label: 'Maior', description: 'Impacto severo nos objetivos', color: 'bg-orange-600' },
    { value: 5, label: 'Catastrófico', description: 'Impacto crítico, ameaça à continuidade', color: 'bg-red-500' }
  ],
  likelihood: [
    { value: 1, label: 'Raro', description: 'Pode ocorrer apenas em circunstâncias excepcionais (< 5%)', color: 'bg-green-500' },
    { value: 2, label: 'Improvável', description: 'Não se espera que ocorra (5-25%)', color: 'bg-yellow-500' },
    { value: 3, label: 'Possível', description: 'Pode ocorrer em algum momento (25-50%)', color: 'bg-orange-400' },
    { value: 4, label: 'Provável', description: 'Provavelmente ocorrerá (50-75%)', color: 'bg-orange-600' },
    { value: 5, label: 'Quase Certo', description: 'Espera-se que ocorra (> 75%)', color: 'bg-red-500' }
  ]
};

export const Step2Analysis: React.FC<Step2Props> = ({
  data,
  updateData
}) => {
  const { tenantSettings } = useTenantSettings();
  const [selectedMethodology, setSelectedMethodology] = useState(data.analysis_methodology || '');
  const [impactScore, setImpactScore] = useState(data.impact_score || 1);
  const [likelihoodScore, setLikelihoodScore] = useState(data.likelihood_score || 1);
  const [riskScore, setRiskScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState('');

  // Calcular score e nível do risco
  useEffect(() => {
    if (impactScore && likelihoodScore) {
      const score = impactScore * likelihoodScore;
      setRiskScore(score);
      
      // Determinar nível baseado na configuração da tenant
      const isMatrix5x5 = tenantSettings?.risk_matrix?.type === '5x5';
      let level = '';
      
      if (isMatrix5x5) {
        if (score >= 20) level = 'Crítico';
        else if (score >= 9) level = 'Alto';
        else if (score >= 5) level = 'Médio';
        else if (score >= 3) level = 'Baixo';
        else level = 'Muito Baixo';
      } else {
        if (score >= 16) level = 'Crítico';
        else if (score >= 8) level = 'Alto';
        else if (score >= 3) level = 'Médio';
        else level = 'Baixo';
      }
      
      setRiskLevel(level);
      
      updateData({
        impact_score: impactScore,
        likelihood_score: likelihoodScore,
        risk_score: score,
        risk_level: level,
        analysis_methodology: selectedMethodology
      });
    }
  }, [impactScore, likelihoodScore, selectedMethodology, tenantSettings]);

  const handleMethodologyChange = (methodology: string) => {
    setSelectedMethodology(methodology);
    updateData({ analysis_methodology: methodology });
  };

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'muito baixo': return 'bg-blue-500';
      case 'baixo': return 'bg-green-500';
      case 'médio': return 'bg-yellow-500';
      case 'alto': return 'bg-orange-500';
      case 'crítico': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const selectedMethodologyDetails = METHODOLOGIES.find(m => m.value === selectedMethodology);

  return (
    <div className="space-y-6">
      {/* Seleção de Metodologia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Seleção da Metodologia de Análise
          </CardTitle>
          <CardDescription>
            Escolha a metodologia mais adequada para avaliar este risco específico.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {METHODOLOGIES.map((methodology) => (
              <Card 
                key={methodology.value}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedMethodology === methodology.value 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handleMethodologyChange(methodology.value)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{methodology.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{methodology.name}</h3>
                        {selectedMethodology === methodology.value && (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {methodology.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {methodology.complexity} complexidade
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {methodology.timeRequired}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        <strong>Ideal para:</strong> {methodology.bestFor}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedMethodologyDetails && (
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>{selectedMethodologyDetails.name} selecionada.</strong> 
                {' '}{selectedMethodologyDetails.description}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Avaliação de Impacto e Probabilidade */}
      {selectedMethodology === 'qualitative' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Avaliação Qualitativa
            </CardTitle>
            <CardDescription>
              Avalie o impacto e a probabilidade usando as escalas descritivas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Avaliação de Impacto */}
              <div>
                <Label className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-4 w-4" />
                  Nível de Impacto
                </Label>
                
                <div className="space-y-3">
                  <Slider
                    value={[impactScore]}
                    onValueChange={(value) => setImpactScore(value[0])}
                    max={5}
                    min={1}
                    step={1}
                    className="mb-4"
                  />
                  
                  <div className="text-center mb-4">
                    <Badge 
                      className={`${QUALITATIVE_SCALES.impact[impactScore - 1]?.color} text-white text-lg px-4 py-2`}
                    >
                      {impactScore} - {QUALITATIVE_SCALES.impact[impactScore - 1]?.label}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {QUALITATIVE_SCALES.impact.map((scale, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          impactScore === scale.value 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setImpactScore(scale.value)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${scale.color}`} />
                          <div className="flex-1">
                            <div className="font-semibold">{scale.value} - {scale.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {scale.description}
                            </div>
                          </div>
                          {impactScore === scale.value && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Avaliação de Probabilidade */}
              <div>
                <Label className="flex items-center gap-2 mb-4">
                  <Zap className="h-4 w-4" />
                  Nível de Probabilidade
                </Label>
                
                <div className="space-y-3">
                  <Slider
                    value={[likelihoodScore]}
                    onValueChange={(value) => setLikelihoodScore(value[0])}
                    max={5}
                    min={1}
                    step={1}
                    className="mb-4"
                  />
                  
                  <div className="text-center mb-4">
                    <Badge 
                      className={`${QUALITATIVE_SCALES.likelihood[likelihoodScore - 1]?.color} text-white text-lg px-4 py-2`}
                    >
                      {likelihoodScore} - {QUALITATIVE_SCALES.likelihood[likelihoodScore - 1]?.label}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {QUALITATIVE_SCALES.likelihood.map((scale, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          likelihoodScore === scale.value 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setLikelihoodScore(scale.value)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${scale.color}`} />
                          <div className="flex-1">
                            <div className="font-semibold">{scale.value} - {scale.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {scale.description}
                            </div>
                          </div>
                          {likelihoodScore === scale.value && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Resultado da Análise */}
            <Card className="bg-slate-50 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Resultado da Análise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">{impactScore}</div>
                    <div className="text-sm text-muted-foreground">Nível de Impacto</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">{likelihoodScore}</div>
                    <div className="text-sm text-muted-foreground">Nível de Probabilidade</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">{riskScore}</div>
                    <div className="text-sm text-muted-foreground">Score de Risco</div>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <Badge 
                    className={`${getRiskLevelColor(riskLevel)} text-white text-xl px-6 py-3`}
                  >
                    Risco {riskLevel}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}

      {/* Notas da Análise */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Observações da Análise
          </CardTitle>
          <CardDescription>
            Documente considerações adicionais, premissas ou justificativas para a avaliação realizada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.analysis_notes || ''}
            onChange={(e) => updateData({ analysis_notes: e.target.value })}
            placeholder="Ex: Considerou-se o cenário atual de controles internos. Análise baseada em dados históricos dos últimos 3 anos..."
            rows={4}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Inclua premissas, limitações ou contexto relevante para a análise
          </p>
        </CardContent>
      </Card>

      {/* Status da Etapa */}
      <Card className="bg-slate-50 dark:bg-slate-900">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                selectedMethodology && impactScore && likelihoodScore
                  ? 'bg-green-500' 
                  : 'bg-yellow-500'
              }`} />
              <span className="text-sm font-medium">
                Status da Etapa 2: Análise de Risco
              </span>
            </div>
            {riskScore > 0 && (
              <div className="text-right">
                <div className="text-sm font-semibold">Score Final: {riskScore}</div>
                <div className="text-xs text-muted-foreground">
                  {impactScore} × {likelihoodScore} = {riskScore}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};