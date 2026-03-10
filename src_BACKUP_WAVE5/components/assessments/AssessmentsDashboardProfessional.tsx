import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar,
  FileText,
  BarChart3,
  Target,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Plus,
  Filter,
  ArrowRight,
  Eye,
  Edit,
  Trash2,
  Download,
  Settings,
  Play,
  Activity,
  Award,
  BookOpen,
  RefreshCw,
  List
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';

// Types
interface Assessment {
  id: string;
  titulo: string;
  status: string;
  percentual_conclusao: number;
  percentual_maturidade?: number;
  framework_id: string;
  responsavel_assessment?: string;
  data_inicio?: string;
  data_fim_planejada?: string;
  created_at: string;
}

interface Framework {
  id: string;
  nome: string;
  tipo_framework: string;
}

interface Metrics {
  total: number;
  active: number;
  completed: number;
  avgMaturity: number;
}

// Views
export type ViewMode = 'dashboard' | 'table' | 'kanban' | 'calendar' | 'analytics' | 'reports';

export default function AssessmentsDashboard() {
  const { user, effectiveTenantId } = useAuth();
  const navigate = useNavigate();
  
  // Estados principais
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados de dados
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFramework, setSelectedFramework] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // ✅ CORRIGIDO: Carregar dados sem conflitos
  const loadData = async () => {
    if (!effectiveTenantId) return;
    
    try {
      setLoading(true);
      setError('');

      // Carregar assessments e frameworks em paralelo
      const [assessmentsResult, frameworksResult] = await Promise.all([
        supabase
          .from('assessments')
          .select('id, titulo, status, percentual_conclusao, percentual_maturidade, framework_id, responsavel_assessment, data_inicio, data_fim_planejada, created_at')
          .eq('tenant_id', effectiveTenantId)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('assessment_frameworks')
          .select('id, nome, tipo_framework')
          .eq('tenant_id', effectiveTenantId)
          .eq('status', 'ativo')
          .order('nome', { ascending: true })
      ]);

      if (assessmentsResult.error) {
        console.error('Erro ao carregar assessments:', assessmentsResult.error);
        setError('Erro ao carregar assessments');
      } else {
        setAssessments(assessmentsResult.data || []);
      }

      if (frameworksResult.error) {
        console.error('Erro ao carregar frameworks:', frameworksResult.error);
      } else {
        setFrameworks(frameworksResult.data || []);
      }

    } catch (err) {
      console.error('Erro geral:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORRIGIDO: useEffect seguro
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!effectiveTenantId || !user) return;
      
      await loadData();
    };

    if (isMounted) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [effectiveTenantId, user?.id]); // Dependências específicas

  // ✅ CORRIGIDO: Métricas calculadas após dados carregados
  const metrics: Metrics = useMemo(() => {
    return {
      total: assessments.length,
      active: assessments.filter(a => ['em_andamento', 'iniciado'].includes(a.status)).length,
      completed: assessments.filter(a => a.status === 'concluido').length,
      avgMaturity: assessments.length > 0 
        ? Math.round(assessments.reduce((sum, a) => sum + (a.percentual_maturidade || 0), 0) / assessments.length)
        : 0
    };
  }, [assessments]);

  // Filtros aplicados
  const filteredAssessments = useMemo(() => {
    return assessments.filter(assessment => {
      const matchesSearch = searchTerm === '' || 
        assessment.titulo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFramework = selectedFramework === 'all' || 
        assessment.framework_id === selectedFramework;
      
      const matchesStatus = selectedStatus === 'all' || 
        assessment.status === selectedStatus;

      return matchesSearch && matchesFramework && matchesStatus;
    });
  }, [assessments, searchTerm, selectedFramework, selectedStatus]);

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    const colors = {
      'concluido': 'bg-green-100 text-green-800',
      'em_andamento': 'bg-blue-100 text-blue-800',
      'iniciado': 'bg-blue-100 text-blue-800',
      'planejado': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Loading state
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Assessments Profissional</h1>
          <p className="text-muted-foreground">Central Avançada de Avaliação de Maturidade e Compliance</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => navigate('/assessments/frameworks')}>
            <Settings className="h-4 w-4 mr-2" />
            Frameworks
          </Button>
          <Button onClick={() => navigate('/assessments/execution')}>
            <Play className="h-4 w-4 mr-2" />
            Executar Assessment
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Views Selector */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="table">Tabela</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* Filtros avançados */}
        <div className="flex flex-col sm:flex-row gap-4 py-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={selectedFramework} onValueChange={setSelectedFramework}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Framework" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Frameworks</SelectItem>
              {frameworks.map((framework) => (
                <SelectItem key={framework.id} value={framework.id}>
                  {framework.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="planejado">Planejado</SelectItem>
              <SelectItem value="iniciado">Iniciado</SelectItem>
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={loadData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{metrics.total}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ativos</p>
                    <p className="text-2xl font-bold text-blue-600">{metrics.active}</p>
                  </div>
                  <Play className="h-8 w-8 text-blue-600" />
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
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Maturidade Média</p>
                    <p className="text-2xl font-bold text-purple-600">{metrics.avgMaturity}%</p>
                  </div>
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Assessments */}
          <Card>
            <CardHeader>
              <CardTitle>Assessments Recentes</CardTitle>
              <CardDescription>
                {filteredAssessments.length} de {assessments.length} assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAssessments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum assessment encontrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAssessments.slice(0, 10).map((assessment) => (
                    <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <h3 className="font-medium">{assessment.titulo}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(assessment.status)}>
                            {assessment.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {frameworks.find(f => f.id === assessment.framework_id)?.nome || 'Framework não encontrado'}
                          </span>
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
                      <div className="flex items-center gap-2 ml-4">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outras tabs podem ser implementadas aqui */}
        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Visão em Tabela</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Implementar tabela avançada...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kanban">
          <Card>
            <CardHeader>
              <CardTitle>Quadro Kanban</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Implementar quadro kanban...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendário de Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Implementar calendário...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Avançado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Implementar analytics...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Implementar relatórios...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}