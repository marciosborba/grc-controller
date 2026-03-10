import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  FileText, 
  Plus, 
  Brain, 
  Sparkles,
  BookOpen,
  Wand2,
  CheckCircle,
  AlertCircle,
  Eye,
  Save,
  Send,
  Clock,
  Target,
  Users,
  Shield,
  Lightbulb,
  FileCheck,
  ArrowRight,
  Zap,
  MessageSquare
} from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { useAuth} from '@/contexts/AuthContextOptimized';
import { ImprovedAIChatDialog } from '@/components/ai/ImprovedAIChatDialog';

import type { 
  PolicyV2, 
  PolicyFormData, 
  PolicyTemplate,
  PolicyCategory,
  PolicyType,
  Priority,
  AlexSuggestions
} from '@/types/policy-management-v2';
import { POLICY_CATEGORIES, POLICY_TYPES, PRIORITIES } from '@/types/policy-management-v2';

interface PolicyElaborationViewProps {
  onPolicyCreated: (policy: PolicyV2) => void;
}

const PolicyElaborationView: React.FC<PolicyElaborationViewProps> = ({
  onPolicyCreated
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Estados principais
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PolicyFormData>({
    title: '',
    description: '',
    content: '',
    category: 'governance',
    policy_type: 'policy',
    priority: 'medium',
    requires_acknowledgment: false,
    is_mandatory: true,
    applies_to_all_users: true,
    tags: [],
    compliance_frameworks: []
  });

  // Estados para IA
  const [alexSuggestions, setAlexSuggestions] = useState<AlexSuggestions | null>(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PolicyTemplate | null>(null);
  const [templates, setTemplates] = useState<PolicyTemplate[]>([]);

  // Estados de UI
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showAlexDialog, setShowAlexDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    // Mock templates - em produção viria do backend
    const mockTemplates: PolicyTemplate[] = [
      {
        id: '1',
        name: 'Política de Segurança da Informação',
        description: 'Template padrão para política de segurança baseado em ISO 27001',
        category: 'security',
        policy_type: 'policy',
        template_content: `# POLÍTICA DE SEGURANÇA DA INFORMAÇÃO

## 1. OBJETIVO
Esta política estabelece as diretrizes para proteção das informações da {organization_name}.

## 2. ESCOPO
Aplica-se a todos os colaboradores, terceiros e sistemas da organização.

## 3. RESPONSABILIDADES
- CISO: Responsável pela implementação
- Colaboradores: Cumprimento das diretrizes
- TI: Implementação técnica

## 4. DIRETRIZES
4.1. Classificação da Informação
4.2. Controles de Acesso
4.3. Backup e Recuperação
4.4. Incidentes de Segurança

## 5. PENALIDADES
O descumprimento desta política pode resultar em medidas disciplinares.

## 6. REVISÃO
Esta política será revisada anualmente.`,
        sections: [
          { title: 'Objetivo', required: true, order: 1 },
          { title: 'Escopo', required: true, order: 2 },
          { title: 'Responsabilidades', required: true, order: 3 },
          { title: 'Diretrizes', required: true, order: 4 },
          { title: 'Penalidades', required: false, order: 5 },
          { title: 'Revisão', required: true, order: 6 }
        ],
        variables: {
          organization_name: 'Nome da Organização',
          effective_date: 'Data de Vigência'
        },
        is_active: true,
        is_global: true,
        requires_customization: true,
        compliance_frameworks: ['ISO 27001', 'LGPD'],
        usage_count: 45,
        rating: 4.8,
        alex_generated: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Código de Ética e Conduta',
        description: 'Template para código de ética corporativa',
        category: 'governance',
        policy_type: 'code_of_conduct',
        template_content: `# CÓDIGO DE ÉTICA E CONDUTA

## 1. MENSAGEM DA LIDERANÇA
A {organization_name} está comprometida com os mais altos padrões éticos.

## 2. NOSSOS VALORES
- Integridade
- Transparência
- Responsabilidade
- Respeito

## 3. DIRETRIZES DE CONDUTA
3.1. Relacionamento com Clientes
3.2. Relacionamento com Fornecedores
3.3. Conflito de Interesses
3.4. Uso de Recursos da Empresa

## 4. CANAL DE DENÚNCIAS
Disponibilizamos canal confidencial para relatar violações.

## 5. CONSEQUÊNCIAS
Violações podem resultar em medidas disciplinares.`,
        sections: [
          { title: 'Mensagem da Liderança', required: true, order: 1 },
          { title: 'Valores', required: true, order: 2 },
          { title: 'Diretrizes de Conduta', required: true, order: 3 },
          { title: 'Canal de Denúncias', required: true, order: 4 },
          { title: 'Consequências', required: true, order: 5 }
        ],
        variables: {
          organization_name: 'Nome da Organização',
          ethics_contact: 'Contato do Comitê de Ética'
        },
        is_active: true,
        is_global: true,
        requires_customization: true,
        compliance_frameworks: ['SOX', 'Compliance Corporativo'],
        usage_count: 32,
        rating: 4.6,
        alex_generated: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    setTemplates(mockTemplates);
  };

  const generateAlexSuggestions = async () => {
    setIsGeneratingContent(true);
    
    try {
      // Simular chamada para Alex Policy
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const suggestions: AlexSuggestions = {
        content_improvements: [
          'Adicionar seção sobre proteção de dados pessoais',
          'Incluir definições de termos técnicos',
          'Especificar penalidades por descumprimento'
        ],
        structure_recommendations: [
          'Reorganizar seções por ordem de importância',
          'Adicionar sumário executivo',
          'Incluir fluxograma de processo'
        ],
        compliance_notes: [
          'Verificar alinhamento com LGPD Art. 46',
          'Incluir referência à ISO 27001:2013',
          'Adicionar cláusula de auditoria'
        ],
        risk_assessments: [
          'Risco alto: ausência de controles de acesso',
          'Risco médio: falta de treinamento específico',
          'Risco baixo: documentação desatualizada'
        ],
        implementation_tips: [
          'Criar cronograma de implementação em fases',
          'Definir responsáveis por cada seção',
          'Estabelecer métricas de acompanhamento'
        ],
        generated_at: new Date().toISOString(),
        confidence_score: 0.92
      };

      setAlexSuggestions(suggestions);
      
      toast({
        title: '🤖 Alex Policy',
        description: 'Sugestões geradas com sucesso!',
      });

    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar sugestões',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const applyTemplate = (template: PolicyTemplate) => {
    setFormData(prev => ({
      ...prev,
      title: template.name,
      description: template.description,
      content: template.template_content,
      category: template.category,
      policy_type: template.policy_type,
      compliance_frameworks: template.compliance_frameworks || []
    }));

    setSelectedTemplate(template);
    setShowTemplateDialog(false);
    
    toast({
      title: '📋 Template Aplicado',
      description: `Template "${template.name}" carregado com sucesso`,
    });

    // Gerar sugestões automaticamente
    generateAlexSuggestions();
  };

  const generateContentWithAI = async () => {
    setIsGeneratingContent(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const generatedContent = `# ${formData.title.toUpperCase()}

## 1. OBJETIVO
Esta ${formData.policy_type} tem como objetivo estabelecer diretrizes claras para ${formData.description?.toLowerCase() || 'as atividades relacionadas'}.

## 2. ESCOPO
Esta política aplica-se a todos os colaboradores, terceiros e parceiros da organização.

## 3. RESPONSABILIDADES
- **Gestão**: Aprovação e suporte à implementação
- **Colaboradores**: Cumprimento integral das diretrizes
- **Área Responsável**: Monitoramento e controle

## 4. DIRETRIZES PRINCIPAIS
4.1. Todos os envolvidos devem seguir as melhores práticas estabelecidas
4.2. É obrigatório o cumprimento das normas regulamentares aplicáveis
4.3. Qualquer desvio deve ser reportado imediatamente

## 5. MONITORAMENTO E CONTROLE
O cumprimento desta política será monitorado através de auditorias periódicas.

## 6. PENALIDADES
O descumprimento pode resultar em medidas disciplinares conforme regulamento interno.

## 7. REVISÃO
Esta política será revisada anualmente ou quando necessário.`;

      setFormData(prev => ({
        ...prev,
        content: generatedContent
      }));

      toast({
        title: '✨ Conteúdo Gerado',
        description: 'Alex Policy criou o conteúdo base da política',
      });

      // Gerar sugestões após criar conteúdo
      generateAlexSuggestions();

    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o conteúdo',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const savePolicy = async () => {
    setIsSaving(true);
    
    try {
      // Validações
      if (!formData.title.trim()) {
        throw new Error('Título é obrigatório');
      }
      
      if (!formData.content?.trim()) {
        throw new Error('Conteúdo é obrigatório');
      }

      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newPolicy: PolicyV2 = {
        id: Date.now().toString(),
        tenant_id: user?.tenant?.id || '',
        title: formData.title,
        description: formData.description,
        content: formData.content,
        category: formData.category,
        policy_type: formData.policy_type,
        priority: formData.priority,
        status: 'draft',
        workflow_stage: 'elaboration',
        version: '1.0',
        is_current_version: true,
        created_by: user?.id || '',
        requires_acknowledgment: formData.requires_acknowledgment,
        is_mandatory: formData.is_mandatory,
        applies_to_all_users: formData.applies_to_all_users,
        tags: formData.tags,
        compliance_frameworks: formData.compliance_frameworks,
        ai_generated: !!selectedTemplate?.alex_generated,
        alex_suggestions: alexSuggestions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      onPolicyCreated(newPolicy);

      // Reset form
      setFormData({
        title: '',
        description: '',
        content: '',
        category: 'governance',
        policy_type: 'policy',
        priority: 'medium',
        requires_acknowledgment: false,
        is_mandatory: true,
        applies_to_all_users: true,
        tags: [],
        compliance_frameworks: []
      });
      setCurrentStep(1);
      setAlexSuggestions(null);
      setSelectedTemplate(null);

    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao salvar política',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const steps = [
    {
      number: 1,
      title: 'Informações Básicas',
      description: 'Defina título, categoria e tipo da política',
      icon: FileText
    },
    {
      number: 2,
      title: 'Conteúdo',
      description: 'Elabore o conteúdo com assistência Alex Policy',
      icon: Brain
    },
    {
      number: 3,
      title: 'Configurações',
      description: 'Configure parâmetros e finalização',
      icon: Settings
    }
  ];

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className=\"space-y-6\">
      {/* Header */}
      <div className=\"flex items-center justify-between\">
        <div>
          <h2 className=\"text-xl font-semibold flex items-center space-x-2\">
            <FileText className=\"h-5 w-5\" />
            <span>Elaboração de Políticas</span>
          </h2>
          <p className=\"text-sm text-muted-foreground\">
            Crie políticas estruturadas com assistência Alex Policy IA
          </p>
        </div>
        
        <div className=\"flex items-center space-x-2\">
          <ImprovedAIChatDialog
            type=\"policy\"
            title=\"Alex Policy - Assistente de Elaboração\"
            trigger={
              <Button variant=\"outline\" className=\"flex items-center space-x-2\">
                <Brain className=\"h-4 w-4\" />
                <span>Alex Policy</span>
                <Badge variant=\"secondary\" className=\"text-xs bg-indigo-100 text-indigo-800\">
                  <Sparkles className=\"h-3 w-3 mr-1\" />
                  IA
                </Badge>
              </Button>
            }
          />
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className=\"p-6\">
          <div className=\"space-y-4\">
            <div className=\"flex items-center justify-between\">
              <span className=\"text-sm font-medium\">Progresso da Elaboração</span>
              <span className=\"text-sm text-muted-foreground\">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className=\"h-2\" />
            
            <div className=\"grid grid-cols-3 gap-4 mt-6\">
              {steps.map((step) => {
                const IconComponent = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;
                
                return (
                  <div 
                    key={step.number}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      isActive 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : isCompleted 
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className=\"flex items-center space-x-3\">
                      <div className={`p-2 rounded-lg ${
                        isActive 
                          ? 'bg-indigo-500 text-white' 
                          : isCompleted 
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className=\"h-4 w-4\" />
                        ) : (
                          <IconComponent className=\"h-4 w-4\" />
                        )}
                      </div>
                      <div className=\"flex-1 min-w-0\">
                        <h3 className=\"font-medium text-sm\">{step.title}</h3>
                        <p className=\"text-xs text-muted-foreground\">{step.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className=\"grid gap-6 lg:grid-cols-3\">
        {/* Main Content */}
        <div className=\"lg:col-span-2 space-y-6\">
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className=\"flex items-center space-x-2\">
                  <FileText className=\"h-5 w-5\" />
                  <span>Informações Básicas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className=\"space-y-6\">
                <div className=\"grid gap-4 md:grid-cols-2\">
                  <div className=\"space-y-2\">
                    <Label htmlFor=\"title\">Título da Política *</Label>
                    <Input
                      id=\"title\"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder=\"Ex: Política de Segurança da Informação\"
                    />
                  </div>
                  
                  <div className=\"space-y-2\">
                    <Label htmlFor=\"category\">Categoria *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value: PolicyCategory) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(POLICY_CATEGORIES).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className=\"space-y-2\">
                    <Label htmlFor=\"policy_type\">Tipo *</Label>
                    <Select 
                      value={formData.policy_type} 
                      onValueChange={(value: PolicyType) => setFormData(prev => ({ ...prev, policy_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(POLICY_TYPES).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className=\"space-y-2\">
                    <Label htmlFor=\"priority\">Prioridade</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value: Priority) => setFormData(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRIORITIES).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className=\"space-y-2\">
                  <Label htmlFor=\"description\">Descrição</Label>
                  <Textarea
                    id=\"description\"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder=\"Descreva brevemente o objetivo e escopo da política\"
                    rows={3}
                  />
                </div>

                <div className=\"flex justify-between\">
                  <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                    <DialogTrigger asChild>
                      <Button variant=\"outline\">
                        <BookOpen className=\"h-4 w-4 mr-2\" />
                        Usar Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent className=\"max-w-4xl max-h-[80vh] overflow-y-auto\">
                      <DialogHeader>
                        <DialogTitle>Biblioteca de Templates</DialogTitle>
                      </DialogHeader>
                      <div className=\"grid gap-4 md:grid-cols-2\">
                        {templates.map((template) => (
                          <Card key={template.id} className=\"cursor-pointer hover:shadow-md transition-shadow\">
                            <CardContent className=\"p-4\">
                              <div className=\"space-y-3\">
                                <div className=\"flex items-start justify-between\">
                                  <h3 className=\"font-medium\">{template.name}</h3>
                                  {template.alex_generated && (
                                    <Badge variant=\"secondary\" className=\"text-xs bg-indigo-100 text-indigo-800\">
                                      <Sparkles className=\"h-3 w-3 mr-1\" />
                                      Alex
                                    </Badge>
                                  )}
                                </div>
                                <p className=\"text-sm text-muted-foreground\">{template.description}</p>
                                <div className=\"flex items-center justify-between\">
                                  <div className=\"flex items-center space-x-2\">
                                    <Badge variant=\"outline\" className=\"text-xs\">
                                      {POLICY_CATEGORIES[template.category]}
                                    </Badge>
                                    <span className=\"text-xs text-muted-foreground\">
                                      {template.usage_count} usos
                                    </span>
                                  </div>
                                  <Button 
                                    size=\"sm\"
                                    onClick={() => applyTemplate(template)}
                                  >
                                    Usar
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button onClick={() => setCurrentStep(2)}>
                    Próximo
                    <ArrowRight className=\"h-4 w-4 ml-2\" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className=\"flex items-center space-x-2\">
                  <Brain className=\"h-5 w-5\" />
                  <span>Conteúdo da Política</span>
                </CardTitle>
              </CardHeader>
              <CardContent className=\"space-y-6\">
                <div className=\"flex items-center space-x-2 mb-4\">
                  <Button 
                    variant=\"outline\"
                    onClick={generateContentWithAI}
                    disabled={isGeneratingContent}
                  >
                    {isGeneratingContent ? (
                      <>
                        <div className=\"animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2\"></div>
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Wand2 className=\"h-4 w-4 mr-2\" />
                        Gerar com Alex Policy
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant=\"outline\"
                    onClick={generateAlexSuggestions}
                    disabled={isGeneratingContent}
                  >
                    <Lightbulb className=\"h-4 w-4 mr-2\" />
                    Obter Sugestões
                  </Button>
                </div>

                <div className=\"space-y-2\">
                  <Label htmlFor=\"content\">Conteúdo *</Label>
                  <Textarea
                    id=\"content\"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder=\"Digite o conteúdo da política ou use Alex Policy para gerar automaticamente\"
                    rows={20}
                    className=\"font-mono\"
                  />
                </div>

                <div className=\"flex justify-between\">
                  <Button variant=\"outline\" onClick={() => setCurrentStep(1)}>
                    Anterior
                  </Button>
                  <Button onClick={() => setCurrentStep(3)}>
                    Próximo
                    <ArrowRight className=\"h-4 w-4 ml-2\" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className=\"flex items-center space-x-2\">
                  <Settings className=\"h-5 w-5\" />
                  <span>Configurações Finais</span>
                </CardTitle>
              </CardHeader>
              <CardContent className=\"space-y-6\">
                <div className=\"grid gap-4 md:grid-cols-2\">
                  <div className=\"space-y-4\">
                    <div className=\"flex items-center space-x-2\">
                      <input
                        type=\"checkbox\"
                        id=\"requires_acknowledgment\"
                        checked={formData.requires_acknowledgment}
                        onChange={(e) => setFormData(prev => ({ ...prev, requires_acknowledgment: e.target.checked }))}
                      />
                      <Label htmlFor=\"requires_acknowledgment\">Requer reconhecimento</Label>
                    </div>
                    
                    <div className=\"flex items-center space-x-2\">
                      <input
                        type=\"checkbox\"
                        id=\"is_mandatory\"
                        checked={formData.is_mandatory}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_mandatory: e.target.checked }))}
                      />
                      <Label htmlFor=\"is_mandatory\">Política obrigatória</Label>
                    </div>
                    
                    <div className=\"flex items-center space-x-2\">
                      <input
                        type=\"checkbox\"
                        id=\"applies_to_all_users\"
                        checked={formData.applies_to_all_users}
                        onChange={(e) => setFormData(prev => ({ ...prev, applies_to_all_users: e.target.checked }))}
                      />
                      <Label htmlFor=\"applies_to_all_users\">Aplica-se a todos os usuários</Label>
                    </div>
                  </div>

                  <div className=\"space-y-4\">
                    <div className=\"space-y-2\">
                      <Label htmlFor=\"tags\">Tags (separadas por vírgula)</Label>
                      <Input
                        id=\"tags\"
                        value={formData.tags?.join(', ') || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                        }))}
                        placeholder=\"segurança, compliance, lgpd\"
                      />
                    </div>

                    <div className=\"space-y-2\">
                      <Label htmlFor=\"frameworks\">Frameworks de Compliance</Label>
                      <Input
                        id=\"frameworks\"
                        value={formData.compliance_frameworks?.join(', ') || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          compliance_frameworks: e.target.value.split(',').map(fw => fw.trim()).filter(fw => fw)
                        }))}
                        placeholder=\"ISO 27001, LGPD, SOX\"
                      />
                    </div>
                  </div>
                </div>

                <div className=\"flex justify-between\">
                  <Button variant=\"outline\" onClick={() => setCurrentStep(2)}>
                    Anterior
                  </Button>
                  <div className=\"space-x-2\">
                    <Button variant=\"outline\" onClick={savePolicy} disabled={isSaving}>
                      <Save className=\"h-4 w-4 mr-2\" />
                      Salvar Rascunho
                    </Button>
                    <Button onClick={savePolicy} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <div className=\"animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2\"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Send className=\"h-4 w-4 mr-2\" />
                          Finalizar Elaboração
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Alex Suggestions */}
        <div className=\"space-y-6\">
          {alexSuggestions && (
            <Card>
              <CardHeader>
                <CardTitle className=\"flex items-center space-x-2\">
                  <Brain className=\"h-5 w-5 text-indigo-600\" />
                  <span>Sugestões Alex Policy</span>
                  <Badge variant=\"secondary\" className=\"text-xs bg-indigo-100 text-indigo-800\">
                    <Sparkles className=\"h-3 w-3 mr-1\" />
                    IA
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className=\"space-y-4\">
                <Tabs defaultValue=\"improvements\">
                  <TabsList className=\"grid w-full grid-cols-2\">
                    <TabsTrigger value=\"improvements\">Melhorias</TabsTrigger>
                    <TabsTrigger value=\"compliance\">Compliance</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value=\"improvements\" className=\"space-y-3\">
                    {alexSuggestions.content_improvements?.map((suggestion, index) => (
                      <div key={index} className=\"p-3 bg-blue-50 rounded-lg\">
                        <div className=\"flex items-start space-x-2\">
                          <Lightbulb className=\"h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0\" />
                          <p className=\"text-sm text-blue-900\">{suggestion}</p>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value=\"compliance\" className=\"space-y-3\">
                    {alexSuggestions.compliance_notes?.map((note, index) => (
                      <div key={index} className=\"p-3 bg-green-50 rounded-lg\">
                        <div className=\"flex items-start space-x-2\">
                          <Shield className=\"h-4 w-4 text-green-600 mt-0.5 flex-shrink-0\" />
                          <p className=\"text-sm text-green-900\">{note}</p>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>

                {alexSuggestions.confidence_score && (
                  <div className=\"mt-4 p-3 bg-gray-50 rounded-lg\">
                    <div className=\"flex items-center justify-between mb-2\">
                      <span className=\"text-sm font-medium\">Confiança IA</span>
                      <span className=\"text-sm text-muted-foreground\">
                        {Math.round(alexSuggestions.confidence_score * 100)}%
                      </span>
                    </div>
                    <Progress value={alexSuggestions.confidence_score * 100} className=\"h-2\" />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className=\"flex items-center space-x-2\">
                <Target className=\"h-5 w-5\" />
                <span>Ações Rápidas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className=\"space-y-3\">
              <Button 
                variant=\"outline\" 
                className=\"w-full justify-start\"
                onClick={() => setShowTemplateDialog(true)}
              >
                <BookOpen className=\"h-4 w-4 mr-2\" />
                Biblioteca de Templates
              </Button>
              
              <Button 
                variant=\"outline\" 
                className=\"w-full justify-start\"
                onClick={generateAlexSuggestions}
                disabled={isGeneratingContent}
              >
                <Lightbulb className=\"h-4 w-4 mr-2\" />
                Obter Sugestões IA
              </Button>
              
              <Button 
                variant=\"outline\" 
                className=\"w-full justify-start\"
                onClick={() => setShowAlexDialog(true)}
              >
                <MessageSquare className=\"h-4 w-4 mr-2\" />
                Chat Alex Policy
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PolicyElaborationView;