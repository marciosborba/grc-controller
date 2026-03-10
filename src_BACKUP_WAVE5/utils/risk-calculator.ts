
export interface RiskFactors {
    // CVSS 3.1 Base Metrics
    attackVector: 'Network' | 'Adjacent' | 'Local' | 'Physical';
    attackComplexity: 'Low' | 'High';
    privilegesRequired: 'None' | 'Low' | 'High';
    userInteraction: 'None' | 'Required';
    scope: 'Unchanged' | 'Changed';
    confidentialityImpact: 'None' | 'Low' | 'High';
    integrityImpact: 'None' | 'Low' | 'High';
    availabilityImpact: 'None' | 'Low' | 'High';

    // Environmental Factors
    assetExposure: 'Internet' | 'Internal' | 'Restricted' | 'Isolated';
    assetCriticality: 'Low' | 'Medium' | 'High' | 'Critical';
    dataClassification: 'Public' | 'Internal' | 'Confidential' | 'Restricted';

    // Temporal Factors
    exploitCodeMaturity: 'Not_Defined' | 'Unproven' | 'Proof_of_Concept' | 'Functional' | 'High';
    remediationLevel: 'Not_Defined' | 'Official_Fix' | 'Temporary_Fix' | 'Workaround' | 'Unavailable';
    reportConfidence: 'Not_Defined' | 'Unknown' | 'Reasonable' | 'Confirmed';

    // Business Impact
    businessCriticality: 'Low' | 'Medium' | 'High' | 'Critical';
    complianceImpact: 'None' | 'Low' | 'Medium' | 'High';
    reputationImpact: 'Low' | 'Medium' | 'High' | 'Critical';
    financialImpact: 'Low' | 'Medium' | 'High' | 'Critical';
}

export const defaultRiskFactors: RiskFactors = {
    attackVector: 'Network',
    attackComplexity: 'Low',
    privilegesRequired: 'None',
    userInteraction: 'None',
    scope: 'Unchanged',
    confidentialityImpact: 'High',
    integrityImpact: 'High',
    availabilityImpact: 'High',
    assetExposure: 'Internet',
    assetCriticality: 'High',
    dataClassification: 'Confidential',
    exploitCodeMaturity: 'Functional',
    remediationLevel: 'Official_Fix',
    reportConfidence: 'Confirmed',
    businessCriticality: 'High',
    complianceImpact: 'High',
    reputationImpact: 'Medium',
    financialImpact: 'Medium',
};

// Helper for CVSS 3.1 Roundup function (round up to nearest 0.1)
const roundup = (input: number) => {
    const intInput = Math.round(input * 100000);
    if (intInput % 10000 === 0) {
        return intInput / 100000;
    } else {
        return (Math.floor(intInput / 10000) + 1) / 10;
    }
};

export const calculateCVSSBaseScore = (factors: Partial<RiskFactors>): number => {
    const data = { ...defaultRiskFactors, ...factors };

    const attackVectorScores = { Network: 0.85, Adjacent: 0.62, Local: 0.55, Physical: 0.2 };
    const attackComplexityScores = { Low: 0.77, High: 0.44 };
    const privilegesRequiredScores = {
        None: 0.85,
        Low: data.scope === 'Unchanged' ? 0.62 : 0.68,
        High: data.scope === 'Unchanged' ? 0.27 : 0.50
    };
    const userInteractionScores = { None: 0.85, Required: 0.62 };
    const impactScores = { None: 0, Low: 0.22, High: 0.56 };

    // Calculate ISS (Impact Sub Score)
    const iss = 1 - ((1 - impactScores[data.confidentialityImpact]) *
        (1 - impactScores[data.integrityImpact]) *
        (1 - impactScores[data.availabilityImpact]));

    // Calculate Impact based on Scope
    let impact = 0;
    if (data.scope === 'Unchanged') {
        impact = data.scope === 'Unchanged' ? 6.42 * iss : 7.52 * (iss - 0.029) - 3.25 * Math.pow((iss - 0.02), 15);
    } else {
        // Formula for scope changed is slightly different
        impact = 7.52 * (iss - 0.029) - 3.25 * Math.pow((iss - 0.02), 15);
    }

    // Calculate Exploitability
    const exploitability = 8.22 * attackVectorScores[data.attackVector] *
        attackComplexityScores[data.attackComplexity] *
        privilegesRequiredScores[data.privilegesRequired] *
        userInteractionScores[data.userInteraction];

    // Base Score Calculation
    if (impact <= 0) {
        return 0;
    } else {
        if (data.scope === 'Unchanged') {
            return roundup(Math.min(impact + exploitability, 10));
        } else {
            return roundup(Math.min(1.08 * (impact + exploitability), 10));
        }
    }
};

export const calculateTemporalScore = (factors: Partial<RiskFactors>): number => {
    const data = { ...defaultRiskFactors, ...factors };

    const exploitCodeMaturityScores = {
        Not_Defined: 1.0, Unproven: 0.91, Proof_of_Concept: 0.94, Functional: 0.97, High: 1.0
    };
    const remediationLevelScores = {
        Not_Defined: 1.0, Official_Fix: 0.95, Temporary_Fix: 0.96, Workaround: 0.97, Unavailable: 1.0
    };
    const reportConfidenceScores = {
        Not_Defined: 1.0, Unknown: 0.92, Reasonable: 0.96, Confirmed: 1.0
    };

    const baseScore = calculateCVSSBaseScore(data);
    const temporalScore = baseScore *
        exploitCodeMaturityScores[data.exploitCodeMaturity] *
        remediationLevelScores[data.remediationLevel] *
        reportConfidenceScores[data.reportConfidence];

    return roundup(temporalScore);
};

export const calculateEnvironmentalScore = (factors: Partial<RiskFactors>): number => {
    // Simplified Environmental Score for this context as full CVSS environmental is complex
    // Using business multipliers instead for app context
    return calculateTemporalScore(factors);
};

export const calculateBusinessRiskScore = (factors: Partial<RiskFactors>): number => {
    const data = { ...defaultRiskFactors, ...factors };

    const baseScore = calculateCVSSBaseScore(data);

    // Business Impact Modifiers
    const businessWeights = { Low: 0.5, Medium: 1.0, High: 1.5, Critical: 2.0 };
    const complianceWeights = { None: 1.0, Low: 1.1, Medium: 1.25, High: 1.5 };

    let riskScore = baseScore * businessWeights[data.businessCriticality];

    // Apply compliance factor
    riskScore = riskScore * complianceWeights[data.complianceImpact];

    // Cap at 10
    return Math.min(10, Math.round(riskScore * 10) / 10);
};

export const calculatePriorityScore = (factors: Partial<RiskFactors>): number => {
    const data = { ...defaultRiskFactors, ...factors };
    let priority = calculateBusinessRiskScore(data);

    // Temporal factors boosting priority
    if (data.exploitCodeMaturity === 'Functional' || data.exploitCodeMaturity === 'High') priority += 1;
    if (data.remediationLevel === 'Unavailable') priority += 1;
    if (data.assetExposure === 'Internet') priority += 0.5;
    if (data.assetCriticality === 'Critical') priority += 0.5;

    return Math.min(10, Math.round(priority * 10) / 10);
};
