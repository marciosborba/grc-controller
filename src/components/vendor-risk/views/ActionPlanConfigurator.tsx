import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
    Settings,
    AlertTriangle,
    CheckCircle,
    Save,
    Plus,
    Trash2,
    RotateCcw,
    Shield,
    Gauge,
    ListChecks,
    Target,
    Clock,
    Zap,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContextOptimized';
import {
    ScoringConfig,
    MaturityBand,
    ActionPlanRule,
    CriticalityLevel,
    CriticalityWeightConfig,
    PrioritizationMode,
    DeadlineConfig,
    DEFAULT_SCORING_CONFIG,
    DEFAULT_CRITICALITY_WEIGHTS,
    DEFAULT_DEADLINES,
    loadScoringConfig,
    saveScoringConfig,
    MATURITY_ANSWER_LABELS,
} from '@/hooks/useAssessmentScoring';

// ─── Constants ──────────────────────────────────────────────────────────────

const colorClasses: Record<string, string> = {
    red: 'bg-red-50 border-red-300 text-red-700 dark:bg-red-950/30 dark:border-red-700 dark:text-red-300',
    orange: 'bg-orange-50 border-orange-300 text-orange-700 dark:bg-orange-950/30 dark:border-orange-700 dark:text-orange-300',
    yellow: 'bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-950/30 dark:border-yellow-700 dark:text-yellow-300',
    blue: 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950/30 dark:border-blue-700 dark:text-blue-300',
    green: 'bg-green-50 border-green-300 text-green-700 dark:bg-green-950/30 dark:border-green-700 dark:text-green-300',
};

const BAND_COLORS = ['red', 'orange', 'yellow', 'blue', 'green'];

const PRIORITY_OPTIONS: Array<{ value: ActionPlanRule['priority']; label: string }> = [
    { value: 'critical', label: 'Crítica' },
    { value: 'high', label: 'Alta' },
    { value: 'medium', label: 'Média' },
    { value: 'low', label: 'Baixa' },
];

const CRITICALITY_LABELS: Record<CriticalityLevel, string> = {
    baixo: 'Baixo',
    medio: 'Médio',
    alto: 'Alto',
    critico: 'Crítico',
    info: 'Info (Risco)',
};

const CRITICALITY_COLORS: Record<CriticalityLevel, string> = {
    baixo: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    medio: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    alto: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    critico: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    info: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

// ─── Component ──────────────────────────────────────────────────────────────

export const ActionPlanConfigurator: React.FC = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const tenantId = user?.tenantId ?? 'default';

    const [config, setConfig] = useState<ScoringConfig>(DEFAULT_SCORING_CONFIG);
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        setConfig(loadScoringConfig(tenantId));
        setDirty(false);
    }, [tenantId]);

    const handleSave = () => {
        saveScoringConfig(tenantId, config);
        setDirty(false);
        toast({ title: 'Configuração salva', description: 'As regras de plano de ação foram atualizadas.' });
    };

    const handleReset = () => {
        setConfig(DEFAULT_SCORING_CONFIG);
        setDirty(true);
        toast({ title: 'Restaurado', description: 'Configurações padrão restauradas. Clique em Salvar para confirmar.' });
    };

    const updateBand = (idx: number, changes: Partial<MaturityBand>) => {
        setConfig(prev => {
            const bands = [...prev.maturityBands];
            bands[idx] = { ...bands[idx], ...changes };
            return { ...prev, maturityBands: bands };
        });
        setDirty(true);
    };

    const updateRule = (idx: number, changes: Partial<ActionPlanRule>) => {
        setConfig(prev => {
            const rules = [...prev.actionPlanRules];
            rules[idx] = { ...rules[idx], ...changes };
            return { ...prev, actionPlanRules: rules };
        });
        setDirty(true);
    };

    const addRule = () => {
        const newRule: ActionPlanRule = {
            id: `rule_custom_${Date.now()}`,
            questionTypes: ['yes_no'],
            triggerAnswer: 'no',
            requiresPlan: true,
            planTitleTemplate: 'Implementar Controle: {controle}',
            planDescriptionTemplate: 'O controle "{controle}" requer implementação.',
            dueDays: 90,
            priority: 'medium',
        };
        setConfig(prev => ({ ...prev, actionPlanRules: [...prev.actionPlanRules, newRule] }));
        setDirty(true);
    };

    const removeRule = (idx: number) => {
        setConfig(prev => ({ ...prev, actionPlanRules: prev.actionPlanRules.filter((_, i) => i !== idx) }));
        setDirty(true);
    };

    const updateCritWeight = (level: CriticalityLevel, value: number) => {
        setConfig(prev => ({
            ...prev,
            criticalityWeights: { ...prev.criticalityWeights, [level]: value },
        }));
        setDirty(true);
    };

    const updateDeadlineMaturity = (bandId: string, days: number) => {
        setConfig(prev => ({
            ...prev,
            deadlines: {
                ...prev.deadlines,
                byMaturity: { ...prev.deadlines.byMaturity, [bandId]: days },
            },
        }));
        setDirty(true);
    };

    const updateDeadlineCriticality = (level: CriticalityLevel, days: number) => {
        setConfig(prev => ({
            ...prev,
            deadlines: {
                ...prev.deadlines,
                byCriticality: { ...prev.deadlines.byCriticality, [level]: days },
            },
        }));
        setDirty(true);
    };

    const priorityBadgeClass = (p: string) => {
        const map: Record<string, string> = {
            critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
            high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
            medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
            low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        };
        return map[p] ?? 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Settings className="h-5 w-5 text-primary" />
                        Configuração de Plano de Ação
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Defina as bandas de maturidade, pesos de criticidade, modo de priorização e as regras que geram planos automaticamente.
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" onClick={handleReset} className="flex-1 sm:flex-none">
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Restaurar Padrão
                    </Button>
                    <Button size="sm" onClick={handleSave} className="flex-1 sm:flex-none" disabled={!dirty}>
                        <Save className="h-4 w-4 mr-1" />
                        {dirty ? 'Salvar*' : 'Salvo'}
                    </Button>
                </div>
            </div>

            {/* ── SECTION A: Maturity Bands ────────────────────────────────────── */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-blue-600" />
                        Bandas de Maturidade
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Defina os limites de score (0–100) e o nome de cada nível de maturidade.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {/* Score preview bar */}
                    <div className="flex rounded-full overflow-hidden h-3 mb-4">
                        {config.maturityBands.map((band) => (
                            <div
                                key={band.id}
                                className={`flex-1 ${band.color === 'red' ? 'bg-red-400' : band.color === 'orange' ? 'bg-orange-400' : band.color === 'yellow' ? 'bg-yellow-400' : band.color === 'blue' ? 'bg-blue-400' : 'bg-green-400'}`}
                                title={`${band.name}: ${band.minScore}–${band.maxScore}`}
                            />
                        ))}
                    </div>

                    <div className="space-y-3">
                        {config.maturityBands.map((band, idx) => (
                            <div
                                key={band.id}
                                className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border ${colorClasses[band.color] ?? ''}`}
                            >
                                <div className="flex items-center gap-2 sm:w-48">
                                    <Select value={band.color} onValueChange={v => updateBand(idx, { color: v })}>
                                        <SelectTrigger className="w-10 h-8 p-1 bg-transparent border-none shadow-none">
                                            <div className={`w-4 h-4 rounded-full ${band.color === 'red' ? 'bg-red-500' : band.color === 'orange' ? 'bg-orange-500' : band.color === 'yellow' ? 'bg-yellow-500' : band.color === 'blue' ? 'bg-blue-500' : 'bg-green-500'}`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BAND_COLORS.map(c => (
                                                <SelectItem key={c} value={c}>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full ${c === 'red' ? 'bg-red-500' : c === 'orange' ? 'bg-orange-500' : c === 'yellow' ? 'bg-yellow-500' : c === 'blue' ? 'bg-blue-500' : 'bg-green-500'}`} />
                                                        {c}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        value={band.name}
                                        onChange={e => updateBand(idx, { name: e.target.value })}
                                        className="h-8 text-sm bg-white/50 dark:bg-black/20 font-medium flex-1 min-w-0"
                                    />
                                </div>
                                <div className="flex items-center gap-2 flex-1">
                                    <Label className="text-xs whitespace-nowrap">Score:</Label>
                                    <Input
                                        type="number" min={0} max={100}
                                        value={band.minScore}
                                        onChange={e => updateBand(idx, { minScore: parseInt(e.target.value) || 0 })}
                                        className="h-8 w-16 text-sm text-center bg-white/50 dark:bg-black/20"
                                    />
                                    <span className="text-xs">–</span>
                                    <Input
                                        type="number" min={0} max={100}
                                        value={band.maxScore}
                                        onChange={e => updateBand(idx, { maxScore: parseInt(e.target.value) || 100 })}
                                        className="h-8 w-16 text-sm text-center bg-white/50 dark:bg-black/20"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label className="text-xs whitespace-nowrap">Prioridade padrão:</Label>
                                    <Select value={band.priority} onValueChange={v => updateBand(idx, { priority: v as any })}>
                                        <SelectTrigger className="h-8 w-28 text-xs bg-white/50 dark:bg-black/20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PRIORITY_OPTIONS.map(p => (
                                                <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* ── SECTION B: Criticality Weights & Prioritization ─────────────── */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Target className="h-4 w-4 text-purple-600" />
                        Priorização e Prazos
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Configure os pesos de criticidade, o modo de priorização e os prazos para cada nível. Os prazos contam a partir do momento que o plano é liberado para o fornecedor.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Criticality Weights */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                            <Zap className="h-3.5 w-3.5 text-amber-500" />
                            Pesos de Criticidade
                        </Label>
                        <p className="text-xs text-muted-foreground">Define o multiplicador de peso para cada nível de criticidade dos controles do framework.</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {(['baixo', 'medio', 'alto', 'critico'] as CriticalityLevel[]).map(level => (
                                <div key={level} className={`p-3 rounded-lg border text-center ${CRITICALITY_COLORS[level]}`}>
                                    <Label className="text-xs font-semibold block mb-1.5">{CRITICALITY_LABELS[level]}</Label>
                                    <Input
                                        type="number" step="0.1" min={0.1} max={10}
                                        value={config.criticalityWeights[level]}
                                        onChange={e => updateCritWeight(level, parseFloat(e.target.value) || 1)}
                                        className="h-8 text-sm text-center bg-white/60 dark:bg-black/20 font-mono"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Prioritization Mode Toggle */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-blue-500" />
                            Modo de Priorização
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Escolha como definir os prazos e a prioridade dos planos de ação gerados automaticamente.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                className={`p-4 rounded-xl border-2 text-left transition-all ${config.prioritizationMode === 'criticality'
                                    ? 'border-primary bg-primary/5 shadow-sm'
                                    : 'border-border hover:border-primary/30'
                                    }`}
                                onClick={() => { setConfig(p => ({ ...p, prioritizationMode: 'criticality' })); setDirty(true); }}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${config.prioritizationMode === 'criticality' ? 'border-primary' : 'border-muted-foreground/40'}`}>
                                        {config.prioritizationMode === 'criticality' && <div className="w-2 h-2 rounded-full bg-primary" />}
                                    </div>
                                    <span className="text-sm font-semibold">Por Criticidade do Controle</span>
                                </div>
                                <p className="text-xs text-muted-foreground ml-6">
                                    Controles críticos recebem prazos curtos e alta prioridade. Ideal para focar nos riscos mais urgentes.
                                </p>
                            </button>
                            <button
                                className={`p-4 rounded-xl border-2 text-left transition-all ${config.prioritizationMode === 'maturity'
                                    ? 'border-primary bg-primary/5 shadow-sm'
                                    : 'border-border hover:border-primary/30'
                                    }`}
                                onClick={() => { setConfig(p => ({ ...p, prioritizationMode: 'maturity' })); setDirty(true); }}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${config.prioritizationMode === 'maturity' ? 'border-primary' : 'border-muted-foreground/40'}`}>
                                        {config.prioritizationMode === 'maturity' && <div className="w-2 h-2 rounded-full bg-primary" />}
                                    </div>
                                    <span className="text-sm font-semibold">Por Nível de Maturidade</span>
                                </div>
                                <p className="text-xs text-muted-foreground ml-6">
                                    O prazo é definido pelo nível de maturidade geral do assessment. Ideal para uma abordagem uniforme.
                                </p>
                            </button>
                        </div>
                    </div>

                    <Separator />

                    {/* Deadline Tables */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* By Criticality */}
                        <div className={`space-y-3 ${config.prioritizationMode === 'criticality' ? '' : 'opacity-50'}`}>
                            <Label className="text-xs font-semibold flex items-center gap-2">
                                Prazos por Criticidade
                                {config.prioritizationMode === 'criticality' && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Ativo</Badge>
                                )}
                            </Label>
                            <div className="space-y-2">
                                {(['critico', 'alto', 'medio', 'baixo'] as CriticalityLevel[]).map(level => (
                                    <div key={level} className="flex items-center gap-2">
                                        <Badge className={`text-[10px] w-16 justify-center ${CRITICALITY_COLORS[level]}`}>
                                            {CRITICALITY_LABELS[level]}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">até</span>
                                        <Input
                                            type="number" min={1}
                                            value={config.deadlines.byCriticality[level]}
                                            onChange={e => updateDeadlineCriticality(level, parseInt(e.target.value) || 30)}
                                            className="h-7 w-16 text-xs text-center"
                                            disabled={config.prioritizationMode !== 'criticality'}
                                        />
                                        <span className="text-xs text-muted-foreground">dias</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* By Maturity */}
                        <div className={`space-y-3 ${config.prioritizationMode === 'maturity' ? '' : 'opacity-50'}`}>
                            <Label className="text-xs font-semibold flex items-center gap-2">
                                Prazos por Maturidade
                                {config.prioritizationMode === 'maturity' && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Ativo</Badge>
                                )}
                            </Label>
                            <div className="space-y-2">
                                {config.maturityBands.map(band => (
                                    <div key={band.id} className="flex items-center gap-2">
                                        <Badge className={`text-[10px] w-24 justify-center ${colorClasses[band.color]?.split(' ').slice(0, 2).join(' ') ?? ''}`}>
                                            {band.name}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">até</span>
                                        <Input
                                            type="number" min={1}
                                            value={config.deadlines.byMaturity[band.id] ?? 90}
                                            onChange={e => updateDeadlineMaturity(band.id, parseInt(e.target.value) || 90)}
                                            className="h-7 w-16 text-xs text-center"
                                            disabled={config.prioritizationMode !== 'maturity'}
                                        />
                                        <span className="text-xs text-muted-foreground">dias</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── SECTION C: Action Plan Rules ─────────────────────────────────── */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base flex items-center gap-2">
                                <ListChecks className="h-4 w-4 text-orange-600" />
                                Regras de Geração de Plano de Ação
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                                Para cada tipo de resposta, defina se um controle insuficiente deve gerar um plano
                                e qual modelo usar. Use <code className="bg-muted px-1 rounded">{'{controle}'}</code> como variável do título/descrição.
                            </CardDescription>
                        </div>
                        <Button size="sm" variant="outline" onClick={addRule}>
                            <Plus className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Nova Regra</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {config.actionPlanRules.map((rule, idx) => (
                        <div key={rule.id} className="border rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2 bg-muted/40 border-b gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Switch
                                        checked={rule.requiresPlan}
                                        onCheckedChange={v => updateRule(idx, { requiresPlan: v })}
                                        id={`rule-enabled-${idx}`}
                                    />
                                    <Label htmlFor={`rule-enabled-${idx}`} className="text-xs font-medium cursor-pointer">
                                        {rule.requiresPlan ? 'Gera plano' : 'Não gera plano'}
                                    </Label>
                                    <div className="flex gap-1 flex-wrap">
                                        {rule.questionTypes.map(qt => (
                                            <Badge key={qt} variant="secondary" className="text-[10px] px-1.5 py-0">{qt}</Badge>
                                        ))}
                                    </div>
                                    <Badge className={`text-[10px] px-1.5 py-0 ${priorityBadgeClass(rule.priority)}`}>
                                        {PRIORITY_OPTIONS.find(p => p.value === rule.priority)?.label}
                                    </Badge>
                                </div>
                                <Button
                                    size="icon" variant="ghost"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                                    onClick={() => removeRule(idx)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>

                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Dispara para tipos de questão</Label>
                                        <div className="flex flex-wrap gap-1">
                                            {(['yes_no', 'multiple_choice', 'scale', 'rating', 'text', 'file_upload'] as const).map(qt => (
                                                <button
                                                    key={qt}
                                                    onClick={() => {
                                                        const current = rule.questionTypes;
                                                        const next = current.includes(qt)
                                                            ? current.filter(t => t !== qt)
                                                            : [...current, qt];
                                                        updateRule(idx, { questionTypes: next as any });
                                                    }}
                                                    className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${rule.questionTypes.includes(qt)
                                                        ? 'bg-primary text-primary-foreground border-primary'
                                                        : 'bg-muted text-muted-foreground border-border hover:border-primary/50'
                                                        }`}
                                                >
                                                    {qt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {rule.questionTypes.includes('yes_no') && (
                                        <div className="space-y-1">
                                            <Label className="text-xs">Resposta que dispara (yes_no)</Label>
                                            <Select
                                                value={rule.triggerAnswer ?? 'no'}
                                                onValueChange={v => updateRule(idx, { triggerAnswer: v })}
                                            >
                                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="no">Não</SelectItem>
                                                    <SelectItem value="yes">Sim</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {(rule.questionTypes.includes('scale') || rule.questionTypes.includes('rating')) && (
                                        <div className="space-y-1">
                                            <Label className="text-xs">Limiar de escala (≤ X dispara)</Label>
                                            <Input
                                                type="number" min={1} max={5}
                                                value={rule.scaleThreshold ?? 3}
                                                onChange={e => updateRule(idx, { scaleThreshold: parseInt(e.target.value) || 3 })}
                                                className="h-8 text-xs w-20"
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Prazo fallback (dias)</Label>
                                            <Input
                                                type="number" min={1}
                                                value={rule.dueDays}
                                                onChange={e => updateRule(idx, { dueDays: parseInt(e.target.value) || 90 })}
                                                className="h-8 text-xs"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Prioridade</Label>
                                            <Select value={rule.priority} onValueChange={v => updateRule(idx, { priority: v as any })}>
                                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {PRIORITY_OPTIONS.map(p => <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Título do plano (modelo)</Label>
                                        <Input
                                            value={rule.planTitleTemplate}
                                            onChange={e => updateRule(idx, { planTitleTemplate: e.target.value })}
                                            className="h-8 text-xs"
                                            placeholder="Implementar Controle: {controle}"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Descrição do plano (modelo)</Label>
                                        <Textarea
                                            value={rule.planDescriptionTemplate}
                                            onChange={e => updateRule(idx, { planDescriptionTemplate: e.target.value })}
                                            className="text-xs min-h-[80px] resize-none"
                                            placeholder="O controle {controle} requer implementação..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {config.actionPlanRules.length === 0 && (
                        <div className="text-center py-8 border rounded-lg border-dashed text-muted-foreground">
                            <Shield className="h-8 w-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">Nenhuma regra configurada.</p>
                            <Button variant="link" size="sm" onClick={addRule}>Adicionar primeira regra</Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Info banner */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                    <p className="font-medium">Como funciona a fórmula de maturidade</p>
                    <p>
                        <strong>Score = Σ(valor_resposta × peso_criticidade) / Σ(4 × peso_criticidade) × 100</strong>.
                        Cada resposta (Inexistente=0 a Otimizado=4) é multiplicada pelo peso de criticidade do controle.
                        Controles críticos têm mais peso no score final. A fórmula se adapta automaticamente à quantidade de controles.
                    </p>
                </div>
            </div>

            {/* Save button (bottom) */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={!dirty} className="w-full sm:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    {dirty ? 'Salvar Configuração*' : 'Configuração Salva'}
                </Button>
            </div>
        </div>
    );
};
