import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Plus,
  Copy,
  Edit,
  Trash2,
  Download,
  Upload,
  Star,
  FileText,
  Shield,
  Users,
  Activity,
  Zap,
  BarChart3,
  Target,
  MessageSquare,
  Eye,
  Search
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { AlexPolicyConfig } from '@/types/policy-management';

interface PolicyTemplatesProps {
  onTemplateSelect: (template: PolicyTemplate) => void;
  alexConfig: AlexPolicyConfig;
  searchTerm: string;
}

interface PolicyTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  content: {
    sections: Array<{
      id: string;
      title: string;
      content: string;
      required: boolean;
    }>;
    metadata: {
      compliance_frameworks: string[];
      tags: string[];
      estimated_completion_time: number;
    };
  };
  is_featured: boolean;
  usage_count: number;
  rating: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const PolicyTemplates: React.FC<PolicyTemplatesProps> = ({
  onTemplateSelect,
  alexConfig,
  searchTerm
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [templates, setTemplates] = useState<PolicyTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PolicyTemplate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const [newTemplate, setNewTemplate] = useState({
    title: '',
    description: '',
    category: 'governance',
    type: 'policy',
    content: {
      sections: [
        { id: '1', title: 'Objetivo', content: '', required: true },
        { id: '2', title: 'Escopo', content: '', required: true },
        { id: '3', title: 'Responsabilidades', content: '', required: true }
      ],
      metadata: {
        compliance_frameworks: [],
        tags: [],
        estimated_completion_time: 30
      }
    }
  });

  // Templates predefinidos
  const predefinedTemplates: PolicyTemplate[] = [
    {
      id: 'template-security',
      title: 'Política de Segurança da Informação',
      description: 'Template completo para política de segurança da informação baseado em ISO 27001',
      category: 'security',
      type: 'policy',
      content: {
        sections: [
          {
            id: '1',
            title: 'Objetivo',
            content: 'Esta política tem como objetivo estabelecer diretrizes para proteção das informações corporativas, garantindo a confidencialidade, integridade e disponibilidade dos dados da organização.',
            required: true
          },
          {
            id: '2',
            title: 'Escopo',
            content: 'Esta política aplica-se a todos os colaboradores, terceiros, fornecedores e parceiros que tenham acesso às informações da organização, independentemente do formato ou meio de armazenamento.',
            required: true
          },
          {
            id: '3',
            title: 'Responsabilidades',
            content: 'Todos os usuários são responsáveis por: proteger informações confidenciais, utilizar senhas seguras, reportar incidentes de segurança, manter software atualizado e seguir as diretrizes estabelecidas.',
            required: true
          },
          {
            id: '4',
            title: 'Classificação da Informação',
            content: 'As informações são classificadas em: Pública, Interna, Confidencial e Restrita. Cada classificação possui controles específicos de acesso e proteção.',
            required: false
          },
          {
            id: '5',
            title: 'Controles de Acesso',
            content: 'O acesso às informações deve seguir o princípio do menor privilégio, com autenticação multifator obrigatória para sistemas críticos e revisão periódica de permissões.',
            required: false
          }
        ],
        metadata: {
          compliance_frameworks: ['ISO27001', 'LGPD', 'SOX'],
          tags: ['segurança', 'informação', 'ISO27001', 'LGPD'],
          estimated_completion_time: 45
        }
      },
      is_featured: true,
      usage_count: 156,
      rating: 4.8,
      created_by: 'Alex Policy',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: 'template-governance',
      title: 'Política de Governança Corporativa',
      description: 'Template para política de governança corporativa com foco em transparência e accountability',
      category: 'governance',
      type: 'policy',
      content: {
        sections: [
          {
            id: '1',
            title: 'Objetivo',
            content: 'Estabelecer princípios e diretrizes de governança corporativa para assegurar transparência, equidade, prestação de contas e responsabilidade corporativa.',
            required: true
          },
          {
            id: '2',
            title: 'Princípios de Governança',
            content: 'A governança corporativa baseia-se nos princípios de transparência, equidade, prestação de contas e responsabilidade corporativa.',
            required: true
          },
          {
            id: '3',
            title: 'Estrutura de Governança',
            content: 'Define a estrutura organizacional, papéis e responsabilidades dos órgãos de governança, incluindo Conselho de Administração, Diretoria e Comitês.',
            required: true
          }
        ],
        metadata: {
          compliance_frameworks: ['IBGC', 'CVM', 'SOX'],
          tags: ['governança', 'transparência', 'accountability'],
          estimated_completion_time: 60
        }
      },
      is_featured: true,
      usage_count: 89,
      rating: 4.6,
      created_by: 'Alex Policy',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-10T00:00:00Z'
    },
    {
      id: 'template-compliance',
      title: 'Política de Compliance',
      description: 'Template para política de compliance e conformidade regulatória',
      category: 'compliance',
      type: 'policy',
      content: {
        sections: [
          {
            id: '1',
            title: 'Objetivo',
            content: 'Estabelecer diretrizes para assegurar o cumprimento de leis, regulamentos, normas e padrões aplicáveis às atividades da organização.',
            required: true
          },
          {
            id: '2',
            title: 'Programa de Compliance',
            content: 'Define a estrutura do programa de compliance, incluindo identificação de riscos, controles, monitoramento e reporte.',
            required: true
          },
          {
            id: '3',
            title: 'Código de Conduta',
            content: 'Estabelece padrões éticos e de conduta esperados de todos os colaboradores e parceiros de negócio.',
            required: true
          }
        ],
        metadata: {
          compliance_frameworks: ['COSO', 'ISO19600', 'LGPD'],
          tags: ['compliance', 'ética', 'regulamentação'],
          estimated_completion_time: 40
        }
      },
      is_featured: false,
      usage_count: 67,
      rating: 4.4,
      created_by: 'Alex Policy',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-08T00:00:00Z'
    },
    {
      id: 'template-hr',
      title: 'Política de Recursos Humanos',
      description: 'Template para políticas de RH incluindo recrutamento, desenvolvimento e retenção',
      category: 'hr',
      type: 'policy',
      content: {
        sections: [
          {
            id: '1',
            title: 'Objetivo',
            content: 'Estabelecer diretrizes para gestão de pessoas, incluindo recrutamento, seleção, desenvolvimento, avaliação e retenção de talentos.',
            required: true
          },
          {
            id: '2',
            title: 'Recrutamento e Seleção',
            content: 'Define processos transparentes e isentos para atração e seleção de candidatos, baseados em competências e meritocracia.',
            required: true
          },
          {
            id: '3',
            title: 'Desenvolvimento e Capacitação',
            content: 'Estabelece programas de desenvolvimento profissional, treinamentos e capacitação contínua dos colaboradores.',
            required: true
          }
        ],
        metadata: {
          compliance_frameworks: ['CLT', 'ISO45001'],
          tags: ['recursos humanos', 'desenvolvimento', 'capacitação'],
          estimated_completion_time: 35
        }
      },
      is_featured: false,
      usage_count: 45,
      rating: 4.2,
      created_by: 'Alex Policy',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-05T00:00:00Z'
    }
  ];

  useEffect(() => {
    setTemplates(predefinedTemplates);
  }, []);

  // Filtrar templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'governance': return Shield;
      case 'compliance': return Target;
      case 'security': return Shield;
      case 'hr': return Users;
      case 'operational': return Activity;
      case 'it': return Zap;
      case 'financial': return BarChart3;
      default: return FileText;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'governance': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400';
      case 'compliance': return 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400';
      case 'security': return 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400';
      case 'hr': return 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-400';
      case 'operational': return 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-400';
      case 'it': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-400';
      case 'financial': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-950/50 dark:text-gray-400';
    }
  };

  const handleCreateTemplate = async () => {
    setLoading(true);
    try {
      const template: PolicyTemplate = {
        id: `template-${Date.now()}`,
        ...newTemplate,
        is_featured: false,
        usage_count: 0,
        rating: 0,
        created_by: user?.email || 'Usuário',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setTemplates(prev => [...prev, template]);
      
      toast({
        title: 'Template Criado',
        description: 'Template criado com sucesso'
      });

      setShowCreateDialog(false);
      setNewTemplate({
        title: '',
        description: '',
        category: 'governance',
        type: 'policy',
        content: {
          sections: [
            { id: '1', title: 'Objetivo', content: '', required: true },
            { id: '2', title: 'Escopo', content: '', required: true },
            { id: '3', title: 'Responsabilidades', content: '', required: true }
          ],
          metadata: {
            compliance_frameworks: [],
            tags: [],
            estimated_completion_time: 30
          }
        }
      });
    } catch (error) {
      console.error('Erro ao criar template:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar template',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = (template: PolicyTemplate) => {
    // Incrementar contador de uso
    setTemplates(prev => prev.map(t => 
      t.id === template.id 
        ? { ...t, usage_count: t.usage_count + 1 }
        : t
    ));

    onTemplateSelect(template);
    
    toast({
      title: 'Template Selecionado',
      description: `Template "${template.title}" será usado para criar nova política`
    });
  };

  const categories = [
    { id: 'all', name: 'Todos', count: filteredTemplates.length },
    { id: 'governance', name: 'Governança', count: templates.filter(t => t.category === 'governance').length },
    { id: 'compliance', name: 'Compliance', count: templates.filter(t => t.category === 'compliance').length },
    { id: 'security', name: 'Segurança', count: templates.filter(t => t.category === 'security').length },
    { id: 'hr', name: 'RH', count: templates.filter(t => t.category === 'hr').length },
    { id: 'operational', name: 'Operacional', count: templates.filter(t => t.category === 'operational').length },
    { id: 'it', name: 'TI', count: templates.filter(t => t.category === 'it').length },
    { id: 'financial', name: 'Financeiro', count: templates.filter(t => t.category === 'financial').length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Templates de Políticas
          </h2>
          <p className="text-muted-foreground">
            Biblioteca de templates para acelerar a criação de políticas
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input
                      value={newTemplate.title}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Política de Segurança"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select 
                      value={newTemplate.category} 
                      onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="governance">Governança</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                        <SelectItem value="security">Segurança</SelectItem>
                        <SelectItem value="hr">Recursos Humanos</SelectItem>
                        <SelectItem value="operational">Operacional</SelectItem>
                        <SelectItem value="it">Tecnologia</SelectItem>
                        <SelectItem value="financial">Financeiro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o propósito e uso deste template..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Seções do Template</Label>
                  <div className="space-y-2">
                    {newTemplate.content.sections.map((section, index) => (
                      <div key={section.id} className="flex items-center space-x-2">
                        <Input
                          value={section.title}
                          onChange={(e) => {
                            const newSections = [...newTemplate.content.sections];
                            newSections[index].title = e.target.value;
                            setNewTemplate(prev => ({
                              ...prev,
                              content: { ...prev.content, sections: newSections }
                            }));
                          }}
                          placeholder="Título da seção"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newSections = newTemplate.content.sections.filter((_, i) => i !== index);
                            setNewTemplate(prev => ({
                              ...prev,
                              content: { ...prev.content, sections: newSections }
                            }));
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newSection = {
                          id: (newTemplate.content.sections.length + 1).toString(),
                          title: '',
                          content: '',
                          required: false
                        };
                        setNewTemplate(prev => ({
                          ...prev,
                          content: {
                            ...prev.content,
                            sections: [...prev.content.sections, newSection]
                          }
                        }));
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Seção
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateTemplate} disabled={loading || !newTemplate.title.trim()}>
                    {loading ? 'Criando...' : 'Criar Template'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alex Policy Integration */}
      {alexConfig.enabled && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Alex Policy - Biblioteca de Templates</h3>
                  <p className="text-sm text-muted-foreground">
                    Templates inteligentes baseados em melhores práticas e frameworks
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <Star className="h-3 w-3 mr-1" />
                  Templates Curados
                </Badge>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Sugerir Template
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar templates por título, descrição ou tags..."
                  className="pl-10"
                  value={searchTerm}
                  readOnly
                />
              </div>
            </div>
            
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category.id)}
                  className="whitespace-nowrap"
                >
                  {category.name} ({category.count})
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates em Destaque */}
      {activeCategory === 'all' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Templates em Destaque
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.filter(t => t.is_featured).map((template) => {
              const CategoryIcon = getCategoryIcon(template.category);
              return (
                <Card key={template.id} className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <CategoryIcon className="h-5 w-5 text-yellow-600" />
                        <Badge className={getCategoryColor(template.category)}>
                          {template.category}
                        </Badge>
                      </div>
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    </div>
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{template.usage_count} usos</span>
                      <span>⭐ {template.rating}</span>
                      <span>{template.content.metadata.estimated_completion_time} min</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {template.content.metadata.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.content.metadata.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.content.metadata.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleUseTemplate(template)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Usar Template
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setShowPreviewDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Todos os Templates */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {activeCategory === 'all' ? 'Todos os Templates' : `Templates de ${categories.find(c => c.id === activeCategory)?.name}`}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.filter(t => activeCategory === 'all' || !t.is_featured).map((template) => {
            const CategoryIcon = getCategoryIcon(template.category);
            return (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <CategoryIcon className="h-5 w-5" />
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                    </div>
                    {template.is_featured && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{template.usage_count} usos</span>
                    <span>⭐ {template.rating}</span>
                    <span>{template.content.metadata.estimated_completion_time} min</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {template.content.metadata.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.content.metadata.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.content.metadata.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleUseTemplate(template)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Usar Template
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowPreviewDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground">Nenhum template encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? 'Tente ajustar os termos de busca ou filtros'
                : 'Seja o primeiro a criar um template nesta categoria'
              }
            </p>
            <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Template
            </Button>
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Preview: {selectedTemplate?.title}</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Categoria</Label>
                  <Badge className={getCategoryColor(selectedTemplate.category)}>
                    {selectedTemplate.category}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tempo Estimado</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedTemplate.content.metadata.estimated_completion_time} minutos
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Descrição</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedTemplate.description}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Seções do Template</Label>
                <div className="mt-2 space-y-3">
                  {selectedTemplate.content.sections.map((section) => (
                    <div key={section.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{section.title}</h4>
                        {section.required && (
                          <Badge variant="outline" className="text-xs">Obrigatório</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {section.content || 'Conteúdo a ser preenchido...'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Frameworks de Compliance</Label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedTemplate.content.metadata.compliance_frameworks.map((framework) => (
                    <Badge key={framework} variant="outline" className="text-xs">
                      {framework}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
                  Fechar
                </Button>
                <Button onClick={() => {
                  handleUseTemplate(selectedTemplate);
                  setShowPreviewDialog(false);
                }}>
                  <Copy className="h-4 w-4 mr-2" />
                  Usar Este Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PolicyTemplates;