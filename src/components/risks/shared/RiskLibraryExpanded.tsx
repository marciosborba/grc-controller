import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Library,
  Search,
  Filter,
  Star,
  Download,
  Eye,
  Plus,
  Brain,
  TrendingUp,
  Shield,
  AlertTriangle,
  Building,
  Zap,
  Globe,
  Users,
  FileText,
  BarChart3,
  Lock,
  Unlock,
  Heart,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Edit,
  Save,
  X,
  Trash2,
  Copy,
  Settings,
  UserCheck,
  Target,
  Activity,
  Tag,
  Calendar,
  Award,
  Bookmark
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RiskTemplateService } from '@/services/riskTemplateService';
import type { RiskTemplate as DBRiskTemplate } from '@/types/riskTemplate';
import { useAuth } from '@/contexts/AuthContext';

// Usar interface do banco de dados
type RiskTemplate = DBRiskTemplate;

interface RiskLibraryExpandedProps {
  onSelectTemplate: (template: RiskTemplate) => void;
}

export const RiskLibraryExpanded: React.FC<RiskLibraryExpandedProps> = ({
  onSelectTemplate
}) => {
  const [templates, setTemplates] = useState<RiskTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [showOnlyPopular, setShowOnlyPopular] = useState(false);
  const [showOnlyAlexSuggested, setShowOnlyAlexSuggested] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<RiskTemplate>>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTemplateData, setNewTemplateData] = useState<Partial<RiskTemplate>>({});
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Verificar se o usuário é administrador
  const isAdmin = user?.role === 'admin' || user?.isPlatformAdmin || user?.role === 'platform_admin';

  useEffect(() => {
    console.log('🚀 RiskLibraryExpanded montado - iniciando carregamento...');
    loadTemplates();
  }, []);
  
  useEffect(() => {
    console.log(`📊 Estado atual dos templates: ${templates.length} templates carregados`);
    if (templates.length > 0) {
      console.log('📁 Primeiros 3 templates:', templates.slice(0, 3).map(t => ({ id: t.id, name: t.name, category: t.category })));
    }
  }, [templates]);

  const loadTemplates = async () => {
    setIsLoading(true);
    
    try {
      console.log('🔍 Carregando templates do banco de dados...');
      const dbTemplates = await RiskTemplateService.getTemplates();
      console.log(`📊 Templates encontrados no banco: ${dbTemplates.length}`);
      
      if (dbTemplates.length === 0) {
        console.warn('⚠️ Nenhum template encontrado no banco.');
        toast({
          title: '⚠️ Banco Vazio',
          description: 'Nenhum template encontrado. Execute o seed do banco para ver os templates.',
          variant: 'destructive'
        });
        setTemplates([]);
      } else {
        console.log('✅ Usando templates do banco de dados');
        
        // Processar templates para atualizar popularidade baseada em dados reais
        const processedTemplates = dbTemplates.map(template => ({
          ...template,
          // Atualizar popularidade baseada em uso e rating
          isPopular: template.usageCount >= 1000 && template.rating >= 4.5,
          // Garantir que os dados de rating sejam consistentes
          rating: template.rating || 0,
          totalRatings: template.totalRatings || 0,
          usageCount: template.usageCount || 0
        }));
        
        setTemplates(processedTemplates);
        toast({
          title: '✅ Templates Carregados',
          description: `${dbTemplates.length} templates carregados do banco de dados com sucesso!`,
        });
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar templates do banco:', error);
      toast({
        title: '⚠️ Erro ao Carregar Templates',
        description: 'Falha ao conectar com o banco de dados. Verifique a conexão.',
        variant: 'destructive'
      });
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesIndustry = selectedIndustry === 'all' || template.industry === selectedIndustry;
    const matchesLevel = selectedLevel === 'all' || template.riskLevel === selectedLevel;
    const matchesPopular = !showOnlyPopular || template.isPopular;
    const matchesAlexSuggested = !showOnlyAlexSuggested || template.alexRiskSuggested;
    
    return matchesSearch && matchesCategory && matchesIndustry && matchesLevel && matchesPopular && matchesAlexSuggested;
  });

  const categories = [...new Set(templates.map(t => t.category))];
  const industries = [...new Set(templates.map(t => t.industry))];
  const riskLevels = ['Muito Alto', 'Alto', 'Médio', 'Baixo', 'Muito Baixo'];

  const toggleCardExpansion = (templateId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(templateId)) {
        newSet.delete(templateId);
      } else {
        newSet.add(templateId);
      }
      return newSet;
    });
  };

  const startEditing = (template: RiskTemplate) => {
    if (!isAdmin) {
      toast({
        title: '🔒 Acesso Negado',
        description: 'Apenas administradores podem editar templates.',
        variant: 'destructive'
      });
      return;
    }
    
    setEditingCard(template.id);
    setEditFormData({
      name: template.name,
      description: template.description,
      category: template.category,
      industry: template.industry,
      riskLevel: template.riskLevel,
      probability: template.probability,
      impact: template.impact,
      methodology: template.methodology
    });
  };

  const cancelEditing = () => {
    setEditingCard(null);
    setEditFormData({});
  };

  const saveTemplate = async (templateId: string) => {
    if (!isAdmin) {
      toast({
        title: '🔒 Acesso Negado',
        description: 'Apenas administradores podem salvar alterações.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await RiskTemplateService.updateTemplate(templateId, editFormData, user?.id || 'admin');
      
      // Atualizar estado local
      setTemplates(prev => prev.map(t => 
        t.id === templateId ? { ...t, ...editFormData } : t
      ));
      
      setEditingCard(null);
      setEditFormData({});
      
      toast({
        title: '✅ Template Atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      toast({
        title: '❌ Erro ao Salvar',
        description: 'Não foi possível salvar as alterações. Tente novamente.',
        variant: 'destructive'
      });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!isAdmin) {
      toast({
        title: '🔒 Acesso Negado',
        description: 'Apenas administradores podem excluir templates.',
        variant: 'destructive'
      });
      return;
    }

    if (!confirm('Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await RiskTemplateService.updateTemplate(templateId, { status: 'inactive' }, user?.id || 'admin');
      
      // Remover do estado local
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      
      toast({
        title: '🗑️ Template Excluído',
        description: 'O template foi removido da biblioteca.',
      });
    } catch (error) {
      console.error('Erro ao excluir template:', error);
      toast({
        title: '❌ Erro ao Excluir',
        description: 'Não foi possível excluir o template. Tente novamente.',
        variant: 'destructive'
      });
    }
  };

  const createNewTemplate = async () => {
    if (!isAdmin) {
      toast({
        title: '🔒 Acesso Negado',
        description: 'Apenas administradores podem criar novos templates.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const templateData = {
        ...newTemplateData,
        createdBy: user?.fullName || user?.email || 'Admin',
        controls: [],
        kris: [],
        tags: []
      };
      
      const newTemplate = await RiskTemplateService.createTemplate(templateData as any);
      
      // Adicionar ao estado local
      setTemplates(prev => [newTemplate, ...prev]);
      
      setShowCreateDialog(false);
      setNewTemplateData({});
      
      toast({
        title: '✅ Template Criado',
        description: 'Novo template adicionado à biblioteca com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao criar template:', error);
      toast({
        title: '❌ Erro ao Criar',
        description: 'Não foi possível criar o template. Tente novamente.',
        variant: 'destructive'
      });
    }
  };

  const handleUseTemplate = async (template: RiskTemplate) => {
    try {
      await RiskTemplateService.incrementUsage(template.id);
      
      setTemplates(prev => prev.map(t => 
        t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t
      ));
      
      const compatibleTemplate = {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        industry: template.industry,
        riskLevel: template.riskLevel,
        probability: template.probability,
        impact: template.impact,
        methodology: template.methodology,
        controls: template.controls?.map(c => c.controlDescription) || [],
        kris: template.kris?.map(k => k.kriDescription) || [],
        usageCount: template.usageCount + 1,
        rating: template.rating,
        isPopular: template.isPopular,
        isFavorite: template.isFavorite,
        createdBy: template.createdBy,
        lastUpdated: template.updatedAt ? template.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        tags: template.tags?.map(t => t.tag) || [],
        alexRiskSuggested: template.alexRiskSuggested,
        userRatings: template.userRatings?.map(r => r.rating) || [],
        totalRatings: template.totalRatings
      };
      
      onSelectTemplate(compatibleTemplate);
      
      toast({
        title: '✅ Template Aplicado',
        description: `Template "${template.name}" será usado para criar novo risco`,
      });
    } catch (error) {
      console.error('Erro ao usar template:', error);
      toast({
        title: '⚠️ Erro',
        description: 'Erro ao aplicar template, mas continuando...',
        variant: 'destructive'
      });
    }
  };

  const handleToggleFavorite = (templateId: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t
    ));
    
    toast({
      title: '⭐ Favorito Atualizado',
      description: 'Template adicionado/removido dos favoritos',
    });
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Muito Alto': return 'bg-red-100 text-red-900 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800';
      case 'Alto': return 'bg-orange-100 text-orange-900 border-orange-200 dark:bg-orange-900/20 dark:text-orange-200 dark:border-orange-800';
      case 'Médio': return 'bg-yellow-100 text-yellow-900 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800';
      case 'Baixo': return 'bg-green-100 text-green-900 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800';
      case 'Muito Baixo': return 'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800';
      default: return 'bg-gray-100 text-gray-900 border-gray-200 dark:bg-gray-900/20 dark:text-gray-200 dark:border-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Tecnológico': return 'bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-900/20 dark:text-purple-200 dark:border-purple-800';
      case 'Operacional': return 'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800';
      case 'Financeiro': return 'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-800';
      case 'Regulatório': return 'bg-indigo-100 text-indigo-900 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-200 dark:border-indigo-800';
      case 'Reputacional': return 'bg-pink-100 text-pink-900 border-pink-200 dark:bg-pink-900/20 dark:text-pink-200 dark:border-pink-800';
      default: return 'bg-gray-100 text-gray-900 border-gray-200 dark:bg-gray-900/20 dark:text-gray-200 dark:border-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando biblioteca de riscos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Header da Biblioteca */}
      <Card className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 border-green-200 dark:border-green-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Library className="h-6 w-6 text-green-600 dark:text-green-400" />
              <CardTitle>Biblioteca Inteligente de Riscos</CardTitle>
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:bg-opacity-50 dark:text-green-400 dark:border-green-800">
                {templates.length} Templates
              </Badge>
            </div>
            
            {isAdmin && (
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <Plus className="h-5 w-5" />
                      <span>Criar Novo Template de Risco</span>
                    </DialogTitle>
                    <DialogDescription>
                      Adicione um novo template à biblioteca de riscos.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Nome do Template *</label>
                        <Input 
                          placeholder="Ex: Falha de Sistema Crítico" 
                          value={newTemplateData.name || ''}
                          onChange={(e) => setNewTemplateData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Categoria *</label>
                        <select 
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          value={newTemplateData.category || ''}
                          onChange={(e) => setNewTemplateData(prev => ({ ...prev, category: e.target.value }))}
                        >
                          <option value="">Selecione uma categoria</option>
                          <option value="Tecnológico">Tecnológico</option>
                          <option value="Operacional">Operacional</option>
                          <option value="Financeiro">Financeiro</option>
                          <option value="Regulatório">Regulatório</option>
                          <option value="Reputacional">Reputacional</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Indústria</label>
                        <Input 
                          placeholder="Ex: Tecnologia, Financeiro, Geral" 
                          value={newTemplateData.industry || ''}
                          onChange={(e) => setNewTemplateData(prev => ({ ...prev, industry: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Nível de Risco</label>
                        <select 
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          value={newTemplateData.riskLevel || ''}
                          onChange={(e) => setNewTemplateData(prev => ({ ...prev, riskLevel: e.target.value as any }))}
                        >
                          <option value="">Selecione o nível</option>
                          {riskLevels.map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Probabilidade (1-5)</label>
                        <Input 
                          type="number" 
                          min="1" 
                          max="5" 
                          placeholder="3" 
                          value={newTemplateData.probability || ''}
                          onChange={(e) => setNewTemplateData(prev => ({ ...prev, probability: parseInt(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Impacto (1-5)</label>
                        <Input 
                          type="number" 
                          min="1" 
                          max="5" 
                          placeholder="4" 
                          value={newTemplateData.impact || ''}
                          onChange={(e) => setNewTemplateData(prev => ({ ...prev, impact: parseInt(e.target.value) }))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Descrição *</label>
                      <Textarea 
                        placeholder="Descreva detalhadamente o risco..." 
                        rows={3}
                        value={newTemplateData.description || ''}
                        onChange={(e) => setNewTemplateData(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Metodologia</label>
                      <Input 
                        placeholder="Ex: NIST Cybersecurity Framework, ISO 27001" 
                        value={newTemplateData.methodology || ''}
                        onChange={(e) => setNewTemplateData(prev => ({ ...prev, methodology: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={createNewTemplate}
                      disabled={!newTemplateData.name || !newTemplateData.category || !newTemplateData.description}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Criar Template
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <p className="text-muted-foreground">
            Templates pré-configurados com metodologias, controles e KRIs baseados em melhores práticas de mercado
            {isAdmin && <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">• Modo Administrador Ativo</span>}
          </p>
        </CardHeader>
      </Card>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <select 
              value={selectedIndustry} 
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">Todas as Indústrias</option>
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
            
            <select 
              value={selectedLevel} 
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">Todos os Níveis</option>
              {riskLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            
            <Button 
              variant={showFavorites ? "default" : "outline"}
              onClick={() => setShowFavorites(!showFavorites)}
              className="flex items-center space-x-2"
            >
              <Heart className={`h-4 w-4 ${showFavorites ? 'fill-current' : ''}`} />
              <span>Favoritos</span>
            </Button>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{filteredTemplates.length} templates encontrados</span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Brain className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                <span>{templates.filter(t => t.alexRiskSuggested).length} Alex Risk</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-green-500 dark:text-green-400" />
                <span>{templates.filter(t => t.isPopular).length} populares</span>
              </div>
              {isAdmin && (
                <div className="flex items-center space-x-1">
                  <Settings className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  <span>Admin</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Templates Expansíveis */}
      <div className="space-y-4 w-full">
        {filteredTemplates.map((template) => {
          const isExpanded = expandedCards.has(template.id);
          const isEditing = editingCard === template.id;
          
          return (
            <Card key={template.id} className="hover:shadow-lg transition-all duration-200 w-full overflow-hidden">
              <Collapsible open={isExpanded} onOpenChange={() => toggleCardExpansion(template.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gradient-to-r hover:from-primary/20 hover:to-transparent transition-all duration-300">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start space-x-4 flex-1 min-w-0">
                        {/* Indicador de Nível de Risco */}
                        <div className={`w-1 h-16 rounded-full flex-shrink-0 ${template.riskLevel === 'Muito Alto' ? 'bg-red-500' : template.riskLevel === 'Alto' ? 'bg-orange-500' : template.riskLevel === 'Médio' ? 'bg-yellow-500' : template.riskLevel === 'Baixo' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                        
                        {/* Informações Principais */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center space-x-3 mb-2">
                            <CardTitle className="text-lg truncate">{template.name}</CardTitle>
                            
                            {/* Badges de Status */}
                            <div className="flex items-center space-x-2 flex-wrap">
                              {template.alexRiskSuggested && (
                                <Badge className="bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-900/20 dark:text-purple-200 dark:border-purple-800">
                                  <Brain className="h-3 w-3 mr-1" />
                                  Alex IA
                                </Badge>
                              )}
                              {template.isPopular && (
                                <Badge className="bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  Popular
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground truncate">{template.description}</p>
                          
                          {/* Metadados */}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge className={getCategoryColor(template.category)}>
                              {template.category}
                            </Badge>
                            <Badge className={getRiskLevelColor(template.riskLevel)}>
                              {template.riskLevel}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              {renderStars(template.rating)}
                              <span className="text-xs text-muted-foreground ml-1">({template.rating})</span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span>{template.usageCount} usos</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Ações Rápidas */}
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUseTemplate(template);
                          }}
                          className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white"
                          size="sm"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Usar
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(template.id);
                          }}
                        >
                          <Heart className={`h-3 w-3 ${template.isFavorite ? 'fill-current text-red-500' : ''}`} />
                        </Button>
                        
                        {isAdmin && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(template);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTemplate(template.id);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        
                        <div className="flex items-center ml-2">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {isEditing ? (
                      /* Modo de Edição */
                      <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center space-x-2 mb-4">
                          <Edit className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-800 dark:text-blue-300">Editando Template</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Nome</label>
                            <Input 
                              value={editFormData.name || ''}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Categoria</label>
                            <select 
                              className="w-full px-3 py-2 border border-input rounded-md bg-background"
                              value={editFormData.category || ''}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                            >
                              <option value="Tecnológico">Tecnológico</option>
                              <option value="Operacional">Operacional</option>
                              <option value="Financeiro">Financeiro</option>
                              <option value="Regulatório">Regulatório</option>
                              <option value="Reputacional">Reputacional</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Indústria</label>
                            <Input 
                              value={editFormData.industry || ''}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, industry: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Nível de Risco</label>
                            <select 
                              className="w-full px-3 py-2 border border-input rounded-md bg-background"
                              value={editFormData.riskLevel || ''}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, riskLevel: e.target.value as any }))}
                            >
                              {riskLevels.map(level => (
                                <option key={level} value={level}>{level}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Descrição</label>
                          <Textarea 
                            rows={3}
                            value={editFormData.description || ''}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Metodologia</label>
                          <Input 
                            value={editFormData.methodology || ''}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, methodology: e.target.value }))}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-3 pt-4">
                          <Button 
                            onClick={() => saveTemplate(template.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Alterações
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={cancelEditing}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Modo de Visualização Expandida */
                      <div className="space-y-6">
                        {/* Informações Detalhadas */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Coluna 1: Detalhes do Risco */}
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-sm text-muted-foreground mb-2 uppercase tracking-wide">Detalhes do Risco</h4>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">Probabilidade:</span>
                                  <Badge variant="outline">{template.probability}/5</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">Impacto:</span>
                                  <Badge variant="outline">{template.impact}/5</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">Indústria:</span>
                                  <Badge variant="outline">{template.industry}</Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-sm text-muted-foreground mb-2 uppercase tracking-wide">Metodologia</h4>
                              <Badge className="bg-slate-100 text-slate-900 border-slate-200 dark:bg-slate-900/20 dark:text-slate-200 dark:border-slate-800">
                                {template.methodology}
                              </Badge>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-sm text-muted-foreground mb-2 uppercase tracking-wide">Estatísticas</h4>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Activity className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm">{template.usageCount} usos</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Award className="h-4 w-4 text-yellow-500" />
                                  <span className="text-sm">{template.totalRatings} avaliações</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm">{template.updatedAt ? template.updatedAt.toISOString().split('T')[0] : 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Coluna 2: Controles */}
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wide flex items-center">
                              <Shield className="h-4 w-4 mr-2" />
                              Controles ({template.controls?.length || 0})
                            </h4>
                            <div className="space-y-2">
                              {template.controls?.map((control, index) => (
                                <div key={control.id || index} className="flex items-start space-x-2 p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{control.controlDescription}</span>
                                </div>
                              )) || (
                                <p className="text-sm text-muted-foreground italic">Nenhum controle definido</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Coluna 3: KRIs */}
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wide flex items-center">
                              <Target className="h-4 w-4 mr-2" />
                              KRIs ({template.kris?.length || 0})
                            </h4>
                            <div className="space-y-2">
                              {template.kris?.map((kri, index) => (
                                <div key={kri.id || index} className="flex items-start space-x-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                                  <BarChart3 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{kri.kriDescription}</span>
                                </div>
                              )) || (
                                <p className="text-sm text-muted-foreground italic">Nenhum KRI definido</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Tags */}
                        {template.tags && template.tags.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wide flex items-center">
                              <Tag className="h-4 w-4 mr-2" />
                              Tags
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {template.tags.map((tagObj, index) => (
                                <Badge key={tagObj.id || index} variant="outline" className="text-xs">
                                  {tagObj.tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Metadados de Rodapé */}
                        <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-muted-foreground">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <UserCheck className="h-3 w-3" />
                              <span>Criado por: {template.createdBy}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>Atualizado: {template.updatedAt ? template.updatedAt.toISOString().split('T')[0] : 'N/A'}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Copy className="h-3 w-3 mr-1" />
                              Duplicar
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-3 w-3 mr-1" />
                              Exportar
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
      
      {/* Estado vazio */}
      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Library className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum template encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar os filtros ou termos de busca
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedIndustry('all');
                setSelectedLevel('all');
                setShowFavorites(false);
              }}
            >
              Limpar Filtros
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};