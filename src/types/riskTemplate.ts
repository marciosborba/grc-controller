// Tipos para Templates de Riscos no Banco de Dados

export type RiskLevel = 'Muito Alto' | 'Alto' | 'Médio' | 'Baixo' | 'Muito Baixo';
export type TemplateStatus = 'active' | 'inactive' | 'draft';
export type AuditAction = 'create' | 'update' | 'delete' | 'activate' | 'deactivate';

export interface RiskTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  industry: string;
  riskLevel: RiskLevel;
  probability: number; // 1-5
  impact: number; // 1-5
  methodology: string;
  usageCount: number;
  rating: number; // 0.0-5.0
  isPopular: boolean;
  isFavorite: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  alexRiskSuggested: boolean;
  totalRatings: number;
  status: TemplateStatus;
  
  // Relacionamentos
  controls: RiskTemplateControl[];
  kris: RiskTemplateKRI[];
  tags: RiskTemplateTag[];
  userRatings: RiskTemplateRating[];
}

export interface RiskTemplateControl {
  id: number;
  templateId: string;
  controlDescription: string;
  controlOrder: number;
  createdAt: Date;
}

export interface RiskTemplateKRI {
  id: number;
  templateId: string;
  kriDescription: string;
  kriOrder: number;
  createdAt: Date;
}

export interface RiskTemplateTag {
  id: number;
  templateId: string;
  tag: string;
  createdAt: Date;
}

export interface RiskTemplateRating {
  id: number;
  templateId: string;
  userId: string;
  rating: number; // 1-5
  createdAt: Date;
}

export interface RiskTemplateAudit {
  id: number;
  templateId: string;
  action: AuditAction;
  changedBy: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  createdAt: Date;
}

// DTOs para API
export interface CreateRiskTemplateDTO {
  name: string;
  description: string;
  category: string;
  industry: string;
  riskLevel: RiskLevel;
  probability: number;
  impact: number;
  methodology: string;
  createdBy: string;
  alexRiskSuggested?: boolean;
  controls: string[];
  kris: string[];
  tags: string[];
}

export interface UpdateRiskTemplateDTO {
  name?: string;
  description?: string;
  category?: string;
  industry?: string;
  riskLevel?: RiskLevel;
  probability?: number;
  impact?: number;
  methodology?: string;
  alexRiskSuggested?: boolean;
  status?: TemplateStatus;
  controls?: string[];
  kris?: string[];
  tags?: string[];
}

export interface RiskTemplateFilters {
  category?: string;
  industry?: string;
  riskLevel?: RiskLevel;
  status?: TemplateStatus;
  isPopular?: boolean;
  alexRiskSuggested?: boolean;
  search?: string;
  tags?: string[];
  minRating?: number;
  createdBy?: string;
}

export interface RiskTemplateStats {
  totalTemplates: number;
  templatesByCategory: Record<string, number>;
  templatesByRiskLevel: Record<RiskLevel, number>;
  averageRating: number;
  totalUsage: number;
  popularTemplates: number;
  alexSuggestedTemplates: number;
}
"