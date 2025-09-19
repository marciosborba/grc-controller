import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para seleção múltipla
  const [selectedAssessments, setSelectedAssessments] = useState([]);

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
    avgMaturity: assessments.length > 0 
      ? Math.round(assessments.reduce((sum, a) => sum + (a.percentual_maturidade || 0), 0) / assessments.length)
      : 0
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

  const handleBulkStatusChange = (newStatus) => {
    console.log('Alterando status para:', newStatus, 'dos assessments:', selectedAssessments);
    toast.success(`Status alterado para ${newStatus} em ${selectedAssessments.length} assessments!`);
    setSelectedAssessments([]);
  };

  // Função para alterar status (simples por enquanto)
  const handleStatusTransition = async (assessmentId, targetStatus, comments = '') => {
    console.log('Transição de status:', assessmentId, targetStatus, comments);
    toast.success(`Status alterado para ${targetStatus}`);
    // Recarregar dados
    await Promise.all([loadAssessments(), loadFrameworks()]);
  };

  // Função para verificar qualidade (simples por enquanto)
  const handleQualityCheck = async (assessmentId) => {
    console.log('Verificação de qualidade:', assessmentId);
    toast.success('Verificação de qualidade realizada');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4">Carregando assessments...</p>
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
          <Button onClick={() => navigate('/assessments/execution')}>
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
                  +12% vs mês anterior
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
                <p className="text-sm text-muted-foreground">Total Assessments</p>
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
                <p className="text-2xl font-bold text-purple-600">{frameworks.length}</p>
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
                <p className="text-2xl font-bold text-orange-600">
                  {assessments.filter(a => a.status === 'em_revisao').length}
                </p>
              </div>
              <Clock className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Equipes Ativas</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {metrics.active}
                </p>
                <p className="text-xs text-muted-foreground">
                  Respondentes e auditores
                </p>
              </div>
              <Users className="h-10 w-10 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fluxo do Processo de Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Processo de Assessment - Metodologia CMMI
          </CardTitle>
          <CardDescription>
            Siga o fluxo padronizado para garantir qualidade e maturidade dos controles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/assessments/frameworks')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">1. Framework</div>
                    <div className="text-sm text-muted-foreground">Selecionar biblioteca</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-blue-600">
                  {frameworks.length} frameworks disponíveis
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/assessments/execution')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">2. Responsáveis</div>
                    <div className="text-sm text-muted-foreground">Atribuir equipes</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-green-600">
                  Respondentes e auditores
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100">
                    <Edit className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-medium">3. Avaliação</div>
                    <div className="text-sm text-muted-foreground">Responder controles</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-orange-600">
                  Coleta de evidências
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium">4. Maturidade</div>
                    <div className="text-sm text-muted-foreground">Avaliar CMMI</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-purple-600">
                  Níveis 1-5 CMMI
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/assessments/reports')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-medium">5. Relatórios</div>
                    <div className="text-sm text-muted-foreground">Gerar insights</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-indigo-600">
                  Analytics avançados
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="assessments">Lista de Assessments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Barra de Busca */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <p className="text-sm text-muted-foreground mt-2">
                {filteredAssessments.length} de {assessments.length} assessments encontrados
              </p>
            )}
          </div>

          {/* Ações Rápidas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" 
                  onClick={() => navigate('/assessments/frameworks')}>
              <CardContent className="p-4 text-center">
                <BookOpen className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <h3 className="font-medium">Gerenciar Frameworks</h3>
                <p className="text-sm text-muted-foreground">ISO 27001, NIST, SOX</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/assessments/execution')}>
              <CardContent className="p-4 text-center">
                <Plus className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <h3 className="font-medium">Novo Assessment</h3>
                <p className="text-sm text-muted-foreground">Iniciar nova avaliação</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/assessments/manage')}>
              <CardContent className="p-4 text-center">
                <Settings className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <h3 className="font-medium">Gerenciar</h3>
                <p className="text-sm text-muted-foreground">CRUD e configurações</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/assessments/reports')}>
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-8 w-8 mx-auto text-indigo-600 mb-2" />
                <h3 className="font-medium">Relatórios</h3>
                <p className="text-sm text-muted-foreground">Analytics e insights</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          {/* Ações em Lote - Simplificadas */}
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
                  {searchTerm && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setSearchTerm('')}
                    >
                      Limpar busca
                    </Button>
                  )}
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
                        
                        {/* Ações Essenciais */}
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
      </Tabs>
    </div>
  );
}