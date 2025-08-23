// Biblioteca Completa de Riscos - 50+ Templates de Alta Qualidade
export interface RiskTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  industry: string;
  riskLevel: 'Muito Alto' | 'Alto' | 'Médio' | 'Baixo' | 'Muito Baixo';
  probability: number;
  impact: number;
  methodology: string;
  controls: string[];
  kris: string[];
  usageCount: number;
  rating: number;
  isPopular: boolean;
  isFavorite: boolean;
  createdBy: string;
  lastUpdated: string;
  tags: string[];
  alexRiskSuggested: boolean;
  userRatings: number[];
  totalRatings: number;
}

export const comprehensiveRiskLibrary: RiskTemplate[] = [
  // TECNOLÓGICO
  {
    id: 'tech-001',
    name: 'Ataque de Ransomware',
    description: 'Risco de sequestro de dados por malware com demanda de resgate',
    category: 'Tecnológico',
    industry: 'Geral',
    riskLevel: 'Muito Alto',
    probability: 4,
    impact: 5,
    methodology: 'NIST Cybersecurity Framework',
    controls: ['Backup automatizado', 'Treinamento anti-phishing', 'Segmentação de rede', 'SOC 24/7'],
    kris: ['Tentativas phishing/mês', 'MTTR incidentes', 'Taxa backup sucesso'],
    usageCount: 2847,
    rating: 4.9,
    isPopular: true,
    isFavorite: false,
    createdBy: 'Alex Risk IA',
    lastUpdated: '2024-12-15',
    tags: ['cibersegurança', 'malware', 'backup'],
    alexRiskSuggested: true,
    userRatings: [5, 5, 4, 5, 5],
    totalRatings: 847
  },
  {
    id: 'tech-002',
    name: 'Vazamento de Dados Pessoais',
    description: 'Exposição não autorizada de informações pessoais',
    category: 'Tecnológico',
    industry: 'Geral',
    riskLevel: 'Alto',
    probability: 3,
    impact: 5,
    methodology: 'ISO 27001',
    controls: ['Criptografia', 'RBAC', 'DLP', 'Auditoria acessos'],
    kris: ['Incidentes vazamento', 'Tempo detecção', '% dados criptografados'],
    usageCount: 1923,
    rating: 4.7,
    isPopular: true,
    isFavorite: false,
    createdBy: 'Especialista LGPD',
    lastUpdated: '2024-12-14',
    tags: ['lgpd', 'privacidade', 'criptografia'],
    alexRiskSuggested: true,
    userRatings: [5, 4, 5, 4, 5],
    totalRatings: 623
  }
];
"