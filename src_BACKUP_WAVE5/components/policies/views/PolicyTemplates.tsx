import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FileText,
  Search,
  Filter,
  Copy,
  Eye,
  Download,
  Star,
  BookOpen,
  Shield,
  Users,
  DollarSign,
  Settings,
  Lightbulb,
  Globe,
  Briefcase,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useAuth} from '@/contexts/AuthContextOptimized';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PolicyTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  document_type: string;
  priority: string;
  metadata: {
    isTemplate: boolean;
    framework: string;
    content: any;
  };
  created_at: string;
  updated_at: string;
}

interface PolicyTemplatesProps {
  onPolicyUpdate?: () => void;
}

const PolicyTemplates: React.FC<PolicyTemplatesProps> = ({ onPolicyUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<PolicyTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<PolicyTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<PolicyTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [customizationData, setCustomizationData] = useState({
    title: '',
    description: '',
    content: ''
  });

  // Carregar templates
  useEffect(() => {
    loadTemplates();
  }, []);

  // Filtrar templates
  useEffect(() => {
    let filtered = templates;

    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(template => template.document_type === selectedType);
    }

    setFilteredTemplates(filtered);
  }, [templates, searchTerm, selectedCategory, selectedType]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .eq('metadata->>isTemplate', 'true')
        .order('category', { ascending: true })
        .order('title', { ascending: true });

      if (error) throw error;

      setTemplates(data || []);
      console.log(`✅ ${data?.length || 0} templates carregados`);
    } catch (error) {
      console.error('❌ Erro ao carregar templates:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar templates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseTemplate = async (template: PolicyTemplate) => {
    try {
      const newPolicy = {
        title: customizationData.title || `${template.title} - Customizada`,
        description: customizationData.description || template.description,
        category: template.category,
        document_type: template.document_type,
        status: 'draft',
        version: '1.0',
        priority: template.priority,
        tenant_id: user?.tenant?.id || user?.tenantId,
        created_by: user?.id,
        updated_by: user?.id,
        owner_id: user?.id,
        metadata: {
          ...template.metadata,
          isTemplate: false,
          basedOnTemplate: template.id,
          customContent: customizationData.content || JSON.stringify(template.metadata.content, null, 2)
        }
      };

      const { error } = await supabase
        .from('policies')
        .insert(newPolicy);

      if (error) throw error;

      toast({
        title: "Política criada",
        description: "Política criada com sucesso a partir do template",
      });

      setShowCustomize(false);
      setCustomizationData({ title: '', description: '', content: '' });
      onPolicyUpdate?.();
    } catch (error) {
      console.error('❌ Erro ao criar política:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar política a partir do template",
        variant: "destructive",
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'segurança da informação':
      case 'segurança':
        return Shield;
      case 'recursos humanos':
      case 'ética':
        return Users;
      case 'financeiro':
      case 'compliance':
        return DollarSign;
      case 'operacional':
      case 'qualidade':
        return Settings;
      case 'tecnologia da informação':
      case 'inovação':
        return Lightbulb;
      case 'ambiental':
      case 'sustentabilidade':
        return Globe;
      case 'estratégico':
      case 'gestão de riscos':
        return TrendingUp;
      default:
        return Briefcase;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'política': return Shield;
      case 'procedimento': return Settings;
      case 'manual': return BookOpen;
      case 'norma': return AlertTriangle;
      case 'código': return CheckCircle;
      case 'diretriz': return Clock;
      default: return FileText;
    }
  };

  // Obter categorias e tipos únicos
  const categories = [...new Set(templates.map(t => t.category))];
  const documentTypes = [...new Set(templates.map(t => t.document_type))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Templates de Governança</h2>
          <p className="text-muted-foreground">
            {templates.length} templates baseados em melhores práticas de mercado
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {templates.length} Templates
          </Badge>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  {documentTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const CategoryIcon = getCategoryIcon(template.category);
          const TypeIcon = getTypeIcon(template.document_type);
          
          return (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <CategoryIcon className="h-5 w-5 text-primary" />
                    <Badge variant="outline" className="text-xs">
                      {template.document_type}
                    </Badge>
                  </div>
                  <Badge className={`text-xs ${getPriorityColor(template.priority)}`}>
                    {template.priority === 'critical' ? 'Crítica' :
                     template.priority === 'high' ? 'Alta' :
                     template.priority === 'medium' ? 'Média' : 'Baixa'}
                  </Badge>
                </div>
                
                <CardTitle className="text-lg leading-tight">
                  {template.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Categoria:</span>
                    <span className="font-medium">{template.category}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Framework:</span>
                    <span className="font-medium text-xs">{template.metadata.framework}</span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Dialog open={showPreview && selectedTemplate?.id === template.id} onOpenChange={setShowPreview}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Visualizar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{template.title}</DialogTitle>
                          <DialogDescription>
                            {template.description}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Categoria:</span> {template.category}
                            </div>
                            <div>
                              <span className="font-medium">Tipo:</span> {template.document_type}
                            </div>
                            <div>
                              <span className="font-medium">Framework:</span> {template.metadata.framework}
                            </div>
                            <div>
                              <span className="font-medium">Prioridade:</span> {template.priority}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Conteúdo do Template:</h4>
                            <div className="bg-muted p-4 rounded-lg">
                              <pre className="text-sm whitespace-pre-wrap">
                                {JSON.stringify(template.metadata.content, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Dialog open={showCustomize && selectedTemplate?.id === template.id} onOpenChange={setShowCustomize}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setCustomizationData({
                              title: template.title,
                              description: template.description,
                              content: JSON.stringify(template.metadata.content, null, 2)
                            });
                          }}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Usar Template
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Customizar Template</DialogTitle>
                          <DialogDescription>
                            Personalize o template antes de criar a política
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Título</label>
                            <Input
                              value={customizationData.title}
                              onChange={(e) => setCustomizationData(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Título da nova política"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Descrição</label>
                            <Textarea
                              value={customizationData.description}
                              onChange={(e) => setCustomizationData(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Descrição da nova política"
                              rows={3}
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Conteúdo (JSON)</label>
                            <Textarea
                              value={customizationData.content}
                              onChange={(e) => setCustomizationData(prev => ({ ...prev, content: e.target.value }))}
                              placeholder="Conteúdo customizado em JSON"
                              rows={10}
                              className="font-mono text-xs"
                            />
                          </div>
                          
                          <div className="flex gap-2 pt-4">
                            <Button 
                              onClick={() => handleUseTemplate(template)}
                              className="flex-1"
                            >
                              Criar Política
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setShowCustomize(false)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
          <p className="text-muted-foreground">
            Tente ajustar os filtros ou termos de busca.
          </p>
        </div>
      )}
    </div>
  );
};

export default PolicyTemplates;