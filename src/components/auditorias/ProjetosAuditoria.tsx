import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FolderOpen,
  Users,
  Calendar,
  BarChart3,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Plus,
  Filter,
  Search,
  Edit,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AuditProject {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'interna' | 'externa' | 'certificacao' | 'seguimento';
  status: 'planejado' | 'iniciado' | 'fieldwork' | 'relatorio' | 'concluido' | 'suspenso';
  auditor_lider: string;
  equipe_auditores: string[];
  data_inicio: string;
  data_fim_prevista: string;
  data_fim_real?: string;
  progresso_percentual: number;
  escopo: string;
  objetivos: string[];
  criterios_auditoria: string[];
  areas_auditadas: string[];
  total_apontamentos: number;
  apontamentos_criticos: number;
}

interface ProjectActivity {
  id: string;
  projeto_id: string;
  atividade: string;
  responsavel: string;
  data_atividade: string;
  tipo: 'inicio' | 'fieldwork' | 'apontamento' | 'relatorio' | 'finalizacao';
  descricao: string;
}

export function ProjetosAuditoria() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<AuditProject[]>([]);
  const [activities, setActivities] = useState<ProjectActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProjectsData();
  }, []);

  const loadProjectsData = async () => {
    try {
      setLoading(true);
      
      // Carregar projetos de auditoria
      const { data: projectsData, error: projectsError } = await supabase
        .from('projetos_auditoria')
        .select('*')
        .eq('tenant_id', user?.tenant?.id)
        .order('data_inicio', { ascending: false });

      if (projectsError) {
        console.error('Erro ao carregar projetos:', projectsError);
      } else {
        const mappedProjects = projectsData?.map(project => ({
          id: project.id,
          titulo: project.titulo || 'Projeto sem título',
          descricao: project.descricao || '',
          tipo: project.tipo || 'interna',
          status: project.status || 'planejado',
          auditor_lider: project.auditor_lider || 'Não definido',
          equipe_auditores: project.equipe_auditores || [],
          data_inicio: project.data_inicio || '',
          data_fim_prevista: project.data_fim_prevista || '',
          data_fim_real: project.data_fim_real,
          progresso_percentual: project.progresso_percentual || 0,
          escopo: project.escopo || '',
          objetivos: project.objetivos || [],
          criterios_auditoria: project.criterios_auditoria || [],
          areas_auditadas: project.areas_auditadas || [],
          total_apontamentos: project.total_apontamentos || 0,
          apontamentos_criticos: project.apontamentos_criticos || 0
        })) || [];
        setProjects(mappedProjects);
      }

      // Carregar atividades recentes
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('atividades_projeto_auditoria')
        .select('*')
        .eq('tenant_id', user?.tenant?.id)
        .order('data_atividade', { ascending: false })
        .limit(20);

      if (activitiesError) {
        console.error('Erro ao carregar atividades:', activitiesError);
      } else {
        const mappedActivities = activitiesData?.map(activity => ({
          id: activity.id,
          projeto_id: activity.projeto_id || '',
          atividade: activity.atividade || 'Atividade',
          responsavel: activity.responsavel || 'Não definido',
          data_atividade: activity.data_atividade || '',
          tipo: activity.tipo || 'inicio',
          descricao: activity.descricao || ''
        })) || [];
        setActivities(mappedActivities);
      }

    } catch (error) {
      console.error('Erro ao carregar dados dos projetos:', error);
      toast.error('Erro ao carregar dados dos projetos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'fieldwork': case 'relatorio': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'iniciado': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'planejado': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'suspenso': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'interna': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'externa': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'certificacao': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'seguimento': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'inicio': return <Calendar className="h-4 w-4" />;
      case 'fieldwork': return <Search className="h-4 w-4" />;
      case 'apontamento': return <AlertTriangle className="h-4 w-4" />;
      case 'relatorio': return <FileText className="h-4 w-4" />;
      case 'finalizacao': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.auditor_lider.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (selectedTab) {
      case 'active':
        return matchesSearch && !['concluido', 'suspenso'].includes(project.status);
      case 'completed':
        return matchesSearch && project.status === 'concluido';
      case 'all':
        return matchesSearch;
      default:
        return matchesSearch;
    }
  });

  const calculateMetrics = () => {
    const activeProjects = projects.filter(p => !['concluido', 'suspenso'].includes(p.status)).length;
    const completedProjects = projects.filter(p => p.status === 'concluido').length;
    const criticalFindings = projects.reduce((sum, p) => sum + p.apontamentos_criticos, 0);
    const totalFindings = projects.reduce((sum, p) => sum + p.total_apontamentos, 0);
    
    return {
      totalProjects: projects.length,
      activeProjects,
      completedProjects,
      criticalFindings,
      totalFindings,
      completionRate: projects.length > 0 ? Math.round((completedProjects / projects.length) * 100) : 0
    };
  };

  const metrics = calculateMetrics();

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
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/auditorias')}
            className="flex items-center gap-2 hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Projetos de Auditoria</h1>
            <p className="text-muted-foreground">Gestão e acompanhamento de projetos de auditoria</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar projetos..."
              className="pl-9 pr-4 py-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{metrics.totalProjects}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.activeProjects}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">{metrics.completedProjects}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa Conclusão</p>
                <p className="text-2xl font-bold">{metrics.completionRate}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Apontamentos</p>
                <p className="text-2xl font-bold">{metrics.totalFindings}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{metrics.criticalFindings}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projetos */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Ativos ({metrics.activeProjects})</TabsTrigger>
          <TabsTrigger value="completed">Concluídos ({metrics.completedProjects})</TabsTrigger>
          <TabsTrigger value="all">Todos ({metrics.totalProjects})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProjects.map(project => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{project.titulo}</CardTitle>
                      <CardDescription className="mt-1">{project.auditor_lider}</CardDescription>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className={getTypeColor(project.tipo)}>
                        {project.tipo}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm">
                    <p className="text-muted-foreground line-clamp-2">{project.descricao}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Início:</p>
                      <p>{project.data_inicio ? new Date(project.data_inicio).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Previsão:</p>
                      <p>{project.data_fim_prevista ? new Date(project.data_fim_prevista).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Apontamentos:</p>
                      <p className="flex items-center gap-1">
                        <span>{project.total_apontamentos}</span>
                        {project.apontamentos_criticos > 0 && (
                          <span className="text-red-600">({project.apontamentos_criticos} críticos)</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Equipe:</p>
                      <p>{project.equipe_auditores.length} auditores</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Progresso</span>
                      <span className="text-sm font-medium">{project.progresso_percentual}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all" 
                        style={{ width: `${project.progresso_percentual}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum projeto encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Tente ajustar os filtros de busca' : 'Comece criando seu primeiro projeto de auditoria'}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Atividades Recentes */}
      {activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Últimas movimentações nos projetos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities.slice(0, 8).map(activity => (
                <div key={activity.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.atividade}</p>
                    <p className="text-xs text-muted-foreground">{activity.descricao}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{activity.responsavel}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.data_atividade ? new Date(activity.data_atividade).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProjetosAuditoria;