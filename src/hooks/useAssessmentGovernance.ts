import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import type {
  AssessmentWorkflow,
  AssessmentStatus,
  AssessmentPhase,
  AssessmentRole,
  AssessmentTransition,
  ValidationResult,
  AssessmentAuditLog,
  AssessmentQualityControl
} from '@/types/assessment-governance';

export function useAssessmentGovernance() {
  const { user, effectiveTenantId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [workflowConfig, setWorkflowConfig] = useState<AssessmentTransition[]>([]);

  // Configuração padrão do workflow
  const defaultWorkflow: AssessmentTransition[] = [
    {
      from: 'draft',
      to: 'planejado',
      requiredRole: 'assessment_manager',
      requiredPhase: 'preparacao',
      validationRules: [
        {
          id: 'basic_info',
          description: 'Informações básicas obrigatórias',
          type: 'mandatory',
          validator: (assessment) => ({
            isValid: !!(assessment.titulo && assessment.framework_id && assessment.responsavel_assessment),
            errors: [],
            warnings: [],
            infos: []
          })
        }
      ]
    },
    {
      from: 'planejado',
      to: 'em_andamento',
      requiredRole: 'assessment_lead',
      requiredPhase: 'coleta_dados',
      validationRules: [
        {
          id: 'team_assigned',
          description: 'Equipe designada',
          type: 'mandatory',
          validator: (assessment) => ({
            isValid: !!(assessment.avaliadores && assessment.avaliadores.length > 0),
            errors: [],
            warnings: [],
            infos: []
          })
        }
      ]
    },
    {
      from: 'em_andamento',
      to: 'em_revisao',
      requiredRole: 'assessment_lead',
      requiredPhase: 'revisao',
      validationRules: [
        {
          id: 'completion_threshold',
          description: 'Mínimo 80% de conclusão',
          type: 'mandatory',
          validator: (assessment) => ({
            isValid: assessment.percentual_conclusao >= 80,
            errors: assessment.percentual_conclusao < 80 ? ['Assessment deve ter pelo menos 80% de conclusão'] : [],
            warnings: [],
            infos: []
          })
        }
      ]
    },
    {
      from: 'em_revisao',
      to: 'revisado',
      requiredRole: 'reviewer',
      requiredPhase: 'aprovacao',
      validationRules: [
        {
          id: 'quality_review',
          description: 'Revisão de qualidade aprovada',
          type: 'mandatory',
          validator: (assessment) => ({
            isValid: assessment.quality_score >= 70,
            errors: assessment.quality_score < 70 ? ['Score de qualidade deve ser pelo menos 70'] : [],
            warnings: [],
            infos: []
          })
        }
      ]
    },
    {
      from: 'revisado',
      to: 'concluido',
      requiredRole: 'approver',
      requiredPhase: 'relatorio',
      validationRules: [
        {
          id: 'final_approval',
          description: 'Aprovação final',
          type: 'mandatory',
          validator: (assessment) => ({
            isValid: assessment.percentual_conclusao === 100,
            errors: assessment.percentual_conclusao !== 100 ? ['Assessment deve estar 100% concluído'] : [],
            warnings: [],
            infos: []
          })
        }
      ]
    }
  ];

  // Inicializar configuração do workflow
  useEffect(() => {
    setWorkflowConfig(defaultWorkflow);
  }, []);

  // Verificar se usuário tem permissão para uma ação
  const hasPermission = useCallback((
    assessment: any,
    requiredRole: AssessmentRole,
    action: string
  ): boolean => {
    // TODO: Implementar verificação real de roles do usuário
    // Por enquanto, permite tudo para desenvolvimento
    return true;
  }, [user]);

  // Verificar se transição é válida
  const canTransition = useCallback((
    currentStatus: AssessmentStatus,
    targetStatus: AssessmentStatus,
    userRole: AssessmentRole
  ): { canTransition: boolean; reason?: string } => {
    const transition = workflowConfig.find(
      t => t.from === currentStatus && t.to === targetStatus
    );

    if (!transition) {
      return {
        canTransition: false,
        reason: `Transição de ${currentStatus} para ${targetStatus} não é permitida`
      };
    }

    if (transition.requiredRole !== userRole) {
      return {
        canTransition: false,
        reason: `Role ${transition.requiredRole} é necessária para esta transição`
      };
    }

    return { canTransition: true };
  }, [workflowConfig]);

  // Validar assessment antes de transição
  const validateAssessment = useCallback((
    assessment: any,
    targetStatus: AssessmentStatus
  ): ValidationResult => {
    const transition = workflowConfig.find(
      t => t.from === assessment.status && t.to === targetStatus
    );

    if (!transition) {
      return {
        isValid: false,
        errors: [`Transição para ${targetStatus} não é válida`],
        warnings: [],
        infos: []
      };
    }

    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      infos: []
    };

    // Executar regras de validação
    for (const rule of transition.validationRules) {
      const ruleResult = rule.validator(assessment);
      
      if (!ruleResult.isValid && rule.type === 'mandatory') {
        result.isValid = false;
        result.errors.push(...ruleResult.errors);
      }
      
      result.warnings.push(...ruleResult.warnings);
      result.infos.push(...ruleResult.infos);
    }

    return result;
  }, [workflowConfig]);

  // Executar transição de status
  const transitionStatus = useCallback(async (
    assessmentId: string,
    targetStatus: AssessmentStatus,
    comments?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!effectiveTenantId || !user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    setLoading(true);

    try {
      // Buscar assessment atual
      const { data: assessment, error: fetchError } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .eq('tenant_id', effectiveTenantId)
        .single();

      if (fetchError || !assessment) {
        return { success: false, error: 'Assessment não encontrado' };
      }

      // Validar transição
      const validation = validateAssessment(assessment, targetStatus);
      if (!validation.isValid) {
        toast.error(`Validação falhou: ${validation.errors.join(', ')}`);
        return { success: false, error: validation.errors.join(', ') };
      }

      // Executar transição
      const { error: updateError } = await supabase
        .from('assessments')
        .update({
          status: targetStatus,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        })
        .eq('id', assessmentId)
        .eq('tenant_id', effectiveTenantId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      // Log da auditoria
      await logAuditAction(assessmentId, 'status_changed', {
        old_status: assessment.status,
        new_status: targetStatus,
        comments
      });

      toast.success(`Status alterado para ${targetStatus} com sucesso`);
      return { success: true };

    } catch (error) {
      console.error('Erro na transição de status:', error);
      return { success: false, error: 'Erro interno do sistema' };
    } finally {
      setLoading(false);
    }
  }, [effectiveTenantId, user, validateAssessment]);

  // Log de auditoria
  const logAuditAction = useCallback(async (
    assessmentId: string,
    action: string,
    details: any
  ): Promise<void> => {
    if (!effectiveTenantId || !user) return;

    try {
      const auditLog: Partial<AssessmentAuditLog> = {
        tenant_id: effectiveTenantId,
        assessment_id: assessmentId,
        action: action as any,
        user_id: user.id,
        timestamp: new Date(),
        old_values: details.old_values,
        new_values: details.new_values,
        comments: details.comments
      };

      // TODO: Implementar tabela de audit_logs
      console.log('Audit log:', auditLog);
      
    } catch (error) {
      console.error('Erro ao registrar log de auditoria:', error);
    }
  }, [effectiveTenantId, user]);

  // Verificar qualidade do assessment
  const performQualityCheck = useCallback(async (
    assessmentId: string
  ): Promise<AssessmentQualityControl | null> => {
    if (!effectiveTenantId) return null;

    try {
      // Buscar assessment e respostas
      const { data: assessment } = await supabase
        .from('assessments')
        .select('*, assessment_responses(*)')
        .eq('id', assessmentId)
        .eq('tenant_id', effectiveTenantId)
        .single();

      if (!assessment) return null;

      // Calcular métricas de qualidade
      const responses = assessment.assessment_responses || [];
      const totalQuestions = responses.length;
      const answeredQuestions = responses.filter(r => r.resposta_texto || r.resposta_numerica !== null).length;
      const withEvidence = responses.filter(r => r.evidencias && r.evidencias.length > 0).length;

      const completenessScore = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
      const evidenceScore = totalQuestions > 0 ? (withEvidence / totalQuestions) * 100 : 0;
      const overallScore = (completenessScore + evidenceScore) / 2;

      const qualityControl: AssessmentQualityControl = {
        id: `qc_${assessmentId}_${Date.now()}`,
        assessment_id: assessmentId,
        quality_checks: [
          {
            id: 'completeness',
            name: 'Completude das Respostas',
            description: 'Verifica se todas as questões foram respondidas',
            type: 'completeness',
            status: completenessScore >= 80 ? 'passed' : completenessScore >= 60 ? 'warning' : 'failed',
            score: completenessScore,
            max_score: 100,
            details: `${answeredQuestions}/${totalQuestions} questões respondidas`,
            recommendations: completenessScore < 80 ? ['Responder todas as questões obrigatórias'] : []
          },
          {
            id: 'evidence',
            name: 'Evidências Anexadas',
            description: 'Verifica se evidências foram fornecidas',
            type: 'evidence',
            status: evidenceScore >= 70 ? 'passed' : evidenceScore >= 50 ? 'warning' : 'failed',
            score: evidenceScore,
            max_score: 100,
            details: `${withEvidence}/${totalQuestions} questões com evidências`,
            recommendations: evidenceScore < 70 ? ['Anexar evidências para as respostas'] : []
          }
        ],
        overall_score: overallScore,
        status: overallScore >= 75 ? 'passed' : overallScore >= 60 ? 'warning' : 'failed',
        reviewed_by: user?.id || '',
        reviewed_at: new Date(),
        comments: `Assessment com ${overallScore.toFixed(1)}% de qualidade geral`
      };

      return qualityControl;

    } catch (error) {
      console.error('Erro na verificação de qualidade:', error);
      return null;
    }
  }, [effectiveTenantId, user]);

  return {
    loading,
    workflowConfig,
    hasPermission,
    canTransition,
    validateAssessment,
    transitionStatus,
    logAuditAction,
    performQualityCheck
  };
}