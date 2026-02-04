import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Shield,
  ArrowRight,
  ArrowLeftRight,
  X,
  CheckCircle,
  Info,
  DollarSign,
  Calendar,
  FileText,
  AlertTriangle
} from 'lucide-react';

interface Step4Props {
  data: any;
  updateData: (data: any) => void;
  registrationId?: string | null;
  onSave?: () => void;
}

const TREATMENT_STRATEGIES = [
  {
    value: 'mitigate',
    label: 'Mitigar',
    icon: <Shield className="h-6 w-6" />,
    color: 'bg-blue-500',
    description: 'Reduzir a probabilidade ou impacto do risco',
    details: 'Implementar controles, procedimentos ou ações para diminuir a exposição ao risco',
    examples: 'Treinamentos, controles internos, backup de dados, diversificação',
    when: 'Quando o risco pode ser controlado com ações viáveis e custo-efetivas',
    nextStep: 'Plano de Ação (Etapa 5)'
  },
  {
    value: 'transfer',
    label: 'Transferir',
    icon: <ArrowLeftRight className="h-6 w-6" />,
    color: 'bg-purple-500',
    description: 'Transferir o risco para terceiros',
    details: 'Compartilhar ou transferir totalmente o risco através de seguros, contratos ou parcerias',
    examples: 'Seguros, terceirização, contratos com garantias, joint ventures',
    when: 'Quando o custo de transferência é menor que o custo de tratamento interno',
    nextStep: 'Plano de Ação (Etapa 5)'
  },
  {
    value: 'avoid',
    label: 'Evitar',
    icon: <X className="h-6 w-6" />,
    color: 'bg-red-500',
    description: 'Eliminar completamente o risco',
    details: 'Cessar atividades ou mudar processos que geram o risco',
    examples: 'Cancelar projetos, mudar fornecedores, alterar processos, sair de mercados',
    when: 'Quando o risco é inaceitável e outras estratégias não são viáveis',
    nextStep: 'Plano de Ação (Etapa 5)'
  },
  {
    value: 'accept',
    label: 'Aceitar',
    icon: <CheckCircle className="h-6 w-6" />,
    color: 'bg-green-500',
    description: 'Aceitar o risco conscientemente',
    details: 'Manter o risco atual com monitoramento e comunicação adequada',
    examples: 'Riscos de baixo impacto, custos de tratamento superiores ao benefício',
    when: 'Quando o risco está dentro do apetite e tolerância da organização',
    nextStep: 'Comunicação (Etapa 6) - Carta de Risco'
  }
];

export const Step4Treatment: React.FC<Step4Props> = ({
  data,
  updateData
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState(data.treatment_strategy || '');
  const [rationale, setRationale] = useState(data.treatment_rationale || '');
  const [estimatedCost, setEstimatedCost] = useState(data.treatment_cost || '');
  const [timeline, setTimeline] = useState(data.treatment_timeline || '');

  const selectedStrategyData = TREATMENT_STRATEGIES.find(s => s.value === selectedStrategy);

  useEffect(() => {
    updateData({
      treatment_strategy: selectedStrategy,
      treatment_rationale: rationale,
      treatment_cost: estimatedCost ? parseFloat(estimatedCost) : null,
      treatment_timeline: timeline
    });
  }, [selectedStrategy, rationale, estimatedCost, timeline]);

  const handleStrategySelect = (strategy: string) => {
    setSelectedStrategy(strategy);
    // Limpar campos específicos se mudar para aceitar
    if (strategy === 'accept') {
      setEstimatedCost('');
      setTimeline('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Introdução */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Estratégia de Tratamento do Risco
          </CardTitle>
          <CardDescription>
            Escolha a abordagem mais adequada para responder a este risco identificado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Contexto do Risco:</strong> Com base nas análises anteriores, 
              selecione a estratégia que melhor alinha com os objetivos organizacionais 
              e tolerância ao risco.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Seleção da Estratégia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {TREATMENT_STRATEGIES.map((strategy) => (
          <Card 
            key={strategy.value}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedStrategy === strategy.value 
                ? 'ring-2 ring-primary border-primary shadow-md' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => handleStrategySelect(strategy.value)}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${strategy.color} text-white`}>
                  {strategy.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{strategy.label}</h3>
                    {selectedStrategy === strategy.value && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {strategy.description}
                  </p>
                  <p className="text-xs mb-3">
                    {strategy.details}
                  </p>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-semibold">Exemplos:</span>
                      <p className="text-xs text-muted-foreground">{strategy.examples}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold">Quando usar:</span>
                      <p className="text-xs text-muted-foreground">{strategy.when}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="outline" className="text-xs">
                        {strategy.nextStep}
                      </Badge>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detalhes da Estratégia Selecionada */}
      {selectedStrategyData && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedStrategyData.icon}
              Estratégia Selecionada: {selectedStrategyData.label}
            </CardTitle>
            <CardDescription>
              Complete as informações específicas para esta estratégia de tratamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Justificativa */}
            <div>
              <Label htmlFor="rationale" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Justificativa da Estratégia *
              </Label>
              <Textarea
                id="rationale"
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder={`Explique por que a estratégia "${selectedStrategyData.label}" é a mais adequada para este risco...`}
                rows={4}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Inclua considerações de custo-benefício, viabilidade e alinhamento estratégico
              </p>
            </div>

            {/* Campos específicos para estratégias ativas (não aceitar) */}
            {selectedStrategy !== 'accept' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Custo Estimado */}
                <div>
                  <Label htmlFor="cost" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Custo Estimado de Implementação
                  </Label>
                  <Input
                    id="cost"
                    type="number"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    placeholder="Ex: 50000.00"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Valor em reais (R$) para implementar a estratégia
                  </p>
                </div>

                {/* Prazo */}
                <div>
                  <Label htmlFor="timeline" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Prazo para Implementação
                  </Label>
                  <Input
                    id="timeline"
                    type="date"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Data limite para conclusão do tratamento
                  </p>
                </div>
              </div>
            )}

            {/* Informações específicas para Aceitar */}
            {selectedStrategy === 'accept' && (
              <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription>
                  <strong>Estratégia de Aceitação:</strong> Esta escolha gerará uma 
                  <strong> Carta de Risco</strong> que deve ser aprovada pelos stakeholders 
                  apropriados. O risco será monitorado periodicamente sem ações de mitigação ativa.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Diretrizes para Seleção */}
      <Card className="bg-slate-50 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Diretrizes para Seleção da Estratégia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-sm mb-3">🎯 Critérios de Decisão</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <span><strong>Custo-Benefício:</strong> Compare custos de tratamento vs. impacto do risco</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <span><strong>Viabilidade:</strong> Considere recursos disponíveis e capacidades</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <span><strong>Urgência:</strong> Alinhe com a classificação GUT definida</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <span><strong>Tolerância:</strong> Verifique conformidade com apetite de risco</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-3">💡 Boas Práticas</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                  <span>Documente claramente a justificativa da escolha</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                  <span>Considere combinações de estratégias quando aplicável</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                  <span>Estabeleça prazos realistas e mensuráveis</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                  <span>Envolva stakeholders relevantes na decisão</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Matriz de Decisão Rápida */}
          <div className="mt-6 p-4 bg-background rounded-lg border">
            <h4 className="font-semibold text-sm mb-3">⚡ Guia Rápido de Decisão</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="text-center">
                <div className="bg-blue-500 text-white p-2 rounded mb-1">Mitigar</div>
                <p>Risco Alto + Controle Viável</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-500 text-white p-2 rounded mb-1">Transferir</div>
                <p>Expertise Externa + Seguro Disponível</p>
              </div>
              <div className="text-center">
                <div className="bg-red-500 text-white p-2 rounded mb-1">Evitar</div>
                <p>Risco Crítico + Intolerável</p>
              </div>
              <div className="text-center">
                <div className="bg-green-500 text-white p-2 rounded mb-1">Aceitar</div>
                <p>Risco Baixo + Custo &gt; Benefício</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status da Etapa */}
      <Card className="bg-slate-50 dark:bg-slate-900">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                selectedStrategy && rationale 
                  ? 'bg-green-500' 
                  : 'bg-yellow-500'
              }`} />
              <span className="text-sm font-medium">
                Status da Etapa 4: Tratamento de Risco
              </span>
            </div>
            <div className="text-right">
              {selectedStrategy ? (
                <div>
                  <div className="text-sm font-semibold">
                    Estratégia: {selectedStrategyData?.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Próximo: {selectedStrategyData?.nextStep}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-amber-600">
                  Selecione uma estratégia de tratamento
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};