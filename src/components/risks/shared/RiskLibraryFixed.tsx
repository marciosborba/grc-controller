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
  Plus,
  Brain,
  TrendingUp,
  Shield,
  Users,
  BarChart3,
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
  Download,
  Settings,
  UserCheck,
  Target,
  Activity,
  Tag,
  Calendar,
  Award,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RiskTemplateService } from '@/services/riskTemplateService';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import type { RiskTemplate as DBRiskTemplate } from '@/types/riskTemplate';
import { useAuth } from '@/contexts/AuthContext';

type RiskTemplate = DBRiskTemplate;

interface RiskLibraryFixedProps {
  onSelectTemplate: (template: RiskTemplate) => void;
}

export const RiskLibraryFixed: React.FC<RiskLibraryFixedProps> = ({
  onSelectTemplate
}) => {
  const [templates, setTemplates] = useState<RiskTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<RiskTemplate>>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTemplateData, setNewTemplateData] = useState<Partial<RiskTemplate>>({});
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin' || user?.isPlatformAdmin || user?.role === 'platform_admin';

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    
    try {
      const dbTemplates = await RiskTemplateService.getTemplates();
      
      if (dbTemplates.length === 0) {
        toast({
          title: '⚠️ Banco Vazio',
          description: 'Nenhum template encontrado. Execute o seed do banco para ver os templates.',
          variant: 'destructive'
        });
        setTemplates([]);
      } else {
        // Carregar favoritos do usuário atual E estatísticas de TODOS os usuários
        const [favoritesData, userRatingsData, allRatingsData] = await Promise.all([
          // Favoritos do usuário atual
          supabase
            .from('risk_template_favorites')
            .select('template_id')
            .eq('user_id', user?.id || ''),
          // Avaliações do usuário atual
          supabase
            .from('risk_template_ratings')
            .select('template_id, rating')
            .eq('user_id', user?.id || ''),
          // TODAS as avaliações para estatísticas globais
          supabase
            .from('risk_template_ratings')
            .select('template_id, rating')
        ]);

        const userFavorites = new Set(favoritesData.data?.map(f => f.template_id) || []);
        const userRatings = new Map(userRatingsData.data?.map(r => [r.template_id, r.rating]) || []);
        
        // Calcular estatísticas globais de rating
        const globalStats = new Map();
        allRatingsData.data?.forEach(rating => {
          if (!globalStats.has(rating.template_id)) {
            globalStats.set(rating.template_id, { totalRatings: 0, sumRatings: 0 });
          }
          const stats = globalStats.get(rating.template_id);
          stats.totalRatings++;
          stats.sumRatings += rating.rating;
        });

        // Usar dados reais do banco mapeando snake_case para camelCase
        const processedTemplates = dbTemplates.map((template, index) => {
          const stats = globalStats.get(template.id);
          const globalTotalRatings = stats?.totalRatings || 0;
          const globalAvgRating = stats ? (stats.sumRatings / stats.totalRatings) : 0;
          
          return {
            ...template,
            // Mapear campos do banco (snake_case) para o formato esperado (camelCase)
            usageCount: template.usage_count || 0,
            // Usar rating global calculado de TODOS os usuários
            rating: globalAvgRating || template.rating || 0,
            totalRatings: globalTotalRatings || template.total_ratings || 0,
            isPopular: template.is_popular || (index < 10),
            alexRiskSuggested: template.alex_risk_suggested || false,
            // Dados específicos do usuário atual
            isFavorite: userFavorites.has(template.id),
            userRating: userRatings.get(template.id),
            lastUpdated: template.last_updated || template.updated_at || new Date().toISOString().split('T')[0]
          };
        });
        
        setTemplates(processedTemplates);
        toast({
          title: '✅ Templates Carregados',
          description: `${dbTemplates.length} templates carregados com sucesso!`,
        });
      }
      
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      toast({
        title: '⚠️ Erro ao Carregar Templates',
        description: 'Falha ao conectar com o banco de dados.',
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
    const matchesFavorites = !showFavorites || template.isFavorite;
    
    return matchesSearch && matchesCategory && matchesIndustry && matchesLevel && matchesFavorites;
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

  const handleUseTemplate = async (template: RiskTemplate) => {
    try {
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
        usageCount: template.usageCount,
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

  const handleToggleFavorite = async (templateId: string) => {
    try {
      const template = templates.find(t => t.id === templateId);
      const newFavoriteStatus = !template?.isFavorite;
      
      // Atualizar localmente primeiro para UX responsiva
      setTemplates(prev => prev.map(t => 
        t.id === templateId 
          ? { ...t, isFavorite: newFavoriteStatus }
          : t
      ));

      if (newFavoriteStatus) {
        // Adicionar aos favoritos
        const { error } = await supabase
          .from('risk_template_favorites')
          .insert({
            template_id: templateId,
            user_id: user?.id
          });
        
        if (error) throw error;
      } else {
        // Remover dos favoritos
        const { error } = await supabase
          .from('risk_template_favorites')
          .delete()
          .eq('template_id', templateId)
          .eq('user_id', user?.id);
        
        if (error) throw error;
      }
      
      toast({
        title: newFavoriteStatus ? '⭐ Adicionado aos favoritos' : '☆ Removido dos favoritos',
        description: newFavoriteStatus ? 'Template salvo nos seus favoritos.' : 'Template removido dos favoritos.'
      });
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error);
      // Reverter mudança local se erro na API
      setTemplates(prev => prev.map(t => 
        t.id === templateId 
          ? { ...t, isFavorite: !t.isFavorite }
          : t
      ));
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o favorito.',
        variant: 'destructive'
      });
    }
  };

  const handleRateTemplate = async (templateId: string, rating: number) => {
    try {
      console.log('Tentando avaliar:', { templateId, userId: user?.id, rating });
      
      // Verificar autenticação
      const { data: { user: authUser } } = await supabase.auth.getUser();
      console.log('Usuário autenticado:', authUser?.id);
      console.log('User context:', user?.id);
      
      if (!authUser) {
        throw new Error('Usuário não autenticado');
      }
      
      // Primeiro tentar inserir, se falhar devido a duplicata, atualizar
      const { data: existingRating } = await supabase
        .from('risk_template_ratings')
        .select('id')
        .eq('template_id', templateId)
        .eq('user_id', authUser.id)
        .single();

      let result;
      if (existingRating) {
        // Atualizar avaliação existente
        result = await supabase
          .from('risk_template_ratings')
          .update({ rating })
          .eq('template_id', templateId)
          .eq('user_id', authUser.id);
        console.log('Tentando UPDATE:', { templateId, userId: authUser.id, rating });
      } else {
        // Inserir nova avaliação
        result = await supabase
          .from('risk_template_ratings')
          .insert({
            template_id: templateId,
            user_id: authUser.id,
            rating: rating
          });
        console.log('Tentando INSERT:', { templateId, userId: authUser.id, rating });
      }
      
      if (result.error) {
        console.error('Erro no banco:', result.error);
        console.error('Detalhes do erro:', {
          code: result.error.code,
          message: result.error.message,
          details: result.error.details,
          hint: result.error.hint
        });
        throw result.error;
      }

      console.log('Avaliação salva com sucesso:', result);

      // Atualizar template localmente
      setTemplates(prev => prev.map(t => 
        t.id === templateId 
          ? { 
              ...t, 
              userRating: rating
            }
          : t
      ));
      
      toast({
        title: '⭐ Avaliação enviada',
        description: `Você avaliou este template com ${rating} estrela${rating > 1 ? 's' : ''}.`
      });
    } catch (error) {
      console.error('Erro ao avaliar template:', error);
      toast({
        title: 'Erro',
        description: `Não foi possível enviar sua avaliação: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const handleEditTemplate = (template: RiskTemplate) => {
    setEditingCard(template.id);
    setEditFormData({
      name: template.name,
      description: template.description,
      category: template.category,
      industry: template.industry,
      methodology: template.methodology,
      probability: template.probability,
      impact: template.impact,
      riskLevel: template.riskLevel
    });
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setEditFormData({});
  };

  const handleSaveEdit = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('risk_templates')
        .update({
          name: editFormData.name,
          description: editFormData.description,
          category: editFormData.category,
          industry: editFormData.industry,
          methodology: editFormData.methodology,
          probability: editFormData.probability,
          impact: editFormData.impact,
          risk_level: editFormData.riskLevel,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId);

      if (error) throw error;

      // Atualizar template localmente
      setTemplates(prev => prev.map(t => 
        t.id === templateId 
          ? { ...t, ...editFormData }
          : t
      ));

      setEditingCard(null);
      setEditFormData({});

      toast({
        title: '✅ Template atualizado',
        description: 'As alterações foram salvas com sucesso.'
      });
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as alterações.',
        variant: 'destructive'
      });
    }
  };

  // Funções de cores corrigidas
  const getRiskLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'Muito Alto': 
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700';
      case 'Alto': 
        return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-700';
      case 'Médio': 
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700';
      case 'Baixo': 
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700';
      case 'Muito Baixo': 
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700';
      default: 
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-200 dark:border-gray-700';
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Tecnológico': 
        return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-700';
      case 'Operacional': 
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700';
      case 'Financeiro': 
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-700';
      case 'Regulatório': 
        return 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-200 dark:border-indigo-700';
      case 'Reputacional': 
        return 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/30 dark:text-pink-200 dark:border-pink-700';
      default: 
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-200 dark:border-gray-700';
    }
  };

  const getProbabilityStyles = (probability: number) => {
    switch (probability) {
      case 5: 
        return { backgroundColor: '#dc2626', color: '#ffffff', borderColor: '#dc2626' };
      case 4: 
        return { backgroundColor: '#ea580c', color: '#ffffff', borderColor: '#ea580c' };
      case 3: 
        return { backgroundColor: '#d97706', color: '#ffffff', borderColor: '#d97706' };
      case 2: 
        return { backgroundColor: '#2563eb', color: '#ffffff', borderColor: '#2563eb' };
      case 1: 
        return { backgroundColor: '#16a34a', color: '#ffffff', borderColor: '#16a34a' };
      default: 
        return { backgroundColor: '#6b7280', color: '#ffffff', borderColor: '#6b7280' };
    }
  };

  const getImpactStyles = (impact: number) => {
    switch (impact) {
      case 5: 
        return { backgroundColor: '#dc2626', color: '#ffffff', borderColor: '#dc2626' };
      case 4: 
        return { backgroundColor: '#ea580c', color: '#ffffff', borderColor: '#ea580c' };
      case 3: 
        return { backgroundColor: '#d97706', color: '#ffffff', borderColor: '#d97706' };
      case 2: 
        return { backgroundColor: '#2563eb', color: '#ffffff', borderColor: '#2563eb' };
      case 1: 
        return { backgroundColor: '#16a34a', color: '#ffffff', borderColor: '#16a34a' };
      default: 
        return { backgroundColor: '#6b7280', color: '#ffffff', borderColor: '#6b7280' };
    }
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'Tecnológico': 
        return { backgroundColor: '#7c3aed', color: '#ffffff', borderColor: '#7c3aed' };
      case 'Operacional': 
        return { backgroundColor: '#2563eb', color: '#ffffff', borderColor: '#2563eb' };
      case 'Financeiro': 
        return { backgroundColor: '#059669', color: '#ffffff', borderColor: '#059669' };
      case 'Regulatório': 
        return { backgroundColor: '#4338ca', color: '#ffffff', borderColor: '#4338ca' };
      case 'Reputacional': 
        return { backgroundColor: '#db2777', color: '#ffffff', borderColor: '#db2777' };
      default: 
        return { backgroundColor: '#6b7280', color: '#ffffff', borderColor: '#6b7280' };
    }
  };

  const getRiskLevelStyles = (level: string) => {
    switch (level) {
      case 'Muito Alto': 
        return { backgroundColor: '#dc2626', color: '#ffffff', borderColor: '#dc2626' };
      case 'Alto': 
        return { backgroundColor: '#ea580c', color: '#ffffff', borderColor: '#ea580c' };
      case 'Médio': 
        return { backgroundColor: '#d97706', color: '#ffffff', borderColor: '#d97706' };
      case 'Baixo': 
        return { backgroundColor: '#16a34a', color: '#ffffff', borderColor: '#16a34a' };
      case 'Muito Baixo': 
        return { backgroundColor: '#2563eb', color: '#ffffff', borderColor: '#2563eb' };
      default: 
        return { backgroundColor: '#6b7280', color: '#ffffff', borderColor: '#6b7280' };
    }
  };

  const getIndustryStyles = () => {
    return { backgroundColor: '#4b5563', color: '#ffffff', borderColor: '#4b5563' };
  };

  const getMethodologyStyles = () => {
    return { backgroundColor: '#64748b', color: '#ffffff', borderColor: '#64748b' };
  };

  const getTagStyles = () => {
    return { backgroundColor: '#6b7280', color: '#ffffff', borderColor: '#6b7280' };
  };

  const getAlexIAStyles = () => {
    return { backgroundColor: '#7c3aed', color: '#ffffff', borderColor: '#7c3aed' };
  };

  const getPopularStyles = () => {
    return { backgroundColor: '#f59e0b', color: '#ffffff', borderColor: '#f59e0b' };
  };

  const getTemplateCountStyles = () => {
    return { backgroundColor: '#16a34a', color: '#ffffff', borderColor: '#16a34a' };
  };

  const getRiskLevelIndicatorColor = (level: string) => {
    switch (level) {
      case 'Muito Alto': return 'bg-red-500';
      case 'Alto': return 'bg-orange-500';
      case 'Médio': return 'bg-yellow-500';
      case 'Baixo': return 'bg-green-500';
      case 'Muito Baixo': return 'bg-blue-500';
      default: return 'bg-gray-500';
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

  const InteractiveStars = ({ templateId, userRating }: { templateId: string; userRating?: number }) => {
    const [hoverRating, setHoverRating] = useState(0);
    
    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 cursor-pointer transition-colors ${
              i < (hoverRating || userRating || 0)
                ? 'text-yellow-400 fill-current hover:text-yellow-500' 
                : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'
            }`}
            onMouseEnter={() => setHoverRating(i + 1)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => handleRateTemplate(templateId, i + 1)}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-2">
          {userRating ? `Sua avaliação: ${userRating}⭐` : 'Clique para avaliar'}
        </span>
      </div>
    );
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
    <div className="w-full space-y-6">
      {/* Header da Biblioteca */}
      <Card className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 border-green-200 dark:border-green-800">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Library className="h-6 w-6 text-green-600 dark:text-green-400" />
              <CardTitle>Biblioteca Inteligente de Riscos</CardTitle>
              <span 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  borderRadius: '9999px',
                  border: '1px solid',
                  paddingLeft: '10px',
                  paddingRight: '10px',
                  paddingTop: '2px',
                  paddingBottom: '2px',
                  fontSize: '12px',
                  fontWeight: '600',
                  ...getTemplateCountStyles()
                }}
              >
                {templates.length} Templates
              </span>
            </div>
            
            {isAdmin && (
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Novo Template
              </Button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="relative lg:col-span-2">
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
            
            <Button 
              variant={showFavorites ? "default" : "outline"}
              onClick={() => setShowFavorites(!showFavorites)}
              className="flex items-center justify-center space-x-2"
            >
              <Heart className={`h-4 w-4 ${showFavorites ? 'fill-current' : ''}`} />
              <span>Favoritos</span>
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
            <span>{filteredTemplates.length} templates encontrados</span>
            <div className="flex flex-wrap items-center gap-4">
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
      <div className="w-full space-y-4">
        {filteredTemplates.map((template) => {
          const isExpanded = expandedCards.has(template.id);
          
          return (
            <Card key={template.id} className="w-full hover:shadow-lg transition-all duration-200">
              <Collapsible open={isExpanded} onOpenChange={() => toggleCardExpansion(template.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="flex items-start space-x-4 flex-1 min-w-0">
                        {/* Indicador de Nível de Risco */}
                        <div className={`w-1 h-16 rounded-full flex-shrink-0 ${getRiskLevelIndicatorColor(template.riskLevel)}`}></div>
                        
                        {/* Informações Principais */}
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            
                            {/* Badges de Status */}
                            <div className="flex flex-wrap items-center gap-2">
                              {template.alexRiskSuggested && (
                                <span 
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    borderRadius: '9999px',
                                    border: '1px solid',
                                    paddingLeft: '10px',
                                    paddingRight: '10px',
                                    paddingTop: '2px',
                                    paddingBottom: '2px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    ...getAlexIAStyles()
                                  }}
                                >
                                  <Brain className="h-3 w-3 mr-1" />
                                  Alex IA
                                </span>
                              )}
                              {template.isPopular && (
                                <span 
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    borderRadius: '9999px',
                                    border: '1px solid',
                                    paddingLeft: '10px',
                                    paddingRight: '10px',
                                    paddingTop: '2px',
                                    paddingBottom: '2px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    ...getPopularStyles()
                                  }}
                                >
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  Popular
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
                          
                          {/* Metadados */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span 
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                borderRadius: '9999px',
                                border: '1px solid',
                                paddingLeft: '10px',
                                paddingRight: '10px',
                                paddingTop: '2px',
                                paddingBottom: '2px',
                                fontSize: '12px',
                                fontWeight: '600',
                                ...getCategoryStyles(template.category)
                              }}
                            >
                              {template.category}
                            </span>
                            <span 
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                borderRadius: '9999px',
                                border: '1px solid',
                                paddingLeft: '10px',
                                paddingRight: '10px',
                                paddingTop: '2px',
                                paddingBottom: '2px',
                                fontSize: '12px',
                                fontWeight: '600',
                                ...getRiskLevelStyles(template.riskLevel)
                              }}
                            >
                              {template.riskLevel}
                            </span>
                            <div className="flex items-center space-x-1">
                              {renderStars(template.rating)}
                              <span className="text-xs text-muted-foreground ml-1">({template.rating})</span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span>{template.usageCount.toLocaleString()} usos</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Ações Rápidas */}
                      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
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
                        
                        <div className="flex items-center">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-6">
                      {/* Modo de edição para administradores */}
                      {isAdmin && editingCard === template.id ? (
                        <div className="space-y-6">
                          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h3 className="text-lg font-medium mb-4 flex items-center text-blue-800 dark:text-blue-200">
                              <Edit className="h-5 w-5 mr-2" />
                              Editando Template - {template.name}
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Nome */}
                              <div>
                                <label className="block text-sm font-medium mb-2">Nome do Template</label>
                                <Input 
                                  value={editFormData.name || ''}
                                  onChange={(e) => setEditFormData(prev => ({...prev, name: e.target.value}))}
                                  placeholder="Nome do template"
                                  className="w-full"
                                />
                              </div>
                              
                              {/* Categoria */}
                              <div>
                                <label className="block text-sm font-medium mb-2">Categoria</label>
                                <select 
                                  value={editFormData.category || ''}
                                  onChange={(e) => setEditFormData(prev => ({...prev, category: e.target.value}))}
                                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                >
                                  <option value="">Selecione uma categoria</option>
                                  <option value="Tecnológico">Tecnológico</option>
                                  <option value="Operacional">Operacional</option>
                                  <option value="Financeiro">Financeiro</option>
                                  <option value="Regulatório">Regulatório</option>
                                  <option value="Reputacional">Reputacional</option>
                                </select>
                              </div>
                              
                              {/* Indústria */}
                              <div>
                                <label className="block text-sm font-medium mb-2">Indústria</label>
                                <Input 
                                  value={editFormData.industry || ''}
                                  onChange={(e) => setEditFormData(prev => ({...prev, industry: e.target.value}))}
                                  placeholder="Ex: Financeiro, Tecnologia, Saúde"
                                  className="w-full"
                                />
                              </div>
                              
                              {/* Nível de Risco */}
                              <div>
                                <label className="block text-sm font-medium mb-2">Nível de Risco</label>
                                <select 
                                  value={editFormData.riskLevel || ''}
                                  onChange={(e) => setEditFormData(prev => ({...prev, riskLevel: e.target.value}))}
                                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                >
                                  <option value="">Selecione um nível</option>
                                  <option value="Muito Alto">Muito Alto</option>
                                  <option value="Alto">Alto</option>
                                  <option value="Médio">Médio</option>
                                  <option value="Baixo">Baixo</option>
                                  <option value="Muito Baixo">Muito Baixo</option>
                                </select>
                              </div>
                              
                              {/* Probabilidade */}
                              <div>
                                <label className="block text-sm font-medium mb-2">Probabilidade (1-5)</label>
                                <select 
                                  value={editFormData.probability || ''}
                                  onChange={(e) => setEditFormData(prev => ({...prev, probability: parseInt(e.target.value)}))}
                                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                >
                                  <option value="">Selecione</option>
                                  <option value="1">1 - Muito Baixa</option>
                                  <option value="2">2 - Baixa</option>
                                  <option value="3">3 - Média</option>
                                  <option value="4">4 - Alta</option>
                                  <option value="5">5 - Muito Alta</option>
                                </select>
                              </div>
                              
                              {/* Impacto */}
                              <div>
                                <label className="block text-sm font-medium mb-2">Impacto (1-5)</label>
                                <select 
                                  value={editFormData.impact || ''}
                                  onChange={(e) => setEditFormData(prev => ({...prev, impact: parseInt(e.target.value)}))}
                                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                >
                                  <option value="">Selecione</option>
                                  <option value="1">1 - Muito Baixo</option>
                                  <option value="2">2 - Baixo</option>
                                  <option value="3">3 - Médio</option>
                                  <option value="4">4 - Alto</option>
                                  <option value="5">5 - Muito Alto</option>
                                </select>
                              </div>
                              
                              {/* Metodologia */}
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">Metodologia</label>
                                <Input 
                                  value={editFormData.methodology || ''}
                                  onChange={(e) => setEditFormData(prev => ({...prev, methodology: e.target.value}))}
                                  placeholder="Ex: ISO 27001, NIST, COBIT"
                                  className="w-full"
                                />
                              </div>
                              
                              {/* Descrição */}
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">Descrição</label>
                                <Textarea 
                                  value={editFormData.description || ''}
                                  onChange={(e) => setEditFormData(prev => ({...prev, description: e.target.value}))}
                                  placeholder="Descrição detalhada do risco"
                                  className="w-full h-24"
                                />
                              </div>
                            </div>
                            
                            {/* Botões de ação */}
                            <div className="flex items-center justify-end space-x-2 mt-6">
                              <Button 
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="flex items-center"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancelar
                              </Button>
                              <Button 
                                onClick={() => handleSaveEdit(template.id)}
                                className="bg-green-600 hover:bg-green-700 text-white flex items-center"
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Salvar Alterações
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Modo de visualização normal */
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
                                    <span 
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        borderRadius: '9999px',
                                        border: '1px solid',
                                        paddingLeft: '10px',
                                        paddingRight: '10px',
                                        paddingTop: '2px',
                                        paddingBottom: '2px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        ...getProbabilityStyles(template.probability)
                                      }}
                                    >
                                      {template.probability}/5
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">Impacto:</span>
                                    <span 
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        borderRadius: '9999px',
                                        border: '1px solid',
                                        paddingLeft: '10px',
                                        paddingRight: '10px',
                                        paddingTop: '2px',
                                        paddingBottom: '2px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        ...getImpactStyles(template.impact)
                                      }}
                                    >
                                      {template.impact}/5
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">Indústria:</span>
                                    <span 
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        borderRadius: '9999px',
                                        border: '1px solid',
                                        paddingLeft: '10px',
                                        paddingRight: '10px',
                                        paddingTop: '2px',
                                        paddingBottom: '2px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        ...getIndustryStyles()
                                      }}
                                    >
                                      {template.industry}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-2 uppercase tracking-wide">Metodologia</h4>
                                <span 
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    borderRadius: '9999px',
                                    border: '1px solid',
                                    paddingLeft: '10px',
                                    paddingRight: '10px',
                                    paddingTop: '2px',
                                    paddingBottom: '2px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    ...getMethodologyStyles()
                                  }}
                                >
                                  {template.methodology}
                                </span>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-2 uppercase tracking-wide">Estatísticas</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <Activity className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm">{template.usageCount.toLocaleString()} usos</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Award className="h-4 w-4 text-yellow-500" />
                                    <span className="text-sm">{template.totalRatings} avaliações</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">{template.lastUpdated || new Date().toISOString().split('T')[0]}</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wide">Sua Avaliação</h4>
                                <InteractiveStars templateId={template.id} userRating={template.userRating} />
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
                          
                          {/* Tags - visível apenas no modo de visualização */}
                          {template.tags && template.tags.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wide flex items-center">
                                <Tag className="h-4 w-4 mr-2" />
                                Tags
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {template.tags.map((tagObj, index) => (
                                  <span 
                                    key={tagObj.id || index}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      borderRadius: '9999px',
                                      border: '1px solid',
                                      paddingLeft: '8px',
                                      paddingRight: '8px',
                                      paddingTop: '1px',
                                      paddingBottom: '1px',
                                      fontSize: '11px',
                                      fontWeight: '500',
                                      ...getTagStyles()
                                    }}
                                  >
                                    {tagObj.tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Metadados de Rodapé - visível apenas no modo de visualização */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border text-xs text-muted-foreground">
                            <div className="flex flex-wrap items-center gap-4">
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
                              
                              {/* Botão de edição para administradores */}
                              {isAdmin && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditTemplate(template);
                                  }}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Editar
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
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