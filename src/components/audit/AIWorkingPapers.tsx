import React, { useState, useEffect } from 'react';
import { 
  FileText,
  Brain,
  Zap,
  Save,
  Download,
  Copy,
  RefreshCw,
  Sparkles,
  Bot,
  Eye,
  Edit,
  CheckCircle,
  AlertTriangle,
  Info,
  Plus,
  Trash2,
  Settings,
  Share,
  History,
  Search,
  Filter,
  Calendar,
  User,
  Target,
  Lightbulb
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

interface WorkingPaper {
  id: string;
  title: string;
  description?: string;
  paper_type: string;
  reference_number: string;
  section: string;
  content: string;
  attachments: string[];
  audit_procedure?: string;
  testing_method?: string;
  sample_size?: number;
  population_size?: number;
  test_results?: string;
  exceptions_noted?: string;
  conclusions?: string;
  prepared_by: string;
  prepared_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  status: 'Draft' | 'Under Review' | 'Approved' | 'Finalized';
  index_references: string[];
  cross_references: string[];
  ai_auto_populated: boolean;
  ai_completion_percentage: number;
  ai_suggestions: any;
  version: number;
  updated_at: string;
}

interface AITemplate {
  id: string;
  name: string;
  description: string;
  paper_type: string;
  template_structure: any;
  ai_prompts: string[];
  auto_fill_fields: string[];
  confidence_threshold: number;
}

interface AISuggestion {
  field: string;
  suggested_content: string;
  confidence: number;
  reasoning: string;
  source: string;
  applied: boolean;
}

const AIWorkingPapers: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('papers');
  const [selectedPaper, setSelectedPaper] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiAutoFillEnabled, setAiAutoFillEnabled] = useState(true);
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  
  const [workingPapers, setWorkingPapers] = useState<WorkingPaper[]>([]);
  const [aiTemplates, setAiTemplates] = useState<AITemplate[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, AISuggestion[]>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Mock data initialization
  useEffect(() => {
    const mockWorkingPapers: WorkingPaper[] = [
      {
        id: '1',
        title: 'Teste de Segregação de Funções - Contas a Receber',
        description: 'Avaliação dos controles de segregação de funções no processo de AR',
        paper_type: 'Test Results',
        reference_number: 'WP-AR-001',
        section: 'Revenue Cycle',
        content: `OBJETIVO:
Verificar se existe segregação adequada de funções no processo de contas a receber.

PROCEDIMENTOS EXECUTADOS:
1. Obtemos a matriz de responsabilidades do processo de AR
2. Testamos uma amostra de 25 transações 
3. Verificamos aprovações e registros por usuários diferentes

RESULTADOS:
- 23 transações testadas apresentaram segregação adequada
- 2 exceções identificadas conforme detalhado abaixo

EXCEÇÕES:
1. Usuário JSILVA possui perfis de criação e aprovação simultâneos
2. Transação #12345 foi criada e aprovada pelo mesmo usuário (MCARLOS)

CONCLUSÃO:
Controle parcialmente efetivo. Recomenda-se ajustes nos perfis de acesso.`,
        attachments: ['matriz_responsabilidades.pdf', 'log_aprovacoes.xlsx'],
        audit_procedure: 'Teste de segregação de funções',
        testing_method: 'Sampling',
        sample_size: 25,
        population_size: 1247,
        test_results: '23 transações adequadas, 2 exceções',
        exceptions_noted: 'Usuários com perfis incompatíveis identificados',
        conclusions: 'Controle parcialmente efetivo - requer ajustes',
        prepared_by: 'Ana Silva',
        prepared_at: '2025-01-19T10:00:00Z',
        reviewed_by: 'Carlos Mendes',
        reviewed_at: '2025-01-19T16:30:00Z',
        review_notes: 'Papel adequado. Sugestão: incluir timeline para correção das exceções.',
        status: 'Approved',
        index_references: ['AR-001', 'SOX-404'],
        cross_references: ['WP-AR-002', 'WP-IT-001'],
        ai_auto_populated: true,
        ai_completion_percentage: 85,
        ai_suggestions: {},
        version: 2,
        updated_at: '2025-01-19T16:30:00Z'
      },
      {
        id: '2',
        title: 'Análise de Controles de Acesso Privilegiado',
        description: 'Avaliação dos controles sobre acessos administrativos ao ERP',
        paper_type: 'Analysis',
        reference_number: 'WP-IT-001',
        section: 'IT General Controls',
        content: `ESCOPO:
Avaliar os controles relacionados ao provisionamento, revisão e monitoramento de acessos privilegiados.

METODOLOGIA:
`,
        attachments: [],
        testing_method: 'System Testing',
        prepared_by: 'Carlos Mendes',
        prepared_at: '2025-01-20T08:00:00Z',
        status: 'Draft',
        index_references: ['IT-001', 'COBIT-5'],
        cross_references: [],
        ai_auto_populated: false,
        ai_completion_percentage: 25,
        ai_suggestions: {},
        version: 1,
        updated_at: '2025-01-20T08:00:00Z'
      }
    ];

    const mockTemplates: AITemplate[] = [
      {
        id: '1',
        name: 'Teste de Controles Internos',
        description: 'Template padrão para documentação de testes de controles',
        paper_type: 'Test Results',
        template_structure: {
          sections: [
            'OBJETIVO',
            'PROCEDIMENTOS EXECUTADOS',
            'POPULAÇÃO E AMOSTRA',
            'RESULTADOS',
            'EXCEÇÕES',
            'CONCLUSÃO',
            'RECOMENDAÇÕES'
          ]
        },
        ai_prompts: [
          'Com base no tipo de controle, gere objetivo específico do teste',
          'Sugira procedimentos detalhados baseados em melhores práticas',
          'Analise resultados e sugira conclusões apropriadas'
        ],
        auto_fill_fields: ['objective', 'procedures', 'methodology'],
        confidence_threshold: 80
      },
      {
        id: '2',
        name: 'Análise de Riscos e Controles',
        description: 'Template para documentação de análise de riscos',
        paper_type: 'Risk Assessment',
        template_structure: {
          sections: [
            'ESCOPO DA ANÁLISE',
            'RISCOS IDENTIFICADOS',
            'CONTROLES EXISTENTES',
            'AVALIAÇÃO DE EFETIVIDADE',
            'GAPS IDENTIFICADOS',
            'RECOMENDAÇÕES'
          ]
        },
        ai_prompts: [
          'Identifique riscos específicos baseados no processo analisado',
          'Avalie a adequação dos controles existentes',
          'Sugira melhorias baseadas em frameworks reconhecidos'
        ],
        auto_fill_fields: ['risks', 'controls', 'assessment'],
        confidence_threshold: 75
      }
    ];

    setWorkingPapers(mockWorkingPapers);
    setAiTemplates(mockTemplates);

    // Generate mock AI suggestions for draft paper
    setAiSuggestions({
      '2': [
        {
          field: 'content',
          suggested_content: `ESCOPO:
Avaliar os controles relacionados ao provisionamento, revisão e monitoramento de acessos privilegiados ao sistema ERP SAP.

METODOLOGIA:
1. Revisão da política de gestão de acessos privilegiados
2. Análise dos perfis e autorizações críticas
3. Teste de uma amostra de 15 usuários com acesso administrativo
4. Verificação dos logs de atividades de usuários privilegiados
5. Avaliação do processo de revisão periódica de acessos

POPULAÇÃO:
Total de 127 usuários com algum nível de acesso privilegiado no ambiente SAP.

AMOSTRA:
Selecionados 15 usuários representando diferentes níveis de privilegio:
- 5 administradores de sistema (SAP_ALL)
- 5 administradores funcionais (módulos específicos)  
- 5 usuários com acessos críticos de negócio`,
          confidence: 89,
          reasoning: 'Baseado em melhores práticas de auditoria de TI e frameworks COBIT/NIST',
          source: 'Alex Audit AI',
          applied: false
        },
        {
          field: 'objectives',
          suggested_content: `OBJETIVOS ESPECÍFICOS:
1. Verificar se o processo de aprovação de acessos privilegiados está funcionando adequadamente
2. Avaliar se as revisões periódicas de acesso estão sendo executadas conforme política
3. Determinar se existe monitoramento adequado das atividades de usuários privilegiados
4. Identificar possíveis acessos excessivos ou inapropriados`,
          confidence: 92,
          reasoning: 'Objetivos alinhados com requisitos SOX e melhores práticas de segurança',
          source: 'Alex Audit AI',
          applied: false
        }
      ]
    });
  }, []);

  const generateAIContent = async (paperId: string, templateId: string) => {
    setIsAIGenerating(true);
    
    // Simulate AI content generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const template = aiTemplates.find(t => t.id === templateId);
    if (!template) return;

    // Generate comprehensive content based on template
    let generatedContent = '';
    
    if (template.paper_type === 'Test Results') {
      generatedContent = `OBJETIVO:
[Objetivo específico do teste baseado no controle sendo avaliado]

PROCEDIMENTOS EXECUTADOS:
1. [Procedimento 1 - detalhado baseado em melhores práticas]
2. [Procedimento 2 - metodologia apropriada]
3. [Procedimento 3 - validações necessárias]

POPULAÇÃO E AMOSTRA:
População: [Tamanho da população]
Amostra: [Tamanho da amostra e método de seleção]
Critério de seleção: [Critério aplicado]

RESULTADOS:
[Resultados detalhados dos testes executados]

EXCEÇÕES:
[Lista de exceções identificadas, se houver]

CONCLUSÃO:
[Conclusão sobre a efetividade do controle]

RECOMENDAÇÕES:
[Recomendações específicas para melhoria]`;
    }

    setWorkingPapers(prev => prev.map(wp => 
      wp.id === paperId 
        ? { 
            ...wp, 
            content: generatedContent,
            ai_auto_populated: true,
            ai_completion_percentage: 95
          }
        : wp
    ));

    setIsAIGenerating(false);
    
    toast({
      title: 'Conteúdo Gerado com Sucesso',
      description: 'O papel de trabalho foi preenchido automaticamente pela IA.',
    });
  };

  const applySuggestion = (paperId: string, suggestionIndex: number) => {
    const suggestions = aiSuggestions[paperId];
    if (!suggestions || !suggestions[suggestionIndex]) return;

    const suggestion = suggestions[suggestionIndex];
    
    setWorkingPapers(prev => prev.map(wp => 
      wp.id === paperId 
        ? { 
            ...wp, 
            content: wp.content + '\n\n' + suggestion.suggested_content,
            ai_completion_percentage: Math.min(wp.ai_completion_percentage + 20, 100)
          }
        : wp
    ));

    // Mark suggestion as applied
    setAiSuggestions(prev => ({
      ...prev,
      [paperId]: prev[paperId].map((sug, index) => 
        index === suggestionIndex 
          ? { ...sug, applied: true }
          : sug
      )
    }));

    toast({
      title: 'Sugestão Aplicada',
      description: 'O conteúdo sugerido foi adicionado ao papel de trabalho.',
    });
  };

  const updateWorkingPaper = (paperId: string, field: keyof WorkingPaper, value: any) => {
    setWorkingPapers(prev => prev.map(wp => 
      wp.id === paperId 
        ? { ...wp, [field]: value, updated_at: new Date().toISOString() }
        : wp
    ));
  };

  const createNewWorkingPaper = () => {
    const newPaper: WorkingPaper = {
      id: (workingPapers.length + 1).toString(),
      title: 'Novo Papel de Trabalho',
      paper_type: 'Analysis',
      reference_number: `WP-NEW-${String(workingPapers.length + 1).padStart(3, '0')}`,
      section: 'General',
      content: '',
      attachments: [],
      prepared_by: 'Usuário Atual',
      prepared_at: new Date().toISOString(),
      status: 'Draft',
      index_references: [],
      cross_references: [],
      ai_auto_populated: false,
      ai_completion_percentage: 0,
      ai_suggestions: {},
      version: 1,
      updated_at: new Date().toISOString()
    };

    setWorkingPapers(prev => [...prev, newPaper]);
    setSelectedPaper(newPaper.id);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800 border-gray-200',
      'Under Review': 'bg-orange-100 text-orange-800 border-orange-200',
      'Approved': 'bg-green-100 text-green-800 border-green-200',
      'Finalized': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const filteredPapers = workingPapers.filter(paper => {
    const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paper.reference_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || paper.status === statusFilter;
    const matchesType = typeFilter === 'all' || paper.paper_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const paperTypes = Array.from(new Set(workingPapers.map(p => p.paper_type)));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Papéis de Trabalho IA
          </h1>
          <p className="text-gray-600 mt-1">
            Documentação inteligente com preenchimento automático por IA
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={aiAutoFillEnabled}
              onCheckedChange={setAiAutoFillEnabled}
            />
            <Label className="text-sm">Auto-Fill IA</Label>
          </div>
          <Button onClick={createNewWorkingPaper} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo Papel
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Papéis</p>
                <p className="text-2xl font-bold text-blue-600">{workingPapers.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Auto-preenchidos</p>
                <p className="text-2xl font-bold text-purple-600">
                  {workingPapers.filter(p => p.ai_auto_populated).length}
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
                <p className="text-sm text-gray-600">Aprovados</p>
                <p className="text-2xl font-bold text-green-600">
                  {workingPapers.filter(p => p.status === 'Approved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Eficiência IA</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(workingPapers.reduce((sum, p) => sum + p.ai_completion_percentage, 0) / workingPapers.length)}%
                </p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-1 sm:grid-cols-3 w-full">
          <TabsTrigger value="papers">Papéis de Trabalho</TabsTrigger>
          <TabsTrigger value="templates">Templates IA</TabsTrigger>
          <TabsTrigger value="editor">Editor Inteligente</TabsTrigger>
        </TabsList>

        <TabsContent value="papers" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar papéis de trabalho..."
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
                    <SelectItem value="Finalized">Finalizado</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    {paperTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Papers List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPapers.map((paper) => (
              <Card 
                key={paper.id} 
                className={cn(
                  "hover:shadow-md transition-shadow cursor-pointer",
                  selectedPaper === paper.id ? "ring-2 ring-blue-500" : ""
                )}
                onClick={() => setSelectedPaper(paper.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{paper.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {paper.reference_number} • {paper.section}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className={getStatusColor(paper.status)}>
                        {paper.status}
                      </Badge>
                      {paper.ai_auto_populated && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          <Brain className="h-3 w-3 mr-1" />
                          IA
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tipo:</span>
                    <Badge variant="outline">{paper.paper_type}</Badge>
                  </div>

                  {paper.ai_auto_populated && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Completude IA:</span>
                        <span className="font-medium">{paper.ai_completion_percentage}%</span>
                      </div>
                      <Progress value={paper.ai_completion_percentage} className="h-2" />
                    </div>
                  )}

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Preparado por:</span>
                      <span className="font-medium">{paper.prepared_by}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Data:</span>
                      <span>{new Date(paper.prepared_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {paper.reviewed_by && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Revisado por:</span>
                        <span className="font-medium">{paper.reviewed_by}</span>
                      </div>
                    )}
                  </div>

                  {paper.attachments.length > 0 && (
                    <div className="text-sm">
                      <span className="text-gray-600">Anexos:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {paper.attachments.slice(0, 2).map((attachment, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {attachment}
                          </Badge>
                        ))}
                        {paper.attachments.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{paper.attachments.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* AI Suggestions indicator */}
                  {aiSuggestions[paper.id] && aiSuggestions[paper.id].length > 0 && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-purple-700">
                        <Lightbulb className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {aiSuggestions[paper.id].filter(s => !s.applied).length} sugestões de IA
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates Inteligentes</CardTitle>
              <CardDescription>
                Templates com IA para geração automática de conteúdo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiTemplates.map((template) => (
                <Card key={template.id} className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Tipo:</span>
                            <Badge variant="outline" className="ml-1">{template.paper_type}</Badge>
                          </div>
                          <div>
                            <span className="text-gray-500">Confiança:</span>
                            <span className="ml-1 font-medium">{template.confidence_threshold}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Campos Auto:</span>
                            <span className="ml-1 font-medium">{template.auto_fill_fields.length}</span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">Seções do Template:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.template_structure.sections.map((section: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {section}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-purple-200 text-purple-700 hover:bg-purple-50"
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

        <TabsContent value="editor" className="space-y-4">
          {selectedPaper ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Editor */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Edit className="h-5 w-5" />
                          {workingPapers.find(p => p.id === selectedPaper)?.title}
                        </CardTitle>
                        <CardDescription>
                          {workingPapers.find(p => p.id === selectedPaper)?.reference_number}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {isAIGenerating && (
                          <div className="flex items-center gap-2 text-purple-600">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Gerando conteúdo...</span>
                          </div>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Sparkles className="h-4 w-4 mr-2" />
                              Gerar com IA
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Geração Automática de Conteúdo</DialogTitle>
                              <DialogDescription>
                                Selecione um template para gerar conteúdo automaticamente
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um template" />
                                </SelectTrigger>
                                <SelectContent>
                                  {aiTemplates.map(template => (
                                    <SelectItem key={template.id} value={template.id}>
                                      {template.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                onClick={() => {
                                  if (selectedTemplate) {
                                    generateAIContent(selectedPaper, selectedTemplate);
                                  }
                                }}
                                disabled={!selectedTemplate || isAIGenerating}
                                className="w-full"
                              >
                                <Zap className="h-4 w-4 mr-2" />
                                Gerar Conteúdo
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Título</Label>
                        <Input
                          value={workingPapers.find(p => p.id === selectedPaper)?.title || ''}
                          onChange={(e) => updateWorkingPaper(selectedPaper, 'title', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Tipo</Label>
                        <Select 
                          value={workingPapers.find(p => p.id === selectedPaper)?.paper_type || ''} 
                          onValueChange={(value) => updateWorkingPaper(selectedPaper, 'paper_type', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Test Plan">Plano de Teste</SelectItem>
                            <SelectItem value="Test Results">Resultados de Teste</SelectItem>
                            <SelectItem value="Analysis">Análise</SelectItem>
                            <SelectItem value="Summary">Resumo</SelectItem>
                            <SelectItem value="Checklist">Checklist</SelectItem>
                            <SelectItem value="Interview Notes">Notas de Entrevista</SelectItem>
                            <SelectItem value="Risk Assessment">Avaliação de Risco</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Conteúdo</Label>
                      <Textarea
                        value={workingPapers.find(p => p.id === selectedPaper)?.content || ''}
                        onChange={(e) => updateWorkingPaper(selectedPaper, 'content', e.target.value)}
                        className="mt-1 min-h-[400px] font-mono text-sm"
                        placeholder="Digite o conteúdo do papel de trabalho..."
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Save className="h-3 w-3 mr-1" />
                          Salvar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          Exportar
                        </Button>
                      </div>
                      <div className="text-sm text-gray-500">
                        Auto-salvamento ativo
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* AI Suggestions */}
                {aiSuggestions[selectedPaper] && aiSuggestions[selectedPaper].length > 0 && (
                  <Card className="border-purple-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-purple-800">
                        <Bot className="h-5 w-5" />
                        Sugestões de IA
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {aiSuggestions[selectedPaper].filter(s => !s.applied).map((suggestion, index) => (
                        <div key={index} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="outline" className="bg-white border-purple-300 text-purple-700">
                              {suggestion.field}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {suggestion.confidence}%
                            </Badge>
                          </div>
                          <p className="text-sm text-purple-700 mb-2">
                            {suggestion.suggested_content.substring(0, 150)}...
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-purple-600">
                              Fonte: {suggestion.source}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => applySuggestion(selectedPaper, index)}
                              className="border-purple-300 text-purple-700 hover:bg-purple-100"
                            >
                              Aplicar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Paper Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Detalhes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(() => {
                      const paper = workingPapers.find(p => p.id === selectedPaper);
                      if (!paper) return null;
                      
                      return (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Status:</span>
                            <Badge variant="outline" className={getStatusColor(paper.status)}>
                              {paper.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Versão:</span>
                            <span className="font-medium">{paper.version}</span>
                          </div>
                          {paper.ai_auto_populated && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Completude IA:</span>
                              <span className="font-medium">{paper.ai_completion_percentage}%</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Atualizado:</span>
                            <span>{new Date(paper.updated_at).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicar Papel
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Share className="h-4 w-4 mr-2" />
                      Compartilhar
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <History className="h-4 w-4 mr-2" />
                      Ver Histórico
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start text-red-600 hover:bg-red-50 border-red-200">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Selecione um papel de trabalho para editar
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIWorkingPapers;