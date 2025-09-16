import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Target,
  Plus,
  Edit,
  FileText,
  Calendar,
  Clock,
  X,
  Save,
  Trash2,
  Search,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import { toast } from 'sonner';

interface UniverseItem {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  descricao?: string;
  nivel: number;
  criticidade: string;
  frequencia_auditoria: number;
  ultima_auditoria?: string;
  proxima_auditoria?: string;
  status: string;
  metadados?: {
    responsavel?: string;
    categoria?: string;
    objetivo_controle?: string;
    metodologia?: string;
  };
  created_at?: string;
  updated_at?: string;
}

interface UniverseFormData {
  codigo: string;
  nome: string;
  tipo: string;
  descricao: string;
  nivel: number;
  criticidade: string;
  frequencia_auditoria: number;
  ultima_auditoria: string;
  proxima_auditoria: string;
  responsavel: string;
  categoria: string;
  objetivo_controle: string;
  metodologia: string;
}

const initialFormData: UniverseFormData = {
  codigo: '',
  nome: '',
  tipo: '',
  descricao: '',
  nivel: 1,
  criticidade: '',
  frequencia_auditoria: 12,
  ultima_auditoria: '',
  proxima_auditoria: '',
  responsavel: '',
  categoria: '',
  objetivo_controle: '',
  metodologia: ''
};

export function UniversoAuditavel() {
  
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  
  // Determinar o tenant ID efetivo para buscar configurações
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
  
  // Hook para configurações do tenant (matriz de risco)
  const { getRiskLevels, getMatrixDimensions, tenantSettings } = useTenantSettings(effectiveTenantId);
  const [universeItems, setUniverseItems] = useState<UniverseItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para formulário
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<UniverseItem | null>(null);
  const [formData, setFormData] = useState<UniverseFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  
  // Estados para visualização detalhada
  const [viewingItem, setViewingItem] = useState<UniverseItem | null>(null);
  
  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tipo: '',
    criticidade: ''
  });

  // Estados para ordenação
  const [sortBy, setSortBy] = useState('nivel');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    // Para Super Admin: usar tenant selecionado no header
    // Para usuários normais: usar o tenant_id do usuário
    const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
    
    if (effectiveTenantId) {
      loadUniverseData();
    } else {
      console.log('⚠️ Aguardando tenant ser carregado...', { 
        user: user?.email, 
        isPlatformAdmin: user?.isPlatformAdmin,
        selectedTenantId,
        userTenantId: user?.tenantId
      });
    }
  }, [user?.tenantId, user?.isPlatformAdmin, selectedTenantId]);

  const loadUniverseData = async () => {
    try {
      setLoading(true);
      
      // Determinar o tenant ID efetivo baseado no tipo de usuário
      const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
      
      console.log('🔍 Carregando universo auditável para tenant:', effectiveTenantId);
      console.log('🏢 Tenant ID efetivo:', { 
        isPlatformAdmin: user?.isPlatformAdmin,
        selectedTenantId,
        userTenantId: user?.tenantId,
        effectiveTenantId
      });
      
      if (!effectiveTenantId) {
        toast.error('Tenant não identificado. Por favor, faça login novamente.');
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('universo_auditavel')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .order('codigo', { ascending: true }); // Ordenação inicial por código para manter estabilidade

      console.log('📊 Dados retornados:', { data, error, count: data?.length });
      
      if (data && data.length > 0) {
        console.log('📋 Primeiros 3 itens carregados:', data.slice(0, 3).map(item => ({
          codigo: item.codigo,
          nome: item.nome,
          criticidade: item.criticidade,
          nivel: item.nivel
        })));
      }

      if (error) {
        console.error('❌ Erro ao carregar universo auditável:', error);
        toast.error('Erro ao carregar dados');
      } else {
        console.log('✅ Dados carregados com sucesso:', data?.length, 'itens');
        console.log('🔄 Atualizando estado do componente...');
        setUniverseItems(data || []);
        console.log('🎯 Estado atualizado! Nova lista tem', (data || []).length, 'itens');
      }
    } catch (error) {
      console.error('Erro ao carregar universo auditável:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar itens com base na busca e filtros
  // Função para mapear criticidade para valor numérico (para ordenação)
  const getCriticalityOrder = (criticidade: string): number => {
    switch (criticidade.toLowerCase()) {
      case 'critica': return 4;
      case 'alta': return 3;
      case 'media': return 2;
      case 'baixa': return 1;
      default: return 0;
    }
  };

  // Função de ordenação
  const sortItems = (items: UniverseItem[]): UniverseItem[] => {
    return [...items].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'criticidade':
          comparison = getCriticalityOrder(a.criticidade) - getCriticalityOrder(b.criticidade);
          break;
        case 'nivel':
          comparison = a.nivel - b.nivel;
          break;
        case 'codigo':
          comparison = a.codigo.localeCompare(b.codigo);
          break;
        case 'nome':
          comparison = a.nome.localeCompare(b.nome);
          break;
        case 'updated_at':
          comparison = new Date(a.updated_at || '').getTime() - new Date(b.updated_at || '').getTime();
          break;
        default:
          comparison = a.nivel - b.nivel;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  };

  const filteredItems = useMemo(() => {
    // Primeiro filtrar
    const filtered = universeItems.filter(item => {
      const matchSearch = !searchTerm || 
        item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.metadados?.responsavel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.metadados?.categoria?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchTipo = !filters.tipo || item.tipo === filters.tipo;
      const matchCriticidade = !filters.criticidade || item.criticidade === filters.criticidade;

      return matchSearch && matchTipo && matchCriticidade;
    });
    
    // Depois ordenar
    return sortItems(filtered);
  }, [universeItems, searchTerm, filters, sortBy, sortOrder]);

  const getCriticalityColor = (criticidade: string) => {
    const normalizedCriticidade = criticidade.toLowerCase();
    
    // Verificar se é crítico (incluindo variações)
    if (normalizedCriticidade === 'crítico' || normalizedCriticidade === 'critico' || normalizedCriticidade === 'critica') {
      return 'bg-red-600 text-white dark:bg-red-700';
    }
    if (normalizedCriticidade === 'alto' || normalizedCriticidade === 'alta') {
      return 'bg-orange-500 text-white dark:bg-orange-600';
    }
    if (normalizedCriticidade === 'médio' || normalizedCriticidade === 'medio' || normalizedCriticidade === 'media') {
      return 'bg-yellow-500 text-white dark:bg-yellow-600';
    }
    if (normalizedCriticidade === 'baixo' || normalizedCriticidade === 'baixa') {
      return 'bg-green-500 text-white dark:bg-green-600';
    }
    
    return 'bg-gray-500 text-white dark:bg-gray-600';
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData(initialFormData);
    setShowForm(true);
  };

  const handleEdit = async (item: UniverseItem) => {
    // 🔍 DEBUG: Log do item que foi clicado
    console.log('🎯 [CLICK] Item clicado para editar:', {
      id: item.id,
      codigo: item.codigo,
      nome: item.nome,
      nivel: item.nivel,
      criticidade: item.criticidade
    });
    
    const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
    
    if (!effectiveTenantId) {
      toast.error('Tenant não identificado');
      return;
    }
    
    try {
      console.log('🔍 [DB_QUERY] Buscando item no banco:', {
        itemId: item.id,
        tenantId: effectiveTenantId,
        originalItem: {
          codigo: item.codigo,
          nome: item.nome
        }
      });
      
      const { data: freshData, error } = await supabase
        .from('universo_auditavel')
        .select('*')
        .eq('id', item.id)
        .eq('tenant_id', effectiveTenantId)
        .single();
        
      if (error) {
        console.error('❌ [EDIT] Erro:', error);
        toast.error('Erro ao carregar dados para edição');
        return;
      }
      
      console.log('✅ [EDIT] Item carregado:', freshData.codigo);
      console.log('🔍 [DEBUG] Criticidade do banco:', { criticidade: freshData.criticidade, tipo: typeof freshData.criticidade });
      
      setEditingItem(freshData);
      setFormData({
        codigo: freshData.codigo,
        nome: freshData.nome,
        tipo: freshData.tipo,
        descricao: freshData.descricao || '',
        nivel: freshData.nivel,
        criticidade: freshData.criticidade,
        frequencia_auditoria: freshData.frequencia_auditoria,
        ultima_auditoria: freshData.ultima_auditoria || '',
        proxima_auditoria: freshData.proxima_auditoria || '',
        responsavel: freshData.metadados?.responsavel || '',
        categoria: freshData.metadados?.categoria || '',
        objetivo_controle: freshData.metadados?.objetivo_controle || '',
        metodologia: freshData.metadados?.metodologia || ''
      });
      
      console.log('🔍 [DEBUG] FormData definido:', { 
        criticidade: freshData.criticidade,
        nivel: freshData.nivel 
      });
      
      console.log('📋 [DEBUG] getRiskLevels():', getRiskLevels());
      console.log('🎯 [DEBUG] Valores normalized do dropdown:', getRiskLevels().map(level => ({
        original: level,
        normalized: level.toLowerCase().replace('crítica', 'critica').replace('média', 'media')
      })));
      
      setShowForm(true);
    } catch (error) {
      console.error('❌ [EDIT] Erro inesperado:', error);
      toast.error('Erro ao abrir modal de edição');
    }
  };

  const handleView = async (item: UniverseItem) => {
    const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
    
    if (!effectiveTenantId) {
      toast.error('Tenant não identificado');
      return;
    }
    
    try {
      const { data: freshData, error } = await supabase
        .from('universo_auditavel')
        .select('*')
        .eq('id', item.id)
        .eq('tenant_id', effectiveTenantId)
        .single();
        
      if (error) {
        console.error('❌ [VIEW] Erro:', error);
        toast.error('Erro ao carregar dados para visualização');
        return;
      }
      
      setViewingItem(freshData);
    } catch (error) {
      console.error('❌ [VIEW] Erro inesperado:', error);
      toast.error('Erro ao abrir modal de visualização');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Determinar o tenant ID efetivo baseado no tipo de usuário
      const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
      
      console.log('💾 [SAVE] Iniciando...');
      
      if (!effectiveTenantId) {
        throw new Error('Tenant ID não encontrado. Não é possível salvar o item.');
      }
      
      // Validações básicas
      if (!formData.codigo || !formData.nome || !formData.tipo || !formData.criticidade) {
        throw new Error('Campos obrigatórios não preenchidos (código, nome, tipo, criticidade).');
      }
      
      if (!formData.nivel || formData.nivel < 1) {
        throw new Error('Nível de risco deve ser selecionado.');
      }
      
      const normalizeCriticidade = (value: string): string => {
        if (!value || value.trim() === '') return 'baixa';
        const normalized = value.toLowerCase().trim();
        switch (normalized) {
          case 'crítico': case 'critico': case 'crítica': case 'critica': return 'critica';
          case 'médio': case 'medio': case 'média': case 'media': return 'media';
          case 'baixo': case 'baixa': return 'baixa';
          case 'alto': case 'alta': return 'alta';
          default: return 'baixa';
        }
      };
      

      const itemData = {
        tenant_id: effectiveTenantId,
        codigo: formData.codigo.trim(),
        nome: formData.nome.trim(),
        tipo: formData.tipo,
        descricao: formData.descricao.trim() || null,
        nivel: parseInt(String(formData.nivel)) || 1,
        criticidade: normalizeCriticidade(formData.criticidade),
        frequencia_auditoria: parseInt(String(formData.frequencia_auditoria)) || null,
        ultima_auditoria: formData.ultima_auditoria || null,
        proxima_auditoria: formData.proxima_auditoria || null,
        status: 'ativo',
        metadados: {
          responsavel: formData.responsavel?.trim() || '',
          categoria: formData.categoria?.trim() || '',
          objetivo_controle: formData.objetivo_controle?.trim() || '',
          metodologia: formData.metodologia?.trim() || ''
        }
      };
      
      console.log('📦 [SAVE] Enviando:', {
        codigo: itemData.codigo,
        nivel: itemData.nivel,
        criticidade: itemData.criticidade
      });
      let result;
      if (editingItem) {
        console.log('📝 [SAVE] UPDATE para item:', editingItem.id);
        result = await supabase
          .from('universo_auditavel')
          .update(itemData)
          .eq('id', editingItem.id)
          .select(); // Retorna o item atualizado
      } else {
        console.log('➕ [SAVE] INSERT novo item');
        result = await supabase
          .from('universo_auditavel')
          .insert([itemData])
          .select(); // Retorna o item inserido
      }

      console.log('🏁 [SAVE] Resultado da operação:', result);

      if (result.error) {
        console.error('❌ [SAVE] Erro:', result.error);
        throw result.error;
      }

      const savedItem = result.data?.[0];
      if (savedItem) {
        console.log('✅ [SAVE] Salvo:', {
          codigo: savedItem.codigo,
          nivel: savedItem.nivel,
          criticidade: savedItem.criticidade
        });
      }
      toast.success(editingItem ? 'Item atualizado com sucesso!' : 'Item criado com sucesso!');
      
      handleCancelForm();
      
      // Recarregar dados e aguardar um momento para garantir que o estado seja atualizado
      await loadUniverseData();
      
      // Aguardar um pouco para garantir que o React atualize o estado antes de permitir nova edição
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error: any) {
      console.error('❌ [SAVE] Erro completo:', error);
      console.error('❌ [SAVE] Detalhes do erro:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        fullError: error
      });
      
      let errorMessage = 'Erro ao salvar item';
      
      if (error.code === '23505') {
        errorMessage = 'Código já existe. Use um código único.';
      } else if (error.code === '42501') {
        errorMessage = 'Erro de permissão. Verifique se você tem acesso para editar este item.';
      } else if (error.code === '23503') {
        errorMessage = 'Erro de referência. Verifique se todos os campos obrigatórios estão preenchidos corretamente.';
      } else if (error.code === '23514') {
        errorMessage = 'Valor inválido para criticidade. Use: baixa, media, alta ou critica.';
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.details) {
        errorMessage = error.details;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      console.error('📱 [SAVE] Mostrando erro:', errorMessage);
      toast.error(`${errorMessage} (Código: ${error.code || 'N/A'})`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: UniverseItem) => {
    if (!confirm(`Tem certeza que deseja excluir "${item.nome}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('universo_auditavel')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      toast.success('Item excluído com sucesso!');
      loadUniverseData();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir item');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4">Carregando universo auditável...</p>
      </div>
    );
  }


  // Teste simples primeiro
  if (universeItems.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Universo Auditável</h2>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Nenhum item encontrado no universo auditável.</p>
          <p className="text-sm mt-2">Tenant ID: {user?.tenantId}</p>
          <p className="text-sm">Total de itens carregados: {universeItems.length}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Universo Auditável</h2>
          <p className="text-muted-foreground">Gestão completa de processos, sistemas e departamentos auditáveis</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Item
        </Button>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, código ou responsável..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Filtros */}
              <div className="flex gap-2">
                <select
                  value={filters.tipo}
                  onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value }))}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="">Todos os tipos</option>
                  <option value="processo">Processos</option>
                  <option value="sistema">Sistemas</option>
                  <option value="departamento">Departamentos</option>
                </select>
                <select
                  value={filters.criticidade}
                  onChange={(e) => setFilters(prev => ({ ...prev, criticidade: e.target.value }))}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="">Todas as criticidades</option>
                  {getRiskLevels().map((level) => (
                    <option key={level} value={level.toLowerCase()}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Controles de Ordenação */}
              <div className="flex gap-2 border-l pl-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm bg-blue-50"
                  title="Ordenar por"
                >
                  <option value="nivel">Nível de Risco</option>
                  <option value="criticidade">Criticidade</option>
                  <option value="codigo">Código</option>
                  <option value="nome">Nome</option>
                  <option value="updated_at">Última Atualização</option>
                </select>
                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors font-bold"
                  title={sortOrder === 'asc' ? 'Crescente - Clique para Decrescente' : 'Decrescente - Clique para Crescente'}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Resumidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {getRiskLevels().slice(-2).reverse().map((level, index) => {
          const normalizedLevel = level.toLowerCase()
            .replace('crítico', 'critica')  // "Crítico" → "critica" 
            .replace('crítica', 'critica')  // "Crítica" → "critica"
            .replace('médio', 'media')      // "Médio" → "media"
            .replace('média', 'media')      // "Média" → "media"
            .replace('alto', 'alta')        // "Alto" → "alta"
            .replace('baixo', 'baixa')      // "Baixo" → "baixa"
            .replace('muito alto', 'critica'); // "Muito Alto" → "critica"
          const count = universeItems.filter(p => p.criticidade === normalizedLevel).length;
          const colorClass = index === 0 ? 'text-red-600' : 'text-orange-600';
          
          return (
            <Card key={level}>
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${colorClass}`}>
                    {count}
                  </div>
                  <p className="text-sm text-muted-foreground">{level}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {universeItems.filter(p => p.tipo === 'processo').length}
              </div>
              <p className="text-sm text-muted-foreground">Processos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {universeItems.filter(p => p.tipo === 'sistema').length}
              </div>
              <p className="text-sm text-muted-foreground">Sistemas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Itens do Universo Auditável ({filteredItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredItems.map(item => (
              <div key={item.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-lg">{item.nome}</h4>
                      <Badge variant="outline" className="text-xs">
                        {item.codigo}
                      </Badge>
                      <Badge className={getCriticalityColor(item.criticidade)}>
                        {item.criticidade}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {item.tipo}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{item.descricao}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Responsável:</p>
                        <p className="font-medium">{item.metadados?.responsavel || 'Não definido'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Categoria:</p>
                        <p className="font-medium">{item.metadados?.categoria || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Frequência Auditoria:</p>
                        <p className="font-medium">{item.frequencia_auditoria} meses</p>
                      </div>
                    </div>

                    {item.proxima_auditoria && (
                      <div className="flex items-center gap-4 text-sm flex-wrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span className="text-muted-foreground">Próxima auditoria:</span>
                          <span className="font-medium">
                            {new Date(item.proxima_auditoria).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {item.ultima_auditoria && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-green-500" />
                            <span className="text-muted-foreground">Última:</span>
                            <span className="font-medium">
                              {new Date(item.ultima_auditoria).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <div className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded-full ${
                        item.nivel >= 4 ? 'bg-red-500' :
                        item.nivel >= 3 ? 'bg-orange-500' :
                        item.nivel >= 2 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`} title={`Nível de risco: ${item.nivel}`}></div>
                      <span className="text-sm font-medium">Nível {item.nivel}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(item)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleView(item)}
                        title="Ver detalhes"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(item)}
                        title="Excluir"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum item encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filters.tipo || filters.criticidade
                    ? 'Tente ajustar os filtros de busca'
                    : 'Adicione o primeiro item ao universo auditável'
                  }
                </p>
                {!searchTerm && !filters.tipo && !filters.criticidade && (
                  <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Item
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">
                {editingItem ? 'Editar Item' : 'Novo Item do Universo Auditável'}
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCancelForm}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Código *</label>
                  <Input
                    value={formData.codigo}
                    onChange={(e) => setFormData(prev => ({...prev, codigo: e.target.value}))}
                    placeholder="ex: PROC-001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo *</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData(prev => ({...prev, tipo: e.target.value}))}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="processo">Processo</option>
                    <option value="sistema">Sistema</option>
                    <option value="departamento">Departamento</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({...prev, nome: e.target.value}))}
                  placeholder="Nome do item auditável"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({...prev, descricao: e.target.value}))}
                  placeholder="Descrição detalhada do item auditável"
                  className="w-full px-3 py-2 border rounded-md h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Criticidade *</label>
                  {console.log('🔍 [RENDER] formData.criticidade atual:', formData.criticidade)}
                  <select
                    value={formData.criticidade}
                    onChange={(e) => setFormData(prev => ({...prev, criticidade: e.target.value}))}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="">Selecione a criticidade</option>
                    {getRiskLevels().map((level) => {
                      // Normalizar o valor para corresponder ao banco de dados
                      const normalizedValue = level.toLowerCase()
                        .replace('crítico', 'critica')  // "Crítico" → "critica" 
                        .replace('crítica', 'critica')  // "Crítica" → "critica"
                        .replace('médio', 'media')      // "Médio" → "media"
                        .replace('média', 'media')      // "Média" → "media"
                        .replace('alto', 'alta')        // "Alto" → "alta"
                        .replace('baixo', 'baixa');     // "Baixo" → "baixa"
                      
                      console.log(`🔧 [DROPDOWN] ${level} → ${normalizedValue}`);
                      
                      return (
                        <option key={level} value={normalizedValue}>
                          {level}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nível de Risco *</label>
                  <select
                    value={formData.nivel}
                    onChange={(e) => setFormData(prev => ({...prev, nivel: parseInt(e.target.value)}))}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="">Selecione o nível</option>
                    {Array.from({ length: getMatrixDimensions().rows }, (_, i) => i + 1).map((level) => (
                      <option key={level} value={level}>
                        Nível {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Responsável</label>
                  <Input
                    value={formData.responsavel}
                    onChange={(e) => setFormData(prev => ({...prev, responsavel: e.target.value}))}
                    placeholder="Nome do responsável"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Categoria</label>
                  <Input
                    value={formData.categoria}
                    onChange={(e) => setFormData(prev => ({...prev, categoria: e.target.value}))}
                    placeholder="ex: Financeiro, TI, RH"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Frequência Auditoria (meses)</label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.frequencia_auditoria}
                    onChange={(e) => setFormData(prev => ({...prev, frequencia_auditoria: parseInt(e.target.value)}))}
                    placeholder="12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Última Auditoria</label>
                  <Input
                    type="date"
                    value={formData.ultima_auditoria}
                    onChange={(e) => setFormData(prev => ({...prev, ultima_auditoria: e.target.value}))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Próxima Auditoria</label>
                  <Input
                    type="date"
                    value={formData.proxima_auditoria}
                    onChange={(e) => setFormData(prev => ({...prev, proxima_auditoria: e.target.value}))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Objetivo de Controle</label>
                <textarea
                  value={formData.objetivo_controle}
                  onChange={(e) => setFormData(prev => ({...prev, objetivo_controle: e.target.value}))}
                  placeholder="Objetivo de controle da auditoria"
                  className="w-full px-3 py-2 border rounded-md h-16 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Metodologia</label>
                <textarea
                  value={formData.metodologia}
                  onChange={(e) => setFormData(prev => ({...prev, metodologia: e.target.value}))}
                  placeholder="Metodologia de auditoria"
                  className="w-full px-3 py-2 border rounded-md h-16 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleCancelForm}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Salvando...' : editingItem ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {viewingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Detalhes do Item</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewingItem(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Código</label>
                  <p className="font-medium">{viewingItem.codigo}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Tipo</label>
                  <Badge variant="secondary">{viewingItem.tipo}</Badge>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground">Nome</label>
                <p className="font-medium text-lg">{viewingItem.nome}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground">Descrição</label>
                <p className="text-sm">{viewingItem.descricao || 'Sem descrição'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Criticidade</label>
                  <Badge className={getCriticalityColor(viewingItem.criticidade)}>
                    {viewingItem.criticidade}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Nível de Risco</label>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${
                      viewingItem.nivel >= 4 ? 'bg-red-500' :
                      viewingItem.nivel >= 3 ? 'bg-orange-500' :
                      viewingItem.nivel >= 2 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></div>
                    <span className="font-medium">{viewingItem.nivel}</span>
                  </div>
                </div>
              </div>

              {viewingItem.metadados && (
                <div className="space-y-3">
                  <h4 className="font-medium">Informações Adicionais</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {viewingItem.metadados.responsavel && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground">Responsável</label>
                        <p>{viewingItem.metadados.responsavel}</p>
                      </div>
                    )}
                    {viewingItem.metadados.categoria && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground">Categoria</label>
                        <p>{viewingItem.metadados.categoria}</p>
                      </div>
                    )}
                    {viewingItem.metadados.objetivo_controle && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-muted-foreground">Objetivo de Controle</label>
                        <p>{viewingItem.metadados.objetivo_controle}</p>
                      </div>
                    )}
                    {viewingItem.metadados.metodologia && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-muted-foreground">Metodologia</label>
                        <p>{viewingItem.metadados.metodologia}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Frequência</label>
                  <p>{viewingItem.frequencia_auditoria} meses</p>
                </div>
                {viewingItem.ultima_auditoria && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">Última Auditoria</label>
                    <p>{new Date(viewingItem.ultima_auditoria).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
                {viewingItem.proxima_auditoria && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">Próxima Auditoria</label>
                    <p>{new Date(viewingItem.proxima_auditoria).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setViewingItem(null);
                    handleEdit(viewingItem);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button onClick={() => setViewingItem(null)}>
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UniversoAuditavel;