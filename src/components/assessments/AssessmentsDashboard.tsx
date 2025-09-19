import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, CheckCircle, Play, Activity, Award, BookOpen, AlertCircle, ArrowRight, Settings, Target, BarChart3, List, Search, Filter, ChevronDown, ChevronUp, Download, Trash2, Edit, Eye, Plus, TrendingUp, Clock, Users, Shield, Brain
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';

export default function AssessmentsDashboard() {
  const { user, effectiveTenantId } = useAuth();
  const navigate = useNavigate();
  
  // Estados separados e simples
  const [assessments, setAssessments] = useState([]);
  const [frameworks, setFrameworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para seleção múltipla
  const [selectedAssessments, setSelectedAssessments] = useState([]);

  // Estados para modal de criação de assessment
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [assessmentType, setAssessmentType] = useState('framework'); // 'framework' ou 'custom'
  const [selectedFramework, setSelectedFramework] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_inicio: null,
    data_fim_planejada: null,
    responsavel_assessment: '',
    avaliadores: [],
    prioridade: 'media'
  });
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  // Função separada para carregar assessments
  const loadAssessments = async () => {
    if (!effectiveTenantId) {
      console.log('❌ effectiveTenantId não disponível');
      return;
    }
    
    console.log('🔍 Carregando assessments para tenant:', effectiveTenantId);
    console.log('🔐 Estado da sessão:', await supabase.auth.getSession());
    
    try {
      // Tentar com autenticação first
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        setError('Usuário não autenticado - necessário login');
        return;
      }

      const { data, error } = await supabase
        .from('assessments')
        .select('id, titulo, status, percentual_conclusao, percentual_maturidade')
        .eq('tenant_id', effectiveTenantId)
        .limit(10);

      console.log('📊 Resultado da consulta:', { data, error });

      if (error) {
        console.error('Erro assessments:', error);
        setError('Erro ao carregar assessments: ' + error.message);
        return;
      }

      console.log('✅ Assessments carregados:', data?.length || 0);
      setAssessments(data || []);
    } catch (err) {
      console.error('Erro geral assessments:', err);
      setError('Erro geral ao carregar assessments');
    }
  };

  // Função separada para carregar frameworks
  const loadFrameworks = async () => {
    if (!effectiveTenantId) {
      console.log('❌ effectiveTenantId não disponível para frameworks');
      return;
    }
    
    console.log('🔍 Carregando frameworks para tenant:', effectiveTenantId);
    
    try {
      // Verificar autenticação
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        console.log('❌ Sessão não encontrada para frameworks');
        return;
      }

      const { data, error } = await supabase
        .from('assessment_frameworks')
        .select('id, nome, tipo_framework')
        .eq('tenant_id', effectiveTenantId)
        .limit(5);

      console.log('📊 Frameworks resultado:', { data, error });

      if (error) {
        console.error('Erro frameworks:', error);
        return;
      }

      console.log('✅ Frameworks carregados:', data?.length || 0);
      setFrameworks(data || []);
    } catch (err) {
      console.error('Erro geral frameworks:', err);
    }
  };

  // UseEffect ÚNICO com dependências controladas
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      console.log('🔍 Estado de autenticação:', { 
        user: user?.id, 
        effectiveTenantId, 
        loading 
      });
      
      if (!effectiveTenantId || !user || loading) {
        console.log('❌ Condições não atendidas para carregar dados');
        return;
      }
      
      console.log('✅ Carregando dados para tenant:', effectiveTenantId);
      setLoading(true);
      setError('');

      try {
        await Promise.all([
          loadAssessments(),
          loadFrameworks()
        ]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [effectiveTenantId, user?.id]); // Dependências específicas

  // UseEffect para carregar usuários quando o modal for aberto
  useEffect(() => {
    if (isCreateModalOpen && effectiveTenantId) {
      loadUsers();
    }
  }, [isCreateModalOpen, effectiveTenantId]);

  // Filtros aplicados
  const filteredAssessments = assessments.filter(assessment => {
    return searchTerm === '' || 
      assessment.titulo.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Cálculos derivados simples
  const metrics = {
    total: assessments.length,
    active: assessments.filter(a => ['em_andamento', 'iniciado'].includes(a.status)).length,
    completed: assessments.filter(a => a.status === 'concluido').length,
    frameworks: frameworks.length,
    avgMaturity: assessments.length > 0 
      ? Math.round(assessments.reduce((sum, a) => sum + (a.percentual_maturidade || 0), 0) / assessments.length)
      : 0,
    pending: assessments.filter(a => a.status === 'planejado').length,
    reviewPending: assessments.filter(a => a.status === 'em_revisao').length,
    monthlyTrend: 12 // Simulado
  };

  const getStatusColor = (status) => {
    const colors = {
      'concluido': 'bg-green-100 text-green-800',
      'em_andamento': 'bg-blue-100 text-blue-800',
      'iniciado': 'bg-blue-100 text-blue-800',
      'planejado': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Funções para seleção múltipla
  const toggleAssessmentSelection = (assessmentId) => {
    setSelectedAssessments(prev => 
      prev.includes(assessmentId) 
        ? prev.filter(id => id !== assessmentId)
        : [...prev, assessmentId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedAssessments.length === filteredAssessments.length) {
      setSelectedAssessments([]);
    } else {
      setSelectedAssessments(filteredAssessments.map(a => a.id));
    }
  };

  const clearSelection = () => {
    setSelectedAssessments([]);
  };

  // Ações em lote
  const handleBulkExport = () => {
    const selectedData = assessments.filter(a => selectedAssessments.includes(a.id));
    console.log('Exportando assessments:', selectedData);
    toast.success(`Exportando ${selectedAssessments.length} assessments...`);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Tem certeza que deseja excluir ${selectedAssessments.length} assessments selecionados?`)) {
      console.log('Excluindo assessments:', selectedAssessments);
      toast.success(`${selectedAssessments.length} assessments excluídos com sucesso!`);
      setSelectedAssessments([]);
    }
  };

  // Função para carregar usuários disponíveis
  const loadUsers = async () => {
    if (!effectiveTenantId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, email')
        .eq('tenant_id', effectiveTenantId)
        .eq('is_active', true);

      if (error) throw error;
      setAvailableUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários disponíveis');
    }
  };

  // Função para criar novo assessment
  const handleCreateAssessment = async () => {
    if (!effectiveTenantId || !user) {
      toast.error('Dados de autenticação não disponíveis');
      return;
    }

    // Validações básicas
    if (!formData.titulo.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    if (assessmentType === 'framework' && !selectedFramework) {
      toast.error('Selecione um framework');
      return;
    }

    if (!formData.responsavel_assessment) {
      toast.error('Responsável pelo assessment é obrigatório');
      return;
    }

    setIsCreating(true);

    try {
      const assessmentData = {
        tenant_id: effectiveTenantId,
        titulo: formData.titulo,
        descricao: formData.descricao,
        framework_id: assessmentType === 'framework' ? selectedFramework.id : null,
        responsavel_assessment: formData.responsavel_assessment,
        data_inicio: formData.data_inicio,
        data_fim_planejada: formData.data_fim_planejada,
        prioridade: formData.prioridade,
        status: 'planejado',
        percentual_conclusao: 0,
        created_by: user.id,
        updated_by: user.id
      };

      const { data: newAssessment, error } = await supabase
        .from('assessments')
        .insert([assessmentData])
        .select()
        .single();

      if (error) throw error;

      // Se há avaliadores selecionados, criar os relacionamentos
      if (formData.avaliadores.length > 0) {
        const avaliadoresData = formData.avaliadores.map(userId => ({
          tenant_id: effectiveTenantId,
          assessment_id: newAssessment.id,
          user_id: userId,
          role: 'respondent'
        }));

        const { error: avaliadoresError } = await supabase
          .from('assessment_user_roles')
          .insert(avaliadoresData);

        if (avaliadoresError) {
          console.error('Erro ao adicionar avaliadores:', avaliadoresError);
          toast.error('Assessment criado, mas houve erro ao adicionar avaliadores');
        }
      }

      toast.success('Assessment criado com sucesso!');
      setIsCreateModalOpen(false);
      resetForm();
      await loadAssessments(); // Recarregar lista

    } catch (error) {
      console.error('Erro ao criar assessment:', error);
      toast.error('Erro ao criar assessment: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  // Função para resetar formulário
  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      data_inicio: null,
      data_fim_planejada: null,
      responsavel_assessment: '',
      avaliadores: [],
      prioridade: 'media'
    });
    setSelectedFramework(null);
    setAssessmentType('framework');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Assessments</h1>
          <p className="text-muted-foreground">Central de Avaliação de Maturidade e Compliance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Assessment
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  +{metrics.monthlyTrend}% vs mês anterior
                </p>
              </div>
              <Shield className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assessments</p>
                <p className="text-2xl font-bold">{metrics.total}</p>
              </div>
              <FileText className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold">{metrics.active}</p>
              </div>
              <Activity className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">{metrics.completed}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Maturidade Média</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.avgMaturity}%</p>
              </div>
              <Award className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Frameworks</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.frameworks}</p>
              </div>
              <BookOpen className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes Revisão</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.reviewPending}</p>
              </div>
              <Clock className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Planejados</p>
                <p className="text-2xl font-bold text-indigo-600">{metrics.pending}</p>
                <p className="text-xs text-muted-foreground">
                  Aguardando execução
                </p>
              </div>
              <Target className="h-10 w-10 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards de Ação */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" 
              onClick={() => setIsCreateModalOpen(true)}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Plus className="h-8 w-8 text-green-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Novo Assessment</h3>
            <p className="text-muted-foreground text-sm">Iniciar nova avaliação de maturidade</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" 
              onClick={() => setSelectedTab('assessments')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Assessments</h3>
            <p className="text-muted-foreground text-sm">Gerenciar avaliações existentes</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" 
              onClick={() => navigate('/assessments/frameworks')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Frameworks</h3>
            <p className="text-muted-foreground text-sm">Biblioteca de controles e frameworks</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" 
              onClick={() => setSelectedTab('action-plans')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Target className="h-8 w-8 text-orange-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Planos de Ação</h3>
            <p className="text-muted-foreground text-sm">Remediar gaps e melhorias</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="action-plans">Planos de Ação</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Status dos Assessments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Assessments Ativos
                </CardTitle>
                <CardDescription>
                  Avaliações em andamento e próximas ações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assessments.slice(0, 4).map(assessment => (
                    <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{assessment.titulo}</p>
                          <Badge className={getStatusColor(assessment.status)}>
                            {assessment.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <Progress value={assessment.percentual_conclusao} className="h-2 mb-2" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{assessment.percentual_conclusao}% concluído</span>
                          {assessment.percentual_maturidade && (
                            <span>{assessment.percentual_maturidade}% maturidade</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Frameworks Disponíveis
                </CardTitle>
                <CardDescription>
                  Biblioteca de controles e padrões
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {frameworks.map(framework => (
                    <div key={framework.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div>
                        <p className="font-medium">{framework.nome}</p>
                        <p className="text-sm text-muted-foreground">{framework.tipo_framework}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                  {frameworks.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum framework cadastrado</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          {/* Ações em Lote */}
          {selectedAssessments.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-600 text-white">
                  {selectedAssessments.length} selecionados
                </Badge>
                <span className="text-sm text-blue-700">Ações:</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleBulkExport}>
                  <Download className="h-4 w-4 mr-1" />
                  Exportar
                </Button>
                <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
                <Button size="sm" variant="ghost" onClick={clearSelection}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lista de Assessments</CardTitle>
                  <CardDescription>
                    {filteredAssessments.length} assessments {searchTerm && `encontrados para "${searchTerm}"`}
                  </CardDescription>
                </div>
                
                {filteredAssessments.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedAssessments.length === filteredAssessments.length && filteredAssessments.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                    <label htmlFor="select-all" className="text-sm font-medium">
                      Selecionar todos
                    </label>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {filteredAssessments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {assessments.length === 0 ? 'Nenhum assessment encontrado' : 'Nenhum assessment corresponde à busca'}
                  </p>
                  <Button 
                    onClick={() => navigate('/assessments/execution')}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Assessment
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAssessments.map((assessment) => (
                    <div 
                      key={assessment.id} 
                      className={`flex items-center gap-3 p-4 border rounded-lg transition-colors ${
                        selectedAssessments.includes(assessment.id) 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <Checkbox
                        checked={selectedAssessments.includes(assessment.id)}
                        onCheckedChange={() => toggleAssessmentSelection(assessment.id)}
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{assessment.titulo}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getStatusColor(assessment.status)}>
                                {assessment.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {assessment.percentual_conclusao}% concluído
                            </p>
                            {assessment.percentual_maturidade && (
                              <p className="text-sm text-muted-foreground">
                                {assessment.percentual_maturidade}% maturidade
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            Visualizar
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          {assessment.status !== 'concluido' && (
                            <Button size="sm" variant="default">
                              <Play className="h-3 w-3 mr-1" />
                              Continuar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frameworks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frameworks Disponíveis</CardTitle>
              <CardDescription>
                {frameworks.length} frameworks cadastrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {frameworks.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Nenhum framework encontrado</p>
                  <Button onClick={() => navigate('/assessments/frameworks')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Framework
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {frameworks.map((framework) => (
                    <Card key={framework.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <h3 className="font-medium">{framework.nome}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {framework.tipo_framework}
                        </p>
                        <div className="flex justify-between items-center mt-3">
                          <Button size="sm" variant="outline">
                            Ver Controles
                          </Button>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="action-plans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Planos de Ação</CardTitle>
              <CardDescription>
                Gerenciar melhorias e remediações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Funcionalidade em desenvolvimento</p>
                <p className="text-sm text-muted-foreground">
                  Planos de ação serão criados automaticamente após assessments concluídos
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Criação de Assessment */}
      <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
        setIsCreateModalOpen(open);
        if (!open) {
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Criar Novo Assessment
            </DialogTitle>
            <DialogDescription>
              Configure um novo assessment de maturidade para sua organização
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Tipo de Assessment */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Tipo de Assessment</Label>
              <RadioGroup 
                value={assessmentType} 
                onValueChange={setAssessmentType}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="framework" id="framework" />
                  <Label htmlFor="framework" className="cursor-pointer">
                    A partir de um Framework
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="cursor-pointer">
                    Assessment Customizado
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Seleção de Framework (se applicable) */}
            {assessmentType === 'framework' && (
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Framework <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={selectedFramework?.id || ''} 
                  onValueChange={(value) => {
                    const framework = frameworks.find(f => f.id === value);
                    setSelectedFramework(framework || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um framework..." />
                  </SelectTrigger>
                  <SelectContent>
                    {frameworks.map((framework) => (
                      <SelectItem key={framework.id} value={framework.id}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {framework.tipo_framework}
                          </Badge>
                          {framework.nome}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedFramework && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">{selectedFramework.nome}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedFramework.descricao}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Informações Básicas */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">
                  Título do Assessment <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ex: Assessment ISO 27001 - Primeiro Trimestre 2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descreva o objetivo e escopo deste assessment..."
                  rows={3}
                />
              </div>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.data_inicio ? format(formData.data_inicio, "dd/MM/yyyy") : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.data_inicio}
                      onSelect={(date) => setFormData(prev => ({ ...prev, data_inicio: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Prazo Final</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.data_fim_planejada ? format(formData.data_fim_planejada, "dd/MM/yyyy") : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.data_fim_planejada}
                      onSelect={(date) => setFormData(prev => ({ ...prev, data_fim_planejada: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Responsáveis */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="responsavel">
                  Responsável pelo Assessment <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.responsavel_assessment}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, responsavel_assessment: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsável..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex flex-col">
                          <span>{user.nome}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Avaliadores/Respondentes</Label>
                <div className="space-y-2">
                  {availableUsers.map((user) => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={formData.avaliadores.includes(user.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({
                              ...prev,
                              avaliadores: [...prev.avaliadores, user.id]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              avaliadores: prev.avaliadores.filter(id => id !== user.id)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={`user-${user.id}`} className="cursor-pointer">
                        <div className="flex flex-col">
                          <span className="text-sm">{user.nome}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Prioridade */}
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select
                value={formData.prioridade}
                onValueChange={(value) => setFormData(prev => ({ ...prev, prioridade: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateAssessment}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Assessment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}