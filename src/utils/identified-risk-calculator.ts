export interface IdentifiedRiskFactors {
    severity: string;
    cvssScore: number;
    assetCategory: 'Server' | 'Desktop';
    hasEDR: 'Yes' | 'No' | 'NA';
    isEOL: boolean;
    appCriticality: 'Info' | 'Low' | 'Medium' | 'High' | 'Critical';
    isSOX: boolean;
    isLGPD: boolean;
    isInternetFacing: boolean;
    customAdjustment: number;
}

export const getSeverityLabel = (severity: string): string => {
    const map: Record<string, string> = {
        'critical': 'Crítico',
        'high': 'Alto',
        'medium': 'Médio',
        'low': 'Baixo',
        'info': 'Info',
        'crítica': 'Crítico',
        'alta': 'Alto',
        'média': 'Médio',
        'media': 'Médio',
        'baixa': 'Baixo',
        'informativa': 'Info'
    };
    return map[severity?.toLowerCase()] || severity;
};

export const getSeverityBaseWeight = (severity: string): number => {
    switch (severity?.toLowerCase()) {
        case 'info':
        case 'informativa':
            return 5;
        case 'low':
        case 'baixa':
            return 10;
        case 'medium':
        case 'média':
        case 'media':
            return 20;
        case 'high':
        case 'alta':
            return 30;
        case 'critical':
        case 'crítica':
        case 'critica':
            return 40;
        default:
            return 0;
    }
};

export const calculateVulnerabilityWeight = (severity: string, cvss: number): number => {
    const baseWeight = getSeverityBaseWeight(severity);
    if (!baseWeight) return 0;
    return Math.min(50, baseWeight + (cvss || 0));
};

export const calculateApplicationWeight = (factors: IdentifiedRiskFactors): number => {
    if (factors.assetCategory === 'Desktop') {
        return 0; // Desktops don't use application weights in this context
    }

    let weight = 0;
    switch (factors.appCriticality) {
        case 'Info': weight = 5; break;
        case 'Low': weight = 10; break;
        case 'Medium': weight = 15; break;
        case 'High': weight = 20; break;
        case 'Critical': weight = 25; break;
        default: weight = 0;
    }

    if (factors.isSOX) weight += 5;
    if (factors.isLGPD) weight += 5;
    if (factors.isInternetFacing) weight += 5;

    return Math.min(50, weight);
};

export const calculateAssetPenalty = (factors: IdentifiedRiskFactors): number => {
    let penalty = 0;

    if (factors.assetCategory === 'Desktop') {
        if (factors.isEOL) penalty += 10;
        if (factors.hasEDR === 'No') penalty += 40;
    } else if (factors.assetCategory === 'Server') {
        if (factors.isEOL) penalty += 5;
        if (factors.hasEDR === 'No') penalty += 5;
    }

    return penalty;
};

export const calculateIdentifiedRisk = (factors: IdentifiedRiskFactors): number => {
    const vulnWeight = calculateVulnerabilityWeight(factors.severity, factors.cvssScore);
    const appWeight = calculateApplicationWeight(factors);
    const assetPenalty = calculateAssetPenalty(factors);

    let totalScore = vulnWeight + appWeight + assetPenalty + (factors.customAdjustment || 0);

    // Maximum risk score is 100
    return Math.min(100, Math.max(0, totalScore));
};
