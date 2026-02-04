import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Plus, Search, Edit, Trash2, Copy, Star, Shield, User, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { toast } from 'sonner';

interface AIPrompt {
  id?: string;
  name: string;
  category: string;
  title: string;
  description: string;
  template_content: string;
  is_active: boolean;
  is_global?: boolean;
  usage_count?: number;
  success_rate?: number;
  created_at?: string;
  created_by?: string;
  tenant_id?: string;
}

export const AIPromptsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<AIPrompt | null>(null);
  const [saving, setSaving] = useState(false);

  const [promptForm, setPromptForm] = useState<Partial<AIPrompt>>({
    name: '',
    category: 'alex',
    title: '',
    description: '',
    template_content: '',
    is_active: true,
    is_global: false
  });

  const categories = [
    'alex', 'risk-assessment', 'compliance-check', 'incident-analysis',
    'policy-review', 'audit-planning', 'vendor-evaluation', 'gap-analysis'
  ];

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      setLoading(true);
      
      // Buscar todos os prompts sem filtro de tenant para ver prompts globais
      const { data: allPrompts, error } = await supabase
        .from('ai_grc_prompt_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar prompts:', error);
        throw error;
      }

      console.log('🔍 [PROMPTS PAGE] Total de prompts carregados:', allPrompts?.length || 0);
      console.log('🔍 [PROMPTS PAGE] Categorias encontradas:', [...new Set(allPrompts?.map(p => p.category) || [])]);
      
      // Filtrar prompts Alex especificamente
      const alexPrompts = allPrompts?.filter(p => 
        p.category === 'alex' || 
        p.category === 'Alex' ||
        (p.name && p.name.toLowerCase().includes('alex')) ||
        (p.title && p.title.toLowerCase().includes('alex'))
      ) || [];
      
      console.log('🤖 [PROMPTS PAGE] Prompts Alex encontrados:', alexPrompts.length);
      console.log('🤖 [PROMPTS PAGE] Detalhes dos prompts Alex:', alexPrompts.map(p => ({ 
        id: p.id, 
        name: p.name, 
        category: p.category, 
        title: p.title 
      })));

      setPrompts(allPrompts || []);
    } catch (error) {
      console.error('Erro ao carregar prompts:', error);
      toast.error('Erro ao carregar prompts');
    } finally {
      setLoading(false);
    }
  };

  const savePrompt = async () => {
    if (!promptForm.name || !promptForm.title || !promptForm.template_content) {
      toast.error('Nome, título e conteúdo são obrigatórios');
      return;
    }

    setSaving(true);
    try {
      const promptData = {
        name: promptForm.name,
        category: promptForm.category,
        title: promptForm.title,
        description: promptForm.description || '',
        template_content: promptForm.template_content,
        is_active: promptForm.is_active ?? true,
        is_global: promptForm.is_global ?? false,
        tenant_id: promptForm.is_global ? null : user?.tenantId,
        created_by: user?.id,
        updated_at: new Date().toISOString()
      };

      if (editingPrompt?.id) {
        // Atualizar prompt existente
        const { error } = await supabase
          .from('ai_grc_prompt_templates')
          .update(promptData)
          .eq('id', editingPrompt.id);

        if (error) throw error;
        toast.success('Prompt atualizado com sucesso!');
      } else {
        // Criar novo prompt
        const { error } = await supabase
          .from('ai_grc_prompt_templates')
          .insert({
            ...promptData,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
        toast.success('Prompt criado com sucesso!');
      }

      await loadPrompts();
      setShowCreateDialog(false);
      setEditingPrompt(null);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar prompt:', error);
      toast.error('Erro ao salvar prompt: ' + (error as any).message);
    } finally {
      setSaving(false);
    }
  };

  const deletePrompt = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este prompt?')) return;

    try {
      const { error } = await supabase
        .from('ai_grc_prompt_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Prompt excluído com sucesso!');
      await loadPrompts();
    } catch (error) {
      console.error('Erro ao excluir prompt:', error);
      toast.error('Erro ao excluir prompt');
    }
  };

  const editPrompt = (prompt: AIPrompt) => {
    setEditingPrompt(prompt);
    setPromptForm({
      name: prompt.name,
      category: prompt.category,
      title: prompt.title,
      description: prompt.description,
      template_content: prompt.template_content,
      is_active: prompt.is_active,
      is_global: prompt.is_global
    });
    setShowCreateDialog(true);
  };

  const resetForm = () => {
    setPromptForm({
      name: '',
      category: 'alex',
      title: '',
      description: '',
      template_content: '',
      is_active: true,
      is_global: false
    });
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrar prompts
  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || prompt.category === filterCategory;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'alex' && (prompt.category === 'alex' || prompt.category === 'Alex')) ||
                      (activeTab === 'global' && prompt.is_global) ||
                      (activeTab === 'personal' && !prompt.is_global);
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  // Separar prompts por tipo
  const alexPrompts = prompts.filter(p => p.category === 'alex' || p.category === 'Alex');
  const globalPrompts = prompts.filter(p => p.is_global);
  const personalPrompts = prompts.filter(p => !p.is_global);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/ai-manager')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Templates de Prompts
            </h1>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/ai-manager')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Templates de Prompts
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie templates de prompts especializados para GRC
            </p>
          </div>
        </div>

        <Button onClick={() => { resetForm(); setEditingPrompt(null); setShowCreateDialog(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Prompt
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total de Prompts</p>
                <p className="text-2xl font-bold">{prompts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Prompts Alex</p>
                <p className="text-2xl font-bold">{alexPrompts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Prompts Globais</p>
                <p className="text-2xl font-bold">{globalPrompts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <User className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Prompts Pessoais</p>
                <p className="text-2xl font-bold">{personalPrompts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar prompts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos ({prompts.length})</TabsTrigger>
          <TabsTrigger value="alex">Alex ({alexPrompts.length})</TabsTrigger>
          <TabsTrigger value="global">Globais ({globalPrompts.length})</TabsTrigger>
          <TabsTrigger value="personal">Pessoais ({personalPrompts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredPrompts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Nenhum prompt encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {prompts.length === 0 
                    ? 'Crie seu primeiro prompt para começar'
                    : 'Tente ajustar os filtros ou criar um novo prompt'
                  }
                </p>
                <Button onClick={() => { resetForm(); setEditingPrompt(null); setShowCreateDialog(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Prompt
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredPrompts.map((prompt) => (
                <Card key={prompt.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-3">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            <span>{prompt.title}</span>
                          </CardTitle>
                          <div className={`w-2 h-2 rounded-full ${prompt.is_active ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                        </div>
                        
                        <div className="flex items-center space-x-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {prompt.category}
                          </Badge>
                          {prompt.is_global && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              <Shield className="h-3 w-3 mr-1" />
                              Global
                            </Badge>
                          )}
                          {prompt.category === 'alex' && (
                            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                              <Star className="h-3 w-3 mr-1" />
                              Alex IA
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {prompt.description || 'Sem descrição'}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <BarChart3 className="h-3 w-3" />
                            <span>{prompt.usage_count || 0} usos</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(prompt.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => editPrompt(prompt)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deletePrompt(prompt.id!)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h5 className="text-sm font-medium mb-2">Conteúdo do Prompt:</h5>
                      <pre className="text-xs whitespace-pre-wrap text-foreground font-mono max-h-32 overflow-y-auto">
                        {prompt.template_content}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>{editingPrompt ? 'Editar Prompt' : 'Criar Novo Prompt'}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Prompt</Label>
                <Input
                  id="name"
                  value={promptForm.name}
                  onChange={(e) => setPromptForm({...promptForm, name: e.target.value})}
                  placeholder="nome-do-prompt"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={promptForm.category} onValueChange={(value) => setPromptForm({...promptForm, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={promptForm.title}
                  onChange={(e) => setPromptForm({...promptForm, title: e.target.value})}
                  placeholder="Título descritivo do prompt"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={promptForm.description}
                  onChange={(e) => setPromptForm({...promptForm, description: e.target.value})}
                  placeholder="Descreva o propósito e uso do prompt"
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo do Prompt</Label>
              <Textarea
                id="content"
                value={promptForm.template_content}
                onChange={(e) => setPromptForm({...promptForm, template_content: e.target.value})}
                placeholder="Insira o conteúdo do prompt aqui..."
                rows={12}
                className="font-mono"
              />
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={promptForm.is_active}
                  onCheckedChange={(checked) => setPromptForm({...promptForm, is_active: checked})}
                />
                <Label>Ativo</Label>
              </div>

              {user?.isPlatformAdmin && (
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={promptForm.is_global}
                    onCheckedChange={(checked) => setPromptForm({...promptForm, is_global: checked})}
                  />
                  <Label>Global (visível para todos)</Label>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={savePrompt} disabled={saving}>
                {saving ? 'Salvando...' : (editingPrompt ? 'Atualizar' : 'Criar')} Prompt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIPromptsPage;