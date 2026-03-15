import React, { useMemo, memo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from 'recharts';
import {
  AlertTriangle,
  Shield,
  Activity,
  CheckCircle2,
  Target,
  Users,
  Layers,
  FolderOpen,
  FileCheck,
  Archive,
  Filter,
} from 'lucide-react';
import type { Risk, RiskMetrics, RiskFilters } from '@/types/risk-management';
import { cn } from '@/lib/utils';
import { useTenantSettings } from '@/hooks/useTenantSettings';

interface DashboardViewProps {
  risks: Risk[];
  metrics?: RiskMetrics;
  searchTerm: string;
  filters?: RiskFilters;
}

type RiskGroup = 'open' | 'accepted' | 'closed';

const LEVEL_COLORS: Record<string, string> = {
  'Crítico':    '#dc2626',
  'Muito Alto': '#dc2626',
  'Alto':       '#ea580c',
  'Médio':      '#ca8a04',
  'Baixo':      '#16a34a',
  'Muito Baixo':'#64748b',
};

const STATUS_COLORS: Record<string, string> = {
  'Identificado':  '#3b82f6',
  'Avaliado':      '#8b5cf6',
  'Em Tratamento': '#6366f1',
  'Monitorado':    '#14b8a6',
  'Reaberto':      '#f97316',
  'Fechado':       '#94a3b8',
};

const getLevelColor = (level: string) => LEVEL_COLORS[level] || '#6b7280';

// Classifica um risco no grupo: fechado → carta (aceito) → aberto
const getRiskGroup = (risk: Risk): RiskGroup => {
  if (risk.status === 'Fechado') return 'closed';
  const treatment = (risk.treatmentType || (risk as any).treatment_strategy || '').toLowerCase();
  if (treatment === 'aceitar' || treatment === 'accept') {
    const approvers: any[] = (risk as any).treatment_approvers || [];
    if (approvers.length > 0 && approvers.every((a: any) => a.approved)) return 'accepted';
  }
  return 'open';
};

export const DashboardView: React.FC<DashboardViewProps> = memo(({
  risks,
  metrics,
  searchTerm,
  filters = {}
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { getRiskLevels } = useTenantSettings();
  const riskLevels = getRiskLevels();

  // Seleção de grupos (padrão: todos selecionados)
  const [selectedGroups, setSelectedGroups] = useState<Set<RiskGroup>>(
    new Set(['open', 'accepted', 'closed'])
  );

  const toggleGroup = (group: RiskGroup) => {
    setSelectedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group) && next.size === 1) return prev; // pelo menos 1 selecionado
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
    setCurrentPage(1);
  };

  // Filtrar por busca/filtros externos
  const filteredRisks = useMemo(() => {
    return risks.filter(risk => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!risk.name.toLowerCase().includes(term) &&
          !risk.description?.toLowerCase().includes(term) &&
          !risk.category.toLowerCase().includes(term)) return false;
      }
      if (filters?.categories?.length && !filters.categories.includes(risk.category)) return false;
      if (filters?.levels?.length && !filters.levels.includes(risk.riskLevel)) return false;
      if (filters?.statuses?.length && !filters.statuses.includes(risk.status)) return false;
      return true;
    });
  }, [risks, searchTerm, filters]);

  // Aplicar filtro de grupo
  const viewRisks = useMemo(() =>
    filteredRisks.filter(r => selectedGroups.has(getRiskGroup(r))),
    [filteredRisks, selectedGroups]
  );

  // Contagens por grupo (para os botões de filtro)
  const groupCounts = useMemo(() => ({
    open:     filteredRisks.filter(r => getRiskGroup(r) === 'open').length,
    accepted: filteredRisks.filter(r => getRiskGroup(r) === 'accepted').length,
    closed:   filteredRisks.filter(r => getRiskGroup(r) === 'closed').length,
  }), [filteredRisks]);

  const totalItems = viewRisks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = viewRisks
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ── Distribuição por Nível (usa os níveis reais da tenant) ───────────────
  const levelDistribution = useMemo(() => {
    return riskLevels.map(level => {
      const count = viewRisks.filter(r => r.riskLevel === level).length;
      return { name: level, value: count, color: getLevelColor(level) };
    });
  }, [viewRisks, riskLevels]);

  // ── Pipeline de Ciclo de Vida ────────────────────────────────────────────
  const statusPipeline = useMemo(() => {
    const statuses = ['Identificado', 'Avaliado', 'Em Tratamento', 'Monitorado', 'Reaberto', 'Fechado'];
    return statuses.map(status => ({
      name: status,
      count: viewRisks.filter(r => r.status === status).length,
      color: STATUS_COLORS[status],
    })).filter(s => s.count > 0);
  }, [viewRisks]);

  // ── Distribuição por Categoria × Nível (stacked bar) ────────────────────
  const categoryStackedData = useMemo(() => {
    const byCategory: Record<string, Record<string, number> & { total: number }> = {};
    viewRisks.forEach(risk => {
      if (!byCategory[risk.category]) {
        byCategory[risk.category] = { total: 0 };
        riskLevels.forEach(l => { byCategory[risk.category][l] = 0; });
      }
      byCategory[risk.category][risk.riskLevel] = (byCategory[risk.category][risk.riskLevel] || 0) + 1;
      byCategory[risk.category].total++;
    });
    return Object.entries(byCategory)
      .map(([category, levels]) => ({
        name: category.length > 14 ? category.slice(0, 13) + '…' : category,
        fullName: category,
        total: levels.total,
        ...levels,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [viewRisks, riskLevels]);

  // ── Top 5 por Score (todos os grupos selecionados, não só abertos) ───────
  const topRisks = useMemo(() =>
    viewRisks
      .filter(r => r.status !== 'Fechado')
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5),
    [viewRisks]
  );

  // ── Cobertura de Tratamento ──────────────────────────────────────────────
  const treatmentStats = useMemo(() => {
    const nonClosed = viewRisks.filter(r => r.status !== 'Fechado');
    const treated = nonClosed.filter(r =>
      r.status === 'Em Tratamento' || r.status === 'Monitorado'
    ).length;
    const untreated = nonClosed.filter(r =>
      r.status === 'Identificado' || r.status === 'Avaliado'
    ).length;
    const pct = nonClosed.length > 0 ? Math.round((treated / nonClosed.length) * 100) : 0;
    return { treated, untreated, pct, total: nonClosed.length };
  }, [viewRisks]);

  // ── Helpers visuais ──────────────────────────────────────────────────────
  const getLevelBadgeStyle = (level: string) => ({
    backgroundColor: getLevelColor(level),
    color: '#ffffff',
    borderColor: getLevelColor(level),
    borderWidth: '1px',
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Identificado':  return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300';
      case 'Avaliado':      return 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300';
      case 'Em Tratamento': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300';
      case 'Monitorado':    return 'bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300';
      case 'Reaberto':      return 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300';
      case 'Fechado':       return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      default:              return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });

  // ── Custom tooltip para categoria ────────────────────────────────────────
  const CategoryTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const entry = categoryStackedData.find(d => d.name === label);
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg text-xs space-y-1">
        <p className="font-semibold text-sm mb-1">{entry?.fullName || label}</p>
        {payload.filter((p: any) => p.value > 0).map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.fill }} />
            <span className="text-muted-foreground">{p.dataKey}:</span>
            <span className="font-medium">{p.value}</span>
          </div>
        ))}
        <div className="border-t pt-1 mt-1 font-semibold">Total: {entry?.total}</div>
      </div>
    );
  };

  // ── Custom label para pipeline ────────────────────────────────────────────
  const renderPipelineLabel = ({ x, y, width, value }: any) => {
    if (!value || width < 28) return null;
    return (
      <text x={x + width / 2} y={y + 12} fill="#fff" textAnchor="middle" fontSize={11} fontWeight="700">
        {value}
      </text>
    );
  };

  // ── Grupo config (label, ícone, cor) ─────────────────────────────────────
  const GROUP_CONFIG: Record<RiskGroup, { label: string; icon: React.ReactNode; activeClass: string; inactiveClass: string }> = {
    open: {
      label: 'Em Aberto',
      icon: <FolderOpen className="h-3.5 w-3.5" />,
      activeClass: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700',
      inactiveClass: 'text-blue-600 border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30',
    },
    accepted: {
      label: 'Carta de Risco',
      icon: <FileCheck className="h-3.5 w-3.5" />,
      activeClass: 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600',
      inactiveClass: 'text-orange-600 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/30',
    },
    closed: {
      label: 'Encerrados',
      icon: <Archive className="h-3.5 w-3.5" />,
      activeClass: 'bg-slate-500 text-white border-slate-500 hover:bg-slate-600',
      inactiveClass: 'text-slate-500 border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/30',
    },
  };

  return (
    <div className="space-y-5">

      {/* ── Filtro de Grupo ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-muted/40 rounded-lg border overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <Filter className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="hidden xs:inline">Exibindo:</span>
        </div>
        {(['open', 'accepted', 'closed'] as RiskGroup[]).map(group => {
          const cfg = GROUP_CONFIG[group];
          const isActive = selectedGroups.has(group);
          return (
            <button
              key={group}
              onClick={() => toggleGroup(group)}
              className={cn(
                'inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium px-2 sm:px-2.5 py-1 rounded-full border transition-all shrink-0 whitespace-nowrap',
                isActive ? cfg.activeClass : cfg.inactiveClass
              )}
            >
              {cfg.icon}
              <span className="hidden sm:inline">{cfg.label}</span>
              <span className="sm:hidden">{cfg.label.split(' ')[0]}</span>
              <span className={cn(
                'inline-flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full text-[9px] sm:text-[10px] font-black',
                isActive ? 'bg-white/20' : 'bg-current/10'
              )}>
                {groupCounts[group]}
              </span>
            </button>
          );
        })}
        <span className="ml-auto shrink-0 text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
          <span className="font-bold text-foreground">{viewRisks.length}</span>
          <span className="hidden sm:inline"> de {filteredRisks.length} riscos</span>
          <span className="sm:hidden">/{filteredRisks.length}</span>
        </span>
      </div>

      {/* ── ROW 1: Categoria × Nível + Donut ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Stacked bar: Categoria × Nível */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Layers className="h-4 w-4 text-primary" />
              Exposição por Categoria
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">Riscos por categoria e severidade</p>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-0">
            {categoryStackedData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                <Shield className="h-8 w-8 mr-2 opacity-40" /> Nenhum risco no filtro selecionado
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={Math.max(200, categoryStackedData.length * 38 + 40)}>
                  <BarChart
                    data={categoryStackedData}
                    layout="vertical"
                    margin={{ top: 4, right: 40, left: 4, bottom: 4 }}
                    barCategoryGap="22%"
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={100}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: 'currentColor' }}
                    />
                    <Tooltip content={<CategoryTooltip />} />
                    {riskLevels.map((level, idx) => (
                      <Bar
                        key={level}
                        dataKey={level}
                        stackId="a"
                        fill={getLevelColor(level)}
                        name={level}
                        radius={idx === riskLevels.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]}
                      >
                        <LabelList
                          dataKey={level}
                          position="insideRight"
                          fill="#fff"
                          fontSize={9}
                          fontWeight="700"
                          formatter={(v: number) => v > 0 ? v : ''}
                        />
                      </Bar>
                    ))}
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 px-1">
                  {riskLevels.map(level => (
                    <span key={level} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: getLevelColor(level) }} />
                      {level}
                    </span>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Donut: Nível */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Target className="h-4 w-4 text-primary" />
              Nível de Risco
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">
              {viewRisks.length} risco{viewRisks.length !== 1 ? 's' : ''} no filtro
            </p>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-0">
            {levelDistribution.every(d => d.value === 0) ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                <Shield className="h-6 w-6 mr-2 opacity-40" /> Sem dados
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={175}>
                  <PieChart>
                    <Pie
                      data={levelDistribution.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={78}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {levelDistribution.filter(d => d.value > 0).map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number, name: string) => [`${value} risco${value !== 1 ? 's' : ''}`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-1">
                  {levelDistribution.map(d => (
                    <div key={d.name} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-xs text-muted-foreground flex-1">{d.name}</span>
                      <span className="text-xs font-bold tabular-nums">{d.value}</span>
                      <span className="text-[10px] text-muted-foreground w-8 text-right tabular-nums">
                        {viewRisks.length > 0 ? Math.round(d.value / viewRisks.length * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── ROW 2: Pipeline + Top 5 ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Pipeline */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Activity className="h-4 w-4 text-primary" />
              Ciclo de Vida dos Riscos
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">Quantidade de riscos por fase do processo</p>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-2">
            {statusPipeline.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                <Shield className="h-6 w-6 mr-2 opacity-40" /> Nenhum risco no filtro
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={Math.max(140, statusPipeline.length * 44)}>
                  <BarChart
                    data={statusPipeline}
                    layout="vertical"
                    margin={{ top: 4, right: 50, left: 4, bottom: 4 }}
                    barCategoryGap="18%"
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={110}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: 'currentColor' }}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: 'var(--muted)', opacity: 0.3 }}
                      formatter={(v: number) => [`${v} risco${v !== 1 ? 's' : ''}`, '']}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={32}>
                      {statusPipeline.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                      <LabelList content={renderPipelineLabel} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Cobertura de Tratamento */}
                <div className="mt-3 p-3 bg-muted/40 rounded-lg border">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <CheckCircle2 className={cn(
                        'h-3.5 w-3.5',
                        treatmentStats.pct >= 70 ? 'text-green-500' : treatmentStats.pct >= 40 ? 'text-amber-500' : 'text-red-500'
                      )} />
                      Cobertura de Tratamento
                    </div>
                    <span className={cn(
                      'text-sm font-black',
                      treatmentStats.pct >= 70 ? 'text-green-600' : treatmentStats.pct >= 40 ? 'text-amber-600' : 'text-red-600'
                    )}>
                      {treatmentStats.pct}%
                    </span>
                  </div>
                  <Progress value={treatmentStats.pct} className="h-2" />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>{treatmentStats.treated} em tratamento / monitoramento</span>
                    <span className={treatmentStats.untreated > 0 ? 'text-amber-600 font-medium' : ''}>
                      {treatmentStats.untreated} sem tratamento
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Top 5 */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Top 5 Prioritários
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">Maiores scores — riscos não encerrados</p>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="space-y-2">
              {topRisks.map((risk, index) => (
                <div key={risk.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                  <span className="text-[10px] font-black text-muted-foreground w-4 shrink-0">#{index + 1}</span>
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[10px] font-black shrink-0"
                    style={{ backgroundColor: getLevelColor(risk.riskLevel) }}
                  >
                    {risk.riskScore}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate leading-tight" title={risk.name}>{risk.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{risk.category}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1 py-0 h-4 shrink-0 whitespace-nowrap"
                    style={getLevelBadgeStyle(risk.riskLevel)}
                  >
                    {risk.riskLevel}
                  </Badge>
                </div>
              ))}
              {topRisks.length === 0 && (
                <div className="text-center py-6">
                  <Shield className="mx-auto h-8 w-8 text-green-500 mb-2" />
                  <p className="text-sm text-green-600 font-medium">Sem riscos ativos</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── ROW 3: Lista Recente ─────────────────────────────────────────── */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Activity className="h-4 w-4" />
            Riscos Recentes
            <Badge variant="secondary" className="text-[10px] ml-1">{viewRisks.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="space-y-2">
            {currentItems.map((risk) => (
              <div
                key={risk.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:bg-muted/40 transition-colors gap-2"
              >
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0 mt-0.5 sm:mt-0"
                    style={{ backgroundColor: getLevelColor(risk.riskLevel) }}
                  >
                    {risk.riskScore || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                      <h4 className="font-medium text-sm leading-tight truncate max-w-[260px]" title={risk.name}>{risk.name}</h4>
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1.5 py-0 h-4 shrink-0"
                        style={getLevelBadgeStyle(risk.riskLevel)}
                      >
                        {risk.riskLevel}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-muted-foreground">
                      <span>{risk.category}</span>
                      <span>·</span>
                      <span>{formatDate(risk.createdAt)}</span>
                      {risk.assignedTo && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <Users className="h-2.5 w-2.5" />
                            {risk.assignedTo}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Badge className={cn('text-[10px] whitespace-nowrap shrink-0', getStatusBadgeClass(risk.status))}>
                  {risk.status}
                </Badge>
              </div>
            ))}

            {viewRisks.length === 0 && (
              <div className="text-center py-10">
                <Shield className="mx-auto h-10 w-10 text-muted-foreground mb-3 opacity-40" />
                <h3 className="text-base font-medium text-muted-foreground mb-1">Nenhum risco encontrado</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || Object.keys(filters || {}).length > 0
                    ? 'Tente ajustar os filtros ou o termo de busca'
                    : 'Selecione ao menos um grupo acima'}
                </p>
              </div>
            )}
          </div>

          {totalItems > itemsPerPage && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 border-t gap-2">
              <div className="text-xs text-muted-foreground">
                Mostrando {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline" size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-7 px-2 text-xs"
                >
                  Anterior
                </Button>
                <span className="text-xs font-medium px-2 py-1 bg-muted rounded">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline" size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-7 px-2 text-xs"
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});
