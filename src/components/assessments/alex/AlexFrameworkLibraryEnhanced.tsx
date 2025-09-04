/**
 * ALEX FRAMEWORK LIBRARY ENHANCED - Biblioteca completa de frameworks
 * 
 * Sistema avançado de framework library com:
 * - Integração nativa com IA Manager
 * - 25+ frameworks pré-configurados
 * - Tenant isolation e security  
 * - Role-based recommendations
 * - Edge Functions integration
 * - Smart filtering e search
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAlexAssessment } from '@/hooks/useAlexAssessment';
import { toast } from 'sonner';
import { 
  Shield, 
  Star, 
  Globe, 
  TrendingUp, 
  Users, 
  Award,
  Target,
  Zap,
  Brain,
  ChevronRight,
  Clock,
  MapPin,
  Building,
  BookOpen,
  Sparkles,
  Filter,
  BarChart3,
  Search,
  Eye,
  Download,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Database,
  Settings,
  Lightbulb,
  ThumbsUp,
  ArrowRight,
  FileText,
  Activity
} from 'lucide-react';

// Enhanced Framework interface with full features
interface EnhancedFramework {
  id: string;
  name: string;
  version: string;
  category: string;
  industry: string;
  region: string;
  description: string;
  controls: any[];
  domains_structure: any;
  metadata: {
    industry_focus: string[];
    applicable_regions: string[];
    compliance_domains: string[];
    target_company_size: string[];
    certification_requirements: any;
    prerequisites: string[];
    estimated_implementation_time: number;
    complexity_score: number;
  };
  usage_stats: {
    usage_count: number;
    avg_completion_time: number;
    avg_compliance_score: number;
    success_rate: number;
  };
  ai_insights: {
    recommendation_score: number;
    match_reasons: string[];
    implementation_tips: string[];
    common_challenges: string[];
    success_factors: string[];
  };
  is_active: boolean;
  is_global: boolean;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

interface AIFrameworkRecommendation {
  framework_id: string;
  confidence_score: number;
  reasoning: string;
  benefits: string[];
  implementation_guidance: string[];
  risk_mitigation_tips: string[];
  estimated_roi: number;
  priority_score: number;
}

interface UserFrameworkContext {
  role: string;
  tenant_id: string;
  industry: string;
  company_size: string;
  current_frameworks: string[];
  compliance_requirements: string[];
  risk_tolerance: 'low' | 'medium' | 'high';
  implementation_timeline: 'immediate' | 'short' | 'medium' | 'long';
}

interface AlexFrameworkLibraryEnhancedProps {
  userRole: string;
  tenantConfig: any;
  onUseFramework: (frameworkId: string) => void;
  filters?: {
    category?: string;
    industry?: string;
    region?: string;
    complexity?: string;
  };
  userContext?: Partial<UserFrameworkContext>;
}

const AlexFrameworkLibraryEnhanced: React.FC<AlexFrameworkLibraryEnhancedProps> = ({
  userRole,
  tenantConfig,
  onUseFramework,
  filters = {},
  userContext
}) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { frameworkLibrary, isFrameworksLoading, frameworksError } = useAlexAssessment();

  // State Management
  const [frameworks, setFrameworks] = useState<EnhancedFramework[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<AIFrameworkRecommendation[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<EnhancedFramework | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
  const [selectedIndustry, setSelectedIndustry] = useState(filters.industry || 'all');
  const [selectedRegion, setSelectedRegion] = useState(filters.region || 'all');
  const [selectedComplexity, setSelectedComplexity] = useState(filters.complexity || 'all');
  const [activeTab, setActiveTab] = useState('ai_recommended');
  
  // Advanced filters
  const [minUsageCount, setMinUsageCount] = useState(0);
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [sortBy, setSortBy] = useState('recommendation');

  console.log('📚 [FRAMEWORK LIBRARY] Inicializando com contexto:', {
    tenant: user?.tenant,
    role: user?.user_metadata?.role,
    userContext,
    filters
  });

  useEffect(() => {
    if (frameworkLibrary && frameworkLibrary.length > 0) {
      // Transform framework library data to enhanced format
      const enhancedFrameworks: EnhancedFramework[] = frameworkLibrary.map(fw => ({
        id: fw.id,
        name: fw.name,
        version: fw.version || '1.0',
        category: fw.category,
        industry: fw.industry_focus?.[0] || 'general',
        region: fw.applicable_regions?.[0] || 'global',
        description: fw.description || `Framework de compliance ${fw.name}`,
        controls: fw.controls_definition || [],
        domains_structure: fw.domains_structure || {},
        metadata: {
          industry_focus: fw.industry_focus || ['general'],
          applicable_regions: fw.applicable_regions || ['global'],
          compliance_domains: fw.compliance_domains || [fw.category],
          target_company_size: ['small', 'medium', 'large'],
          certification_requirements: fw.certification_requirements || {},
          prerequisites: [],
          estimated_implementation_time: 90,
          complexity_score: 5,
        },
        usage_stats: {
          usage_count: fw.usage_count || 0,
          avg_completion_time: fw.avg_completion_time || 30,
          avg_compliance_score: fw.avg_compliance_score || 75,
          success_rate: 85,
        },
        ai_insights: {
          recommendation_score: 0,
          match_reasons: [],
          implementation_tips: [],
          common_challenges: [],
          success_factors: [],
        },
        is_active: true,
        is_global: fw.is_global,
        is_premium: fw.is_premium || false,
        created_at: fw.created_at || new Date().toISOString(),
        updated_at: fw.updated_at || new Date().toISOString()
      }));
      
      setFrameworks(enhancedFrameworks);
      console.log(`✅ [FRAMEWORK LIBRARY] ${enhancedFrameworks.length} frameworks carregados do hook`);
    }
  }, [frameworkLibrary]);

  useEffect(() => {
    if (frameworks.length > 0 && user) {
      loadAIRecommendations();
    }
  }, [frameworks, user, selectedCategory, selectedIndustry]);



  // Load AI recommendations for frameworks
  const loadAIRecommendations = async () => {
    try {
      setIsLoadingAI(true);
      console.log('🧠 [FRAMEWORK AI] Solicitando recomendações de frameworks...');

      const requestBody = {
        action: 'get_framework_recommendations',
        user_context: {
          tenant_id: user?.tenant || '',
          user_id: user?.id || '',
          role: user?.user_metadata?.role || 'user',
          industry: userContext?.industry || 'technology',
          company_size: userContext?.company_size || 'medium',
          current_frameworks: userContext?.current_frameworks || [],
          compliance_requirements: userContext?.compliance_requirements || [],
          risk_tolerance: userContext?.risk_tolerance || 'medium',
          implementation_timeline: userContext?.implementation_timeline || 'medium'
        },
        available_frameworks: frameworks.map(fw => ({
          id: fw.id,
          name: fw.name,
          category: fw.category,
          industry: fw.industry,
          region: fw.region,
          complexity_score: fw.metadata.complexity_score,
          usage_stats: fw.usage_stats,
          metadata: fw.metadata
        })),
        filters: {
          category: selectedCategory !== 'all' ? selectedCategory : null,
          industry: selectedIndustry !== 'all' ? selectedIndustry : null,
          region: selectedRegion !== 'all' ? selectedRegion : null
        }
      };

      console.log('📤 [FRAMEWORK AI] Enviando contexto para IA:', requestBody);

      const { data, error } = await supabase.functions.invoke('alex-assessment-recommendations', {
        body: requestBody
      });

      if (error) {
        console.error('⚠️ [FRAMEWORK AI] Erro na Edge Function:', error);
        return; // Falha silenciosa
      }

      if (data?.framework_recommendations && Array.isArray(data.framework_recommendations)) {
        const validRecommendations = data.framework_recommendations.filter((rec: any) => 
          rec.framework_id && rec.confidence_score !== undefined
        );
        
        setAiRecommendations(validRecommendations);
        
        // Update frameworks with AI insights
        setFrameworks(prev => prev.map(fw => {
          const recommendation = validRecommendations.find((r: any) => r.framework_id === fw.id);
          if (recommendation) {
            return {
              ...fw,
              ai_insights: {
                ...fw.ai_insights,
                recommendation_score: recommendation.confidence_score * 100,
                match_reasons: recommendation.benefits || [],
                implementation_tips: recommendation.implementation_guidance || [],
              }
            };
          }
          return fw;
        }));
        
        console.log(`🧠 [FRAMEWORK AI] ${validRecommendations.length} recomendações processadas`);
        
        if (validRecommendations.length > 0) {
          toast.success(`IA analisou ${validRecommendations.length} frameworks para você`);
        }
      }

    } catch (error) {
      console.warn('⚠️ [FRAMEWORK AI] Erro inesperado (continuando sem IA):', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Advanced filtering with AI-enhanced logic
  const filteredFrameworks = useMemo(() => {
    return frameworks.filter(framework => {
      const matchesSearch = !searchTerm || 
        framework.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        framework.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        framework.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || framework.category === selectedCategory;
      const matchesIndustry = selectedIndustry === 'all' || 
        framework.metadata.industry_focus.includes(selectedIndustry) ||
        framework.industry === selectedIndustry;
      const matchesRegion = selectedRegion === 'all' || 
        framework.metadata.applicable_regions.includes(selectedRegion) ||
        framework.region === selectedRegion;
      const matchesComplexity = selectedComplexity === 'all' || 
        getComplexityLevel(framework.metadata.complexity_score) === selectedComplexity;
      
      const matchesUsage = framework.usage_stats.usage_count >= minUsageCount;
      const matchesPremium = !showPremiumOnly || framework.is_premium;

      return matchesSearch && matchesCategory && matchesIndustry && 
             matchesRegion && matchesComplexity && matchesUsage && matchesPremium;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'recommendation':
          return b.ai_insights.recommendation_score - a.ai_insights.recommendation_score;
        case 'popularity':
          return b.usage_stats.usage_count - a.usage_stats.usage_count;
        case 'success_rate':
          return b.usage_stats.success_rate - a.usage_stats.success_rate;
        case 'complexity':
          return a.metadata.complexity_score - b.metadata.complexity_score;
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [
    frameworks, searchTerm, selectedCategory, selectedIndustry, 
    selectedRegion, selectedComplexity, minUsageCount, showPremiumOnly, sortBy
  ]);

  // Get AI recommended frameworks
  const aiRecommendedFrameworks = useMemo(() => {
    return frameworks
      .filter(fw => fw.ai_insights.recommendation_score > 60)
      .sort((a, b) => b.ai_insights.recommendation_score - a.ai_insights.recommendation_score)
      .slice(0, 6);
  }, [frameworks]);

  // Helper functions
  const getComplexityLevel = (score: number): string => {
    if (score <= 3) return 'basic';
    if (score <= 7) return 'intermediate';
    return 'advanced';
  };

  const getComplexityColor = (score: number): string => {
    if (score <= 3) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (score <= 7) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      'Information Security': Shield,
      'Data Protection': Lock,
      'Cybersecurity': Target,
      'Healthcare Compliance': Users,
      'Financial Services': TrendingUp,
      'Service Organization Controls': Star,
      'Payment Security': Award,
      'Governance': Settings,
      'Risk Management': AlertTriangle,
      'Quality Management': CheckCircle2,
      'Custom': Sparkles
    };
    return icons[category] || BookOpen;
  };

  const getAIRecommendation = (frameworkId: string) => {
    return aiRecommendations.find(rec => rec.framework_id === frameworkId);
  };

  // Enhanced Framework Card Component
  const FrameworkCard = ({ framework }: { framework: EnhancedFramework }) => {
    const IconComponent = getCategoryIcon(framework.category);
    const aiRecommendation = getAIRecommendation(framework.id);
    const complexityLevel = getComplexityLevel(framework.metadata.complexity_score);
    const complexityColor = getComplexityColor(framework.metadata.complexity_score);
    
    return (
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
          selectedFramework?.id === framework.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
        } ${aiRecommendation ? 'border-purple-200 dark:border-purple-800' : ''}`}
        onClick={() => setSelectedFramework(framework)}
      >
        <CardHeader className="pb-3">
          {/* AI Recommendation Badge */}
          {framework.ai_insights.recommendation_score > 60 && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                <Brain className="h-3 w-3 mr-1" />
                {Math.round(framework.ai_insights.recommendation_score)}% Match
              </Badge>
            </div>
          )}

          <div className="flex items-start justify-between mb-3 pr-16">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                <IconComponent className="h-6 w-6 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg font-semibold line-clamp-1">{framework.name}</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  v{framework.version} • {framework.category}
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {framework.description}
          </p>

          {/* Key Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={`text-xs ${complexityColor}`}>
              {complexityLevel}
            </Badge>
            {framework.is_premium && (
              <Badge className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                <Star className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
            {framework.usage_stats.usage_count > 100 && (
              <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Popular
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {framework.controls?.length || 0} controles
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {framework.metadata.estimated_implementation_time}d
            </div>
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              {framework.usage_stats.success_rate}% sucesso
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              {framework.usage_stats.avg_compliance_score}% score
            </div>
          </div>

          {/* AI Insights */}
          {framework.ai_insights.recommendation_score > 60 && (
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  IA Recomenda
                </span>
              </div>
              <div className="space-y-1">
                {framework.ai_insights.match_reasons.slice(0, 2).map((reason, idx) => (
                  <p key={idx} className="text-xs text-purple-700 dark:text-purple-300">
                    • {reason}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Industry Focus */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {framework.metadata.industry_focus.slice(0, 2).map(industry => (
                <Badge key={industry} variant="outline" className="text-xs">
                  {industry}
                </Badge>
              ))}
              {framework.metadata.industry_focus.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{framework.metadata.industry_focus.length - 2}
                </Badge>
              )}
            </div>
          </div>

          <Button 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              console.log('✅ [FRAMEWORK LIBRARY] Framework selecionado:', framework.name);
              toast.success(`Framework "${framework.name}" selecionado`);
              onUseFramework(framework.id);
            }}
          >
            Usar Framework
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (isFrameworksLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardHeader>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Search e Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Biblioteca de Frameworks
            {isLoadingAI && (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  IA Analisando
                </Badge>
              </div>
            )}
            {!isLoadingAI && aiRecommendedFrameworks.length > 0 && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                IA Pronta
              </Badge>
            )}
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Explore nossa biblioteca com 25+ frameworks de compliance e governança
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar frameworks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                <SelectItem value="Information Security">Segurança da Informação</SelectItem>
                <SelectItem value="Data Protection">Proteção de Dados</SelectItem>
                <SelectItem value="Cybersecurity">Cibersegurança</SelectItem>
                <SelectItem value="Financial Services">Serviços Financeiros</SelectItem>
                <SelectItem value="Healthcare Compliance">Compliance Saúde</SelectItem>
                <SelectItem value="Governance">Governança</SelectItem>
                <SelectItem value="Risk Management">Gestão de Riscos</SelectItem>
                <SelectItem value="Quality Management">Gestão da Qualidade</SelectItem>
              </SelectContent>
            </Select>

            {/* Industry Filter */}
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Indústria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Indústrias</SelectItem>
                <SelectItem value="technology">Tecnologia</SelectItem>
                <SelectItem value="financial">Financeira</SelectItem>
                <SelectItem value="healthcare">Saúde</SelectItem>
                <SelectItem value="manufacturing">Manufatura</SelectItem>
                <SelectItem value="retail">Varejo</SelectItem>
                <SelectItem value="energy">Energia</SelectItem>
                <SelectItem value="education">Educação</SelectItem>
                <SelectItem value="government">Governo</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Options */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommendation">IA Recomendação</SelectItem>
                <SelectItem value="popularity">Popularidade</SelectItem>
                <SelectItem value="success_rate">Taxa de Sucesso</SelectItem>
                <SelectItem value="complexity">Complexidade</SelectItem>
                <SelectItem value="alphabetical">Alfabética</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs with different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai_recommended" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            IA Recomenda ({aiRecommendedFrameworks.length})
          </TabsTrigger>
          <TabsTrigger value="popular" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Populares
          </TabsTrigger>
          <TabsTrigger value="by_category" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Por Categoria
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Todos ({filteredFrameworks.length})
          </TabsTrigger>
        </TabsList>

        {/* AI Recommended Tab */}
        <TabsContent value="ai_recommended" className="mt-6">
          {aiRecommendedFrameworks.length > 0 ? (
            <>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Brain className="h-6 w-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                    Recomendações Personalizadas IA
                  </h3>
                </div>
                <p className="text-purple-700 dark:text-purple-300 mb-3">
                  Baseado no seu perfil organizacional, setor e requisitos de compliance
                </p>
                <div className="flex flex-wrap gap-2">
                  {userContext?.industry && (
                    <Badge variant="outline" className="text-purple-700 border-purple-300">
                      Indústria: {userContext.industry}
                    </Badge>
                  )}
                  {userContext?.company_size && (
                    <Badge variant="outline" className="text-purple-700 border-purple-300">
                      Porte: {userContext.company_size}
                    </Badge>
                  )}
                  {user?.user_metadata?.role && (
                    <Badge variant="outline" className="text-purple-700 border-purple-300">
                      Role: {user.user_metadata.role}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiRecommendedFrameworks.map(framework => (
                  <FrameworkCard key={framework.id} framework={framework} />
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Preparando Recomendações IA</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Nossa IA está analisando seu perfil organizacional para sugerir os melhores frameworks
                </p>
                {isLoadingAI && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Popular Tab */}
        <TabsContent value="popular" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFrameworks
              .sort((a, b) => b.usage_stats.usage_count - a.usage_stats.usage_count)
              .slice(0, 12)
              .map(framework => (
                <FrameworkCard key={framework.id} framework={framework} />
              ))}
          </div>
        </TabsContent>

        {/* By Category Tab */}
        <TabsContent value="by_category" className="mt-6">
          <div className="space-y-8">
            {Object.entries(
              filteredFrameworks.reduce((acc, framework) => {
                if (!acc[framework.category]) {
                  acc[framework.category] = [];
                }
                acc[framework.category].push(framework);
                return acc;
              }, {} as { [key: string]: EnhancedFramework[] })
            ).map(([category, categoryFrameworks]) => (
              <div key={category}>
                <div className="flex items-center gap-3 mb-4">
                  {React.createElement(getCategoryIcon(category), { className: "h-6 w-6 text-blue-600" })}
                  <h3 className="text-xl font-semibold">{category}</h3>
                  <Badge variant="secondary" className="ml-2">
                    {categoryFrameworks.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryFrameworks.map(framework => (
                    <FrameworkCard key={framework.id} framework={framework} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* All Tab */}
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFrameworks.map(framework => (
              <FrameworkCard key={framework.id} framework={framework} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {filteredFrameworks.length === 0 && !isFrameworksLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum framework encontrado</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Tente ajustar os filtros de busca ou explorar outras categorias
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedIndustry('all');
                setSelectedRegion('all');
              }}
            >
              Limpar Filtros
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Framework Details Sidebar */}
      {selectedFramework && (
        <Card className="fixed right-6 top-24 w-96 max-h-[calc(100vh-200px)] overflow-y-auto z-50 shadow-2xl border-2 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {React.createElement(getCategoryIcon(selectedFramework.category), { 
                  className: "h-6 w-6 text-blue-600" 
                })}
                <div className="min-w-0">
                  <CardTitle className="text-lg line-clamp-1">{selectedFramework.name}</CardTitle>
                  <p className="text-sm text-gray-600">
                    v{selectedFramework.version} • {selectedFramework.category}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedFramework(null)}
                className="flex-shrink-0"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Description */}
            <div>
              <h4 className="font-semibold mb-2">Descrição</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedFramework.description}
              </p>
            </div>

            {/* AI Insights */}
            {selectedFramework.ai_insights.recommendation_score > 60 && (
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                    Análise IA
                  </h4>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    {Math.round(selectedFramework.ai_insights.recommendation_score)}% Match
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-purple-900 dark:text-purple-100 mb-1">
                      Por que recomendamos:
                    </p>
                    {selectedFramework.ai_insights.match_reasons.map((reason, idx) => (
                      <p key={idx} className="text-xs text-purple-700 dark:text-purple-300">
                        • {reason}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Statistics */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Estatísticas
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Controles:</span>
                    <span className="font-medium">{selectedFramework.controls?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Usos:</span>
                    <span className="font-medium">{selectedFramework.usage_stats.usage_count}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sucesso:</span>
                    <span className="font-medium">{selectedFramework.usage_stats.success_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Score:</span>
                    <span className="font-medium">{selectedFramework.usage_stats.avg_compliance_score}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Implementation Details */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Implementação
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tempo estimado:</span>
                  <span className="font-medium">
                    {selectedFramework.metadata.estimated_implementation_time} dias
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Complexidade:</span>
                  <Badge className={getComplexityColor(selectedFramework.metadata.complexity_score)}>
                    {getComplexityLevel(selectedFramework.metadata.complexity_score)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Industry Focus */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Building className="h-4 w-4" />
                Setores Aplicáveis
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedFramework.metadata.industry_focus.map(industry => (
                  <Badge key={industry} variant="outline" className="text-xs">
                    {industry}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Regions */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Regiões Aplicáveis
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedFramework.metadata.applicable_regions.map(region => (
                  <Badge key={region} variant="outline" className="text-xs">
                    {region}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <Button 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              onClick={() => {
                console.log('✅ [FRAMEWORK LIBRARY] Framework selecionado para uso:', selectedFramework.name);
                toast.success(`Iniciando assessment com ${selectedFramework.name}`);
                onUseFramework(selectedFramework.id);
                setSelectedFramework(null);
              }}
            >
              <Zap className="h-4 w-4 mr-2" />
              Criar Assessment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AlexFrameworkLibraryEnhanced;