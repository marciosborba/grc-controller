import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Eye,
  CheckCircle,
  AlertTriangle,
  TrendingDown,
  Calendar,
  BarChart3,
  FileCheck,
  Info,
  Target,
  Activity,
  Clock,
  Users,
  Flag,
  ChevronRight
} from 'lucide-react';
import { useTenantSettings } from '@/hooks/useTenantSettings';

interface Step7Props {
  data: any;
  updateData: (data: any) => void;
  registrationId?: string | null;
  onSave?: () => void;
}

const MONITORING_FREQUENCIES = [
  { value: 'daily', label: 'Diário', description: 'Para riscos críticos em evolução' },
  { value: 'weekly', label: 'Semanal', description: 'Para riscos altos com mudanças frequentes' },
  { value: 'monthly', label: 'Mensal', description: 'Para riscos moderados estáveis' },
  { value: 'quarterly', label: 'Trimestral', description: 'Para riscos baixos ou bem controlados' },
  { value: 'semiannual', label: 'Semestral', description: 'Para riscos aceitos com baixa volatilidade' },
  { value: 'annual', label: 'Anual', description: 'Para revisão geral e atualização de contexto' }
];

const CLOSURE_CRITERIA = [
  {
    value: 'risk_eliminated',
    label: 'Risco Eliminado',
    description: 'O risco foi completamente eliminado através das ações implementadas',
    icon: <CheckCircle className="h-5 w-5 text-green-500" />
  },
  {
    value: 'acceptable_level',
    label: 'Nível Aceitável Atingido',
    description: 'O risco foi reduzido a um nível aceitável para a organização',
    icon: <TrendingDown className="h-5 w-5 text-blue-500" />
  },
  {
    value: 'strategy_changed',
    label: 'Mudança de Estratégia',
    description: 'Nova estratégia de tratamento foi adotada (reiniciar processo)',
    icon: <Target className="h-5 w-5 text-orange-500" />
  },
  {
    value: 'context_changed',
    label: 'Contexto Alterado',
    description: 'Mudanças no ambiente tornaram o risco irrelevante',
    icon: <Activity className="h-5 w-5 text-purple-500" />
  }
];

// Função para obter níveis de risco residual baseados na configuração da tenant
const getResidualRiskLevels = (tenantSettings: any) => {
  const isMatrix4x4 = tenantSettings?.risk_matrix?.type === '4x4';
  
  if (isMatrix4x4) {
    // Matriz 4x4 - 4 níveis
    return [
      { value: 'low', label: 'Baixo', color: 'bg-green-500', score: '1-2' },
      { value: 'medium', label: 'Médio', color: 'bg-yellow-500', score: '3-6' },
      { value: 'high', label: 'Alto', color: 'bg-orange-500', score: '7-12' },
      { value: 'critical', label: 'Crítico', color: 'bg-red-500', score: '13-16' }
    ];
  } else {
    // Matriz 5x5 - 5 níveis (padrão)
    return [
      { value: 'very_low', label: 'Muito Baixo', color: 'bg-blue-500', score: '1-2' },
      { value: 'low', label: 'Baixo', color: 'bg-green-500', score: '3-4' },
      { value: 'medium', label: 'Médio', color: 'bg-yellow-500', score: '5-8' },
      { value: 'high', label: 'Alto', color: 'bg-orange-500', score: '9-19' },
      { value: 'critical', label: 'Muito Alto', color: 'bg-red-500', score: '20-25' }
    ];
  }
};

export const Step7Monitoring: React.FC<Step7Props> = ({
  data,
  updateData
}) => {
  const { tenantSettings } = useTenantSettings();
  const [monitoringFrequency, setMonitoringFrequency] = useState(data.monitoring_frequency || '');
  const [monitoringResponsible, setMonitoringResponsible] = useState(data.monitoring_responsible || '');
  const [reviewDate, setReviewDate] = useState(data.review_date || '');
  const [residualRiskLevel, setResidualRiskLevel] = useState(data.residual_risk_level || '');
  const [residualImpact, setResidualImpact] = useState(data.residual_impact || '');
  const [residualProbability, setResidualProbability] = useState(data.residual_probability || '');
  const [closureCriteria, setClosureCriteria] = useState(data.closure_criteria || '');
  const [monitoringNotes, setMonitoringNotes] = useState(data.monitoring_notes || '');
  const [kpiDefinition, setKpiDefinition] = useState(data.kpi_definition || '');

  // Obter níveis de risco residual baseados na configuração da tenant
  const residualRiskLevels = getResidualRiskLevels(tenantSettings);
  const maxScale = tenantSettings?.risk_matrix?.type === '4x4' ? 4 : 5;
  
  const selectedResidualLevel = residualRiskLevels.find(level => level.value === residualRiskLevel);
  const selectedClosureCriteria = CLOSURE_CRITERIA.find(criteria => criteria.value === closureCriteria);

  useEffect(() => {
    const residualScore = residualImpact && residualProbability ? 
      parseInt(residualImpact) * parseInt(residualProbability) : null;

    updateData({
      monitoring_frequency: monitoringFrequency,
      monitoring_responsible: monitoringResponsible,
      review_date: reviewDate,
      residual_risk_level: residualRiskLevel,
      residual_impact: residualImpact ? parseInt(residualImpact) : null,
      residual_probability: residualProbability ? parseInt(residualProbability) : null,
      residual_risk_score: residualScore,
      closure_criteria: closureCriteria,
      monitoring_notes: monitoringNotes,
      kpi_definition: kpiDefinition
    });
  }, [monitoringFrequency, monitoringResponsible, reviewDate, residualRiskLevel, 
      residualImpact, residualProbability, closureCriteria, monitoringNotes, kpiDefinition]);

  return (
    <div className="space-y-6">
      {/* Introdução */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Monitoramento e Encerramento
          </CardTitle>
          <CardDescription>
            Configure o monitoramento contínuo e defina critérios para encerramento do processo de gestão deste risco.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Etapa Final:</strong> Esta etapa estabelece como o risco será monitorado 
              após a implementação do tratamento e quando o processo de gestão pode ser encerrado.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Avaliação do Risco Residual */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Avaliação do Risco Residual
          </CardTitle>
          <CardDescription>
            Avalie o nível de risco após a implementação das ações de tratamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Impacto e Probabilidade Residuais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="residual-impact" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Impacto Residual *
              </Label>
              <Select value={residualImpact} onValueChange={setResidualImpact}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o impacto..." />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: maxScale }, (_, i) => {
                    const value = i + 1;
                    const label = tenantSettings?.risk_matrix?.impact_labels?.[i] || 
                      (maxScale === 4 ? 
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
              <p className="text-xs text-muted-foreground mt-1">
                Impacto esperado após implementação das ações
              </p>
            </div>

            <div>
              <Label htmlFor="residual-probability" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Probabilidade Residual *
              </Label>
              <Select value={residualProbability} onValueChange={setResidualProbability}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione a probabilidade..." />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: maxScale }, (_, i) => {
                    const value = i + 1;
                    const label = tenantSettings?.risk_matrix?.likelihood_labels?.[i] || 
                      (maxScale === 4 ? 
                        ['Raro', 'Improvável', 'Possível', 'Provável'][i] :
                        ['Muito Rara', 'Rara', 'Possível', 'Provável', 'Quase Certa'][i]
                      );
                    return (
                      <SelectItem key={value} value={value.toString()}>
                        {value} - {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Probabilidade esperada após implementação das ações
              </p>
            </div>
          </div>

          {/* Score e Nível Residual */}
          {residualImpact && residualProbability && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Risco Residual Calculado</h4>
                  <p className="text-sm text-muted-foreground">
                    {residualImpact} × {residualProbability} = {parseInt(residualImpact) * parseInt(residualProbability)}
                  </p>
                </div>
                <div className="text-right">
                  {selectedResidualLevel && (
                    <Badge className={`${selectedResidualLevel.color} text-white`}>
                      {selectedResidualLevel.label}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Nível de Risco Residual */}
          <div>
            <Label className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              Classificação do Risco Residual
            </Label>
            <RadioGroup value={residualRiskLevel} onValueChange={setResidualRiskLevel} className="mt-2">
              <div className={`grid grid-cols-1 md:grid-cols-3 ${maxScale === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-5'} gap-3`}>
                {residualRiskLevels.map((level) => (
                  <div key={level.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={level.value} id={level.value} />
                    <Label 
                      htmlFor={level.value} 
                      className="flex-1 cursor-pointer p-2 border rounded hover:bg-accent"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${level.color}`} />
                        <div>
                          <div className="text-xs font-semibold">{level.label}</div>
                          <div className="text-xs text-muted-foreground">{level.score}</div>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Configuração do Monitoramento */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-500" />
            Configuração do Monitoramento
          </CardTitle>
          <CardDescription>
            Defina como e quando o risco será monitorado ao longo do tempo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Frequência de Monitoramento */}
          <div>
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Frequência de Monitoramento *
            </Label>
            <RadioGroup value={monitoringFrequency} onValueChange={setMonitoringFrequency} className="mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MONITORING_FREQUENCIES.map((freq) => (
                  <div key={freq.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={freq.value} id={freq.value} />
                    <Label 
                      htmlFor={freq.value} 
                      className="flex-1 cursor-pointer p-3 border rounded hover:bg-accent"
                    >
                      <div className="font-semibold text-sm">{freq.label}</div>
                      <div className="text-xs text-muted-foreground">{freq.description}</div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Responsável pelo Monitoramento */}
            <div>
              <Label htmlFor="monitoring-responsible" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Responsável pelo Monitoramento *
              </Label>
              <Input
                id="monitoring-responsible"
                value={monitoringResponsible}
                onChange={(e) => setMonitoringResponsible(e.target.value)}
                placeholder="Nome ou cargo do responsável"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Pessoa ou área responsável por acompanhar este risco
              </p>
            </div>

            {/* Data da Próxima Revisão */}
            <div>
              <Label htmlFor="review-date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data da Próxima Revisão *
              </Label>
              <Input
                id="review-date"
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Quando a próxima avaliação deve ocorrer
              </p>
            </div>
          </div>

          {/* Definição de KPIs */}
          <div>
            <Label htmlFor="kpi-definition" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Indicadores de Monitoramento (KPIs)
            </Label>
            <Textarea
              id="kpi-definition"
              value={kpiDefinition}
              onChange={(e) => setKpiDefinition(e.target.value)}
              placeholder="Defina métricas específicas para monitorar a eficácia do tratamento e evolução do risco..."
              rows={3}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ex: Redução de 50% nos incidentes relacionados, implementação de 100% dos controles, etc.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Critérios de Encerramento */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-orange-500" />
            Critérios de Encerramento
          </CardTitle>
          <CardDescription>
            Defina quando o processo de gestão deste risco pode ser considerado concluído.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção de Critério */}
          <div>
            <Label className="flex items-center gap-2">
              Critério para Encerramento do Processo *
            </Label>
            <RadioGroup value={closureCriteria} onValueChange={setClosureCriteria} className="mt-2">
              <div className="space-y-3">
                {CLOSURE_CRITERIA.map((criteria) => (
                  <div key={criteria.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={criteria.value} id={criteria.value} />
                    <Label 
                      htmlFor={criteria.value} 
                      className="flex-1 cursor-pointer p-3 border rounded hover:bg-accent"
                    >
                      <div className="flex items-start gap-3">
                        {criteria.icon}
                        <div>
                          <div className="font-semibold text-sm">{criteria.label}</div>
                          <div className="text-xs text-muted-foreground">{criteria.description}</div>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Observações de Monitoramento */}
          <div>
            <Label htmlFor="monitoring-notes" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Observações e Instruções Especiais
            </Label>
            <Textarea
              id="monitoring-notes"
              value={monitoringNotes}
              onChange={(e) => setMonitoringNotes(e.target.value)}
              placeholder="Inclua instruções especiais, pontos de atenção, ou procedimentos específicos para o monitoramento..."
              rows={4}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Informações adicionais para auxiliar no processo de monitoramento
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Resumo da Configuração */}
      {selectedClosureCriteria && (
        <Card className="bg-slate-50 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Resumo da Configuração de Monitoramento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-semibold">Risco Residual:</span>
                  <div className="mt-1">
                    {selectedResidualLevel && (
                      <Badge className={`${selectedResidualLevel.color} text-white`}>
                        {selectedResidualLevel.label}
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-semibold">Frequência:</span>
                  <p className="text-sm text-muted-foreground">
                    {MONITORING_FREQUENCIES.find(f => f.value === monitoringFrequency)?.label}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-semibold">Responsável:</span>
                  <p className="text-sm text-muted-foreground">{monitoringResponsible || 'Não definido'}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-semibold">Próxima Revisão:</span>
                  <p className="text-sm text-muted-foreground">
                    {reviewDate ? new Date(reviewDate).toLocaleDateString('pt-BR') : 'Não definida'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-semibold">Critério de Encerramento:</span>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedClosureCriteria.icon}
                    <span className="text-sm">{selectedClosureCriteria.label}</span>
                  </div>
                </div>
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
                monitoringFrequency && monitoringResponsible && reviewDate && closureCriteria
                  ? 'bg-green-500' 
                  : 'bg-yellow-500'
              }`} />
              <span className="text-sm font-medium">
                Status da Etapa 7: Monitoramento e Encerramento
              </span>
            </div>
            <div className="text-right">
              {monitoringFrequency && monitoringResponsible && reviewDate && closureCriteria ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-semibold">Configuração Completa</span>
                </div>
              ) : (
                <div className="text-xs text-amber-600">
                  Complete todos os campos obrigatórios
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};