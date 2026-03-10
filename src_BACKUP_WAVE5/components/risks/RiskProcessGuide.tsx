import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Search,
  AlertTriangle,
  Brain,
  Target,
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  FileText,
  Users,
  Calendar,
  TrendingUp,
  Zap,
  Settings,
  Plus,
  Edit,
  Trash2,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth} from '@/contexts/AuthContextOptimized';
import { useToast } from '@/hooks/use-toast';
import { GuidedRiskCreation } from './GuidedRiskCreation';

interface RiskProcessStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  actions: {
    id: string;
    title: string;
    description: string;
    action: () => void;
    primary?: boolean;
  }[];
  requirements?: string[];
  outputs?: string[];
}

interface Risk {
  id: string;
  title: string;
  description: string;
  risk_category: string;
  risk_level: string;
  status: string;
  current_step: string;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

interface RiskProcessGuideProps {
  onRiskCreated?: (riskId: string) => void;
}

export const RiskProcessGuide: React.FC<RiskProcessGuideProps> = ({ onRiskCreated }) => {
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('identify');
  const [loading, setLoading] = useState(false);
  const [processSteps, setProcessSteps] = useState<RiskProcessStep[]>([]);
  const [showGuidedCreation, setShowGuidedCreation] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setupProcessSteps();
    fetchRisks();
  }, []);

  const setupProcessSteps = () => {
    const steps: RiskProcessStep[] = [
      {
        id: 'identify',
        title: '1. Identificar',
        description: 'Identificar e registrar novos riscos ou usar templates da biblioteca',
        icon: Search,
        status: 'pending',
        actions: [
          {
            id: 'new_risk',
            title: 'Criar Novo Risco',
            description: 'Registrar um risco identificado manualmente',
            action: () => createNewRisk(),
            primary: true
          },
          {
            id: 'use_template',
            title: 'Usar Template',
            description: 'Selecionar da biblioteca de riscos',
            action: () => useTemplate()
          },
          {
            id: 'import_risk',
            title: 'Importar Risco',
            description: 'Importar de fonte externa',
            action: () => importRisk()
          }
        ],
        requirements: ['Descrição do risco', 'Categoria', 'Fonte de identificação'],
        outputs: ['Risco registrado no sistema', 'ID único atribuído']
      },
      {
        id: 'analyze',
        title: '2. Analisar',
        description: 'Realizar análise qualitativa e/ou quantitativa do risco',
        icon: Brain,
        status: 'pending',
        actions: [
          {
            id: 'qualitative_analysis',
            title: 'Análise Qualitativa',
            description: 'Avaliar probabilidade e impacto qualitativamente',
            action: () => performQualitativeAnalysis(),
            primary: true
          },
          {
            id: 'quantitative_analysis',
            title: 'Análise Quantitativa',
            description: 'Usar Monte Carlo, VaR, simulações',
            action: () => performQuantitativeAnalysis()
          },
          {
            id: 'ai_analysis',
            title: 'Análise com IA',
            description: 'ALEX RISK analisa automaticamente',
            action: () => performAIAnalysis()
          }
        ],
        requirements: ['Risco identificado', 'Dados históricos (opcional)', 'Especialistas disponíveis'],
        outputs: ['Score de risco calculado', 'Relatório de análise', 'Recomendações']
      },
      {
        id: 'evaluate',
        title: '3. Avaliar',
        description: 'Avaliar a significância do risco e priorizar',
        icon: Target,
        status: 'pending',
        actions: [
          {
            id: 'risk_matrix',
            title: 'Matriz de Risco',
            description: 'Posicionar na matriz probabilidade x impacto',
            action: () => evaluateRiskMatrix(),
            primary: true
          },
          {
            id: 'compare_risks',
            title: 'Comparar Riscos',
            description: 'Ranking com outros riscos',
            action: () => compareRisks()
          },
          {
            id: 'set_tolerance',
            title: 'Definir Tolerância',
            description: 'Estabelecer limites aceitáveis',
            action: () => setRiskTolerance()
          }
        ],
        requirements: ['Análise completa', 'Critérios de avaliação', 'Apetite de risco definido'],
        outputs: ['Classificação de prioridade', 'Posição na matriz', 'Recomendação de tratamento']
      },
      {
        id: 'classify',
        title: '4. Classificar',
        description: 'Classificar o risco por categoria, nível e tipo de tratamento',
        icon: FileText,
        status: 'pending',
        actions: [
          {
            id: 'categorize',
            title: 'Categorizar',
            description: 'Definir categoria do risco',
            action: () => categorizeRisk(),
            primary: true
          },
          {
            id: 'set_level',
            title: 'Definir Nível',
            description: 'Muito Baixo a Muito Alto',
            action: () => setRiskLevel()
          },
          {
            id: 'assign_owner',
            title: 'Atribuir Responsável',
            description: 'Definir dono do risco',
            action: () => assignRiskOwner()
          }
        ],
        requirements: ['Avaliação completa', 'Taxonomia de riscos', 'Estrutura organizacional'],
        outputs: ['Risco classificado', 'Responsável definido', 'Nível estabelecido']
      },
      {
        id: 'treat',
        title: '5. Tratar',
        description: 'Definir e implementar estratégia de tratamento',
        icon: Shield,
        status: 'pending',
        actions: [
          {
            id: 'mitigate',
            title: 'Mitigar',
            description: 'Reduzir probabilidade ou impacto',
            action: () => mitigateRisk(),
            primary: true
          },
          {
            id: 'transfer',
            title: 'Transferir',
            description: 'Seguros, contratos, terceirização',
            action: () => transferRisk()
          },
          {
            id: 'accept',
            title: 'Aceitar',
            description: 'Carta de aceitação de risco',
            action: () => acceptRisk()
          },
          {
            id: 'avoid',
            title: 'Evitar',
            description: 'Eliminar a atividade que gera o risco',
            action: () => avoidRisk()
          }
        ],
        requirements: ['Classificação completa', 'Recursos disponíveis', 'Aprovações necessárias'],
        outputs: ['Plano de tratamento', 'Ações definidas', 'Cronograma estabelecido']
      },
      {
        id: 'monitor',
        title: '6. Monitorar',
        description: 'Acompanhar a evolução do risco e efetividade dos controles',
        icon: Eye,
        status: 'pending',
        actions: [
          {
            id: 'set_indicators',
            title: 'Definir KRIs',
            description: 'Key Risk Indicators',
            action: () => setKRIs(),
            primary: true
          },
          {
            id: 'schedule_reviews',
            title: 'Agendar Revisões',
            description: 'Periodicidade de monitoramento',
            action: () => scheduleReviews()
          },
          {
            id: 'track_actions',
            title: 'Acompanhar Ações',
            description: 'Status das ações de tratamento',
            action: () => trackActions()
          }
        ],
        requirements: ['Plano de tratamento', 'Indicadores definidos', 'Responsáveis designados'],
        outputs: ['Dashboard de monitoramento', 'Alertas automáticos', 'Relatórios periódicos']
      },
      {
        id: 'review',
        title: '7. Revisar',
        description: 'Revisar periodicamente e atualizar conforme necessário',
        icon: RotateCcw,
        status: 'pending',
        actions: [
          {
            id: 'periodic_review',
            title: 'Revisão Periódica',
            description: 'Revisão programada do risco',
            action: () => performPeriodicReview(),
            primary: true
          },
          {
            id: 'update_assessment',
            title: 'Atualizar Avaliação',
            description: 'Reavaliar com novas informações',
            action: () => updateAssessment()
          },
          {
            id: 'lessons_learned',
            title: 'Lições Aprendidas',
            description: 'Documentar aprendizados',
            action: () => documentLessons()
          }
        ],
        requirements: ['Dados de monitoramento', 'Mudanças no contexto', 'Feedback dos stakeholders'],
        outputs: ['Risco atualizado', 'Novas ações (se necessário)', 'Documentação atualizada']
      },
      {
        id: 'close',
        title: '8. Encerrar',
        description: 'Encerrar o risco quando não for mais relevante',
        icon: CheckCircle,
        status: 'pending',
        actions: [
          {
            id: 'validate_closure',
            title: 'Validar Encerramento',
            description: 'Confirmar que o risco não existe mais',
            action: () => validateClosure(),
            primary: true
          },
          {
            id: 'document_closure',
            title: 'Documentar',
            description: 'Registrar motivos do encerramento',
            action: () => documentClosure()
          },
          {
            id: 'archive_risk',
            title: 'Arquivar',
            description: 'Mover para arquivo histórico',
            action: () => archiveRisk()
          }
        ],
        requirements: ['Validação de stakeholders', 'Documentação completa', 'Aprovação formal'],
        outputs: ['Risco encerrado', 'Documentação arquivada', 'Lições registradas']
      }
    ];

    setProcessSteps(steps);
  };

  const fetchRisks = async () => {
    try {
      console.log('🔍 Debug fetchRisks - User:', user);
      console.log('🔍 Debug fetchRisks - Tenant ID:', user?.tenant?.id);
      
      // Buscar riscos do tenant do usuário
      const query = supabase
        .from('risk_assessments')
        .select('*')
        .order('updated_at', { ascending: false });
      
      // Temporariamente removendo filtro de tenant para debug
      // if (user?.tenant?.id) {
      //   query = query.eq('tenant_id', user.tenant.id);
      //   console.log('🔍 Aplicando filtro de tenant:', user.tenant.id);
      // } else {
        console.log('⚠️ Debug: Buscando todos os riscos (filtro de tenant desabilitado)');
      // }
      
      const { data, error } = await query;
      
      console.log('📊 Riscos encontrados:', data?.length || 0);
      console.log('📊 Dados dos riscos:', data);

      if (error) throw error;

      const risksWithProgress = data?.map(risk => ({
        ...risk,
        current_step: risk.status === 'open' ? 'identify' : 
                     risk.status === 'in_analysis' ? 'analyze' :
                     risk.status === 'evaluated' ? 'evaluate' :
                     risk.status === 'classified' ? 'classify' :
                     risk.status === 'in_treatment' ? 'treat' :
                     risk.status === 'monitoring' ? 'monitor' :
                     risk.status === 'under_review' ? 'review' :
                     risk.status === 'closed' ? 'close' : 'identify',
        progress_percentage: calculateProgress(risk.status)
      })) || [];

      setRisks(risksWithProgress);
      console.log('✅ Riscos processados e definidos:', risksWithProgress?.length || 0);
    } catch (error: any) {
      console.error('❌ Erro ao carregar riscos:', error);
    }
  };

  const calculateProgress = (status: string): number => {
    const statusMap: Record<string, number> = {
      'open': 12.5,
      'in_analysis': 25,
      'evaluated': 37.5,
      'classified': 50,
      'in_treatment': 62.5,
      'monitoring': 75,
      'under_review': 87.5,
      'closed': 100
    };
    return statusMap[status] || 0;
  };

  // Action implementations
  const createNewRisk = () => {
    setShowGuidedCreation(true);
  };

  const handleRiskCreated = (riskId: string) => {
    setShowGuidedCreation(false);
    fetchRisks();
    
    // Atualizar o processo para mostrar as etapas como concluídas
    updateProcessForCreatedRisk(riskId);
    
    toast({
      title: 'Risco Criado',
      description: 'Risco criado com sucesso! Agora você pode prosseguir com a análise.',
    });
    
    if (onRiskCreated) {
      onRiskCreated(riskId);
    }
  };
  
  const updateProcessForCreatedRisk = async (riskId: string) => {
    try {
      // Buscar o risco criado
      const { data: riskData, error } = await supabase
        .from('risk_assessments')
        .select('*')
        .eq('id', riskId)
        .single();
        
      if (error) throw error;
      
      // Se o risco foi criado pelo ALEX RISK (tem analysis_data com ai_generated)
      if (riskData?.analysis_data?.ai_generated) {
        // Atualizar status para mostrar que várias etapas foram concluídas
        const { error: updateError } = await supabase
          .from('risk_assessments')
          .update({
            status: 'classified', // Pular para classificado pois ALEX RISK já fez análise
            updated_at: new Date().toISOString()
          })
          .eq('id', riskId);
          
        if (updateError) throw updateError;
        
        // Atualizar a lista de riscos
        await fetchRisks();
        
        // Selecionar automaticamente o risco criado
        const updatedRisk = {
          ...riskData,
          status: 'classified',
          current_step: 'classify',
          progress_percentage: 50
        };
        setSelectedRisk(updatedRisk);
        
        toast({
          title: '🎯 ALEX RISK Concluído',
          description: 'Processo avançado automaticamente até a etapa de Classificação!',
        });
      } else {
        // Para riscos criados manualmente, apenas selecionar
        setSelectedRisk({
          ...riskData,
          current_step: 'identify',
          progress_percentage: 12.5
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar processo:', error);
    }
  };

  const useTemplate = () => {
    toast({
      title: 'Biblioteca de Templates',
      description: 'Abrindo biblioteca de riscos...',
    });
    // Implementar abertura da biblioteca
  };

  const importRisk = () => {
    toast({
      title: 'Importar Risco',
      description: 'Funcionalidade de importação em desenvolvimento...',
    });
  };

  const performQualitativeAnalysis = () => {
    if (!selectedRisk) {
      toast({
        title: 'Selecione um Risco',
        description: 'Escolha um risco para analisar',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Análise Qualitativa',
      description: `Iniciando análise do risco: ${selectedRisk.title}`,
    });
  };

  const performQuantitativeAnalysis = () => {
    if (!selectedRisk) {
      toast({
        title: 'Selecione um Risco',
        description: 'Escolha um risco para analisar',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Análise Quantitativa',
      description: 'Abrindo ferramentas avançadas de análise...',
    });
  };

  const performAIAnalysis = () => {
    if (!selectedRisk) {
      toast({
        title: 'Selecione um Risco',
        description: 'Escolha um risco para analisar',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'ALEX RISK',
      description: 'Iniciando análise inteligente com IA...',
    });
  };

  const evaluateRiskMatrix = () => {
    if (!selectedRisk) {
      toast({
        title: 'Selecione um Risco',
        description: 'Escolha um risco para avaliar',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Matriz de Risco',
      description: 'Abrindo matriz de probabilidade x impacto...',
    });
  };

  const compareRisks = () => {
    toast({
      title: 'Comparação de Riscos',
      description: 'Abrindo ferramenta de comparação...',
    });
  };

  const setRiskTolerance = () => {
    toast({
      title: 'Tolerância ao Risco',
      description: 'Definindo limites de tolerância...',
    });
  };

  const categorizeRisk = () => {
    if (!selectedRisk) {
      toast({
        title: 'Selecione um Risco',
        description: 'Escolha um risco para classificar',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Categorização',
      description: 'Definindo categoria do risco...',
    });
  };

  const setRiskLevel = () => {
    if (!selectedRisk) {
      toast({
        title: 'Selecione um Risco',
        description: 'Escolha um risco para definir nível',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Nível de Risco',
      description: 'Definindo nível de criticidade...',
    });
  };

  const assignRiskOwner = () => {
    if (!selectedRisk) {
      toast({
        title: 'Selecione um Risco',
        description: 'Escolha um risco para atribuir responsável',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Responsável pelo Risco',
      description: 'Atribuindo dono do risco...',
    });
  };

  const mitigateRisk = () => {
    if (!selectedRisk) {
      toast({
        title: 'Selecione um Risco',
        description: 'Escolha um risco para mitigar',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Mitigação de Risco',
      description: 'Criando plano de mitigação...',
    });
  };

  const transferRisk = () => {
    if (!selectedRisk) {
      toast({
        title: 'Selecione um Risco',
        description: 'Escolha um risco para transferir',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Transferência de Risco',
      description: 'Configurando transferência (seguro, contrato)...',
    });
  };

  const acceptRisk = () => {
    if (!selectedRisk) {
      toast({
        title: 'Selecione um Risco',
        description: 'Escolha um risco para aceitar',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Aceitação de Risco',
      description: 'Abrindo processo de carta de risco...',
    });
  };

  const avoidRisk = () => {
    if (!selectedRisk) {
      toast({
        title: 'Selecione um Risco',
        description: 'Escolha um risco para evitar',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Evitar Risco',
      description: 'Planejando eliminação da atividade...',
    });
  };

  const setKRIs = () => {
    if (!selectedRisk) {
      toast({
        title: 'Selecione um Risco',
        description: 'Escolha um risco para definir KRIs',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Key Risk Indicators',
      description: 'Definindo indicadores de monitoramento...',
    });
  };

  const scheduleReviews = () => {
    if (!selectedRisk) {
      toast({
        title: 'Selecione um Risco',
        description: 'Escolha um risco para agendar revisões',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Agendamento de Revisões',
      description: 'Configurando periodicidade de revisão...',
    });
  };

  const trackActions = () => {
    if (!selectedRisk) {
      toast({
        title: 'Selecione um Risco',
        description: 'Escolha um risco para acompanhar ações',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Acompanhamento de Ações',
      description: 'Abrindo painel de ações...',
    });
  };

  const performPeriodicReview = () => {
    if (!selectedRisk) {
      toast({
        title: 'Selecione um Risco',
        description: 'Escolha um risco para revisar',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Revisão Periódica',
      description: 'Iniciando revisão programada...',
    });
  };

  const updateAssessment = () => {
    if (!selectedRisk) {
      toast({
        title: 'Selecione um Risco',
        description: 'Escolha um risco para atualizar',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Atualização de Avaliação',
      description: 'Reatualizando avaliação do risco...',
    });
  };

  const documentLessons = () => {
    if (!selectedRisk) {
      toast({
        title: 'Selecione um Risco',
        description: 'Escolha um risco para documentar lições',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Lições Aprendidas',
      description: 'Documentando aprendizados...',
    });
  };

  const validateClosure = () => {
    if (!selectedRisk) {
      toast({
        title: 'Selecione um Risco',
        description: 'Escolha um risco para encerrar',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Validação de Encerramento',
      description: 'Validando condições para encerramento...',
    });
  };

  const documentClosure = () => {
    if (!selectedRisk) {
      toast({
        title: 'Selecione um Risco',
        description: 'Escolha um risco para documentar encerramento',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Documentação de Encerramento',
      description: 'Registrando motivos do encerramento...',
    });
  };

  const archiveRisk = () => {
    if (!selectedRisk) {
      toast({
        title: 'Selecione um Risco',
        description: 'Escolha um risco para arquivar',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Arquivamento',
      description: 'Movendo risco para arquivo histórico...',
    });
  };

  const getStepStatus = (stepId: string): 'pending' | 'in_progress' | 'completed' | 'blocked' => {
    if (!selectedRisk) return 'pending';
    
    const stepOrder = ['identify', 'analyze', 'evaluate', 'classify', 'treat', 'monitor', 'review', 'close'];
    const currentStepIndex = stepOrder.indexOf(selectedRisk.current_step);
    const stepIndex = stepOrder.indexOf(stepId);
    
    // Se o risco foi criado pelo ALEX RISK, marcar as primeiras etapas como concluídas
    const isAIGenerated = selectedRisk.analysis_data?.ai_generated;
    
    if (isAIGenerated) {
      // ALEX RISK completa automaticamente: Identificar, Analisar, Avaliar
      if (['identify', 'analyze', 'evaluate'].includes(stepId) && stepIndex <= currentStepIndex) {
        return 'completed';
      }
    }
    
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'in_progress';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-primary/10 text-primary border-primary/20';
      case 'in_progress': return 'bg-primary/10 text-primary border-primary/20';
      case 'blocked': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return Play;
      case 'blocked': return XCircle;
      default: return Pause;
    }
  };

  // Show guided creation if requested
  if (showGuidedCreation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2 mb-4">
          <Button variant="outline" onClick={() => setShowGuidedCreation(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Processo
          </Button>
        </div>
        <GuidedRiskCreation onComplete={handleRiskCreated} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate flex items-center space-x-2">
            <Target className="h-8 w-8 text-primary" />
            <span>Processo de Gestão de Riscos</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Guia passo-a-passo para identificar, analisar, tratar e monitorar riscos corporativos
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Guia Completo
          </Button>
          
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configurar Processo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Selecionar Risco</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  onClick={createNewRisk}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Novo Risco
                </Button>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Riscos Existentes:</h4>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {risks.map((risk) => (
                      <div
                        key={risk.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedRisk?.id === risk.id 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedRisk(risk)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-sm truncate">{risk.title}</h5>
                          <Badge variant="outline" className="text-xs">
                            {risk.risk_level}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {risk.risk_category}
                        </p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progresso:</span>
                            <span>{risk.progress_percentage}%</span>
                          </div>
                          <Progress value={risk.progress_percentage} className="h-1" />
                        </div>
                      </div>
                    ))}
                    
                    {risks.length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">
                          Nenhum risco encontrado
                        </p>
                        <Button 
                          size="sm" 
                          className="mt-2"
                          onClick={createNewRisk}
                        >
                          Criar Primeiro Risco
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Process Steps */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Processo de Gestão de Riscos</span>
                </div>
                {selectedRisk && (
                  <Badge variant="outline">
                    {selectedRisk.title}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {processSteps.map((step, index) => {
                  const Icon = step.icon;
                  const status = getStepStatus(step.id);
                  const StatusIcon = getStatusIcon(status);
                  
                  return (
                    <div key={step.id} className="relative">
                      {/* Connector Line */}
                      {index < processSteps.length - 1 && (
                        <div className="absolute left-6 top-12 w-0.5 h-16 bg-border"></div>
                      )}
                      
                      <div className={`p-4 border rounded-lg ${
                        status === 'in_progress' ? 'border-primary bg-primary/5' :
                        status === 'completed' ? 'border-primary bg-primary/5' :
                        'border-border'
                      }`}>
                        <div className="flex items-start space-x-4">
                          {/* Step Icon */}
                          <div className={`p-2 rounded-lg ${
                            status === 'completed' ? 'bg-primary/10 text-primary' :
                            status === 'in_progress' ? 'bg-primary/10 text-primary' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            {/* Step Header */}
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold">{step.title}</h3>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={getStatusColor(status)}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {status === 'in_progress' ? 'Em Andamento' :
                                   status === 'completed' ? 'Concluído' :
                                   status === 'blocked' ? 'Bloqueado' : 'Pendente'}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Requirements & Outputs */}
                            {(step.requirements || step.outputs) && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                {step.requirements && (
                                  <div>
                                    <h5 className="font-medium mb-1">Requisitos:</h5>
                                    <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                                      {step.requirements.map((req, i) => (
                                        <li key={i}>{req}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {step.outputs && (
                                  <div>
                                    <h5 className="font-medium mb-1">Resultados:</h5>
                                    <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                                      {step.outputs.map((output, i) => (
                                        <li key={i}>{output}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Actions */}
                            <div className="flex flex-wrap gap-2">
                              {step.actions.map((action) => (
                                <Button
                                  key={action.id}
                                  size="sm"
                                  variant={action.primary ? "default" : "outline"}
                                  onClick={action.action}
                                  disabled={status === 'blocked'}
                                >
                                  {action.title}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Process Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Visão Geral do Processo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {risks.filter(r => r.current_step === 'identify').length}
              </div>
              <div className="text-sm text-muted-foreground">Identificação</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {risks.filter(r => ['analyze', 'evaluate', 'classify'].includes(r.current_step)).length}
              </div>
              <div className="text-sm text-muted-foreground">Análise</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {risks.filter(r => r.current_step === 'treat').length}
              </div>
              <div className="text-sm text-muted-foreground">Tratamento</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {risks.filter(r => ['monitor', 'review'].includes(r.current_step)).length}
              </div>
              <div className="text-sm text-muted-foreground">Monitoramento</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};