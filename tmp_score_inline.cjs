const fs = require('fs');

const MAX_MATURITY_VALUE = 4;
const DEFAULT_SCORING_CONFIG = {
    maturityBands: [
        { name: 'Inicial', minScore: 0, maxScore: 25, color: 'red' },
        { name: 'Básico', minScore: 26, maxScore: 50, color: 'orange' },
        { name: 'Definido', minScore: 51, maxScore: 75, color: 'yellow' },
        { name: 'Gerenciado', minScore: 76, maxScore: 90, color: 'green' },
        { name: 'Otimizado', minScore: 91, maxScore: 100, color: 'emerald' },
    ],
    actionPlanRules: []
};

function parseMaturityValue(answer, questionType, options, scaleMin, scaleMax, optionWeights) {
    if (answer === undefined || answer === null || answer === '') return { value: 0, maxValue: MAX_MATURITY_VALUE };

    const answerStr = String(answer).toLowerCase().trim();

    if (questionType === 'yes_no' || questionType === 'yes_no_na') {
        if (answerStr === 'yes' || answerStr === 'sim') return { value: MAX_MATURITY_VALUE, maxValue: MAX_MATURITY_VALUE };
        if (answerStr === 'na' || answerStr === 'n/a' || answerStr === 'não aplicável') return { value: MAX_MATURITY_VALUE, maxValue: MAX_MATURITY_VALUE };
        if (answerStr === 'no' || answerStr === 'não' || answerStr === 'nao') return { value: 0, maxValue: MAX_MATURITY_VALUE };
        return { value: 0, maxValue: MAX_MATURITY_VALUE };
    }

    if (questionType === 'multiple_choice' && options) {
        if (optionWeights) {
            const weightEntry = optionWeights.find((w) => String(w.option).toLowerCase().trim() === answerStr);
            if (weightEntry && weightEntry.weight !== undefined) {
                return { value: weightEntry.weight, maxValue: MAX_MATURITY_VALUE };
            }
        }
        const index = options.findIndex((opt) => String(opt).toLowerCase().trim() === answerStr);
        if (index >= 0) {
            const ratio = index / Math.max(1, options.length - 1);
            return { value: Math.round(ratio * MAX_MATURITY_VALUE), maxValue: MAX_MATURITY_VALUE };
        }
    }

    if (questionType === 'scale' || questionType === 'rating') {
        const numAnswer = parseFloat(answerStr);
        if (!isNaN(numAnswer)) {
            const min = scaleMin ?? 1;
            const max = scaleMax ?? 5;
            const validAnswer = Math.max(min, Math.min(max, numAnswer));
            const ratio = (validAnswer - min) / Math.max(1, max - min);
            return { value: Math.round(ratio * MAX_MATURITY_VALUE), maxValue: MAX_MATURITY_VALUE };
        }
    }

    if (questionType === 'text' || questionType === 'file_upload') {
        return { value: Math.round(MAX_MATURITY_VALUE * 0.5), maxValue: MAX_MATURITY_VALUE };
    }

    return { value: 0, maxValue: MAX_MATURITY_VALUE };
}

function scoreAssessment(responses, questions, config = DEFAULT_SCORING_CONFIG) {
    let totalScore = 0;
    let maxPossibleScore = 0;
    const scoredControls = [];

    questions.forEach((q) => {
        if (!q.required && (responses[q.id] === undefined || responses[q.id] === '')) {
            return;
        }

        const answer = responses[q.id];
        const { value, maxValue } = parseMaturityValue(
            answer,
            q.type,
            q.options,
            q.scale_min,
            q.scale_max,
            q.option_weights
        );

        const weight = q.weight || 1;
        totalScore += value * weight;
        maxPossibleScore += maxValue * weight;

        scoredControls.push({
            questionId: q.id,
            maturityValue: value,
            maxMaturityValue: maxValue,
            weight: weight,
            isCompliant: value === maxValue,
            originalAnswer: answer
        });
    });

    const normalizedScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    const finalScore = Math.round(normalizedScore * 100) / 100;

    let maturityLevel = config.maturityBands[0];
    for (const band of config.maturityBands) {
        if (finalScore >= band.minScore && finalScore <= band.maxScore) {
            maturityLevel = band;
            break;
        }
    }

    return {
        score: finalScore,
        maturityLevel,
        scoredControls
    };
}

const DEFAULT_ASSESSMENT_QUESTIONS = require('./tmp_legacy_questions.cjs');
const data = JSON.parse(fs.readFileSync('tmp_assessments_full.json', 'utf8'));
const oldAssessment = data.find(d => d.id === '497aadf4-015e-43e0-9eb0-0ba3fb4ac69e');

const normalized = DEFAULT_ASSESSMENT_QUESTIONS.map(q => ({
    ...q,
    question: q.question || q.text || 'Questão sem título'
}));

console.log("Answers:", Object.keys(oldAssessment.responses).length);
console.log("Legacy Questions Available:", normalized.length);

try {
    const result = scoreAssessment(oldAssessment.responses, normalized);
    console.log("Score Result: ", result.score, "%");
    console.log("Maturity: ", result.maturityLevel.name);
} catch (e) {
    console.error("Error:", e);
}
