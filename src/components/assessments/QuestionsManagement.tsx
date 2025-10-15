import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { Plus, Search, Edit, Trash2, HelpCircle, FileText, ArrowUp, ArrowDown, Copy, Eye, Settings, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AssessmentFramework, AssessmentDomain, AssessmentControl, AssessmentQuestion, QuestionFormData } from '@/types/assessment';
import { sanitizeInput, sanitizeObject, auditLog } from '@/utils/securityLogger';
import { useCRUDRateLimit } from '@/hooks/useRateLimit';

export default function QuestionsManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rateLimitCRUD = useCRUDRateLimit(user?.id || 'anonymous');
  
  // Usar contexto de tenant correto
  const effectiveTenantId = useCurrentTenantId();
  
  // Debug auth context
  console.log('🔐 Auth Context - User:', user?.id, 'Tenant:', effectiveTenantId);

  const [frameworks, setFrameworks] = useState<AssessmentFramework[]>([]);
  const [domains, setDomains] = useState<AssessmentDomain[]>([]);
  const [controls, setControls] = useState<AssessmentControl[]>([]);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<AssessmentFramework | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<AssessmentDomain | null>(null);
  const [selectedControl, setSelectedControl] = useState<AssessmentControl | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<AssessmentQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateQuestionOpen, setIsCreateQuestionOpen] = useState(false);
  const [isEditQuestionOpen, setIsEditQuestionOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [questionForm, setQuestionForm] = useState<QuestionFormData>({
    control_id: '',
    codigo: '',
    texto: '',
    descricao: '',
    tipo_pergunta: '',
    opcoes_resposta: null,
    obrigatoria: true,
    peso: 100,
    texto_ajuda: '',
    exemplos: [],
    referencias: []
  });

  const tiposPerguntas = [
    { value: 'escala', label: 'Escala de Maturidade (1-5)', description: 'Pergunta com escala de maturidade' },
    { value: 'sim_nao', label: 'Sim/Não', description: 'Pergunta de resposta binária' },
    { value: 'multipla_escolha', label: 'Múltipla Escolha', description: 'Pergunta com múltiplas opções' },
    { value: 'texto_livre', label: 'Texto Livre', description: 'Resposta em texto livre' },
    { value: 'numerica', label: 'Numérica', description: 'Valor numérico' },
    { value: 'data', label: 'Data', description: 'Seleção de data' },
    { value: 'arquivo', label: 'Arquivo', description: 'Upload de evidências' }
  ];

  const escalaMaturidade = [
    { value: 1, label: 'Inicial', description: 'Não implementado ou implementação ad-hoc' },
    { value: 2, label: 'Gerenciado', description: 'Implementação básica com documentação' },
    { value: 3, label: 'Definido', description: 'Processo padronizado e integrado' },
    { value: 4, label: 'Quantitativamente Gerenciado', description: 'Processo medido e controlado' },
    { value: 5, label: 'Otimizado', description: 'Melhoria contínua implementada' }
  ];

  useEffect(() => {
    if (effectiveTenantId) {
      loadFrameworks();
    } else {
      console.warn('⚠️ [AUTH] Tenant ID não disponível, aguardando...');
      setLoading(false);
    }
  }, [effectiveTenantId]);

  // Carregar framework específico se passado como parâmetro
  useEffect(() => {
    const frameworkId = searchParams.get('framework');
    console.log('🔍 Framework ID da URL:', frameworkId);
    console.log('📋 Frameworks disponíveis:', frameworks.length);
    
    if (frameworkId && frameworks.length > 0) {
      const framework = frameworks.find(f => f.id === frameworkId);
      console.log('🎯 Framework encontrado:', framework?.nome || 'Não encontrado');
      
      if (framework) {
        setSelectedFramework(framework);
        console.log('✅ Framework selecionado:', framework.nome);
      } else {
        console.error('❌ Framework não encontrado com ID:', frameworkId);
        toast.error('Framework não encontrado');
      }
    }
  }, [searchParams, frameworks]);

  useEffect(() => {
    if (selectedFramework) {
      loadDomains(selectedFramework.id);
      setSelectedDomain(null);
      setSelectedControl(null);
    }
  }, [selectedFramework]);

  useEffect(() => {
    if (selectedDomain) {
      loadControls(selectedDomain.id);
      setSelectedControl(null);
    }
  }, [selectedDomain]);

  useEffect(() => {
    if (selectedControl) {
      loadQuestions(selectedControl.id);
    }
  }, [selectedControl]);

  const loadFrameworks = async () => {
    try {
      console.log('🔄 Carregando frameworks para tenant:', effectiveTenantId);
      
      if (!rateLimitCRUD.checkRateLimit('read')) {
        toast.error('Limite de operações excedido. Tente novamente em alguns segundos.');
        return;
      }

      const { data, error } = await supabase
        .from('assessment_frameworks')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .eq('status', 'ativo')
        .order('nome', { ascending: true });

      if (error) {
        console.error('❌ Erro SQL ao carregar frameworks:', error);
        throw error;
      }

      console.log('📊 Frameworks carregados:', data?.length || 0);
      setFrameworks(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar frameworks:', error);
      toast.error('Erro ao carregar frameworks: ' + (error as any)?.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDomains = async (frameworkId: string) => {
    try {
      const { data, error } = await supabase
        .from('assessment_domains')
        .select('*')
        .eq('framework_id', frameworkId)
        .eq('tenant_id', effectiveTenantId)
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (error) throw error;

      setDomains(data || []);
    } catch (error) {
      console.error('Erro ao carregar domínios:', error);
      toast.error('Erro ao carregar domínios');
    }
  };

  const loadControls = async (domainId: string) => {
    try {
      const { data, error } = await supabase
        .from('assessment_controls')
        .select('*')
        .eq('domain_id', domainId)
        .eq('tenant_id', effectiveTenantId)
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (error) throw error;

      setControls(data || []);
    } catch (error) {
      console.error('Erro ao carregar controles:', error);
      toast.error('Erro ao carregar controles');
    }
  };

  const loadQuestions = async (controlId: string) => {
    try {
      const { data, error } = await supabase
        .from('assessment_questions')
        .select('*')
        .eq('control_id', controlId)
        .eq('tenant_id', effectiveTenantId)
        .eq('ativa', true)
        .order('ordem', { ascending: true });

      if (error) {
        console.error('Erro ao carregar questões:', error);
        toast.error('Erro ao carregar questões: ' + error.message);
        return;
      }

      setQuestions(data || []);
    } catch (error) {
      console.error('Erro ao carregar questões:', error);
      toast.error('Erro ao carregar questões');
    }
  };

  const handleCreateQuestion = async () => {
    try {
      if (!rateLimitCRUD.checkRateLimit('create')) {
        toast.error('Limite de operações excedido. Tente novamente em alguns segundos.');
        return;
      }

      if (!selectedControl) {
        toast.error('Selecione um controle primeiro');
        return;
      }

      const sanitizedFormData = sanitizeObject({
        ...questionForm,
        codigo: sanitizeInput(questionForm.codigo),
        texto: sanitizeInput(questionForm.texto),
        descricao: sanitizeInput(questionForm.descricao),
        texto_ajuda: sanitizeInput(questionForm.texto_ajuda)
      });

      // Configurar opções de resposta baseado no tipo
      let opcoes_resposta = null;
      let mapeamento_pontuacao = null;

      if (questionForm.tipo_pergunta === 'escala') {
        opcoes_resposta = escalaMaturidade;
        mapeamento_pontuacao = {
          type: 'linear',
          scale: { min: 1, max: 5 }
        };
      } else if (questionForm.tipo_pergunta === 'sim_nao') {
        opcoes_resposta = [
          { value: true, label: 'Sim', points: 5 },
          { value: false, label: 'Não', points: 0 }
        ];
        mapeamento_pontuacao = {
          type: 'binary',
          yes_points: 5,
          no_points: 0
        };
      } else if (questionForm.tipo_pergunta === 'multipla_escolha' && questionForm.opcoes_resposta) {
        opcoes_resposta = questionForm.opcoes_resposta;
        mapeamento_pontuacao = {
          type: 'custom',
          options: questionForm.opcoes_resposta
        };
      }

      const questionData = {
        tenant_id: effectiveTenantId,
        control_id: selectedControl.id,
        codigo: sanitizedFormData.codigo,
        texto: sanitizedFormData.texto,
        descricao: sanitizedFormData.descricao,
        tipo_pergunta: sanitizedFormData.tipo_pergunta,
        obrigatoria: sanitizedFormData.obrigatoria,
        peso: sanitizedFormData.peso,
        texto_ajuda: sanitizedFormData.texto_ajuda,
        ordem: questions.length + 1,
        opcoes_resposta,
        mapeamento_pontuacao,
        ativa: true,
        created_by: user?.id
      };

      const { error } = await supabase
        .from('assessment_questions')
        .insert(questionData);

      if (error) throw error;

      await auditLog('CREATE', 'assessment_questions', {
        codigo: sanitizedFormData.codigo,
        texto: sanitizedFormData.texto,
        control_id: selectedControl.id,
        tenant_id: effectiveTenantId
      });

      toast.success('Questão criada com sucesso!');
      setIsCreateQuestionOpen(false);
      resetQuestionForm();
      loadQuestions(selectedControl.id);
    } catch (error) {
      console.error('Erro ao criar questão:', error);
      toast.error('Erro ao criar questão');
    }
  };

  const handleUpdateQuestion = async () => {
    try {
      if (!rateLimitCRUD.checkRateLimit('update')) {
        toast.error('Limite de operações excedido. Tente novamente em alguns segundos.');
        return;
      }

      if (!selectedQuestion) return;

      const sanitizedFormData = sanitizeObject({
        ...questionForm,
        codigo: sanitizeInput(questionForm.codigo),
        texto: sanitizeInput(questionForm.texto),
        descricao: sanitizeInput(questionForm.descricao),
        texto_ajuda: sanitizeInput(questionForm.texto_ajuda)
      });

      const { error } = await supabase
        .from('assessment_questions')
        .update({
          ...sanitizedFormData,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedQuestion.id)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;

      await auditLog('UPDATE', 'assessment_questions', {
        id: selectedQuestion.id,
        changes: sanitizedFormData,
        tenant_id: effectiveTenantId
      });

      toast.success('Questão atualizada com sucesso!');
      setIsEditQuestionOpen(false);
      setSelectedQuestion(null);
      resetQuestionForm();
      if (selectedControl) {
        loadQuestions(selectedControl.id);
      }
    } catch (error) {
      console.error('Erro ao atualizar questão:', error);
      toast.error('Erro ao atualizar questão');
    }
  };

  const handleDeleteQuestion = async (question: AssessmentQuestion) => {
    try {
      if (!rateLimitCRUD.checkRateLimit('delete')) {
        toast.error('Limite de operações excedido. Tente novamente em alguns segundos.');
        return;
      }

      const { error } = await supabase
        .from('assessment_questions')
        .update({ 
          ativa: false,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', question.id)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;

      await auditLog('DELETE', 'assessment_questions', {
        id: question.id,
        codigo: question.codigo,
        tenant_id: effectiveTenantId
      });

      toast.success('Questão removida com sucesso!');
      if (selectedControl) {
        loadQuestions(selectedControl.id);
      }
    } catch (error) {
      console.error('Erro ao remover questão:', error);
      toast.error('Erro ao remover questão');
    }
  };

  const handleMoveQuestion = async (questionId: string, direction: 'up' | 'down') => {
    try {
      if (!rateLimitCRUD.checkRateLimit('update')) {
        toast.error('Limite de operações excedido.');
        return;
      }

      const currentIndex = questions.findIndex(q => q.id === questionId);
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (newIndex < 0 || newIndex >= questions.length) return;

      const currentQuestion = questions[currentIndex];
      const targetQuestion = questions[newIndex];

      // Trocar as ordens
      await supabase
        .from('assessment_questions')
        .update({ ordem: targetQuestion.ordem })
        .eq('id', currentQuestion.id);

      await supabase
        .from('assessment_questions')
        .update({ ordem: currentQuestion.ordem })
        .eq('id', targetQuestion.id);

      if (selectedControl) {
        loadQuestions(selectedControl.id);
      }
    } catch (error) {
      console.error('Erro ao reordenar questão:', error);
      toast.error('Erro ao reordenar questão');
    }
  };

  const handleDuplicateQuestion = async (question: AssessmentQuestion) => {
    try {
      if (!rateLimitCRUD.checkRateLimit('create')) {
        toast.error('Limite de operações excedido.');
        return;
      }

      const duplicatedQuestion = {
        ...question,
        id: undefined,
        codigo: `${question.codigo}_copy`,
        texto: `${question.texto} (Cópia)`,
        ordem: questions.length + 1,
        created_by: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('assessment_questions')
        .insert(duplicatedQuestion);

      if (error) throw error;

      toast.success('Questão duplicada com sucesso!');
      if (selectedControl) {
        loadQuestions(selectedControl.id);
      }
    } catch (error) {
      console.error('Erro ao duplicar questão:', error);
      toast.error('Erro ao duplicar questão');
    }
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      control_id: '',
      codigo: '',
      texto: '',
      descricao: '',
      tipo_pergunta: '',
      opcoes_resposta: null,
      obrigatoria: true,
      peso: 100,
      texto_ajuda: '',
      exemplos: [],
      referencias: []
    });
  };

  const openEditQuestion = (question: AssessmentQuestion) => {
    setSelectedQuestion(question);
    setQuestionForm({
      control_id: question.control_id,
      codigo: question.codigo || '',
      texto: question.texto,
      descricao: question.descricao || '',
      tipo_pergunta: question.tipo_pergunta,
      opcoes_resposta: question.opcoes_resposta,
      obrigatoria: question.obrigatoria,
      peso: question.peso,
      texto_ajuda: question.texto_ajuda || '',
      exemplos: question.exemplos || [],
      referencias: question.referencias || []
    });
    setIsEditQuestionOpen(true);
  };

  const renderQuestionPreview = (question: AssessmentQuestion) => {
    switch (question.tipo_pergunta) {
      case 'escala':
        return (
          <div className="space-y-2">
            <Label>Selecione o nível de maturidade:</Label>
            <div className="space-y-1">
              {escalaMaturidade.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <input type="radio" name="preview" value={option.value} disabled />
                  <Label>{option.value} - {option.label}</Label>
                </div>
              ))}
            </div>
          </div>
        );
      case 'sim_nao':
        return (
          <div className="space-y-2">
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <input type="radio" name="preview" value="sim" disabled />
                <Label>Sim</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" name="preview" value="nao" disabled />
                <Label>Não</Label>
              </div>
            </div>
          </div>
        );
      case 'multipla_escolha':
        return (
          <div className="space-y-2">
            {question.opcoes_resposta?.map((option: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <input type="radio" name="preview" value={option.value} disabled />
                <Label>{option.label}</Label>
              </div>
            ))}
          </div>
        );
      case 'texto_livre':
        return <Textarea placeholder="Digite sua resposta..." disabled />;
      case 'numerica':
        return <Input type="number" placeholder="Digite um valor numérico" disabled />;
      case 'data':
        return <Input type="date" disabled />;
      case 'arquivo':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Clique para fazer upload de evidências</p>
          </div>
        );
      default:
        return <Input placeholder="Tipo de pergunta não reconhecido" disabled />;
    }
  };

  const filteredQuestions = questions.filter(question =>
    question.texto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (question.codigo && question.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Verificar se há tenant ID
  if (!effectiveTenantId) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Erro de Autenticação</h3>
          <p className="text-muted-foreground mb-4">
            Não foi possível identificar sua organização. Faça login novamente.
          </p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>User ID: {user?.id || 'Não disponível'}</p>
            <p>Tenant ID: {effectiveTenantId || 'Não disponível'}</p>
          </div>
          <Button onClick={() => navigate('/login')} className="mt-4">
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  // Debug info para frameworks vazios
  if (frameworks.length === 0 && !loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Nenhum framework encontrado</h3>
          <p className="text-muted-foreground mb-4">
            Não foram encontrados frameworks ativos para esta organização.
          </p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Tenant ID: {effectiveTenantId}</p>
            <p>Frameworks carregados: {frameworks.length}</p>
          </div>
          <Button onClick={() => navigate('/assessments/frameworks')} className="mt-4">
            Ir para Gestão de Frameworks
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/assessments')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="border-l border-muted-foreground/20 pl-4">
            <h2 className="text-2xl font-bold tracking-tight">Gestão de Questões</h2>
            <p className="text-muted-foreground">
              Crie e gerencie questões para avaliações de controles
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="selection" className="space-y-4">
        <TabsList>
          <TabsTrigger value="selection">Seleção de Contexto</TabsTrigger>
          <TabsTrigger value="questions" disabled={!selectedControl}>
            Questões {selectedControl && `(${selectedControl.titulo})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="selection" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Framework</CardTitle>
                <CardDescription>Selecione o framework de assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedFramework?.id || ''} 
                  onValueChange={(value) => {
                    const framework = frameworks.find(f => f.id === value);
                    setSelectedFramework(framework || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um framework" />
                  </SelectTrigger>
                  <SelectContent>
                    {frameworks.map((framework) => (
                      <SelectItem key={framework.id} value={framework.id}>
                        {framework.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedFramework && (
                  <div className="mt-2 p-2 bg-muted rounded text-sm">
                    <p><strong>Código:</strong> {selectedFramework.codigo}</p>
                    <p><strong>Versão:</strong> {selectedFramework.versao}</p>
                    <p><strong>Tipo:</strong> {selectedFramework.tipo_framework}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Domínio</CardTitle>
                <CardDescription>Selecione o domínio do framework</CardDescription>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedDomain?.id || ''} 
                  onValueChange={(value) => {
                    const domain = domains.find(d => d.id === value);
                    setSelectedDomain(domain || null);
                  }}
                  disabled={!selectedFramework}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um domínio" />
                  </SelectTrigger>
                  <SelectContent>
                    {domains.map((domain) => (
                      <SelectItem key={domain.id} value={domain.id}>
                        {domain.codigo} - {domain.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedDomain && (
                  <div className="mt-2 p-2 bg-muted rounded text-sm">
                    <p><strong>Ordem:</strong> {selectedDomain.ordem}</p>
                    <p><strong>Peso:</strong> {selectedDomain.peso}%</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Controle</CardTitle>
                <CardDescription>Selecione o controle para criar questões</CardDescription>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedControl?.id || ''} 
                  onValueChange={(value) => {
                    const control = controls.find(c => c.id === value);
                    setSelectedControl(control || null);
                  }}
                  disabled={!selectedDomain}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um controle" />
                  </SelectTrigger>
                  <SelectContent>
                    {controls.map((control) => (
                      <SelectItem key={control.id} value={control.id}>
                        {control.codigo} - {control.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedControl && (
                  <div className="mt-2 p-2 bg-muted rounded text-sm">
                    <p><strong>Tipo:</strong> {selectedControl.tipo_controle}</p>
                    <p><strong>Criticidade:</strong> {selectedControl.criticidade}</p>
                    <p><strong>Peso:</strong> {selectedControl.peso}</p>
                    <Badge className={
                      selectedControl.obrigatorio ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }>
                      {selectedControl.obrigatorio ? 'Obrigatório' : 'Opcional'}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar questões..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Dialog open={isCreateQuestionOpen} onOpenChange={setIsCreateQuestionOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Questão
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Criar Nova Questão</DialogTitle>
                  <DialogDescription>
                    Adicione uma nova questão para o controle {selectedControl?.titulo}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="question-codigo">Código (opcional)</Label>
                      <Input
                        id="question-codigo"
                        value={questionForm.codigo}
                        onChange={(e) => setQuestionForm(prev => ({ ...prev, codigo: e.target.value }))}
                        placeholder="Ex: Q.5.1.1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="question-peso">Peso</Label>
                      <Input
                        id="question-peso"
                        type="number"
                        value={questionForm.peso}
                        onChange={(e) => setQuestionForm(prev => ({ ...prev, peso: parseFloat(e.target.value) }))}
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="question-texto">Texto da Questão</Label>
                    <Textarea
                      id="question-texto"
                      value={questionForm.texto}
                      onChange={(e) => setQuestionForm(prev => ({ ...prev, texto: e.target.value }))}
                      placeholder="Digite a pergunta que será apresentada ao avaliador"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="question-descricao">Descrição (opcional)</Label>
                    <Textarea
                      id="question-descricao"
                      value={questionForm.descricao}
                      onChange={(e) => setQuestionForm(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descrição adicional ou contexto da pergunta"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="question-tipo">Tipo de Pergunta</Label>
                    <Select value={questionForm.tipo_pergunta} onValueChange={(value) => setQuestionForm(prev => ({ ...prev, tipo_pergunta: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de pergunta" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposPerguntas.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            <div>
                              <div className="font-medium">{tipo.label}</div>
                              <div className="text-xs text-muted-foreground">{tipo.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="question-ajuda">Texto de Ajuda (opcional)</Label>
                    <Textarea
                      id="question-ajuda"
                      value={questionForm.texto_ajuda}
                      onChange={(e) => setQuestionForm(prev => ({ ...prev, texto_ajuda: e.target.value }))}
                      placeholder="Texto explicativo para auxiliar o respondente"
                      rows={2}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="question-obrigatoria"
                      checked={questionForm.obrigatoria}
                      onCheckedChange={(checked) => setQuestionForm(prev => ({ ...prev, obrigatoria: !!checked }))}
                    />
                    <Label htmlFor="question-obrigatoria">Questão obrigatória</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateQuestionOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateQuestion}>
                    Criar Questão
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Nenhuma questão encontrada</h3>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm ? 'Tente ajustar o termo de pesquisa' : 'Comece criando a primeira questão para este controle'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Accordion type="single" collapsible className="space-y-2">
                {filteredQuestions.map((question, index) => (
                  <AccordionItem key={question.id} value={question.id} className="border rounded-lg">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center justify-between w-full">
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {question.codigo ? `${question.codigo} - ` : `Q${index + 1} - `}
                              {question.texto}
                            </span>
                            {question.obrigatoria && (
                              <Badge variant="destructive" className="text-xs">Obrigatória</Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Tipo: {tiposPerguntas.find(t => t.value === question.tipo_pergunta)?.label} • 
                            Peso: {question.peso}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mr-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveQuestion(question.id, 'up');
                            }}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveQuestion(question.id, 'down');
                            }}
                            disabled={index === filteredQuestions.length - 1}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        {question.descricao && (
                          <div>
                            <Label className="text-sm font-medium">Descrição:</Label>
                            <p className="text-sm text-muted-foreground">{question.descricao}</p>
                          </div>
                        )}
                        
                        <div>
                          <Label className="text-sm font-medium">Preview da Questão:</Label>
                          <div className="mt-2 p-3 border rounded-lg bg-muted/50">
                            {renderQuestionPreview(question)}
                          </div>
                        </div>

                        {question.texto_ajuda && (
                          <div>
                            <Label className="text-sm font-medium">Texto de Ajuda:</Label>
                            <p className="text-sm text-muted-foreground">{question.texto_ajuda}</p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditQuestion(question)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuplicateQuestion(question)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Duplicar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedQuestion(question);
                              setIsPreviewOpen(true);
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteQuestion(question)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remover
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Question Dialog */}
      <Dialog open={isEditQuestionOpen} onOpenChange={setIsEditQuestionOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Questão</DialogTitle>
            <DialogDescription>
              Faça as alterações necessárias na questão
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-codigo">Código (opcional)</Label>
                <Input
                  id="edit-codigo"
                  value={questionForm.codigo}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, codigo: e.target.value }))}
                  placeholder="Ex: Q.5.1.1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-peso">Peso</Label>
                <Input
                  id="edit-peso"
                  type="number"
                  value={questionForm.peso}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, peso: parseFloat(e.target.value) }))}
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-texto">Texto da Questão</Label>
              <Textarea
                id="edit-texto"
                value={questionForm.texto}
                onChange={(e) => setQuestionForm(prev => ({ ...prev, texto: e.target.value }))}
                placeholder="Digite a pergunta que será apresentada ao avaliador"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-descricao">Descrição (opcional)</Label>
              <Textarea
                id="edit-descricao"
                value={questionForm.descricao}
                onChange={(e) => setQuestionForm(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição adicional ou contexto da pergunta"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ajuda">Texto de Ajuda (opcional)</Label>
              <Textarea
                id="edit-ajuda"
                value={questionForm.texto_ajuda}
                onChange={(e) => setQuestionForm(prev => ({ ...prev, texto_ajuda: e.target.value }))}
                placeholder="Texto explicativo para auxiliar o respondente"
                rows={2}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-obrigatoria"
                checked={questionForm.obrigatoria}
                onCheckedChange={(checked) => setQuestionForm(prev => ({ ...prev, obrigatoria: !!checked }))}
              />
              <Label htmlFor="edit-obrigatoria">Questão obrigatória</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditQuestionOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateQuestion}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Preview da Questão</DialogTitle>
            <DialogDescription>
              Visualização de como a questão será apresentada
            </DialogDescription>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">{selectedQuestion.texto}</Label>
                {selectedQuestion.descricao && (
                  <p className="text-sm text-muted-foreground mt-1">{selectedQuestion.descricao}</p>
                )}
              </div>
              
              {renderQuestionPreview(selectedQuestion)}
              
              {selectedQuestion.texto_ajuda && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <HelpCircle className="h-4 w-4 inline mr-1" />
                    {selectedQuestion.texto_ajuda}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsPreviewOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}