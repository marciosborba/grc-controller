const MAX_MATURITY_VALUE = 4;

function parseMaturityValue(
    answer,
    questionType,
    options,
    scaleMin,
    scaleMax,
    optionWeights
) {
    if (answer === undefined || answer === null || answer === '') return { value: 0, maxValue: MAX_MATURITY_VALUE };

    const answerStr = String(answer).toLowerCase().trim();

    if (questionType === 'yes_no' || questionType === 'yes_no_na') {
        if (answerStr === 'yes' || answerStr === 'sim') return { value: MAX_MATURITY_VALUE, maxValue: MAX_MATURITY_VALUE };
        if (answerStr === 'na' || answerStr === 'n/a') return { value: MAX_MATURITY_VALUE, maxValue: MAX_MATURITY_VALUE };
        return { value: 0, maxValue: MAX_MATURITY_VALUE };
    }

    if (questionType === 'multiple_choice' && options) {
        if (optionWeights) {
            const weightEntry = optionWeights.find(w => String(w.option).toLowerCase().trim() === answerStr);
            if (weightEntry && weightEntry.weight !== undefined) {
                return { value: weightEntry.weight, maxValue: MAX_MATURITY_VALUE };
            }
        }
        const index = options.findIndex(opt => String(opt).toLowerCase().trim() === answerStr);
        if (index >= 0) {
            const ratio = index / Math.max(1, options.length - 1);
            return { value: Math.round(ratio * MAX_MATURITY_VALUE), maxValue: MAX_MATURITY_VALUE };
        }
        return { value: 0, maxValue: MAX_MATURITY_VALUE };
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
        return { value: 0, maxValue: MAX_MATURITY_VALUE };
    }

    if (questionType === 'text' || questionType === 'file_upload') {
        return { value: Math.round(MAX_MATURITY_VALUE * 0.5), maxValue: MAX_MATURITY_VALUE };
    }

    return { value: 0, maxValue: MAX_MATURITY_VALUE };
}

console.log("Teste 1 (yes):", parseMaturityValue("yes", "yes_no"));
console.log("Teste 2 (sim):", parseMaturityValue("sim", "yes_no"));
console.log("Teste 3 (no):", parseMaturityValue("no", "yes_no"));
console.log("Teste 4 (teste):", parseMaturityValue("teste", "yes_no"));
