// ============================================================
// useAssessmentScoring.ts
// Criticality-weighted scoring engine for TPRM assessments.
// No Supabase calls — only business logic.
// ============================================================

// ─── Criticality types ──────────────────────────────────────────────────────

export type CriticalityLevel = 'baixo' | 'medio' | 'alto' | 'critico' | 'info';

export interface CriticalityWeightConfig {
    baixo: number;
    medio: number;
    alto: number;
    critico: number;
    info: number; // user-defined per question (0-10), default here is just fallback
}

export const DEFAULT_CRITICALITY_WEIGHTS: CriticalityWeightConfig = {
    baixo: 1.0,
    medio: 1.3,
    alto: 1.6,
    critico: 2.0,
    info: 5.0, // fallback — actual weight comes from question.riskWeight
};

// ─── Maturity response values ───────────────────────────────────────────────

/** Maps a maturity-level answer label → numeric value (0–4) */
export const MATURITY_ANSWER_VALUES: Record<string, number> = {
    'inexistente': 0,
    'inicial': 1,
    'basico': 2,
    'básico': 2,
    'gerenciado': 3,
    'otimizado': 4,
};

export const MAX_MATURITY_VALUE = 4;

export const MATURITY_ANSWER_LABELS = [
    'Inexistente',
    'Inicial',
    'Básico',
    'Gerenciado',
    'Otimizado',
];

// ─── Prioritization mode ────────────────────────────────────────────────────

export type PrioritizationMode = 'maturity' | 'criticality';

export interface DeadlineConfig {
    /** Days per maturity band (used when mode = 'maturity') */
    byMaturity: Record<string, number>;
    /** Days per criticality level (used when mode = 'criticality') */
    byCriticality: Record<CriticalityLevel, number>;
}

export const DEFAULT_DEADLINES: DeadlineConfig = {
    byMaturity: {
        inexistente: 30,
        inicial: 60,
        basico: 90,
        gerenciado: 120,
        otimizado: 180,
    },
    byCriticality: {
        critico: 30,
        alto: 60,
        medio: 90,
        baixo: 120,
        info: 0, // info questions don't generate action plans by default
    },
};

// ─── Maturity bands ─────────────────────────────────────────────────────────

export interface MaturityBand {
    id: string;
    name: string;           // e.g. "Inexistente"
    minScore: number;       // inclusive 0–100
    maxScore: number;       // inclusive 0–100
    color: string;          // tailwind color name: "red" | "orange" | "yellow" | "blue" | "green"
    priority: 'critical' | 'high' | 'medium' | 'low';
}

export const DEFAULT_MATURITY_BANDS: MaturityBand[] = [
    { id: 'inexistente', name: 'Inexistente', minScore: 0, maxScore: 19, color: 'red', priority: 'critical' },
    { id: 'inicial', name: 'Inicial', minScore: 20, maxScore: 39, color: 'orange', priority: 'high' },
    { id: 'basico', name: 'Básico', minScore: 40, maxScore: 59, color: 'yellow', priority: 'medium' },
    { id: 'gerenciado', name: 'Gerenciado', minScore: 60, maxScore: 79, color: 'blue', priority: 'low' },
    { id: 'otimizado', name: 'Otimizado', minScore: 80, maxScore: 100, color: 'green', priority: 'low' },
];

// ─── Action plan rules ──────────────────────────────────────────────────────

export interface ActionPlanRule {
    id: string;
    /** Which question types this rule applies to */
    questionTypes: Array<'yes_no' | 'multiple_choice' | 'scale' | 'rating' | 'text' | 'file_upload'>;
    /** For yes_no: 'no' triggers the plan */
    triggerAnswer?: string;
    /** For scale/rating: answers <= this threshold trigger the plan (1-5 scale) */
    scaleThreshold?: number;
    /** For multiple_choice: option indices (0-based) that trigger the plan */
    triggerOptionIndices?: number[];
    requiresPlan: boolean;
    planTitleTemplate: string;   // may use {controle} placeholder
    planDescriptionTemplate: string;
    dueDays: number;
    priority: 'critical' | 'high' | 'medium' | 'low';
}

export const DEFAULT_ACTION_PLAN_RULES: ActionPlanRule[] = [
    {
        id: 'rule_no',
        questionTypes: ['yes_no'],
        triggerAnswer: 'no',
        requiresPlan: true,
        planTitleTemplate: 'Implementar Controle: {controle}',
        planDescriptionTemplate: 'O controle "{controle}" foi identificado como inexistente ou não implementado. Este plano tem como objetivo garantir a implementação adequada deste controle.',
        dueDays: 90,
        priority: 'high',
    },
    {
        id: 'rule_scale_critical',
        questionTypes: ['scale', 'rating'],
        scaleThreshold: 2,
        requiresPlan: true,
        planTitleTemplate: 'Implementar Controle: {controle}',
        planDescriptionTemplate: 'O controle "{controle}" foi avaliado com maturidade muito baixa (nível ≤ 2). Requer implementação imediata.',
        dueDays: 90,
        priority: 'critical',
    },
    {
        id: 'rule_scale_partial',
        questionTypes: ['scale', 'rating'],
        scaleThreshold: 3,
        requiresPlan: true,
        planTitleTemplate: 'Melhorar Controle: {controle}',
        planDescriptionTemplate: 'O controle "{controle}" foi avaliado com maturidade parcial (nível 3). Requer plano de melhoria para elevar o nível de maturidade.',
        dueDays: 180,
        priority: 'medium',
    },
    {
        id: 'rule_mc_low',
        questionTypes: ['multiple_choice'],
        triggerOptionIndices: [2, 3],
        requiresPlan: true,
        planTitleTemplate: 'Adequar Controle: {controle}',
        planDescriptionTemplate: 'O controle "{controle}" foi identificado como parcialmente implementado ou não implementado. Este plano visa a adequação e conformidade com os requisitos.',
        dueDays: 120,
        priority: 'medium',
    },
];

// ─── Main config type ───────────────────────────────────────────────────────

export interface ScoringConfig {
    maturityBands: MaturityBand[];
    actionPlanRules: ActionPlanRule[];
    criticalityWeights: CriticalityWeightConfig;
    prioritizationMode: PrioritizationMode;
    deadlines: DeadlineConfig;
}

export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
    maturityBands: DEFAULT_MATURITY_BANDS,
    actionPlanRules: DEFAULT_ACTION_PLAN_RULES,
    criticalityWeights: DEFAULT_CRITICALITY_WEIGHTS,
    prioritizationMode: 'criticality',
    deadlines: DEFAULT_DEADLINES,
};

// ─── Storage ────────────────────────────────────────────────────────────────

export const getScoringConfigKey = (tenantId: string) =>
    `tprm_scoring_config_${tenantId}`;

export const loadScoringConfig = (tenantId: string): ScoringConfig => {
    try {
        const raw = localStorage.getItem(getScoringConfigKey(tenantId));
        if (raw) {
            const parsed = JSON.parse(raw);
            // Merge with defaults for backward compatibility
            return {
                ...DEFAULT_SCORING_CONFIG,
                ...parsed,
                criticalityWeights: { ...DEFAULT_CRITICALITY_WEIGHTS, ...parsed.criticalityWeights },
                deadlines: {
                    byMaturity: { ...DEFAULT_DEADLINES.byMaturity, ...parsed.deadlines?.byMaturity },
                    byCriticality: { ...DEFAULT_DEADLINES.byCriticality, ...parsed.deadlines?.byCriticality },
                },
            };
        }
    } catch { /* ignore */ }
    return DEFAULT_SCORING_CONFIG;
};

export const saveScoringConfig = (tenantId: string, config: ScoringConfig) => {
    localStorage.setItem(getScoringConfigKey(tenantId), JSON.stringify(config));
};

// ─── Backward compatibility: infer criticality from legacy weight ────────────

export function inferCriticality(question: { criticality?: string; weight?: number }): CriticalityLevel {
    if (question.criticality) return question.criticality as CriticalityLevel;
    // Legacy: map numeric weight → criticality (never infer 'info' from weight)
    const w = question.weight ?? 1;
    if (w >= 2) return 'critico';
    if (w >= 1.5) return 'alto';
    if (w >= 1.2) return 'medio';
    return 'baixo';
}

// ─── Types used by the engine ───────────────────────────────────────────────

export interface ScoredControl {
    questionId: string;
    questionText: string;
    category: string;
    type: string;
    answer: string | number | undefined;
    options?: string[];
    criticality: CriticalityLevel;
    criticalityWeight: number;
    maturityValue: number;       // 0–4 (the answer's maturity value)
    maxMaturityValue: number;    // always 4
    pointsObtained: number;      // maturityValue × criticalityWeight
    pointsMax: number;           // maxMaturityValue × criticalityWeight
    isInfoOnly: boolean;         // true = excluded from maturity, used for risk only
    riskWeight: number;          // for info questions: user-defined weight (0-10)
    needsActionPlan: boolean;
    appliedRuleId?: string;
}

export interface ScoreResult {
    score: number;                          // 0-100
    maturityLevel: MaturityBand;
    scoredControls: ScoredControl[];
    totalQuestions: number;
    answeredQuestions: number;
    /** Per-criticality breakdown */
    criticalityBreakdown: Record<CriticalityLevel, {
        count: number;
        totalPoints: number;
        maxPoints: number;
        averageMaturity: number;
    }>;
}

export interface GeneratedPlan {
    title: string;
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    dueDays: number;
    dueDate: string;                        // ISO string
    sourceQuestionId: string;
    sourceQuestionText: string;
    ruleId: string;
    criticality: CriticalityLevel;
    isInfoOnly: boolean;
}

// ─── Helper: Parse maturity answer ──────────────────────────────────────────

interface OptionWeight {
    label: string;
    weight: number;
}

function parseMaturityValue(
    answer: any,
    questionType: string,
    options?: string[],
    scaleMin?: number,
    scaleMax?: number,
    optionWeights?: OptionWeight[],
): { value: number; maxValue: number } {
    if (answer === undefined || answer === null || answer === '') return { value: 0, maxValue: MAX_MATURITY_VALUE };

    const answerStr = String(answer).toLowerCase().trim();

    // Direct maturity label match (Inexistente, Inicial, Básico, Gerenciado, Otimizado)
    if (MATURITY_ANSWER_VALUES[answerStr] !== undefined) {
        return { value: MATURITY_ANSWER_VALUES[answerStr], maxValue: MAX_MATURITY_VALUE };
    }

    // yes_no: "sim"/"yes" = Otimizado(4), "não"/"no" = Inexistente(0)
    if (questionType === 'yes_no' || questionType === 'yes_no_na') {
        if (answerStr === 'yes' || answerStr === 'sim') return { value: MAX_MATURITY_VALUE, maxValue: MAX_MATURITY_VALUE };
        if (answerStr === 'na' || answerStr === 'n/a') return { value: MAX_MATURITY_VALUE, maxValue: MAX_MATURITY_VALUE };
        return { value: 0, maxValue: MAX_MATURITY_VALUE };
    }

    // scale/rating: normalize to 0-4
    if (questionType === 'scale' || questionType === 'rating') {
        const val = typeof answer === 'string' ? parseFloat(answer) : (answer as number);
        const min = scaleMin ?? 1;
        const max = scaleMax ?? 5;
        if (isNaN(val)) return { value: 0, maxValue: MAX_MATURITY_VALUE };
        const ratio = Math.max(0, Math.min(1, (val - min) / (max - min)));
        return { value: Math.round(ratio * MAX_MATURITY_VALUE), maxValue: MAX_MATURITY_VALUE };
    }

    // ── CHECKBOX: each item is sim/não, score = sum of checked weights ────────
    if (questionType === 'checkbox') {
        // Answer should be an array of checked labels (or comma-separated string)
        const checkedItems: string[] = Array.isArray(answer)
            ? answer.map((a: any) => String(a).toLowerCase().trim())
            : String(answer).split(',').map(s => s.toLowerCase().trim()).filter(Boolean);

        if (optionWeights?.length) {
            const totalMaxWeight = optionWeights.reduce((sum, o) => sum + o.weight, 0) || 1;
            const checkedWeight = optionWeights
                .filter(o => checkedItems.includes(o.label.toLowerCase().trim()))
                .reduce((sum, o) => sum + o.weight, 0);
            return { value: checkedWeight, maxValue: totalMaxWeight };
        }
        // Fallback: no optionWeights, treat as ratio of checked/total
        if (options?.length) {
            const checkedCount = checkedItems.filter(c => options.some(o => o.toLowerCase().trim() === c)).length;
            const ratio = options.length > 0 ? checkedCount / options.length : 0;
            return { value: Math.round(ratio * MAX_MATURITY_VALUE), maxValue: MAX_MATURITY_VALUE };
        }
        return { value: checkedItems.length > 0 ? MAX_MATURITY_VALUE : 0, maxValue: MAX_MATURITY_VALUE };
    }

    // ── MULTIPLE CHOICE: single option selected, use its weight ─────────────
    if (questionType === 'multiple_choice') {
        if (optionWeights?.length) {
            const maxWeight = Math.max(...optionWeights.map(o => o.weight), 1);
            const matched = optionWeights.find(o => o.label.toLowerCase().trim() === answerStr);
            if (matched) {
                return { value: matched.weight, maxValue: maxWeight };
            }
            // Fallback: try by index
            const numericIdx = parseInt(String(answer));
            if (!isNaN(numericIdx) && numericIdx >= 0 && numericIdx < optionWeights.length) {
                return { value: optionWeights[numericIdx].weight, maxValue: maxWeight };
            }
            return { value: 0, maxValue: maxWeight };
        }
        // Fallback: no optionWeights, use position-based ratio
        if (options?.length) {
            if (MATURITY_ANSWER_VALUES[answerStr] !== undefined) {
                return { value: MATURITY_ANSWER_VALUES[answerStr], maxValue: MAX_MATURITY_VALUE };
            }
            const idx = options.findIndex(o => o.toLowerCase().trim() === answerStr);
            if (idx >= 0) {
                const ratio = options.length > 1 ? idx / (options.length - 1) : 0;
                return { value: Math.round(ratio * MAX_MATURITY_VALUE), maxValue: MAX_MATURITY_VALUE };
            }
        }
    }

    // text/file_upload: having an answer gives partial credit
    if (questionType === 'text' || questionType === 'file_upload') {
        return { value: Math.round(MAX_MATURITY_VALUE * 0.5), maxValue: MAX_MATURITY_VALUE };
    }

    return { value: 0, maxValue: MAX_MATURITY_VALUE };
}

// ─── Core scoring function ──────────────────────────────────────────────────

export function scoreAssessment(
    responses: Record<string, any>,
    questions: Array<{
        id: string;
        question?: string;
        text?: string;
        category?: string;
        type: string;
        weight?: number;
        criticality?: string;
        riskWeight?: number;       // for info questions: user-defined weight (0-10)
        options?: string[];
        optionWeights?: Array<{ label: string; weight: number }>;
        scale_min?: number;
        scale_max?: number;
    }>,
    config: ScoringConfig = DEFAULT_SCORING_CONFIG,
): ScoreResult {
    let totalPoints = 0;
    let maxPoints = 0;
    const scoredControls: ScoredControl[] = [];
    let answeredCount = 0;

    // Per-criticality accumulators
    const critBreakdown: Record<CriticalityLevel, { count: number; totalPoints: number; maxPoints: number; totalMaturity: number }> = {
        baixo: { count: 0, totalPoints: 0, maxPoints: 0, totalMaturity: 0 },
        medio: { count: 0, totalPoints: 0, maxPoints: 0, totalMaturity: 0 },
        alto: { count: 0, totalPoints: 0, maxPoints: 0, totalMaturity: 0 },
        critico: { count: 0, totalPoints: 0, maxPoints: 0, totalMaturity: 0 },
        info: { count: 0, totalPoints: 0, maxPoints: 0, totalMaturity: 0 },
    };

    for (const q of questions) {
        const criticality = inferCriticality(q);
        const isInfoOnly = criticality === 'info';
        const critWeight = isInfoOnly
            ? 0  // info questions do NOT contribute to maturity
            : (config.criticalityWeights[criticality] ?? 1);
        const riskWeight = q.riskWeight ?? (isInfoOnly ? 5 : 0);
        const questionText = q.question || q.text || '';

        const raw = responses[q.id];
        const hasAnswer = raw !== undefined && raw !== '' && raw !== null;
        if (hasAnswer) answeredCount++;

        const rawSettings = q.options;
        let parsedOptions: string[] = [];
        if (Array.isArray(rawSettings)) parsedOptions = rawSettings;
        else if (typeof rawSettings === 'string') parsedOptions = (rawSettings as string).split(',').map(s => s.trim());

        const parsed = parseMaturityValue(raw, q.type, parsedOptions, q.scale_min, q.scale_max, q.optionWeights);
        const maturityValue = parsed.value;
        const effectiveMax = parsed.maxValue;

        const pointsObtained = maturityValue * critWeight;
        const pointsMax = effectiveMax * critWeight;

        // Determine if this control needs an action plan
        const { needsPlan, ruleId } = evaluateRules({ ...q, options: parsedOptions }, raw, config.actionPlanRules);

        scoredControls.push({
            questionId: q.id,
            questionText,
            category: q.category ?? '',
            type: q.type,
            answer: raw,
            options: parsedOptions,
            isInfoOnly,
            riskWeight,
            criticality,
            criticalityWeight: critWeight,
            maturityValue,
            maxMaturityValue: effectiveMax,
            pointsObtained,
            pointsMax,
            needsActionPlan: needsPlan,
            appliedRuleId: ruleId,
        });

        // Info questions are excluded from maturity calculation
        if (!isInfoOnly) {
            totalPoints += pointsObtained;
            maxPoints += pointsMax;
        }

        // Update breakdown
        const bucket = critBreakdown[criticality];
        bucket.count++;
        bucket.totalPoints += pointsObtained;
        bucket.maxPoints += pointsMax;
        bucket.totalMaturity += maturityValue;
    }

    const rawScore = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
    const score = Math.max(0, Math.min(100, rawScore));

    const band = config.maturityBands.find(b => score >= b.minScore && score <= b.maxScore)
        ?? DEFAULT_MATURITY_BANDS[0];

    const criticalityBreakdown: ScoreResult['criticalityBreakdown'] = {} as any;
    for (const [level, data] of Object.entries(critBreakdown)) {
        criticalityBreakdown[level as CriticalityLevel] = {
            count: data.count,
            totalPoints: data.totalPoints,
            maxPoints: data.maxPoints,
            averageMaturity: data.count > 0 ? Math.round((data.totalMaturity / data.count) * 100) / 100 : 0,
        };
    }

    return {
        score,
        maturityLevel: band,
        scoredControls,
        totalQuestions: questions.length,
        answeredQuestions: answeredCount,
        criticalityBreakdown,
    };
}

// ─── Rule evaluation ────────────────────────────────────────────────────────

function evaluateRules(
    question: { id: string; type: string; options?: string[] | readonly string[] },
    answer: any,
    rules: ActionPlanRule[],
): { needsPlan: boolean; ruleId?: string } {
    if (answer === undefined || answer === null || answer === '') {
        return { needsPlan: true, ruleId: 'unanswered' };
    }

    for (const rule of rules) {
        if (!rule.requiresPlan) continue;
        if (!rule.questionTypes.includes(question.type as any)) continue;

        if ((question.type === 'yes_no' || question.type === 'yes_no_na') && rule.triggerAnswer) {
            if (String(answer).toLowerCase() === rule.triggerAnswer.toLowerCase()) {
                return { needsPlan: true, ruleId: rule.id };
            }
        }

        if ((question.type === 'scale' || question.type === 'rating') && rule.scaleThreshold !== undefined) {
            const val = typeof answer === 'string' ? parseFloat(answer) : (answer as number);
            if (val <= rule.scaleThreshold) {
                return { needsPlan: true, ruleId: rule.id };
            }
        }

        if (question.type === 'multiple_choice' && rule.triggerOptionIndices && question.options) {
            const opts = question.options as string[];
            const idx = opts.indexOf(String(answer));
            if (idx >= 0 && rule.triggerOptionIndices.includes(idx)) {
                return { needsPlan: true, ruleId: rule.id };
            }
        }
    }

    return { needsPlan: false };
}

// ─── Plan generation ────────────────────────────────────────────────────────

export function generateActionPlansFromRules(
    scoredControls: ScoredControl[],
    rules: ActionPlanRule[],
    vendorName?: string,
    config?: ScoringConfig,
    overallMaturityBand?: MaturityBand,
): GeneratedPlan[] {
    const plans: GeneratedPlan[] = [];
    const usedConfig = config ?? DEFAULT_SCORING_CONFIG;

    for (const control of scoredControls) {
        if (!control.needsActionPlan) continue;

        const rule = rules.find(r => r.id === control.appliedRuleId)
            ?? rules.find(r => r.questionTypes.includes(control.type as any) && r.requiresPlan);

        if (!rule && control.appliedRuleId !== 'unanswered') continue;

        const title = (rule?.planTitleTemplate ?? 'Implementar Controle: {controle}')
            .replace('{controle}', control.questionText.slice(0, 60))
            .replace('{fornecedor}', vendorName ?? 'Fornecedor');

        const description = (rule?.planDescriptionTemplate ?? 'O controle "{controle}" requer atenção.')
            .replace('{controle}', control.questionText)
            .replace('{fornecedor}', vendorName ?? 'Fornecedor');

        // Determine deadline based on prioritization mode
        let days: number;
        if (usedConfig.prioritizationMode === 'criticality') {
            days = usedConfig.deadlines.byCriticality[control.criticality] ?? rule?.dueDays ?? 90;
        } else {
            // By maturity: use the overall maturity band's deadline
            const bandId = overallMaturityBand?.id ?? 'inexistente';
            days = usedConfig.deadlines.byMaturity[bandId] ?? rule?.dueDays ?? 90;
        }

        const dueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

        // Determine priority based on prioritization mode
        let priority: 'critical' | 'high' | 'medium' | 'low';
        if (usedConfig.prioritizationMode === 'criticality') {
            const critPriorityMap: Record<CriticalityLevel, 'critical' | 'high' | 'medium' | 'low'> = {
                critico: 'critical',
                alto: 'high',
                medio: 'medium',
                baixo: 'low',
                info: 'low',
            };
            priority = critPriorityMap[control.criticality];
        } else {
            priority = overallMaturityBand?.priority ?? rule?.priority ?? 'high';
        }

        plans.push({
            title,
            description,
            priority,
            dueDays: days,
            dueDate,
            sourceQuestionId: control.questionId,
            sourceQuestionText: control.questionText,
            ruleId: control.appliedRuleId ?? 'default',
            criticality: control.criticality,
            isInfoOnly: control.isInfoOnly,
        });
    }

    return plans;
}
