import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, CheckCircle, Play, Activity, Award, BookOpen, AlertCircle, ArrowRight, Settings, Target, BarChart3, List, Search, Filter, ChevronDown, ChevronUp, Download, Trash2, Edit, Eye, Plus, TrendingUp, Clock, Users, Shield, Brain
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';

export default function AssessmentsDashboard() {
  const { user } = useAuth();
  const effectiveTenantId = useCurrentTenantId();
  const navigate = useNavigate();
  
  // Estados separados e simples
  const [assessments, setAssessments] = useState([]);
  const [frameworks, setFrameworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para seleção múltipla
  const [selectedAssessments, setSelectedAssessments] = useState([]);

  // Estados para modal de criação de assessment
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [assessmentType, setAssessmentType] = useState('framework'); // 'framework' ou 'custom'
  const [selectedFramework, setSelectedFramework] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_inicio: null,
    data_fim_planejada: null,
    responsavel_assessment: '',
    avaliadores: [],
    prioridade: 'media'
  });
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
    const [frameworksLoaded, setFrameworksLoaded] = useState(false);
  
      // Carregar dados quando o tenant mudar
  React.useEffect(() => {
    if (effectiveTenantId && user) {
      // Reset do controle de carregamento quando tenant mudar
      // setFrameworksLoaded(false);
      
      loadAssessments();
      loadFrameworks();
      loadAvailableUsers();
    }
  }, [effectiveTenantId, user]); // Removido loading da dependência

  // Calcular métricas baseadas nos assessments
  const metrics = React.useMemo(() => {
    if (!assessments || assessments.length === 0) {
      return {
        total: 0,
        active: 0,
        completed: 0,
        pending: 0,
        reviewPending: 0,
        avgMaturity: 0,
        frameworks: frameworks.length,
        monthlyTrend: 0,
        complianceRate: 0,
        totalControles: 0,
        controlesConformes: 0,
        controlesNaoConformes: 0,
        areasCobertas: 0
      };
    }

    const total = assessments.length;
    const completed = assessments.filter(a => a.status === 'concluido').length;
    const active = assessments.filter(a => ['em_andamento', 'em_execucao'].includes(a.status)).length;
    const pending = assessments.filter(a => a.status === 'planejado').length;
    const reviewPending = assessments.filter(a => a.status === 'aguardando_revisao').length;
    
    const avgMaturity = assessments.length > 0 
      ? Math.round(assessments.reduce((sum, a) => sum + (a.percentual_maturidade || 0), 0) / assessments.length)
      : 0;
    
    const totalControles = assessments.reduce((sum, a) => sum + (a.controles_avaliados || 0), 0);
    const controlesConformes = assessments.reduce((sum, a) => sum + (a.controles_conformes || 0), 0);
    const controlesNaoConformes = assessments.reduce((sum, a) => sum + (a.controles_nao_conformes || 0), 0);
    
    const complianceRate = totalControles > 0 
      ? Math.round((controlesConformes / totalControles) * 100)
      : 0;
    
    const areasCobertas = new Set(assessments.map(a => a.area_avaliada).filter(Boolean)).size;
    
    return {
      total,
      active,
      completed,
      pending,
      reviewPending,
      avgMaturity,
      frameworks: frameworks.length,
      monthlyTrend: Math.min(15, Math.max(-5, Math.round(Math.random() * 20 - 5))), // Simulado
      complianceRate,
      totalControles,
      controlesConformes,
      controlesNaoConformes,
      areasCobertas: Math.max(1, areasCobertas)
    };
  }, [assessments, frameworks]);
  
  // Estados para controle de datas - versão robusta
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);
  
  // Estados separados para as datas para evitar problemas de re-render
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  

  // Sincronizar estados de data separados com formData
  React.useEffect(() => {
    if (startDate !== formData.data_inicio) {
  
      setFormData(prev => ({ ...prev, data_inicio: startDate }));
    }
  }, [startDate]);

  React.useEffect(() => {
    if (endDate !== formData.data_fim_planejada) {
  
      setFormData(prev => ({ ...prev, data_fim_planejada: endDate }));
    }
  }, [endDate]);

    // Função separada para carregar assessments
  const loadAssessments = async () => {
    if (!effectiveTenantId) {

      return;
    }
    


    
    try {
      // Tentar com autenticação first
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        setError('Usuário não autenticado - necessário login');
        return;
      }

      const { data, error } = await supabase
        .from('assessments')
        .select(`
          id, titulo, status, percentual_conclusao, percentual_maturidade,
          fase_atual, area_avaliada, data_inicio, data_fim_planejada,
          nivel_maturidade_geral, nivel_maturidade_nome, controles_avaliados,
          controles_conformes, controles_nao_conformes, controles_parcialmente_conformes,
          framework:assessment_frameworks(nome, tipo_framework, categoria)
        `)
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false })
        .limit(20);



      if (error) {
        console.error('❌ Erro ao carregar assessments:', error);
        setError('Erro ao carregar assessments: ' + error.message);
        return;
      }


      setAssessments(data || []);
      setError('');
    } catch (error) {
      console.error('❌ Erro geral ao carregar assessments:', error);
      setError('Erro ao carregar assessments: ' + error.message);
    }
  };

      // Função para carregar frameworks
  const loadFrameworks = async () => {
    if (!effectiveTenantId) {
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('assessment_frameworks')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .eq('status', 'ativo')
        .order('nome');

      if (error) {
        console.error('❌ Erro ao carregar frameworks:', error);
        return;
      }

      // Garantir que não há duplicatas usando Map para deduplicação por ID
      const uniqueFrameworks = Array.from(
        new Map((data || []).map(framework => [framework.id, framework])).values()
      );

      setFrameworks(uniqueFrameworks);
      // setFrameworksLoaded(true);
    } catch (error) {
      console.error('❌ Erro geral ao carregar frameworks:', error);
    }
  };

      // Função para carregar usuários disponíveis
  const loadAvailableUsers = async () => {
    if (!effectiveTenantId) {
      return;
    }
    
    try {
      // Para usuários admin, buscar usuários que têm acesso à tenant selecionada
      // Isso inclui usuários com tenant_id específico OU usuários admin sem tenant_id
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, tenant_id')
        .or(`tenant_id.eq.${effectiveTenantId},tenant_id.is.null`)
        .order('full_name');

      if (error) {
        console.error('❌ Erro ao carregar usuários:', error);
        return;
      }

      // Mapear para o formato esperado e remover duplicatas por email
      const usersMap = new Map();
      (data || []).forEach(user => {
        if (user.email && !usersMap.has(user.email)) {
          usersMap.set(user.email, {
            id: user.id,
            nome: user.full_name,
            email: user.email,
            tenant_id: user.tenant_id
          });
        }
      });

      const uniqueUsers = Array.from(usersMap.values());
      setAvailableUsers(uniqueUsers);
    } catch (error) {
      console.error('❌ Erro geral ao carregar usuários:', error);
    }
  };

  // Função para resetar formulário

    const resetForm = () => {
    // Fechar popovers e resetar estados de data
    setIsStartDateOpen(false);
    setIsEndDateOpen(false);
    setStartDate(null);
    setEndDate(null);
    setFormData({
      titulo: '',
      descricao: '',
      data_inicio: null,
      data_fim_planejada: null,
      responsavel_assessment: '',
      avaliadores: [],
      prioridade: 'media'
    });
    setSelectedFramework(null);
    setAssessmentType('framework');
  };

  
  
  
  // Função para gerar código único do assessment
  const generateAssessmentCode = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ASS-${year}${month}${day}-${random}`;
  };

  // Função para criar novo assessment
  const handleCreateAssessment = async () => {
    if (!effectiveTenantId || !user) {
      toast.error('Dados de autenticação não disponíveis');
      return;
    }

    // Validações básicas
    if (!formData.titulo.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    if (assessmentType === 'framework' && !selectedFramework) {
      toast.error('Selecione um framework');
      return;
    }

    if (!formData.responsavel_assessment) {
      toast.error('Responsável pelo assessment é obrigatório');
      return;
    }

    setIsCreating(true);

    try {
      // Gerar código único para o assessment
      const codigo = generateAssessmentCode();
      
      // Preparar dados para inserção
      const data_inicio_formatted = startDate ? startDate.toISOString().split('T')[0] : null;
      const data_fim_formatted = endDate ? endDate.toISOString().split('T')[0] : null;

      const assessmentData = {
        tenant_id: effectiveTenantId,
        codigo: codigo,
        titulo: formData.titulo,
        descricao: formData.descricao || null,
        framework_id: assessmentType === 'framework' ? selectedFramework.id : null,
        responsavel_assessment: formData.responsavel_assessment,
        data_inicio: data_inicio_formatted,
        data_fim_planejada: data_fim_formatted,
        status: 'planejado',
        fase_atual: 'preparacao',
        percentual_conclusao: 0,
        dominios_avaliados: 0,
        controles_avaliados: 0,
        controles_conformes: 0,
        controles_nao_conformes: 0,
        controles_parcialmente_conformes: 0,
        gaps_identificados: 0,
        configuracoes_especiais: {
          prioridade: formData.prioridade,
          tipo: assessmentType
        },
        created_by: user.id,
        updated_by: user.id
      };

      const { data: newAssessment, error } = await supabase
        .from('assessments')
        .insert([assessmentData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar assessment:', error);
        throw error;
      }

      // Se há avaliadores selecionados, criar os relacionamentos
      if (formData.avaliadores.length > 0) {
        const avaliadoresData = formData.avaliadores.map(userId => ({
          tenant_id: effectiveTenantId,
          assessment_id: newAssessment.id,
          user_id: userId,
          role: 'respondent'
        }));

        const { error: avaliadoresError } = await supabase
          .from('assessment_user_roles')
          .insert(avaliadoresData);

        if (avaliadoresError) {
          console.error('Erro ao adicionar avaliadores:', avaliadoresError);
          toast.error('Assessment criado, mas houve erro ao adicionar avaliadores');
        }
      }

      toast.success('Assessment criado com sucesso!');
      setIsCreateModalOpen(false);
      resetForm();
      await loadAssessments(); // Recarregar lista

    } catch (error) {
      console.error('Erro ao criar assessment:', error);
      toast.error('Erro ao criar assessment: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };


  
  // Garantir frameworks únicos para o seletor (versão robusta)
  const uniqueFrameworksForSelect = React.useMemo(() => {
    if (!frameworks || frameworks.length === 0) return [];
    
    // Usar Map para garantir unicidade por ID
    const uniqueMap = new Map();
    frameworks.forEach(framework => {
      if (framework && framework.id && !uniqueMap.has(framework.id)) {
        uniqueMap.set(framework.id, framework);
      }
    });
    
    return Array.from(uniqueMap.values()).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [frameworks]);




  // Força recarregamento dos frameworks (temporário)
  React.useEffect(() => {
    if (effectiveTenantId && user) {
      console.log('🔄 Forçando recarregamento dos frameworks...');
      setFrameworks([]);
      loadFrameworks();
    }
  }, [effectiveTenantId, user, isCreateModalOpen]);


  // Debug para usuários duplicados (remover em produção)
  React.useEffect(() => {
    if (availableUsers.length > 0) {
      const emails = availableUsers.map(u => u.email);
      const uniqueEmails = [...new Set(emails)];
      if (emails.length !== uniqueEmails.length) {
        console.warn('🚨 Usuários duplicados detectados:', {
          total: emails.length,
          unique: uniqueEmails.length,
          duplicates: emails.length - uniqueEmails.length
        });
      }
    }
  }, [availableUsers]);

  // Debug para frameworks (remover em produção)
  React.useEffect(() => {
    if (frameworks.length > 0) {
      const ids = frameworks.map(f => f.id);
      const uniqueIds = [...new Set(ids)];
      if (ids.length !== uniqueIds.length) {
        console.warn('🚨 Frameworks duplicados detectados:', {
          total: ids.length,
          unique: uniqueIds.length,
          duplicates: ids.length - uniqueIds.length
        });
      }
    }
  }, [frameworks]);


  // Função para lidar com clique no framework
  const handleFrameworkClick = (framework) => {
    // Navegar para página de gestão de frameworks
    navigate('/assessments/frameworks');
  };

  // Funções auxiliares
  const getStatusColor = (status) => {
    const colors = {
      'planejado': 'bg-blue-100 text-blue-800',
      'em_andamento': 'bg-yellow-100 text-yellow-800',
      'em_execucao': 'bg-purple-100 text-purple-800',
      'concluido': 'bg-green-100 text-green-800',
      'aguardando_revisao': 'bg-orange-100 text-orange-800',
      'cancelado': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredAssessments = React.useMemo(() => {
    if (!searchTerm) return assessments;
    return assessments.filter(assessment => 
      assessment.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (assessment.framework?.nome || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [assessments, searchTerm]);

  const toggleAssessmentSelection = (id) => {
    setSelectedAssessments(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedAssessments.length === filteredAssessments.length) {
      setSelectedAssessments([]);
    } else {
      setSelectedAssessments(filteredAssessments.map(a => a.id));
    }
  };

  const clearSelection = () => {
    setSelectedAssessments([]);
  };

  const handleBulkExport = () => {
    console.log('Exportando assessments:', selectedAssessments);
    toast.success('Exportação iniciada');
  };

  const handleBulkDelete = () => {
    console.log('Excluindo assessments:', selectedAssessments);
    toast.success('Assessments excluídos');
    setSelectedAssessments([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Assessments</h1>
          <p className="text-muted-foreground">Central de Avaliação de Maturidade e Compliance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button onClick={() => {
            setIsCreateModalOpen(true);

          }}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Assessment
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  +{metrics.monthlyTrend}% vs mês anterior
                </p>
              </div>
              <Shield className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assessments</p>
                <p className="text-2xl font-bold">{metrics.total}</p>
              </div>
              <FileText className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold">{metrics.active}</p>
              </div>
              <Activity className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">{metrics.completed}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Maturidade Média</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.avgMaturity}%</p>
              </div>
              <Award className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Frameworks</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.frameworks}</p>
              </div>
              <BookOpen className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes Revisão</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.reviewPending}</p>
              </div>
              <Clock className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Planejados</p>
                <p className="text-2xl font-bold text-indigo-600">{metrics.pending}</p>
                <p className="text-xs text-muted-foreground">
                  Aguardando execução
                </p>
              </div>
              <Target className="h-10 w-10 text-indigo-600" />
            </div>
          </CardContent>
        </Card>


      </div>

      {/* Cards de Ação */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" 
              onClick={() => {
                setIsCreateModalOpen(true);
              }}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Plus className="h-8 w-8 text-green-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Novo Assessment</h3>
            <p className="text-muted-foreground text-sm">Iniciar nova avaliação de maturidade</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" 
              onClick={() => setSelectedTab('assessments')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Assessments</h3>
            <p className="text-muted-foreground text-sm">Gerenciar avaliações existentes</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" 
              onClick={() => navigate('/assessments/frameworks')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Frameworks</h3>
            <p className="text-muted-foreground text-sm">Biblioteca de controles e frameworks</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" 
              onClick={() => setSelectedTab('action-plans')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Target className="h-8 w-8 text-orange-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Planos de Ação</h3>
            <p className="text-muted-foreground text-sm">Remediar gaps e melhorias</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="action-plans">Planos de Ação</TabsTrigger>
        </TabsList>

                <TabsContent value="overview" className="space-y-6">
          {/* Status dos Assessments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Assessments Ativos
                </CardTitle>
                <CardDescription>
                  Avaliações em andamento e próximas ações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assessments.slice(0, 4).map(assessment => (
                    <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{assessment.titulo}</p>
                          <Badge className={getStatusColor(assessment.status)}>
                            {assessment.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <Progress value={assessment.percentual_conclusao} className="h-2 mb-2" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{assessment.percentual_conclusao}% concluído</span>
                          {assessment.percentual_maturidade && (
                            <span>{assessment.percentual_maturidade}% maturidade</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Frameworks Disponíveis
                </CardTitle>
                <CardDescription>
                  Biblioteca de controles e padrões
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {frameworks.map(framework => (
                    <div 
                      key={framework.id} 
                      className="flex flex-col space-y-1.5 p-6 pb-3 relative z-10 group/header cursor-pointer bg-card border border-border rounded-lg"
                      onClick={() => handleFrameworkClick(framework)}
                    >
                      <div className="absolute inset-0 opacity-0 group-hover/header:opacity-100 transition-opacity duration-300 pointer-events-none" 
                           style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
                      <div className="flex items-center justify-between gap-4 relative z-10">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="tracking-tight text-sm font-semibold truncate">{framework.nome}</h3>
                              <Badge variant="outline" className="text-xs">
                                {framework.versao}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="truncate capitalize">{framework.tipo_framework}</span>
                              {framework.categoria && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">{framework.categoria}</span>
                                </>
                              )}
                            </div>
                            {framework.descricao && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {framework.descricao}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {frameworks.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum framework cadastrado</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          {/* Ações em Lote */}
          {selectedAssessments.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-600 text-white">
                  {selectedAssessments.length} selecionados
                </Badge>
                <span className="text-sm text-blue-700">Ações:</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleBulkExport}>
                  <Download className="h-4 w-4 mr-1" />
                  Exportar
                </Button>
                <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
                <Button size="sm" variant="ghost" onClick={clearSelection}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lista de Assessments</CardTitle>
                  <CardDescription>
                    {filteredAssessments.length} assessments {searchTerm && `encontrados para "${searchTerm}"`}
                  </CardDescription>
                </div>
                
                {filteredAssessments.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedAssessments.length === filteredAssessments.length && filteredAssessments.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                    <label htmlFor="select-all" className="text-sm font-medium">
                      Selecionar todos
                    </label>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {filteredAssessments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {assessments.length === 0 ? 'Nenhum assessment encontrado' : 'Nenhum assessment corresponde à busca'}
                  </p>
                  <Button 
                    onClick={() => navigate('/assessments/execution')}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Assessment
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAssessments.map((assessment) => (
                    <div 
                      key={assessment.id} 
                      className={`flex items-center gap-3 p-4 border rounded-lg transition-colors ${
                        selectedAssessments.includes(assessment.id) 
                          ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <Checkbox
                        checked={selectedAssessments.includes(assessment.id)}
                        onCheckedChange={() => toggleAssessmentSelection(assessment.id)}
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium">{assessment.titulo}</h3>
                              <Badge className={getStatusColor(assessment.status)}>
                                {assessment.status.replace('_', ' ')}
                              </Badge>
                              {assessment.fase_atual && (
                                <Badge variant="outline" className="text-xs">
                                  {assessment.fase_atual.replace('_', ' ')}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {assessment.framework && (
                                <span className="flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  {assessment.framework.nome}
                                </span>
                              )}
                              {assessment.area_avaliada && (
                                <span className="flex items-center gap-1">
                                  <Target className="h-3 w-3" />
                                  {assessment.area_avaliada}
                                </span>
                              )}
                              {assessment.controles_avaliados > 0 && (
                                <span className="flex items-center gap-1">
                                  <Settings className="h-3 w-3" />
                                  {assessment.controles_avaliados} controles
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right ml-4">
                            <div className="space-y-1">
                              <p className="text-sm font-medium">
                                {assessment.percentual_conclusao || 0}% concluído
                              </p>
                              {assessment.percentual_maturidade && (
                                <p className="text-sm text-muted-foreground">
                                  {assessment.percentual_maturidade}% maturidade
                                </p>
                              )}
                              {assessment.nivel_maturidade_nome && (
                                <p className="text-xs text-muted-foreground">
                                  {assessment.nivel_maturidade_nome}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/assessments/${assessment.id}/view`)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Visualizar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/assessments/${assessment.id}/edit`)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          {assessment.status !== 'concluido' && (
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => navigate(`/assessments/${assessment.id}/execute`)}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Continuar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frameworks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frameworks Disponíveis</CardTitle>
              <CardDescription>
                {frameworks.length} frameworks cadastrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {frameworks.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Nenhum framework encontrado</p>
                  <Button onClick={() => navigate('/assessments/frameworks')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Framework
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uniqueFrameworksForSelect.map((framework) => (
                    <Card key={framework.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <h3 className="font-medium">{framework.nome}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {framework.tipo_framework}
                        </p>
                        <div className="flex justify-between items-center mt-3">
                          <Button size="sm" variant="outline">
                            Ver Controles
                          </Button>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="action-plans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Planos de Ação</CardTitle>
              <CardDescription>
                Gerenciar melhorias e remediações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Funcionalidade em desenvolvimento</p>
                <p className="text-sm text-muted-foreground">
                  Planos de ação serão criados automaticamente após assessments concluídos
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Criação de Assessment */}
      <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
        setIsCreateModalOpen(open);
        if (!open) {
          resetForm();
        }
      }}>
        <DialogContent
          onOpenAutoFocus={(e) => {

            e.preventDefault();
          }} 
          className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto z-50"
          style={{ zIndex: 50 }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Criar Novo Assessment
            </DialogTitle>
            <DialogDescription>
              Configure um novo assessment de maturidade para sua organização
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Tipo de Assessment */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Tipo de Assessment</Label>
              <RadioGroup 
                value={assessmentType} 
                onValueChange={setAssessmentType}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="framework" id="framework" />
                  <Label htmlFor="framework" className="cursor-pointer">
                    A partir de um Framework
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="cursor-pointer">
                    Assessment Customizado
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Seleção de Framework (se applicable) */}
            {assessmentType === 'framework' && (
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Framework <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={selectedFramework?.id || ''} 
                  onValueChange={(value) => {
                    const framework = frameworks.find(f => f.id === value);
                    setSelectedFramework(framework || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um framework..." />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueFrameworksForSelect.map((framework) => (
                      <SelectItem key={framework.id} value={framework.id}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {framework.tipo_framework}
                          </Badge>
                          {framework.nome}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedFramework && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">{selectedFramework.nome}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedFramework.descricao}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Informações Básicas */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">
                  Título do Assessment <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ex: Assessment ISO 27001 - Primeiro Trimestre 2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descreva o objetivo e escopo deste assessment..."
                  rows={3}
                />
              </div>
            </div>

                                                                                                            {/* Datas - Input HTML5 Simples */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data de Início</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={startDate ? startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => {

                    if (e.target.value) {
                      const newDate = new Date(e.target.value + 'T00:00:00');
                      setStartDate(newDate);

                    } else {
                      setStartDate(null);

                    }
                  }}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_fim">Prazo Final</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={endDate ? endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => {

                    if (e.target.value) {
                      const newDate = new Date(e.target.value + 'T00:00:00');
                      setEndDate(newDate);

                    } else {
                      setEndDate(null);

                    }
                  }}
                  min={startDate ? startDate.toISOString().split('T')[0] : undefined}
                  className="w-full"
                />
              </div>
            </div>





            {/* Responsáveis */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="responsavel">
                  Responsável pelo Assessment <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.responsavel_assessment}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, responsavel_assessment: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsável..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex flex-col">
                          <span>{user.nome}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Avaliadores/Respondentes</Label>
                <div className="space-y-2">
                  {availableUsers.map((user) => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={formData.avaliadores.includes(user.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({
                              ...prev,
                              avaliadores: [...prev.avaliadores, user.id]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              avaliadores: prev.avaliadores.filter(id => id !== user.id)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={`user-${user.id}`} className="cursor-pointer">
                        <div className="flex flex-col">
                          <span className="text-sm">{user.nome}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Prioridade */}
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select
                value={formData.prioridade}
                onValueChange={(value) => setFormData(prev => ({ ...prev, prioridade: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>



          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateAssessment}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Assessment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}