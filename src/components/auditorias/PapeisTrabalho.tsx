import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText,
  Folder,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  Link,
  Tag,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface WorkingPaper {
  id: string;
  projeto_id: string;
  projeto_titulo: string;
  titulo: string;
  descricao: string;
  tipo: 'checklist' | 'evidencia' | 'teste' | 'apontamento' | 'relatorio' | 'outro';
  categoria: string;
  status: 'rascunho' | 'em_revisao' | 'aprovado' | 'finalizado';
  auditor_responsavel: string;
  revisor?: string;
  data_criacao: string;
  data_ultima_revisao?: string;
  versao: string;
  arquivo_url?: string;
  tamanho_arquivo?: number;
  formato_arquivo?: string;
  tags: string[];
  referencias_cruzadas: string[];
  nivel_confidencialidade: 'publico' | 'interno' | 'confidencial' | 'restrito';
}

interface PaperTemplate {
  id: string;
  nome: string;
  tipo: string;
  descricao: string;
  versao: string;
  usado_em: number;
  data_atualizacao: string;
}

export function PapeisTrabalho() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workingPapers, setWorkingPapers] = useState<WorkingPaper[]>([]);
  const [templates, setTemplates] = useState<PaperTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('papers');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');

  useEffect(() => {
    loadWorkingPapersData();
  }, []);

  const loadWorkingPapersData = async () => {
    try {
      setLoading(true);
      
      // Carregar papéis de trabalho
      const { data: papersData, error: papersError } = await supabase
        .from('papeis_trabalho')
        .select(`
          *,
          projetos_auditoria!inner(titulo)
        `)
        .eq('tenant_id', user?.tenant?.id)
        .order('data_criacao', { ascending: false });

      if (papersError) {
        console.error('Erro ao carregar papéis de trabalho:', papersError);
      } else {
        const mappedPapers = papersData?.map(paper => ({
          id: paper.id,
          projeto_id: paper.projeto_id || '',
          projeto_titulo: paper.projetos_auditoria?.titulo || 'Projeto não definido',
          titulo: paper.titulo || 'Documento sem título',
          descricao: paper.descricao || '',
          tipo: paper.tipo || 'outro',
          categoria: paper.categoria || 'Geral',
          status: paper.status || 'rascunho',
          auditor_responsavel: paper.auditor_responsavel || 'Não definido',
          revisor: paper.revisor,
          data_criacao: paper.data_criacao || '',
          data_ultima_revisao: paper.data_ultima_revisao,
          versao: paper.versao || '1.0',
          arquivo_url: paper.arquivo_url,
          tamanho_arquivo: paper.tamanho_arquivo,
          formato_arquivo: paper.formato_arquivo,
          tags: paper.tags || [],
          referencias_cruzadas: paper.referencias_cruzadas || [],
          nivel_confidencialidade: paper.nivel_confidencialidade || 'interno'
        })) || [];
        setWorkingPapers(mappedPapers);
      }

      // Carregar templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('templates_papeis_trabalho')
        .select('*')
        .eq('tenant_id', user?.tenant?.id)
        .eq('ativo', true)
        .order('nome', { ascending: true });

      if (templatesError) {
        console.error('Erro ao carregar templates:', templatesError);
      } else {
        const mappedTemplates = templatesData?.map(template => ({
          id: template.id,
          nome: template.nome || 'Template',
          tipo: template.tipo || 'Geral',
          descricao: template.descricao || '',
          versao: template.versao || '1.0',
          usado_em: template.uso_count || 0,
          data_atualizacao: template.updated_at || ''
        })) || [];
        setTemplates(mappedTemplates);
      }

    } catch (error) {
      console.error('Erro ao carregar papéis de trabalho:', error);
      toast.error('Erro ao carregar papéis de trabalho');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finalizado': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'aprovado': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'em_revisao': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rascunho': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'checklist': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'evidencia': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'teste': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'apontamento': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'relatorio': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getConfidentialityIcon = (level: string) => {
    switch (level) {
      case 'restrito': return '🔒';
      case 'confidencial': return '⚠️';
      case 'interno': return '🏢';
      default: return '📋';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredPapers = workingPapers.filter(paper => {
    const matchesSearch = paper.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paper.projeto_titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paper.auditor_responsavel.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'todos' || paper.tipo === filterType;
    const matchesStatus = filterStatus === 'todos' || paper.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const calculateMetrics = () => {
    const totalPapers = workingPapers.length;
    const draftPapers = workingPapers.filter(p => p.status === 'rascunho').length;
    const reviewPapers = workingPapers.filter(p => p.status === 'em_revisao').length;
    const approvedPapers = workingPapers.filter(p => p.status === 'aprovado').length;
    const finalizedPapers = workingPapers.filter(p => p.status === 'finalizado').length;
    
    return {
      totalPapers,
      draftPapers,
      reviewPapers,
      approvedPapers,
      finalizedPapers,
      completionRate: totalPapers > 0 ? Math.round((finalizedPapers / totalPapers) * 100) : 0
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
    <div className="space-y-6 p-6">
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
            <h1 className="text-2xl sm:text-3xl font-bold">Papéis de Trabalho</h1>
            <p className="text-muted-foreground">Documentação digital de evidências e procedimentos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Documento
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
                <p className="text-2xl font-bold">{metrics.totalPapers}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rascunhos</p>
                <p className="text-2xl font-bold text-gray-600">{metrics.draftPapers}</p>
              </div>
              <Edit className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Revisão</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.reviewPapers}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprovados</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.approvedPapers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Finalizados</p>
                <p className="text-2xl font-bold text-green-600">{metrics.finalizedPapers}</p>
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
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="papers">Papéis de Trabalho</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="papers" className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar documentos..."
                className="pl-9 pr-4 py-2 border rounded-md w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="todos">Todos os tipos</option>
              <option value="checklist">Checklist</option>
              <option value="evidencia">Evidência</option>
              <option value="teste">Teste</option>
              <option value="apontamento">Apontamento</option>
              <option value="relatorio">Relatório</option>
            </select>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="todos">Todos os status</option>
              <option value="rascunho">Rascunho</option>
              <option value="em_revisao">Em Revisão</option>
              <option value="aprovado">Aprovado</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>

          {/* Lista de Papéis */}
          <div className="space-y-3">
            {filteredPapers.map(paper => (
              <Card key={paper.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getConfidentialityIcon(paper.nivel_confidencialidade)}</span>
                        <h3 className="font-medium">{paper.titulo}</h3>
                        <Badge className={getTypeColor(paper.tipo)}>
                          {paper.tipo}
                        </Badge>
                        <Badge className={getStatusColor(paper.status)}>
                          {paper.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">{paper.descricao}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Projeto: {paper.projeto_titulo}</span>
                        <span>•</span>
                        <span>Auditor: {paper.auditor_responsavel}</span>
                        <span>•</span>
                        <span>Versão: {paper.versao}</span>
                        <span>•</span>
                        <span>Criado: {new Date(paper.data_criacao).toLocaleDateString()}</span>
                        {paper.arquivo_url && (
                          <>
                            <span>•</span>
                            <span>{paper.formato_arquivo?.toUpperCase()} ({formatFileSize(paper.tamanho_arquivo)})</span>
                          </>
                        )}
                      </div>

                      {paper.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <Tag className="h-3 w-3" />
                          {paper.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {paper.referencias_cruzadas.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Link className="h-3 w-3" />
                          <span className="text-xs text-muted-foreground">
                            {paper.referencias_cruzadas.length} referências cruzadas
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {paper.arquivo_url && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredPapers.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum papel de trabalho encontrado</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterType !== 'todos' || filterStatus !== 'todos' 
                    ? 'Tente ajustar os filtros de busca' 
                    : 'Comece criando seu primeiro documento'
                  }
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{template.nome}</span>
                    <Badge variant="outline">{template.tipo}</Badge>
                  </CardTitle>
                  <CardDescription>{template.descricao}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Versão: {template.versao}</p>
                    <p>Usado em: {template.usado_em} projetos</p>
                    <p>Atualizado: {new Date(template.data_atualizacao).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Plus className="h-4 w-4 mr-1" />
                      Usar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {templates.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Folder className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum template disponível</h3>
                <p className="text-muted-foreground">Crie templates para agilizar a criação de documentos</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PapeisTrabalho;