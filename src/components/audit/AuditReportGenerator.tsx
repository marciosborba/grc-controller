import React, { useState, useEffect } from 'react';
import { 
  FileText,
  Download,
  Eye,
  Send,
  Brain,
  Zap,
  Settings,
  Copy,
  Share,
  Calendar,
  User,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  Sparkles,
  Bot,
  RefreshCw,
  Filter,
  Search,
  BarChart3,
  TrendingUp,
  Award,
  Shield,
  Lightbulb,
  MessageSquare,
  Clock,
  Star
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AuditReport {
  id: string;
  title: string;
  audit_id: string;
  report_type: 'Draft' | 'Interim' | 'Final' | 'Management Letter' | 'Executive Summary';
  status: 'Draft' | 'Under Review' | 'Approved' | 'Issued';
  executive_summary: string;
  scope_and_methodology: string;
  key_findings: AuditFinding[];
  recommendations: AuditRecommendation[];
  overall_opinion: string;
  overall_rating: number;
  management_response_required: boolean;
  management_response?: string;
  target_audience: string[];
  confidentiality_level: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
  ai_generated_content: number; // percentage
  ai_quality_score: number;
  created_by: string;
  created_at: string;
  issued_date?: string;
  due_date?: string;
}

interface AuditFinding {
  id: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Observation';
  category: string;
  impact: string;
  recommendation: string;
  management_response?: string;
  target_date?: string;
  responsible_person?: string;
  status: string;
}

interface AuditRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
  implementation_effort: 'Low' | 'Medium' | 'High';
  estimated_cost?: number;
  expected_benefits: string;
  target_date?: string;
  responsible_person?: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  report_type: string;
  sections: string[];
  ai_prompts: string[];
  target_audience: string[];
  compliance_frameworks: string[];
}

interface AIInsight {
  type: 'content_suggestion' | 'finding_analysis' | 'recommendation' | 'quality_improvement';
  title: string;
  description: string;
  confidence: number;
  suggested_action: string;
  target_section?: string;
}

const AuditReportGenerator: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('reports');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState(true);
  
  const [reports, setReports] = useState<AuditReport[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [aiInsights, setAiInsights] = useState<Record<string, AIInsight[]>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Mock data initialization
  useEffect(() => {
    const mockReports: AuditReport[] = [
      {
        id: '1',
        title: 'Relatório de Auditoria - Controles Internos SOX 2025',
        audit_id: 'AUD-2025-0001',
        report_type: 'Final',
        status: 'Approved',
        executive_summary: `Esta auditoria avaliou a efetividade dos controles internos sobre relatórios financeiros (ICFR) conforme requerido pela Seção 404 da Lei Sarbanes-Oxley. Nossa avaliação cobriu os principais processos de negócio e sistemas que impactam o relatório financeiro.

CONCLUSÃO GERAL:
Os controles internos foram considerados efetivos, com algumas deficiências identificadas que requerem atenção da administração. Identificamos 3 achados de alta prioridade e 5 de média prioridade.

PRINCIPAIS DESTAQUES:
• Segregação de funções adequada na maioria dos processos
• Controles de TI necessitam fortalecimento
• Processo de fechamento contábil bem estruturado
• Necessidade de melhorias nos controles de acesso`,
        scope_and_methodology: `ESCOPO:
A auditoria cobriu os seguintes processos críticos:
- Contas a Receber e Faturamento
- Contas a Pagar e Compras  
- Folha de Pagamento
- Gestão de Caixa e Investimentos
- Controles Gerais de TI

METODOLOGIA:
- Walkthrough dos processos principais
- Teste de desenho e efetividade operacional
- Amostragem estatística com 95% de confiança
- Análise de dados assistida por IA
- Entrevistas com pessoal-chave`,
        key_findings: [
          {
            id: '1',
            title: 'Segregação inadequada no processo de AR',
            description: 'Identificamos 2 usuários com perfis que permitem criar e aprovar transações simultaneamente',
            severity: 'High',
            category: 'Controles de Acesso',
            impact: 'Risco de aprovação inadequada de transações, podendo resultar em erro ou fraude',
            recommendation: 'Revisar e ajustar perfis de acesso para garantir segregação adequada',
            target_date: '2025-03-31',
            responsible_person: 'Gerente de TI',
            status: 'Open'
          },
          {
            id: '2',
            title: 'Controles de backup não testados',
            description: 'Procedimentos de backup e recovery não foram testados nos últimos 12 meses',
            severity: 'Medium',
            category: 'Continuidade de Negócio',
            impact: 'Risco de perda de dados em caso de falha de sistema',
            recommendation: 'Implementar programa de testes periódicos de backup e recovery',
            target_date: '2025-04-30',
            responsible_person: 'Administrador de TI',
            status: 'Open'
          }
        ],
        recommendations: [
          {
            id: '1',
            title: 'Implementar revisão trimestral de acessos',
            description: 'Estabelecer processo formal de revisão de acessos de usuários a cada trimestre',
            priority: 'High',
            category: 'Controles de Acesso',
            implementation_effort: 'Medium',
            estimated_cost: 50000,
            expected_benefits: 'Redução do risco de acessos inadequados e melhoria na conformidade',
            target_date: '2025-06-30',
            responsible_person: 'CISO'
          }
        ],
        overall_opinion: 'Efetivo com deficiências menores',
        overall_rating: 4,
        management_response_required: true,
        target_audience: ['Board', 'Audit Committee', 'Senior Management'],
        confidentiality_level: 'Confidential',
        ai_generated_content: 45,
        ai_quality_score: 92,
        created_by: 'Ana Silva',
        created_at: '2025-01-20T10:00:00Z',
        issued_date: '2025-01-22',
        due_date: '2025-01-25'
      },
      {
        id: '2',
        title: 'Relatório Preliminar - Auditoria de Segurança Cibernética',
        audit_id: 'AUD-2025-0002',
        report_type: 'Interim',
        status: 'Draft',
        executive_summary: 'Relatório preliminar da auditoria de segurança cibernética em andamento. Resultados parciais indicam necessidade de melhorias significativas nos controles de segurança.',
        scope_and_methodology: 'Avaliação dos controles de segurança cibernética baseada em NIST Cybersecurity Framework.',
        key_findings: [],
        recommendations: [],
        overall_opinion: '',
        overall_rating: 0,
        management_response_required: false,
        target_audience: ['CISO', 'IT Management'],
        confidentiality_level: 'Confidential',
        ai_generated_content: 15,
        ai_quality_score: 78,
        created_by: 'Carlos Mendes',
        created_at: '2025-01-21T14:00:00Z',
        due_date: '2025-01-28'
      }
    ];

    const mockTemplates: ReportTemplate[] = [
      {
        id: '1',
        name: 'Relatório SOX 404',
        description: 'Template padrão para relatórios de auditoria SOX Seção 404',
        report_type: 'Final',
        sections: [
          'Executive Summary',
          'Scope and Methodology', 
          'Key Findings',
          'Management Recommendations',
          'Overall Opinion',
          'Management Response',
          'Appendices'
        ],
        ai_prompts: [
          'Gere resumo executivo baseado nos achados e conclusões',
          'Crie descrição detalhada de escopo e metodologia',
          'Analise achados e sugira categorização por risco'
        ],
        target_audience: ['Board', 'Audit Committee', 'External Auditors'],
        compliance_frameworks: ['SOX', 'COSO', 'PCAOB']
      },
      {
        id: '2',
        name: 'Relatório de Segurança Cibernética',
        description: 'Template especializado para auditorias de segurança cibernética',
        report_type: 'Final',
        sections: [
          'Executive Summary',
          'Current State Assessment',
          'Threat Landscape Analysis',
          'Control Effectiveness',
          'Risk Assessment',
          'Recommendations',
          'Implementation Roadmap'
        ],
        ai_prompts: [
          'Analise landscape de ameaças baseado em inteligência atual',
          'Avalie maturidade dos controles contra frameworks NIST/ISO 27001',
          'Sugira roadmap de implementação priorizado por risco'
        ],
        target_audience: ['CISO', 'CTO', 'Board', 'Risk Committee'],
        compliance_frameworks: ['NIST CSF', 'ISO 27001', 'CIS Controls']
      }
    ];

    setReports(mockReports);
    setTemplates(mockTemplates);

    // Generate mock AI insights for draft report
    setAiInsights({
      '2': [
        {
          type: 'content_suggestion',
          title: 'Conteúdo Insuficiente no Resumo Executivo',
          description: 'O resumo executivo atual é muito breve. Recomendo expandir com principais achados e impactos de negócio.',
          confidence: 87,
          suggested_action: 'Expandir resumo executivo',
          target_section: 'executive_summary'
        },
        {
          type: 'finding_analysis',
          title: 'Potencial Achado Crítico Identificado',
          description: 'Análise dos dados coletados sugere achado crítico relacionado a controles de acesso privilegiado não documentado.',
          confidence: 94,
          suggested_action: 'Adicionar achado crítico',
          target_section: 'key_findings'
        },
        {
          type: 'quality_improvement',
          title: 'Melhoria na Estrutura do Relatório',
          description: 'Sugiro reorganizar seções para melhor fluxo narrativo e adicionar gráficos de tendência de risco.',
          confidence: 78,
          suggested_action: 'Reestruturar relatório',
        }
      ]
    });
  }, []);

  const generateAIContent = async (reportId: string, section: string) => {
    setIsGenerating(true);
    
    // Simulate AI content generation
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    let generatedContent = '';
    
    if (section === 'executive_summary') {
      generatedContent = `RESUMO EXECUTIVO

Esta auditoria de segurança cibernética foi conduzida para avaliar a postura de segurança da organização frente ao crescente cenário de ameaças digitais. Nossa avaliação utilizou metodologia baseada no NIST Cybersecurity Framework e cobriu cinco funções principais: Identificar, Proteger, Detectar, Responder e Recuperar.

PRINCIPAIS CONCLUSÕES:
• Maturidade geral de segurança cibernética: NÍVEL 3 (Definido) de 5
• 89% dos controles críticos implementados adequadamente
• Identificadas 12 vulnerabilidades de alta prioridade
• Tempo médio de detecção de incidentes: 72 horas (meta: 24 horas)
• Programa de conscientização em segurança bem estabelecido

ACHADOS CRÍTICOS:
1. Controles de acesso privilegiado necessitam fortalecimento
2. Processo de gerenciamento de patches apresenta gaps
3. Plano de resposta a incidentes requer atualização

RECOMENDAÇÕES PRIORITÁRIAS:
• Implementar solução de Privileged Access Management (PAM)
• Automatizar processo de patch management
• Realizar simulado de resposta a incidentes
• Expandir programa de threat hunting

INVESTIMENTO RECOMENDADO: R$ 2.8M ao longo de 18 meses
RETORNO ESPERADO: Redução de 65% no risco de incidentes de segurança`;
    } else if (section === 'methodology') {
      generatedContent = `ESCOPO E METODOLOGIA

ESCOPO DA AUDITORIA:
Esta auditoria abrangeu a infraestrutura de TI crítica, aplicações de negócio, processos de segurança e controles de conformidade da organização. O período de avaliação foi de 1º de janeiro a 31 de dezembro de 2024.

COMPONENTES AVALIADOS:
• Infraestrutura de rede e servidores (100% do ambiente crítico)
• Aplicações de negócio (15 aplicações prioritárias)
• Controles de acesso e identidade
• Processos de backup e recuperação
• Programa de conscientização em segurança
• Políticas e procedimentos de segurança

METODOLOGIA APLICADA:
1. PLANEJAMENTO E PREPARAÇÃO
   - Análise de risco preliminar
   - Definição de escopo baseada em criticidade
   - Alinhamento com frameworks NIST CSF e ISO 27001

2. COLETA DE EVIDÊNCIAS
   - Entrevistas com 25 stakeholders-chave
   - Análise de configurações de segurança (automated scans)
   - Revisão de logs de segurança (últimos 12 meses)
   - Testes de penetração em ambiente controlado

3. ANÁLISE E AVALIAÇÃO
   - Gap analysis contra controles de referência
   - Análise de risco quantitativa e qualitativa
   - Benchmarking com práticas da indústria
   - Utilização de IA para análise de padrões e anomalias

4. VALIDAÇÃO E CONFIRMAÇÃO
   - Discussão de achados preliminares com gestão
   - Validação técnica de vulnerabilidades identificadas
   - Revisão de evidências por segunda pessoa

LIMITAÇÕES:
• Teste de penetração limitado a ambiente de desenvolvimento
• Análise de logs restrita aos últimos 12 meses por retenção de dados
• Avaliação de fornecedores terceiros baseada em questionários SAQ`;
    }

    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { 
            ...report, 
            [section]: generatedContent,
            ai_generated_content: Math.min(report.ai_generated_content + 25, 100),
            ai_quality_score: Math.min(report.ai_quality_score + 10, 100)
          }
        : report
    ));

    setIsGenerating(false);
    
    toast({
      title: 'Conteúdo Gerado com Sucesso',
      description: `Seção "${section}" foi gerada automaticamente pela IA.`,
    });
  };

  const applyAIInsight = (reportId: string, insightIndex: number) => {
    const insights = aiInsights[reportId];
    if (!insights || !insights[insightIndex]) return;

    const insight = insights[insightIndex];
    
    if (insight.suggested_action === 'Expandir resumo executivo') {
      generateAIContent(reportId, 'executive_summary');
    } else if (insight.suggested_action === 'Adicionar achado crítico') {
      // Add a critical finding
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { 
              ...report, 
              key_findings: [...report.key_findings, {
                id: (report.key_findings.length + 1).toString(),
                title: 'Controles de Acesso Privilegiado Inadequados',
                description: 'Identificado que 23% dos usuários com acesso privilegiado não passaram por revisão nos últimos 6 meses',
                severity: 'Critical' as const,
                category: 'Identity and Access Management',
                impact: 'Alto risco de acesso não autorizado a sistemas críticos',
                recommendation: 'Implementar processo formal de revisão trimestral de acessos privilegiados',
                status: 'Open'
              }]
            }
          : report
      ));
    }

    // Remove applied insight
    setAiInsights(prev => ({
      ...prev,
      [reportId]: prev[reportId].filter((_, index) => index !== insightIndex)
    }));

    toast({
      title: 'Insight de IA Aplicado',
      description: insight.description,
    });
  };

  const updateReport = (reportId: string, field: keyof AuditReport, value: any) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, [field]: value }
        : report
    ));
  };

  const exportReport = (reportId: string, format: 'pdf' | 'docx' | 'html') => {
    toast({
      title: 'Exportando Relatório',
      description: `Gerando arquivo ${format.toUpperCase()}...`,
    });
    
    // Simulate export
    setTimeout(() => {
      toast({
        title: 'Relatório Exportado',
        description: 'Download iniciado automaticamente.',
      });
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800 border-gray-200',
      'Under Review': 'bg-orange-100 text-orange-800 border-orange-200',
      'Approved': 'bg-green-100 text-green-800 border-green-200',
      'Issued': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      'Critical': 'text-red-600',
      'High': 'text-orange-600',
      'Medium': 'text-yellow-600',
      'Low': 'text-blue-600',
      'Observation': 'text-gray-600'
    };
    return colors[severity as keyof typeof colors] || 'text-gray-600';
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.audit_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = typeFilter === 'all' || report.report_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Gerador de Relatórios IA
          </h1>
          <p className="text-gray-600 mt-1">
            Criação inteligente de relatórios de auditoria com assistência de IA
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={aiAssistantEnabled}
              onCheckedChange={setAiAssistantEnabled}
            />
            <Label className="text-sm">Assistente IA</Label>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <FileText className="h-4 w-4 mr-2" />
            Novo Relatório
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Relatórios</p>
                <p className="text-2xl font-bold text-blue-600">{reports.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conteúdo IA Médio</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(reports.reduce((sum, r) => sum + r.ai_generated_content, 0) / reports.length)}%
                </p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Qualidade IA</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(reports.reduce((sum, r) => sum + r.ai_quality_score, 0) / reports.length)}/100
                </p>
              </div>
              <Star className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Relatórios Aprovados</p>
                <p className="text-2xl font-bold text-orange-600">
                  {reports.filter(r => r.status === 'Approved').length}
                </p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-1 sm:grid-cols-3 w-full">
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="editor">Editor Inteligente</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar relatórios..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="Draft">Rascunho</SelectItem>
                    <SelectItem value="Under Review">Em Revisão</SelectItem>
                    <SelectItem value="Approved">Aprovado</SelectItem>
                    <SelectItem value="Issued">Emitido</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="Draft">Preliminar</SelectItem>
                    <SelectItem value="Interim">Parcial</SelectItem>
                    <SelectItem value="Final">Final</SelectItem>
                    <SelectItem value="Management Letter">Carta Gerencial</SelectItem>
                    <SelectItem value="Executive Summary">Resumo Executivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card 
                key={report.id} 
                className={cn(
                  "hover:shadow-md transition-shadow",
                  selectedReport === report.id ? "ring-2 ring-blue-500" : ""
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {report.audit_id} • {report.report_type}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                      {report.ai_generated_content > 0 && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          <Brain className="h-3 w-3 mr-1" />
                          {report.ai_generated_content}% IA
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Criado por:</span>
                      <p className="font-medium">{report.created_by}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Data de Criação:</span>
                      <p className="font-medium">
                        {new Date(report.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Público-alvo:</span>
                      <p className="font-medium">{report.target_audience.slice(0, 2).join(', ')}</p>
                    </div>
                  </div>

                  {report.ai_generated_content > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Conteúdo IA:</span>
                        <span className="font-medium">{report.ai_generated_content}%</span>
                      </div>
                      <Progress value={report.ai_generated_content} className="h-2" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Qualidade IA:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{report.ai_quality_score}/100</span>
                          <Star className="h-3 w-3 text-yellow-500" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Key metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span>{report.key_findings.length} achados</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-blue-500" />
                      <span>{report.recommendations.length} recomendações</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>Rating: {report.overall_rating}/5</span>
                    </div>
                  </div>

                  {/* AI Insights indicator */}
                  {aiInsights[report.id] && aiInsights[report.id].length > 0 && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-purple-700">
                        <Bot className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {aiInsights[report.id].length} insights de IA disponíveis
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReport(report.id)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        Visualizar
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => exportReport(report.id, 'pdf')}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        PDF
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share className="h-3 w-3 mr-1" />
                        Compartilhar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="editor" className="space-y-4">
          {selectedReport ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Editor */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Edit className="h-5 w-5" />
                          {reports.find(r => r.id === selectedReport)?.title}
                        </CardTitle>
                        <CardDescription>
                          Editor inteligente com assistência de IA
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {isGenerating && (
                          <div className="flex items-center gap-2 text-purple-600">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Gerando...</span>
                          </div>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateAIContent(selectedReport, 'executive_summary')}
                          disabled={isGenerating}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Gerar IA
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      const report = reports.find(r => r.id === selectedReport);
                      if (!report) return null;
                      
                      return (
                        <>
                          <div>
                            <Label className="text-sm font-medium">Resumo Executivo</Label>
                            <Textarea
                              value={report.executive_summary}
                              onChange={(e) => updateReport(selectedReport, 'executive_summary', e.target.value)}
                              className="mt-1 min-h-[200px]"
                              placeholder="Digite o resumo executivo..."
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Escopo e Metodologia</Label>
                            <Textarea
                              value={report.scope_and_methodology}
                              onChange={(e) => updateReport(selectedReport, 'scope_and_methodology', e.target.value)}
                              className="mt-1 min-h-[150px]"
                              placeholder="Descreva o escopo e metodologia..."
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Opinião Geral</Label>
                              <Select 
                                value={report.overall_opinion} 
                                onValueChange={(value) => updateReport(selectedReport, 'overall_opinion', value)}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Selecione a opinião" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Efetivo">Efetivo</SelectItem>
                                  <SelectItem value="Efetivo com deficiências menores">Efetivo com deficiências menores</SelectItem>
                                  <SelectItem value="Parcialmente efetivo">Parcialmente efetivo</SelectItem>
                                  <SelectItem value="Inefetivo">Inefetivo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-sm font-medium">Rating Geral (1-5)</Label>
                              <Select 
                                value={report.overall_rating.toString()} 
                                onValueChange={(value) => updateReport(selectedReport, 'overall_rating', parseInt(value))}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1 - Crítico</SelectItem>
                                  <SelectItem value="2">2 - Precisa Melhorar</SelectItem>
                                  <SelectItem value="3">3 - Adequado</SelectItem>
                                  <SelectItem value="4">4 - Bom</SelectItem>
                                  <SelectItem value="5">5 - Excelente</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Key Findings */}
                          <div>
                            <Label className="text-sm font-medium mb-2 block">Principais Achados</Label>
                            <div className="space-y-3">
                              {report.key_findings.map((finding, index) => (
                                <Card key={finding.id} className="border-l-4 border-l-red-500">
                                  <CardContent className="p-3">
                                    <div className="flex items-start justify-between mb-2">
                                      <h4 className="font-medium">{finding.title}</h4>
                                      <Badge 
                                        variant="outline" 
                                        className={cn("text-xs", getSeverityColor(finding.severity))}
                                      >
                                        {finding.severity}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{finding.description}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                      <div>
                                        <span className="text-gray-500">Categoria:</span>
                                        <span className="ml-1">{finding.category}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Status:</span>
                                        <span className="ml-1">{finding.status}</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* AI Insights */}
                {aiInsights[selectedReport] && aiInsights[selectedReport].length > 0 && (
                  <Card className="border-purple-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-purple-800">
                        <Bot className="h-5 w-5" />
                        Insights de IA
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {aiInsights[selectedReport].map((insight, index) => (
                        <div key={index} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="outline" className="bg-white border-purple-300 text-purple-700">
                              {insight.type.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {insight.confidence}%
                            </Badge>
                          </div>
                          <h4 className="font-medium text-purple-900 mb-1">{insight.title}</h4>
                          <p className="text-sm text-purple-700 mb-2">{insight.description}</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => applyAIInsight(selectedReport, index)}
                            className="border-purple-300 text-purple-700 hover:bg-purple-100"
                          >
                            {insight.suggested_action}
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Report Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ações do Relatório</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Rascunho
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Send className="h-4 w-4 mr-2" />
                      Enviar para Revisão
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar PDF
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Share className="h-4 w-4 mr-2" />
                      Compartilhar
                    </Button>
                  </CardContent>
                </Card>

                {/* Report Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estatísticas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(() => {
                      const report = reports.find(r => r.id === selectedReport);
                      if (!report) return null;
                      
                      return (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Conteúdo IA:</span>
                            <span className="font-medium">{report.ai_generated_content}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Qualidade IA:</span>
                            <span className="font-medium">{report.ai_quality_score}/100</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Achados:</span>
                            <span className="font-medium">{report.key_findings.length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Recomendações:</span>
                            <span className="font-medium">{report.recommendations.length}</span>
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Selecione um relatório para editar
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates Inteligentes</CardTitle>
              <CardDescription>
                Templates pré-configurados com IA para diferentes tipos de relatório
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {templates.map((template) => (
                <Card key={template.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-2">{template.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-1">Seções Incluídas:</p>
                            <div className="flex flex-wrap gap-1">
                              {template.sections.map((section, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {section}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-1">Público-alvo:</p>
                            <div className="flex flex-wrap gap-1">
                              {template.target_audience.map((audience, index) => (
                                <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                  {audience}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-1">Frameworks:</p>
                            <div className="flex flex-wrap gap-1">
                              {template.compliance_frameworks.map((framework, index) => (
                                <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700">
                                  {framework}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        Usar Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditReportGenerator;