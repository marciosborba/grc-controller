import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play,
  Eye,
  Edit,
  Calendar,
  Users,
  Search,
  Filter,
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useTenantSelector } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';

interface Assessment {
  id: string;
  codigo: string;
  titulo: string;
  descricao?: string;
  status: string;
  percentual_conclusao: number;
  percentual_maturidade?: number;
  data_inicio?: string;
  data_fim_planejada?: string;
  framework?: {
    id: string;
    nome: string;
    tipo_framework: string;
  };
  responsavel_profile?: {
    id: string;
    full_name: string;
  };
  created_at: string;
}

export default function AssessmentsListWorking() {
  const { user } = useAuth();
  const { selectedTenantId } = useTenantSelector();
  
  // Para super usuários, usar selectedTenantId do seletor
  // Para usuários normais, usar tenantId do perfil
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [frameworkFilter, setFrameworkFilter] = useState('all');

  useEffect(() => {
    // Timeout para evitar carregamento infinito
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Timeout: Parando carregamento após 5 segundos');
        setLoading(false);
      }
    }, 5000);

    if (effectiveTenantId) {
      loadAssessments();
    } else {
      // Se não há tenant ID, para o loading após um tempo
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }

    return () => clearTimeout(timeout);
  }, [effectiveTenantId]);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      console.log('Carregando assessments para tenant:', effectiveTenantId);

      const { data, error } = await supabase
        .from('assessments')
        .select(`
          *,
          framework:assessment_frameworks(id, nome, tipo_framework),
          responsavel_profile:profiles!assessments_responsavel_assessment_fkey(id, full_name)
        `)
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro na query:', error);
        throw error;
      }

      console.log('Assessments carregados:', data);
      setAssessments(data || []);
    } catch (error) {
      console.error('Erro ao carregar assessments:', error);
      toast.error('Erro ao carregar assessments');
      setAssessments([]); // Define array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'planejado': { label: 'Planejado', color: 'bg-blue-100 text-blue-800' },
      'iniciado': { label: 'Iniciado', color: 'bg-yellow-100 text-yellow-800' },
      'em_andamento': { label: 'Em Andamento', color: 'bg-orange-100 text-orange-800' },
      'em_revisao': { label: 'Em Revisão', color: 'bg-purple-100 text-purple-800' },
      'aguardando_aprovacao': { label: 'Aguardando Aprovação', color: 'bg-indigo-100 text-indigo-800' },
      'concluido': { label: 'Concluído', color: 'bg-green-100 text-green-800' },
      'cancelado': { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
      'suspenso': { label: 'Suspenso', color: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planejado;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'em_andamento':
      case 'iniciado':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'em_revisao':
      case 'aguardando_aprovacao':
        return <Eye className="h-4 w-4 text-purple-600" />;
      case 'cancelado':
      case 'suspenso':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-blue-600" />;
    }
  };

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = !searchTerm || 
      assessment.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.framework?.nome.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter;
    
    const matchesFramework = frameworkFilter === 'all' || 
      assessment.framework?.tipo_framework === frameworkFilter;

    return matchesSearch && matchesStatus && matchesFramework;
  });

  const uniqueFrameworks = Array.from(
    new Set(assessments.map(a => a.framework?.tipo_framework).filter(Boolean))
  );

  const uniqueStatuses = Array.from(
    new Set(assessments.map(a => a.status))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4">Carregando assessments...</p>
        <div className="ml-4 text-sm text-muted-foreground">
          {effectiveTenantId ? `Tenant: ${effectiveTenantId}` : 'Aguardando tenant...'}
        </div>
      </div>
    );
  }

  // Se não há tenant ID, mostra mensagem específica
  if (!effectiveTenantId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/assessments')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="border-l border-muted-foreground/20 pl-4">
            <h1 className="text-2xl font-bold">Lista de Assessments</h1>
          </div>
        </div>
        
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Tenant não identificado</h3>
            <p className="text-muted-foreground mb-4">
              Não foi possível identificar o tenant atual. Verifique se você está logado corretamente.
            </p>
            <Button onClick={() => window.location.reload()}>
              Recarregar Página
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/assessments')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="border-l border-muted-foreground/20 pl-4">
            <h1 className="text-2xl font-bold">Lista de Assessments</h1>
            <p className="text-muted-foreground">
              Selecione um assessment para executar ou visualizar
            </p>
          </div>
        </div>
        <Button onClick={() => navigate('/assessments/execution')}>
          <Play className="h-4 w-4 mr-2" />
          Novo Assessment
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {uniqueStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os frameworks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os frameworks</SelectItem>
                {uniqueFrameworks.map((framework) => (
                  <SelectItem key={framework} value={framework}>
                    {framework}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setFrameworkFilter('all');
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Assessments */}
      {filteredAssessments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Nenhum assessment encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' || frameworkFilter !== 'all'
                ? 'Tente ajustar os filtros de pesquisa'
                : 'Comece criando seu primeiro assessment'
              }
            </p>
            <Button onClick={() => navigate('/assessments/execution')}>
              <Play className="h-4 w-4 mr-2" />
              Novo Assessment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAssessments.map((assessment) => (
            <Card key={assessment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(assessment.status)}
                      <h3 className="text-lg font-semibold">{assessment.titulo}</h3>
                      {getStatusBadge(assessment.status)}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {assessment.codigo} • {assessment.framework?.nome}
                    </p>
                    
                    {assessment.descricao && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {assessment.descricao}
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Progresso</span>
                          <span>{assessment.percentual_conclusao}%</span>
                        </div>
                        <Progress value={assessment.percentual_conclusao} className="h-2" />
                      </div>
                      
                      {assessment.percentual_maturidade !== null && (
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Maturidade</span>
                            <span>{assessment.percentual_maturidade}%</span>
                          </div>
                          <Progress value={assessment.percentual_maturidade} className="h-2" />
                        </div>
                      )}

                      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        {assessment.responsavel_profile && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{assessment.responsavel_profile.full_name}</span>
                          </div>
                        )}
                        {assessment.data_fim_planejada && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Prazo: {new Date(assessment.data_fim_planejada).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => navigate(`/assessments/execution/${assessment.id}`)}
                      disabled={assessment.status === 'concluido' || assessment.status === 'cancelado'}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      {assessment.status === 'concluido' ? 'Visualizar' : 'Executar'}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/assessments/reports?assessment=${assessment.id}`)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Relatório
                    </Button>
                    
                    {assessment.status !== 'concluido' && assessment.status !== 'cancelado' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/assessments/edit/${assessment.id}`)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{assessments.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {assessments.filter(a => ['em_andamento', 'iniciado'].includes(a.status)).length}
              </p>
              <p className="text-sm text-muted-foreground">Em Andamento</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {assessments.filter(a => a.status === 'concluido').length}
              </p>
              <p className="text-sm text-muted-foreground">Concluídos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(
                  assessments.reduce((sum, a) => sum + (a.percentual_maturidade || 0), 0) / 
                  (assessments.length || 1)
                )}%
              </p>
              <p className="text-sm text-muted-foreground">Maturidade Média</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}