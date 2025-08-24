import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Target, AlertTriangle } from 'lucide-react';

export interface AlexVendorIntegrationProps {
  currentView: string;
  metrics?: any;
  activeVendors: number;
}

export const AlexVendorIntegration: React.FC<AlexVendorIntegrationProps> = ({
  currentView,
  metrics,
  activeVendors
}) => {
  const getContextualInsights = () => {
    switch (currentView) {
      case 'dashboard':
        return [
          'Identifiquei 3 fornecedores com contratos vencendo em 30 dias',
          'Sugestão: Priorizar reavaliação de fornecedores críticos',
          'Tendência: Aumento de 15% em assessments concluídos no mês'
        ];
      case 'vendors':
        return [
          'Recomendo categorizar fornecedores por impacto no negócio',
          'Alerta: 2 fornecedores sem assessment nos últimos 12 meses',
          'Oportunidade: Automatizar onboarding para fornecedores de baixo risco'
        ];
      case 'assessments':
        return [
          'Identificado padrão de atraso em assessments de categoria "Tecnologia"',
          'Sugestão: Implementar lembretes automáticos 7 dias antes do prazo',
          'Score médio de fornecedores: 3.2/5.0 - Dentro do esperado'
        ];
      case 'kanban':
        return [
          'Gargalo identificado na etapa "Em Progresso"',
          'Recomendo redistribuir assessments entre analistas',
          'Tempo médio por etapa: Rascunho (2d) → Aprovado (14d)'
        ];
      default:
        return [
          'ALEX VENDOR está monitorando continuamente seus fornecedores',
          'Sistema preparado para análises avançadas de risco',
          'IA ativa para otimização de processos'
        ];
    }
  };

  const insights = getContextualInsights();

  return (
    <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                ALEX VENDOR - Insights Contextuais
              </span>
              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                IA Ativa
              </Badge>
            </div>
            <div className="space-y-1">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="mt-1.5">
                    {insight.includes('Alerta') || insight.includes('Gargalo') ? (
                      <AlertTriangle className="h-3 w-3 text-amber-500" />
                    ) : insight.includes('Sugestão') || insight.includes('Recomendo') ? (
                      <Target className="h-3 w-3 text-green-500" />
                    ) : insight.includes('Oportunidade') || insight.includes('Tendência') ? (
                      <Zap className="h-3 w-3 text-purple-500" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-blue-400" />
                    )}
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                    {insight}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};