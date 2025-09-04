/**
 * ALEX FRAMEWORK LIBRARY - Biblioteca de frameworks inteligente
 * 
 * Componente para explorar e selecionar frameworks com mais de 25 opções
 * Interface com recomendações IA e filtering avançado
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  BarChart3
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface FrameworkLibrary {
  id: string;
  name: string;
  short_name: string;
  category: string;
  description?: string;
  version: string;
  controls_definition: any[];
  domains_structure: any;
  industry_focus: string[];
  compliance_domains: string[];
  applicable_regions: string[];
  certification_requirements: any;
  is_global: boolean;
  is_premium: boolean;
  usage_count: number;
  avg_completion_time?: number;
  avg_compliance_score?: number;
}

interface AlexFrameworkLibraryProps {
  frameworks: FrameworkLibrary[];
  searchTerm: string;
  selectedCategory: string;
  recommendedFrameworks: FrameworkLibrary[];
  isLoading: boolean;
}

const AlexFrameworkLibrary: React.FC<AlexFrameworkLibraryProps> = ({
  frameworks,
  searchTerm,
  selectedCategory,
  recommendedFrameworks,
  isLoading
}) => {
  const isMobile = useIsMobile();
  const [selectedFramework, setSelectedFramework] = useState<FrameworkLibrary | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterIndustry, setFilterIndustry] = useState<string>('');
  const [filterRegion, setFilterRegion] = useState<string>('');

  // Get unique values for filters
  const allIndustries = useMemo(() => {
    const industries = new Set<string>();
    frameworks.forEach(fw => fw.industry_focus.forEach(ind => industries.add(ind)));
    return Array.from(industries).sort();
  }, [frameworks]);

  const allRegions = useMemo(() => {
    const regions = new Set<string>();
    frameworks.forEach(fw => fw.applicable_regions.forEach(reg => regions.add(reg)));
    return Array.from(regions).sort();
  }, [frameworks]);

  // Filter frameworks
  const filteredFrameworks = useMemo(() => {
    return frameworks.filter(framework => {
      const matchesSearch = !searchTerm || 
        framework.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        framework.short_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        framework.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || framework.category === selectedCategory;
      const matchesIndustry = !filterIndustry || framework.industry_focus.includes(filterIndustry);
      const matchesRegion = !filterRegion || framework.applicable_regions.includes(filterRegion);
      
      return matchesSearch && matchesCategory && matchesIndustry && matchesRegion;
    });
  }, [frameworks, searchTerm, selectedCategory, filterIndustry, filterRegion]);

  // Group frameworks by category
  const frameworksByCategory = useMemo(() => {
    const grouped: { [key: string]: FrameworkLibrary[] } = {};
    filteredFrameworks.forEach(framework => {
      if (!grouped[framework.category]) {
        grouped[framework.category] = [];
      }
      grouped[framework.category].push(framework);
    });
    return grouped;
  }, [filteredFrameworks]);

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
    return icons[category] || BookOpen;
  };

  const getPopularityColor = (usageCount: number) => {
    if (usageCount > 1000) return 'text-green-600 bg-green-50';
    if (usageCount > 500) return 'text-blue-600 bg-blue-50';
    if (usageCount > 100) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const FrameworkCard = ({ framework }: { framework: FrameworkLibrary }) => {
    const IconComponent = getCategoryIcon(framework.category);
    const popularityClass = getPopularityColor(framework.usage_count);
    
    return (
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
          selectedFramework?.id === framework.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
        }`}
        onClick={() => setSelectedFramework(framework)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950">
                <IconComponent className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg leading-tight">{framework.name}</CardTitle>
                <p className="text-sm text-gray-500 font-mono">{framework.short_name}</p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {framework.is_global && (
                <Badge variant="secondary" className="text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  Global
                </Badge>
              )}
              {framework.is_premium && (
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                  <Star className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {framework.description || 'Framework de compliance e governança'}
          </p>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Versão:</span>
            <Badge variant="outline" className="font-mono text-xs">
              v{framework.version}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Controles:</span>
            <span className="font-medium">{framework.controls_definition.length}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Popularidade:</span>
              <Badge variant="secondary" className={popularityClass}>
                {framework.usage_count} usos
              </Badge>
            </div>
          </div>
          
          {framework.avg_compliance_score && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Score Médio:</span>
                <span className="font-medium">{framework.avg_compliance_score.toFixed(1)}%</span>
              </div>
              <Progress value={framework.avg_compliance_score} className="h-2" />
            </div>
          )}
          
          {/* Industry Tags */}
          <div className="flex flex-wrap gap-1 mt-3">
            {framework.industry_focus.slice(0, 3).map(industry => (
              <Badge key={industry} variant="outline" className="text-xs">
                {industry}
              </Badge>
            ))}
            {framework.industry_focus.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{framework.industry_focus.length - 3}
              </Badge>
            )}
          </div>
          
          <Button 
            className="w-full mt-4" 
            onClick={(e) => {
              e.stopPropagation();
              // Handle create assessment from framework
            }}
          >
            Criar Assessment
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  };

  const FilterBar = () => (
    <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <select
        value={filterIndustry}
        onChange={(e) => setFilterIndustry(e.target.value)}
        className="px-3 py-2 border rounded-md bg-background text-foreground text-sm"
      >
        <option value="">Todos os setores</option>
        {allIndustries.map(industry => (
          <option key={industry} value={industry}>{industry}</option>
        ))}
      </select>
      
      <select
        value={filterRegion}
        onChange={(e) => setFilterRegion(e.target.value)}
        className="px-3 py-2 border rounded-md bg-background text-foreground text-sm"
      >
        <option value="">Todas as regiões</option>
        {allRegions.map(region => (
          <option key={region} value={region}>{region}</option>
        ))}
      </select>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setFilterIndustry('');
          setFilterRegion('');
        }}
      >
        Limpar Filtros
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FilterBar />
      
      <Tabs defaultValue="recommended" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommended" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Recomendados ({recommendedFrameworks.length})
          </TabsTrigger>
          <TabsTrigger value="popular" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Populares
          </TabsTrigger>
          <TabsTrigger value="category" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Por Categoria
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Todos ({filteredFrameworks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="mt-6">
          {recommendedFrameworks.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-5 w-5 text-purple-500" />
                <p className="text-gray-600 dark:text-gray-400">
                  Frameworks recomendados para seu perfil organizacional
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedFrameworks.map((framework) => (
                  <FrameworkCard key={framework.id} framework={framework} />
                ))}
              </div>
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Configure seu perfil</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Para receber recomendações personalizadas, configure suas preferências organizacionais
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="popular" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFrameworks
              .sort((a, b) => b.usage_count - a.usage_count)
              .slice(0, 12)
              .map((framework) => (
                <FrameworkCard key={framework.id} framework={framework} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="category" className="mt-6">
          <div className="space-y-8">
            {Object.entries(frameworksByCategory).map(([category, categoryFrameworks]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-4">
                  {React.createElement(getCategoryIcon(category), { className: "h-5 w-5" })}
                  <h3 className="text-lg font-semibold">{category}</h3>
                  <Badge variant="secondary">{categoryFrameworks.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryFrameworks.map((framework) => (
                    <FrameworkCard key={framework.id} framework={framework} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFrameworks.map((framework) => (
              <FrameworkCard key={framework.id} framework={framework} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Framework Details Panel */}
      {selectedFramework && (
        <Card className="mt-8 border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {React.createElement(getCategoryIcon(selectedFramework.category), { 
                  className: "h-6 w-6 text-blue-600" 
                })}
                <div>
                  <CardTitle className="text-xl">{selectedFramework.name}</CardTitle>
                  <p className="text-gray-500">{selectedFramework.short_name} • v{selectedFramework.version}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setSelectedFramework(null)}>
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Descrição</h4>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedFramework.description || 'Framework de compliance e governança'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Setores Focados
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedFramework.industry_focus.map(industry => (
                    <Badge key={industry} variant="outline">{industry}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Regiões Aplicáveis
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedFramework.applicable_regions.map(region => (
                    <Badge key={region} variant="outline">{region}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Estatísticas
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Controles:</span>
                    <span className="font-medium">{selectedFramework.controls_definition.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Usos:</span>
                    <span className="font-medium">{selectedFramework.usage_count}</span>
                  </div>
                  {selectedFramework.avg_completion_time && (
                    <div className="flex justify-between">
                      <span>Tempo médio:</span>
                      <span className="font-medium">{selectedFramework.avg_completion_time}d</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500">
              Criar Assessment com {selectedFramework.short_name}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AlexFrameworkLibrary;