import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Library, 
  Search, 
  Plus, 
  BookOpen, 
  Shield, 
  AlertTriangle, 
  TrendingUp,
  Globe,
  Building,
  Zap,
  DollarSign,
  Users,
  Leaf,
  Download,
  FileText,
  Filter,
  Star,
  Copy,
  Edit,
  Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface RiskTemplate {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  impact_description: string;
  likelihood_factors: string[];
  control_measures: string[];
  kpis: string[];
  regulatory_references: string[];
  industry_sector: string[];
  risk_level: string;
  is_public: boolean;
  usage_count: number;
  rating: number;
  created_by: string;
  created_at: string;
}

const RISK_CATEGORIES = {
  'strategic': {
    name: 'Estratégicos',
    icon: TrendingUp,
    color: 'bg-purple-100 text-purple-800',
    subcategories: [
      'Mudanças Regulatórias',
      'Disrupção Tecnológica',
      'Mudanças de Mercado',
      'Reputação e Marca',
      'Fusões e Aquisições'
    ]
  },
  'operational': {
    name: 'Operacionais',
    icon: Building,
    color: 'bg-blue-100 text-blue-800',
    subcategories: [
      'Falhas de Processos',
      'Recursos Humanos',
      'Fornecedores e Terceiros',
      'Qualidade de Produtos',
      'Continuidade de Negócios'
    ]
  },
  'financial': {
    name: 'Financeiros',
    icon: DollarSign,
    color: 'bg-green-100 text-green-800',
    subcategories: [
      'Crédito e Contraparte',
      'Liquidez e Fluxo de Caixa',
      'Mercado (Câmbio, Juros)',
      'Investimentos',
      'Fraude Financeira'
    ]
  },
  'compliance': {
    name: 'Compliance',
    icon: Shield,
    color: 'bg-orange-100 text-orange-800',
    subcategories: [
      'Regulamentações Setoriais',
      'Leis Trabalhistas',
      'Proteção de Dados',
      'Anticorrupção',
      'Normas Técnicas'
    ]
  },
  'technology': {
    name: 'Tecnológicos',
    icon: Zap,
    color: 'bg-indigo-100 text-indigo-800',
    subcategories: [
      'Cybersecurity',
      'Infraestrutura TI',
      'Projetos de TI',
      'Transformação Digital',
      'Automação e IA'
    ]
  },
  'esg': {
    name: 'ESG',
    icon: Leaf,
    color: 'bg-emerald-100 text-emerald-800',
    subcategories: [
      'Mudanças Climáticas',
      'Sustentabilidade Ambiental',
      'Responsabilidade Social',
      'Governança Corporativa',
      'Diversidade e Inclusão'
    ]
  }
};

const INDUSTRY_SECTORS = [
  'Financeiro',
  'Tecnologia',
  'Saúde',
  'Energia',
  'Manufatura',
  'Varejo',
  'Telecomunicações',
  'Governo',
  'Educação',
  'Transporte',
  'Imobiliário',
  'Agronegócio'
];

export const RiskLibrary: React.FC = () => {
  const [templates, setTemplates] = useState<RiskTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<RiskTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [riskLevelFilter, setRiskLevelFilter] = useState('all');
  const [showPublicOnly, setShowPublicOnly] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<RiskTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    impact_description: '',
    likelihood_factors: '',
    control_measures: '',
    kpis: '',
    regulatory_references: '',
    industry_sector: '',
    risk_level: 'medium',
    is_public: false
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, categoryFilter, sectorFilter, riskLevelFilter, showPublicOnly]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('risk_library_templates')
        .select('*');

      if (!user?.isPlatformAdmin) {
        query = query.or(`is_public.eq.true,created_by.eq.${user?.id}`);
      }

      const { data, error } = await query
        .order('usage_count', { ascending: false })
        .order('rating', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar biblioteca:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar biblioteca de riscos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (showPublicOnly) {
      filtered = filtered.filter(t => t.is_public);
    }

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subcategory.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    if (sectorFilter !== 'all') {
      filtered = filtered.filter(t => t.industry_sector.includes(sectorFilter));
    }

    if (riskLevelFilter !== 'all') {
      filtered = filtered.filter(t => t.risk_level === riskLevelFilter);
    }

    setFilteredTemplates(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const templateData = {
        name: formData.name,
        category: formData.category,
        subcategory: formData.subcategory,
        description: formData.description,
        impact_description: formData.impact_description,
        likelihood_factors: formData.likelihood_factors.split('\n').filter(f => f.trim()),
        control_measures: formData.control_measures.split('\n').filter(c => c.trim()),
        kpis: formData.kpis.split('\n').filter(k => k.trim()),
        regulatory_references: formData.regulatory_references.split('\n').filter(r => r.trim()),
        industry_sector: formData.industry_sector.split(',').map(s => s.trim()).filter(s => s),
        risk_level: formData.risk_level,
        is_public: formData.is_public,
        created_by: user?.id,
        usage_count: 0,
        rating: 0
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from('risk_library_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);
        
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Template atualizado com sucesso',
        });
      } else {
        const { error } = await supabase
          .from('risk_library_templates')
          .insert([templateData]);
        
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Template criado com sucesso',
        });
      }

      setIsCreateDialogOpen(false);
      resetForm();
      fetchTemplates();
    } catch (error: any) {
      console.error('Erro ao salvar template:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao salvar template',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (template: RiskTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      subcategory: template.subcategory,
      description: template.description,
      impact_description: template.impact_description,
      likelihood_factors: template.likelihood_factors.join('\n'),
      control_measures: template.control_measures.join('\n'),
      kpis: template.kpis.join('\n'),
      regulatory_references: template.regulatory_references.join('\n'),
      industry_sector: template.industry_sector.join(', '),
      risk_level: template.risk_level,
      is_public: template.is_public
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;
    
    try {
      const { error } = await supabase
        .from('risk_library_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Template excluído com sucesso',
      });
      
      fetchTemplates();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao excluir template',
        variant: 'destructive',
      });
    }
  };

  const handleUseTemplate = async (template: RiskTemplate) => {
    try {
      // Incrementar contador de uso
      await supabase
        .from('risk_library_templates')
        .update({ usage_count: template.usage_count + 1 })
        .eq('id', template.id);

      // Aqui você pode implementar a lógica para usar o template
      // Por exemplo, abrir o formulário de criação de risco com os dados preenchidos
      toast({
        title: 'Template Aplicado',
        description: 'Template carregado para criação de novo risco',
      });
    } catch (error: any) {
      console.error('Erro ao usar template:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      subcategory: '',
      description: '',
      impact_description: '',
      likelihood_factors: '',
      control_measures: '',
      kpis: '',
      regulatory_references: '',
      industry_sector: '',
      risk_level: 'medium',
      is_public: false
    });
    setEditingTemplate(null);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'very_high': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelText = (level: string) => {
    switch (level) {
      case 'very_high': return 'Muito Alto';
      case 'high': return 'Alto';
      case 'medium': return 'Médio';
      case 'low': return 'Baixo';
      default: return 'Não Definido';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate flex items-center space-x-2">
            <Library className="h-8 w-8 text-primary" />
            <span>Biblioteca de Riscos</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Templates e modelos de riscos corporativos baseados em frameworks internacionais
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>{editingTemplate ? 'Editar Template' : 'Novo Template de Risco'}</span>
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Nome do Template *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      placeholder="Ex: Vulnerabilidade de Segurança Cibernética"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Categoria *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({...formData, category: value, subcategory: ''})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(RISK_CATEGORIES).map(([key, cat]) => (
                          <SelectItem key={key} value={key}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="subcategory">Subcategoria *</Label>
                    <Select
                      value={formData.subcategory}
                      onValueChange={(value) => setFormData({...formData, subcategory: value})}
                      disabled={!formData.category}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a subcategoria..." />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.category && RISK_CATEGORIES[formData.category]?.subcategories.map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="risk_level">Nível de Risco Típico</Label>
                    <Select
                      value={formData.risk_level}
                      onValueChange={(value) => setFormData({...formData, risk_level: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixo</SelectItem>
                        <SelectItem value="medium">Médio</SelectItem>
                        <SelectItem value="high">Alto</SelectItem>
                        <SelectItem value="very_high">Muito Alto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="industry_sector">Setores Aplicáveis</Label>
                    <Input
                      id="industry_sector"
                      value={formData.industry_sector}
                      onChange={(e) => setFormData({...formData, industry_sector: e.target.value})}
                      placeholder="Ex: Financeiro, Tecnologia, Saúde (separados por vírgula)"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="description">Descrição do Risco *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      required
                      rows={3}
                      placeholder="Descreva detalhadamente o risco, suas causas e contexto..."
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="impact_description">Descrição do Impacto</Label>
                    <Textarea
                      id="impact_description"
                      value={formData.impact_description}
                      onChange={(e) => setFormData({...formData, impact_description: e.target.value})}
                      rows={3}
                      placeholder="Descreva os possíveis impactos financeiros, operacionais, reputacionais..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="likelihood_factors">Fatores de Probabilidade</Label>
                    <Textarea
                      id="likelihood_factors"
                      value={formData.likelihood_factors}
                      onChange={(e) => setFormData({...formData, likelihood_factors: e.target.value})}
                      rows={4}
                      placeholder="Um fator por linha:&#10;- Complexidade do sistema&#10;- Histórico de incidentes&#10;- Controles existentes"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="control_measures">Medidas de Controle</Label>
                    <Textarea
                      id="control_measures"
                      value={formData.control_measures}
                      onChange={(e) => setFormData({...formData, control_measures: e.target.value})}
                      rows={4}
                      placeholder="Uma medida por linha:&#10;- Implementar autenticação multifator&#10;- Realizar auditorias regulares&#10;- Treinar equipe"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="kpis">KPIs e Indicadores</Label>
                    <Textarea
                      id="kpis"
                      value={formData.kpis}
                      onChange={(e) => setFormData({...formData, kpis: e.target.value})}
                      rows={4}
                      placeholder="Um KPI por linha:&#10;- Número de tentativas de acesso não autorizado&#10;- Tempo médio de detecção&#10;- Taxa de incidentes resolvidos"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="regulatory_references">Referências Regulatórias</Label>
                    <Textarea
                      id="regulatory_references"
                      value={formData.regulatory_references}
                      onChange={(e) => setFormData({...formData, regulatory_references: e.target.value})}
                      rows={4}
                      placeholder="Uma referência por linha:&#10;- LGPD Art. 46&#10;- ISO 27001:2013&#10;- NIST Cybersecurity Framework"
                    />
                  </div>
                  
                  <div className="col-span-2 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_public"
                      checked={formData.is_public}
                      onChange={(e) => setFormData({...formData, is_public: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="is_public">Tornar público (disponível para toda organização)</Label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-6 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingTemplate ? 'Atualizar Template' : 'Criar Template'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {Object.entries(RISK_CATEGORIES).map(([key, cat]) => (
                  <SelectItem key={key} value={key}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Setores</SelectItem>
                {INDUSTRY_SECTORS.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Nível de Risco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Níveis</SelectItem>
                <SelectItem value="low">Baixo</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="high">Alto</SelectItem>
                <SelectItem value="very_high">Muito Alto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="public_only"
                checked={showPublicOnly}
                onChange={(e) => setShowPublicOnly(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="public_only">Apenas templates públicos</Label>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {filteredTemplates.length} template(s) encontrado(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(RISK_CATEGORIES).map(([key, category]) => {
          const Icon = category.icon;
          const count = filteredTemplates.filter(t => t.category === key).length;
          
          return (
            <Card 
              key={key} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                categoryFilter === key ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setCategoryFilter(categoryFilter === key ? 'all' : key)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{category.name}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const categoryInfo = RISK_CATEGORIES[template.category];
          const Icon = categoryInfo?.icon || AlertTriangle;
          
          return (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${categoryInfo?.color || 'bg-gray-100 text-gray-800'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{template.subcategory}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {template.is_public && (
                      <Badge variant="secondary" className="text-xs">
                        <Globe className="h-3 w-3 mr-1" />
                        Público
                      </Badge>
                    )}
                    <Badge className={getRiskLevelColor(template.risk_level)}>
                      {getRiskLevelText(template.risk_level)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {template.description}
                </p>
                
                {template.industry_sector.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Setores:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.industry_sector.slice(0, 3).map((sector, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {sector}
                        </Badge>
                      ))}
                      {template.industry_sector.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.industry_sector.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{template.usage_count} usos</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Star className="h-3 w-3" />
                      <span>{template.rating.toFixed(1)}</span>
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-2 border-t">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleUseTemplate(template)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Usar Template
                  </Button>
                  
                  {(template.created_by === user?.id || user?.isPlatformAdmin) && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(template)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Library className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum template encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ajuste os filtros ou crie um novo template
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};