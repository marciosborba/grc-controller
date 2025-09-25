import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Shield,
  Plus,
  Edit,
  Trash2,
  FileText,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Globe,
  Building
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';

interface Framework {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  tipo: string;
  origem: string;
  versao: string;
  categoria: string;
  subcategoria: string;
  nivel_aplicabilidade: string;
  jurisdicao: string;
  escopo_aplicacao: string[];
  status: string;
  data_vigencia: string;
  data_atualizacao: string;
  url_referencia: string;
  tags: string[];
  totalRequirements: number;
  activeRequirements: number;
  conformityScore: number;
  lastAssessment: string;
  created_at: string;
  updated_at: string;
}

interface FrameworkFormData {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: string;
  origem: string;
  versao: string;
  categoria: string;
  subcategoria: string;
  nivel_aplicabilidade: string;
  jurisdicao: string;
  escopo_aplicacao: string[];
  data_vigencia: string;
  url_referencia: string;
  tags: string[];
}

const TIPOS_FRAMEWORK = [
  { value: 'regulatorio', label: 'Regulatório' },
  { value: 'normativo', label: 'Normativo' },
  { value: 'interno', label: 'Interno' },
  { value: 'setorial', label: 'Setorial' },
  { value: 'internacional', label: 'Internacional' }
];

const CATEGORIAS = [
  'Privacidade e Proteção de Dados',
  'Segurança da Informação',
  'Financeiro e Contábil',
  'Governança Corporativa',
  'Meio Ambiente',
  'Saúde e Segurança',
  'Trabalhista',
  'Tributário',
  'Concorrencial',
  'Operacional'
];

const NIVEIS_APLICABILIDADE = [
  { value: 'obrigatorio', label: 'Obrigatório' },
  { value: 'recomendado', label: 'Recomendado' },
  { value: 'opcional', label: 'Opcional' }
];

export function FrameworksManagement() {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
  
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFramework, setEditingFramework] = useState<Framework | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');

  const [formData, setFormData] = useState<FrameworkFormData>({
    codigo: '',
    nome: '',
    descricao: '',
    tipo: '',
    origem: '',
    versao: '1.0',
    categoria: '',
    subcategoria: '',
    nivel_aplicabilidade: '',
    jurisdicao: '',
    escopo_aplicacao: [],
    data_vigencia: '',
    url_referencia: '',
    tags: []
  });

  useEffect(() => {
    if (effectiveTenantId) {
      loadFrameworks();
    }
  }, [effectiveTenantId]);

  const loadFrameworks = async () => {
    try {
      setLoading(true);
      
      const { data: frameworksData, error } = await supabase
        .from('frameworks_compliance')
        .select(`
          *,
          requisitos_compliance(
            id,
            status
          )
        `)
        .eq('tenant_id', effectiveTenantId)
        .order('nome');

      if (error) throw error;

      const processedFrameworks = frameworksData?.map(framework => {
        const totalRequirements = framework.requisitos_compliance?.length || 0;
        const activeRequirements = framework.requisitos_compliance?.filter(r => r.status === 'ativo').length || 0;
        // Por enquanto score simulado - depois será calculado baseado em avaliações
        const conformityScore = totalRequirements > 0 ? Math.round(Math.random() * 40 + 60) : 0;
        
        return {
          ...framework,
          totalRequirements,
          activeRequirements,
          conformityScore,
          lastAssessment: '2025-09-01', // Simulado
          escopo_aplicacao: framework.escopo_aplicacao || [],
          tags: framework.tags || []
        };
      }) || [];

      setFrameworks(processedFrameworks);
    } catch (error) {
      console.error('Erro ao carregar frameworks:', error);
      toast.error('Erro ao carregar frameworks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        tenant_id: effectiveTenantId,
        status: 'ativo',
        created_by: user?.id,
        updated_by: user?.id
      };

      let error;
      if (editingFramework) {
        const { error: updateError } = await supabase
          .from('frameworks_compliance')
          .update(payload)
          .eq('id', editingFramework.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('frameworks_compliance')
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      toast.success(editingFramework ? 'Framework atualizado!' : 'Framework criado!');
      setDialogOpen(false);
      resetForm();
      loadFrameworks();
    } catch (error) {
      console.error('Erro ao salvar framework:', error);
      toast.error('Erro ao salvar framework');
    }
  };

  const handleEdit = (framework: Framework) => {
    setEditingFramework(framework);
    setFormData({
      codigo: framework.codigo,
      nome: framework.nome,
      descricao: framework.descricao,
      tipo: framework.tipo,
      origem: framework.origem,
      versao: framework.versao,
      categoria: framework.categoria,
      subcategoria: framework.subcategoria || '',
      nivel_aplicabilidade: framework.nivel_aplicabilidade,
      jurisdicao: framework.jurisdicao,
      escopo_aplicacao: framework.escopo_aplicacao,
      data_vigencia: framework.data_vigencia,
      url_referencia: framework.url_referencia || '',
      tags: framework.tags
    });
    setDialogOpen(true);
  };

  const handleDelete = async (framework: Framework) => {
    if (!confirm('Tem certeza que deseja excluir este framework?')) return;

    try {
      const { error } = await supabase
        .from('frameworks_compliance')
        .delete()
        .eq('id', framework.id);

      if (error) throw error;

      toast.success('Framework excluído!');
      loadFrameworks();
    } catch (error) {
      console.error('Erro ao excluir framework:', error);
      toast.error('Erro ao excluir framework');
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      nome: '',
      descricao: '',
      tipo: '',
      origem: '',
      versao: '1.0',
      categoria: '',
      subcategoria: '',
      nivel_aplicabilidade: '',
      jurisdicao: '',
      escopo_aplicacao: [],
      data_vigencia: '',
      url_referencia: '',
      tags: []
    });
    setEditingFramework(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inativo': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'suspenso': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'obsoleto': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'regulatorio': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'normativo': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'interno': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'setorial': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'internacional': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getConformityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredFrameworks = frameworks.filter(framework => {
    const matchesSearch = framework.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         framework.origem.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         framework.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = !filterTipo || framework.tipo === filterTipo;
    const matchesCategoria = !filterCategoria || framework.categoria === filterCategoria;
    
    return matchesSearch && matchesTipo && matchesCategoria;
  });

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
          <h2 className="text-2xl font-bold">Frameworks de Compliance</h2>
          <p className="text-muted-foreground">Gestão de frameworks regulatórios e normativos</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Framework
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingFramework ? 'Editar Framework' : 'Novo Framework'}
              </DialogTitle>
              <DialogDescription>
                Configure um framework de compliance para sua organização
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="classification">Classificação</TabsTrigger>
                  <TabsTrigger value="details">Detalhes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="codigo">Código*</Label>
                      <Input
                        id="codigo"
                        value={formData.codigo}
                        onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                        placeholder="Ex: LGPD-2018"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="versao">Versão</Label>
                      <Input
                        id="versao"
                        value={formData.versao}
                        onChange={(e) => setFormData(prev => ({ ...prev, versao: e.target.value }))}
                        placeholder="Ex: 1.0"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="nome">Nome do Framework*</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Ex: Lei Geral de Proteção de Dados"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="origem">Origem/Fonte*</Label>
                    <Input
                      id="origem"
                      value={formData.origem}
                      onChange={(e) => setFormData(prev => ({ ...prev, origem: e.target.value }))}
                      placeholder="Ex: Lei Federal nº 13.709/2018"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="descricao">Descrição*</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descreva o objetivo e escopo do framework"
                      rows={3}
                      required
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="classification" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tipo">Tipo*</Label>
                      <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_FRAMEWORK.map(tipo => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="nivel_aplicabilidade">Nível de Aplicabilidade*</Label>
                      <Select value={formData.nivel_aplicabilidade} onValueChange={(value) => setFormData(prev => ({ ...prev, nivel_aplicabilidade: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o nível" />
                        </SelectTrigger>
                        <SelectContent>
                          {NIVEIS_APLICABILIDADE.map(nivel => (
                            <SelectItem key={nivel.value} value={nivel.value}>
                              {nivel.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="categoria">Categoria*</Label>
                      <Select value={formData.categoria} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIAS.map(categoria => (
                            <SelectItem key={categoria} value={categoria}>
                              {categoria}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="subcategoria">Subcategoria</Label>
                      <Input
                        id="subcategoria"
                        value={formData.subcategoria}
                        onChange={(e) => setFormData(prev => ({ ...prev, subcategoria: e.target.value }))}
                        placeholder="Ex: Consentimento"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="jurisdicao">Jurisdição*</Label>
                    <Input
                      id="jurisdicao"
                      value={formData.jurisdicao}
                      onChange={(e) => setFormData(prev => ({ ...prev, jurisdicao: e.target.value }))}
                      placeholder="Ex: Brasil, União Europeia, Global"
                      required
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="data_vigencia">Data de Vigência</Label>
                    <Input
                      id="data_vigencia"
                      type="date"
                      value={formData.data_vigencia}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_vigencia: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="url_referencia">URL de Referência</Label>
                    <Input
                      id="url_referencia"
                      type="url"
                      value={formData.url_referencia}
                      onChange={(e) => setFormData(prev => ({ ...prev, url_referencia: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                    <Input
                      id="tags"
                      value={formData.tags.join(', ')}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()) }))}
                      placeholder="Ex: privacidade, dados pessoais, consentimento"
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingFramework ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar frameworks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {TIPOS_FRAMEWORK.map(tipo => (
              <SelectItem key={tipo.value} value={tipo.value}>
                {tipo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filterCategoria} onValueChange={setFilterCategoria}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {CATEGORIAS.map(categoria => (
              <SelectItem key={categoria} value={categoria}>
                {categoria}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Frameworks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredFrameworks.map(framework => (
          <Card key={framework.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-muted-foreground">{framework.codigo}</span>
                  </div>
                  <CardTitle className="text-lg leading-tight">{framework.nome}</CardTitle>
                  <CardDescription className="mt-1">
                    {framework.origem} • {framework.jurisdicao}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Status e Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className={getStatusColor(framework.status)}>
                  {framework.status}
                </Badge>
                <Badge className={getTipoColor(framework.tipo)}>
                  {framework.tipo}
                </Badge>
                <Badge variant="outline">
                  {framework.nivel_aplicabilidade}
                </Badge>
              </div>
              
              {/* Score de Conformidade */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Conformidade</span>
                  <span className={`text-sm font-bold ${getConformityColor(framework.conformityScore)}`}>
                    {framework.conformityScore}%
                  </span>
                </div>
                <Progress value={framework.conformityScore} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{framework.activeRequirements} requisitos ativos</span>
                  <span>Avaliado em {new Date(framework.lastAssessment).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              
              {/* Categoria e Tags */}
              <div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                  <Building className="h-3 w-3" />
                  <span>{framework.categoria}</span>
                </div>
                {framework.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {framework.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {framework.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{framework.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              
              {/* Ações */}
              <div className="flex gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" onClick={() => handleEdit(framework)}>
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-3 w-3 mr-1" />
                  Requisitos
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDelete(framework)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredFrameworks.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || filterTipo || filterCategoria 
                ? 'Nenhum framework encontrado com os filtros aplicados.'
                : 'Nenhum framework cadastrado ainda.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default FrameworksManagement;