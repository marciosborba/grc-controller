import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RiskTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  industry: string;
  riskLevel: 'Muito Alto' | 'Alto' | 'Médio' | 'Baixo' | 'Muito Baixo';
  probability: number;
  impact: number;
  methodology: string;
  controls: string[];
  kris: string[];
  usageCount: number;
  rating: number;
  isPopular: boolean;
  isFavorite: boolean;
  createdBy: string;
  lastUpdated: string;
  tags: string[];
  alexRiskSuggested: boolean;
}

interface RiskLibraryIntegratedProps {
  onSelectTemplate: (template: RiskTemplate) => void;
}

export const RiskLibraryIntegrated: React.FC<RiskLibraryIntegratedProps> = ({
  onSelectTemplate
}) => {
  const [templates, setTemplates] = useState<RiskTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Dados simulados da biblioteca (em produção viria da API)
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    
    // Simular carregamento
    setTimeout(() => {
      const mockTemplates: RiskTemplate[] = [
        {
          id: 'cyber-001',
          name: 'Ataque de Ransomware',
          description: 'Risco de sequestro de dados por malware com demanda de resgate',
          category: 'Tecnológico',
          industry: 'Financeiro',
          riskLevel: 'Muito Alto',
          probability: 4,
          impact: 5,
          methodology: 'NIST Cybersecurity Framework',
          controls: [
            'Backup automatizado diário',
            'Treinamento de phishing',
            'Segmentação de rede',
            'Monitoramento 24/7'
          ],
          kris: [
            'Tentativas de phishing detectadas',
            'Tempo de resposta a incidentes',
            'Taxa de backup bem-sucedido'
          ],
          usageCount: 1247,
          rating: 4.8,
          isPopular: true,
          isFavorite: false,
          createdBy: 'Alex Risk IA',
          lastUpdated: '2024-12-15',
          tags: ['cibersegurança', 'malware', 'backup', 'crítico'],
          alexRiskSuggested: true
        },
        {
          id: 'op-001',
          name: 'Falha de Sistema Crítico',
          description: 'Indisponibilidade de sistemas essenciais para operação',
          category: 'Operacional',
          industry: 'Tecnologia',
          riskLevel: 'Alto',
          probability: 3,
          impact: 4,
          methodology: 'ISO 31000',
          controls: [
            'Redundância de sistemas',
            'Plano de contingência',
            'Monitoramento proativo',
            'SLA com fornecedores'
          ],
          kris: [
            'Uptime dos sistemas',
            'Tempo médio de recuperação',
            'Número de incidentes'
          ],
          usageCount: 892,
          rating: 4.6,
          isPopular: true,
          isFavorite: true,
          createdBy: 'Especialista TI',
          lastUpdated: '2024-12-10',
          tags: ['sistemas', 'disponibilidade', 'contingência'],
          alexRiskSuggested: false
        },
        {
          id: 'reg-001',
          name: 'Não Conformidade LGPD',
          description: 'Violação das normas de proteção de dados pessoais',
          category: 'Regulatório',
          industry: 'Geral',
          riskLevel: 'Alto',
          probability: 3,
          impact: 4,
          methodology: 'COSO ERM',
          controls: [
            'Mapeamento de dados',
            'Políticas de privacidade',
            'Treinamento LGPD',
            'Auditoria regular'
          ],
          kris: [
            'Solicitações de titulares',
            'Incidentes de vazamento',
            'Taxa de conformidade'
          ],
          usageCount: 654,
          rating: 4.4,
          isPopular: false,
          isFavorite: false,
          createdBy: 'Jurídico',
          lastUpdated: '2024-12-08',
          tags: ['lgpd', 'privacidade', 'conformidade'],
          alexRiskSuggested: true
        },
        {
          id: 'fin-001',
          name: 'Risco de Liquidez',
          description: 'Insuficiência de recursos para honrar compromissos',
          category: 'Financeiro',
          industry: 'Financeiro',
          riskLevel: 'Médio',
          probability: 2,
          impact: 4,
          methodology: 'Basel III',
          controls: [
            'Gestão de caixa',
            'Linhas de crédito',
            'Stress testing',
            'Monitoramento diário'
          ],
          kris: [
            'Índice de liquidez',
            'Prazo médio de recebimento',
            'Concentração de clientes'
          ],
          usageCount: 423,
          rating: 4.2,
          isPopular: false,
          isFavorite: true,
          createdBy: 'Financeiro',
          lastUpdated: '2024-12-05',
          tags: ['liquidez', 'caixa', 'financeiro'],
          alexRiskSuggested: false
        },
        {
          id: 'rep-001',
          name: 'Crise de Reputação',
          description: 'Danos à imagem e reputação da organização',
          category: 'Reputacional',
          industry: 'Geral',
          riskLevel: 'Alto',
          probability: 2,
          impact: 5,
          methodology: 'Análise de Cenários',
          controls: [
            'Monitoramento de mídia',
            'Plano de comunicação',
            'Gestão de crise',
            'Relacionamento público'
          ],
          kris: [
            'Menções na mídia',
            'Sentiment analysis',
            'NPS - Net Promoter Score'
          ],
          usageCount: 312,
          rating: 4.0,
          isPopular: false,
          isFavorite: false,
          createdBy: 'Marketing',
          lastUpdated: '2024-12-01',
          tags: ['reputação', 'mídia', 'comunicação'],
          alexRiskSuggested: true
        }
      ];
      
      setTemplates(mockTemplates);
      setIsLoading(false);
    }, 1000);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesIndustry = selectedIndustry === 'all' || template.industry === selectedIndustry;
    const matchesFavorites = !showFavorites || template.isFavorite;
    
    return matchesSearch && matchesCategory && matchesIndustry && matchesFavorites;
  });

  const categories = [...new Set(templates.map(t => t.category))];
  const industries = [...new Set(templates.map(t => t.industry))];

  const handleToggleFavorite = (templateId: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t
    ));
    
    toast({
      title: '⭐ Favorito Atualizado',
      description: 'Template adicionado/removido dos favoritos',
    });
  };

  const handleUseTemplate = (template: RiskTemplate) => {
    // Incrementar contador de uso
    setTemplates(prev => prev.map(t => 
      t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t
    ));
    
    onSelectTemplate(template);
    
    toast({
      title: '✅ Template Aplicado',
      description: `Template "${template.name}" será usado para criar novo risco`,
    });
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Muito Alto': return 'bg-red-100 text-red-800 border-red-200';
      case 'Alto': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Médio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baixo': return 'bg-green-100 text-green-800 border-green-200';
      case 'Muito Baixo': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
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
    <div className="space-y-6">
      {/* Header da Biblioteca */}
      <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Library className="h-6 w-6 text-green-600" />
            <span>Biblioteca Inteligente de Riscos</span>
            <Badge variant="secondary" className="bg-green-100 text-green-700">50+ Templates</Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Templates pré-configurados com metodologias, controles e KRIs baseados em melhores práticas de mercado
          </p>
        </CardHeader>
      </Card>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Categoria */}
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
            
            {/* Indústria */}
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
            
            {/* Favoritos */}
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
                <Brain className="h-4 w-4 text-purple-500" />
                <span>{templates.filter(t => t.alexRiskSuggested).length} sugeridos por Alex Risk</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>{templates.filter(t => t.isPopular).length} populares</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-all duration-200 relative">
            {/* Badges de Status */}
            <div className="absolute top-4 right-4 flex flex-col space-y-1">
              {template.alexRiskSuggested && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                  <Brain className="h-3 w-3 mr-1" />
                  Alex IA
                </Badge>
              )}
              {template.isPopular && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              )}
            </div>
            
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-8">
                  <CardTitle className="text-lg truncate">{template.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                </div>
              </div>
              
              {/* Metadados */}
              <div className="flex items-center space-x-2 mt-3">
                <Badge variant="outline" className="text-xs">{template.category}</Badge>
                <Badge variant="outline" className="text-xs">{template.industry}</Badge>
                <Badge className={`text-xs ${getRiskLevelColor(template.riskLevel)}`}>
                  {template.riskLevel}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Rating e Uso */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-1">
                  {renderStars(template.rating)}
                  <span className="text-xs text-muted-foreground ml-1">({template.rating})</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{template.usageCount} usos</span>
                </div>
              </div>
              
              {/* Metodologia */}
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">METODOLOGIA</p>
                <Badge variant="outline" className="text-xs">{template.methodology}</Badge>
              </div>
              
              {/* Controles (preview) */}
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">CONTROLES ({template.controls.length})</p>
                <div className="space-y-1">
                  {template.controls.slice(0, 2).map((control, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="truncate">{control}</span>
                    </div>
                  ))}
                  {template.controls.length > 2 && (
                    <p className="text-xs text-muted-foreground">+{template.controls.length - 2} controles</p>
                  )}
                </div>
              </div>
              
              {/* Tags */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Ações */}
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => handleUseTemplate(template)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white"
                  size="sm"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Usar Template
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleToggleFavorite(template.id)}
                >
                  <Heart className={`h-3 w-3 ${template.isFavorite ? 'fill-current text-red-500' : ''}`} />
                </Button>
                
                <Button variant="outline" size="sm">
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
              
              {/* Metadados de rodapé */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                <span>Por: {template.createdBy}</span>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{template.lastUpdated}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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