import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FileText,
  Plus,
  Copy,
  Edit,
  Trash2,
  Download,
  Upload,
  Search,
  Star,
  Clock,
  Users
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PolicyTemplatesProps {
  policies: any[];
  onPolicyUpdate: () => void;
  alexConfig?: any;
}

const PolicyTemplates: React.FC<PolicyTemplatesProps> = ({
  policies,
  onPolicyUpdate,
  alexConfig
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    description: '',
    category: '',
    content: ''
  });

  // Templates predefinidos
  const predefinedTemplates = [
    {
      id: 'template-1',
      title: 'Política de Segurança da Informação',
      description: 'Template padrão para políticas de segurança da informação',
      category: 'Segurança',
      type: 'predefined',
      usage_count: 15,
      last_used: '2024-01-15',
      content: {
        sections: [
          { title: '1. Objetivo', content: 'Definir as diretrizes de segurança da informação...' },
          { title: '2. Escopo', content: 'Esta política aplica-se a todos os colaboradores...' },
          { title: '3. Responsabilidades', content: 'Definir papéis e responsabilidades...' },
          { title: '4. Diretrizes', content: 'Estabelecer as regras de segurança...' },
          { title: '5. Sanções', content: 'Definir penalidades por descumprimento...' }
        ]
      }
    },
    {
      id: 'template-2',
      title: 'Código de Ética',
      description: 'Template para código de conduta ética organizacional',
      category: 'Ética',
      type: 'predefined',
      usage_count: 8,
      last_used: '2024-01-10',
      content: {
        sections: [
          { title: '1. Princípios Fundamentais', content: 'Estabelecer valores fundamentais...' },
          { title: '2. Conduta Profissional', content: 'Definir comportamentos esperados...' },
          { title: '3. Conflitos de Interesse', content: 'Orientações sobre conflitos...' },
          { title: '4. Relacionamentos', content: 'Diretrizes para relacionamentos...' },
          { title: '5. Denúncias', content: 'Canal para reportar violações...' }
        ]
      }
    },
    {
      id: 'template-3',
      title: 'Política de Recursos Humanos',
      description: 'Template para políticas de gestão de pessoas',
      category: 'Recursos Humanos',
      type: 'predefined',
      usage_count: 12,
      last_used: '2024-01-12',
      content: {
        sections: [
          { title: '1. Recrutamento e Seleção', content: 'Processo de contratação...' },
          { title: '2. Desenvolvimento', content: 'Programas de capacitação...' },
          { title: '3. Avaliação de Performance', content: 'Critérios de avaliação...' },
          { title: '4. Benefícios', content: 'Pacote de benefícios oferecidos...' },
          { title: '5. Desligamento', content: 'Processo de desligamento...' }
        ]
      }
    }
  ];

  // Templates customizados (simulado)
  const customTemplates = policies.filter(p => p.is_template);

  const allTemplates = [...predefinedTemplates, ...customTemplates];

  const filteredTemplates = allTemplates.filter(template =>
    template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateFromTemplate = (template: any) => {
    // Implementar criação de política a partir do template
    toast({
      title: "Política criada",
      description: `Nova política criada a partir do template "${template.title}"`,
    });
    onPolicyUpdate();
  };

  const handleSaveTemplate = () => {
    if (!newTemplate.title || !newTemplate.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha título e categoria",
        variant: "destructive",
      });
      return;
    }

    // Implementar salvamento do template
    toast({
      title: "Template salvo",
      description: "Novo template criado com sucesso",
    });

    setNewTemplate({ title: '', description: '', category: '', content: '' });
    setIsCreating(false);
    onPolicyUpdate();
  };

  const getTemplateIcon = (type: string) => {
    return type === 'predefined' ? Star : FileText;
  };

  const getUsageColor = (count: number) => {
    if (count >= 10) return 'text-green-600 bg-green-50 border-green-200';
    if (count >= 5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Biblioteca de Templates</h2>
          <p className="text-muted-foreground">
            Templates predefinidos e personalizados para criação de políticas
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Template
          </Button>
        </div>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de templates */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Templates Disponíveis ({filteredTemplates.length})
          </h3>
          
          {filteredTemplates.map((template) => {
            const Icon = getTemplateIcon(template.type);
            return (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {template.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge variant="outline">{template.category}</Badge>
                      {template.type === 'predefined' && (
                        <Badge variant="default" className="text-xs">
                          <Star className="h-2 w-2 mr-1" />
                          Oficial
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      {template.usage_count !== undefined && (
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Usado {template.usage_count}x
                          </span>
                        </div>
                      )}
                      
                      {template.last_used && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {new Date(template.last_used).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {template.usage_count !== undefined && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getUsageColor(template.usage_count)}`}
                      >
                        {template.usage_count >= 10 ? 'Popular' :
                         template.usage_count >= 5 ? 'Usado' : 'Novo'}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar os termos de busca ou crie um novo template.
              </p>
            </div>
          )}
        </div>

        {/* Painel de detalhes/criação */}
        <div className="space-y-4">
          {isCreating ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Criar Novo Template
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Título do Template</label>
                  <Input
                    value={newTemplate.title}
                    onChange={(e) => setNewTemplate({...newTemplate, title: e.target.value})}
                    placeholder="Ex: Política de Privacidade"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Descrição</label>
                  <Textarea
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                    placeholder="Descreva o propósito e uso deste template..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Categoria</label>
                  <Input
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
                    placeholder="Ex: Privacidade, Segurança, RH"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Conteúdo do Template</label>
                  <Textarea
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                    placeholder="Estrutura e conteúdo base do template..."
                    className="mt-1"
                    rows={8}
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={handleSaveTemplate} className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Salvar Template
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreating(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : selectedTemplate ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {(() => {
                      const Icon = getTemplateIcon(selectedTemplate.type);
                      return <Icon className="h-5 w-5" />;
                    })()}
                    {selectedTemplate.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Descrição</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedTemplate.description}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Categoria</label>
                      <p className="text-sm text-muted-foreground">{selectedTemplate.category}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tipo</label>
                      <p className="text-sm text-muted-foreground">
                        {selectedTemplate.type === 'predefined' ? 'Predefinido' : 'Personalizado'}
                      </p>
                    </div>
                  </div>
                  
                  {selectedTemplate.usage_count !== undefined && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Vezes Usado</label>
                        <p className="text-sm text-muted-foreground">{selectedTemplate.usage_count}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Último Uso</label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedTemplate.last_used).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Estrutura do template */}
                  {selectedTemplate.content?.sections && (
                    <div>
                      <label className="text-sm font-medium">Estrutura do Template</label>
                      <div className="mt-2 space-y-2">
                        {selectedTemplate.content.sections.map((section: any, index: number) => (
                          <div key={index} className="p-2 bg-muted rounded border">
                            <div className="font-medium text-sm">{section.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {section.content.substring(0, 100)}...
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Ações */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleCreateFromTemplate(selectedTemplate)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Criar Política a partir deste Template
                    </Button>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Baixar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-1" />
                        Duplicar
                      </Button>
                      {selectedTemplate.type !== 'predefined' && (
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alex Policy Suggestions */}
              {alexConfig?.enabled && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Sugestões Alex Policy</CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          💡 <strong>Melhoria:</strong> Considere adicionar seção sobre LGPD para templates de privacidade.
                        </p>
                      </div>
                      
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800">
                          ✅ <strong>Qualidade:</strong> Este template segue as melhores práticas de estruturação.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecione um Template</h3>
                <p className="text-muted-foreground">
                  Clique em um template na lista para ver detalhes e opções
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyTemplates;