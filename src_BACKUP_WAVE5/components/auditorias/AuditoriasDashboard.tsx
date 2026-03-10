import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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

import { AuditDashboardNew } from './AuditDashboardNew';

export function AuditoriasDashboard() {
  // Usar o novo dashboard integrado
  return <AuditDashboardNew />;
}

// Manter o componente antigo como backup
export function AuditoriasDashboardOld() {
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
      case 'em_execucao': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'agendado': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'pendente': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'planejado': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'iniciado': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      case 'aprovado': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'suspenso': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'cancelado': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
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





  // Função para criar relatório de projeto específico
  const handleCreateProjectReport = async (projeto) => {
    console.log('🔥 [DEBUG] === GERANDO RELATÓRIO DE PROJETO ===');
    console.log('🔥 [DEBUG] Projeto selecionado:', projeto);
    
    const currentEffectiveTenantId = getEffectiveTenantId();
    
    if (!currentEffectiveTenantId) {
      const errorMsg = user?.isPlatformAdmin 
        ? 'Selecione uma organização no seletor de tenant no canto superior direito.'
        : 'Erro: Tenant não identificado. Verifique se você está associado a uma organização.';
      
      toast.error(errorMsg);
      return;
    }

    setGeneratingReport(true);
    
    try {
      toast.loading('Gerando relatório do projeto...', { id: 'project-report-generation' });
      
      // Carregar dados específicos do projeto
      const { data: projetoDetalhado, error: projetoError } = await supabase
        .from('projetos_auditoria')
        .select(`
          *,
          trabalhos_auditoria(*),
          apontamentos_auditoria(*),
          planos_acao(*)
        `)
        .eq('id', projeto.id)
        .eq('tenant_id', currentEffectiveTenantId)
        .single();
      
      if (projetoError) {
        throw projetoError;
      }
      
      // Gerar relatório HTML estilo vulnerabilidades
      const reportContent = generateProjectReportHTML(projeto, projetoDetalhado);
      
      const blob = new Blob([reportContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const newWindow = window.open(url, '_blank');
      if (newWindow) {
        newWindow.document.title = `Relatório do Projeto ${projeto.codigo} - ${new Date().toLocaleDateString('pt-BR')}`;
        
        setTimeout(() => {
          const printButton = newWindow.document.createElement('button');
          printButton.innerHTML = '🖨️ Imprimir/Salvar como PDF';
          printButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            padding: 12px 20px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            font-family: system-ui;
          `;
          printButton.onclick = () => newWindow.print();
          newWindow.document.body.appendChild(printButton);
        }, 1000);
      }
      
      toast.success('Relatório do projeto gerado com sucesso!', {
        id: 'project-report-generation',
        description: `Use Ctrl+P para salvar como PDF. Projeto: ${projeto.titulo}`
      });
      
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      
    } catch (error) {
      console.error('❌ [DEBUG] Erro ao gerar relatório do projeto:', error);
      toast.error('Erro ao gerar relatório do projeto', { id: 'project-report-generation' });
      secureLog('error', 'Erro ao gerar relatório do projeto', {
        projetoId: projeto.id,
        error: error
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  // Função para gerar HTML do relatório do projeto
  const generateProjectReportHTML = (projeto, projetoDetalhado) => {
    const timestamp = new Date().toLocaleString('pt-BR');
    const totalApontamentos = projetoDetalhado?.apontamentos_auditoria?.length || 0;
    const apontamentosCriticos = projetoDetalhado?.apontamentos_auditoria?.filter(a => a.criticidade === 'critica').length || 0;
    const apontamentosAltos = projetoDetalhado?.apontamentos_auditoria?.filter(a => a.criticidade === 'alta').length || 0;
    const apontamentosMedios = projetoDetalhado?.apontamentos_auditoria?.filter(a => a.criticidade === 'media').length || 0;
    const apontamentosBaixos = projetoDetalhado?.apontamentos_auditoria?.filter(a => a.criticidade === 'baixa').length || 0;
    const totalTrabalhos = projetoDetalhado?.trabalhos_auditoria?.length || 0;
    const planosAcao = projetoDetalhado?.planos_acao?.length || 0;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório Executivo - ${projeto.titulo}</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
          .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 4px solid #3b82f6; padding-bottom: 30px; margin-bottom: 40px; }
          .title { font-size: 32px; font-weight: bold; color: #1e293b; margin-bottom: 10px; }
          .subtitle { font-size: 16px; color: #64748b; margin-bottom: 5px; }
          .metrics-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; margin: 40px 0; }
          .metric-card { background: white; padding: 16px; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid #3b82f6; }
          .metric-value { font-size: 24px; font-weight: bold; margin-bottom: 6px; }
          .metric-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; font-weight: 600; }
          .critical { color: #dc2626; border-left-color: #dc2626; }
          .high { color: #ea580c; border-left-color: #ea580c; }
          .success { color: #059669; border-left-color: #059669; }
          .warning { color: #d97706; border-left-color: #d97706; }
          .section { margin: 50px 0; }
          .section-title { font-size: 24px; font-weight: bold; color: #1e293b; margin-bottom: 20px; border-bottom: 3px solid #e2e8f0; padding-bottom: 12px; }
          .executive-summary { background: #fafafa; padding: 30px; border-radius: 12px; margin: 30px 0; border: 2px solid #e2e8f0; }
          table { width: 100%; border-collapse: collapse; margin: 25px 0; }
          th, td { padding: 16px; text-align: left; border-bottom: 2px solid #e2e8f0; }
          th { background: #f8fafc; font-weight: 700; color: #374151; }
          .risk-alto { background: #fef2f2; color: #dc2626; font-weight: bold; }
          .risk-medio { background: #fff7ed; color: #ea580c; font-weight: bold; }
          .risk-baixo { background: #f0fdf4; color: #059669; font-weight: bold; }
          .progress-bar { width: 100%; background: #e5e7eb; border-radius: 6px; height: 8px; margin: 10px 0; }
          .progress-fill { background: linear-gradient(90deg, #3b82f6, #1d4ed8); height: 8px; border-radius: 6px; transition: width 0.3s ease; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">📈 Relatório Executivo de Projeto de Auditoria</h1>
            <p class="subtitle"><strong>${projeto.titulo}</strong></p>
            <p class="subtitle">Código: ${projeto.codigo || 'N/A'} | Status: ${projeto.status?.toUpperCase() || 'N/A'}</p>
            <p class="subtitle">Gerado em: ${timestamp}</p>
            <p class="subtitle">Confidencial - Uso Interno</p>
          </div>
          
          <div class="executive-summary">
            <h2 style="margin-top: 0; color: #3b82f6;">📊 Executive Summary - Visão Geral do Projeto</h2>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 25px 0;">
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 20px; border-radius: 12px; border-left: 6px solid #0ea5e9; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">🎯</div>
                <div style="font-size: 24px; font-weight: bold; color: #0ea5e9; margin-bottom: 5px;">PROJETO</div>
                <div style="font-size: 18px; font-weight: bold; color: #0ea5e9;">${projeto.progresso || 0}%</div>
                <div style="font-size: 14px; color: #0ea5e9;">Progresso de execução</div>
              </div>
              
              <div style="background: linear-gradient(135deg, ${apontamentosCriticos > 0 ? '#fef2f2 0%, #fee2e2 100%' : '#f0fdf4 0%, #dcfce7 100%'}); padding: 20px; border-radius: 12px; border-left: 6px solid ${apontamentosCriticos > 0 ? '#dc2626' : '#059669'}; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">${apontamentosCriticos > 0 ? '🚨' : '✅'}</div>
                <div style="font-size: 24px; font-weight: bold; color: ${apontamentosCriticos > 0 ? '#dc2626' : '#059669'}; margin-bottom: 5px;">ACHADOS</div>
                <div style="font-size: 18px; font-weight: bold; color: ${apontamentosCriticos > 0 ? '#dc2626' : '#059669'};">${totalApontamentos}</div>
                <div style="font-size: 14px; color: ${apontamentosCriticos > 0 ? '#dc2626' : '#059669'};">Total identificados</div>
              </div>
              
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 20px; border-radius: 12px; border-left: 6px solid #3b82f6; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">📝</div>
                <div style="font-size: 24px; font-weight: bold; color: #3b82f6; margin-bottom: 5px;">AÇÕES</div>
                <div style="font-size: 18px; font-weight: bold; color: #3b82f6;">${planosAcao}</div>
                <div style="font-size: 14px; color: #3b82f6;">Planos de ação</div>
              </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 25px; border-radius: 12px; border-left: 6px solid #64748b; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">📄 Resumo Executivo</h3>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
                O projeto de auditoria "<strong>${projeto.titulo}</strong>" foi executado sob a liderança de ${projeto.auditor_lider || 'auditor não definido'}, 
                encontrando-se atualmente ${projeto.progresso >= 100 ? 'concluído' : `${projeto.progresso}% concluído`}.
              </p>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
                <strong>Resultados dos Trabalhos:</strong> Durante a execução foram identificados ${totalApontamentos} apontamentos, 
                sendo ${apontamentosCriticos} críticos, ${apontamentosAltos} altos, ${apontamentosMedios} médios e ${apontamentosBaixos} baixos.
              </p>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 0;">
                <strong>Planos de Ação:</strong> ${planosAcao > 0 ? `Foram elaborados ${planosAcao} planos de ação para endereçar as deficiências identificadas.` : 'Não foram necessários planos de ação adicionais.'}
              </p>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">📈 Indicadores do Projeto</h2>
            
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-value">${totalApontamentos}</div>
                <div class="metric-label">Total de Apontamentos</div>
              </div>
              <div class="metric-card critical">
                <div class="metric-value">${apontamentosCriticos}</div>
                <div class="metric-label">Apontamentos Críticos</div>
              </div>
              <div class="metric-card high">
                <div class="metric-value">${apontamentosAltos}</div>
                <div class="metric-label">Apontamentos Altos</div>
              </div>
              <div class="metric-card warning">
                <div class="metric-value">${apontamentosMedios}</div>
                <div class="metric-label">Apontamentos Médios</div>
              </div>
              <div class="metric-card success">
                <div class="metric-value">${totalTrabalhos}</div>
                <div class="metric-label">Trabalhos Executados</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${planosAcao}</div>
                <div class="metric-label">Planos de Ação</div>
              </div>
            </div>
          </div>
          
          ${totalApontamentos > 0 ? `
          <div class="section">
            <h2 class="section-title">🚨 Principais Apontamentos</h2>
            
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Criticidade</th>
                  <th>Descrição</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${projetoDetalhado?.apontamentos_auditoria?.sort((a, b) => {
                  const ordem = { 'critica': 4, 'alta': 3, 'media': 2, 'baixa': 1 };
                  return (ordem[b.criticidade] || 0) - (ordem[a.criticidade] || 0);
                }).slice(0, 10).map(apontamento => `
                  <tr>
                    <td><strong>${apontamento.titulo || 'Sem título'}</strong></td>
                    <td>
                      <span class="${apontamento.criticidade === 'critica' ? 'risk-alto' : apontamento.criticidade === 'alta' ? 'risk-medio' : 'risk-baixo'}" style="padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                        ${(apontamento.criticidade || 'baixa').toUpperCase()}
                      </span>
                    </td>
                    <td>${apontamento.descricao ? (apontamento.descricao.length > 100 ? apontamento.descricao.substring(0, 100) + '...' : apontamento.descricao) : 'Sem descrição'}</td>
                    <td>${apontamento.status || 'Pendente'}</td>
                  </tr>
                `).join('') || '<tr><td colspan="4" style="text-align: center; color: #64748b;">Nenhum apontamento disponível</td></tr>'}
              </tbody>
            </table>
          </div>
          ` : ''}
          
          ${planosAcao > 0 ? `
          <div class="section">
            <h2 class="section-title">📝 Planos de Ação</h2>
            
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Prioridade</th>
                  <th>Responsável</th>
                  <th>Prazo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${projetoDetalhado?.planos_acao?.slice(0, 10).map(plano => `
                  <tr>
                    <td><strong>${plano.titulo || 'Sem título'}</strong></td>
                    <td>
                      <span class="${plano.prioridade === 'alta' ? 'risk-alto' : plano.prioridade === 'media' ? 'risk-medio' : 'risk-baixo'}" style="padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                        ${(plano.prioridade || 'baixa').toUpperCase()}
                      </span>
                    </td>
                    <td>${plano.responsavel || 'Não definido'}</td>
                    <td>${plano.prazo_implementacao ? new Date(plano.prazo_implementacao).toLocaleDateString('pt-BR') : 'N/A'}</td>
                    <td>${plano.status || 'Pendente'}</td>
                  </tr>
                `).join('') || '<tr><td colspan="5" style="text-align: center; color: #64748b;">Nenhum plano de ação disponível</td></tr>'}
              </tbody>
            </table>
          </div>
          ` : ''}
          
          <div class="section">
            <h2 class="section-title">🎯 Conclusões e Recomendações</h2>
            
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 25px; border-radius: 12px; border-left: 6px solid #059669; margin: 20px 0;">
              <h3 style="color: #059669; margin-top: 0;">📄 Conclusão Geral</h3>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
                Com base nos trabalhos executados no projeto "<strong>${projeto.titulo}</strong>", concluímos que:
              </p>
              <ul style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
                <li>${totalApontamentos > 0 ? `Foram identificadas ${totalApontamentos} oportunidades de melhoria nos controles avaliados` : 'Os controles avaliados estão adequados e funcionando conforme esperado'}</li>
                <li>${apontamentosCriticos > 0 ? `${apontamentosCriticos} apontamentos são de criticidade alta e requerem ação imediata` : 'Não foram identificadas deficiências críticas nos controles'}</li>
                <li>O projeto encontra-se ${projeto.progresso >= 100 ? 'concluído com sucesso' : `${projeto.progresso}% concluído e em andamento`}</li>
                <li>${planosAcao > 0 ? `${planosAcao} planos de ação foram elaborados para endereçar as deficiências` : 'Não foram necessários planos de ação adicionais'}</li>
              </ul>
            </div>
            
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 12px; border-left: 6px solid #d97706; margin: 20px 0;">
              <h3 style="color: #92400e; margin-top: 0;">📝 Recomendações Principais</h3>
              <ol style="font-size: 16px; line-height: 1.6; margin-bottom: 0;">
                ${apontamentosCriticos > 0 ? '<li><strong>Prioridade Alta:</strong> Implementar imediatamente as ações corretivas para os apontamentos críticos identificados</li>' : ''}
                <li><strong>Monitoramento:</strong> Estabelecer acompanhamento periódico da implementação das melhorias propostas</li>
                <li><strong>Capacitação:</strong> Promover treinamento das equipes sobre os controles e procedimentos atualizados</li>
                <li><strong>Follow-up:</strong> Agendar auditoria de seguimento em ${apontamentosCriticos > 0 ? '6 meses' : '12 meses'} para verificar a efetividade das ações implementadas</li>
              </ol>
            </div>
          </div>
          
          <div style="margin-top: 50px; padding-top: 30px; border-top: 3px solid #e2e8f0; text-align: center; color: #64748b;">
            <p><strong>Relatório gerado automaticamente pelo Sistema GRC</strong></p>
            <p>Auditor Líder: ${projeto.auditor_lider || 'Não definido'} | Data: ${timestamp}</p>
            <p>Documento confidencial - Distribuição restrita</p>
          </div>
        </div>
      </body>
      </html>
    `;
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
      
      // Gerar PDF automaticamente - VERSÃO PROFISSIONAL PARA RELATÓRIO EXECUTIVO
      console.log('📄 [DEBUG] === INICIANDO GERAÇÃO DE PDF PROFISSIONAL ===');
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
          .limit(15);
        
        const { data: apontamentosData } = await supabase
          .from('apontamentos_auditoria')
          .select('*')
          .eq('tenant_id', currentEffectiveTenantId)
          .order('created_at', { ascending: false })
          .limit(30);
        
        const { data: projetosData } = await supabase
          .from('projetos_auditoria')
          .select('*')
          .eq('tenant_id', currentEffectiveTenantId)
          .order('created_at', { ascending: false })
          .limit(15);
        
        const { data: planosAcaoData } = await supabase
          .from('planos_acao')
          .select('*')
          .eq('tenant_id', currentEffectiveTenantId)
          .order('created_at', { ascending: false })
          .limit(20);
        
        console.log('📄 [DEBUG] Dados carregados:', {
          relatorios: dadosReais?.length || 0,
          apontamentos: apontamentosData?.length || 0,
          projetos: projetosData?.length || 0,
          planosAcao: planosAcaoData?.length || 0
        });
        
        // Importar jsPDF dinamicamente para gerar PDF do relatório
        const { default: jsPDF } = await import('jspdf');
        const doc = new jsPDF('p', 'mm', 'a4');
        
        console.log('📄 [DEBUG] Configurando layout PROFISSIONAL do PDF...');
        
        // Configurações do documento PROFISSIONAIS
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margins = { top: 25, left: 20, right: 20, bottom: 25 };
        let currentY = margins.top;
        
        // Calcular estatísticas dos dados reais
        const totalRelatorios = dadosReais?.length || 0;
        const totalApontamentos = apontamentosData?.length || 0;
        const apontamentosCriticos = apontamentosData?.filter(a => a.criticidade === 'critica').length || 0;
        const apontamentosAltos = apontamentosData?.filter(a => a.criticidade === 'alta').length || 0;
        const apontamentosMedios = apontamentosData?.filter(a => a.criticidade === 'media').length || 0;
        const apontamentosBaixos = apontamentosData?.filter(a => a.criticidade === 'baixa').length || 0;
        
        const projetosAtivos = projetosData?.filter(p => 
          ['em_andamento', 'em_execucao', 'iniciado', 'aprovado'].includes(p.status)
        ).length || 0;
        const projetosConcluidos = projetosData?.filter(p => p.status === 'concluido').length || 0;
        
        const planosAcaoAbertos = planosAcaoData?.filter(p => 
          ['pendente', 'em_andamento'].includes(p.status)
        ).length || 0;
        const planosAcaoImplementados = planosAcaoData?.filter(p => p.status === 'implementado').length || 0;
        
        // Calcular scores de compliance e eficiência
        const complianceScore = totalApontamentos > 0 
          ? Math.round(((totalApontamentos - apontamentosCriticos - apontamentosAltos) / totalApontamentos) * 100)
          : 95;
        const eficienciaScore = projetosData?.length > 0
          ? Math.round((projetosConcluidos / projetosData.length) * 100)
          : 85;
        
        console.log('📄 [DEBUG] Estatísticas calculadas:', {
          totalRelatorios, totalApontamentos, apontamentosCriticos, apontamentosAltos,
          projetosAtivos, projetosConcluidos, planosAcaoAbertos, complianceScore, eficienciaScore
        });
        
        // Função para adicionar nova página se necessário
        const checkPageBreak = (requiredSpace) => {
          if (currentY + requiredSpace > pageHeight - margins.bottom) {
            doc.addPage();
            addHeader();
            return true;
          }
          return false;
        };
        
        // Função para adicionar cabeçalho PROFISSIONAL
        const addHeader = () => {
          currentY = margins.top;
          
          // Faixa superior corporativa
          doc.setFillColor(25, 47, 89); // Azul corporativo escuro
          doc.rect(0, 0, pageWidth, 12, 'F');
          
          // Logo/Título da empresa PROFISSIONAL
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(255, 255, 255);
          doc.text('AUDITORIA INTERNA', margins.left, 8);
          
          // Subtítulo corporativo
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text('DEPARTAMENTO DE AUDITORIA INTERNA E COMPLIANCE', margins.left, 20);
          
          // Data e hora no canto direito
          const agora = new Date();
          const dataHora = `${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
          doc.setTextColor(100, 100, 100);
          doc.setFontSize(8);
          doc.text(dataHora, pageWidth - margins.right - 35, 20);
          
          // Linha separadora elegante
          doc.setDrawColor(25, 47, 89);
          doc.setLineWidth(0.8);
          doc.line(margins.left, 25, pageWidth - margins.right, 25);
          
          // Linha secundária mais fina
          doc.setDrawColor(180, 180, 180);
          doc.setLineWidth(0.3);
          doc.line(margins.left, 27, pageWidth - margins.right, 27);
          
          currentY = 35;
        };
        
        // Função para adicionar rodapé PROFISSIONAL
        const addFooter = (pageNum, totalPages) => {
          // Linha superior do rodapé
          doc.setDrawColor(180, 180, 180);
          doc.setLineWidth(0.3);
          doc.line(margins.left, pageHeight - 20, pageWidth - margins.right, pageHeight - 20);
          
          // Informações do rodapé
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          
          // Classificação de confidencialidade
          doc.setFont('helvetica', 'bold');
          doc.text('CONFIDENCIAL - USO RESTRITO', margins.left, pageHeight - 15);
          
          // Numeração de páginas
          doc.setFont('helvetica', 'normal');
          doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - margins.right - 25, pageHeight - 15);
          
          // Data de geração
          doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2 - 20, pageHeight - 15);
          
          // Assinatura digital (simulada)
          doc.setFontSize(7);
          doc.setTextColor(120, 120, 120);
          doc.text('Documento gerado eletronicamente - Válido sem assinatura física', margins.left, pageHeight - 10);
        };
        
        // ===== PÁGINA 1: CAPA E RESUMO EXECUTIVO =====
        addHeader();
        
        // TÍTULO PRINCIPAL PROFISSIONAL
        checkPageBreak(30);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(25, 47, 89);
        const titleLines = doc.splitTextToSize(relatorio.titulo, pageWidth - margins.left - margins.right);
        titleLines.forEach((line, index) => {
          doc.text(line, margins.left, currentY + (index * 8));
        });
        currentY += titleLines.length * 8 + 15;
        
        // CAIXA DE INFORMAÇÕES EXECUTIVAS
        checkPageBreak(40);
        doc.setFillColor(245, 248, 252); // Fundo azul muito claro
        doc.setDrawColor(25, 47, 89);
        doc.setLineWidth(0.5);
        doc.rect(margins.left, currentY, pageWidth - margins.left - margins.right, 35, 'FD');
        
        // Informações básicas do relatório
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(25, 47, 89);
        doc.text('INFORMAÇÕES DO RELATÓRIO', margins.left + 5, currentY + 8);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        
        const infoItems = [
          `Código: ${relatorio.id.substring(0, 8).toUpperCase()}`,
          `Tipo: ${reportInfo.name}`,
          `Status: ${relatorio.status.toUpperCase()}`,
          `Autor: ${user?.email || 'Sistema'}`,
          `Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`,
          `Classificação: CONFIDENCIAL`,
          `Versão: 1.0`
        ];
        
        const col1Items = infoItems.slice(0, 4);
        const col2Items = infoItems.slice(4);
        
        col1Items.forEach((item, index) => {
          doc.text(`• ${item}`, margins.left + 8, currentY + 15 + (index * 4));
        });
        
        col2Items.forEach((item, index) => {
          doc.text(`• ${item}`, margins.left + 100, currentY + 15 + (index * 4));
        });
        
        currentY += 45;
        
        // RESUMO EXECUTIVO PROFISSIONAL
        checkPageBreak(30);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(25, 47, 89);
        doc.text('RESUMO EXECUTIVO', margins.left, currentY);
        currentY += 10;
        
        // Linha decorativa sob o título
        doc.setDrawColor(25, 47, 89);
        doc.setLineWidth(1);
        doc.line(margins.left, currentY - 5, margins.left + 50, currentY - 5);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        
        const resumoExecutivo = tipo === 'executivo' 
          ? `Este relatório executivo apresenta uma análise abrangente dos controles internos e processos de governança da organização. Durante o período analisado, foram identificados ${totalApontamentos} pontos de atenção, sendo ${apontamentosCriticos} de criticidade alta que requerem ação imediata da administração. O índice de compliance atual é de ${complianceScore}%, demonstrando um ambiente de controle adequado com oportunidades de melhoria específicas. As recomendações apresentadas visam fortalecer a estrutura de governança e mitigar os riscos identificados.`
          : relatorio.resumo_executivo;
        
        const resumoLines = doc.splitTextToSize(resumoExecutivo, pageWidth - margins.left - margins.right);
        resumoLines.forEach((line) => {
          checkPageBreak(5);
          doc.text(line, margins.left, currentY);
          currentY += 5;
        });
        currentY += 15;
        
        // PRINCIPAIS INDICADORES - DASHBOARD EXECUTIVO
        checkPageBreak(50);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(25, 47, 89);
        doc.text('PRINCIPAIS INDICADORES', margins.left, currentY);
        currentY += 10;
        
        // Linha decorativa
        doc.setDrawColor(25, 47, 89);
        doc.setLineWidth(1);
        doc.line(margins.left, currentY - 5, margins.left + 60, currentY - 5);
        
        // Grid de indicadores profissionais
        const indicadores = [
          { label: 'Total de Apontamentos', valor: totalApontamentos.toString(), cor: [52, 152, 219] },
          { label: 'Apontamentos Críticos', valor: apontamentosCriticos.toString(), cor: [231, 76, 60] },
          { label: 'Compliance Score', valor: `${complianceScore}%`, cor: [46, 204, 113] },
          { label: 'Eficiência Score', valor: `${eficienciaScore}%`, cor: [155, 89, 182] },
          { label: 'Projetos Ativos', valor: projetosAtivos.toString(), cor: [241, 196, 15] },
          { label: 'Planos de Ação Abertos', valor: planosAcaoAbertos.toString(), cor: [230, 126, 34] }
        ];
        
        // Desenhar caixas de indicadores
        indicadores.forEach((indicador, index) => {
          const col = index % 3;
          const row = Math.floor(index / 3);
          const x = margins.left + (col * 55);
          const y = currentY + (row * 25);
          
          // Caixa do indicador
          doc.setFillColor(250, 250, 250);
          doc.setDrawColor(...indicador.cor);
          doc.setLineWidth(0.8);
          doc.rect(x, y, 50, 20, 'FD');
          
          // Valor do indicador
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...indicador.cor);
          doc.text(indicador.valor, x + 25, y + 8, { align: 'center' });
          
          // Label do indicador
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(80, 80, 80);
          const labelLines = doc.splitTextToSize(indicador.label, 48);
          labelLines.forEach((line, lineIndex) => {
            doc.text(line, x + 25, y + 13 + (lineIndex * 3), { align: 'center' });
          });
        });
        
        currentY += 60;
        
        // ANÁLISE DE RISCOS E CONTROLES
        checkPageBreak(40);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(25, 47, 89);
        doc.text('ANÁLISE DE RISCOS E CONTROLES', margins.left, currentY);
        currentY += 10;
        
        // Linha decorativa
        doc.setDrawColor(25, 47, 89);
        doc.setLineWidth(1);
        doc.line(margins.left, currentY - 5, margins.left + 80, currentY - 5);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        
        // Distribuição de apontamentos por criticidade
        const distribuicaoTexto = `A análise dos controles internos revelou uma distribuição de apontamentos que reflete o estado atual da governança organizacional: ${apontamentosCriticos} apontamentos críticos (${totalApontamentos > 0 ? Math.round((apontamentosCriticos/totalApontamentos)*100) : 0}%), ${apontamentosAltos} de alta prioridade (${totalApontamentos > 0 ? Math.round((apontamentosAltos/totalApontamentos)*100) : 0}%), ${apontamentosMedios} de média prioridade e ${apontamentosBaixos} de baixa prioridade. Esta distribuição indica ${apontamentosCriticos > 0 ? 'a necessidade de ações corretivas imediatas' : 'um ambiente de controle adequado'} nos processos auditados.`;
        
        const distribuicaoLines = doc.splitTextToSize(distribuicaoTexto, pageWidth - margins.left - margins.right);
        distribuicaoLines.forEach((line) => {
          checkPageBreak(5);
          doc.text(line, margins.left, currentY);
          currentY += 5;
        });
        currentY += 10;
        
        // PRINCIPAIS APONTAMENTOS CRÍTICOS
        if (apontamentosCriticos > 0 && apontamentosData?.length > 0) {
          checkPageBreak(30);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(231, 76, 60);
          doc.text('APONTAMENTOS CRÍTICOS - AÇÃO IMEDIATA REQUERIDA', margins.left, currentY);
          currentY += 8;
          
          const apontamentosCriticosLista = apontamentosData.filter(a => a.criticidade === 'critica').slice(0, 3);
          
          apontamentosCriticosLista.forEach((apontamento, index) => {
            checkPageBreak(15);
            
            // Caixa de destaque para apontamento crítico
            doc.setFillColor(254, 242, 242);
            doc.setDrawColor(231, 76, 60);
            doc.setLineWidth(0.5);
            doc.rect(margins.left, currentY, pageWidth - margins.left - margins.right, 12, 'FD');
            
            // Número e título do apontamento
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(231, 76, 60);
            doc.text(`${index + 1}. ${apontamento.titulo || 'Apontamento Crítico'}`, margins.left + 3, currentY + 5);
            
            // Descrição resumida
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(80, 80, 80);
            const descricao = apontamento.descricao?.length > 100 
              ? apontamento.descricao.substring(0, 100) + '...'
              : apontamento.descricao || 'Descrição não disponível';
            doc.text(descricao, margins.left + 3, currentY + 9);
            
            currentY += 15;
          });
          
          currentY += 5;
        }
        
        // NOVA PÁGINA PARA RECOMENDAÇÕES E CONCLUSÕES
        doc.addPage();
        addHeader();
        
        // PRINCIPAIS RECOMENDAÇÕES
        checkPageBreak(30);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(25, 47, 89);
        doc.text('PRINCIPAIS RECOMENDAÇÕES', margins.left, currentY);
        currentY += 10;
        
        // Linha decorativa
        doc.setDrawColor(25, 47, 89);
        doc.setLineWidth(1);
        doc.line(margins.left, currentY - 5, margins.left + 70, currentY - 5);
        
        const recomendacoesProfissionais = [
          {
            titulo: 'Fortalecimento dos Controles Internos',
            descricao: 'Implementar controles automatizados nos processos críticos identificados, com foco na segregação de funções e aprovações hierárquicas.',
            prioridade: 'ALTA',
            prazo: '90 dias'
          },
          {
            titulo: 'Programa de Monitoramento Contínuo',
            descricao: 'Estabelecer indicadores de performance e dashboards executivos para monitoramento em tempo real dos controles implementados.',
            prioridade: 'MÉDIA',
            prazo: '120 dias'
          },
          {
            titulo: 'Capacitação e Treinamento',
            descricao: 'Desenvolver programa de capacitação para colaboradores sobre políticas, procedimentos e controles internos atualizados.',
            prioridade: 'MÉDIA',
            prazo: '180 dias'
          },
          {
            titulo: 'Governança e Compliance',
            descricao: 'Estruturar comitê de governança para acompanhamento sistemático da implementação das recomendações e monitoramento de riscos.',
            prioridade: 'ALTA',
            prazo: '60 dias'
          }
        ];
        
        recomendacoesProfissionais.forEach((recomendacao, index) => {
          checkPageBreak(20);
          
          // Caixa da recomendação
          const corPrioridade = recomendacao.prioridade === 'ALTA' ? [231, 76, 60] : [241, 196, 15];
          doc.setFillColor(248, 249, 250);
          doc.setDrawColor(...corPrioridade);
          doc.setLineWidth(0.8);
          doc.rect(margins.left, currentY, pageWidth - margins.left - margins.right, 18, 'FD');
          
          // Título da recomendação
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(25, 47, 89);
          doc.text(`${index + 1}. ${recomendacao.titulo}`, margins.left + 3, currentY + 6);
          
          // Prioridade e prazo
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...corPrioridade);
          doc.text(`PRIORIDADE: ${recomendacao.prioridade} | PRAZO: ${recomendacao.prazo}`, pageWidth - margins.right - 60, currentY + 6);
          
          // Descrição
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(60, 60, 60);
          const descLines = doc.splitTextToSize(recomendacao.descricao, pageWidth - margins.left - margins.right - 6);
          descLines.slice(0, 2).forEach((line, lineIndex) => {
            doc.text(line, margins.left + 3, currentY + 10 + (lineIndex * 4));
          });
          
          currentY += 22;
        });
        
        // CONCLUSÃO EXECUTIVA
        checkPageBreak(25);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(25, 47, 89);
        doc.text('CONCLUSÃO EXECUTIVA', margins.left, currentY);
        currentY += 10;
        
        // Linha decorativa
        doc.setDrawColor(25, 47, 89);
        doc.setLineWidth(1);
        doc.line(margins.left, currentY - 5, margins.left + 55, currentY - 5);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        
        const conclusaoExecutiva = `Com base na análise realizada, a organização apresenta um ambiente de controle ${complianceScore >= 80 ? 'adequado' : 'que requer melhorias'} com índice de compliance de ${complianceScore}%. Os ${totalApontamentos} apontamentos identificados, sendo ${apontamentosCriticos} críticos, ${apontamentosAltos} altos, ${apontamentosMedios} médios e ${apontamentosBaixos} baixos, refletem oportunidades específicas de fortalecimento dos controles internos. A implementação das recomendações propostas, com foco prioritário nos itens críticos e de alta prioridade, resultará em significativa melhoria do ambiente de governança e redução dos riscos operacionais. Recomenda-se o acompanhamento trimestral do plano de ação para assegurar a efetiva implementação das melhorias propostas.`;
        
        const conclusaoLines = doc.splitTextToSize(conclusaoExecutiva, pageWidth - margins.left - margins.right);
        conclusaoLines.forEach((line) => {
          checkPageBreak(5);
          doc.text(line, margins.left, currentY);
          currentY += 5;
        });
        currentY += 15;
        
        // ASSINATURA E RESPONSABILIDADES
        checkPageBreak(25);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(25, 47, 89);
        doc.text('RESPONSABILIDADES E APROVAÇÕES', margins.left, currentY);
        currentY += 10;
        
        // Caixa de assinaturas
        doc.setFillColor(248, 249, 250);
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.5);
        doc.rect(margins.left, currentY, pageWidth - margins.left - margins.right, 20, 'FD');
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        
        doc.text('Elaborado por: Departamento de Auditoria Interna', margins.left + 5, currentY + 6);
        doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, margins.left + 5, currentY + 10);
        doc.text('Aprovado por: ________________________', margins.left + 5, currentY + 16);
        
        doc.text('Revisado por: Gerência de Auditoria', pageWidth - margins.right - 60, currentY + 6);
        doc.text('Status: CONFIDENCIAL', pageWidth - margins.right - 60, currentY + 10);
        doc.text('Distribuição: Restrita', pageWidth - margins.right - 60, currentY + 16);
        
        // Adicionar rodapés em todas as páginas
        const totalPages = doc.internal.pages.length - 1;
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          addFooter(i, totalPages);
        }
        
        console.log('📄 [DEBUG] Salvando PDF PROFISSIONAL...');
        const fileName = `Relatorio_Executivo_${new Date().toISOString().split('T')[0]}_${relatorio.id.substring(0, 8)}.pdf`;
        doc.save(fileName);
        
        console.log('✅ [DEBUG] PDF PROFISSIONAL gerado e baixado com sucesso!');
        toast.success('Relatório Executivo Profissional gerado com sucesso!', {
          description: 'Documento formatado com padrões corporativos de auditoria'
        });
        
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

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" onClick={() => setSelectedTab('relatorios')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-2">Relatórios</h3>
            <p className="text-muted-foreground text-sm">Sistema profissional de relatórios de auditoria</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>

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

            {/* Seleção de Projeto para Relatório */}
            <Card>
              <CardHeader>
                <CardTitle>Gerar Relatório de Projeto de Auditoria</CardTitle>
                <CardDescription>
                  Selecione um projeto de auditoria para gerar o relatório executivo detalhado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Seletor de Projeto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Projeto de Auditoria</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um projeto..." />
                        </SelectTrigger>
                        <SelectContent>
                          {auditProjects.map((projeto) => (
                            <SelectItem key={projeto.id} value={projeto.id}>
                              {projeto.codigo} - {projeto.titulo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Tipo de Relatório</Label>
                      <Select defaultValue="executivo">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="executivo">Relatório Executivo</SelectItem>
                          <SelectItem value="tecnico">Relatório Técnico</SelectItem>
                          <SelectItem value="seguimento">Relatório de Follow-up</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Lista de Projetos Disponíveis */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Projetos Disponíveis para Relatório:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {auditProjects.slice(0, 6).map((projeto) => (
                        <Card key={projeto.id} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <h5 className="font-semibold text-xs">{projeto.codigo}</h5>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{projeto.titulo}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <Badge className={getStatusColor(projeto.status)} variant="secondary">
                                    {projeto.status.replace('_', ' ')}
                                  </Badge>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => {
                                      console.log('💆 [DEBUG] Botão RELATÓRIO clicado para projeto:', projeto.id);
                                      handleCreateProjectReport(projeto);
                                    }}
                                    disabled={generatingReport}
                                  >
                                    {generatingReport ? 'Gerando...' : 'Gerar'}
                                  </Button>
                                </div>
                                <div className="mt-2">
                                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>Progresso</span>
                                    <span>{projeto.progresso}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div 
                                      className="bg-blue-600 h-1.5 rounded-full" 
                                      style={{ width: `${projeto.progresso}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
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
                                toast.info('Selecione um projeto específico acima para gerar o relatório executivo');
                              }}
                              disabled={generatingReport}
                            >
                              Selecionar Projeto
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