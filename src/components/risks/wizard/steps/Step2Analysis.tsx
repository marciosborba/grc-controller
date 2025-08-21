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
  Target,
  Shield,
  Globe,
  Activity,
  Database
} from 'lucide-react';
import { useTenantSettings } from '@/hooks/useTenantSettings';

interface Step2Props {
  data: any;
  updateData: (data: any) => void;
  registrationId?: string | null;
  onSave?: () => void;
}

const METHODOLOGIES = [
  // Metodologias Clássicas
  {
    value: 'qualitative',
    name: 'Análise Qualitativa',
    description: 'Avaliação baseada em escalas descritivas de impacto e probabilidade',
    icon: '📊',
    complexity: 'Baixa',
    timeRequired: '15-30 min',
    bestFor: 'Riscos operacionais, processos gerais',
    category: 'traditional'
  },
  {
    value: 'quantitative',
    name: 'Análise Quantitativa',
    description: 'Avaliação baseada em valores monetários e percentuais específicos',
    icon: '💰',
    complexity: 'Alta',
    timeRequired: '45-90 min',
    bestFor: 'Riscos financeiros, investimentos',
    category: 'traditional'
  },
  {
    value: 'semi_quantitative',
    name: 'Análise Semi-Quantitativa',
    description: 'Combinação de escalas qualitativas com valores numéricos',
    icon: '⚖️',
    complexity: 'Média',
    timeRequired: '30-45 min',
    bestFor: 'Riscos estratégicos, projetos',
    category: 'traditional'
  },
  
  // Frameworks Internacionais
  {
    value: 'nist',
    name: 'NIST Cybersecurity Framework',
    description: 'Framework do NIST para gestão de riscos de cibersegurança com 5 funções principais',
    icon: '🛡️',
    complexity: 'Alta',
    timeRequired: '60-120 min',
    bestFor: 'Riscos de segurança cibernética, tecnologia',
    category: 'framework'
  },
  {
    value: 'iso31000',
    name: 'ISO 31000',
    description: 'Padrão internacional para gestão de riscos com princípios e diretrizes',
    icon: '🌐',
    complexity: 'Média',
    timeRequired: '45-90 min',
    bestFor: 'Todos os tipos de riscos, governança',
    category: 'framework'
  },
  
  // Metodologias Avançadas
  {
    value: 'monte_carlo',
    name: 'Simulação Monte Carlo',
    description: 'Simulação estatística para modelagem de incertezas e cenários probabilísticos',
    icon: '🎲',
    complexity: 'Muito Alta',
    timeRequired: '120-240 min',
    bestFor: 'Riscos financeiros complexos, projetos de investimento',
    category: 'advanced'
  },
  {
    value: 'fair',
    name: 'FAIR (Factor Analysis)',
    description: 'Framework quantitativo para análise de riscos baseado em frequência e magnitude',
    icon: '📈',
    complexity: 'Muito Alta',
    timeRequired: '90-180 min',
    bestFor: 'Riscos de segurança da informação, análise econômica',
    category: 'advanced'
  },
  
  // Metodologias Especializadas
  {
    value: 'bow_tie',
    name: 'Bow-Tie Analysis',
    description: 'Análise estruturada de causas e consequências com barreiras',
    icon: '🎯',
    complexity: 'Alta',
    timeRequired: '60-120 min',
    bestFor: 'Riscos de segurança, operacionais críticos',
    category: 'specialized'
  },
  {
    value: 'fmea',
    name: 'FMEA',
    description: 'Análise de Modo de Falha e Efeitos com detectabilidade',
    icon: '🔧',
    complexity: 'Alta',
    timeRequired: '90-180 min',
    bestFor: 'Processos técnicos, manufatura',
    category: 'specialized'
  }
];

const METHODOLOGY_CATEGORIES = {
  traditional: { label: 'Metodologias Tradicionais', color: 'bg-blue-500' },
  framework: { label: 'Frameworks Internacionais', color: 'bg-green-500' },
  advanced: { label: 'Metodologias Avançadas', color: 'bg-purple-500' },
  specialized: { label: 'Metodologias Especializadas', color: 'bg-orange-500' }
};

// Escalas qualitativas adaptáveis conforme configuração da tenant
const getQualitativeScales = (tenantSettings: any) => {
  const isMatrix4x4 = tenantSettings?.risk_matrix?.type === '4x4';
  const matrixLabels = tenantSettings?.risk_matrix;
  
  if (isMatrix4x4) {
    // Matriz 4x4 - 4 níveis
    return {
      impact: [
        { value: 1, label: matrixLabels?.impact_labels?.[0] || 'Insignificante', description: 'Impacto mínimo nas operações', color: 'bg-green-500' },
        { value: 2, label: matrixLabels?.impact_labels?.[1] || 'Menor', description: 'Impacto limitado, facilmente gerenciável', color: 'bg-yellow-500' },
        { value: 3, label: matrixLabels?.impact_labels?.[2] || 'Moderado', description: 'Impacto significativo mas controlável', color: 'bg-orange-500' },
        { value: 4, label: matrixLabels?.impact_labels?.[3] || 'Maior', description: 'Impacto severo nos objetivos', color: 'bg-red-500' }
      ],
      likelihood: [
        { value: 1, label: matrixLabels?.likelihood_labels?.[0] || 'Raro', description: 'Pode ocorrer apenas em circunstâncias excepcionais (< 10%)', color: 'bg-green-500' },
        { value: 2, label: matrixLabels?.likelihood_labels?.[1] || 'Improvável', description: 'Não se espera que ocorra (10-40%)', color: 'bg-yellow-500' },
        { value: 3, label: matrixLabels?.likelihood_labels?.[2] || 'Possível', description: 'Pode ocorrer em algum momento (40-70%)', color: 'bg-orange-500' },
        { value: 4, label: matrixLabels?.likelihood_labels?.[3] || 'Provável', description: 'Provavelmente ocorrerá (> 70%)', color: 'bg-red-500' }
      ]
    };
  } else {
    // Matriz 5x5 - 5 níveis (padrão)
    return {
      impact: [
        { value: 1, label: matrixLabels?.impact_labels?.[0] || 'Insignificante', description: 'Impacto mínimo nas operações', color: 'bg-green-500' },
        { value: 2, label: matrixLabels?.impact_labels?.[1] || 'Menor', description: 'Impacto limitado, facilmente gerenciável', color: 'bg-yellow-500' },
        { value: 3, label: matrixLabels?.impact_labels?.[2] || 'Moderado', description: 'Impacto significativo mas controlável', color: 'bg-orange-400' },
        { value: 4, label: matrixLabels?.impact_labels?.[3] || 'Maior', description: 'Impacto severo nos objetivos', color: 'bg-orange-600' },
        { value: 5, label: matrixLabels?.impact_labels?.[4] || 'Catastrófico', description: 'Impacto crítico, ameaça à continuidade', color: 'bg-red-500' }
      ],
      likelihood: [
        { value: 1, label: matrixLabels?.likelihood_labels?.[0] || 'Raro', description: 'Pode ocorrer apenas em circunstâncias excepcionais (< 5%)', color: 'bg-green-500' },
        { value: 2, label: matrixLabels?.likelihood_labels?.[1] || 'Improvável', description: 'Não se espera que ocorra (5-25%)', color: 'bg-yellow-500' },
        { value: 3, label: matrixLabels?.likelihood_labels?.[2] || 'Possível', description: 'Pode ocorrer em algum momento (25-50%)', color: 'bg-orange-400' },
        { value: 4, label: matrixLabels?.likelihood_labels?.[3] || 'Provável', description: 'Provavelmente ocorrerá (50-75%)', color: 'bg-orange-600' },
        { value: 5, label: matrixLabels?.likelihood_labels?.[4] || 'Quase Certo', description: 'Espera-se que ocorra (> 75%)', color: 'bg-red-500' }
      ]
    };
  }
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

  // Função de fallback para calcular nível de risco
  const calculateRiskLevelFallback = (score: number, tenantSettings: any) => {
    const isMatrix4x4 = tenantSettings?.risk_matrix?.type === '4x4';
    
    if (isMatrix4x4) {
      // Matriz 4x4: Baixo (1-2), Médio (3-6), Alto (7-12), Crítico (13-16)
      if (score >= 13) return 'Crítico';
      else if (score >= 7) return 'Alto';
      else if (score >= 3) return 'Médio';
      else return 'Baixo';
    } else {
      // Matriz 5x5: Muito Baixo (1-2), Baixo (3-4), Médio (5-8), Alto (9-19), Muito Alto (20-25)
      if (score >= 20) return 'Muito Alto';
      else if (score >= 9) return 'Alto';
      else if (score >= 5) return 'Médio';
      else if (score >= 3) return 'Baixo';
      else return 'Muito Baixo';
    }
  };

  // Calcular score e nível do risco baseado na configuração da tenant
  useEffect(() => {
    if (impactScore && likelihoodScore) {
      const score = impactScore * likelihoodScore;
      setRiskScore(score);
      
      // Usar função do hook para calcular nível baseado na configuração da tenant
      const level = tenantSettings?.calculateRiskLevel ? 
        tenantSettings.calculateRiskLevel(likelihoodScore, impactScore) :
        calculateRiskLevelFallback(score, tenantSettings);
      
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
      case 'muito alto': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const selectedMethodologyDetails = METHODOLOGIES.find(m => m.value === selectedMethodology);
  
  // Obter escalas adaptadas à configuração da tenant
  const qualitativeScales = getQualitativeScales(tenantSettings);
  const maxScale = tenantSettings?.risk_matrix?.type === '4x4' ? 4 : 5;

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
          {/* Renderizar por categorias */}
          {Object.entries(METHODOLOGY_CATEGORIES).map(([categoryKey, category]) => {
            const methodologiesInCategory = METHODOLOGIES.filter(m => m.category === categoryKey);
            if (methodologiesInCategory.length === 0) return null;
            
            return (
              <div key={categoryKey} className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-3 h-3 rounded-full ${category.color}`} />
                  <h4 className="font-semibold text-sm">{category.label}</h4>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {methodologiesInCategory.map((methodology) => (
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
              </div>
            );
          })}

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
                    max={maxScale}
                    min={1}
                    step={1}
                    className="mb-4"
                  />
                  
                  <div className="text-center mb-4">
                    <Badge 
                      className={`${qualitativeScales.impact[impactScore - 1]?.color} text-white text-lg px-4 py-2`}
                    >
                      {impactScore} - {qualitativeScales.impact[impactScore - 1]?.label}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {qualitativeScales.impact.map((scale, index) => (
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
                    max={maxScale}
                    min={1}
                    step={1}
                    className="mb-4"
                  />
                  
                  <div className="text-center mb-4">
                    <Badge 
                      className={`${qualitativeScales.likelihood[likelihoodScore - 1]?.color} text-white text-lg px-4 py-2`}
                    >
                      {likelihoodScore} - {qualitativeScales.likelihood[likelihoodScore - 1]?.label}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {qualitativeScales.likelihood.map((scale, index) => (
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

      {/* NIST Cybersecurity Framework */}
      {selectedMethodology === 'nist' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              NIST Cybersecurity Framework
            </CardTitle>
            <CardDescription>
              Avaliação baseada nas 5 funções do NIST: Identify, Protect, Detect, Respond, Recover.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>NIST Framework:</strong> Avalie o risco considerando as capacidades atuais da organização 
                em cada uma das 5 funções principais do framework.
              </AlertDescription>
            </Alert>
            
            {/* Avaliação das 5 Funções NIST */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label className="flex items-center gap-2 mb-4">
                  <Shield className="h-4 w-4" />
                  Impacto Potencial
                </Label>
                <Select value={data.impact_score?.toString() || ''} onValueChange={(value) => setImpactScore(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível de impacto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Informativo (Low)</SelectItem>
                    <SelectItem value="2">2 - Baixo (Low)</SelectItem>
                    <SelectItem value="3">3 - Moderado (Moderate)</SelectItem>
                    <SelectItem value="4">4 - Alto (High)</SelectItem>
                    <SelectItem value="5">5 - Crítico (Critical)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="flex items-center gap-2 mb-4">
                  <Activity className="h-4 w-4" />
                  Probabilidade de Ocorrência
                </Label>
                <Select value={data.likelihood_score?.toString() || ''} onValueChange={(value) => setLikelihoodScore(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a probabilidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Muito Baixa (&lt;10%)</SelectItem>
                    <SelectItem value="2">2 - Baixa (10-30%)</SelectItem>
                    <SelectItem value="3">3 - Média (30-50%)</SelectItem>
                    <SelectItem value="4">4 - Alta (50-70%)</SelectItem>
                    <SelectItem value="5">5 - Muito Alta (&gt;70%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {impactScore && likelihoodScore && (
              <Card className="bg-slate-50 dark:bg-slate-900">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold mb-2">Avaliação NIST</div>
                    <div className="flex justify-center gap-8 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{impactScore}</div>
                        <div className="text-sm text-muted-foreground">Impacto</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{likelihoodScore}</div>
                        <div className="text-sm text-muted-foreground">Probabilidade</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{riskScore}</div>
                        <div className="text-sm text-muted-foreground">Score</div>
                      </div>
                    </div>
                    <Badge className={`${getRiskLevelColor(riskLevel)} text-white text-lg px-4 py-2`}>
                      {riskLevel}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      {/* ISO 31000 */}
      {selectedMethodology === 'iso31000' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              ISO 31000 - Gestão de Riscos
            </CardTitle>
            <CardDescription>
              Avaliação estruturada baseada nos princípios e diretrizes da ISO 31000.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>ISO 31000:</strong> Framework internacional para gestão de riscos focado em 
                integração, estrutura, processo e melhoria contínua.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-4 w-4" />
                  Consequência/Impacto
                </Label>
                <Select value={data.impact_score?.toString() || ''} onValueChange={(value) => setImpactScore(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Avalie as consequências" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Insignificante</SelectItem>
                    <SelectItem value="2">2 - Pequena</SelectItem>
                    <SelectItem value="3">3 - Moderada</SelectItem>
                    <SelectItem value="4">4 - Grande</SelectItem>
                    <SelectItem value="5">5 - Severa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-4 w-4" />
                  Verossimilhança
                </Label>
                <Select value={data.likelihood_score?.toString() || ''} onValueChange={(value) => setLikelihoodScore(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Avalie a verossimilhança" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Raro</SelectItem>
                    <SelectItem value="2">2 - Improvável</SelectItem>
                    <SelectItem value="3">3 - Possível</SelectItem>
                    <SelectItem value="4">4 - Provável</SelectItem>
                    <SelectItem value="5">5 - Quase Certo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {impactScore && likelihoodScore && (
              <Card className="bg-slate-50 dark:bg-slate-900">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold mb-2">Matriz de Risco ISO 31000</div>
                    <Badge className={`${getRiskLevelColor(riskLevel)} text-white text-lg px-4 py-2`}>
                      Nível: {riskLevel} (Score: {riskScore})
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      {/* Monte Carlo Simulation */}
      {selectedMethodology === 'monte_carlo' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Simulação Monte Carlo
            </CardTitle>
            <CardDescription>
              Análise quantitativa avançada com modelagem estatística de cenários.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Monte Carlo:</strong> Simulação estatística para modelar incertezas e 
                gerar distribuições probabilísticas de resultados.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-semibold mb-2">Parâmetros de Impacto Financeiro</Label>
                <div className="space-y-4">
                  <div>
                    <Label>Valor Mínimo (R$)</Label>
                    <Input 
                      type="number" 
                      placeholder="Ex: 10000"
                      onChange={(e) => updateData({ 
                        methodology_config: { 
                          ...data.methodology_config, 
                          min_impact: parseFloat(e.target.value) 
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Valor Máximo (R$)</Label>
                    <Input 
                      type="number" 
                      placeholder="Ex: 500000"
                      onChange={(e) => updateData({ 
                        methodology_config: { 
                          ...data.methodology_config, 
                          max_impact: parseFloat(e.target.value) 
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Valor Mais Provável (R$)</Label>
                    <Input 
                      type="number" 
                      placeholder="Ex: 150000"
                      onChange={(e) => updateData({ 
                        methodology_config: { 
                          ...data.methodology_config, 
                          most_likely_impact: parseFloat(e.target.value) 
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-semibold mb-2">Parâmetros de Frequência</Label>
                <div className="space-y-4">
                  <div>
                    <Label>Frequência Mínima (por ano)</Label>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder="Ex: 0.1"
                      onChange={(e) => updateData({ 
                        methodology_config: { 
                          ...data.methodology_config, 
                          min_frequency: parseFloat(e.target.value) 
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Frequência Máxima (por ano)</Label>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder="Ex: 5.0"
                      onChange={(e) => updateData({ 
                        methodology_config: { 
                          ...data.methodology_config, 
                          max_frequency: parseFloat(e.target.value) 
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Frequência Mais Provável (por ano)</Label>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder="Ex: 1.5"
                      onChange={(e) => updateData({ 
                        methodology_config: { 
                          ...data.methodology_config, 
                          most_likely_frequency: parseFloat(e.target.value) 
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-slate-50 dark:bg-slate-900">
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-lg font-semibold mb-2">Simulação Configurada</div>
                  <p className="text-sm text-muted-foreground">
                    Os parâmetros definidos serão utilizados para gerar distribuições probabilísticas 
                    e calcular métricas como VaR (Value at Risk) e Expected Loss.
                  </p>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}

      {/* FAIR Analysis */}
      {selectedMethodology === 'fair' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              FAIR - Factor Analysis of Information Risk
            </CardTitle>
            <CardDescription>
              Framework quantitativo focado em frequência e magnitude de perdas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>FAIR:</strong> Metodologia que decompõe o risco em fatores de 
                frequência (LEF) e magnitude de impacto (LM) para análise quantitativa precisa.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-semibold mb-4">Frequência de Eventos de Perda (LEF)</Label>
                <div className="space-y-4">
                  <div>
                    <Label>Threat Event Frequency (TEF)</Label>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder="Eventos por ano"
                      onChange={(e) => updateData({ 
                        methodology_config: { 
                          ...data.methodology_config, 
                          tef: parseFloat(e.target.value) 
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Vulnerability (V) %</Label>
                    <Input 
                      type="number" 
                      min="0" 
                      max="100"
                      placeholder="0-100%"
                      onChange={(e) => updateData({ 
                        methodology_config: { 
                          ...data.methodology_config, 
                          vulnerability: parseFloat(e.target.value) / 100 
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Threat Capability (TC)</Label>
                    <Select onValueChange={(value) => updateData({ 
                      methodology_config: { 
                        ...data.methodology_config, 
                        threat_capability: value 
                      }
                    })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Capacidade da ameaça" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="very_high">Muito Alta</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="very_low">Muito Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-semibold mb-4">Magnitude de Perda (LM)</Label>
                <div className="space-y-4">
                  <div>
                    <Label>Primary Loss (R$)</Label>
                    <Input 
                      type="number" 
                      placeholder="Perda primária"
                      onChange={(e) => updateData({ 
                        methodology_config: { 
                          ...data.methodology_config, 
                          primary_loss: parseFloat(e.target.value) 
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Secondary Loss (R$)</Label>
                    <Input 
                      type="number" 
                      placeholder="Perda secundária"
                      onChange={(e) => updateData({ 
                        methodology_config: { 
                          ...data.methodology_config, 
                          secondary_loss: parseFloat(e.target.value) 
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Control Strength</Label>
                    <Select onValueChange={(value) => updateData({ 
                      methodology_config: { 
                        ...data.methodology_config, 
                        control_strength: value 
                      }
                    })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Força dos controles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="very_high">Muito Alta</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="very_low">Muito Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-slate-50 dark:bg-slate-900">
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-lg font-semibold mb-2">Análise FAIR Configurada</div>
                  <p className="text-sm text-muted-foreground">
                    Os fatores FAIR permitirão calcular distribuições de risco quantitativas 
                    baseadas em frequência e magnitude de eventos de perda.
                  </p>
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