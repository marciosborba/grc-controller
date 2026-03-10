"use strict";
// ============================================================
// useAssessmentScoring.ts
// Criticality-weighted scoring engine for TPRM assessments.
// No Supabase calls — only business logic.
// ============================================================
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveScoringConfig = exports.loadScoringConfig = exports.getScoringConfigKey = exports.DEFAULT_SCORING_CONFIG = exports.DEFAULT_ACTION_PLAN_RULES = exports.DEFAULT_MATURITY_BANDS = exports.DEFAULT_DEADLINES = exports.MATURITY_ANSWER_LABELS = exports.MAX_MATURITY_VALUE = exports.MATURITY_ANSWER_VALUES = exports.DEFAULT_CRITICALITY_WEIGHTS = void 0;
exports.inferCriticality = inferCriticality;
exports.scoreAssessment = scoreAssessment;
exports.generateActionPlansFromRules = generateActionPlansFromRules;
exports.DEFAULT_CRITICALITY_WEIGHTS = {
    baixo: 1.0,
    medio: 1.3,
    alto: 1.6,
    critico: 2.0,
    info: 5.0, // fallback — actual weight comes from question.riskWeight
};
// ─── Maturity response values ───────────────────────────────────────────────
/** Maps a maturity-level answer label → numeric value (0–4) */
exports.MATURITY_ANSWER_VALUES = {
    'inexistente': 0,
    'inicial': 1,
    'basico': 2,
    'básico': 2,
    'gerenciado': 3,
    'otimizado': 4,
};
exports.MAX_MATURITY_VALUE = 4;
exports.MATURITY_ANSWER_LABELS = [
    'Inexistente',
    'Inicial',
    'Básico',
    'Gerenciado',
    'Otimizado',
];
exports.DEFAULT_DEADLINES = {
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
exports.DEFAULT_MATURITY_BANDS = [
    { id: 'inexistente', name: 'Inexistente', minScore: 0, maxScore: 19, color: 'red', priority: 'critical' },
    { id: 'inicial', name: 'Inicial', minScore: 20, maxScore: 39, color: 'orange', priority: 'high' },
    { id: 'basico', name: 'Básico', minScore: 40, maxScore: 59, color: 'yellow', priority: 'medium' },
    { id: 'gerenciado', name: 'Gerenciado', minScore: 60, maxScore: 79, color: 'blue', priority: 'low' },
    { id: 'otimizado', name: 'Otimizado', minScore: 80, maxScore: 100, color: 'green', priority: 'low' },
];
exports.DEFAULT_ACTION_PLAN_RULES = [
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
exports.DEFAULT_SCORING_CONFIG = {
    maturityBands: exports.DEFAULT_MATURITY_BANDS,
    actionPlanRules: exports.DEFAULT_ACTION_PLAN_RULES,
    criticalityWeights: exports.DEFAULT_CRITICALITY_WEIGHTS,
    prioritizationMode: 'criticality',
    deadlines: exports.DEFAULT_DEADLINES,
};
// ─── Storage ────────────────────────────────────────────────────────────────
var getScoringConfigKey = function (tenantId) {
    return "tprm_scoring_config_".concat(tenantId);
};
exports.getScoringConfigKey = getScoringConfigKey;
var loadScoringConfig = function (tenantId) {
    var _a, _b;
    try {
        var raw = localStorage.getItem((0, exports.getScoringConfigKey)(tenantId));
        if (raw) {
            var parsed = JSON.parse(raw);
            // Merge with defaults for backward compatibility
            return __assign(__assign(__assign({}, exports.DEFAULT_SCORING_CONFIG), parsed), { criticalityWeights: __assign(__assign({}, exports.DEFAULT_CRITICALITY_WEIGHTS), parsed.criticalityWeights), deadlines: {
                    byMaturity: __assign(__assign({}, exports.DEFAULT_DEADLINES.byMaturity), (_a = parsed.deadlines) === null || _a === void 0 ? void 0 : _a.byMaturity),
                    byCriticality: __assign(__assign({}, exports.DEFAULT_DEADLINES.byCriticality), (_b = parsed.deadlines) === null || _b === void 0 ? void 0 : _b.byCriticality),
                } });
        }
    }
    catch ( /* ignore */_c) { /* ignore */ }
    return exports.DEFAULT_SCORING_CONFIG;
};
exports.loadScoringConfig = loadScoringConfig;
var saveScoringConfig = function (tenantId, config) {
    localStorage.setItem((0, exports.getScoringConfigKey)(tenantId), JSON.stringify(config));
};
exports.saveScoringConfig = saveScoringConfig;
// ─── Backward compatibility: infer criticality from legacy weight ────────────
function inferCriticality(question) {
    var _a;
    if (question.criticality)
        return question.criticality;
    // Legacy: map numeric weight → criticality (never infer 'info' from weight)
    var w = (_a = question.weight) !== null && _a !== void 0 ? _a : 1;
    if (w >= 2)
        return 'critico';
    if (w >= 1.5)
        return 'alto';
    if (w >= 1.2)
        return 'medio';
    return 'baixo';
}
function parseMaturityValue(answer, questionType, options, scaleMin, scaleMax, optionWeights) {
    if (answer === undefined || answer === null || answer === '')
        return { value: 0, maxValue: exports.MAX_MATURITY_VALUE };
    var answerStr = String(answer).toLowerCase().trim();
    // Direct maturity label match (Inexistente, Inicial, Básico, Gerenciado, Otimizado)
    if (exports.MATURITY_ANSWER_VALUES[answerStr] !== undefined) {
        return { value: exports.MATURITY_ANSWER_VALUES[answerStr], maxValue: exports.MAX_MATURITY_VALUE };
    }
    // yes_no: "sim"/"yes" = Otimizado(4), "não"/"no" = Inexistente(0)
    if (questionType === 'yes_no' || questionType === 'yes_no_na') {
        if (answerStr === 'yes' || answerStr === 'sim')
            return { value: exports.MAX_MATURITY_VALUE, maxValue: exports.MAX_MATURITY_VALUE };
        if (answerStr === 'na' || answerStr === 'n/a')
            return { value: exports.MAX_MATURITY_VALUE, maxValue: exports.MAX_MATURITY_VALUE };
        return { value: 0, maxValue: exports.MAX_MATURITY_VALUE };
    }
    // scale/rating: normalize to 0-4
    if (questionType === 'scale' || questionType === 'rating') {
        var val = typeof answer === 'string' ? parseFloat(answer) : answer;
        var min = scaleMin !== null && scaleMin !== void 0 ? scaleMin : 1;
        var max = scaleMax !== null && scaleMax !== void 0 ? scaleMax : 5;
        if (isNaN(val))
            return { value: 0, maxValue: exports.MAX_MATURITY_VALUE };
        var ratio = Math.max(0, Math.min(1, (val - min) / (max - min)));
        return { value: Math.round(ratio * exports.MAX_MATURITY_VALUE), maxValue: exports.MAX_MATURITY_VALUE };
    }
    // ── CHECKBOX: each item is sim/não, score = sum of checked weights ────────
    if (questionType === 'checkbox') {
        // Answer should be an array of checked labels (or comma-separated string)
        var checkedItems_1 = Array.isArray(answer)
            ? answer.map(function (a) { return String(a).toLowerCase().trim(); })
            : String(answer).split(',').map(function (s) { return s.toLowerCase().trim(); }).filter(Boolean);
        if (optionWeights === null || optionWeights === void 0 ? void 0 : optionWeights.length) {
            var totalMaxWeight = optionWeights.reduce(function (sum, o) { return sum + o.weight; }, 0) || 1;
            var checkedWeight = optionWeights
                .filter(function (o) { return checkedItems_1.includes(o.label.toLowerCase().trim()); })
                .reduce(function (sum, o) { return sum + o.weight; }, 0);
            return { value: checkedWeight, maxValue: totalMaxWeight };
        }
        // Fallback: no optionWeights, treat as ratio of checked/total
        if (options === null || options === void 0 ? void 0 : options.length) {
            var checkedCount = checkedItems_1.filter(function (c) { return options.some(function (o) { return o.toLowerCase().trim() === c; }); }).length;
            var ratio = options.length > 0 ? checkedCount / options.length : 0;
            return { value: Math.round(ratio * exports.MAX_MATURITY_VALUE), maxValue: exports.MAX_MATURITY_VALUE };
        }
        return { value: checkedItems_1.length > 0 ? exports.MAX_MATURITY_VALUE : 0, maxValue: exports.MAX_MATURITY_VALUE };
    }
    // ── MULTIPLE CHOICE: single option selected, use its weight ─────────────
    if (questionType === 'multiple_choice') {
        if (optionWeights === null || optionWeights === void 0 ? void 0 : optionWeights.length) {
            var maxWeight = Math.max.apply(Math, __spreadArray(__spreadArray([], optionWeights.map(function (o) { return o.weight; }), false), [1], false));
            var matched = optionWeights.find(function (o) { return o.label.toLowerCase().trim() === answerStr; });
            if (matched) {
                return { value: matched.weight, maxValue: maxWeight };
            }
            // Fallback: try by index
            var numericIdx = parseInt(String(answer));
            if (!isNaN(numericIdx) && numericIdx >= 0 && numericIdx < optionWeights.length) {
                return { value: optionWeights[numericIdx].weight, maxValue: maxWeight };
            }
            return { value: 0, maxValue: maxWeight };
        }
        // Fallback: no optionWeights, use position-based ratio
        if (options === null || options === void 0 ? void 0 : options.length) {
            if (exports.MATURITY_ANSWER_VALUES[answerStr] !== undefined) {
                return { value: exports.MATURITY_ANSWER_VALUES[answerStr], maxValue: exports.MAX_MATURITY_VALUE };
            }
            var idx = options.findIndex(function (o) { return o.toLowerCase().trim() === answerStr; });
            if (idx >= 0) {
                var ratio = options.length > 1 ? idx / (options.length - 1) : 0;
                return { value: Math.round(ratio * exports.MAX_MATURITY_VALUE), maxValue: exports.MAX_MATURITY_VALUE };
            }
        }
    }
    // text/file_upload: having an answer gives partial credit
    if (questionType === 'text' || questionType === 'file_upload') {
        return { value: Math.round(exports.MAX_MATURITY_VALUE * 0.5), maxValue: exports.MAX_MATURITY_VALUE };
    }
    return { value: 0, maxValue: exports.MAX_MATURITY_VALUE };
}
// ─── Core scoring function ──────────────────────────────────────────────────
function scoreAssessment(responses, questions, config) {
    var _a, _b, _c, _d;
    if (config === void 0) { config = exports.DEFAULT_SCORING_CONFIG; }
    var totalPoints = 0;
    var maxPoints = 0;
    var scoredControls = [];
    var answeredCount = 0;
    // Per-criticality accumulators
    var critBreakdown = {
        baixo: { count: 0, totalPoints: 0, maxPoints: 0, totalMaturity: 0 },
        medio: { count: 0, totalPoints: 0, maxPoints: 0, totalMaturity: 0 },
        alto: { count: 0, totalPoints: 0, maxPoints: 0, totalMaturity: 0 },
        critico: { count: 0, totalPoints: 0, maxPoints: 0, totalMaturity: 0 },
        info: { count: 0, totalPoints: 0, maxPoints: 0, totalMaturity: 0 },
    };
    for (var _i = 0, questions_1 = questions; _i < questions_1.length; _i++) {
        var q = questions_1[_i];
        var criticality = inferCriticality(q);
        var isInfoOnly = criticality === 'info';
        var critWeight = isInfoOnly
            ? 0 // info questions do NOT contribute to maturity
            : ((_a = config.criticalityWeights[criticality]) !== null && _a !== void 0 ? _a : 1);
        var riskWeight = (_b = q.riskWeight) !== null && _b !== void 0 ? _b : (isInfoOnly ? 5 : 0);
        var questionText = q.question || q.text || '';
        var raw = responses[q.id];
        var hasAnswer = raw !== undefined && raw !== '' && raw !== null;
        if (hasAnswer)
            answeredCount++;
        var parsed = parseMaturityValue(raw, q.type, q.options, q.scale_min, q.scale_max, q.optionWeights);
        var maturityValue = parsed.value;
        var effectiveMax = parsed.maxValue;
        var pointsObtained = maturityValue * critWeight;
        var pointsMax = effectiveMax * critWeight;
        // Determine if this control needs an action plan
        var _e = evaluateRules(q, raw, config.actionPlanRules), needsPlan = _e.needsPlan, ruleId = _e.ruleId;
        scoredControls.push({
            questionId: q.id,
            questionText: questionText,
            category: (_c = q.category) !== null && _c !== void 0 ? _c : '',
            type: q.type,
            answer: raw,
            options: q.options,
            isInfoOnly: isInfoOnly,
            riskWeight: riskWeight,
            criticality: criticality,
            criticalityWeight: critWeight,
            maturityValue: maturityValue,
            maxMaturityValue: effectiveMax,
            pointsObtained: pointsObtained,
            pointsMax: pointsMax,
            needsActionPlan: needsPlan,
            appliedRuleId: ruleId,
        });
        // Info questions are excluded from maturity calculation
        if (!isInfoOnly) {
            totalPoints += pointsObtained;
            maxPoints += pointsMax;
        }
        // Update breakdown
        var bucket = critBreakdown[criticality];
        bucket.count++;
        bucket.totalPoints += pointsObtained;
        bucket.maxPoints += pointsMax;
        bucket.totalMaturity += maturityValue;
    }
    var rawScore = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
    var score = Math.max(0, Math.min(100, rawScore));
    var band = (_d = config.maturityBands.find(function (b) { return score >= b.minScore && score <= b.maxScore; })) !== null && _d !== void 0 ? _d : exports.DEFAULT_MATURITY_BANDS[0];
    var criticalityBreakdown = {};
    for (var _f = 0, _g = Object.entries(critBreakdown); _f < _g.length; _f++) {
        var _h = _g[_f], level = _h[0], data = _h[1];
        criticalityBreakdown[level] = {
            count: data.count,
            totalPoints: data.totalPoints,
            maxPoints: data.maxPoints,
            averageMaturity: data.count > 0 ? Math.round((data.totalMaturity / data.count) * 100) / 100 : 0,
        };
    }
    return {
        score: score,
        maturityLevel: band,
        scoredControls: scoredControls,
        totalQuestions: questions.length,
        answeredQuestions: answeredCount,
        criticalityBreakdown: criticalityBreakdown,
    };
}
// ─── Rule evaluation ────────────────────────────────────────────────────────
function evaluateRules(question, answer, rules) {
    if (answer === undefined || answer === null || answer === '') {
        return { needsPlan: true, ruleId: 'unanswered' };
    }
    for (var _i = 0, rules_1 = rules; _i < rules_1.length; _i++) {
        var rule = rules_1[_i];
        if (!rule.requiresPlan)
            continue;
        if (!rule.questionTypes.includes(question.type))
            continue;
        if ((question.type === 'yes_no' || question.type === 'yes_no_na') && rule.triggerAnswer) {
            if (String(answer).toLowerCase() === rule.triggerAnswer.toLowerCase()) {
                return { needsPlan: true, ruleId: rule.id };
            }
        }
        if ((question.type === 'scale' || question.type === 'rating') && rule.scaleThreshold !== undefined) {
            var val = typeof answer === 'string' ? parseFloat(answer) : answer;
            if (val <= rule.scaleThreshold) {
                return { needsPlan: true, ruleId: rule.id };
            }
        }
        if (question.type === 'multiple_choice' && rule.triggerOptionIndices && question.options) {
            var opts = question.options;
            var idx = opts.indexOf(String(answer));
            if (idx >= 0 && rule.triggerOptionIndices.includes(idx)) {
                return { needsPlan: true, ruleId: rule.id };
            }
        }
    }
    return { needsPlan: false };
}
// ─── Plan generation ────────────────────────────────────────────────────────
function generateActionPlansFromRules(scoredControls, rules, vendorName, config, overallMaturityBand) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var plans = [];
    var usedConfig = config !== null && config !== void 0 ? config : exports.DEFAULT_SCORING_CONFIG;
    var _loop_1 = function (control) {
        if (!control.needsActionPlan)
            return "continue";
        var rule = (_a = rules.find(function (r) { return r.id === control.appliedRuleId; })) !== null && _a !== void 0 ? _a : rules.find(function (r) { return r.questionTypes.includes(control.type) && r.requiresPlan; });
        if (!rule && control.appliedRuleId !== 'unanswered')
            return "continue";
        var title = ((_b = rule === null || rule === void 0 ? void 0 : rule.planTitleTemplate) !== null && _b !== void 0 ? _b : 'Implementar Controle: {controle}')
            .replace('{controle}', control.questionText.slice(0, 60))
            .replace('{fornecedor}', vendorName !== null && vendorName !== void 0 ? vendorName : 'Fornecedor');
        var description = ((_c = rule === null || rule === void 0 ? void 0 : rule.planDescriptionTemplate) !== null && _c !== void 0 ? _c : 'O controle "{controle}" requer atenção.')
            .replace('{controle}', control.questionText)
            .replace('{fornecedor}', vendorName !== null && vendorName !== void 0 ? vendorName : 'Fornecedor');
        // Determine deadline based on prioritization mode
        var days = void 0;
        if (usedConfig.prioritizationMode === 'criticality') {
            days = (_e = (_d = usedConfig.deadlines.byCriticality[control.criticality]) !== null && _d !== void 0 ? _d : rule === null || rule === void 0 ? void 0 : rule.dueDays) !== null && _e !== void 0 ? _e : 90;
        }
        else {
            // By maturity: use the overall maturity band's deadline
            var bandId = (_f = overallMaturityBand === null || overallMaturityBand === void 0 ? void 0 : overallMaturityBand.id) !== null && _f !== void 0 ? _f : 'inexistente';
            days = (_h = (_g = usedConfig.deadlines.byMaturity[bandId]) !== null && _g !== void 0 ? _g : rule === null || rule === void 0 ? void 0 : rule.dueDays) !== null && _h !== void 0 ? _h : 90;
        }
        var dueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
        // Determine priority based on prioritization mode
        var priority = void 0;
        if (usedConfig.prioritizationMode === 'criticality') {
            var critPriorityMap = {
                critico: 'critical',
                alto: 'high',
                medio: 'medium',
                baixo: 'low',
                info: 'low',
            };
            priority = critPriorityMap[control.criticality];
        }
        else {
            priority = (_k = (_j = overallMaturityBand === null || overallMaturityBand === void 0 ? void 0 : overallMaturityBand.priority) !== null && _j !== void 0 ? _j : rule === null || rule === void 0 ? void 0 : rule.priority) !== null && _k !== void 0 ? _k : 'high';
        }
        plans.push({
            title: title,
            description: description,
            priority: priority,
            dueDays: days,
            dueDate: dueDate,
            sourceQuestionId: control.questionId,
            sourceQuestionText: control.questionText,
            ruleId: (_l = control.appliedRuleId) !== null && _l !== void 0 ? _l : 'default',
            criticality: control.criticality,
            isInfoOnly: control.isInfoOnly,
        });
    };
    for (var _i = 0, scoredControls_1 = scoredControls; _i < scoredControls_1.length; _i++) {
        var control = scoredControls_1[_i];
        _loop_1(control);
    }
    return plans;
}
