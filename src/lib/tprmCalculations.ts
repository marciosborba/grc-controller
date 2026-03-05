// lib/tprmCalculations.ts

// Helper function to extract the score accounting for metadata variations
export const extractAssessmentScore = (assessment: any): number | null => {
    if (typeof assessment.overall_score === 'number') return assessment.overall_score;
    if (typeof assessment.metadata?.submission_summary?.maturity_score === 'number') return assessment.metadata.submission_summary.maturity_score;
    if (typeof assessment.metadata?.validation?.overallScore === 'number') return assessment.metadata.validation.overallScore;

    // Also try to parse if it's a string, just in case
    if (assessment.metadata?.submission_summary?.maturity_score && !isNaN(Number(assessment.metadata.submission_summary.maturity_score))) {
        return Number(assessment.metadata.submission_summary.maturity_score);
    }

    return null;
};

export const calculateVendorMaturity = (assessments: any[]) => {
    if (!assessments || assessments.length === 0) {
        return { score: 0, level: 'Desconhecida', labelColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' };
    }

    // Consider only completed or approved assessments
    const completed = assessments.filter(a => ['completed', 'approved'].includes(a.status?.toLowerCase()));
    if (completed.length === 0) {
        return { score: 0, level: 'Inicial', labelColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' };
    }

    // Average score based on extracted score, ignore progress percentage
    const validScores = completed
        .map(a => extractAssessmentScore(a))
        .filter(score => score !== null) as number[];

    if (validScores.length === 0) {
        return { score: 0, level: 'Inicial', labelColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' };
    }

    const totalScore = validScores.reduce((acc, curr) => acc + curr, 0);
    const avgScore = totalScore / validScores.length;

    let level = 'Inicial';
    let labelColor = 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200';

    if (avgScore >= 85) {
        level = 'Otimizado';
        labelColor = 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200';
    } else if (avgScore >= 70) {
        level = 'Gerenciado';
        labelColor = 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 border-teal-200';
    } else if (avgScore >= 50) {
        level = 'Definido';
        labelColor = 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200';
    } else if (avgScore >= 30) {
        level = 'Repetível';
        labelColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200';
    }

    return { score: avgScore, level, labelColor };
};

export const calculateVendorDynamicRisk = (maturityScore: number, criticality: string, riskOverride?: string | null) => {
    // 1. Inherent Risk base on Criticality
    let inherentRisk = 25; // default low
    let maxMitigationFactor = 1.0; // 100%

    switch ((criticality || '').toLowerCase()) {
        case 'critical':
            inherentRisk = 100;
            maxMitigationFactor = 0.5; // Can only mitigate 50%
            break;
        case 'high':
            inherentRisk = 80;
            maxMitigationFactor = 0.6; // Can mitigate 60%
            break;
        case 'medium':
            inherentRisk = 50;
            maxMitigationFactor = 0.8; // Can mitigate 80%
            break;
        case 'low':
        default:
            inherentRisk = 25;
            maxMitigationFactor = 1.0; // Can mitigate 100%
            break;
    }

    // 2. Residual Risk Formula
    // Residual Risk = Inherent Risk - (Inherent Risk * (Maturity / 100) * MMF)
    let residualRiskScore = inherentRisk - (inherentRisk * (maturityScore / 100) * maxMitigationFactor);
    residualRiskScore = Math.min(Math.max(residualRiskScore, 0), 100); // Between 0 and 100

    let level = 'Baixo';
    let labelColor = 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200';

    if (residualRiskScore >= 75) {
        level = 'Crítico';
        labelColor = 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200';
    } else if (residualRiskScore >= 50) {
        level = 'Alto';
        labelColor = 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200';
    } else if (residualRiskScore >= 25) {
        level = 'Médio';
        labelColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200';
    }

    // 3. Handle Override
    let finalLevel = level;
    let finalLabelColor = labelColor;
    let isOverridden = false;

    if (riskOverride) {
        isOverridden = true;
        switch (riskOverride.toLowerCase()) {
            case 'critical':
                finalLevel = 'Crítico';
                finalLabelColor = 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200';
                break;
            case 'high':
                finalLevel = 'Alto';
                finalLabelColor = 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200';
                break;
            case 'medium':
                finalLevel = 'Médio';
                finalLabelColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200';
                break;
            case 'low':
            default:
                finalLevel = 'Baixo';
                finalLabelColor = 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200';
                break;
        }
    }

    return {
        score: residualRiskScore,
        originalLevel: level,
        level: finalLevel,
        labelColor: finalLabelColor,
        isOverridden
    };
};
