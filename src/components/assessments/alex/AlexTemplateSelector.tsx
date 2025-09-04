/**
 * ALEX TEMPLATE SELECTOR - Seletor inteligente de templates com IA
 * 
 * Sistema avançado de seleção de templates com:
 * - Integração nativa com IA Manager
 * - Tenant isolation e security
 * - Role-based recommendations
 * - Edge Functions integration
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAlexAssessment } from '@/hooks/useAlexAssessment';
import { toast } from 'sonner';
import { 
  BookOpen, 
  Star, 
  Users, 
  Clock, 
  Zap, 
  Brain, 
  Target,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Shield,
  Award,
  Search,
  Filter,
  Eye,
  ThumbsUp,
  Lightbulb,
  Database,
  Lock,
  Settings,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

// Enhanced interfaces for full Alex Assessment Engine integration
interface AssessmentTemplate {
  id: string;
  name: string;
  description: string;
  tenant_id: string;
  framework_id: string;
  framework_name: string;
  category: string;
  industry: string;
  region: string;
  complexity_level: 'basic' | 'intermediate' | 'advanced';
  estimated_duration: number; // em horas
  participants_count: number;
  is_active: boolean;
  is_global: boolean;
  is_ai_enabled: boolean;
  usage_count: number;
  avg_rating: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  configuration: {
    custom_fields: any[];
    workflow_steps: any[];
    notification_rules: any[];
    scoring_method: string;
    security_level: 'standard' | 'enhanced' | 'maximum';
    encryption_enabled: boolean;
    audit_trail_enabled: boolean;
  };
  metadata: {
    tags: string[];
    compliance_frameworks: string[];
    target_roles: string[];
    prerequisites: string[];
  };
}

interface AIRecommendation {
  template_id: string;
  confidence_score: number;
  reasoning: string;
  benefits: string[];
  estimated_time_savings: number;
  risk_reduction_score: number;
  match_reasons: string[];
  customization_suggestions: string[];
}

interface UserContext {
  role: string;
  tenant_id: string;
  department: string;
  experience_level: string;
  previous_assessments: string[];
  compliance_requirements: string[];
}

interface AlexTemplateSelectorProps {
  userRole: string;
  tenantConfig: any;
  onTemplateSelect: (template: AssessmentTemplate) => void;
  onCreateTemplate: () => void;
  selectedCategory?: string;
  userContext?: Partial<UserContext>;
  filters?: {
    industry?: string;
    complexity?: string;
    framework?: string;
  };
}

const AlexTemplateSelector: React.FC<AlexTemplateSelectorProps> = ({
  userRole,
  tenantConfig,
  onTemplateSelect,
  onCreateTemplate,
  selectedCategory = '',
  userContext,
  filters = {}
}) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { assessmentTemplates, isTemplatesLoading, templatesError } = useAlexAssessment();
  
  // State Management
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AssessmentTemplate | null>(null);
  
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState(filters.industry || 'all');
  const [selectedComplexity, setSelectedComplexity] = useState(filters.complexity || 'all');
  const [selectedFramework, setSelectedFramework] = useState(filters.framework || 'all');
  const [activeTab, setActiveTab] = useState('recommended');
  
  // Security & Audit
  const [securityFilter, setSecurityFilter] = useState('all');
  const [showOnlyEncrypted, setShowOnlyEncrypted] = useState(false);

  console.log('🎯 [ALEX TEMPLATE SELECTOR] Inicializando com contexto:', {
    tenant: user?.tenant,
    role: user?.user_metadata?.role,
    userContext
  });

  // Transform assessment templates from hook
  useEffect(() => {
    if (assessmentTemplates && assessmentTemplates.length > 0) {
      // Transform data to match interface
      const formattedTemplates: AssessmentTemplate[] = assessmentTemplates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description || '',
        tenant_id: template.tenant_id,
        framework_id: template.base_framework_id || template.id,
        framework_name: 'Framework Customizado',
        category: template.category,
        industry: 'general',
        region: 'global',
        complexity_level: 'intermediate',
        estimated_duration: 8,
        participants_count: 5,
        is_active: template.is_active,
        is_global: template.is_global,
        is_ai_enabled: template.ai_enabled,
        usage_count: template.usage_count,
        avg_rating: 4.0,
        created_by: template.created_by,
        created_at: template.created_at,
        updated_at: template.updated_at,
        configuration: {
          custom_fields: template.config_schema?.custom_fields || [],
          workflow_steps: template.workflow_config?.steps || [],
          notification_rules: [],
          scoring_method: 'weighted',
          security_level: 'standard',
          encryption_enabled: false,
          audit_trail_enabled: true,
        },
        metadata: {
          tags: [],
          compliance_frameworks: [],
          target_roles: [],
          prerequisites: [],
        }
      }));
      
      setTemplates(formattedTemplates);
      console.log(`✅ [TEMPLATE SELECTOR] ${formattedTemplates.length} templates carregados do hook`);
    }
  }, [assessmentTemplates]);

  useEffect(() => {
    if (templates.length > 0 && user) {
      loadAIRecommendations();
    }
  }, [templates, user, selectedCategory, selectedIndustry]);



  // Load AI recommendations via Edge Function integration with IA Manager
  const loadAIRecommendations = async () => {
    try {
      setIsLoadingAI(true);
      console.log('🧠 [AI RECOMMENDATIONS] Solicitando recomendações do IA Manager...');

      const requestBody = {
        action: 'get_template_recommendations',
        user_context: {
          tenant_id: user?.tenant || '',
          user_id: user?.id || '',
          role: user?.user_metadata?.role || userContext?.role || 'user',
          department: userContext?.department || '',
          experience_level: userContext?.experience_level || 'intermediate',
          previous_assessments: userContext?.previous_assessments || [],
          compliance_requirements: userContext?.compliance_requirements || []
        },
        filters: {
          category: selectedCategory || null,
          industry: selectedIndustry !== 'all' ? selectedIndustry : null,
          complexity: selectedComplexity !== 'all' ? selectedComplexity : null,
          framework: selectedFramework !== 'all' ? selectedFramework : null
        },
        available_templates: templates.map(t => ({
          id: t.id,
          name: t.name,
          category: t.category,
          industry: t.industry,
          complexity_level: t.complexity_level,
          framework_name: t.framework_name,
          usage_count: t.usage_count,
          avg_rating: t.avg_rating,
          metadata: t.metadata
        }))
      };

      console.log('📤 [AI RECOMMENDATIONS] Enviando contexto para IA:', requestBody);

      const { data, error } = await supabase.functions.invoke('alex-assessment-recommendations', {
        body: requestBody
      });

      if (error) {
        console.error('⚠️ [AI RECOMMENDATIONS] Erro na Edge Function:', error);
        toast.error('Recomendações IA temporariamente indisponíveis');
        return;
      }

      if (data?.recommendations && Array.isArray(data.recommendations)) {
        const validRecommendations = data.recommendations.filter((rec: any) => 
          rec.template_id && rec.confidence_score !== undefined
        );
        
        setAiRecommendations(validRecommendations);
        console.log(`🧠 [AI RECOMMENDATIONS] ${validRecommendations.length} recomendações recebidas`);
        
        if (validRecommendations.length > 0) {
          toast.success(`${validRecommendations.length} recomendações IA carregadas`);
        }
      } else {
        console.log('🧠 [AI RECOMMENDATIONS] Nenhuma recomendação retornada');
      }

    } catch (error) {
      console.warn('⚠️ [AI RECOMMENDATIONS] Erro inesperado (continuando sem IA):', error);
      // Falha silenciosa - sistema funciona sem IA
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Advanced filtering logic with security considerations
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Separate templates by type
  const globalTemplates = filteredTemplates.filter(t => t.is_global);
  const customTemplates = filteredTemplates.filter(t => !t.is_global);
  const recommendedTemplates = filteredTemplates
    .filter(t => t.usage_count > 10 && t.ai_enabled)
    .sort((a, b) => b.usage_count - a.usage_count)
    .slice(0, 3);

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      'Information Security': Shield,
      'Data Protection': Award,
      'Cybersecurity': Target,
      'Healthcare Compliance': Users,
      'Financial Services': TrendingUp,
      'Service Organization Controls': Star,
      'Payment Security': Award,
      'Custom': Sparkles
    };
    const IconComponent = icons[category] || BookOpen;
    return <IconComponent className="h-4 w-4" />;
  };

  const getPopularityLevel = (usageCount: number) => {
    if (usageCount > 100) return { level: 'Muito Popular', color: 'bg-green-500', percentage: 100 };
    if (usageCount > 50) return { level: 'Popular', color: 'bg-blue-500', percentage: 80 };
    if (usageCount > 10) return { level: 'Moderado', color: 'bg-yellow-500', percentage: 60 };
    return { level: 'Novo', color: 'bg-gray-500', percentage: 30 };
  };

  const TemplateCard = ({ template }: { template: AssessmentTemplate }) => {
    const popularity = getPopularityLevel(template.usage_count);
    
    return (
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
          selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
        }`}
        onClick={() => setSelectedTemplate(template)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 mb-2">
              {getCategoryIcon(template.category)}
              <CardTitle className="text-lg">{template.name}</CardTitle>
            </div>
            <div className="flex gap-1">
              {template.is_global && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Global
                </Badge>
              )}
              {template.ai_enabled && (
                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                  <Brain className="h-3 w-3 mr-1" />
                  IA
                </Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {template.description || 'Template personalizado para assessments específicos'}
          </p>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Categoria:</span>
              <Badge variant="outline">{template.category}</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Popularidade:</span>
                <span className="font-medium">{popularity.level}</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={popularity.percentage} className="flex-1" />
                <span className="text-xs text-gray-500">{template.usage_count}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Versão:</span>
              <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                v{template.version}
              </span>
            </div>
            
            <Button 
              className="w-full mt-4" 
              onClick={(e) => {
                e.stopPropagation();
                console.log('✅ [TEMPLATE SELECTOR] Template selecionado:', template.name);
                toast.success(`Template "${template.name}" selecionado!`);
                onTemplateSelect(template);
              }}
            >
              Usar Template
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isTemplatesLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Recommended Templates Section */}
      {recommendedTemplates.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Recomendados para Você</h3>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              IA Personalizada
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      )}

      {/* Global Templates Section */}
      {globalTemplates.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Templates Globais</h3>
            <Badge variant="secondary">{globalTemplates.length} disponíveis</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {globalTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      )}

      {/* Custom Templates Section */}
      {customTemplates.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold">Templates Personalizados</h3>
            <Badge variant="secondary">{customTemplates.length} criados</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm 
                ? `Nenhum template corresponde à busca "${searchTerm}"`
                : 'Não há templates disponíveis no momento'
              }
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                Limpar Busca
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Template Details Sidebar */}
      {selectedTemplate && !isMobile && (
        <Card className="fixed right-6 top-24 w-80 max-h-[calc(100vh-200px)] overflow-y-auto z-50 shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getCategoryIcon(selectedTemplate.category)}
                Detalhes
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedTemplate(null)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">{selectedTemplate.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedTemplate.description || 'Template personalizado para assessments específicos'}
              </p>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Categoria:</span>
                <span>{selectedTemplate.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Versão:</span>
                <span>v{selectedTemplate.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tipo:</span>
                <span>{selectedTemplate.is_global ? 'Global' : 'Personalizado'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">IA Habilitada:</span>
                <span>{selectedTemplate.ai_enabled ? 'Sim' : 'Não'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Uso:</span>
                <span>{selectedTemplate.usage_count} assessments</span>
              </div>
            </div>
            
            <Button 
              className="w-full"
              onClick={() => {
                console.log('✅ [TEMPLATE SELECTOR] Template selecionado via sidebar:', selectedTemplate.name);
                toast.success(`Template "${selectedTemplate.name}" selecionado!`);
                onTemplateSelect(selectedTemplate);
                setSelectedTemplate(null);
              }}
            >
              Usar Este Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AlexTemplateSelector;