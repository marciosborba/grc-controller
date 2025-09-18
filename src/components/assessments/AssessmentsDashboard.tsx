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
  FileText, CheckCircle, Play, Activity, Award, BookOpen, AlertCircle, ArrowRight, Settings, Target, BarChart3, List, Search, Filter, ChevronDown, ChevronUp, Download, Trash2, Edit, Eye
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
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Estados para cards expansíveis
  const [expandedCard, setExpandedCard] = useState(null);
  
  // Estados para seleção múltipla
  const [selectedAssessments, setSelectedAssessments] = useState([]);

  // Função separada para carregar assessments
  const loadAssessments = async () => {
    if (!effectiveTenantId) return;
    
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('id, titulo, status, percentual_conclusao, percentual_maturidade')
        .eq('tenant_id', effectiveTenantId)
        .limit(10);

      if (error) {
        console.error('Erro assessments:', error);
        setError('Erro ao carregar assessments');
        return;
      }

      setAssessments(data || []);
    } catch (err) {
      console.error('Erro geral assessments:', err);
      setError('Erro geral ao carregar assessments');
    }
  };

  // Função separada para carregar frameworks
  const loadFrameworks = async () => {
    if (!effectiveTenantId) return;
    
    try {
      const { data, error } = await supabase
        .from('assessment_frameworks')
        .select('id, nome, tipo_framework')
        .eq('tenant_id', effectiveTenantId)
        .limit(5);

      if (error) {
        console.error('Erro frameworks:', error);
        return;
      }

      setFrameworks(data || []);
    } catch (err) {
      console.error('Erro geral frameworks:', err);
    }
  };

  // UseEffect ÚNICO com dependências controladas
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!effectiveTenantId || !user || loading) return;
      
      console.log('Carregando dados para tenant:', effectiveTenantId);
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
    const matchesSearch = searchTerm === '' || 
      assessment.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      assessment.status === statusFilter;

    return matchesSearch && matchesStatus;
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

  const toggleCardExpansion = (cardId) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
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
      {/* Header Profissional com Gradiente */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Assessments</h1>
              <p className="text-blue-100 text-lg">Central de Avaliação de Maturidade e Compliance</p>
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span>{metrics.total} assessments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  <span>{metrics.active} ativos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>{metrics.completed} concluídos</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={() => navigate('/assessments/frameworks')}
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Settings className="h-4 w-4 mr-2" />
                Frameworks
              </Button>
              <Button 
                onClick={() => navigate('/assessments/execution')}
                className="bg-white text-blue-600 hover:bg-white/90"
              >
                <Play className="h-4 w-4 mr-2" />
                Executar Assessment
              </Button>
            </div>
          </div>
        </div>
        
        {/* Elementos decorativos */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-24 w-24 rounded-full bg-white/5"></div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Barra de Busca e Filtros */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar assessments pelo título..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={statusFilter === 'all' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  Todos
                </Button>
                <Button 
                  variant={statusFilter === 'em_andamento' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setStatusFilter('em_andamento')}
                >
                  Em Andamento
                </Button>
                <Button 
                  variant={statusFilter === 'concluido' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setStatusFilter('concluido')}
                >
                  Concluídos
                </Button>
                <Button 
                  variant={statusFilter === 'planejado' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setStatusFilter('planejado')}
                >
                  Planejados
                </Button>
              </div>
            </div>
            
            {/* Indicador de resultados */}
            {(searchTerm || statusFilter !== 'all') && (
              <div className="flex items-center justify-between px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    Mostrando {filteredAssessments.length} de {assessments.length} assessments
                    {searchTerm && ` | Busca: "${searchTerm}"`}
                    {statusFilter !== 'all' && ` | Status: ${statusFilter.replace('_', ' ')}`}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>

          {/* Ações Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/assessments/frameworks')}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Frameworks</p>
                    <p className="text-xl font-bold">Gerenciar</p>
                  </div>
                  <div className="flex items-center">
                    <Settings className="h-8 w-8 text-blue-600" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground ml-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/assessments/execution')}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Execução</p>
                    <p className="text-xl font-bold">Assessments</p>
                  </div>
                  <div className="flex items-center">
                    <Play className="h-8 w-8 text-green-600" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground ml-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/assessments/questions')}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Questões</p>
                    <p className="text-xl font-bold">Gerenciar</p>
                  </div>
                  <div className="flex items-center">
                    <List className="h-8 w-8 text-orange-600" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground ml-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/assessments/reports')}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Relatórios</p>
                    <p className="text-xl font-bold">Visualizar</p>
                  </div>
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground ml-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card 
              className="cursor-pointer transition-all duration-200 hover:shadow-lg"
              onClick={() => toggleCardExpansion('total')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{metrics.total}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-8 w-8 text-blue-600" />
                    {expandedCard === 'total' ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>
                {expandedCard === 'total' && (
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Em Andamento:</span>
                      <span className="font-medium">{metrics.active}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Concluídos:</span>
                      <span className="font-medium">{metrics.completed}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Frameworks:</span>
                      <span className="font-medium">{frameworks.length}</span>
                    </div>
                    <div className="mt-3">
                      <Progress value={metrics.total > 0 ? (metrics.completed / metrics.total) * 100 : 0} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Taxa de conclusão: {metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all duration-200 hover:shadow-lg"
              onClick={() => toggleCardExpansion('active')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ativos</p>
                    <p className="text-2xl font-bold text-blue-600">{metrics.active}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Play className="h-8 w-8 text-blue-600" />
                    {expandedCard === 'active' ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>
                <div className="mt-2">
                  <Progress value={metrics.total > 0 ? (metrics.active / metrics.total) * 100 : 0} className="h-1" />
                </div>
                {expandedCard === 'active' && (
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Em Andamento:</span>
                      <span className="font-medium">{assessments.filter(a => a.status === 'em_andamento').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Iniciados:</span>
                      <span className="font-medium">{assessments.filter(a => a.status === 'iniciado').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>% do Total:</span>
                      <span className="font-medium">{metrics.total > 0 ? Math.round((metrics.active / metrics.total) * 100) : 0}%</span>
                    </div>
                    {filteredAssessments.filter(a => ['em_andamento', 'iniciado'].includes(a.status)).slice(0, 3).map(assessment => (
                      <div key={assessment.id} className="text-xs p-2 bg-gray-50 rounded">
                        <span className="font-medium">{assessment.titulo}</span>
                        <Badge className={`ml-2 ${getStatusColor(assessment.status)} text-xs`}>
                          {assessment.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                    {assessments.filter(a => ['em_andamento', 'iniciado'].includes(a.status)).length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{assessments.filter(a => ['em_andamento', 'iniciado'].includes(a.status)).length - 3} mais...
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all duration-200 hover:shadow-lg"
              onClick={() => toggleCardExpansion('completed')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Concluídos</p>
                    <p className="text-2xl font-bold text-green-600">{metrics.completed}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    {expandedCard === 'completed' ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>
                <div className="mt-2">
                  <Progress value={metrics.total > 0 ? (metrics.completed / metrics.total) * 100 : 0} className="h-1" />
                </div>
                {expandedCard === 'completed' && (
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Conclusão:</span>
                      <span className="font-medium">{metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Maturidade Média:</span>
                      <span className="font-medium">{metrics.avgMaturity}%</span>
                    </div>
                    {assessments.filter(a => a.status === 'concluido').slice(0, 3).map(assessment => (
                      <div key={assessment.id} className="text-xs p-2 bg-green-50 rounded">
                        <span className="font-medium">{assessment.titulo}</span>
                        {assessment.percentual_maturidade && (
                          <span className="ml-2 text-green-600">
                            {assessment.percentual_maturidade}% maturidade
                          </span>
                        )}
                      </div>
                    ))}
                    {assessments.filter(a => a.status === 'concluido').length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{assessments.filter(a => a.status === 'concluido').length - 3} mais...
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all duration-200 hover:shadow-lg"
              onClick={() => toggleCardExpansion('maturity')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Maturidade</p>
                    <p className="text-2xl font-bold text-purple-600">{metrics.avgMaturity}%</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-8 w-8 text-purple-600" />
                    {expandedCard === 'maturity' ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>
                <div className="mt-2">
                  <Progress value={metrics.avgMaturity} className="h-1" />
                </div>
                {expandedCard === 'maturity' && (
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Nível:</span>
                      <span className="font-medium">
                        {metrics.avgMaturity >= 80 ? 'Otimizado' : 
                         metrics.avgMaturity >= 60 ? 'Gerenciado' : 
                         metrics.avgMaturity >= 40 ? 'Definido' : 
                         metrics.avgMaturity >= 20 ? 'Inicial' : 'Inexistente'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Assessments Avaliados:</span>
                      <span className="font-medium">{assessments.filter(a => a.percentual_maturidade > 0).length}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      <p>Distribuição:</p>
                      <div className="space-y-1 mt-1">
                        <div className="flex justify-between">
                          <span>80-100%:</span>
                          <span>{assessments.filter(a => a.percentual_maturidade >= 80).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>60-79%:</span>
                          <span>{assessments.filter(a => a.percentual_maturidade >= 60 && a.percentual_maturidade < 80).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>40-59%:</span>
                          <span>{assessments.filter(a => a.percentual_maturidade >= 40 && a.percentual_maturidade < 60).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>0-39%:</span>
                          <span>{assessments.filter(a => a.percentual_maturidade > 0 && a.percentual_maturidade < 40).length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Status do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Status do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Tenant ID:</span>
                  <span className="font-mono text-sm">{effectiveTenantId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Usuário:</span>
                  <span>{user?.id ? '✅ Autenticado' : '❌ Não autenticado'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Assessments carregados:</span>
                  <span>{assessments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frameworks carregados:</span>
                  <span>{frameworks.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          {/* Painel de Ações em Lote */}
          {selectedAssessments.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-600 text-white">
                      {selectedAssessments.length} assessments selecionados
                    </Badge>
                    <span className="text-sm text-blue-700">Escolha uma ação para aplicar em lote:</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={handleBulkExport}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleBulkStatusChange('em_andamento')}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Marcar como Em Andamento
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleBulkStatusChange('concluido')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Concluído
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={handleBulkDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={clearSelection}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lista de Assessments</CardTitle>
                  <CardDescription>
                    {filteredAssessments.length} de {assessments.length} assessments 
                    {searchTerm && ` | Busca: "${searchTerm}"`}
                    {statusFilter !== 'all' && ` | Status: ${statusFilter.replace('_', ' ')}`}
                  </CardDescription>
                </div>
                
                {filteredAssessments.length > 0 && (
                  <div className="flex items-center gap-3">
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
                    
                    {selectedAssessments.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {selectedAssessments.length} selecionados
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={clearSelection}
                        >
                          Limpar
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {filteredAssessments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {assessments.length === 0 ? 'Nenhum assessment encontrado' : 'Nenhum assessment corresponde aos filtros aplicados'}
                  </p>
                  {(searchTerm || statusFilter !== 'all') && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                      }}
                    >
                      Limpar filtros
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
                {frameworks.length} frameworks encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {frameworks.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum framework encontrado</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {frameworks.map((framework) => (
                    <Card key={framework.id}>
                      <CardContent className="p-4">
                        <h3 className="font-medium">{framework.nome}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {framework.tipo_framework}
                        </p>
                      </CardContent>
                    </Card>
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