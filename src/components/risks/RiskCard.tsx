import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Calendar,
  CalendarIcon,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Shield,
  Target,
  FileText,
  Mail,
  Plus,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  Clock,
  User,
  Building,
  Activity,
  Send,
  Eye,
  Users,
  BarChart3,
  TrendingUp,
  Zap,
  Save,
  X
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useRiskManagement } from '@/hooks/useRiskManagement';
import { useRiskPDF } from '@/hooks/useRiskPDF';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  RISK_ASSESSMENT_QUESTIONS,
  ASSESSMENT_RESPONSE_OPTIONS,
  GUT_RESPONSE_OPTIONS,
  GUT_QUESTIONS
} from '@/data/risk-assessment-questions';
import {
  processRiskAnalysis,
  processRiskAnalysisWithTenantConfig,
  generateMatrixData,
  findRiskPositionInMatrix,
  getTenantMatrixConfig
} from '@/utils/risk-analysis';
import RiskAssessmentQuestions from './RiskAssessmentQuestions';
import GUTMatrixSection from './GUTMatrixSection';
import RiskMatrix from './RiskMatrix';
import type {
  Risk,
  Activity as RiskActivity,
  RiskCommunication,
  TreatmentType,
  ActivityStatus,
  CommunicationDecision,
  RiskCategory,
  RiskAnalysisType,
  RiskAnalysisData,
  RiskAssessmentAnswer,
  MatrixSize,
  GUTAnalysis
} from '@/types/risk-management';
import { RISK_CATEGORIES, TREATMENT_TYPES, ACTIVITY_STATUSES } from '@/types/risk-management';

const getRiskLevelColor = (level: string) => {
  switch (level) {
    case 'Muito Alto': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200';
    case 'Alto': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200';
    case 'Médio': return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900 dark:text-amber-200';
    case 'Baixo': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Identificado': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Em Tratamento': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Monitorado': return 'bg-green-100 text-green-800 border-green-200';
    case 'Fechado': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getActivityStatusColor = (status: ActivityStatus) => {
  switch (status) {
    case 'Concluído': return 'bg-green-100 text-green-800';
    case 'Em Andamento': return 'bg-blue-100 text-blue-800';
    case 'Atrasado': return 'bg-red-100 text-red-800';
    case 'Aguardando': return 'bg-yellow-100 text-yellow-800';
    case 'Cancelado': return 'bg-gray-100 text-gray-800';
    default: return 'bg-purple-100 text-purple-800';
  }
};

interface RiskCardProps {
  risk: Risk;
  onUpdate?: (riskId: string, updates: Partial<Risk>) => void;
  onDelete?: (riskId: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

const RiskCard: React.FC<RiskCardProps> = React.memo(({
  risk,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
  canEdit = true,
  canDelete = true
}) => {
  const { user } = useAuth();
  const { addActivity, updateActivity, createAcceptanceLetter } = useRiskManagement();
  const { generateAcceptanceLetter, generateActionPlan, isGenerating } = useRiskPDF();

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'general' | 'analysis' | 'action' | 'acceptance' | 'communication'>('general');

  // Estados para edição de informações gerais
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [generalData, setGeneralData] = useState({
    name: risk.name,
    description: risk.description || '',
    executiveSummary: risk.executiveSummary || '',
    technicalDetails: risk.technicalDetails || '',
    category: risk.category,
    treatmentType: risk.treatmentType,
    probability: risk.probability,
    impact: risk.impact,
    riskLevel: risk.riskLevel,
    owner: risk.owner,
    assignedTo: risk.assignedTo || '',
    dueDate: risk.dueDate?.toISOString().split('T')[0] || ''
  });

  // Estados para análise de risco (declarados primeiro para evitar erro de inicialização)
  const [analysisData, setAnalysisData] = useState<RiskAnalysisData | null>(
    risk.analysisData || null
  );
  const [selectedRiskType, setSelectedRiskType] = useState<RiskAnalysisType>('Técnico');
  const [matrixSize, setMatrixSize] = useState<MatrixSize>('4x4'); // Será atualizado pela configuração da tenant
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAssessmentType, setCurrentAssessmentType] = useState<'probability' | 'impact'>('probability');
  const [probabilityAnswers, setProbabilityAnswers] = useState<RiskAssessmentAnswer[]>([]);
  const [impactAnswers, setImpactAnswers] = useState<RiskAssessmentAnswer[]>([]);
  const [gutAnalysis, setGutAnalysis] = useState<GUTAnalysis | null>(null);
  const [showMatrix, setShowMatrix] = useState(false);
  const [isAnalysisMode, setIsAnalysisMode] = useState(false);

  // Estados para plano de ação
  const [activities, setActivities] = useState<RiskActivity[]>(risk.actionPlan?.activities || []);
  const [newActivity, setNewActivity] = useState({
    name: '',
    details: '',
    responsible: '',
    dueDate: '',
    priority: 'Média' as const,
    status: 'TBD' as ActivityStatus
  });

  // Estados para carta de aceitação
  const [acceptanceData, setAcceptanceData] = useState({
    justification: '',
    compensatingControls: '',
    businessJustification: '',
    approver: '',
    approverTitle: '',
    reviewConditions: ''
  });

  // Estados para comunicação
  const [communications, setCommunications] = useState<RiskCommunication[]>(risk.communications || []);
  const [newCommunication, setNewCommunication] = useState({
    type: 'Apontamento' as const,
    recipientName: '',
    recipientEmail: '',
    recipientTitle: '',
    subject: '',
    message: '',
    isUrgent: false
  });

  // Estado da preview de evidência
  const [evidencePreview, setEvidencePreview] = useState<{ isOpen: boolean; url: string; title: string }>({ isOpen: false, url: '', title: '' });

  // Sincronizar estado local com as mudanças do prop risk
  useEffect(() => {
    console.log('🔄 RiskCard: Sincronizando dados do prop risk:', {
      riskId: risk.id,
      riskName: risk.name,
      riskLevel: risk.riskLevel,
      probability: risk.probability,
      impact: risk.impact,
      riskScore: risk.riskScore
    });

    setGeneralData({
      name: risk.name,
      description: risk.description || '',
      executiveSummary: risk.executiveSummary || '',
      technicalDetails: risk.technicalDetails || '',
      category: risk.category,
      treatmentType: risk.treatmentType,
      probability: risk.probability,
      impact: risk.impact,
      riskLevel: risk.riskLevel,
      owner: risk.owner,
      assignedTo: risk.assignedTo || '',
      dueDate: risk.dueDate?.toISOString().split('T')[0] || ''
    });
  }, [risk]);

  // Carregar configuração da matriz da tenant
  useEffect(() => {
    const loadTenantMatrixConfig = async () => {
      if (user?.tenant?.id) {
        try {
          console.log('🔄 Carregando configuração da matriz para tenant:', user.tenant.id);
          const config = await getTenantMatrixConfig(user.tenant.id);

          console.log('🏢 Configuração da matriz da tenant carregada:', {
            tenantId: user.tenant.id,
            configMatrixType: config.type,
            currentMatrixSize: matrixSize,
            needsUpdate: config.type !== matrixSize
          });

          // SEMPRE atualizar o tipo de matriz conforme a configuração da tenant
          setMatrixSize(config.type);
          console.log('⚙️ Tipo de matriz DEFINIDO para:', config.type);

          // Se já existe analysisData, atualizar o matrixSize nela também
          if (analysisData && analysisData.matrixSize !== config.type) {
            console.log('🔄 Atualizando matrixSize na analysisData existente');
            setAnalysisData(prev => prev ? {
              ...prev,
              matrixSize: config.type
            } : null);
          }
        } catch (error) {
          console.error('❌ Erro ao carregar configuração da matriz da tenant:', error);
        }
      } else {
        console.log('⚠️ Nenhum tenant ID disponível');
      }
    };

    loadTenantMatrixConfig();
  }, [user?.tenant?.id, analysisData?.matrixSize]);

  // Calcular nível de risco
  const calculateRiskLevel = () => {
    console.log('📊 RiskCard calculateRiskLevel:', {
      riskId: risk.id,
      riskName: risk.name,
      analysisDataLevel: analysisData?.qualitativeRiskLevel,
      generalDataLevel: generalData.riskLevel,
      originalRiskLevel: risk.riskLevel,
      probability: generalData.probability,
      impact: generalData.impact,
      score: generalData.probability * generalData.impact
    });

    // Priorizar nível da análise estruturada se disponível
    if (analysisData?.qualitativeRiskLevel) {
      console.log('🔬 Usando nível da análise estruturada:', analysisData.qualitativeRiskLevel);
      return analysisData.qualitativeRiskLevel;
    }

    // REMOVIDO: Não usar generalData.riskLevel pois pode estar desatualizado
    // Sempre recalcular baseado no score quando não há análise estruturada
    console.log('🔬 Sem análise estruturada - forçando recálculo baseado no score');

    // Fallback para cálculo tradicional baseado nos valores atuais
    const score = generalData.probability * generalData.impact;
    let calculatedLevel;
    if (score >= 20) calculatedLevel = 'Muito Alto';
    else if (score >= 15) calculatedLevel = 'Alto';
    else if (score >= 8) calculatedLevel = 'Médio';
    else if (score >= 4) calculatedLevel = 'Baixo';
    else calculatedLevel = 'Muito Baixo';

    console.log('🔬 Usando cálculo tradicional:', {
      score,
      calculatedLevel,
      bankLevel: generalData.riskLevel,
      divergent: calculatedLevel !== generalData.riskLevel
    });

    return calculatedLevel;
  };

  const handleSaveGeneral = async () => {
    if (onUpdate) {
      const updates = {
        name: generalData.name,
        description: generalData.description,
        executiveSummary: generalData.executiveSummary,
        technicalDetails: generalData.technicalDetails,
        category: generalData.category,
        treatmentType: generalData.treatmentType,
        probability: generalData.probability,
        impact: generalData.impact,
        owner: generalData.owner,
        assignedTo: generalData.assignedTo || undefined,
        dueDate: generalData.dueDate ? new Date(generalData.dueDate) : undefined
      };

      console.log('💾 RiskCard: Salvando dados gerais:', {
        riskId: risk.id,
        updates: updates,
        originalProbability: risk.probability,
        newProbability: generalData.probability,
        originalImpact: risk.impact,
        newImpact: generalData.impact
      });

      try {
        await onUpdate(risk.id, updates);
        console.log('✅ RiskCard: Dados salvos com sucesso');
        // Aguardar um pouco para que o React Query invalide as queries
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsEditingGeneral(false);
      } catch (error) {
        // Em caso de erro, manter o modo de edição
        console.error('❌ RiskCard: Erro ao salvar:', error);
      }
    }
  };

  const handleAddActivity = () => {
    if (newActivity.name && newActivity.responsible) {
      const activity: RiskActivity = {
        id: `temp-${Date.now()}`,
        actionPlanId: risk.actionPlan?.id || '',
        name: newActivity.name,
        details: newActivity.details,
        responsible: newActivity.responsible,
        status: newActivity.status,
        priority: newActivity.priority,
        dueDate: newActivity.dueDate ? new Date(newActivity.dueDate) : undefined,
        completionPercentage: 0,
        createdBy: user?.id || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setActivities([...activities, activity]);
      setNewActivity({
        name: '',
        details: '',
        responsible: '',
        dueDate: '',
        priority: 'Média',
        status: 'TBD'
      });
    }
  };

  const handleUpdateActivity = (activityId: string, updates: Partial<RiskActivity>) => {
    setActivities(activities.map(activity =>
      activity.id === activityId ? { ...activity, ...updates } : activity
    ));
  };

  const handleRemoveActivity = (activityId: string) => {
    setActivities(activities.filter(activity => activity.id !== activityId));
  };

  const handleCreateAcceptanceLetter = async () => {
    if (acceptanceData.justification && acceptanceData.approver) {
      await createAcceptanceLetter({
        riskId: risk.id,
        justification: acceptanceData.justification,
        compensatingControls: acceptanceData.compensatingControls,
        businessJustification: acceptanceData.businessJustification,
        approver: acceptanceData.approver,
        approverTitle: acceptanceData.approverTitle,
        approvalDate: new Date(),
        reviewConditions: acceptanceData.reviewConditions,
        isActive: true
      });
    }
  };

  const handleAddCommunication = () => {
    if (newCommunication.recipientName && newCommunication.recipientEmail) {
      const communication: RiskCommunication = {
        id: `temp-${Date.now()}`,
        riskId: risk.id,
        type: newCommunication.type,
        recipientName: newCommunication.recipientName,
        recipientEmail: newCommunication.recipientEmail,
        recipientTitle: newCommunication.recipientTitle,
        subject: newCommunication.subject,
        message: newCommunication.message,
        isUrgent: newCommunication.isUrgent,
        createdBy: user?.id || '',
        createdAt: new Date()
      };

      setCommunications([...communications, communication]);
      setNewCommunication({
        type: 'Apontamento',
        recipientName: '',
        recipientEmail: '',
        recipientTitle: '',
        subject: '',
        message: '',
        isUrgent: false
      });
    }
  };

  const handleGeneratePDF = async () => {
    try {
      if (generalData.treatmentType === 'Aceitar') {
        const result = await generateAcceptanceLetter(risk, risk.acceptanceLetter);
        if (result.success) {
          toast.success(`PDF gerado com sucesso: ${result.fileName}`);
        } else {
          toast.error(result.error || 'Erro ao gerar PDF');
        }
      } else {
        const result = await generateActionPlan(risk);
        if (result.success) {
          toast.success(`PDF do plano de ação gerado: ${result.fileName}`);
        } else {
          toast.error(result.error || 'Erro ao gerar PDF do plano de ação');
        }
      }
    } catch (error) {
      toast.error('Erro inesperado ao gerar PDF');
      console.error('Erro ao gerar PDF:', error);
    }
  };

  // ============================================================================
  // FUNÇÕES DA ANÁLISE DE RISCO
  // ============================================================================

  const handleStartAnalysis = (riskType: RiskAnalysisType) => {
    setSelectedRiskType(riskType);
    setCurrentQuestionIndex(0);
    setCurrentAssessmentType('probability');
    setProbabilityAnswers([]);
    setImpactAnswers([]);
    setGutAnalysis(null);
    setShowMatrix(false);
    setIsAnalysisMode(true);
  };

  const processAnalysis = useCallback(async (probAnswers: RiskAssessmentAnswer[], impAnswers: RiskAssessmentAnswer[]) => {
    const analysis = await processRiskAnalysisWithTenantConfig(
      selectedRiskType,
      probAnswers,
      impAnswers,
      user?.tenant?.id
    );

    setAnalysisData(analysis);
    setShowMatrix(true);

    // Atualizar os scores e nível de risco no formulário geral
    setGeneralData(prev => ({
      ...prev,
      probability: Math.round(analysis.probabilityScore || 0),
      impact: Math.round(analysis.impactScore || 0),
      riskLevel: analysis.qualitativeRiskLevel
    }));
  }, [selectedRiskType, user?.tenant?.id]);

  const handleQuestionAnswer = useCallback((answer: RiskAssessmentAnswer) => {
    const currentQuestions = RISK_ASSESSMENT_QUESTIONS[selectedRiskType][currentAssessmentType];

    if (currentAssessmentType === 'probability') {
      const newAnswers = [...probabilityAnswers, answer];
      setProbabilityAnswers(newAnswers);

      if (newAnswers.length === currentQuestions.length) {
        // Todas as questões de probabilidade respondidas, passar para impacto
        setCurrentAssessmentType('impact');
        setCurrentQuestionIndex(0);
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    } else {
      const newAnswers = [...impactAnswers, answer];
      setImpactAnswers(newAnswers);

      if (newAnswers.length === currentQuestions.length) {
        // Todas as questões respondidas, processar análise
        processAnalysis(probabilityAnswers, newAnswers);
        setIsAnalysisMode(false); // Sair do modo de questões
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    }
  }, [selectedRiskType, currentAssessmentType, currentQuestionIndex, probabilityAnswers, impactAnswers, processAnalysis]);

  const handleGUTAnalysis = (gravity: number, urgency: number, tendency: number) => {
    const gutScore = gravity * urgency * tendency;
    const analysis: GUTAnalysis = {
      gravity,
      urgency,
      tendency,
      gutScore,
      priority: gutScore >= 100 ? 'Muito Alta' :
        gutScore >= 64 ? 'Alta' :
          gutScore >= 27 ? 'Média' :
            gutScore >= 8 ? 'Baixa' : 'Muito Baixa'
    };

    setGutAnalysis(analysis);

    // Atualizar analysisData
    if (analysisData) {
      const updatedAnalysis = { ...analysisData, gutAnalysis: analysis };
      setAnalysisData(updatedAnalysis);
    }
  };

  const saveAnalysis = async () => {
    if (!analysisData) {
      toast.error('Nenhuma análise para salvar');
      return;
    }

    if (!onUpdate) {
      toast.error('Função de atualização não disponível');
      return;
    }

    try {
      console.log('💾 Salvando análise de risco:', {
        riskId: risk.id,
        analysisData: analysisData,
        userTenant: user?.tenant?.id,
        probabilityScore: analysisData.probabilityScore,
        impactScore: analysisData.impactScore,
        qualitativeRiskLevel: analysisData.qualitativeRiskLevel
      });

      // Preparar dados completos para atualização
      const updateData = {
        // Dados da análise estruturada
        analysisData: {
          ...analysisData,
          // Garantir que todos os campos necessários estão presentes
          riskType: analysisData.riskType || selectedRiskType,
          matrixSize: analysisData.matrixSize || matrixSize,
          probabilityAnswers: probabilityAnswers,
          impactAnswers: impactAnswers,
          probabilityScore: analysisData.probabilityScore || 0,
          impactScore: analysisData.impactScore || 0,
          qualitativeRiskLevel: analysisData.qualitativeRiskLevel,
          gutAnalysis: analysisData.gutAnalysis || gutAnalysis,
          // Metadados importantes
          createdAt: new Date().toISOString(),
          createdBy: user?.id,
          tenantId: user?.tenant?.id // Incluir tenant_id na análise
        },

        // Atualizar campos principais do risco baseados na análise
        probability: Math.max(1, Math.min(5, Math.round(analysisData.probabilityScore || 0))),
        impact: Math.max(1, Math.min(5, Math.round(analysisData.impactScore || 0))),
        riskLevel: analysisData.qualitativeRiskLevel,
        riskScore: Math.round(analysisData.probabilityScore || 0) * Math.round(analysisData.impactScore || 0),

        // Atualizar timestamp de última revisão
        lastReviewDate: new Date()
      };

      console.log('📤 Enviando dados para atualização:', updateData);

      await onUpdate(risk.id, updateData);

      toast.success('✅ Análise de risco salva com sucesso no banco de dados!');
      setIsAnalysisMode(false);

      // Atualizar estado local para refletir as mudanças
      setGeneralData(prev => ({
        ...prev,
        probability: updateData.probability,
        impact: updateData.impact,
        riskLevel: updateData.riskLevel
      }));

    } catch (error: any) {
      console.error('❌ Erro ao salvar análise:', error);
      toast.error(`Erro ao salvar análise de risco: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const resetAnalysis = () => {
    setAnalysisData(null);
    setProbabilityAnswers([]);
    setImpactAnswers([]);
    setGutAnalysis(null);
    setShowMatrix(false);
    setIsAnalysisMode(false);
    setCurrentQuestionIndex(0);
    setCurrentAssessmentType('probability');
  };

  // Memoize risk level calculation to avoid re-running logic on every render
  const currentRiskLevel = useMemo(() => {
    return calculateRiskLevel();
  }, [
    analysisData,
    generalData.riskLevel,
    generalData.probability,
    generalData.impact
  ]);
  const showAcceptanceSection = generalData.treatmentType === 'Aceitar';
  const showActionSection = generalData.treatmentType !== 'Aceitar';

  // Quando o tipo de tratamento mudar, ajustar a seção ativa
  useEffect(() => {
    if (showAcceptanceSection && activeSection === 'action') {
      setActiveSection('acceptance');
    } else if (showActionSection && activeSection === 'acceptance') {
      setActiveSection('action');
    }
  }, [showAcceptanceSection, showActionSection, activeSection]);

  return (
    <Card className={cn(
      "rounded-lg border text-card-foreground w-full transition-all duration-300 overflow-hidden cursor-pointer",
      isExpanded
        ? "shadow-lg border-primary/30"
        : "hover:bg-gray-50/50 dark:hover:bg-gray-800/50 border-border"
    )}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              {/* Left Section */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {isExpanded ?
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" /> :
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                }

                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-sm font-semibold truncate">{risk.name}</CardTitle>
                    <Badge className={getRiskLevelColor(currentRiskLevel)}>
                      {(() => {
                        console.log('🏷️ Badge Header - currentRiskLevel:', currentRiskLevel);
                        return currentRiskLevel;
                      })()}
                    </Badge>
                    <Badge className={getStatusColor(risk.status)}>
                      {risk.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{risk.category}</span>
                    <span>•</span>
                    <span className="truncate">Score: {generalData.probability * generalData.impact}</span>
                    {risk.owner && (
                      <>
                        <span>•</span>
                        <span className="truncate">Proprietário: {risk.owner}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Center Section - Treatment */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {isEditingGeneral ? generalData.treatmentType : risk.treatmentType}
                </Badge>
              </div>

              {/* Right Section */}
              <div className="text-right flex-shrink-0">
                {risk.dueDate && (
                  <div className="text-xs text-muted-foreground">
                    <div>Vencimento:</div>
                    <div className="font-medium">
                      {format(risk.dueDate, "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-6">
              {/* Navigation Tabs */}
              <Tabs value={activeSection} onValueChange={(value) => setActiveSection(value as any)} className="w-full">
                <TabsList className={cn(
                  "grid w-full",
                  showActionSection && showAcceptanceSection ? "grid-cols-2 lg:grid-cols-5" :
                    showActionSection || showAcceptanceSection ? "grid-cols-2 lg:grid-cols-4" :
                      "grid-cols-2 lg:grid-cols-3"
                )}>
                  <TabsTrigger value="general" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm px-2 lg:px-3">
                    <Shield className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                    <span className="hidden sm:inline truncate">Informações</span>
                    <span className="sm:hidden">Info</span>
                  </TabsTrigger>

                  <TabsTrigger value="analysis" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm px-2 lg:px-3">
                    <BarChart3 className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                    <span className="hidden sm:inline truncate">Análise</span>
                    <span className="sm:hidden">Análise</span>
                  </TabsTrigger>

                  {showActionSection && (
                    <TabsTrigger value="action" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm px-2 lg:px-3">
                      <Target className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                      <span className="hidden sm:inline truncate">Plano de Ação</span>
                      <span className="sm:hidden">Plano</span>
                    </TabsTrigger>
                  )}

                  {showAcceptanceSection && (
                    <TabsTrigger value="acceptance" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm px-2 lg:px-3">
                      <FileText className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                      <span className="hidden sm:inline truncate">Carta de Risco</span>
                      <span className="sm:hidden">Carta</span>
                    </TabsTrigger>
                  )}

                  <TabsTrigger value="communication" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm px-2 lg:px-3">
                    <Mail className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                    <span className="hidden sm:inline truncate">Comunicação</span>
                    <span className="sm:hidden">Comunic.</span>
                  </TabsTrigger>
                </TabsList>

                {/* Section Content */}
                {/* 1. INFORMAÇÕES GERAIS */}
                <TabsContent value="general" className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-muted-foreground">INFORMAÇÕES GERAIS</h4>
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingGeneral(!isEditingGeneral)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {isEditingGeneral ? 'Cancelar' : 'Editar'}
                      </Button>
                    )}
                  </div>

                  {isEditingGeneral ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="name">Nome do Risco</Label>
                        <Input
                          id="name"
                          value={generalData.name}
                          onChange={(e) => setGeneralData({ ...generalData, name: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="category">Tipo do Risco</Label>
                        <Select
                          value={generalData.category}
                          onValueChange={(value) => setGeneralData({ ...generalData, category: value as RiskCategory })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(RISK_CATEGORIES).map(([key, description]) => (
                              <SelectItem key={key} value={key}>
                                {key}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="treatmentType">Tipo de Tratamento</Label>
                        <Select
                          value={generalData.treatmentType}
                          onValueChange={(value) => setGeneralData({ ...generalData, treatmentType: value as TreatmentType })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(TREATMENT_TYPES).map(([key, description]) => (
                              <SelectItem key={key} value={key} title={description}>
                                {key}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="probability">Probabilidade (1-5)</Label>
                        <Input
                          id="probability"
                          type="number"
                          min="1"
                          max="5"
                          value={generalData.probability}
                          onChange={(e) => setGeneralData({ ...generalData, probability: parseInt(e.target.value) })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="impact">Impacto (1-5)</Label>
                        <Input
                          id="impact"
                          type="number"
                          min="1"
                          max="5"
                          value={generalData.impact}
                          onChange={(e) => setGeneralData({ ...generalData, impact: parseInt(e.target.value) })}
                        />
                      </div>

                      <div className="col-span-2">
                        <Label htmlFor="description">Detalhes Técnicos do Risco</Label>
                        <Textarea
                          id="description"
                          value={generalData.description}
                          onChange={(e) => setGeneralData({ ...generalData, description: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <div className="col-span-2">
                        <Label htmlFor="executiveSummary">Sumário Executivo do Risco</Label>
                        <Textarea
                          id="executiveSummary"
                          value={generalData.executiveSummary}
                          onChange={(e) => setGeneralData({ ...generalData, executiveSummary: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <div className="col-span-2 bg-muted/50 p-4 rounded-lg">
                        <Label className="text-sm font-medium">Nível de Risco Calculado</Label>
                        <div className="mt-2">
                          <Badge className={getRiskLevelColor(currentRiskLevel)}>
                            {(() => {
                              console.log('🏷️ Badge Edição - currentRiskLevel:', currentRiskLevel);
                              return currentRiskLevel;
                            })()}
                          </Badge>
                          <span className="ml-2 text-sm text-muted-foreground">
                            (Score: {generalData.probability * generalData.impact})
                          </span>
                        </div>
                      </div>

                      <div className="col-span-2 flex gap-2">
                        <Button onClick={handleSaveGeneral} disabled={isUpdating}>
                          Salvar Alterações
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Nome:</span> {risk.name}
                      </div>
                      <div>
                        <span className="font-medium">Categoria:</span> {risk.category}
                      </div>
                      <div>
                        <span className="font-medium">Tratamento:</span> {risk.treatmentType}
                      </div>
                      <div>
                        <span className="font-medium">Nível:</span>
                        <Badge className={getRiskLevelColor(currentRiskLevel)}>
                          {(() => {
                            console.log('🏷️ Badge Visualização - currentRiskLevel:', currentRiskLevel);
                            console.log('🏷️ Badge Visualização - score:', generalData.probability * generalData.impact);
                            return `${currentRiskLevel} (Score: ${generalData.probability * generalData.impact})`;
                          })()}
                        </Badge>
                        {analysisData?.qualitativeRiskLevel && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (Via Análise Estruturada)
                          </span>
                        )}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Descrição:</span> {risk.description || 'Não informado'}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Sumário Executivo:</span> {risk.executiveSummary || 'Não informado'}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* 2. ANÁLISE DE RISCO */}
                <TabsContent value="analysis" className="space-y-6 mt-6">
                  <h4 className="text-lg font-medium text-muted-foreground">ANÁLISE ESTRUTURADA DE RISCO</h4>

                  {!isAnalysisMode ? (
                    // Tela inicial - seleção de tipo e resultados anteriores
                    <div className="space-y-4">
                      {/* Matriz GUT - aparece após análise principal mas fora do modo questão */}
                      {showMatrix && analysisData && !analysisData.gutAnalysis && !isAnalysisMode && (
                        <GUTMatrixSection
                          onComplete={handleGUTAnalysis}
                          onSkip={() => saveAnalysis()}
                        />
                      )}

                      {analysisData ? (
                        // Mostrar análise existente
                        <div className="space-y-4">
                          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-semibold text-green-800 dark:text-green-200">Análise Concluída</h5>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setIsAnalysisMode(true)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Refazer
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={resetAnalysis}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Limpar
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                <div className="text-sm text-muted-foreground">Tipo de Risco</div>
                                <div className="font-medium">{analysisData.riskType}</div>
                              </div>
                              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                <div className="text-sm text-muted-foreground">Probabilidade</div>
                                <div className="font-medium">{analysisData.probabilityScore?.toFixed(1) || '0.0'}/5</div>
                              </div>
                              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                <div className="text-sm text-muted-foreground">Impacto</div>
                                <div className="font-medium">{analysisData.impactScore?.toFixed(1) || '0.0'}/5</div>
                              </div>
                            </div>

                            <div className="mt-4">
                              <Badge className={`text-base px-3 py-1 ${getRiskLevelColor(analysisData.qualitativeRiskLevel)}`}>
                                {analysisData.qualitativeRiskLevel}
                              </Badge>
                            </div>

                            {analysisData.gutAnalysis && (
                              <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-700">
                                <h6 className="font-medium mb-2">Matriz GUT</h6>
                                <div className="grid grid-cols-4 gap-3 text-sm">
                                  <div>Gravidade: <span className="font-medium">{analysisData.gutAnalysis.gravity}</span></div>
                                  <div>Urgência: <span className="font-medium">{analysisData.gutAnalysis.urgency}</span></div>
                                  <div>Tendência: <span className="font-medium">{analysisData.gutAnalysis.tendency}</span></div>
                                  <div>
                                    Prioridade: <Badge variant="outline" className="ml-1">{analysisData.gutAnalysis.priority}</Badge>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Matriz Visual */}
                          <RiskMatrix
                            probabilityScore={analysisData.probabilityScore}
                            impactScore={analysisData.impactScore}
                            matrixSize={analysisData.matrixSize}
                            qualitativeLevel={analysisData.qualitativeRiskLevel}
                          />
                        </div>
                      ) : (
                        // Tela para iniciar nova análise
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="text-center mb-4">
                            <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                            <h5 className="text-lg font-semibold mb-2">Iniciar Análise de Risco</h5>
                            <p className="text-muted-foreground mb-4">
                              Realize uma análise estruturada para avaliar este risco com precisão
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="riskType">Selecione o Tipo de Risco</Label>
                              <Select
                                value={selectedRiskType}
                                onValueChange={(value) => setSelectedRiskType(value as RiskAnalysisType)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Técnico">Técnico</SelectItem>
                                  <SelectItem value="Fornecedor">Fornecedor</SelectItem>
                                  <SelectItem value="Processo">Processo</SelectItem>
                                  <SelectItem value="Incidente">Incidente</SelectItem>
                                  <SelectItem value="Estratégico">Estratégico</SelectItem>
                                  <SelectItem value="Operacional">Operacional</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="matrixSize">Matriz de Risco (Configurada pela Organização)</Label>
                              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border">
                                <Target className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{matrixSize}</span>
                                <span className="text-xs text-muted-foreground">
                                  (Definido nas configurações da tenant)
                                </span>
                              </div>
                            </div>

                            <Button
                              onClick={() => handleStartAnalysis(selectedRiskType)}
                              className="w-full"
                            >
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Iniciar Análise
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Modo de análise - questões
                    <RiskAssessmentQuestions
                      riskType={selectedRiskType}
                      currentQuestionIndex={currentQuestionIndex}
                      currentAssessmentType={currentAssessmentType}
                      onAnswer={handleQuestionAnswer}
                      probabilityAnswers={probabilityAnswers}
                      impactAnswers={impactAnswers}
                      onCancel={() => setIsAnalysisMode(false)}
                    />
                  )}

                  {/* Botões de ação */}
                  {analysisData && analysisData.gutAnalysis && (
                    <div className="flex gap-2 pt-4">
                      <Button onClick={saveAnalysis}>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Análise
                      </Button>
                      <Button variant="outline" onClick={resetAnalysis}>
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* 3. PLANO DE AÇÃO (ATUALIZADO) */}
                <TabsContent value="action" className="space-y-4 mt-6">
                  <h4 className="text-lg font-medium text-muted-foreground">PLANO DE AÇÃO</h4>

                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800 dark:text-blue-200">
                        Estratégia de Tratamento: {generalData.treatmentType}
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {TREATMENT_TYPES[generalData.treatmentType]}
                    </p>
                  </div>

                  {/* Adicionar Nova Atividade */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <h5 className="font-medium">Adicionar Nova Atividade</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Nome da Atividade</Label>
                        <Input
                          value={newActivity.name}
                          onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                          placeholder="Ex: Implementar controle de acesso"
                        />
                      </div>
                      <div>
                        <Label>Responsável</Label>
                        <Input
                          value={newActivity.responsible}
                          onChange={(e) => setNewActivity({ ...newActivity, responsible: e.target.value })}
                          placeholder="Nome do responsável"
                        />
                      </div>
                      <div>
                        <Label>Prazo</Label>
                        <Input
                          type="date"
                          value={newActivity.dueDate}
                          onChange={(e) => setNewActivity({ ...newActivity, dueDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Detalhes da Atividade</Label>
                        <Textarea
                          value={newActivity.details}
                          onChange={(e) => setNewActivity({ ...newActivity, details: e.target.value })}
                          placeholder="Descreva os detalhes da atividade..."
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <div>
                          <Label>Prioridade</Label>
                          <Select
                            value={newActivity.priority}
                            onValueChange={(value) => setNewActivity({ ...newActivity, priority: value as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Baixa">Baixa</SelectItem>
                              <SelectItem value="Média">Média</SelectItem>
                              <SelectItem value="Alta">Alta</SelectItem>
                              <SelectItem value="Crítica">Crítica</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleAddActivity} className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Atividade
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Atividades com Abas */}
                  <Tabs defaultValue="pending" className="w-full mt-4">
                    <TabsList className="mb-4 bg-muted">
                      <TabsTrigger value="pending" className="data-[state=active]:bg-background">
                        Em Aberto ({activities.filter(a => a.analystValidationStatus !== 'approved' && a.status !== 'Concluído').length})
                      </TabsTrigger>
                      <TabsTrigger value="completed" className="data-[state=active]:bg-background">
                        Concluídos ({activities.filter(a => a.analystValidationStatus === 'approved' || a.status === 'Concluído').length})
                      </TabsTrigger>
                    </TabsList>

                    {['pending', 'completed'].map(tab => {
                      const plansInTab = activities.filter(ap =>
                        tab === 'completed'
                          ? (ap.analystValidationStatus === 'approved' || ap.status === 'Concluído')
                          : (ap.analystValidationStatus !== 'approved' && ap.status !== 'Concluído')
                      );

                      return (
                        <TabsContent key={tab} value={tab} className="space-y-4 m-0 outline-none">
                          {plansInTab.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">Nenhuma atividade nesta categoria.</p>
                          ) : plansInTab.map((activity) => (
                            <div key={activity.id} className="p-4 rounded-lg border border-border bg-card hover:border-blue-600/30 transition-colors">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap gap-2 mb-1">
                                    <Badge className={getActivityStatusColor(activity.status)}>
                                      {activity.status}
                                    </Badge>
                                    {activity.analystValidationStatus === 'approved' && (
                                      <Badge variant="outline" className="text-xs border-emerald-500/40 text-emerald-600 bg-emerald-500/10">✅ Validado</Badge>
                                    )}
                                  </div>
                                  <p className="font-semibold text-sm text-foreground">{activity.name}</p>
                                  {activity.details && <p className="text-xs text-muted-foreground mt-1">{activity.details}</p>}
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Responsável: <span className="font-medium">{activity.responsible}</span> |
                                    Prazo: <span className="font-medium">{activity.dueDate ? format(activity.dueDate, 'dd/MM/yyyy') : '-'}</span>
                                  </p>

                                  {/* Sub-atividades Render */}
                                  {activity.subActivities && activity.subActivities.length > 0 && (
                                    <div className="mt-3 space-y-1.5 p-3 rounded-md bg-muted/20 border border-border">
                                      <p className="text-xs font-semibold text-muted-foreground uppercase">Sub-atividades</p>
                                      {activity.subActivities.map((sub, idx) => (
                                        <div key={sub.id || idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <div className={`h-3 w-3 rounded-sm border flex items-center justify-center shrink-0 ${sub.done ? 'bg-emerald-500 border-emerald-500' : 'border-muted-foreground'}`}>
                                            {sub.done && <CheckCircle className="h-2 w-2 text-white" />}
                                          </div>
                                          <span className={sub.done ? 'line-through opacity-70' : ''}>{sub.text}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Evidências Renderização com Preview */}
                                  {activity.evidenceUrl && (
                                    <div className="mt-3 flex items-center gap-2 bg-muted/30 p-2 rounded border border-border">
                                      <FileText className="h-4 w-4 text-blue-500" />
                                      <span className="text-xs text-muted-foreground flex-1 truncate">{activity.evidenceDescription || 'Evidência Anexada'}</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs text-blue-600 px-2"
                                        onClick={() => setEvidencePreview({ isOpen: true, url: activity.evidenceUrl as string, title: activity.name })}
                                      >
                                        <Eye className="h-3 w-3 mr-1" /> Preview
                                      </Button>
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col items-end gap-2 shrink-0">
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost" size="icon" title="Excluir"
                                      className="h-7 w-7 text-red-600"
                                      onClick={() => handleRemoveActivity(activity.id)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                  {activity.analystValidationStatus !== 'approved' && (
                                    <>
                                      <Select
                                        value={activity.status}
                                        onValueChange={v => handleUpdateActivity(activity.id, { status: v as ActivityStatus })}
                                      >
                                        <SelectTrigger className="h-7 text-xs w-[140px]">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="TBD">⏳ Pendente</SelectItem>
                                          <SelectItem value="Em Andamento">🔄 Em Andamento</SelectItem>
                                          <SelectItem value="Concluído">✅ Concluído</SelectItem>
                                          <SelectItem value="Aguardando">⏱️ Aguardando</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Button
                                        variant="default"
                                        size="sm"
                                        className="h-7 text-xs w-[140px] bg-emerald-600 hover:bg-emerald-700 text-white"
                                        onClick={() => handleUpdateActivity(activity.id, { analystValidationStatus: 'approved', status: 'Concluído' })}
                                      >
                                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Validar Analista
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                </TabsContent>

                {/* 4. CARTA DE RISCO */}
                <TabsContent value="acceptance" className="space-y-4 mt-6">
                  <h4 className="text-lg font-medium text-muted-foreground">CARTA DE ACEITAÇÃO DE RISCO</h4>

                  <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800 dark:text-yellow-200">
                        Aceitação de Risco
                      </span>
                    </div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Este risco será aceito pela organização. Preencha as informações abaixo para documentar formalmente a decisão.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="justification">Justificativa para Aceitação *</Label>
                      <Textarea
                        id="justification"
                        value={acceptanceData.justification}
                        onChange={(e) => setAcceptanceData({ ...acceptanceData, justification: e.target.value })}
                        placeholder="Descreva por que este risco está sendo aceito..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="compensatingControls">Controles Compensatórios</Label>
                      <Textarea
                        id="compensatingControls"
                        value={acceptanceData.compensatingControls}
                        onChange={(e) => setAcceptanceData({ ...acceptanceData, compensatingControls: e.target.value })}
                        placeholder="Liste os controles que serão implementados para mitigar parcialmente o risco..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="businessJustification">Justificativa de Negócio</Label>
                      <Textarea
                        id="businessJustification"
                        value={acceptanceData.businessJustification}
                        onChange={(e) => setAcceptanceData({ ...acceptanceData, businessJustification: e.target.value })}
                        placeholder="Explique o valor ou necessidade de negócio que justifica aceitar este risco..."
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="approver">Aprovador Responsável *</Label>
                        <Input
                          id="approver"
                          value={acceptanceData.approver}
                          onChange={(e) => setAcceptanceData({ ...acceptanceData, approver: e.target.value })}
                          placeholder="Nome do executivo aprovador"
                        />
                      </div>
                      <div>
                        <Label htmlFor="approverTitle">Cargo do Aprovador</Label>
                        <Input
                          id="approverTitle"
                          value={acceptanceData.approverTitle}
                          onChange={(e) => setAcceptanceData({ ...acceptanceData, approverTitle: e.target.value })}
                          placeholder="Ex: CEO, CTO, CISO"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="reviewConditions">Condições para Revisão</Label>
                      <Textarea
                        id="reviewConditions"
                        value={acceptanceData.reviewConditions}
                        onChange={(e) => setAcceptanceData({ ...acceptanceData, reviewConditions: e.target.value })}
                        placeholder="Defina quando e sob quais condições este risco deve ser revisado..."
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleCreateAcceptanceLetter}>
                        <FileText className="h-4 w-4 mr-2" />
                        Criar Carta de Aceitação
                      </Button>
                      <Button variant="outline" onClick={handleGeneratePDF} disabled={isGenerating}>
                        <Download className="h-4 w-4 mr-2" />
                        {isGenerating ? 'Gerando...' : 'Gerar PDF com Matriz de Risco'}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* 5. COMUNICAÇÃO */}
                <TabsContent value="communication" className="space-y-4 mt-6">
                  <h4 className="text-lg font-medium text-muted-foreground">COMUNICAÇÃO DO RISCO</h4>

                  {/* Adicionar Nova Comunicação */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <h5 className="font-medium">Nova Comunicação</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Nome do Destinatário</Label>
                        <Input
                          value={newCommunication.recipientName}
                          onChange={(e) => setNewCommunication({ ...newCommunication, recipientName: e.target.value })}
                          placeholder="Nome completo"
                        />
                      </div>
                      <div>
                        <Label>E-mail</Label>
                        <Input
                          type="email"
                          value={newCommunication.recipientEmail}
                          onChange={(e) => setNewCommunication({ ...newCommunication, recipientEmail: e.target.value })}
                          placeholder="email@empresa.com"
                        />
                      </div>
                      <div>
                        <Label>Cargo/Função</Label>
                        <Input
                          value={newCommunication.recipientTitle}
                          onChange={(e) => setNewCommunication({ ...newCommunication, recipientTitle: e.target.value })}
                          placeholder="Ex: Gerente de TI"
                        />
                      </div>
                      <div>
                        <Label>Tipo de Comunicação</Label>
                        <Select
                          value={newCommunication.type}
                          onValueChange={(value) => setNewCommunication({ ...newCommunication, type: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Apontamento">Apontamento de Risco</SelectItem>
                            <SelectItem value="Carta de Risco">Carta de Risco</SelectItem>
                            <SelectItem value="Plano de Ação">Plano de Ação</SelectItem>
                            <SelectItem value="Notificação">Notificação</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Assunto</Label>
                      <Input
                        value={newCommunication.subject}
                        onChange={(e) => setNewCommunication({ ...newCommunication, subject: e.target.value })}
                        placeholder="Assunto da comunicação"
                      />
                    </div>
                    <div>
                      <Label>Mensagem</Label>
                      <Textarea
                        value={newCommunication.message}
                        onChange={(e) => setNewCommunication({ ...newCommunication, message: e.target.value })}
                        placeholder="Detalhe a comunicação..."
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newCommunication.isUrgent}
                          onChange={(e) => setNewCommunication({ ...newCommunication, isUrgent: e.target.checked })}
                        />
                        <span className="text-sm">Comunicação urgente</span>
                      </label>
                      <Button onClick={handleAddCommunication}>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Comunicação
                      </Button>
                    </div>
                  </div>

                  {/* Lista de Comunicações */}
                  {communications.length > 0 && (
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Destinatário</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Assunto</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {communications.map((comm) => (
                            <TableRow key={comm.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{comm.recipientName}</p>
                                  <p className="text-xs text-muted-foreground">{comm.recipientEmail}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{comm.type}</Badge>
                              </TableCell>
                              <TableCell>{comm.subject}</TableCell>
                              <TableCell>
                                <Badge className={
                                  comm.respondedAt ? 'bg-green-100 text-green-800' :
                                    comm.sentAt ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                }>
                                  {comm.respondedAt ? 'Respondido' :
                                    comm.sentAt ? 'Enviado' : 'Pendente'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {comm.createdAt ? format(comm.createdAt, 'dd/MM/yyyy HH:mm') : '-'}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Send className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Actions */}
              <Separator />
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Activity className="h-4 w-4 mr-2" />
                    Histórico de Mudanças
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar Dados
                  </Button>
                </div>
                {canDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete?.(risk.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Risco
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Dialog Preview Evidência */}
      <Dialog open={evidencePreview.isOpen} onOpenChange={(open) => setEvidencePreview(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Visualização de Evidência: {evidencePreview.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full relative bg-muted/30 overflow-hidden flex items-center justify-center p-4">
            {evidencePreview.url.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
              <img src={evidencePreview.url} alt="Evidência" className="max-w-full max-h-full object-contain" />
            ) : (
              <iframe src={evidencePreview.url} title="Preview Documento" className="w-full h-full border-0 bg-white" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
});

RiskCard.displayName = 'RiskCard';

export default RiskCard;