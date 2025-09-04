/**
 * ALEX TEMPLATE SELECTOR - Seletor de templates inteligente
 * 
 * Componente para seleção de templates com recomendações IA
 * Interface adaptativa baseada no perfil do usuário
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Award
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface AssessmentTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  version: string;
  is_global: boolean;
  usage_count: number;
  ai_enabled: boolean;
  base_framework_id?: string;
  created_at: string;
}

interface AlexTemplateSelectorProps {
  templates: AssessmentTemplate[];
  searchTerm: string;
  onCreateAssessment: (templateId: string) => void;
  isLoading: boolean;
}

const AlexTemplateSelector: React.FC<AlexTemplateSelectorProps> = ({
  templates,
  searchTerm,
  onCreateAssessment,
  isLoading
}) => {
  const isMobile = useIsMobile();
  const [selectedTemplate, setSelectedTemplate] = useState<AssessmentTemplate | null>(null);

  // Filter templates based on search
  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                onCreateAssessment(template.id);
              }}
            >
              Criar Assessment
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
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
              onClick={() => onCreateAssessment(selectedTemplate.id)}
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