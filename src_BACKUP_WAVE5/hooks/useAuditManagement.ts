import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { 
  useTenantSecurity,
  tenantAccessMiddleware
} from '@/utils/tenantSecurity';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface AuditKPI {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: string;
  color: string;
}

export interface Audit {
  id: string;
  title: string;
  audit_number: string;
  audit_type: string;
  status: string;
  priority: string;
  current_phase: string;
  lead_auditor: string;
  planned_start_date: string;
  planned_end_date: string;
  progress: number;
  ai_risk_score: number;
  findings_count: number;
  overdue: boolean;
}

export interface AuditMetrics {
  totalAudits: number;
  auditsByStatus: Record<string, number>;
  auditsByType: Record<string, number>;
  auditsByPriority: Record<string, number>;
  overdue: number;
  averageProgress: number;
  averageRiskScore: number;
}

// ============================================================================
// HOOK PRINCIPAL PARA GESTÃO DE AUDITORIAS
// ============================================================================

export const useAuditManagement = () => {
  const { user } = useAuth();
  const { 
    userTenantId, 
    validateAccess, 
    enforceFilter, 
    logActivity,
    isValidTenant 
  } = useTenantSecurity();

  // Query otimizada para métricas críticas de auditoria - apenas dados essenciais
  const {
    data: metrics,
    isLoading: isLoadingMetrics
  } = useQuery({
    queryKey: ['audit-metrics-fast', userTenantId],
    queryFn: async (): Promise<AuditMetrics> => {
      if (!userTenantId) {
        throw new Error('Acesso negado: tenant não identificado');
      }

      // Como não temos tabela de auditoria ainda, usar dados simulados otimizados
      // Query otimizada seria:
      // const { data: auditData, error } = await supabase
      //   .from('audits')
      //   .select('id, status, audit_type, priority, progress, ai_risk_score, planned_end_date')
      //   .eq('tenant_id', userTenantId);

      // Mock data otimizado para demonstração
      const mockAudits = [
        {
          id: '1',
          status: 'Fieldwork',
          audit_type: 'Financial Audit',
          priority: 'High',
          progress: 65,
          ai_risk_score: 7.2,
          planned_end_date: '2025-03-15',
        },
        {
          id: '2',
          status: 'Planning',
          audit_type: 'IT Audit', 
          priority: 'Critical',
          progress: 25,
          ai_risk_score: 8.5,
          planned_end_date: '2025-04-01',
        },
        {
          id: '3',
          status: 'Review',
          audit_type: 'Compliance Audit',
          priority: 'Medium', 
          progress: 90,
          ai_risk_score: 4.1,
          planned_end_date: '2025-02-01',
        }
      ];

      // Cálculo otimizado das métricas
      const auditsByStatus: Record<string, number> = {};
      const auditsByType: Record<string, number> = {};
      const auditsByPriority: Record<string, number> = {};
      
      let totalProgress = 0;
      let totalRiskScore = 0;
      let overdueCount = 0;
      const now = new Date();

      mockAudits.forEach(audit => {
        // Contadores por status
        auditsByStatus[audit.status] = (auditsByStatus[audit.status] || 0) + 1;
        
        // Contadores por tipo
        auditsByType[audit.audit_type] = (auditsByType[audit.audit_type] || 0) + 1;
        
        // Contadores por prioridade
        auditsByPriority[audit.priority] = (auditsByPriority[audit.priority] || 0) + 1;
        
        // Médias
        totalProgress += audit.progress;
        totalRiskScore += audit.ai_risk_score;
        
        // Auditorias atrasadas
        if (new Date(audit.planned_end_date) < now && audit.status !== 'Closed') {
          overdueCount++;
        }
      });

      return {
        totalAudits: mockAudits.length,
        auditsByStatus,
        auditsByType,
        auditsByPriority,
        overdue: overdueCount,
        averageProgress: Math.round(totalProgress / mockAudits.length),
        averageRiskScore: Math.round((totalRiskScore / mockAudits.length) * 10) / 10
      };
    },
    enabled: !!user && !!userTenantId,
    staleTime: 1 * 60 * 1000, // 1 minuto para métricas críticas
    gcTime: 5 * 60 * 1000,    // 5 minutos na memória
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  // Query para dados completos de auditorias (mais lenta)
  const {
    data: audits = [],
    isLoading: isLoadingAudits,
    error: auditsError
  } = useQuery({
    queryKey: ['audits', userTenantId],
    queryFn: async (): Promise<Audit[]> => {
      if (!userTenantId) {
        throw new Error('Acesso negado: tenant não identificado');
      }

      // Simular delay da query (em produção seria query real no Supabase)
      await new Promise(resolve => setTimeout(resolve, 100));

      // Mock data completo
      return [
        {
          id: '1',
          title: 'Auditoria de Controles Internos SOX',
          audit_number: 'AUD-2025-0001',
          audit_type: 'Financial Audit',
          status: 'Fieldwork',
          priority: 'High',
          current_phase: 'Control Testing',
          lead_auditor: 'Ana Silva',
          planned_start_date: '2025-01-15',
          planned_end_date: '2025-03-15',
          progress: 65,
          ai_risk_score: 7.2,
          findings_count: 3,
          overdue: false
        },
        {
          id: '2',
          title: 'Auditoria de Segurança Cibernética',
          audit_number: 'AUD-2025-0002',
          audit_type: 'IT Audit',
          status: 'Planning',
          priority: 'Critical',
          current_phase: 'Risk Assessment',
          lead_auditor: 'Carlos Mendes',
          planned_start_date: '2025-02-01',
          planned_end_date: '2025-04-01',
          progress: 25,
          ai_risk_score: 8.5,
          findings_count: 0,
          overdue: false
        },
        {
          id: '3',
          title: 'Auditoria LGPD e Privacidade',
          audit_number: 'AUD-2025-0003',
          audit_type: 'Compliance Audit',
          status: 'Review',
          priority: 'Medium',
          current_phase: 'Reporting',
          lead_auditor: 'Marina Costa',
          planned_start_date: '2024-12-01',
          planned_end_date: '2025-02-01',
          progress: 90,
          ai_risk_score: 4.1,
          findings_count: 5,
          overdue: true
        }
      ];
    },
    enabled: !!user && !!userTenantId,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    gcTime: 10 * 60 * 1000,   // 10 minutos na memória
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  // Query para KPIs (métricas calculadas)
  const {
    data: kpis,
    isLoading: isLoadingKPIs
  } = useQuery({
    queryKey: ['audit-kpis', userTenantId],
    queryFn: async (): Promise<AuditKPI[]> => {
      if (!metrics) return [];

      return [
        {
          title: 'Auditorias Ativas',
          value: metrics.totalAudits,
          change: '+12%',
          trend: 'up',
          icon: 'Activity',
          color: 'text-blue-600'
        },
        {
          title: 'Achados Críticos',
          value: Math.floor(metrics.totalAudits * 0.3), // Simulado
          change: '-25%',
          trend: 'down',
          icon: 'AlertTriangle',
          color: 'text-red-600'
        },
        {
          title: 'Taxa de Conclusão',
          value: `${metrics.averageProgress}%`,
          change: '+5%',
          trend: 'up',
          icon: 'CheckCircle',
          color: 'text-green-600'
        },
        {
          title: 'Automação IA',
          value: '92%',
          change: '+18%',
          trend: 'up',
          icon: 'Brain',
          color: 'text-purple-600'
        }
      ];
    },
    enabled: !!metrics,
    staleTime: 3 * 60 * 1000, // 3 minutos de cache
    gcTime: 8 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  return {
    // Dados
    audits,
    metrics,
    kpis: kpis || [],
    
    // Estados de loading
    isLoadingAudits,
    isLoadingMetrics,
    isLoadingKPIs,
    
    // Errors
    auditsError,
    
    // Utilitários
    filterAudits: (searchTerm: string, statusFilter: string) => {
      return audits.filter(audit => {
        const matchesSearch = audit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             audit.audit_number.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || audit.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
    }
  };
};