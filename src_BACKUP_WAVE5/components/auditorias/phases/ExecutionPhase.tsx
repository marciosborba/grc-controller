import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  FileText, 
  Upload, 
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Edit,
  Eye,
  Trash2,
  Search,
  Filter,
  Calendar,
  User,
  Paperclip
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WorkPaper {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  tipo: 'teste_controle' | 'analise_substantiva' | 'revisao_analitica' | 'confirmacao' | 'observacao';
  status: 'pendente' | 'em_andamento' | 'revisao' | 'concluido';
  responsavel: string;
  data_inicio: string;
  data_conclusao?: string;
  horas_trabalhadas: number;
  evidencias: Evidence[];
  conclusoes: string;
  referencias: string[];
}

interface Evidence {
  id: string;
  nome: string;
  tipo: 'documento' | 'planilha' | 'screenshot' | 'video' | 'audio' | 'outro';
  tamanho: number;
  data_upload: string;
  url: string;
  descricao: string;
}

interface Test {
  id: string;
  nome: string;
  objetivo: string;
  procedimento: string;
  amostra: number;
  populacao: number;
  resultado: string;
  conclusao: string;
  status: 'pendente' | 'executado' | 'revisado';
}

interface ExecutionPhaseProps {
  project: any;
}

export function ExecutionPhase({ project }: ExecutionPhaseProps) {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

  const [workPapers, setWorkPapers] = useState<WorkPaper[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trabalhos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadExecutionData();
  }, [project.id]);

  const loadExecutionData = async () => {
    try {
      setLoading(true);
      
      // Carregar papéis de trabalho
      const { data: workPapersData, error: wpError } = await supabase
        .from('trabalhos_auditoria')
        .select(`
          *,
          evidencias_auditoria(*)
        `)
        .eq('projeto_id', project.id)
        .order('created_at', { ascending: false });

      if (wpError) throw wpError;

      // Carregar testes
      const { data: testsData, error: testsError } = await supabase
        .from('testes_auditoria')
        .select('*')
        .eq('projeto_id', project.id)
        .order('created_at', { ascending: false });

      if (testsError) throw testsError;

      setWorkPapers(workPapersData || []);
      setTests(testsData || []);

    } catch (error) {
      console.error('Erro ao carregar dados de execução:', error);
      toast.error('Erro ao carregar dados de execução');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pendente: 'bg-gray-100 text-gray-800',
      em_andamento: 'bg-blue-100 text-blue-800',
      revisao: 'bg-yellow-100 text-yellow-800',
      concluido: 'bg-green-100 text-green-800',
      executado: 'bg-green-100 text-green-800',
      revisado: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      teste_controle: CheckCircle,
      analise_substantiva: FileText,
      revisao_analitica: Search,
      confirmacao: AlertTriangle,
      observacao: Eye
    };
    return icons[type] || FileText;
  };

  const calculateCompleteness = () => {
    if (workPapers.length === 0) return 0;
    const completed = workPapers.filter(wp => wp.status === 'concluido').length;
    return Math.round((completed / workPapers.length) * 100);
  };

  const filteredWorkPapers = workPapers.filter(wp => {
    const matchesSearch = !searchTerm || 
      wp.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wp.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || wp.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const filteredTests = tests.filter(test => {
    const matchesSearch = !searchTerm || 
      test.nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || test.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const completeness = calculateCompleteness();

  return (
    <div className="space-y-6">
      {/* Header com Progresso */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Execução da Auditoria
              </CardTitle>
              <CardDescription>
                Trabalhos de campo, testes e coleta de evidências
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Completude</p>
                <p className="text-lg font-bold">{completeness}%</p>
              </div>
              <Progress value={completeness} className="w-24 h-3" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas de Execução */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Papéis de Trabalho</p>
                <p className="text-xl font-bold">{workPapers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-xl font-bold">{workPapers.filter(wp => wp.status === 'concluido').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-xl font-bold">{workPapers.filter(wp => wp.status === 'em_andamento').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Testes</p>
                <p className="text-xl font-bold">{tests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Controles */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar trabalhos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">Todos os Status</option>
                <option value="pendente">Pendente</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="revisao">Em Revisão</option>
                <option value="concluido">Concluído</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'trabalhos' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('trabalhos')}
              >
                Papéis de Trabalho
              </Button>
              <Button
                variant={activeTab === 'testes' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('testes')}
              >
                Testes
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo {activeTab === 'trabalhos' ? 'Trabalho' : 'Teste'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo das Abas */}
      {activeTab === 'trabalhos' && (
        <div className="space-y-4">
          {filteredWorkPapers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nenhum papel de trabalho encontrado</h3>
                <p className="text-muted-foreground">Crie seu primeiro papel de trabalho para começar a execução.</p>
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Papel de Trabalho
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredWorkPapers.map((workPaper) => {
                const TypeIcon = getTypeIcon(workPaper.tipo);
                return (
                  <Card key={workPaper.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <TypeIcon className="h-5 w-5 mt-1 text-blue-600" />
                          <div>
                            <CardTitle className="text-base">{workPaper.codigo}</CardTitle>
                            <CardDescription>{workPaper.titulo}</CardDescription>
                          </div>
                        </div>
                        <Badge className={getStatusColor(workPaper.status)}>
                          {workPaper.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {workPaper.descricao}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Responsável</p>
                            <p className="font-medium">{workPaper.responsavel}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Horas</p>
                            <p className="font-medium">{workPaper.horas_trabalhadas}h</p>
                          </div>
                        </div>
                        
                        {workPaper.evidencias && workPaper.evidencias.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {workPaper.evidencias.length} evidência(s)
                            </span>
                          </div>
                        )}
                        
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
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'testes' && (
        <div className="space-y-4">
          {filteredTests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nenhum teste encontrado</h3>
                <p className="text-muted-foreground">Crie seu primeiro teste de auditoria.</p>
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Teste
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredTests.map((test) => (
                <Card key={test.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{test.nome}</CardTitle>
                        <CardDescription>{test.objetivo}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(test.status)}>
                        {test.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">População</p>
                          <p className="font-medium">{test.populacao.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Amostra</p>
                          <p className="font-medium">{test.amostra.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Cobertura</p>
                          <p className="font-medium">
                            {Math.round((test.amostra / test.populacao) * 100)}%
                          </p>
                        </div>
                      </div>
                      
                      {test.resultado && (
                        <div>
                          <p className="text-sm text-muted-foreground">Resultado</p>
                          <p className="text-sm">{test.resultado}</p>
                        </div>
                      )}
                      
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalhes
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        {test.status === 'pendente' && (
                          <Button size="sm" className="flex-1">
                            <Play className="h-4 w-4 mr-1" />
                            Executar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ações */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className={`h-4 w-4 ${completeness >= 80 ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="text-sm text-muted-foreground">
                {completeness >= 80 ? 'Execução completa' : `${completeness}% completo - Complete pelo menos 80% para avançar`}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar Trabalhos
              </Button>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Importar Evidências
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Trabalho
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}