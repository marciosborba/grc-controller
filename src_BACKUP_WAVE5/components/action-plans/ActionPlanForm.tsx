import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { toast } from 'sonner';

interface FormData {
  titulo: string;
  descricao: string;
  objetivo: string;
  category_id: string;
  modulo_origem: string;
  prioridade: string;
  responsavel_plano: string;
  data_inicio_planejada: string;
  data_fim_planejada: string;
  orcamento_planejado: string;
  gut_gravidade: string;
  gut_urgencia: string;
  gut_tendencia: string;
  frequencia_relatorios: string;
}

interface Category {
  id: string;
  nome: string;
  cor_categoria: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
}

export const ActionPlanForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    descricao: '',
    objetivo: '',
    category_id: '',
    modulo_origem: 'manual',
    prioridade: 'media',
    responsavel_plano: '',
    data_inicio_planejada: '',
    data_fim_planejada: '',
    orcamento_planejado: '',
    gut_gravidade: '3',
    gut_urgencia: '3',
    gut_tendencia: '3',
    frequencia_relatorios: 'semanal'
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInitialData();
    if (isEdit && id) {
      loadActionPlanData();
    }
  }, [id, user]);

  const loadInitialData = async () => {
    if (!user?.tenant_id) return;

    try {
      // Carregar categorias
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('action_plan_categories')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .eq('ativo', true)
        .order('ordem_exibicao');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Carregar profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('tenant_id', user.tenant_id)
        .order('full_name');

      if (profilesError) throw profilesError;
      setProfiles(profilesData || []);

    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      toast.error('Erro ao carregar dados iniciais');
    }
  };

  const loadActionPlanData = async () => {
    if (!user?.tenant_id || !id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('action_plans')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', user.tenant_id)
        .single();

      if (error) throw error;

      setFormData({
        titulo: data.titulo || '',
        descricao: data.descricao || '',
        objetivo: data.objetivo || '',
        category_id: data.category_id || '',
        modulo_origem: data.modulo_origem || 'manual',
        prioridade: data.prioridade || 'media',
        responsavel_plano: data.responsavel_plano || '',
        data_inicio_planejada: data.data_inicio_planejada || '',
        data_fim_planejada: data.data_fim_planejada || '',
        orcamento_planejado: data.orcamento_planejado?.toString() || '',
        gut_gravidade: data.gut_gravidade?.toString() || '3',
        gut_urgencia: data.gut_urgencia?.toString() || '3',
        gut_tendencia: data.gut_tendencia?.toString() || '3',
        frequencia_relatorios: data.frequencia_relatorios || 'semanal'
      });
    } catch (error) {
      console.error('Erro ao carregar plano de ação:', error);
      toast.error('Erro ao carregar plano de ação');
    } finally {
      setLoading(false);
    }
  };

  const generateActionPlanCode = async () => {
    if (!user?.tenant_id) return '';

    try {
      // Buscar último código para gerar o próximo
      const { data, error } = await supabase
        .from('action_plans')
        .select('codigo')
        .eq('tenant_id', user.tenant_id)
        .like('codigo', 'PLAN-2025-%')
        .order('codigo', { ascending: false })
        .limit(1);

      if (error) throw error;

      const year = new Date().getFullYear();
      let nextNumber = 1;

      if (data && data.length > 0) {
        const lastCode = data[0].codigo;
        const match = lastCode.match(/PLAN-\d{4}-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      return `PLAN-${year}-${nextNumber.toString().padStart(6, '0')}`;
    } catch (error) {
      console.error('Erro ao gerar código:', error);
      return `PLAN-${new Date().getFullYear()}-000001`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenant_id) return;

    setSaving(true);
    try {
      const submitData = {
        ...formData,
        tenant_id: user.tenant_id,
        orcamento_planejado: formData.orcamento_planejado ? parseFloat(formData.orcamento_planejado) : null,
        gut_gravidade: parseInt(formData.gut_gravidade),
        gut_urgencia: parseInt(formData.gut_urgencia),
        gut_tendencia: parseInt(formData.gut_tendencia),
        data_inicio_planejada: formData.data_inicio_planejada || null,
        data_fim_planejada: formData.data_fim_planejada || null,
        created_by: user.id,
        updated_by: user.id
      };

      if (isEdit && id) {
        // Atualizar plano existente
        const { error } = await supabase
          .from('action_plans')
          .update(submitData)
          .eq('id', id)
          .eq('tenant_id', user.tenant_id);

        if (error) throw error;
        
        toast.success('Plano de ação atualizado com sucesso!');
        navigate(`/action-plans/details/${id}`);
      } else {
        // Criar novo plano
        const codigo = await generateActionPlanCode();
        
        const { data: newPlan, error } = await supabase
          .from('action_plans')
          .insert([{ ...submitData, codigo }])
          .select()
          .single();

        if (error) throw error;
        
        toast.success('Plano de ação criado com sucesso!');
        navigate(`/action-plans/details/${newPlan.id}`);
      }
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      toast.error('Erro ao salvar plano de ação');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/action-plans')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Editar Plano de Ação' : 'Novo Plano de Ação'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? 'Atualize as informações do plano de ação' : 'Crie um novo plano de ação para sua organização'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações Básicas */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Defina as informações principais do plano de ação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => handleInputChange('titulo', e.target.value)}
                  placeholder="Digite o título do plano de ação"
                  required
                />
              </div>

              <div>
                <Label htmlFor="descricao">Descrição *</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  placeholder="Descreva o plano de ação"
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="objetivo">Objetivo</Label>
                <Textarea
                  id="objetivo"
                  value={formData.objetivo}
                  onChange={(e) => handleInputChange('objetivo', e.target.value)}
                  placeholder="Descreva o objetivo do plano de ação"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category_id">Categoria *</Label>
                  <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.cor_categoria }}
                            />
                            <span>{category.nome}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="modulo_origem">Módulo de Origem</Label>
                  <Select value={formData.modulo_origem} onValueChange={(value) => handleInputChange('modulo_origem', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="risk_management">Gestão de Riscos</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="assessments">Assessments</SelectItem>
                      <SelectItem value="privacy">Privacidade</SelectItem>
                      <SelectItem value="audit">Auditoria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>
                Defina prioridade e configurações do plano
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select value={formData.prioridade} onValueChange={(value) => handleInputChange('prioridade', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="critica">Crítica</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="responsavel_plano">Responsável</Label>
                <Select value={formData.responsavel_plano} onValueChange={(value) => handleInputChange('responsavel_plano', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="frequencia_relatorios">Frequência de Relatórios</Label>
                <Select value={formData.frequencia_relatorios} onValueChange={(value) => handleInputChange('frequencia_relatorios', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diario">Diário</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="quinzenal">Quinzenal</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="trimestral">Trimestral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Cronograma */}
          <Card>
            <CardHeader>
              <CardTitle>Cronograma</CardTitle>
              <CardDescription>
                Defina as datas de início e fim do plano
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="data_inicio_planejada">Data de Início Planejada</Label>
                <Input
                  id="data_inicio_planejada"
                  type="date"
                  value={formData.data_inicio_planejada}
                  onChange={(e) => handleInputChange('data_inicio_planejada', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="data_fim_planejada">Data de Fim Planejada</Label>
                <Input
                  id="data_fim_planejada"
                  type="date"
                  value={formData.data_fim_planejada}
                  onChange={(e) => handleInputChange('data_fim_planejada', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Orçamento */}
          <Card>
            <CardHeader>
              <CardTitle>Orçamento</CardTitle>
              <CardDescription>
                Defina o orçamento planejado para o plano
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="orcamento_planejado">Orçamento Planejado (R$)</Label>
                <Input
                  id="orcamento_planejado"
                  type="number"
                  step="0.01"
                  value={formData.orcamento_planejado}
                  onChange={(e) => handleInputChange('orcamento_planejado', e.target.value)}
                  placeholder="0,00"
                />
              </div>
            </CardContent>
          </Card>

          {/* Matriz GUT */}
          <Card>
            <CardHeader>
              <CardTitle>Matriz GUT</CardTitle>
              <CardDescription>
                Avalie Gravidade, Urgência e Tendência (1-5)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="gut_gravidade">Gravidade</Label>
                <Select value={formData.gut_gravidade} onValueChange={(value) => handleInputChange('gut_gravidade', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Muito Baixa</SelectItem>
                    <SelectItem value="2">2 - Baixa</SelectItem>
                    <SelectItem value="3">3 - Média</SelectItem>
                    <SelectItem value="4">4 - Alta</SelectItem>
                    <SelectItem value="5">5 - Muito Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="gut_urgencia">Urgência</Label>
                <Select value={formData.gut_urgencia} onValueChange={(value) => handleInputChange('gut_urgencia', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Muito Baixa</SelectItem>
                    <SelectItem value="2">2 - Baixa</SelectItem>
                    <SelectItem value="3">3 - Média</SelectItem>
                    <SelectItem value="4">4 - Alta</SelectItem>
                    <SelectItem value="5">5 - Muito Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="gut_tendencia">Tendência</Label>
                <Select value={formData.gut_tendencia} onValueChange={(value) => handleInputChange('gut_tendencia', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Muito Baixa</SelectItem>
                    <SelectItem value="2">2 - Baixa</SelectItem>
                    <SelectItem value="3">3 - Média</SelectItem>
                    <SelectItem value="4">4 - Alta</SelectItem>
                    <SelectItem value="5">5 - Muito Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Score GUT:</p>
                <p className="text-2xl font-bold">
                  {parseInt(formData.gut_gravidade) * parseInt(formData.gut_urgencia) * parseInt(formData.gut_tendencia)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/action-plans')}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={saving || !formData.titulo || !formData.descricao || !formData.category_id}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <>Salvando...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEdit ? 'Atualizar' : 'Criar'} Plano
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};