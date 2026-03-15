import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertTriangle,
  TrendingUp,
  Activity,
  Shield,
  Clock,
  TrendingDown,
  Minus,
} from 'lucide-react';
import type { RiskMetrics } from '@/types/risk-management';
import { useTenantSettings } from '@/hooks/useTenantSettings';

interface QuickMetricsProps {
  metrics?: RiskMetrics;
  isLoading?: boolean;
}

export const QuickMetrics: React.FC<QuickMetricsProps> = ({ metrics, isLoading }) => {
  const { getRiskLevels } = useTenantSettings();
  const riskLevels = getRiskLevels();
  const highestLevel = riskLevels[riskLevels.length - 1] || 'Muito Alto';
  const secondHighestLevel = riskLevels.length > 1 ? riskLevels[riskLevels.length - 2] : 'Alto';

  const defaultMetrics: RiskMetrics = {
    totalRisks: 0,
    risksByLevel: { 'Muito Alto': 0, 'Alto': 0, 'Médio': 0, 'Baixo': 0, 'Muito Baixo': 0 },
    risksByCategory: {} as any,
    risksByStatus: { 'Identificado': 0, 'Avaliado': 0, 'Em Tratamento': 0, 'Monitorado': 0, 'Fechado': 0, 'Reaberto': 0 },
    overdueActivities: 0,
    riskTrend: 'Estável',
    averageResolutionTime: 0
  };

  const m = metrics || defaultMetrics;

  const highestCount = m.risksByLevel[highestLevel] || 0;
  const secondHighestCount = m.risksByLevel[secondHighestLevel] || 0;
  const elevatedTotal = highestCount + secondHighestCount;

  // Riscos sem tratamento ativo = Identificado + Avaliado (gap de exposição)
  const untreated = (m.risksByStatus['Identificado'] || 0) + (m.risksByStatus['Avaliado'] || 0);

  const trendIcon = m.riskTrend === 'Aumentando'
    ? <TrendingUp className="h-3.5 w-3.5 text-red-500" />
    : m.riskTrend === 'Diminuindo'
      ? <TrendingDown className="h-3.5 w-3.5 text-green-500" />
      : <Minus className="h-3.5 w-3.5 text-blue-500" />;

  const trendColor = m.riskTrend === 'Aumentando' ? 'text-red-600 bg-red-50 border-red-200'
    : m.riskTrend === 'Diminuindo' ? 'text-green-600 bg-green-50 border-green-200'
      : 'text-blue-600 bg-blue-50 border-blue-200';

  // Distribuição por nível para mini-bar
  const levels = [
    { label: 'MA', color: 'bg-red-500', count: m.risksByLevel[highestLevel] || 0 },
    { label: 'A', color: 'bg-orange-400', count: m.risksByLevel[secondHighestLevel] || 0 },
    { label: 'M', color: 'bg-yellow-400', count: m.risksByLevel['Médio'] || 0 },
    { label: 'B', color: 'bg-green-400', count: m.risksByLevel['Baixo'] || 0 },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">

      {/* Card 1: Total de Riscos com distribuição */}
      <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all">
        <CardContent className="p-2.5 sm:p-4">
          <div className="flex items-start justify-between mb-1.5 sm:mb-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Shield className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className={`inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-medium px-1 sm:px-1.5 py-0.5 rounded-full border ${trendColor} max-w-[80px] sm:max-w-none truncate`}>
              {trendIcon}
              <span className="truncate">{m.riskTrend}</span>
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-0.5">Total de Riscos</p>
          <p className="text-2xl sm:text-3xl font-black text-foreground leading-none mb-1.5 sm:mb-2">{m.totalRisks}</p>
          {/* Mini distribuição */}
          <div className="flex flex-wrap items-center gap-1">
            {levels.map(l => l.count > 0 && (
              <span key={l.label} className={`inline-flex items-center gap-0.5 text-[8px] sm:text-[10px] font-semibold px-1 py-0.5 rounded ${l.color} text-white`}>
                {l.label} {l.count}
              </span>
            ))}
            {levels.every(l => l.count === 0) && (
              <span className="text-[9px] text-muted-foreground">Nenhum risco</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Riscos Elevados (Muito Alto + Alto) */}
      <Card className={`border-l-4 shadow-sm hover:shadow-md transition-all ${elevatedTotal > 0 ? 'border-l-red-500' : 'border-l-emerald-500'}`}>
        <CardContent className="p-2.5 sm:p-4">
          <div className="flex items-start justify-between mb-1.5 sm:mb-2">
            <div className={`p-1.5 rounded-lg ${elevatedTotal > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
              <AlertTriangle className={`h-3.5 w-3.5 sm:h-5 sm:w-5 ${elevatedTotal > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600'}`} />
            </div>
            <span className={`text-[9px] sm:text-[10px] font-medium px-1 sm:px-1.5 py-0.5 rounded-full ${elevatedTotal > 0 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
              <span className="hidden sm:inline">{elevatedTotal > 0 ? 'Ação necessária' : 'Sob controle'}</span>
              <span className="sm:hidden">{elevatedTotal > 0 ? 'Ação' : 'OK'}</span>
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-0.5">Riscos Elevados</p>
          <p className={`text-2xl sm:text-3xl font-black leading-none mb-1.5 sm:mb-2 ${elevatedTotal > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {elevatedTotal}
          </p>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-xs text-muted-foreground flex-wrap">
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 shrink-0" />
              {highestCount} <span className="hidden sm:inline">{highestLevel}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-orange-400 shrink-0" />
              {secondHighestCount} <span className="hidden sm:inline">{secondHighestLevel}</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Sem Tratamento (gap de exposição) */}
      <Card className={`border-l-4 shadow-sm hover:shadow-md transition-all ${untreated > 0 ? 'border-l-amber-500' : 'border-l-emerald-500'}`}>
        <CardContent className="p-2.5 sm:p-4">
          <div className="flex items-start justify-between mb-1.5 sm:mb-2">
            <div className={`p-1.5 rounded-lg ${untreated > 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
              <Activity className={`h-3.5 w-3.5 sm:h-5 sm:w-5 ${untreated > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'}`} />
            </div>
            <span className={`text-[9px] sm:text-[10px] font-medium px-1 sm:px-1.5 py-0.5 rounded-full ${untreated > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
              {untreated > 0 ? 'Expostos' : 'Tratados'}
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-0.5">Sem Tratamento</p>
          <p className={`text-2xl sm:text-3xl font-black leading-none mb-1.5 sm:mb-2 ${untreated > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {untreated}
          </p>
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[9px] sm:text-xs text-muted-foreground">
            <span>{m.risksByStatus['Identificado'] || 0} <span className="hidden sm:inline">identificados</span><span className="sm:hidden">id.</span></span>
            <span className="hidden sm:inline">·</span>
            <span>{m.risksByStatus['Avaliado'] || 0} <span className="hidden sm:inline">avaliados</span><span className="sm:hidden">aval.</span></span>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Atividades em Atraso */}
      <Card className={`border-l-4 shadow-sm hover:shadow-md transition-all ${m.overdueActivities > 0 ? 'border-l-orange-500' : 'border-l-emerald-500'}`}>
        <CardContent className="p-2.5 sm:p-4">
          <div className="flex items-start justify-between mb-1.5 sm:mb-2">
            <div className={`p-1.5 rounded-lg ${m.overdueActivities > 0 ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
              <Clock className={`h-3.5 w-3.5 sm:h-5 sm:w-5 ${m.overdueActivities > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600'}`} />
            </div>
            <span className={`text-[9px] sm:text-[10px] font-medium px-1 sm:px-1.5 py-0.5 rounded-full ${m.overdueActivities > 0 ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
              <span className="hidden sm:inline">{m.overdueActivities > 0 ? 'Fora do prazo' : 'Em dia'}</span>
              <span className="sm:hidden">{m.overdueActivities > 0 ? 'Atrasado' : 'Em dia'}</span>
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-0.5">Ativid. em Atraso</p>
          <p className={`text-2xl sm:text-3xl font-black leading-none mb-1.5 sm:mb-2 ${m.overdueActivities > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
            {m.overdueActivities}
          </p>
          <p className="text-[9px] sm:text-xs text-muted-foreground leading-tight">
            {m.overdueActivities > 0
              ? <span><span className="sm:hidden">{m.overdueActivities} vencida{m.overdueActivities > 1 ? 's' : ''}</span><span className="hidden sm:inline">{m.overdueActivities} atividade{m.overdueActivities > 1 ? 's' : ''} vencida{m.overdueActivities > 1 ? 's' : ''}</span></span>
              : <span className="hidden sm:inline">Todas dentro do prazo</span>}
            {m.overdueActivities === 0 && <span className="sm:hidden">Em dia</span>}
          </p>
        </CardContent>
      </Card>

    </div>
  );
};
