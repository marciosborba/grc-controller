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
  Filter,
  CheckCircle,
  Activity,
  AlertTriangle,
  Users,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { sanitizeInput, sanitizeObject, secureLog, auditLog } from '@/utils/securityLogger';
import { useCRUDRateLimit } from '@/hooks/useRateLimit';

interface ProjetoAuditoria {
  id: string;
  codigo: string;
  titulo: string;
  descricao?: string;
  universo_auditavel_id: string;
  tipo_auditoria: 'interna' | 'externa' | 'regulatoria' | 'especial';
  escopo?: string;
  objetivos?: string[];
  data_inicio: string;
  data_fim_planejada: string;
  data_fim_real?: string;
  chefe_auditoria: string;
  equipe_ids?: string[];
  horas_orcadas: number;
  horas_realizadas: number;
  status: 'planejamento' | 'em_execucao' | 'em_revisao' | 'concluido' | 'cancelado';
  fase_atual: 'planejamento' | 'fieldwork' | 'relatorio' | 'followup';
  rating_geral?: 'eficaz' | 'parcialmente_eficaz' | 'ineficaz';
  total_apontamentos: number;
  apontamentos_criticos: number;
  apontamentos_altos: number;
  apontamentos_medios: number;
  apontamentos_baixos: number;
  metadados?: any;
  created_at?: string;
  updated_at?: string;
  // Joined data
  universo_auditavel?: {
    nome: string;
    tipo: string;
    criticidade?: string;
  };
  chefe_profile?: {
    full_name: string;
    email?: string;
  };
}

interface UniversoAuditavel {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  criticidade?: string;
}

interface Profile {
  id: string;
  full_name: string;
  email?: string;
}

interface ProjetoFormData {
  codigo: string;
  titulo: string;
  descricao: string;
  universo_auditavel_id: string;
  tipo_auditoria: string;
  escopo: string;
  objetivos: string;
  data_inicio: string;
  data_fim_planejada: string;
  chefe_auditoria: string;
  horas_orcadas: number;
  status: string;
  fase_atual: string;
}

const initialFormData: ProjetoFormData = {
  codigo: '',
  titulo: '',
  descricao: '',
  universo_auditavel_id: '',
  tipo_auditoria: '',
  escopo: '',
  objetivos: '',
  data_inicio: '',
  data_fim_planejada: '',
  chefe_auditoria: '',
  horas_orcadas: 40,
  status: 'planejamento',
  fase_atual: 'planejamento'
};

export function ProjetosAuditoria() {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const navigate = useNavigate();
  
  // Determinar o tenant ID efetivo
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
  
  const [projetos, setProjetos] = useState<ProjetoAuditoria[]>([]);
  const [universos, setUniversos] = useState<UniversoAuditavel[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para formulário
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ProjetoAuditoria | null>(null);
  const [formData, setFormData] = useState<ProjetoFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  
  // Estados para visualização detalhada
  const [viewingItem, setViewingItem] = useState<ProjetoAuditoria | null>(null);
  
  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    tipo_auditoria: '',
    fase_atual: ''
  });

  // Estados para ordenação
  const [sortBy, setSortBy] = useState('data_inicio');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (effectiveTenantId) {
      loadProjectsData();
      loadUniversos();
      loadProfiles();
    } else {
      secureLog('info', 'Aguardando tenant ser carregado', { 
        userEmail: user?.email, 
        isPlatformAdmin: user?.isPlatformAdmin,
        selectedTenantId,
        userTenantId: user?.tenantId
      });
    }
  }, [user?.tenantId, user?.isPlatformAdmin, selectedTenantId, currentPage]);

  const loadProjectsData = async () => {
    try {
      setLoading(true);
      
      secureLog('info', 'Carregando projetos de auditoria para tenant', { tenantId: effectiveTenantId });
      
      if (!effectiveTenantId) {
        toast.error('Tenant não identificado. Por favor, faça login novamente.');
        setLoading(false);
        return;
      }
      
      // Primeiro, obter contagem total para paginação
      const { count } = await supabase
        .from('projetos_auditoria')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', effectiveTenantId);
      
      setTotalItems(count || 0);

      // Carregar dados com paginação
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error } = await supabase
        .from('projetos_auditoria')
        .select(`
          *,
          universo_auditavel:universo_auditavel_id(
            nome,
            tipo,
            criticidade
          ),
          chefe_profile:chefe_auditoria(
            full_name,
            email
          )
        `)
        .eq('tenant_id', effectiveTenantId)
        .order('data_inicio', { ascending: false })
        .range(from, to);

      secureLog('info', 'Projetos retornados', { hasData: !!data, hasError: !!error, count: data?.length });
      
      if (data && data.length > 0) {
        secureLog('info', 'Projetos carregados com sucesso', { 
          count: data.length,
          sample: data.slice(0, 3).map(item => ({
            codigo: item.codigo,
            status: item.status,
            fase_atual: item.fase_atual
          }))
        });
      }

      if (error) {
        secureLog('error', 'Erro ao carregar projetos de auditoria', error);
        toast.error('Erro ao carregar projetos');
      } else {
        secureLog('info', 'Projetos carregados com sucesso', { count: data?.length });
        setProjetos(data || []);
      }
    } catch (error) {
      secureLog('error', 'Erro ao carregar projetos de auditoria', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadUniversos = async () => {
    try {
      if (!effectiveTenantId) return;
      
      const { data, error } = await supabase
        .from('universo_auditavel')
        .select('id, codigo, nome, tipo, criticidade')
        .eq('tenant_id', effectiveTenantId)
        .eq('status', 'ativo')
        .order('nome');
        
      if (error) {
        secureLog('error', 'Erro ao carregar universos auditáveis', error);
      } else {
        setUniversos(data || []);
      }
    } catch (error) {
      secureLog('error', 'Erro ao carregar universos auditáveis', error);
    }
  };

  const loadProfiles = async () => {
    try {
      if (!effectiveTenantId) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('tenant_id', effectiveTenantId)
        .order('full_name');
        
      if (error) {
        secureLog('error', 'Erro ao carregar profiles', error);
      } else {
        setProfiles(data || []);
      }
    } catch (error) {
      secureLog('error', 'Erro ao carregar profiles', error);
    }
  };

  // Função de ordenação
  const sortItems = (items: ProjetoAuditoria[]): ProjetoAuditoria[] => {
    return [...items].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'codigo':
          comparison = a.codigo.localeCompare(b.codigo);
          break;
        case 'titulo':
          comparison = a.titulo.localeCompare(b.titulo);
          break;
        case 'data_inicio':
          comparison = new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'horas_orcadas':
          comparison = a.horas_orcadas - b.horas_orcadas;
          break;
        case 'total_apontamentos':
          comparison = a.total_apontamentos - b.total_apontamentos;
          break;
        default:
          comparison = new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime();
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  };

  const filteredItems = useMemo(() => {
    // Primeiro filtrar
    const filtered = projetos.filter(item => {
      const matchSearch = !searchTerm || 
        item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.universo_auditavel?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.chefe_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = !filters.status || item.status === filters.status;
      const matchTipo = !filters.tipo_auditoria || item.tipo_auditoria === filters.tipo_auditoria;
      const matchFase = !filters.fase_atual || item.fase_atual === filters.fase_atual;

      return matchSearch && matchStatus && matchTipo && matchFase;
    });
    
    // Depois ordenar
    return sortItems(filtered);
  }, [projetos, searchTerm, filters, sortBy, sortOrder]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'em_execucao': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'em_revisao': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'planejamento': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'cancelado': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getFaseColor = (fase: string) => {
    switch (fase) {
      case 'planejamento': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'fieldwork': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'relatorio': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'followup': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData(initialFormData);
    setShowForm(true);
  };

  const handleEdit = async (item: ProjetoAuditoria) => {
    secureLog('info', 'Projeto clicado para editar', {
      itemId: item.id,
      codigo: item.codigo,
      status: item.status
    });
    
    if (!effectiveTenantId) {
      toast.error('Tenant não identificado');
      return;
    }
    
    try {
      secureLog('info', 'Buscando projeto no banco', {
        itemId: item.id,
        tenantId: effectiveTenantId
      });
      
      const { data: freshData, error } = await supabase
        .from('projetos_auditoria')
        .select('*')
        .eq('id', item.id)
        .eq('tenant_id', effectiveTenantId)
        .single();
        
      if (error) {
        secureLog('error', 'Erro ao carregar dados para edição', error);
        toast.error('Erro ao carregar dados para edição');
        return;
      }
      
      secureLog('info', 'Projeto carregado para edição', { codigo: freshData.codigo });
      
      setEditingItem(freshData);
      setFormData({
        codigo: freshData.codigo,
        titulo: freshData.titulo,
        descricao: freshData.descricao || '',
        universo_auditavel_id: freshData.universo_auditavel_id,
        tipo_auditoria: freshData.tipo_auditoria,
        escopo: freshData.escopo || '',
        objetivos: Array.isArray(freshData.objetivos) ? freshData.objetivos.join('\n') : '',
        data_inicio: freshData.data_inicio,
        data_fim_planejada: freshData.data_fim_planejada,
        chefe_auditoria: freshData.chefe_auditoria,
        horas_orcadas: freshData.horas_orcadas || 40,
        status: freshData.status,
        fase_atual: freshData.fase_atual
      });
      
      setShowForm(true);
    } catch (error) {
      secureLog('error', 'Erro inesperado ao abrir modal de edição', error);
      toast.error('Erro ao abrir modal de edição');
    }
  };

  const handleView = async (item: ProjetoAuditoria) => {
    if (!effectiveTenantId) {
      toast.error('Tenant não identificado');
      return;
    }
    
    try {
      const { data: freshData, error } = await supabase
        .from('projetos_auditoria')
        .select(`
          *,
          universo_auditavel:universo_auditavel_id(
            nome,
            tipo,
            criticidade
          ),
          chefe_profile:chefe_auditoria(
            full_name,
            email
          )
        `)
        .eq('id', item.id)
        .eq('tenant_id', effectiveTenantId)
        .single();
        
      if (error) {
        secureLog('error', 'Erro ao carregar dados para visualização', error);
        toast.error('Erro ao carregar dados para visualização');
        return;
      }
      
      setViewingItem(freshData);
    } catch (error) {
      secureLog('error', 'Erro inesperado ao abrir modal de visualização', error);
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
      secureLog('info', 'Iniciando salvamento de projeto', { isEditing: !!editingItem });
      
      if (!effectiveTenantId) {
        throw new Error('Tenant ID não encontrado. Não é possível salvar o projeto.');
      }
      
      // Validações básicas
      if (!formData.codigo || !formData.titulo || !formData.universo_auditavel_id || !formData.tipo_auditoria) {
        throw new Error('Campos obrigatórios não preenchidos (código, título, universo auditável, tipo).');
      }

      if (!formData.data_inicio || !formData.data_fim_planejada) {
        throw new Error('Datas de início e fim são obrigatórias.');
      }

      if (!formData.chefe_auditoria) {
        throw new Error('Chefe de auditoria é obrigatório.');
      }

      // Processar objetivos
      const objetivos = formData.objetivos.trim() 
        ? formData.objetivos.split('\n').map(obj => obj.trim()).filter(obj => obj.length > 0)
        : [];

      const itemData = {
        tenant_id: effectiveTenantId,
        codigo: formData.codigo.trim(),
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim() || null,
        universo_auditavel_id: formData.universo_auditavel_id,
        tipo_auditoria: formData.tipo_auditoria as any,
        escopo: formData.escopo.trim() || null,
        objetivos: objetivos.length > 0 ? objetivos : null,
        data_inicio: formData.data_inicio,
        data_fim_planejada: formData.data_fim_planejada,
        chefe_auditoria: formData.chefe_auditoria,
        horas_orcadas: parseFloat(String(formData.horas_orcadas)) || 0,
        status: formData.status as any,
        fase_atual: formData.fase_atual as any,
        horas_realizadas: editingItem?.horas_realizadas || 0,
        total_apontamentos: editingItem?.total_apontamentos || 0,
        apontamentos_criticos: editingItem?.apontamentos_criticos || 0,
        apontamentos_altos: editingItem?.apontamentos_altos || 0,
        apontamentos_medios: editingItem?.apontamentos_medios || 0,
        apontamentos_baixos: editingItem?.apontamentos_baixos || 0,
        metadados: editingItem?.metadados || {}
      };
      
      secureLog('info', 'Enviando projeto para salvamento', {
        codigo: itemData.codigo,
        status: itemData.status
      });

      let result;
      if (editingItem) {
        secureLog('info', 'Atualizando projeto existente', { projectId: editingItem.id });
        result = await supabase
          .from('projetos_auditoria')
          .update(itemData)
          .eq('id', editingItem.id)
          .select();
      } else {
        secureLog('info', 'Inserindo novo projeto', {});
        result = await supabase
          .from('projetos_auditoria')
          .insert([itemData])
          .select();
      }

      secureLog('info', 'Resultado da operação de salvamento', { hasData: !!result.data, hasError: !!result.error });

      if (result.error) {
        secureLog('error', 'Erro no salvamento do projeto', result.error);
        throw result.error;
      }

      const savedItem = result.data?.[0];
      if (savedItem) {
        secureLog('info', 'Projeto salvo com sucesso', {
          codigo: savedItem.codigo,
          status: savedItem.status
        });
      }

      toast.success(editingItem ? 'Projeto atualizado com sucesso!' : 'Projeto criado com sucesso!');
      
      handleCancelForm();
      await loadProjectsData();
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error: any) {
      secureLog('error', 'Erro completo no salvamento', error);
      
      let errorMessage = 'Erro ao salvar projeto';
      
      if (error.code === '23505') {
        errorMessage = 'Código já existe. Use um código único.';
      } else if (error.code === '42501') {
        errorMessage = 'Erro de permissão. Verifique se você tem acesso para editar este projeto.';
      } else if (error.code === '23503') {
        errorMessage = 'Erro de referência. Verifique se todos os campos obrigatórios estão preenchidos corretamente.';
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(`${errorMessage} (Código: ${error.code || 'N/A'})`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: ProjetoAuditoria) => {
    if (!confirm(`Tem certeza que deseja excluir o projeto "${item.titulo}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projetos_auditoria')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      toast.success('Projeto excluído com sucesso!');
      loadProjectsData();
    } catch (error) {
      secureLog('error', 'Erro ao excluir projeto', error);
      toast.error('Erro ao excluir projeto');
    }
  };

  const calculateMetrics = () => {
    const total = projetos.length;
    const planejamento = projetos.filter(p => p.status === 'planejamento').length;
    const execucao = projetos.filter(p => p.status === 'em_execucao').length;
    const concluidos = projetos.filter(p => p.status === 'concluido').length;
    const totalHoras = projetos.reduce((sum, p) => sum + (p.horas_orcadas || 0), 0);
    const totalApontamentos = projetos.reduce((sum, p) => sum + (p.total_apontamentos || 0), 0);
    const apontamentosCriticos = projetos.reduce((sum, p) => sum + (p.apontamentos_criticos || 0), 0);
    
    return {
      total,
      planejamento,
      execucao,
      concluidos,
      totalHoras,
      totalApontamentos,
      apontamentosCriticos,
      completionRate: total > 0 ? Math.round((concluidos / total) * 100) : 0
    };
  };

  const metrics = calculateMetrics();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4">Carregando projetos de auditoria...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com Botão Voltar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/auditorias')}
            className="flex items-center gap-2 hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Projetos de Auditoria</h2>
            <p className="text-muted-foreground">Gestão completa de projetos de auditoria interna e externa</p>
          </div>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Projetos</p>
                <p className="text-2xl font-bold">{metrics.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Execução</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.execucao}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">{metrics.concluidos}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Apontamentos</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.totalApontamentos}</p>
                <p className="text-xs text-red-600">{metrics.apontamentosCriticos} críticos</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por título, código ou chefe de auditoria..."
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
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="">Todos os status</option>
                  <option value="planejamento">Planejamento</option>
                  <option value="em_execucao">Em Execução</option>
                  <option value="em_revisao">Em Revisão</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
                <select
                  value={filters.tipo_auditoria}
                  onChange={(e) => setFilters(prev => ({ ...prev, tipo_auditoria: e.target.value }))}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="">Todos os tipos</option>
                  <option value="interna">Interna</option>
                  <option value="externa">Externa</option>
                  <option value="regulatoria">Regulatória</option>
                  <option value="especial">Especial</option>
                </select>
              </div>
              
              {/* Controles de Ordenação */}
              <div className="flex gap-2 border-l pl-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm bg-blue-50"
                >
                  <option value="data_inicio">Data de Início</option>
                  <option value="codigo">Código</option>
                  <option value="titulo">Título</option>
                  <option value="status">Status</option>
                  <option value="horas_orcadas">Horas Orçadas</option>
                  <option value="total_apontamentos">Apontamentos</option>
                </select>
                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors font-bold"
                  title={sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Projetos de Auditoria ({filteredItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredItems.map(projeto => (
              <div key={projeto.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-lg">{projeto.titulo}</h4>
                      <Badge variant="outline" className="text-xs">
                        {projeto.codigo}
                      </Badge>
                      <Badge className={getStatusColor(projeto.status)}>
                        {projeto.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getFaseColor(projeto.fase_atual)}>
                        {projeto.fase_atual}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {projeto.tipo_auditoria}
                      </Badge>
                    </div>
                    
                    {projeto.descricao && (
                      <p className="text-sm text-muted-foreground">{projeto.descricao}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Universo Auditável:</p>
                        <p className="font-medium">{projeto.universo_auditavel?.nome || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Chefe de Auditoria:</p>
                        <p className="font-medium">{projeto.chefe_profile?.full_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Horas Orçadas:</p>
                        <p className="font-medium">{projeto.horas_orcadas}h</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-muted-foreground">Início:</span>
                        <span className="font-medium">
                          {new Date(projeto.data_inicio).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-green-500" />
                        <span className="text-muted-foreground">Fim Planejado:</span>
                        <span className="font-medium">
                          {new Date(projeto.data_fim_planejada).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {projeto.total_apontamentos > 0 && (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <span className="text-muted-foreground">Apontamentos:</span>
                          <span className="font-medium">
                            {projeto.total_apontamentos}
                            {projeto.apontamentos_criticos > 0 && (
                              <span className="text-red-600 ml-1">
                                ({projeto.apontamentos_criticos} críticos)
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-1 ml-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleView(projeto)}
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(projeto)}
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(projeto)}
                      title="Excluir"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum projeto encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filters.status || filters.tipo_auditoria
                    ? 'Tente ajustar os filtros de busca'
                    : 'Crie o primeiro projeto de auditoria'
                  }
                </p>
                {!searchTerm && !filters.status && !filters.tipo_auditoria && (
                  <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Projeto
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {/* Controles de Paginação */}
          {totalItems > itemsPerPage && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} projetos
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {currentPage} de {Math.ceil(totalItems / itemsPerPage)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalItems / itemsPerPage), prev + 1))}
                  disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">
                {editingItem ? 'Editar Projeto' : 'Novo Projeto de Auditoria'}
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
                    placeholder="ex: AUD-2025-001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Auditoria *</label>
                  <select
                    value={formData.tipo_auditoria}
                    onChange={(e) => setFormData(prev => ({...prev, tipo_auditoria: e.target.value}))}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="interna">Interna</option>
                    <option value="externa">Externa</option>
                    <option value="regulatoria">Regulatória</option>
                    <option value="especial">Especial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Título *</label>
                <Input
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({...prev, titulo: e.target.value}))}
                  placeholder="Título do projeto de auditoria"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({...prev, descricao: e.target.value}))}
                  placeholder="Descrição detalhada do projeto"
                  className="w-full px-3 py-2 border rounded-md h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Universo Auditável *</label>
                  <select
                    value={formData.universo_auditavel_id}
                    onChange={(e) => setFormData(prev => ({...prev, universo_auditavel_id: e.target.value}))}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="">Selecione o universo</option>
                    {universos.map((universo) => (
                      <option key={universo.id} value={universo.id}>
                        {universo.nome} ({universo.codigo})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Chefe de Auditoria *</label>
                  <select
                    value={formData.chefe_auditoria}
                    onChange={(e) => setFormData(prev => ({...prev, chefe_auditoria: e.target.value}))}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="">Selecione o chefe</option>
                    {profiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Escopo</label>
                <textarea
                  value={formData.escopo}
                  onChange={(e) => setFormData(prev => ({...prev, escopo: e.target.value}))}
                  placeholder="Escopo da auditoria"
                  className="w-full px-3 py-2 border rounded-md h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Objetivos (um por linha)</label>
                <textarea
                  value={formData.objetivos}
                  onChange={(e) => setFormData(prev => ({...prev, objetivos: e.target.value}))}
                  placeholder="Digite um objetivo por linha"
                  className="w-full px-3 py-2 border rounded-md h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Data de Início *</label>
                  <Input
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData(prev => ({...prev, data_inicio: e.target.value}))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Data Fim Planejada *</label>
                  <Input
                    type="date"
                    value={formData.data_fim_planejada}
                    onChange={(e) => setFormData(prev => ({...prev, data_fim_planejada: e.target.value}))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Horas Orçadas</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.horas_orcadas}
                    onChange={(e) => setFormData(prev => ({...prev, horas_orcadas: parseFloat(e.target.value) || 0}))}
                    placeholder="40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="planejamento">Planejamento</option>
                    <option value="em_execucao">Em Execução</option>
                    <option value="em_revisao">Em Revisão</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fase Atual *</label>
                  <select
                    value={formData.fase_atual}
                    onChange={(e) => setFormData(prev => ({...prev, fase_atual: e.target.value}))}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="planejamento">Planejamento</option>
                    <option value="fieldwork">Fieldwork</option>
                    <option value="relatorio">Relatório</option>
                    <option value="followup">Follow-up</option>
                  </select>
                </div>
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Detalhes do Projeto</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewingItem(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Código</label>
                  <p className="font-medium">{viewingItem.codigo}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Tipo</label>
                  <Badge variant="secondary">{viewingItem.tipo_auditoria}</Badge>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground">Título</label>
                <p className="font-medium text-lg">{viewingItem.titulo}</p>
              </div>

              {viewingItem.descricao && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Descrição</label>
                  <p className="text-sm">{viewingItem.descricao}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Status</label>
                  <Badge className={getStatusColor(viewingItem.status)}>
                    {viewingItem.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Fase Atual</label>
                  <Badge className={getFaseColor(viewingItem.fase_atual)}>
                    {viewingItem.fase_atual}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Universo Auditável</label>
                  <p className="font-medium">{viewingItem.universo_auditavel?.nome || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">{viewingItem.universo_auditavel?.tipo}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Chefe de Auditoria</label>
                  <p className="font-medium">{viewingItem.chefe_profile?.full_name || 'N/A'}</p>
                  {viewingItem.chefe_profile?.email && (
                    <p className="text-sm text-muted-foreground">{viewingItem.chefe_profile.email}</p>
                  )}
                </div>
              </div>

              {viewingItem.escopo && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Escopo</label>
                  <p className="text-sm">{viewingItem.escopo}</p>
                </div>
              )}

              {viewingItem.objetivos && Array.isArray(viewingItem.objetivos) && viewingItem.objetivos.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Objetivos</label>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {viewingItem.objetivos.map((objetivo, index) => (
                      <li key={index}>{objetivo}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Data Início</label>
                  <p>{new Date(viewingItem.data_inicio).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Data Fim Planejada</label>
                  <p>{new Date(viewingItem.data_fim_planejada).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Horas</label>
                  <p>{viewingItem.horas_orcadas}h orçadas / {viewingItem.horas_realizadas}h realizadas</p>
                </div>
              </div>

              {viewingItem.total_apontamentos > 0 && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Apontamentos</label>
                  <div className="flex gap-4 text-sm">
                    <span>Total: {viewingItem.total_apontamentos}</span>
                    <span className="text-red-600">Críticos: {viewingItem.apontamentos_criticos}</span>
                    <span className="text-orange-600">Altos: {viewingItem.apontamentos_altos}</span>
                    <span className="text-yellow-600">Médios: {viewingItem.apontamentos_medios}</span>
                    <span className="text-green-600">Baixos: {viewingItem.apontamentos_baixos}</span>
                  </div>
                </div>
              )}

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

export default ProjetosAuditoria;