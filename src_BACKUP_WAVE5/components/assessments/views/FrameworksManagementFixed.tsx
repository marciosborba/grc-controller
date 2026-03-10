import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  BookOpen,
  Shield,
  Award,
  Target,
  Settings,
  CheckCircle,
  AlertTriangle,
  Clock,
  Activity,
  FileText,
  Plus,
  Filter,
  Search,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  ChevronRight,
  TrendingUp,
  Users,
  BarChart3,
  Zap,
  Globe,
  Scale,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';

interface Framework {
  id: string;
  nome: string;
  versao: string;
  tipo_framework: string;
  categoria: string;
  descricao: string;
  status: string;
  created_at: string;
  updated_at: string;
  questionsCount?: number;
  domainsCount?: number;
}

interface FrameworkMetrics {
  totalFrameworks: number;
  activeFrameworks: number;
  inactiveFrameworks: number;
  totalDomains: number;
  totalQuestions: number;
  frameworkTypes: { [key: string]: number };
  frameworkCategories: { [key: string]: number };
}

interface NewFramework {
  nome: string;
  versao: string;
  tipo_framework: string;
  categoria: string;
  descricao: string;
}

export default function FrameworksManagementFixed() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const effectiveTenantId = useCurrentTenantId();
  
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [metrics, setMetrics] = useState<FrameworkMetrics>({
    totalFrameworks: 0,
    activeFrameworks: 0,
    inactiveFrameworks: 0,
    totalDomains: 0,
    totalQuestions: 0,
    frameworkTypes: {},
    frameworkCategories: {}
  });
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newFramework, setNewFramework] = useState<NewFramework>({
    nome: '',
    versao: '1.0',
    tipo_framework: '',
    categoria: '',
    descricao: ''
  });

  useEffect(() => {
    if (effectiveTenantId && user) {
      loadFrameworks();
    }
  }, [effectiveTenantId, user]);

  const loadFrameworks = async () => {
    try {
      setLoading(true);
      setError('');

      // Carregar frameworks
      const { data: frameworksData, error: frameworksError } = await supabase
        .from('assessment_frameworks')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .order('nome');

      if (frameworksError) {
        console.error('Erro ao carregar frameworks:', frameworksError);
        setError('Erro ao carregar frameworks');
        return;
      }

      // Carregar contagem de questões para cada framework
      const frameworksWithCounts = await Promise.all(
        (frameworksData || []).map(async (framework) => {
          const { data: questionsData, error: questionsError } = await supabase
            .from('assessment_questions')
            .select('id, dominio')
            .eq('framework_id', framework.id)
            .eq('tenant_id', effectiveTenantId);

          if (questionsError) {
            console.error('Erro ao carregar questões:', questionsError);
            return {
              ...framework,
              questionsCount: 0,
              domainsCount: 0
            };
          }

          const questionsCount = questionsData?.length || 0;
          const domains = [...new Set(questionsData?.map(q => q.dominio).filter(Boolean))];
          const domainsCount = domains.length;

          return {
            ...framework,
            questionsCount,
            domainsCount
          };
        })
      );

      setFrameworks(frameworksWithCounts);
      calculateMetrics(frameworksWithCounts);
    } catch (error) {
      console.error('Erro geral ao carregar frameworks:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (frameworksData: Framework[]) => {
    const totalFrameworks = frameworksData.length;
    const activeFrameworks = frameworksData.filter(f => f.status === 'ativo').length;
    const inactiveFrameworks = frameworksData.filter(f => f.status === 'inativo').length;
    const totalQuestions = frameworksData.reduce((sum, f) => sum + (f.questionsCount || 0), 0);
    const totalDomains = frameworksData.reduce((sum, f) => sum + (f.domainsCount || 0), 0);

    const frameworkTypes: { [key: string]: number } = {};
    const frameworkCategories: { [key: string]: number } = {};

    frameworksData.forEach(framework => {
      if (framework.tipo_framework) {
        frameworkTypes[framework.tipo_framework] = (frameworkTypes[framework.tipo_framework] || 0) + 1;
      }
      if (framework.categoria) {
        frameworkCategories[framework.categoria] = (frameworkCategories[framework.categoria] || 0) + 1;
      }
    });

    setMetrics({
      totalFrameworks,
      activeFrameworks,
      inactiveFrameworks,
      totalDomains,
      totalQuestions,
      frameworkTypes,
      frameworkCategories
    });
  };

  const handleCreateFramework = async () => {
    if (!effectiveTenantId || !user) {
      toast.error('Dados de autenticação não disponíveis');
      return;
    }

    if (!newFramework.nome.trim()) {
      toast.error('Nome do framework é obrigatório');
      return;
    }

    if (!newFramework.tipo_framework.trim()) {
      toast.error('Tipo do framework é obrigatório');
      return;
    }

    setIsCreating(true);

    try {
      const { data, error } = await supabase
        .from('assessment_frameworks')
        .insert([
          {
            tenant_id: effectiveTenantId,
            nome: newFramework.nome,
            versao: newFramework.versao,
            tipo_framework: newFramework.tipo_framework,
            categoria: newFramework.categoria,
            descricao: newFramework.descricao,
            status: 'ativo',
            created_by: user.id,
            updated_by: user.id
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar framework:', error);
        toast.error('Erro ao criar framework: ' + error.message);
        return;
      }

      toast.success('Framework criado com sucesso!');
      setIsCreateModalOpen(false);
      setNewFramework({
        nome: '',
        versao: '1.0',
        tipo_framework: '',
        categoria: '',
        descricao: ''
      });
      await loadFrameworks();
    } catch (error) {
      console.error('Erro ao criar framework:', error);
      toast.error('Erro ao criar framework');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteFramework = async (frameworkId: string) => {
    if (!confirm('Tem certeza que deseja excluir este framework? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('assessment_frameworks')
        .update({ status: 'inativo' })
        .eq('id', frameworkId)
        .eq('tenant_id', effectiveTenantId);

      if (error) {
        console.error('Erro ao excluir framework:', error);
        toast.error('Erro ao excluir framework');
        return;
      }

      toast.success('Framework excluído com sucesso!');
      await loadFrameworks();
    } catch (error) {
      console.error('Erro ao excluir framework:', error);
      toast.error('Erro ao excluir framework');
    }
  };

  const handleEditFramework = (framework: Framework) => {
    navigate(`/assessments/questions?framework=${framework.id}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando frameworks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
            <h1 className="text-3xl font-bold">Gestão de Frameworks</h1>
            <p className="text-muted-foreground">Central de Frameworks de Compliance e Maturidade</p>
          </div>
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
            Novo Framework
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

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Frameworks</p>
                <p className="text-2xl font-bold">{metrics.totalFrameworks}</p>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  {metrics.activeFrameworks} ativos
                </p>
              </div>
              <BookOpen className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Frameworks Ativos</p>
                <p className="text-2xl font-bold text-green-600">{metrics.activeFrameworks}</p>
              </div>
              <Shield className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Questões</p>
                <p className="text-2xl font-bold">{metrics.totalQuestions}</p>
              </div>
              <FileText className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Domínios</p>
                <p className="text-2xl font-bold">{metrics.totalDomains}</p>
              </div>
              <Activity className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="frameworks">Meus Frameworks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Framework</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(metrics.frameworkTypes).length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum framework cadastrado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(metrics.frameworkTypes).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{type}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Categorias</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(metrics.frameworkCategories).length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma categoria definida</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(metrics.frameworkCategories).map(([category, count]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-sm">{category}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="frameworks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frameworks Cadastrados</CardTitle>
              <CardDescription>
                {metrics.totalFrameworks} frameworks na sua organização
              </CardDescription>
            </CardHeader>
            <CardContent>
              {frameworks.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum framework cadastrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Comece criando seu primeiro framework de compliance
                  </p>
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Framework
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {frameworks.map((framework) => (
                    <Card key={framework.id} className="hover:shadow-lg transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{framework.nome}</h3>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">v{framework.versao}</Badge>
                              <Badge className="capitalize">{framework.tipo_framework}</Badge>
                              <Badge 
                                variant={framework.status === 'ativo' ? 'default' : 'secondary'}
                                className={framework.status === 'ativo' ? 'bg-green-100 text-green-800' : ''}
                              >
                                {framework.status}
                              </Badge>
                            </div>
                            {framework.categoria && (
                              <p className="text-sm text-muted-foreground mb-2">{framework.categoria}</p>
                            )}
                            <p className="text-sm text-muted-foreground">{framework.descricao}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div className="text-center">
                            <p className="font-semibold text-blue-600">{framework.domainsCount || 0}</p>
                            <p className="text-muted-foreground">Domínios</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-purple-600">{framework.questionsCount || 0}</p>
                            <p className="text-muted-foreground">Questões</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleEditFramework(framework)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteFramework(framework.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Analytics em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              Dashboards avançados e relatórios analíticos serão implementados em breve.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Criação */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Framework</DialogTitle>
            <DialogDescription>
              Configure um novo framework de compliance para sua organização
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Framework *</Label>
              <Input
                id="nome"
                value={newFramework.nome}
                onChange={(e) => setNewFramework(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: ISO 27001, LGPD, SOX..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="versao">Versão</Label>
                <Input
                  id="versao"
                  value={newFramework.versao}
                  onChange={(e) => setNewFramework(prev => ({ ...prev, versao: e.target.value }))}
                  placeholder="1.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select 
                  value={newFramework.tipo_framework}
                  onValueChange={(value) => setNewFramework(prev => ({ ...prev, tipo_framework: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="security">Segurança</SelectItem>
                    <SelectItem value="governance">Governança</SelectItem>
                    <SelectItem value="privacy">Privacidade</SelectItem>
                    <SelectItem value="financial">Financeiro</SelectItem>
                    <SelectItem value="operational">Operacional</SelectItem>
                    <SelectItem value="custom">Customizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select 
                value={newFramework.categoria}
                onValueChange={(value) => setNewFramework(prev => ({ ...prev, categoria: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Regulatório">Regulatório</SelectItem>
                  <SelectItem value="Normativo">Normativo</SelectItem>
                  <SelectItem value="Boas Práticas">Boas Práticas</SelectItem>
                  <SelectItem value="Interno">Interno</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={newFramework.descricao}
                onChange={(e) => setNewFramework(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva o objetivo e escopo deste framework..."
                rows={3}
              />
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
              onClick={handleCreateFramework}
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
                  Criar Framework
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}