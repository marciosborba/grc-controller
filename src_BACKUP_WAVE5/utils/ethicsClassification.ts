// Ethics Case Classification and Risk Assessment Engine
// Automated classification based on compliance best practices

export interface ClassificationResult {
  risk_score: number;
  compliance_impact: 'low' | 'medium' | 'high' | 'critical';
  regulatory_risk: 'low' | 'medium' | 'high' | 'critical';
  reputational_risk: 'low' | 'medium' | 'high' | 'critical';
  litigation_risk: 'low' | 'medium' | 'high' | 'critical';
  media_attention_risk: 'low' | 'medium' | 'high' | 'critical';
  financial_impact_estimate: number;
  geographic_scope: 'local' | 'regional' | 'national' | 'international';
  stakeholders_affected: string[];
  recommended_priority: 'low' | 'medium' | 'high' | 'critical' | 'urgent';
  recommended_investigation_type: 'preliminary' | 'full' | 'external' | 'legal';
  regulatory_notifications_required: string[];
  legal_privilege_recommended: boolean;
  external_counsel_recommended: boolean;
  classification_confidence: number;
}

export interface CaseData {
  title: string;
  description: string;
  category: string;
  severity: string;
  reporter_type: string;
  is_anonymous: boolean;
  business_unit_affected?: string;
  potential_subjects?: string[];
  financial_exposure?: number;
  regulatory_context?: string[];
  stakeholder_mentions?: string[];
}

// Classification keywords for different risk categories
const CLASSIFICATION_KEYWORDS = {
  high_risk_categories: [
    'corruption', 'bribery', 'fraud', 'embezzlement', 'money laundering',
    'securities fraud', 'insider trading', 'antitrust', 'cartel',
    'discrimination', 'harassment', 'retaliation', 'safety violation',
    'environmental violation', 'data breach', 'privacy violation'
  ],
  
  financial_keywords: [
    'financial reporting', 'accounting fraud', 'revenue recognition',
    'earnings management', 'audit', 'sox', 'sarbanes oxley',
    'financial controls', 'disclosure', 'material weakness'
  ],
  
  regulatory_keywords: {
    'SEC': ['securities', 'public company', '10-k', '10-q', 'earnings', 'material information'],
    'CFTC': ['derivatives', 'commodities', 'futures', 'swaps'],
    'DOJ': ['criminal', 'bribery', 'corruption', 'antitrust'],
    'FTC': ['consumer protection', 'competition', 'merger'],
    'OSHA': ['safety', 'workplace injury', 'occupational health'],
    'EPA': ['environmental', 'pollution', 'emissions', 'waste']
  },
  
  litigation_keywords: [
    'lawsuit', 'legal action', 'class action', 'settlement',
    'damages', 'liability', 'breach of contract', 'tort'
  ],
  
  media_keywords: [
    'public', 'media', 'press', 'news', 'journalist', 'reporter',
    'social media', 'viral', 'scandal', 'controversy'
  ],
  
  stakeholder_keywords: {
    'customers': ['customer', 'client', 'consumer', 'buyer'],
    'employees': ['employee', 'worker', 'staff', 'personnel'],
    'investors': ['investor', 'shareholder', 'stakeholder', 'analyst'],
    'regulators': ['regulator', 'government', 'agency', 'authority'],
    'suppliers': ['supplier', 'vendor', 'contractor', 'partner'],
    'community': ['community', 'public', 'society', 'environment']
  }
};

// Risk scoring weights
const RISK_WEIGHTS = {
  category_base_score: {
    'corruption': 85,
    'fraud': 80,
    'discrimination': 75,
    'harassment': 75,
    'safety': 70,
    'compliance': 65,
    'conflict_interest': 60,
    'policy_violation': 55,
    'misconduct': 50,
    'other': 40
  },
  
  severity_multiplier: {
    'critical': 1.5,
    'high': 1.3,
    'medium': 1.0,
    'low': 0.7
  },
  
  reporter_type_modifier: {
    'internal': 1.0,
    'external': 1.2, // External reporters may indicate higher visibility
    'anonymous': 1.1  // Anonymous reports often indicate serious concerns
  }
};

// Financial impact estimation based on case characteristics
const FINANCIAL_IMPACT_ESTIMATORS = {
  base_estimates: {
    'corruption': 500000,
    'fraud': 750000,
    'discrimination': 200000,
    'harassment': 150000,
    'safety': 300000,
    'compliance': 100000,
    'conflict_interest': 75000,
    'policy_violation': 50000,
    'misconduct': 30000,
    'other': 25000
  },
  
  multipliers: {
    geographic_scope: {
      'international': 3.0,
      'national': 2.0,
      'regional': 1.5,
      'local': 1.0
    },
    
    stakeholder_impact: {
      'high': 2.5,
      'medium': 1.8,
      'low': 1.0
    }
  }
};

export class EthicsClassificationEngine {
  
  /**
   * Main classification function
   */
  static classifyCase(caseData: CaseData): ClassificationResult {
    const baseScore = this.calculateBaseRiskScore(caseData);
    const complianceImpact = this.assessComplianceImpact(caseData);
    const regulatoryRisk = this.assessRegulatoryRisk(caseData);
    const reputationalRisk = this.assessReputationalRisk(caseData);
    const litigationRisk = this.assessLitigationRisk(caseData);
    const mediaRisk = this.assessMediaAttentionRisk(caseData);
    const financialImpact = this.estimateFinancialImpact(caseData);
    const geographicScope = this.determineGeographicScope(caseData);
    const stakeholders = this.identifyAffectedStakeholders(caseData);
    const regulatoryNotifications = this.identifyRequiredNotifications(caseData);
    
    // Calculate final risk score (0-100)
    const finalRiskScore = Math.min(100, Math.max(0, 
      baseScore * 0.4 + 
      this.riskLevelToScore(complianceImpact) * 0.2 + 
      this.riskLevelToScore(regulatoryRisk) * 0.2 + 
      this.riskLevelToScore(reputationalRisk) * 0.1 + 
      this.riskLevelToScore(litigationRisk) * 0.1
    ));
    
    const priority = this.determinePriority(finalRiskScore, caseData);
    const investigationType = this.recommendInvestigationType(finalRiskScore, caseData);
    const legalPrivilege = this.shouldClaimLegalPrivilege(caseData, regulatoryRisk, litigationRisk);
    const externalCounsel = this.shouldEngageExternalCounsel(finalRiskScore, caseData);
    
    return {
      risk_score: Math.round(finalRiskScore),
      compliance_impact: complianceImpact,
      regulatory_risk: regulatoryRisk,
      reputational_risk: reputationalRisk,
      litigation_risk: litigationRisk,
      media_attention_risk: mediaRisk,
      financial_impact_estimate: financialImpact,
      geographic_scope: geographicScope,
      stakeholders_affected: stakeholders,
      recommended_priority: priority,
      recommended_investigation_type: investigationType,
      regulatory_notifications_required: regulatoryNotifications,
      legal_privilege_recommended: legalPrivilege,
      external_counsel_recommended: externalCounsel,
      classification_confidence: this.calculateConfidence(caseData)
    };
  }
  
  /**
   * Calculate base risk score from category and severity
   */
  private static calculateBaseRiskScore(caseData: CaseData): number {
    const categoryScore = RISK_WEIGHTS.category_base_score[caseData.category] || 40;
    const severityMultiplier = RISK_WEIGHTS.severity_multiplier[caseData.severity] || 1.0;
    const reporterModifier = RISK_WEIGHTS.reporter_type_modifier[caseData.reporter_type] || 1.0;
    
    return categoryScore * severityMultiplier * reporterModifier;
  }
  
  /**
   * Assess compliance impact based on content analysis
   */
  private static assessComplianceImpact(caseData: CaseData): 'low' | 'medium' | 'high' | 'critical' {
    const content = `${caseData.title} ${caseData.description}`.toLowerCase();
    
    // Check for high-impact compliance keywords
    const financialKeywords = CLASSIFICATION_KEYWORDS.financial_keywords;
    const highRiskCategories = CLASSIFICATION_KEYWORDS.high_risk_categories;
    
    let score = 0;
    
    // Financial reporting compliance
    financialKeywords.forEach(keyword => {
      if (content.includes(keyword)) score += 20;
    });
    
    // High-risk categories
    highRiskCategories.forEach(keyword => {
      if (content.includes(keyword)) score += 15;
    });
    
    // Severity-based scoring
    if (caseData.severity === 'critical') score += 30;
    else if (caseData.severity === 'high') score += 20;
    else if (caseData.severity === 'medium') score += 10;
    
    if (score >= 60) return 'critical';
    if (score >= 40) return 'high';
    if (score >= 20) return 'medium';
    return 'low';
  }
  
  /**
   * Assess regulatory risk and identify potential regulatory bodies
   */
  private static assessRegulatoryRisk(caseData: CaseData): 'low' | 'medium' | 'high' | 'critical' {
    const content = `${caseData.title} ${caseData.description}`.toLowerCase();
    const regulatoryKeywords = CLASSIFICATION_KEYWORDS.regulatory_keywords;
    
    let regulatoryMatches = 0;
    let totalMatches = 0;
    
    Object.entries(regulatoryKeywords).forEach(([regulator, keywords]) => {
      const matches = keywords.filter(keyword => content.includes(keyword)).length;
      if (matches > 0) {
        regulatoryMatches++;
        totalMatches += matches;
      }
    });
    
    // Additional context from regulatory_context field
    if (caseData.regulatory_context && caseData.regulatory_context.length > 0) {
      regulatoryMatches += caseData.regulatory_context.length;
    }
    
    if (regulatoryMatches >= 3 || totalMatches >= 8) return 'critical';
    if (regulatoryMatches >= 2 || totalMatches >= 5) return 'high';
    if (regulatoryMatches >= 1 || totalMatches >= 2) return 'medium';
    return 'low';
  }
  
  /**
   * Assess reputational risk
   */
  private static assessReputationalRisk(caseData: CaseData): 'low' | 'medium' | 'high' | 'critical' {
    const content = `${caseData.title} ${caseData.description}`.toLowerCase();
    let score = 0;
    
    // Media attention keywords
    CLASSIFICATION_KEYWORDS.media_keywords.forEach(keyword => {
      if (content.includes(keyword)) score += 15;
    });
    
    // High visibility categories
    const highVisibilityCategories = ['discrimination', 'harassment', 'safety', 'environmental'];
    if (highVisibilityCategories.includes(caseData.category)) score += 20;
    
    // External reporter increases visibility
    if (caseData.reporter_type === 'external') score += 15;
    
    // Multiple stakeholders affected
    if (caseData.stakeholder_mentions && caseData.stakeholder_mentions.length > 2) score += 10;
    
    if (score >= 50) return 'critical';
    if (score >= 35) return 'high';
    if (score >= 20) return 'medium';
    return 'low';
  }
  
  /**
   * Assess litigation risk
   */
  private static assessLitigationRisk(caseData: CaseData): 'low' | 'medium' | 'high' | 'critical' {
    const content = `${caseData.title} ${caseData.description}`.toLowerCase();
    let score = 0;
    
    // Direct litigation keywords
    CLASSIFICATION_KEYWORDS.litigation_keywords.forEach(keyword => {
      if (content.includes(keyword)) score += 20;
    });
    
    // High-litigation-risk categories
    const highLitigationCategories = ['discrimination', 'harassment', 'fraud', 'safety'];
    if (highLitigationCategories.includes(caseData.category)) score += 15;
    
    // Financial exposure
    if (caseData.financial_exposure && caseData.financial_exposure > 100000) score += 20;
    
    // External reporter
    if (caseData.reporter_type === 'external') score += 10;
    
    if (score >= 60) return 'critical';
    if (score >= 40) return 'high';
    if (score >= 20) return 'medium';
    return 'low';
  }
  
  /**
   * Assess media attention risk
   */
  private static assessMediaAttentionRisk(caseData: CaseData): 'low' | 'medium' | 'high' | 'critical' {
    const content = `${caseData.title} ${caseData.description}`.toLowerCase();
    let score = 0;
    
    // Direct media mentions
    CLASSIFICATION_KEYWORDS.media_keywords.forEach(keyword => {
      if (content.includes(keyword)) score += 25;
    });
    
    // High-profile categories
    const highProfileCategories = ['corruption', 'discrimination', 'harassment', 'environmental'];
    if (highProfileCategories.includes(caseData.category)) score += 15;
    
    // External visibility factors
    if (caseData.reporter_type === 'external') score += 10;
    if (!caseData.is_anonymous) score += 5; // Named complainants more likely to go public
    
    if (score >= 50) return 'critical';
    if (score >= 35) return 'high';
    if (score >= 20) return 'medium';
    return 'low';
  }
  
  /**
   * Estimate financial impact
   */
  private static estimateFinancialImpact(caseData: CaseData): number {
    const baseEstimate = FINANCIAL_IMPACT_ESTIMATORS.base_estimates[caseData.category] || 25000;
    
    // Apply geographic scope multiplier
    const geographicScope = this.determineGeographicScope(caseData);
    const geoMultiplier = FINANCIAL_IMPACT_ESTIMATORS.multipliers.geographic_scope[geographicScope];
    
    // Apply stakeholder impact multiplier
    const stakeholders = this.identifyAffectedStakeholders(caseData);
    const stakeholderImpact = stakeholders.length > 3 ? 'high' : 
                           stakeholders.length > 1 ? 'medium' : 'low';
    const stakeholderMultiplier = FINANCIAL_IMPACT_ESTIMATORS.multipliers.stakeholder_impact[stakeholderImpact];
    
    // Consider provided financial exposure
    const providedExposure = caseData.financial_exposure || 0;
    
    return Math.max(baseEstimate * geoMultiplier * stakeholderMultiplier, providedExposure);
  }
  
  /**
   * Determine geographic scope
   */
  private static determineGeographicScope(caseData: CaseData): 'local' | 'regional' | 'national' | 'international' {
    const content = `${caseData.title} ${caseData.description}`.toLowerCase();
    
    const internationalKeywords = ['international', 'global', 'overseas', 'foreign', 'export', 'import'];
    const nationalKeywords = ['national', 'federal', 'country', 'nationwide'];
    const regionalKeywords = ['region', 'state', 'province', 'multi-state'];
    
    if (internationalKeywords.some(keyword => content.includes(keyword))) return 'international';
    if (nationalKeywords.some(keyword => content.includes(keyword))) return 'national';
    if (regionalKeywords.some(keyword => content.includes(keyword))) return 'regional';
    
    return 'local';
  }
  
  /**
   * Identify affected stakeholders
   */
  private static identifyAffectedStakeholders(caseData: CaseData): string[] {
    const content = `${caseData.title} ${caseData.description}`.toLowerCase();
    const stakeholders: string[] = [];
    
    Object.entries(CLASSIFICATION_KEYWORDS.stakeholder_keywords).forEach(([stakeholder, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        stakeholders.push(stakeholder);
      }
    });
    
    // Add stakeholders from provided mentions
    if (caseData.stakeholder_mentions) {
      stakeholders.push(...caseData.stakeholder_mentions);
    }
    
    return [...new Set(stakeholders)]; // Remove duplicates
  }
  
  /**
   * Identify required regulatory notifications
   */
  private static identifyRequiredNotifications(caseData: CaseData): string[] {
    const content = `${caseData.title} ${caseData.description}`.toLowerCase();
    const notifications: string[] = [];
    
    Object.entries(CLASSIFICATION_KEYWORDS.regulatory_keywords).forEach(([regulator, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        notifications.push(regulator);
      }
    });
    
    // Add from regulatory context
    if (caseData.regulatory_context) {
      notifications.push(...caseData.regulatory_context);
    }
    
    return [...new Set(notifications)];
  }
  
  /**
   * Convert risk level to numerical score for calculations
   */
  private static riskLevelToScore(level: string): number {
    const scores = { 'low': 25, 'medium': 50, 'high': 75, 'critical': 100 };
    return scores[level] || 25;
  }
  
  /**
   * Determine recommended priority
   */
  private static determinePriority(riskScore: number, caseData: CaseData): 'low' | 'medium' | 'high' | 'critical' | 'urgent' {
    // Urgent cases require immediate attention
    const urgentCategories = ['safety', 'discrimination', 'harassment'];
    const urgentKeywords = ['immediate', 'urgent', 'emergency', 'ongoing'];
    const content = `${caseData.title} ${caseData.description}`.toLowerCase();
    
    if (urgentCategories.includes(caseData.category) && caseData.severity === 'critical') return 'urgent';
    if (urgentKeywords.some(keyword => content.includes(keyword))) return 'urgent';
    
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 65) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }
  
  /**
   * Recommend investigation type
   */
  private static recommendInvestigationType(riskScore: number, caseData: CaseData): 'preliminary' | 'full' | 'external' | 'legal' {
    const legalCategories = ['corruption', 'fraud', 'securities fraud'];
    const externalCategories = ['discrimination', 'harassment', 'safety'];
    
    if (legalCategories.includes(caseData.category) || riskScore >= 85) return 'legal';
    if (externalCategories.includes(caseData.category) || riskScore >= 70) return 'external';
    if (riskScore >= 50) return 'full';
    return 'preliminary';
  }
  
  /**
   * Determine if legal privilege should be claimed
   */
  private static shouldClaimLegalPrivilege(
    caseData: CaseData, 
    regulatoryRisk: string, 
    litigationRisk: string
  ): boolean {
    const highRiskCategories = ['corruption', 'fraud', 'securities fraud', 'bribery'];
    
    return highRiskCategories.includes(caseData.category) ||
           regulatoryRisk === 'critical' ||
           litigationRisk === 'high' ||
           litigationRisk === 'critical';
  }
  
  /**
   * Determine if external counsel should be engaged
   */
  private static shouldEngageExternalCounsel(riskScore: number, caseData: CaseData): boolean {
    const externalCounselCategories = ['corruption', 'fraud', 'discrimination', 'harassment'];
    
    return riskScore >= 75 ||
           externalCounselCategories.includes(caseData.category) ||
           caseData.reporter_type === 'external' ||
           (caseData.financial_exposure && caseData.financial_exposure > 250000);
  }
  
  /**
   * Calculate classification confidence score
   */
  private static calculateConfidence(caseData: CaseData): number {
    let confidence = 70; // Base confidence
    
    // More details = higher confidence
    if (caseData.description && caseData.description.length > 100) confidence += 10;
    if (caseData.business_unit_affected) confidence += 5;
    if (caseData.regulatory_context && caseData.regulatory_context.length > 0) confidence += 10;
    if (caseData.stakeholder_mentions && caseData.stakeholder_mentions.length > 0) confidence += 5;
    
    // Anonymous reports may have less context
    if (caseData.is_anonymous) confidence -= 5;
    
    return Math.min(100, Math.max(50, confidence));
  }
}

// Auto-routing rules for case assignment
export interface RoutingRule {
  condition: (caseData: CaseData, classification: ClassificationResult) => boolean;
  assignee_role: string;
  assignee_department?: string;
  escalation_required: boolean;
  notification_recipients: string[];
}

export const DEFAULT_ROUTING_RULES: RoutingRule[] = [
  {
    condition: (case_data, classification) => classification.recommended_priority === 'urgent',
    assignee_role: 'chief_ethics_officer',
    escalation_required: true,
    notification_recipients: ['ceo', 'general_counsel', 'chief_compliance_officer']
  },
  {
    condition: (case_data, classification) => classification.legal_privilege_recommended,
    assignee_role: 'general_counsel',
    assignee_department: 'legal',
    escalation_required: true,
    notification_recipients: ['chief_legal_officer', 'chief_compliance_officer']
  },
  {
    condition: (case_data, classification) => case_data.category === 'discrimination' || case_data.category === 'harassment',
    assignee_role: 'hr_director',
    assignee_department: 'human_resources',
    escalation_required: false,
    notification_recipients: ['chief_hr_officer', 'general_counsel']
  },
  {
    condition: (case_data, classification) => classification.regulatory_risk === 'critical' || classification.regulatory_risk === 'high',
    assignee_role: 'chief_compliance_officer',
    assignee_department: 'compliance',
    escalation_required: true,
    notification_recipients: ['general_counsel', 'ceo']
  },
  {
    condition: (case_data, classification) => classification.risk_score >= 70,
    assignee_role: 'senior_ethics_investigator',
    assignee_department: 'ethics',
    escalation_required: false,
    notification_recipients: ['chief_ethics_officer']
  },
  {
    condition: () => true, // Default case
    assignee_role: 'ethics_investigator',
    assignee_department: 'ethics',
    escalation_required: false,
    notification_recipients: ['ethics_manager']
  }
];