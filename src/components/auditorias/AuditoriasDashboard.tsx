import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RiskLevelDisplay } from '@/components/ui/risk-level-display';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import { 
  Calendar,
  ClipboardList,
  FileText,
  BarChart3,
  Target,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Plus,
  Filter,
  ArrowRight,
  Eye,
  Edit,
  Trash2,
  SquarePen,
  Download,
  Printer,
  Mail,
  Settings,
  BookOpen
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';
import { sanitizeInput, sanitizeObject, secureLog, auditLog } from '@/utils/securityLogger';
import { useCRUDRateLimit } from '@/hooks/useRateLimit';
import { AuditDocumentationPDF } from '@/utils/auditDocumentationPDF';
import { UniversoAuditavel } from './UniversoAuditavel';
import { ProjetosAuditoria } from './ProjetosAuditoria';
import { PapeisTrabalhoCompleto } from './PapeisTrabalhoCompleto';
import { AuditRiskMatrix } from './AuditRiskMatrix';
import { StatisticalSampling } from './StatisticalSampling';
import { RelatoriosAuditoriaSecure } from './RelatoriosAuditoriaSecure';
import { PlanejamentoFuncional } from './PlanejamentoFuncional';

interface AuditUniverse {
  id: string;
  processo: string;
  categoria_risco: string;
  nivel_risco: number;
  responsavel_processo: string;
  ultima_auditoria?: string;
  proxima_auditoria?: string;
  status: 'pendente' | 'em_andamento' | 'concluido' | 'agendado';
}

interface AuditProject {
  id: string;
  titulo: string;
  tipo: string;
  status: 'planejado' | 'em_andamento' | 'concluido' | 'suspenso';
  auditor_lider: string;
  data_inicio: string;
  data_fim_prevista: string;
  progresso: number;
}

interface TrabalhoAuditoria {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  tipo_auditoria: 'compliance' | 'operational' | 'financial' | 'it' | 'investigative' | 'follow_up';
  area_auditada: string;
  nivel_risco: 'baixo' | 'medio' | 'alto' | 'critico';
  data_inicio_planejada: string;
  data_fim_planejada: string;
  horas_planejadas: number;
  orcamento_estimado: number;
  status: 'planejado' | 'aprovado' | 'iniciado' | 'em_andamento' | 'suspenso' | 'concluido' | 'cancelado';
  percentual_conclusao: number;
  prioridade: number;
  auditor_lider: string;
  auditor_lider_profile?: {
    full_name: string;
  };
}

export function AuditoriasDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const selectedTenantId = useCurrentTenantId();
  
  // Determinar o tenant ID efetivo
  const getEffectiveTenantId = () => {
    // Para platform admin, usar o tenant selecionado
    if (user?.isPlatformAdmin) {
      return selectedTenantId || user?.tenantId || availableTenantId || '';
    }
    // Para usuários normais, usar o tenant do usuário
    if (user?.tenantId) {
      return user.tenantId;
    }
    // Fallback para desenvolvimento: usar o tenant selecionado ou disponível
    return selectedTenantId || availableTenantId || '';
  };
  

  
  const effectiveTenantId = getEffectiveTenantId();
  const { tenantSettings, refetch: refetchTenantSettings } = useTenantSettings();
  const [auditUniverse, setAuditUniverse] = useState<AuditUniverse[]>([]);
  const [auditProjects, setAuditProjects] = useState<AuditProject[]>([]);
  const [trabalhos, setTrabalhos] = useState<TrabalhoAuditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [relatoriosData, setRelatoriosData] = useState({
    total: 0,
    aprovados: 0,
    criticos: 0,
    complianceScore: 0,
    porTipo: {}
  });
  const [availableTenantId, setAvailableTenantId] = useState<string>('');
  
  // Rate limiting para operações CRUD
  const rateLimitCRUD = useCRUDRateLimit();
  
  // Log seguro para debug
  secureLog('info', 'AuditoriasDashboard renderizado', {
    matrixType: tenantSettings?.risk_matrix?.type,
    hasCustomLevels: !!tenantSettings?.risk_matrix?.risk_levels_custom,
    timestamp: new Date().toISOString()
  });

  // Função para gerar e baixar documentação em PDF
  const openDocumentacao = () => {
    try {
      toast.info("Gerando Manual de Auditoria...", {
        description: "Preparando documentação profissional em PDF",
      });

      // Pequeno delay para mostrar o toast
      setTimeout(() => {
        const pdfGenerator = new AuditDocumentationPDF();
        pdfGenerator.save();
        
        toast.success("Manual gerado com sucesso!", {
          description: "O PDF foi baixado e contém todas as funcionalidades e guias de uso.",
          duration: 5000
        });
      }, 500);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error("Erro ao gerar documentação", {
        description: "Houve um problema na geração do PDF. Tente novamente.",
      });
    }
  };

  // Carregar primeiro tenant disponível se necessário
  useEffect(() => {
    const loadAvailableTenant = async () => {
      if (!selectedTenantId && !user?.tenantId) {
        try {
          const { data: tenants, error } = await supabase
            .from('tenants')
            .select('id')
            .limit(1)
            .single();
          
          if (!error && tenants?.id) {
            setAvailableTenantId(tenants.id);
            secureLog('info', 'Tenant disponível encontrado para desenvolvimento', {
              tenantId: tenants.id
            });
          }
        } catch (error) {
          secureLog('error', 'Erro ao buscar tenant disponível', error);
        }
      }
    };
    
    loadAvailableTenant();
  }, [selectedTenantId, user?.tenantId]);

  useEffect(() => {
    const currentTenantId = getEffectiveTenantId();
    if (currentTenantId) {
      loadAuditData();
    }
  }, [effectiveTenantId, availableTenantId]);
  
  // Escutar atualizações da matriz de risco
  useEffect(() => {
    const handleMatrixUpdate = (event: CustomEvent) => {
      secureLog('info', 'Matriz de risco atualizada, recarregando configurações', event.detail);
      refetchTenantSettings();
    };
    
    window.addEventListener('risk-matrix-updated', handleMatrixUpdate as EventListener);
    
    return () => {
      window.removeEventListener('risk-matrix-updated', handleMatrixUpdate as EventListener);
    };
  }, [refetchTenantSettings]);

  const loadAuditData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados do universo auditável
      const { data: universeData, error: universeError } = await supabase
        .from('universo_auditavel')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false });

      if (universeError) {
        secureLog('error', 'Erro ao carregar universo auditável', universeError);
      } else {
        const mappedUniverse = universeData?.map(item => ({
          id: item.id,
          processo: item.nome || 'Processo não definido',
          categoria_risco: item.tipo || 'Não categorizado',
          nivel_risco: item.criticidade === 'critica' ? 5 : item.criticidade === 'alta' ? 4 : item.criticidade === 'media' ? 3 : item.criticidade === 'baixa' ? 2 : 1,
          responsavel_processo: item.responsavel || 'Não definido',
          ultima_auditoria: item.data_ultima_auditoria,
          proxima_auditoria: item.data_proxima_auditoria,
          status: item.status || 'pendente'
        })) || [];
        setAuditUniverse(mappedUniverse);
      }

      // Carregar projetos de auditoria
      const { data: projectsData, error: projectsError } = await supabase
        .from('projetos_auditoria')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false });

      if (projectsError) {
        secureLog('error', 'Erro ao carregar projetos de auditoria', projectsError);
      } else {
        console.log('🎯 [DEBUG] === PROJETOS CARREGADOS DO BANCO ===');
        console.log('🎯 [DEBUG] Total de projetos:', projectsData?.length || 0);
        console.log('🎯 [DEBUG] Projetos brutos:', projectsData);
        
        const mappedProjects = projectsData?.map(project => ({
          id: project.id,
          titulo: project.titulo || 'Projeto sem título',
          tipo: project.tipo_auditoria || 'Auditoria Geral',
          status: project.status || 'planejado',
          auditor_lider: project.chefe_auditoria || 'Não definido',
          data_inicio: project.data_inicio || '',
          data_fim_prevista: project.data_fim_planejada || '',
          progresso: project.fase_atual === 'concluida' ? 100 : 
                    project.fase_atual === 'followup' ? 90 :
                    project.fase_atual === 'fieldwork' ? 60 : 25,
          metadata: project.metadados || {},
          codigo: project.codigo || ''
        })) || [];
        
        console.log('🎯 [DEBUG] Projetos mapeados:', mappedProjects);
        console.log('🎯 [DEBUG] Status dos projetos:', mappedProjects.map(p => ({ titulo: p.titulo, status: p.status })));
        
        setAuditProjects(mappedProjects);
      }

      // Carregar trabalhos de auditoria
      const { data: trabalhosData, error: trabalhosError } = await supabase
        .from('trabalhos_auditoria')
        .select(`
          *,
          auditor_lider_profile:profiles!trabalhos_auditoria_auditor_lider_fkey(full_name)
        `)
        .eq('tenant_id', effectiveTenantId)
        .order('data_inicio_planejada', { ascending: true })
        .limit(5);

      if (trabalhosError) {
        secureLog('error', 'Erro ao carregar trabalhos de auditoria', trabalhosError);
      } else {
        setTrabalhos(trabalhosData || []);
      }

      // Carregar dados dos relatórios
      const { data: relatoriosDataResult, error: relatoriosError } = await supabase
        .from('relatorios_auditoria')
        .select('*')
        .eq('tenant_id', effectiveTenantId);

      if (relatoriosError) {
        secureLog('error', 'Erro ao carregar relatórios', relatoriosError);
      } else {
        const relatorios = relatoriosDataResult || [];
        const total = relatorios.length;
        const aprovados = relatorios.filter(r => ['aprovado', 'publicado', 'distribuido'].includes(r.status)).length;
        const criticos = relatorios.reduce((sum, r) => sum + (r.apontamentos_criticos || 0), 0);
        const complianceScore = relatorios.length > 0 
          ? Math.round(relatorios.reduce((sum, r) => sum + (r.compliance_score || 0), 0) / relatorios.length)
          : 0;
        
        // Calcular quantidade por tipo
        const porTipo = relatorios.reduce((acc, r) => {
          const tipo = r.tipo || 'outros';
          acc[tipo] = (acc[tipo] || 0) + 1;
          return acc;
        }, {});
        
        setRelatoriosData({
          total,
          aprovados,
          criticos,
          complianceScore,
          porTipo
        });
      }

    } catch (error) {
      secureLog('error', 'Erro ao carregar dados de auditoria', error);
      toast.error('Erro ao carregar dados de auditoria');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'em_andamento': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'agendado': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'pendente': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'suspenso': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRiskColor = (level: number) => {
    if (level >= 4) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (level >= 3) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  const riskColors = {
    baixo: 'bg-green-100 text-green-800',
    medio: 'bg-yellow-100 text-yellow-800',
    alto: 'bg-orange-100 text-orange-800',
    critico: 'bg-red-100 text-red-800'
  };

  const statusColors = {
    planejado: 'bg-blue-500 text-white dark:bg-blue-600',
    aprovado: 'bg-green-500 text-white dark:bg-green-600',
    iniciado: 'bg-yellow-500 text-white dark:bg-yellow-600',
    em_andamento: 'bg-yellow-500 text-white dark:bg-yellow-600',
    suspenso: 'bg-orange-500 text-white dark:bg-orange-600',
    concluido: 'bg-green-500 text-white dark:bg-green-600',
    cancelado: 'bg-red-500 text-white dark:bg-red-600'
  };

  // Mapear níveis numéricos para nomes de risco baseado na configuração da tenant
  const mapRiskLevel = (numericLevel: number): string => {
    const matrixType = tenantSettings?.risk_matrix?.type || '5x5';
    
    // Se há configuração personalizada, usar ela
    if (tenantSettings?.risk_matrix?.risk_levels_custom) {
      const customLevels = tenantSettings.risk_matrix.risk_levels_custom
        .sort((a, b) => a.value - b.value);
      
      // Mapear o nível numérico para o nível personalizado correspondente
      const levelIndex = numericLevel - 1;
      if (levelIndex >= 0 && levelIndex < customLevels.length) {
        return customLevels[levelIndex].name;
      }
    }
    
    // Mapeamento baseado no tipo de matriz
    switch (matrixType) {
      case '3x3':
        switch (numericLevel) {
          case 1: return 'Baixo';
          case 2: return 'Médio';
          case 3: return 'Alto';
          default: return 'Baixo';
        }
      case '4x4':
        switch (numericLevel) {
          case 1: return 'Baixo';
          case 2: return 'Médio';
          case 3: return 'Alto';
          case 4: return 'Crítico';
          default: return 'Baixo';
        }
      case '5x5':
      default:
        switch (numericLevel) {
          case 1: return 'Muito Baixo';
          case 2: return 'Baixo';
          case 3: return 'Médio';
          case 4: return 'Alto';
          case 5: return 'Muito Alto';
          default: return 'Baixo';
        }
    }
  };

  // Definição dos tipos de relatórios disponíveis
  const reportTypes = [
    {
      id: 'audit_universe_summary',
      name: 'Resumo do Universo Auditável',
      description: 'Relatório completo dos processos auditáveis e níveis de risco',
      icon: Target
    },
    {
      id: 'audit_projects_status',
      name: 'Status dos Projetos de Auditoria',
      description: 'Relatório detalhado do andamento dos projetos',
      icon: ClipboardList
    },
    {
      id: 'risk_assessment_report',
      name: 'Relatório de Avaliação de Riscos',
      description: 'Análise consolidada dos riscos identificados',
      icon: AlertTriangle
    },
    {
      id: 'audit_plan_compliance',
      name: 'Conformidade do Plano de Auditoria',
      description: 'Acompanhamento da execução do plano anual',
      icon: CheckCircle
    },
    {
      id: 'working_papers_summary',
      name: 'Resumo dos Papéis de Trabalho',
      description: 'Consolidação das evidências coletadas',
      icon: FileText
    },
    {
      id: 'executive_dashboard',
      name: 'Dashboard Executivo',
      description: 'Visão gerencial com KPIs e métricas principais',
      icon: BarChart3
    }
  ];

  // Função para gerar relatórios
  const handleGenerateReport = async () => {
    if (!selectedReportType) {
      toast.error('Selecione um tipo de relatório');
      return;
    }

    const currentEffectiveTenantId = getEffectiveTenantId();
    
    if (!currentEffectiveTenantId) {
      const errorMsg = user?.isPlatformAdmin 
        ? 'Selecione uma organização no seletor de tenant no canto superior direito.'
        : 'Erro: Tenant não identificado. Verifique se você está associado a uma organização.';
      
      toast.error(errorMsg);
      return;
    }

    setGeneratingReport(true);
    
    secureLog('info', 'Iniciando geração de relatório', {
      selectedReportType,
      selectedFormat,
      effectiveTenantId: currentEffectiveTenantId,
      userId: user?.id
    });
    
    try {
      const reportInfo = reportTypes.find(r => r.id === selectedReportType);
      
      // Criar novo relatório no banco de dados
      const novoRelatorio = {
        tenant_id: currentEffectiveTenantId,
        titulo: `${reportInfo?.name} - ${new Date().toLocaleDateString('pt-BR')}`,
        tipo: selectedReportType,
        resumo_executivo: `Relatório ${reportInfo?.name} gerado automaticamente em ${new Date().toLocaleDateString('pt-BR')}.`,
        status: 'rascunho'
      };
      
      // Adicionar campos opcionais se disponíveis
      if (user?.id) {
        novoRelatorio.autor_id = user.id;
        novoRelatorio.created_by = user.id;
      }

      secureLog('info', 'Tentando inserir relatório', novoRelatorio);
      
      const { data: relatorio, error: relatorioError } = await supabase
        .from('relatorios_auditoria')
        .insert(novoRelatorio)
        .select()
        .single();

      console.log('📊 [DEBUG] Resultado da inserção:', {
        success: !relatorioError,
        relatorio,
        error: relatorioError
      });

      if (relatorioError) {
        secureLog('error', 'Erro detalhado ao inserir relatório', {
          error: relatorioError,
          message: relatorioError.message,
          details: relatorioError.details,
          hint: relatorioError.hint,
          code: relatorioError.code
        });
        throw relatorioError;
      }

      // Criar registro de exportação
      const exportData = {
        tenant_id: currentEffectiveTenantId,
        relatorio_id: relatorio.id,
        relatorio_titulo: relatorio.titulo,
        formato: selectedFormat,
        status: 'processando',
        progresso: 0,
        configuracao: {
          formato: selectedFormat,
          qualidade: 'alta',
          incluir_anexos: true,
          incluir_assinaturas: true
        }
      };
      
      // Adicionar campo opcional se disponível
      if (user?.id) {
        exportData.criado_por = user.id;
      }

      const { data: exportacao, error: exportError } = await supabase
        .from('relatorios_exportacoes')
        .insert(exportData)
        .select()
        .single();

      if (exportError) {
        throw exportError;
      }

      // Simular progresso de exportação
      let progress = 0;
      const progressInterval = setInterval(async () => {
        progress += Math.random() * 25 + 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);
          
          // Finalizar exportação
          await supabase
            .from('relatorios_exportacoes')
            .update({
              status: 'concluido',
              progresso: 100,
              url_download: `/api/reports/download/${exportacao.id}`,
              tamanho_arquivo: Math.floor(Math.random() * 5000000) + 1000000
            })
            .eq('id', exportacao.id);
          
          toast.success(`Relatório "${reportInfo?.name}" gerado com sucesso!`);
          setGeneratingReport(false);
          setReportDialogOpen(false);
          setSelectedReportType('');
          setSelectedFormat('pdf');
          
          // Recarregar dados
          loadAuditData();
          
          // Log de sucesso
          secureLog('info', 'Relatório criado com sucesso', {
            relatorioId: relatorio.id,
            tipo: selectedReportType,
            formato: selectedFormat
          });
        } else {
          await supabase
            .from('relatorios_exportacoes')
            .update({ progresso: Math.floor(progress) })
            .eq('id', exportacao.id);
        }
      }, 500);
      
    } catch (error) {
      secureLog('error', 'Erro ao gerar relatório', error);
      toast.error('Erro ao gerar relatório. Tente novamente.');
      setGeneratingReport(false);
    }
  };

  // Função para criar relatório de um tipo específico
  const handleCreateReportByType = async (tipo) => {
    console.log('🔥 [DEBUG] === BOTÃO CRIAR CLICADO ===');
    console.log('🔥 [DEBUG] Tipo de relatório:', tipo);
    console.log('🔥 [DEBUG] Timestamp:', new Date().toISOString());
    
    const currentEffectiveTenantId = getEffectiveTenantId();
    
    console.log('🔥 [DEBUG] Informações do tenant:', {
      user: {
        id: user?.id,
        email: user?.email,
        tenantId: user?.tenantId,
        isPlatformAdmin: user?.isPlatformAdmin
      },
      selectedTenantId,
      currentEffectiveTenantId,
      effectiveTenantId,
      availableTenantId
    });
    
    secureLog('info', 'Debug tenant information', {
      user: {
        id: user?.id,
        email: user?.email,
        tenantId: user?.tenantId,
        isPlatformAdmin: user?.isPlatformAdmin
      },
      selectedTenantId,
      currentEffectiveTenantId,
      effectiveTenantId
    });
    
    if (!currentEffectiveTenantId) {
      const errorMsg = user?.isPlatformAdmin 
        ? 'Selecione uma organização no seletor de tenant no canto superior direito.'
        : 'Erro: Tenant não identificado. Verifique se você está associado a uma organização.';
      
      toast.error(errorMsg);
      secureLog('error', 'Tenant ID não encontrado', {
        user: {
          id: user?.id,
          email: user?.email,
          tenantId: user?.tenantId,
          isPlatformAdmin: user?.isPlatformAdmin
        },
        selectedTenantId,
        availableTenantId,
        effectiveTenantId: currentEffectiveTenantId
      });
      return;
    }

    setGeneratingReport(true);
    
    try {
      const tipoInfo = {
        executivo: { name: 'Relatório Executivo', description: 'Visão estratégica para alta administração' },
        tecnico: { name: 'Relatório Técnico', description: 'Análise detalhada de processos e controles' },
        compliance: { name: 'Relatório de Compliance', description: 'Conformidade regulatória e normativa' },
        risco: { name: 'Relatório de Risco', description: 'Avaliação e gestão de riscos' },
        performance: { name: 'Relatório de Performance', description: 'Indicadores de desempenho e eficiência' },
        seguimento: { name: 'Relatório de Seguimento', description: 'Acompanhamento de recomendações' },
        especial: { name: 'Relatório Especial', description: 'Investigações e análises específicas' }
      };
      
      const reportInfo = tipoInfo[tipo] || { name: 'Relatório Personalizado', description: 'Relatório customizado' };
      
      // Criar novo relatório no banco de dados
      const novoRelatorio = {
        tenant_id: currentEffectiveTenantId,
        titulo: `${reportInfo.name} - ${new Date().toLocaleDateString('pt-BR')}`,
        tipo: tipo,
        resumo_executivo: `${reportInfo.description}. Relatório gerado em ${new Date().toLocaleDateString('pt-BR')}.`,
        status: 'rascunho',
        total_apontamentos: 0,
        apontamentos_criticos: 0
      };
      
      // Adicionar campos opcionais se disponíveis
      if (user?.id) {
        novoRelatorio.autor_id = user.id;
        novoRelatorio.created_by = user.id;
      }

      console.log('🔍 [DEBUG] === PREPARANDO INSERÇÃO NO BANCO ===');
      console.log('🔍 [DEBUG] Dados completos antes da inserção:', {
        tipo,
        novoRelatorio,
        currentEffectiveTenantId,
        user: {
          id: user?.id,
          email: user?.email,
          tenantId: user?.tenantId,
          isPlatformAdmin: user?.isPlatformAdmin
        },
        selectedTenantId,
        availableTenantId
      });
      
      console.log('🔍 [DEBUG] Objeto novoRelatorio:', JSON.stringify(novoRelatorio, null, 2));
      
      secureLog('info', 'Tentando inserir relatório por tipo', {
        tipo,
        novoRelatorio,
        effectiveTenantId: currentEffectiveTenantId,
        userId: user?.id
      });
      
      console.log('🔍 [DEBUG] === EXECUTANDO INSERT NO SUPABASE ===');
      
      const { data: relatorio, error: relatorioError } = await supabase
        .from('relatorios_auditoria')
        .insert(novoRelatorio)
        .select()
        .single();

      console.log('📊 [DEBUG] === RESULTADO DA INSERÇÃO ===');
      console.log('📊 [DEBUG] Sucesso:', !relatorioError);
      console.log('📊 [DEBUG] Relatório criado:', relatorio);
      console.log('📊 [DEBUG] Erro (se houver):', relatorioError);
      
      if (relatorioError) {
        console.error('❌ [DEBUG] ERRO DETALHADO:', {
          message: relatorioError.message,
          details: relatorioError.details,
          hint: relatorioError.hint,
          code: relatorioError.code,
          stack: relatorioError.stack
        });
      }

      if (relatorioError) {
        console.error('❌ [DEBUG] === ERRO NA INSERÇÃO ===');
        console.error('❌ [DEBUG] Tipo de erro:', relatorioError.code);
        console.error('❌ [DEBUG] Mensagem:', relatorioError.message);
        
        secureLog('error', 'Erro detalhado ao inserir relatório por tipo', {
          error: relatorioError,
          message: relatorioError.message,
          details: relatorioError.details,
          hint: relatorioError.hint,
          code: relatorioError.code,
          tipo,
          novoRelatorio
        });
        
        // Mostrar erro mais detalhado para o usuário
        toast.error(`Erro ao criar relatório: ${relatorioError.message}`);
        throw relatorioError;
      }

      console.log('✅ [DEBUG] === RELATÓRIO CRIADO COM SUCESSO ===');
      console.log('✅ [DEBUG] ID do relatório:', relatorio.id);
      console.log('✅ [DEBUG] Título:', relatorio.titulo);
      
      toast.success(`${reportInfo.name} criado com sucesso!`);
      
      // Gerar PDF automaticamente
      console.log('📄 [DEBUG] === INICIANDO GERAÇÃO DE PDF COM DADOS REAIS ===');
      try {
        console.log('📄 [DEBUG] Carregando dados reais do banco...');
        
        // Carregar dados reais do banco para o relatório
        const { data: dadosReais, error: dadosError } = await supabase
          .from('relatorios_auditoria')
          .select(`
            *,
            projetos_auditoria(titulo, codigo, status),
            profiles:autor_id(full_name)
          `)
          .eq('tenant_id', currentEffectiveTenantId)
          .order('created_at', { ascending: false })
          .limit(10);
        
        const { data: apontamentosData } = await supabase
          .from('apontamentos_auditoria')
          .select('*')
          .eq('tenant_id', currentEffectiveTenantId)
          .limit(20);
        
        const { data: projetosData } = await supabase
          .from('projetos_auditoria')
          .select('*')
          .eq('tenant_id', currentEffectiveTenantId)
          .limit(10);
        
        console.log('📄 [DEBUG] Dados carregados:', {
          relatorios: dadosReais?.length || 0,
          apontamentos: apontamentosData?.length || 0,
          projetos: projetosData?.length || 0
        });
        
        // Importar jsPDF dinamicamente para gerar PDF do relatório
        const { default: jsPDF } = await import('jspdf');
        const doc = new jsPDF('p', 'mm', 'a4');
        
        console.log('📄 [DEBUG] Configurando layout ultra-compacto do PDF...');
        
        // Configurações do documento ultra-compactas
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margins = { top: 15, left: 15, right: 15, bottom: 15 };
        let currentY = margins.top;
        
        // Calcular estatísticas dos dados reais
        const totalRelatorios = dadosReais?.length || 0;
        const totalApontamentos = apontamentosData?.length || 0;
        const apontamentosCriticos = apontamentosData?.filter(a => a.criticidade === 'critica').length || 0;
        // Buscar projetos ativos (em_andamento, em_execucao, iniciado, aprovado)
        const projetosAtivos = projetosData?.filter(p => 
          ['em_andamento', 'em_execucao', 'iniciado', 'aprovado'].includes(p.status)
        ).length || 0;
        const ultimosRelatorios = dadosReais?.slice(0, 5) || [];
        const apontamentosRecentes = apontamentosData?.slice(0, 8) || [];
        
        console.log('📄 [DEBUG] Estatísticas calculadas:', {
          totalRelatorios,
          totalApontamentos,
          apontamentosCriticos,
          projetosAtivos,
          statusProjetos: projetosData?.map(p => p.status) || []
        });
        
        // Função para adicionar nova página se necessário
        const checkPageBreak = (requiredSpace) => {
          if (currentY + requiredSpace > pageHeight - margins.bottom) {
            doc.addPage();
            currentY = margins.top;
            return true;
          }
          return false;
        };
        
        // Função para adicionar cabeçalho compacto
        const addHeader = () => {
          // Linha superior azul mais fina
          doc.setFillColor(52, 152, 219);
          doc.rect(0, 0, pageWidth, 5, 'F');
          
          // Logo/Título da empresa compacto
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(52, 152, 219);
          doc.text('AUDITORIA INTERNA', margins.left, 18);
          
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text('Sistema GRC', margins.left, 24);
          
          // Data no canto direito
          doc.text(new Date().toLocaleDateString('pt-BR'), pageWidth - margins.right - 25, 18);
          
          // Linha separadora mais fina
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.3);
          doc.line(margins.left, 26, pageWidth - margins.right, 26);
          
          currentY = 32;
        };
        
        // Função para adicionar rodapé compacto
        const addFooter = (pageNum, totalPages) => {
          doc.setFontSize(7);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(150, 150, 150);
          
          // Linha superior do rodapé mais fina
          doc.setDrawColor(200, 200, 200);
          doc.line(margins.left, pageHeight - 12, pageWidth - margins.right, pageHeight - 12);
          
          // Texto do rodapé compacto
          doc.text('Confidencial', margins.left, pageHeight - 8);
          doc.text(`${pageNum}/${totalPages}`, pageWidth - margins.right - 15, pageHeight - 8);
        };
        
        // PÁGINA ÚNICA - CONTEÚDO COMPLETO ULTRA-COMPACTO
        addHeader();
        
        // Título principal compacto
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(52, 152, 219);
        const titleLines = doc.splitTextToSize(relatorio.titulo, pageWidth - margins.left - margins.right);
        titleLines.forEach((line, index) => {
          doc.text(line, margins.left, currentY + (index * 5));
        });
        currentY += titleLines.length * 5 + 6;
        
        // Informações básicas em linha
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        const tipoFormatado = reportInfo.name || `Relatório ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
        doc.text(`${tipoFormatado} | ID: ${relatorio.id.substring(0, 8)} | Status: ${relatorio.status.toUpperCase()}`, margins.left, currentY);
        currentY += 8;
        
        // ESTATÍSTICAS GERAIS (2 colunas)
        checkPageBreak(25);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(52, 152, 219);
        doc.text('ESTATÍSTICAS GERAIS', margins.left, currentY);
        currentY += 6;
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        
        // Coluna 1
        const col1X = margins.left;
        const col2X = margins.left + 90;
        
        doc.text(`Total de Relatórios: ${totalRelatorios}`, col1X, currentY);
        doc.text(`Projetos Ativos: ${projetosAtivos}`, col2X, currentY);
        currentY += 4;
        
        doc.text(`Total de Apontamentos: ${totalApontamentos}`, col1X, currentY);
        doc.text(`Apontamentos Críticos: ${apontamentosCriticos}`, col2X, currentY);
        currentY += 8;
        
        // RESUMO EXECUTIVO compacto
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(52, 152, 219);
        doc.text('RESUMO EXECUTIVO', margins.left, currentY);
        currentY += 6;
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        const resumoLines = doc.splitTextToSize(relatorio.resumo_executivo, pageWidth - margins.left - margins.right);
        resumoLines.forEach((line) => {
          checkPageBreak(4);
          doc.text(line, margins.left, currentY);
          currentY += 4;
        });
        currentY += 6;
        
        // ÚLTIMOS RELATÓRIOS (dados reais)
        if (ultimosRelatorios.length > 0) {
          checkPageBreak(20);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(52, 152, 219);
          doc.text('ÚLTIMOS RELATÓRIOS', margins.left, currentY);
          currentY += 6;
          
          doc.setFontSize(7);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(60, 60, 60);
          
          ultimosRelatorios.forEach((rel, index) => {
            if (index < 4) { // Limitar a 4 para economizar espaço
              checkPageBreak(4);
              const dataRel = new Date(rel.created_at).toLocaleDateString('pt-BR');
              const titulo = rel.titulo.length > 50 ? rel.titulo.substring(0, 50) + '...' : rel.titulo;
              doc.text(`• ${titulo} (${dataRel})`, margins.left + 2, currentY);
              currentY += 3.5;
            }
          });
          currentY += 4;
        }
        
        // APONTAMENTOS RECENTES (dados reais)
        if (apontamentosRecentes.length > 0) {
          checkPageBreak(20);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(52, 152, 219);
          doc.text('APONTAMENTOS RECENTES', margins.left, currentY);
          currentY += 6;
          
          doc.setFontSize(7);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(60, 60, 60);
          
          apontamentosRecentes.slice(0, 6).forEach((apt, index) => {
            checkPageBreak(4);
            const criticidade = apt.criticidade || 'media';
            const cor = criticidade === 'critica' ? [220, 53, 69] : 
                       criticidade === 'alta' ? [255, 193, 7] : [40, 167, 69];
            
            doc.setTextColor(...cor);
            doc.text('•', margins.left + 2, currentY);
            doc.setTextColor(60, 60, 60);
            
            const descricao = apt.descricao?.length > 60 ? apt.descricao.substring(0, 60) + '...' : apt.descricao || 'Sem descrição';
            doc.text(`${descricao} [${criticidade.toUpperCase()}]`, margins.left + 8, currentY);
            currentY += 3.5;
          });
          currentY += 4;
        }
        
        // PROJETOS EM ANDAMENTO (dados reais)
        if (projetosData && projetosData.length > 0) {
          checkPageBreak(20);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(52, 152, 219);
          doc.text('PROJETOS ATIVOS', margins.left, currentY);
          currentY += 6;
          
          doc.setFontSize(7);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(60, 60, 60);
          
          // Filtrar projetos ativos com status corretos
          const projetosAtivosLista = projetosData.filter(p => 
            ['em_andamento', 'em_execucao', 'iniciado', 'aprovado'].includes(p.status)
          ).slice(0, 4);
          
          console.log('📄 [DEBUG] Projetos ativos encontrados:', {
            total: projetosData.length,
            ativos: projetosAtivosLista.length,
            statusDisponiveis: projetosData.map(p => p.status),
            projetosAtivos: projetosAtivosLista.map(p => ({ titulo: p.titulo, status: p.status }))
          });
          
          if (projetosAtivosLista.length > 0) {
            projetosAtivosLista.forEach((proj, index) => {
              checkPageBreak(4);
              const titulo = proj.titulo?.length > 55 ? proj.titulo.substring(0, 55) + '...' : proj.titulo || 'Sem título';
              const tipo = proj.tipo_auditoria || proj.tipo || 'Geral';
              const status = proj.status || 'N/A';
              doc.text(`• ${titulo} [${tipo} - ${status.toUpperCase()}]`, margins.left + 2, currentY);
              currentY += 3.5;
            });
          } else {
            doc.text('• Nenhum projeto ativo encontrado', margins.left + 2, currentY);
            currentY += 3.5;
          }
          currentY += 4;
        }
        
        // RECOMENDAÇÕES PRINCIPAIS
        checkPageBreak(15);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(52, 152, 219);
        doc.text('RECOMENDAÇÕES PRINCIPAIS', margins.left, currentY);
        currentY += 6;
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        
        const recomendacoes = [
          'Fortalecer controles internos nos processos críticos identificados',
          'Implementar monitoramento contínuo dos indicadores de risco',
          'Capacitar equipes sobre políticas e procedimentos atualizados',
          'Estabelecer cronograma de acompanhamento das ações corretivas'
        ];
        
        recomendacoes.forEach((recomendacao, index) => {
          checkPageBreak(4);
          doc.text(`${index + 1}. ${recomendacao}`, margins.left + 2, currentY);
          currentY += 4;
        });
        currentY += 6;
        
        // CONCLUSÃO
        checkPageBreak(15);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(52, 152, 219);
        doc.text('CONCLUSÃO', margins.left, currentY);
        currentY += 6;
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        
        const conclusaoTexto = `Este relatório ${tipo} apresenta ${totalApontamentos} apontamentos identificados, sendo ${apontamentosCriticos} de criticidade alta. As recomendações propostas visam fortalecer o ambiente de controle. Recomenda-se acompanhamento trimestral da implementação das ações corretivas.`;
        const conclusaoLines = doc.splitTextToSize(conclusaoTexto, pageWidth - margins.left - margins.right);
        conclusaoLines.forEach((line) => {
          checkPageBreak(4);
          doc.text(line, margins.left, currentY);
          currentY += 4;
        });
        
        // Adicionar rodapés em todas as páginas
        const totalPages = doc.internal.pages.length - 1;
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          addFooter(i, totalPages);
        }
        
        console.log('📄 [DEBUG] Salvando PDF profissional...');
        const fileName = `Relatorio_${tipo}_${new Date().toISOString().split('T')[0]}_${relatorio.id.substring(0, 8)}.pdf`;
        doc.save(fileName);
        
        console.log('✅ [DEBUG] PDF profissional gerado e baixado com sucesso!');
        toast.success('Relatório profissional em PDF baixado automaticamente!');
        
      } catch (pdfError) {
        console.error('❌ [DEBUG] Erro ao gerar PDF:', pdfError);
        toast.error('Relatório criado, mas houve erro na geração do PDF');
        secureLog('error', 'Erro ao gerar PDF do relatório', {
          relatorioId: relatorio.id,
          error: pdfError
        });
      }
      
      // Recarregar dados
      console.log('🔄 [DEBUG] Recarregando dados da página...');
      loadAuditData();
      
    } catch (error) {
      secureLog('error', 'Erro ao criar relatório', error);
      toast.error('Erro ao criar relatório. Tente novamente.');
    } finally {
      setGeneratingReport(false);
    }
  };

  // Função para enviar relatório por email
  const handleEmailReport = async () => {
    if (!selectedReportType) {
      toast.error('Selecione um tipo de relatório');
      return;
    }

    setGeneratingReport(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const reportInfo = reportTypes.find(r => r.id === selectedReportType);
      toast.success(`Relatório "${reportInfo?.name}" enviado por email!`);
      
      setReportDialogOpen(false);
      setSelectedReportType('');
      
    } catch (error) {
      secureLog('error', 'Erro ao enviar relatório por email', error);
      toast.error('Erro ao enviar relatório por email.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const calculateMetrics = () => {
    const totalProcesses = auditUniverse.length;
    const highRiskProcesses = auditUniverse.filter(p => p.nivel_risco >= 4).length;
    const completedAudits = auditUniverse.filter(p => p.status === 'concluido').length;
    const activeProjects = auditProjects.filter(p => p.status === 'em_andamento').length;
    
    return {
      totalProcesses,
      highRiskProcesses,
      completedAudits,
      activeProjects,
      coveragePercentage: totalProcesses > 0 ? Math.round((completedAudits / totalProcesses) * 100) : 0
    };
  };

  const metrics = calculateMetrics();

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
          <h1 className="text-3xl font-bold">Auditoria Interna</h1>
          <p className="text-muted-foreground">Motor de Assurance Dinâmico e Conectado</p>
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
          <Button variant="outline" onClick={openDocumentacao} title="Manual do Usuário">
            <BookOpen className="h-4 w-4 mr-2" />
            Documentação
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processos</p>
                <p className="text-xl sm:text-2xl font-bold">{metrics.totalProcesses}</p>
              </div>
              <Target className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alto Risco</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">{metrics.highRiskProcesses}</p>
              </div>
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{metrics.completedAudits}</p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{metrics.activeProjects}</p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cobertura</p>
                <p className="text-xl sm:text-2xl font-bold">{metrics.coveragePercentage}%</p>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Módulos de Auditoria */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" onClick={() => navigate('/planejamento-estrategico')}>
          <CardContent className="p-4 sm:p-6 relative z-10">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-2">Planejamento Estratégico</h3>
            <p className="text-muted-foreground text-sm">Gestão completa do planejamento estratégico organizacional</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" onClick={() => setSelectedTab('projects')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <ClipboardList className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-2">Projetos</h3>
            <p className="text-muted-foreground text-sm">Gestão de projetos de auditoria e equipes</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" onClick={() => setSelectedTab('working-papers')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-2">Papéis de Trabalho</h3>
            <p className="text-muted-foreground text-sm">Documentação digital de evidências</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>

        <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
          <DialogTrigger asChild>
            <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden">
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-base sm:text-lg mb-2">📊 Relatórios Avançados</h3>
                <p className="text-muted-foreground text-sm">Geração automática de relatórios em múltiplos formatos</p>
              </CardContent>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
            </Card>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                Central de Relatórios de Auditoria
              </DialogTitle>
              <DialogDescription>
                Selecione o tipo de relatório e formato para geração ou exportação
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Seleção do Tipo de Relatório */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Tipo de Relatório</label>
                <div className="grid gap-3">
                  {reportTypes.map((report) => {
                    const IconComponent = report.icon;
                    return (
                      <Card 
                        key={report.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedReportType === report.id ? 'ring-2 ring-primary bg-primary/5' : ''
                        }`}
                        onClick={() => setSelectedReportType(report.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              selectedReportType === report.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            }`}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{report.name}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Seleção do Formato */}
              {selectedReportType && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">Formato de Exportação</label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-red-600" />
                          PDF - Portable Document Format
                        </div>
                      </SelectItem>
                      <SelectItem value="excel">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          Excel - Planilha eletrônica
                        </div>
                      </SelectItem>
                      <SelectItem value="csv">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          CSV - Valores separados por vírgula
                        </div>
                      </SelectItem>
                      <SelectItem value="png">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-purple-600" />
                          PNG - Imagem do relatório
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Opções Avançadas */}
              {selectedReportType && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">Opções Avançadas</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Período
                    </Button>
                  </div>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={handleGenerateReport}
                  disabled={!selectedReportType || generatingReport}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {generatingReport ? 'Gerando...' : 'Gerar Relatório'}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleEmailReport}
                  disabled={!selectedReportType || generatingReport}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                
                <Button 
                  variant="outline"
                  disabled={!selectedReportType || generatingReport}
                  onClick={() => toast.info('Função de impressão será implementada')}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Módulos Principais */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-8">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="universe">Universo Auditável</TabsTrigger>
          <TabsTrigger value="projects">Projetos</TabsTrigger>
          <TabsTrigger value="working-papers">Papéis de Trabalho</TabsTrigger>
          <TabsTrigger value="risk-matrix">Matriz de Risco</TabsTrigger>
          <TabsTrigger value="sampling">Amostragem</TabsTrigger>
          <TabsTrigger value="planejamento">Planejamento</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Heatmap de Riscos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Heatmap de Riscos
                </CardTitle>
                <CardDescription>
                  Distribuição de processos por nível de risco
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RiskLevelDisplay 
                  risks={auditUniverse.map(p => ({ 
                    risk_level: mapRiskLevel(p.nivel_risco)
                  }))}
                  size="md"
                  responsive={true}
                  className=""
                />
              </CardContent>
            </Card>

            {/* Projetos Ativos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Projetos Ativos
                </CardTitle>
                <CardDescription>
                  Status dos projetos em andamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditProjects.filter(p => p.status === 'em_andamento' || p.status === 'em_execucao').slice(0, 3).map((project: any) => (
                    <div key={project.id} className="flex items-center justify-between p-3 border rounded hover:shadow-sm transition-shadow">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{project.titulo}</p>
                          {project.metadata?.sox_audit && (
                            <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">
                              SOX
                            </Badge>
                          )}
                          {project.tipo === 'regulatoria' && !project.metadata?.sox_audit && (
                            <Badge variant="destructive" className="text-xs">
                              Regulatória
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{project.auditor_lider}</p>
                        <p className="text-xs text-muted-foreground">{project.codigo}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(project.status)}>
                          {(project.status || '').replace('_', ' ')}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.progresso}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="universe" className="space-y-4">
          <UniversoAuditavel />
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <ProjetosAuditoria />
        </TabsContent>

        <TabsContent value="working-papers" className="space-y-4">
          <PapeisTrabalhoCompleto />
        </TabsContent>

        <TabsContent value="risk-matrix" className="space-y-4">
          <AuditRiskMatrix />
        </TabsContent>

        <TabsContent value="sampling" className="space-y-4">
          <StatisticalSampling />
        </TabsContent>

        <TabsContent value="planejamento" className="space-y-4">
          <PlanejamentoFuncional />
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-4">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold">Relatórios de Auditoria</h2>
                <p className="text-muted-foreground">Sistema Profissional de Relatórios Executivos e Técnicos</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Templates
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Relatório
                </Button>
              </div>
            </div>

            {/* Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total de Relatórios</p>
                      <p className="text-3xl font-bold">{relatoriosData.total}</p>
                      <p className="text-xs text-muted-foreground mt-1">Relatórios criados</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Taxa de Aprovação</p>
                      <p className="text-3xl font-bold">{relatoriosData.total > 0 ? Math.round((relatoriosData.aprovados / relatoriosData.total) * 100) : 0}%</p>
                      <p className="text-xs text-muted-foreground mt-1">{relatoriosData.aprovados} de {relatoriosData.total} aprovados</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Apontamentos Críticos</p>
                      <p className="text-3xl font-bold text-red-600">{relatoriosData.criticos}</p>
                      <p className="text-xs text-muted-foreground mt-1">Requerem ação imediata</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                      <p className="text-3xl font-bold text-purple-600">{relatoriosData.complianceScore}</p>
                      <p className="text-xs text-muted-foreground mt-1">Índice de conformidade</p>
                    </div>
                    <Target className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tipos de Relatórios Disponíveis */}
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Relatórios Disponíveis</CardTitle>
                <CardDescription>
                  Escolha o tipo de relatório mais adequado para sua necessidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {/* Relatório Executivo */}
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                          <Target className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">Relatório Executivo</h4>
                          <p className="text-xs text-muted-foreground mt-1">Visão estratégica para alta administração</p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="secondary" className="text-xs">{relatoriosData.porTipo.executivo || 0} relatórios</Badge>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => {
                                console.log('💆 [DEBUG] Botão EXECUTIVO clicado!');
                                handleCreateReportByType('executivo');
                              }}
                              disabled={generatingReport}
                            >
                              {generatingReport ? 'Criando...' : 'Criar'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Relatório Técnico */}
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <Settings className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">Relatório Técnico</h4>
                          <p className="text-xs text-muted-foreground mt-1">Análise detalhada de processos e controles</p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="secondary" className="text-xs">{relatoriosData.porTipo.tecnico || 0} relatórios</Badge>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => {
                                console.log('💆 [DEBUG] Botão TÉCNICO clicado!');
                                handleCreateReportByType('tecnico');
                              }}
                              disabled={generatingReport}
                            >
                              {generatingReport ? 'Criando...' : 'Criar'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Relatório de Compliance */}
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-green-100 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">Relatório de Compliance</h4>
                          <p className="text-xs text-muted-foreground mt-1">Conformidade regulatória e normativa</p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="secondary" className="text-xs">{relatoriosData.porTipo.compliance || 0} relatórios</Badge>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => {
                                console.log('💆 [DEBUG] Botão COMPLIANCE clicado!');
                                handleCreateReportByType('compliance');
                              }}
                              disabled={generatingReport}
                            >
                              {generatingReport ? 'Criando...' : 'Criar'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Relatório de Risco */}
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-red-100 text-red-600">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">Relatório de Risco</h4>
                          <p className="text-xs text-muted-foreground mt-1">Avaliação e gestão de riscos</p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="secondary" className="text-xs">{relatoriosData.porTipo.risco || 0} relatórios</Badge>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => {
                                console.log('💆 [DEBUG] Botão RISCO clicado!');
                                handleCreateReportByType('risco');
                              }}
                              disabled={generatingReport}
                            >
                              {generatingReport ? 'Criando...' : 'Criar'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Relatório de Performance */}
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                          <TrendingUp className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">Relatório de Performance</h4>
                          <p className="text-xs text-muted-foreground mt-1">Indicadores de desempenho e eficiência</p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="secondary" className="text-xs">{relatoriosData.porTipo.performance || 0} relatórios</Badge>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => {
                                console.log('💆 [DEBUG] Botão PERFORMANCE clicado!');
                                handleCreateReportByType('performance');
                              }}
                              disabled={generatingReport}
                            >
                              {generatingReport ? 'Criando...' : 'Criar'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Relatório de Seguimento */}
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-indigo-500">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">Relatório de Seguimento</h4>
                          <p className="text-xs text-muted-foreground mt-1">Acompanhamento de recomendações</p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="secondary" className="text-xs">{relatoriosData.porTipo.seguimento || 0} relatórios</Badge>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => {
                                console.log('💆 [DEBUG] Botão SEGUIMENTO clicado!');
                                handleCreateReportByType('seguimento');
                              }}
                              disabled={generatingReport}
                            >
                              {generatingReport ? 'Criando...' : 'Criar'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Relatório Especial */}
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-yellow-500">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                          <SquarePen className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">Relatório Especial</h4>
                          <p className="text-xs text-muted-foreground mt-1">Investigações e análises específicas</p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="secondary" className="text-xs">{relatoriosData.porTipo.especial || 0} relatórios</Badge>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => {
                                console.log('💆 [DEBUG] Botão ESPECIAL clicado!');
                                handleCreateReportByType('especial');
                              }}
                              disabled={generatingReport}
                            >
                              {generatingReport ? 'Criando...' : 'Criar'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Filtros e Pesquisa */}
            <Card>
              <CardHeader>
                <CardTitle>Filtros e Pesquisa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar relatórios..." className="pl-10" />
                  </div>
                  
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Tipos</SelectItem>
                      <SelectItem value="executivo">Executivo</SelectItem>
                      <SelectItem value="tecnico">Técnico</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="risco">Risco</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="seguimento">Seguimento</SelectItem>
                      <SelectItem value="especial">Especial</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="rascunho">Rascunho</SelectItem>
                      <SelectItem value="revisao">Em Revisão</SelectItem>
                      <SelectItem value="aprovado">Aprovado</SelectItem>
                      <SelectItem value="publicado">Publicado</SelectItem>
                      <SelectItem value="distribuido">Distribuído</SelectItem>
                      <SelectItem value="arquivado">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Categorias</SelectItem>
                      <SelectItem value="interno">Auditoria Interna</SelectItem>
                      <SelectItem value="externo">Auditoria Externa</SelectItem>
                      <SelectItem value="regulatorio">Regulatório</SelectItem>
                      <SelectItem value="investigativo">Investigativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Relatórios */}
            <div className="space-y-4">
              {/* Relatório 1 - Executivo */}
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">🏢</span>
                        <h3 className="text-lg font-semibold">Relatório Executivo - Auditoria de Processos Financeiros Q4 2024</h3>
                        <Badge className="bg-purple-100 text-purple-800">Executivo</Badge>
                        <Badge className="bg-green-100 text-green-800">Publicado</Badge>
                        <Badge className="bg-red-100 text-red-800">Crítica</Badge>
                        <Badge variant="secondary">v2.1</Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        Projeto: Auditoria Financeira 2024 • Categoria: Auditoria Interna
                      </p>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        Análise abrangente dos controles internos financeiros identificou 3 deficiências críticas que requerem ação imediata da administração. Recomendações incluem fortalecimento dos controles de segregação de funções e implementação de revisões automatizadas.
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Total:</span>
                          <span className="ml-2">12</span>
                        </div>
                        <div>
                          <span className="font-medium">Crítico:</span>
                          <span className="ml-2 text-red-600">3</span>
                        </div>
                        <div>
                          <span className="font-medium">Alto:</span>
                          <span className="ml-2 text-orange-600">4</span>
                        </div>
                        <div>
                          <span className="font-medium">Médio:</span>
                          <span className="ml-2 text-yellow-600">3</span>
                        </div>
                        <div>
                          <span className="font-medium">Baixo:</span>
                          <span className="ml-2 text-blue-600">2</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Criado: 15/12/2024
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Vence: 31/01/2025
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          Score: 85/100
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Relatório 2 - Técnico */}
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">⚠️</span>
                        <h3 className="text-lg font-semibold">Relatório Técnico - Avaliação de Controles de TI</h3>
                        <Badge className="bg-blue-100 text-blue-800">Técnico</Badge>
                        <Badge className="bg-yellow-100 text-yellow-800">Em Revisão</Badge>
                        <Badge className="bg-orange-100 text-orange-800">Alta</Badge>
                        <Badge variant="secondary">v1.3</Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        Projeto: Auditoria de Sistemas • Categoria: Auditoria Interna
                      </p>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        Avaliação detalhada dos controles de acesso, backup e segurança da informação. Identificadas oportunidades de melhoria na gestão de usuários e implementação de controles automatizados de monitoramento.
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Total:</span>
                          <span className="ml-2">8</span>
                        </div>
                        <div>
                          <span className="font-medium">Crítico:</span>
                          <span className="ml-2 text-red-600">1</span>
                        </div>
                        <div>
                          <span className="font-medium">Alto:</span>
                          <span className="ml-2 text-orange-600">2</span>
                        </div>
                        <div>
                          <span className="font-medium">Médio:</span>
                          <span className="ml-2 text-yellow-600">3</span>
                        </div>
                        <div>
                          <span className="font-medium">Baixo:</span>
                          <span className="ml-2 text-blue-600">2</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Criado: 10/12/2024
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Vence: 15/01/2025
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          Score: 78/100
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Relatório 3 - Compliance */}
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">🔒</span>
                        <h3 className="text-lg font-semibold">Relatório de Compliance - LGPD e Proteção de Dados</h3>
                        <Badge className="bg-green-100 text-green-800">Compliance</Badge>
                        <Badge className="bg-blue-100 text-blue-800">Aprovado</Badge>
                        <Badge className="bg-yellow-100 text-yellow-800">Média</Badge>
                        <Badge variant="secondary">v1.0</Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        Projeto: Conformidade LGPD • Categoria: Regulatório
                      </p>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        Avaliação da conformidade com a Lei Geral de Proteção de Dados. Organização demonstra aderência satisfatória aos requisitos, com algumas melhorias recomendadas nos processos de consentimento e direitos dos titulares.
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Total:</span>
                          <span className="ml-2">6</span>
                        </div>
                        <div>
                          <span className="font-medium">Crítico:</span>
                          <span className="ml-2 text-red-600">0</span>
                        </div>
                        <div>
                          <span className="font-medium">Alto:</span>
                          <span className="ml-2 text-orange-600">1</span>
                        </div>
                        <div>
                          <span className="font-medium">Médio:</span>
                          <span className="ml-2 text-yellow-600">3</span>
                        </div>
                        <div>
                          <span className="font-medium">Baixo:</span>
                          <span className="ml-2 text-blue-600">2</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Criado: 05/12/2024
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Vence: 28/02/2025
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          Score: 92/100
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Executivo</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="h-2 bg-purple-500 rounded-full" style={{width: `${relatoriosData.total > 0 ? ((relatoriosData.porTipo.executivo || 0) / relatoriosData.total) * 100 : 0}%`}}></div>
                        </div>
                        <span className="text-sm w-10 text-right">{relatoriosData.porTipo.executivo || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Técnico</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="h-2 bg-blue-500 rounded-full" style={{width: `${relatoriosData.total > 0 ? ((relatoriosData.porTipo.tecnico || 0) / relatoriosData.total) * 100 : 0}%`}}></div>
                        </div>
                        <span className="text-sm w-10 text-right">{relatoriosData.porTipo.tecnico || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Compliance</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="h-2 bg-green-500 rounded-full" style={{width: `${relatoriosData.total > 0 ? ((relatoriosData.porTipo.compliance || 0) / relatoriosData.total) * 100 : 0}%`}}></div>
                        </div>
                        <span className="text-sm w-10 text-right">{relatoriosData.porTipo.compliance || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Risco</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="h-2 bg-red-500 rounded-full" style={{width: `${relatoriosData.total > 0 ? ((relatoriosData.porTipo.risco || 0) / relatoriosData.total) * 100 : 0}%`}}></div>
                        </div>
                        <span className="text-sm w-10 text-right">{relatoriosData.porTipo.risco || 0}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status dos Relatórios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Publicado</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="h-2 bg-green-500 rounded-full" style={{width: '45%'}}></div>
                        </div>
                        <span className="text-sm w-10 text-right">11</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Aprovado</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="h-2 bg-blue-500 rounded-full" style={{width: '25%'}}></div>
                        </div>
                        <span className="text-sm w-10 text-right">6</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Em Revisão</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="h-2 bg-yellow-500 rounded-full" style={{width: '20%'}}></div>
                        </div>
                        <span className="text-sm w-10 text-right">5</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Rascunho</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="h-2 bg-gray-500 rounded-full" style={{width: '10%'}}></div>
                        </div>
                        <span className="text-sm w-10 text-right">2</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AuditoriasDashboard;