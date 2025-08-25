import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { EditableChecklistManager } from '../shared/EditableChecklistManager';
import { RiskAssessmentManager } from '../shared/RiskAssessmentManager';
import { ContractReviewManager } from '../shared/ContractReviewManager';
import { useVendorRiskManagement } from '@/hooks/useVendorRiskManagement';
import { 
  Scale,
  Settings,
  Umbrella,
  Gavel,
  GraduationCap,
  Building,
  Users,
  FileText,
  Shield,
  Award,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Brain,
  Zap,
  Network,
  Download,
  Mail,
  Save,
  Plus,
  User,
  FileCheck,
  Target,
  ArrowRight,
  ArrowLeft,
  Star,
  TrendingUp,
  Activity,
  Calendar,
  DollarSign,
  Globe
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Phone,
  MapPin,
  Edit,
  X,
  Upload
} from 'lucide-react';

interface VendorOnboardingStep {
  id: string;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
  automated: boolean;
  aiAssisted: boolean;
  order: number;
  category: 'basic_info' | 'due_diligence' | 'assessment' | 'approval' | 'integration';
}

interface VendorRegistry {
  id?: string;
  name: string;
  legal_name: string;
  tax_id: string;
  registration_number?: string;
  website?: string;
  description?: string;
  business_category: string;
  vendor_type: 'strategic' | 'operational' | 'transactional' | 'critical';
  criticality_level: 'low' | 'medium' | 'high' | 'critical';
  annual_spend: number;
  contract_value: number;
  contract_start_date?: string;
  contract_end_date?: string;
  contract_status: 'active' | 'expired' | 'terminated' | 'draft' | 'under_review';
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  status: 'active' | 'inactive' | 'suspended' | 'onboarding' | 'offboarding';
  onboarding_status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  onboarding_progress: number;
  alex_analysis?: any;
}

interface VendorOnboardingWorkflowProps {
  vendorId?: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (vendor: VendorRegistry) => void;
}

export const VendorOnboardingWorkflow: React.FC<VendorOnboardingWorkflowProps> = ({
  vendorId,
  isOpen,
  onClose,
  onComplete
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [vendorData, setVendorData] = useState<VendorRegistry>({
    name: '',
    legal_name: '',
    tax_id: '',
    business_category: '',
    vendor_type: 'operational',
    criticality_level: 'medium',
    annual_spend: 0,
    contract_value: 0,
    contract_status: 'draft',
    primary_contact_name: '',
    primary_contact_email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'Brasil'
    },
    status: 'onboarding',
    onboarding_status: 'in_progress',
    onboarding_progress: 0
  });

  const [dueDiligenceComplete, setDueDiligenceComplete] = useState(false);
  const [riskAssessmentComplete, setRiskAssessmentComplete] = useState(false);
  const [contractReviewComplete, setContractReviewComplete] = useState(false);
  const [riskScore, setRiskScore] = useState<number>(0);
  const [cnpjError, setCnpjError] = useState<string>('');
  
  const [onboardingSteps, setOnboardingSteps] = useState<VendorOnboardingStep[]>([
    {
      id: 'basic_info',
      title: 'Dados Gerais',
      description: 'Dados fundamentais do fornecedor e contato principal',
      required: true,
      completed: false,
      automated: false,
      aiAssisted: true,
      order: 1,
      category: 'basic_info'
    },
    {
      id: 'due_diligence',
      title: 'Due Diligence',
      description: 'Checklist editável para verificação de documentos e validação regulatória',
      required: true,
      completed: false,
      automated: true,
      aiAssisted: true,
      order: 2,
      category: 'due_diligence'
    },
    {
      id: 'risk_assessment',
      title: 'Assessment',
      description: 'Avaliação completa de riscos com framework específico',
      required: true,
      completed: false,
      automated: false,
      aiAssisted: true,
      order: 3,
      category: 'assessment'
    },
    {
      id: 'contract_review',
      title: 'Contrato',
      description: 'Análise de termos contratuais e SLAs',
      required: true,
      completed: false,
      automated: false,
      aiAssisted: true,
      order: 4,
      category: 'approval'
    },
    {
      id: 'final_approval',
      title: 'Revisão Final',
      description: 'Revisão final e documentação do processo',
      required: true,
      completed: false,
      automated: false,
      aiAssisted: false,
      order: 5,
      category: 'approval'
    }
  ]);

  // Load existing vendor data if editing
  useEffect(() => {
    if (vendorId) {
      loadVendorData(vendorId);
    }
  }, [vendorId]);

  const loadVendorData = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('vendor_registry')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setVendorData(data);
        updateStepsBasedOnData(data);
      }
    } catch (error) {
      console.error('Erro ao carregar fornecedor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do fornecedor",
        variant: "destructive"
      });
    }
  };

  // Update steps completion based on vendor data
  const updateStepsBasedOnData = (vendor: VendorRegistry) => {
    setOnboardingSteps(prev => prev.map(step => {
      let completed = false;
      
      switch (step.id) {
        case 'basic_info':
          completed = !!(vendor.name && vendor.legal_name && vendor.tax_id && 
                         vendor.primary_contact_name && vendor.primary_contact_email);
          break;
        case 'due_diligence':
          completed = vendor.onboarding_progress >= 40;
          break;
        case 'risk_assessment':
          completed = vendor.onboarding_progress >= 60 || riskAssessmentComplete;
          break;
        case 'contract_review':
          completed = vendor.onboarding_progress >= 80 || contractReviewComplete;
          break;
        case 'final_approval':
          completed = vendor.onboarding_status === 'completed';
          break;

      }
      
      return { ...step, completed };
    }));
  };


  // Calculate overall progress (5 etapas)
  const calculateProgress = () => {
    const completedSteps = onboardingSteps.filter(step => step.completed).length;
    const totalSteps = 5; // Agora temos exatamente 5 etapas
    return Math.round((completedSteps / totalSteps) * 100);
  };

  // Save vendor data
  const saveVendorData = async () => {
    console.log('Dados do usuário:', user);
    console.log('TenantId:', user?.tenantId);
    console.log('User ID:', user?.id);
    
    if (!user?.tenantId) {
      console.error('Usuário ou tenant não encontrado:', { user });
      toast({
        title: "Erro de Autenticação",
        description: "Usuário não autenticado ou tenant não identificado",
        variant: "destructive"
      });
      return;
    }

    try {
      const progress = calculateProgress();
      
      // Prepare the data with proper validation
      const dataToSave = {
        name: vendorData.name || '',
        legal_name: vendorData.legal_name || vendorData.name || '',
        tax_id: vendorData.tax_id || '',
        registration_number: vendorData.registration_number || null,
        website: vendorData.website || null,
        description: vendorData.description || null,
        business_category: vendorData.business_category || 'Outros',
        vendor_type: vendorData.vendor_type || 'operational',
        criticality_level: vendorData.criticality_level || 'medium',
        annual_spend: Number(vendorData.annual_spend) || 0,
        contract_value: Number(vendorData.contract_value) || 0,
        contract_start_date: vendorData.contract_start_date || null,
        contract_end_date: vendorData.contract_end_date || null,
        contract_status: vendorData.contract_status || 'draft',
        primary_contact_name: vendorData.primary_contact_name || '',
        primary_contact_email: vendorData.primary_contact_email || '',
        primary_contact_phone: vendorData.primary_contact_phone || null,
        address: {
          street: vendorData.address?.street || '',
          city: vendorData.address?.city || '',
          state: vendorData.address?.state || '',
          zip_code: vendorData.address?.zip_code || '',
          country: vendorData.address?.country || 'Brasil'
        },
        status: vendorData.status || 'onboarding',
        onboarding_status: vendorData.onboarding_status || 'in_progress',
        onboarding_progress: progress,
        tenant_id: user.tenantId,
        alex_analysis: {
          created_by: 'ALEX VENDOR AI',
          last_updated: new Date().toISOString(),
          onboarding_insights: [
            `Fornecedor tipo ${vendorData.vendor_type} com criticidade ${vendorData.criticality_level}`,
            `Valor contratual: R$ ${Number(vendorData.contract_value || 0).toLocaleString()}`,
            `Progresso de onboarding: ${progress}%`,
            riskScore > 0 ? `Score de risco: ${riskScore}%` : 'Assessment de risco pendente'
          ],
          recommendations: generateAlexRecommendations(),
          risk_assessment: {
            score: riskScore,
            status: riskScore >= 70 ? 'approved' : riskScore >= 50 ? 'conditional' : 'rejected',
            completed_at: riskAssessmentComplete ? new Date().toISOString() : null
          }
        },
        created_by: user.id,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      };

      console.log('Dados sendo salvos:', dataToSave);
      console.log('Supabase client:', supabase);
      
      // Test supabase connection
      const { data: testData, error: testError } = await supabase.auth.getUser();
      console.log('Current user:', testData);
      console.log('Auth error:', testError);

      let result;
      if (vendorData.id) {
        // Update existing vendor
        console.log('Updating existing vendor with ID:', vendorData.id);
        const { created_by, created_at, ...updateData } = dataToSave;
        result = await supabase
          .from('vendor_registry')
          .update(updateData)
          .eq('id', vendorData.id)
          .select()
          .single();
      } else {
        // Insert new vendor
        console.log('Inserting new vendor');
        result = await supabase
          .from('vendor_registry')
          .insert(dataToSave)
          .select()
          .single();
      }

      console.log('Resultado da operação:', result);
      console.log('Dados retornados:', result.data);
      console.log('Erro retornado:', result.error);

      if (result.error) {
        console.error('Erro detalhado:', {
          message: result.error.message,
          details: result.error.details,
          hint: result.error.hint,
          code: result.error.code
        });
        throw result.error;
      }

      setVendorData(result.data);
      
      toast({
        title: "Dados Salvos",
        description: "As informações do fornecedor foram salvas com sucesso"
      });

      return result.data;

    } catch (error: any) {
      console.error('Erro ao salvar fornecedor:', error);
      
      let errorMessage = "Não foi possível salvar os dados do fornecedor";
      
      if (error?.message) {
        errorMessage += `: ${error.message}`;
      }
      
      if (error?.details) {
        errorMessage += ` (${error.details})`;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      
      return null;
    }
  };

  // Generate ALEX recommendations based on vendor data
  const generateAlexRecommendations = () => {
    const recommendations: string[] = [];

    // Based on vendor type
    if (vendorData.vendor_type === 'critical') {
      recommendations.push('Fornecedor crítico requer assessment de segurança avançado');
      recommendations.push('Implementar monitoramento contínuo de performance');
      recommendations.push('Estabelecer plano de contingência específico');
    }

    // Based on contract value
    if (vendorData.contract_value > 1000000) {
      recommendations.push('Alto valor contratual - revisar cláusulas de SLA rigorosamente');
      recommendations.push('Considerar auditoria presencial nas instalações do fornecedor');
    }

    // Based on criticality
    if (vendorData.criticality_level === 'high' || vendorData.criticality_level === 'critical') {
      recommendations.push('Criticidade alta - aplicar framework de assessment ISO 27001');
      recommendations.push('Solicitar certificações de segurança atualizadas');
      recommendations.push('Definir métricas de performance específicas');
    }
    
    // Based on risk score
    if (riskScore > 0) {
      if (riskScore >= 80) {
        recommendations.push('Score de risco excelente - fornecedor de baixo risco');
      } else if (riskScore >= 70) {
        recommendations.push('Score de risco adequado - monitoramento padrão recomendado');
      } else if (riskScore >= 50) {
        recommendations.push('Score de risco moderado - implementar controles adicionais');
      } else {
        recommendations.push('Score de risco baixo - revisar criticamente a aprovação');
      }
    }

    return recommendations;
  };

  // Go to next step
  const nextStep = async () => {
    // Validate current step
    if (currentStep === 0 && !validateBasicInfo()) {
      return;
    }
    
    // Validate due diligence completion
    if (currentStep === 1 && !dueDiligenceComplete) {
      toast({
        title: "Due Diligence Incompleta",
        description: "Complete todos os itens obrigatórios do checklist para prosseguir",
        variant: "destructive"
      });
      return;
    }
    
    // Validate risk assessment completion
    if (currentStep === 2 && !riskAssessmentComplete) {
      toast({
        title: "Assessment de Risco Incompleto",
        description: "Complete todas as questões obrigatórias do assessment para prosseguir",
        variant: "destructive"
      });
      return;
    }
    
    // Validate contract review completion
    if (currentStep === 3 && !contractReviewComplete) {
      toast({
        title: "Revisão Contratual Incompleta",
        description: "Complete a análise do contrato para prosseguir",
        variant: "destructive"
      });
      return;
    }

    // Save data before proceeding
    const saved = await saveVendorData();
    if (!saved && currentStep === 0) return;

    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Go to previous step
  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Validate basic info
  const validateBasicInfo = () => {
    const required = [
      { field: 'name', label: 'Nome' },
      { field: 'business_category', label: 'Categoria de Negócio' },
      { field: 'primary_contact_name', label: 'Nome do Contato' },
      { field: 'primary_contact_email', label: 'E-mail do Contato' }
    ];
    
    const missing = required.filter(item => {
      const value = vendorData[item.field as keyof VendorRegistry];
      return !value || (typeof value === 'string' && value.trim() === '');
    });

    if (missing.length > 0) {
      const missingLabels = missing.map(item => item.label).join(', ');
      toast({
        title: "Campos Obrigatórios",
        description: `Preencha todos os campos obrigatórios: ${missingLabels}`,
        variant: "destructive"
      });
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (vendorData.primary_contact_email && !emailRegex.test(vendorData.primary_contact_email)) {
      toast({
        title: "E-mail Inválido",
        description: "Insira um endereço de e-mail válido",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  // Save current step data
  const handleSaveCurrentStep = async () => {
    const currentStepData = onboardingSteps[currentStep];
    
    // Validate current step if it's basic info
    if (currentStepData?.id === 'basic_info' && !validateBasicInfo()) {
      return;
    }
    
    const saved = await saveVendorData();
    if (saved) {
      toast({
        title: "Dados Salvos",
        description: `Informações da etapa "${currentStepData?.title}" foram salvas com sucesso`,
      });
      
      // Update step completion status
      setOnboardingSteps(prev => prev.map(step => {
        if (step.id === currentStepData?.id) {
          return { ...step, completed: true };
        }
        return step;
      }));
    }
  };

  // Handle direct step navigation
  const handleStepNavigation = async (targetStep: number) => {
    // Se está tentando ir para a mesma etapa, não faz nada
    if (targetStep === currentStep) {
      return;
    }

    // Se está na etapa de informações básicas e tem dados não salvos, salva automaticamente
    const currentStepData = onboardingSteps[currentStep];
    if (currentStepData?.id === 'basic_info') {
      // Verifica se há dados para salvar (pelo menos nome preenchido)
      if (vendorData.name && vendorData.name.trim() !== '') {
        if (validateBasicInfo()) {
          await saveVendorData();
        } else {
          // Se a validação falhar, pergunta se quer continuar mesmo assim
          const confirmNavigation = window.confirm(
            'Existem campos obrigatórios não preenchidos na etapa atual. Deseja continuar mesmo assim? Os dados não serão salvos.'
          );
          if (!confirmNavigation) {
            return;
          }
        }
      }
    }

    // Navega para a etapa desejada
    setCurrentStep(targetStep);
    
    toast({
      title: "Navegação",
      description: `Navegando para etapa: ${onboardingSteps[targetStep]?.title}`,
    });
  };

  // Complete onboarding
  const completeOnboarding = async () => {
    const savedVendor = await saveVendorData();
    if (savedVendor) {
      const updatedVendor = {
        ...savedVendor,
        onboarding_status: 'completed',
        status: 'active',
        onboarding_progress: 100
      };

      const { error } = await supabase
        .from('vendor_registry')
        .update({
          onboarding_status: 'completed',
          status: 'active',
          onboarding_progress: 100
        })
        .eq('id', savedVendor.id);

      if (!error) {
        toast({
          title: "Onboarding Concluído",
          description: "O fornecedor foi ativado com sucesso",
        });
        
        if (onComplete) {
          onComplete(updatedVendor);
        }
        
        onClose();
      }
    }
  };

  // Step components
  const renderStepContent = () => {
    const currentStepData = onboardingSteps[currentStep];
    console.log('Renderizando step:', { currentStep, stepId: currentStepData?.id, stepTitle: currentStepData?.title });
    
    switch (currentStepData?.id) {
      case 'basic_info':
        return <BasicInfoStep 
          vendorData={vendorData} 
          setVendorData={setVendorData}
          cnpjError={cnpjError}
          setCnpjError={setCnpjError}
        />;
      case 'due_diligence':
        return <DueDiligenceStep 
          vendorData={vendorData} 
          onChecklistComplete={setDueDiligenceComplete}
        />;
      case 'risk_assessment':
        return <RiskAssessmentStep 
          vendorData={vendorData} 
          onAssessmentComplete={(completed, score) => {
            setRiskAssessmentComplete(completed);
            if (score !== undefined) {
              setRiskScore(score);
            }
          }}
        />;
      case 'contract_review':
        return <ContractReviewStep 
          vendorData={vendorData} 
          onAnalysisComplete={(completed) => {
            setContractReviewComplete(completed);
          }}
          onAnalysisChange={(analysis) => {
            // Callback opcional para mudanças na análise
            console.log('Análise alterada:', analysis);
          }}
          onContractReviewComplete={(completed) => {
            setContractReviewComplete(completed);
          }}
        />;
      case 'final_approval':
        return <FinalApprovalStep vendorData={vendorData} riskScore={riskScore} />;
      default:
        return <div>Etapa não encontrada</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            ALEX VENDOR - {vendorId ? 'Edição de Fornecedor' : 'Onboarding de Fornecedor'}
          </DialogTitle>
          <DialogDescription>
            {vendorId 
              ? 'Edite todas as informações do fornecedor através do wizard completo de onboarding'
              : 'Workflow inteligente para onboarding completo de fornecedores'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Overview */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Progresso do Onboarding</CardTitle>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {calculateProgress()}% Completo
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={calculateProgress()} className="mb-4" />
              
              {/* Steps Timeline - 5 Etapas Compactas */}
              <div className="flex items-center justify-between mt-4 space-x-2">
                {onboardingSteps.map((step, index) => {
                  // Cores para cada etapa
                  const stepColors = [
                    'blue', 'purple', 'green', 'orange', 'indigo'
                  ];
                  
                  const color = stepColors[index] || 'blue';
                  
                  return (
                    <div key={step.id} className="flex-1">
                      <div className="flex flex-col items-center space-y-2">
                        {/* Ícone da etapa - Clicável */}
                        <button
                          onClick={() => handleStepNavigation(index)}
                          className={`
                            w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                            hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}-500
                            cursor-pointer
                            ${step.completed 
                              ? `bg-${color}-500 text-white shadow-md hover:bg-${color}-600` 
                              : index === currentStep 
                                ? `bg-${color}-100 dark:bg-${color}-900/30 border-2 border-${color}-500 text-${color}-700 dark:text-${color}-300 hover:bg-${color}-200 dark:hover:bg-${color}-900/50`
                                : 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }
                          `}
                          title={`Ir para etapa: ${step.title}`}
                        >
                          {step.completed ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </button>
                        
                        {/* Título da etapa */}
                        <div className="text-center">
                          <div className={`
                            text-xs font-medium leading-tight max-w-20 cursor-pointer
                            ${step.completed 
                              ? `text-${color}-600 dark:text-${color}-400 hover:text-${color}-700 dark:hover:text-${color}-300` 
                              : index === currentStep 
                                ? `text-${color}-700 dark:text-${color}-300 font-semibold`
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }
                          `}
                          onClick={() => handleStepNavigation(index)}
                          title={`Ir para etapa: ${step.title}`}
                          >
                            {step.title}
                          </div>
                          

                        </div>
                        
                        {/* Linha conectora */}
                        {index < onboardingSteps.length - 1 && (
                          <div className="hidden sm:block absolute top-5 left-full w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-10" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Current Step Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {onboardingSteps[currentStep]?.aiAssisted && (
                      <Zap className="h-4 w-4 text-blue-600" />
                    )}
                    {onboardingSteps[currentStep]?.title}
                  </CardTitle>
                  <p className="text-muted-foreground">
                    {onboardingSteps[currentStep]?.description}
                  </p>
                </div>
                
                {onboardingSteps[currentStep]?.automated && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    <Target className="h-3 w-3 mr-1" />
                    Automatizado
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Informações sobre funcionalidades - apenas na primeira etapa */}
              {currentStep === 0 && (
                <div className="mb-6 space-y-3">
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Save className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        Botão Salvar Disponível
                      </span>
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      Você pode salvar as informações a qualquer momento usando o botão "Salvar" abaixo, 
                      sem precisar completar todas as etapas do processo.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Navegação Direta
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Clique nos ícones numerados acima para navegar diretamente para qualquer etapa. 
                      Os dados da etapa atual serão salvos automaticamente se válidos.
                    </p>
                  </div>
                </div>
              )}
              
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={previousStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            <div className="flex items-center gap-3">
              {/* Botão Salvar - disponível em todas as etapas */}
              <Button 
                variant="outline" 
                onClick={handleSaveCurrentStep}
                className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-950"
              >
                <Save className="h-4 w-4" />
                Salvar
              </Button>
              
              <div className="text-sm text-muted-foreground">
                Etapa {currentStep + 1} de {onboardingSteps.length}
              </div>
            </div>

            {currentStep < onboardingSteps.length - 1 ? (
              <Button onClick={nextStep}>
                Próxima
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={completeOnboarding} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Finalizar Onboarding
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Basic Info Step Component
const BasicInfoStep: React.FC<{
  vendorData: VendorRegistry;
  setVendorData: React.Dispatch<React.SetStateAction<VendorRegistry>>;
  cnpjError: string;
  setCnpjError: React.Dispatch<React.SetStateAction<string>>;
}> = ({ vendorData, setVendorData, cnpjError, setCnpjError }) => {
  
  // Funções de validação de CNPJ
  const formatCNPJ = (value: string): string => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara de CNPJ
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  };
  
  const validateCNPJ = (cnpj: string): boolean => {
    // Remove caracteres não numéricos
    const numbers = cnpj.replace(/\D/g, '');
    
    // Verifica se tem 14 dígitos
    if (numbers.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(numbers)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    let weight = 5;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(numbers[i]) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    const digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    if (parseInt(numbers[12]) !== digit1) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    weight = 6;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(numbers[i]) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    const digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    return parseInt(numbers[13]) === digit2;
  };
  
  // Update vendor data
  const updateVendorData = (field: keyof VendorRegistry | string, value: any) => {
    if (field.includes('.')) {
      // Handle nested fields like 'address.street'
      const [parentField, childField] = field.split('.');
      setVendorData(prev => ({
        ...prev,
        [parentField]: {
          ...prev[parentField as keyof VendorRegistry],
          [childField]: value
        }
      }));
    } else {
      setVendorData(prev => ({ ...prev, [field]: value }));
    }
  };
  
  // Função específica para CNPJ com validação
  const handleCNPJChange = (value: string) => {
    // Formata o valor
    const formattedValue = formatCNPJ(value);
    
    // Atualiza o valor
    updateVendorData('tax_id', formattedValue);
    
    // Valida apenas se o campo estiver completo (14 dígitos)
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 14) {
      if (validateCNPJ(formattedValue)) {
        setCnpjError('');
      } else {
        setCnpjError('CNPJ inválido');
      }
    } else if (numbers.length > 0 && numbers.length < 14) {
      setCnpjError('CNPJ incompleto');
    } else {
      setCnpjError('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Comercial *</Label>
          <Input
            id="name"
            value={vendorData.name}
            onChange={(e) => updateVendorData('name', e.target.value)}
            placeholder="Nome usado comercialmente"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="legal_name">Razão Social *</Label>
          <Input
            id="legal_name"
            value={vendorData.legal_name}
            onChange={(e) => updateVendorData('legal_name', e.target.value)}
            placeholder="Razão social oficial"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax_id">CNPJ *</Label>
          <Input
            id="tax_id"
            value={vendorData.tax_id}
            onChange={(e) => handleCNPJChange(e.target.value)}
            placeholder="00.000.000/0000-00"
            maxLength={18}
            className={cnpjError ? 'border-red-500 focus:border-red-500' : ''}
          />
          {cnpjError && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              {cnpjError}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={vendorData.website || ''}
            onChange={(e) => updateVendorData('website', e.target.value)}
            placeholder="https://exemplo.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="business_category">Categoria de Negócio</Label>
          <Input
            id="business_category"
            value={vendorData.business_category}
            onChange={(e) => updateVendorData('business_category', e.target.value)}
            placeholder="Ex: Tecnologia, Consultoria, Serviços"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vendor_type">Tipo de Fornecedor</Label>
          <Select
            value={vendorData.vendor_type}
            onValueChange={(value) => updateVendorData('vendor_type', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="strategic">Estratégico</SelectItem>
              <SelectItem value="operational">Operacional</SelectItem>
              <SelectItem value="transactional">Transacional</SelectItem>
              <SelectItem value="critical">Crítico</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="criticality_level">Nível de Criticidade</Label>
          <Select
            value={vendorData.criticality_level}
            onValueChange={(value) => updateVendorData('criticality_level', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="critical">Crítica</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contract_value">Valor do Contrato (R$)</Label>
          <Input
            id="contract_value"
            type="number"
            value={vendorData.contract_value}
            onChange={(e) => updateVendorData('contract_value', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Contato Principal</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primary_contact_name">Nome do Contato *</Label>
            <Input
              id="primary_contact_name"
              value={vendorData.primary_contact_name}
              onChange={(e) => updateVendorData('primary_contact_name', e.target.value)}
              placeholder="Nome completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary_contact_email">E-mail *</Label>
            <Input
              id="primary_contact_email"
              type="email"
              value={vendorData.primary_contact_email}
              onChange={(e) => updateVendorData('primary_contact_email', e.target.value)}
              placeholder="contato@fornecedor.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary_contact_phone">Telefone</Label>
            <Input
              id="primary_contact_phone"
              value={vendorData.primary_contact_phone || ''}
              onChange={(e) => updateVendorData('primary_contact_phone', e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Endereço</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="street">Logradouro</Label>
            <Input
              id="street"
              value={vendorData.address.street}
              onChange={(e) => updateVendorData('address.street', e.target.value)}
              placeholder="Rua, Avenida, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              value={vendorData.address.city}
              onChange={(e) => updateVendorData('address.city', e.target.value)}
              placeholder="São Paulo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Input
              id="state"
              value={vendorData.address.state}
              onChange={(e) => updateVendorData('address.state', e.target.value)}
              placeholder="SP"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip_code">CEP</Label>
            <Input
              id="zip_code"
              value={vendorData.address.zip_code}
              onChange={(e) => updateVendorData('address.zip_code', e.target.value)}
              placeholder="01234-567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">País</Label>
            <Input
              id="country"
              value={vendorData.address.country}
              onChange={(e) => updateVendorData('address.country', e.target.value)}
              placeholder="Brasil"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Due Diligence Checklist by Service Type
const getDueDiligenceChecklist = (businessCategory: string, vendorType: string, criticalityLevel: string) => {
  const baseChecklist = [
    {
      id: 'business_registration',
      title: 'Registro Empresarial Válido',
      description: 'CNPJ ativo na Receita Federal',
      required: true,
      category: 'legal'
    },
    {
      id: 'financial_health',
      title: 'Situação Financeira',
      description: 'Balanços dos últimos 2 anos ou declaração contábil',
      required: criticalityLevel === 'high' || criticalityLevel === 'critical',
      category: 'financial'
    },
    {
      id: 'insurance_coverage',
      title: 'Cobertura de Seguros',
      description: 'Seguro de responsabilidade civil e/ou profissional',
      required: vendorType === 'strategic' || vendorType === 'critical',
      category: 'insurance'
    }
  ];

  const serviceSpecificChecklists = {
    'tecnologia': [
      {
        id: 'iso_27001',
        title: 'Certificação ISO 27001',
        description: 'Certificado válido de Segurança da Informação',
        required: criticalityLevel === 'high' || criticalityLevel === 'critical',
        category: 'security'
      },
      {
        id: 'data_protection',
        title: 'Política de Proteção de Dados',
        description: 'Adequação à LGPD/GDPR documentada',
        required: true,
        category: 'compliance'
      },
      {
        id: 'backup_policy',
        title: 'Política de Backup',
        description: 'Procedimentos de backup e recuperação documentados',
        required: true,
        category: 'operational'
      },
      {
        id: 'incident_response',
        title: 'Plano de Resposta a Incidentes',
        description: 'Procedimentos estruturados para resposta a incidentes de segurança',
        required: criticalityLevel === 'high' || criticalityLevel === 'critical',
        category: 'security'
      },
      {
        id: 'business_continuity',
        title: 'Plano de Continuidade de Negócios',
        description: 'Estratégias para manutenção de operações críticas',
        required: vendorType === 'strategic' || vendorType === 'critical',
        category: 'operational'
      }
    ],
    'consultoria': [
      {
        id: 'professional_certifications',
        title: 'Certificações Profissionais',
        description: 'Certificados relevantes dos consultores principais',
        required: true,
        category: 'qualification'
      },
      {
        id: 'confidentiality_agreement',
        title: 'Acordo de Confidencialidade',
        description: 'NDA robusto assinado',
        required: true,
        category: 'legal'
      },
      {
        id: 'team_qualifications',
        title: 'Qualificações da Equipe',
        description: 'Currículo e certificações da equipe de consultores',
        required: criticalityLevel === 'high' || criticalityLevel === 'critical',
        category: 'qualification'
      },
      {
        id: 'methodology_framework',
        title: 'Framework de Metodologia',
        description: 'Metodologia estruturada de trabalho documentada',
        required: vendorType === 'strategic',
        category: 'operational'
      }
    ],
    'jurídico': [
      {
        id: 'oab_registration',
        title: 'Registro OAB Ativo',
        description: 'Todos os advogados com registro ativo na OAB',
        required: true,
        category: 'legal'
      },
      {
        id: 'legal_insurance',
        title: 'Seguro de Responsabilidade Civil Profissional',
        description: 'Cobertura mínima adequada ao porte dos serviços',
        required: true,
        category: 'insurance'
      },
      {
        id: 'specialization_areas',
        title: 'Áreas de Especialização',
        description: 'Documentação das áreas de expertise jurídica',
        required: criticalityLevel === 'high' || criticalityLevel === 'critical',
        category: 'qualification'
      },
      {
        id: 'conflict_policy',
        title: 'Política de Conflito de Interesses',
        description: 'Procedimentos para identificação e gestão de conflitos',
        required: criticalityLevel === 'high' || criticalityLevel === 'critical',
        category: 'legal'
      }
    ],
    'saúde': [
      {
        id: 'anvisa_license',
        title: 'Licença ANVISA',
        description: 'Licenciamento sanitário válido',
        required: true,
        category: 'regulatory'
      },
      {
        id: 'quality_certification',
        title: 'Certificação de Qualidade',
        description: 'ISO 9001 ou certificação equivalente',
        required: criticalityLevel === 'high' || criticalityLevel === 'critical',
        category: 'quality'
      },
      {
        id: 'medical_liability',
        title: 'Seguro de Responsabilidade Médica',
        description: 'Cobertura específica para responsabilidade médica',
        required: criticalityLevel === 'high' || criticalityLevel === 'critical',
        category: 'insurance'
      },
      {
        id: 'medical_certifications',
        title: 'Certificações Médicas Específicas',
        description: 'CRM e especializações médicas relevantes',
        required: true,
        category: 'qualification'
      }
    ],
    'financeiro': [
      {
        id: 'central_bank_authorization',
        title: 'Autorização Banco Central',
        description: 'Registro no BACEN para serviços financeiros',
        required: true,
        category: 'regulatory'
      },
      {
        id: 'pci_compliance',
        title: 'Certificação PCI DSS',
        description: 'Conformidade com padrões de segurança para pagamentos',
        required: true,
        category: 'security'
      },
      {
        id: 'aml_policy',
        title: 'Política Anti-Lavagem de Dinheiro',
        description: 'Procedimentos AML/KYC documentados e implementados',
        required: criticalityLevel === 'high' || criticalityLevel === 'critical',
        category: 'compliance'
      },
      {
        id: 'fraud_prevention',
        title: 'Sistemas de Prevenção à Fraude',
        description: 'Ferramentas e processos para detecção de fraudes',
        required: criticalityLevel === 'high' || criticalityLevel === 'critical',
        category: 'security'
      }
    ],
    'logística': [
      {
        id: 'transport_license',
        title: 'Licença de Transporte',
        description: 'Autorização válida para transporte de cargas',
        required: true,
        category: 'regulatory'
      },
      {
        id: 'vehicle_maintenance',
        title: 'Plano de Manutenção de Veículos',
        description: 'Programa estruturado de manutenção preventiva',
        required: criticalityLevel === 'high' || criticalityLevel === 'critical',
        category: 'operational'
      },
      {
        id: 'driver_certifications',
        title: 'Certificações de Motoristas',
        description: 'CNH válida e cursos de direção defensiva',
        required: true,
        category: 'qualification'
      },
      {
        id: 'cargo_insurance',
        title: 'Seguro de Carga',
        description: 'Cobertura para mercadorias transportadas',
        required: vendorType === 'strategic' || vendorType === 'critical',
        category: 'insurance'
      },
      {
        id: 'tracking_systems',
        title: 'Sistemas de Rastreamento',
        description: 'Tecnologia para monitoramento de frota e cargas',
        required: criticalityLevel === 'high' || criticalityLevel === 'critical',
        category: 'operational'
      }
    ],
    'marketing': [
      {
        id: 'advertising_compliance',
        title: 'Conformidade Publicitária',
        description: 'Adequação às normas do CONAR e legislação publicitária',
        required: true,
        category: 'compliance'
      },
      {
        id: 'creative_portfolio',
        title: 'Portfólio Criativo',
        description: 'Demonstração de trabalhos anteriores e cases de sucesso',
        required: vendorType === 'strategic',
        category: 'qualification'
      },
      {
        id: 'brand_guidelines',
        title: 'Diretrizes de Marca',
        description: 'Processos para manutenção de consistência de marca',
        required: criticalityLevel === 'high' || criticalityLevel === 'critical',
        category: 'operational'
      },
      {
        id: 'data_analytics',
        title: 'Capacidades de Analytics',
        description: 'Ferramentas e metodologias para análise de performance',
        required: vendorType === 'strategic',
        category: 'operational'
      }
    ]
  };

  const categoryKey = businessCategory.toLowerCase();
  const specificChecklist = serviceSpecificChecklists[categoryKey] || [];
  
  return [...baseChecklist, ...specificChecklist];
};

// Tipos para as opções de compliance
type ComplianceStatus = 'compliant' | 'non_compliant' | 'compliant_with_reservation' | null;

interface ChecklistResponse {
  status: ComplianceStatus;
  justification: string;
  file?: File | null;
}

const DueDiligenceStep: React.FC<{ 
  vendorData: VendorRegistry;
  onChecklistComplete: (completed: boolean) => void;
}> = ({ vendorData, onChecklistComplete }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
        <h4 className="flex items-center gap-2 text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
          <Brain className="h-4 w-4" />
          ALEX VENDOR - Due Diligence Inteligente
        </h4>
        <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
          Checklist editável personalizado para avaliação de fornecedores com as questões padrão e possibilidade de customização
        </p>
      </div>
      
      {/* Checklist Editável */}
      <EditableChecklistManager 
        vendorId={vendorData.id}
        onChecklistComplete={onChecklistComplete}
      />
      
      {/* Instruções */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm">
                Instruções para Prosseguir
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Marque todos os itens obrigatórios como "Compliance" ou "Compliance com Ressalva" para prosseguir para a próxima etapa.
                Use o botão "Editar Checklist" para personalizar as questões conforme necessário.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const RiskAssessmentStep: React.FC<{ 
  vendorData: VendorRegistry;
  onAssessmentComplete: (completed: boolean, score?: number) => void;
}> = ({ vendorData, onAssessmentComplete }) => {
  console.log('RiskAssessmentStep renderizado:', { vendorData: vendorData.name });
  
  const { createAssessment } = useVendorRiskManagement();
  
  const handleTemplateSelected = async (templateId: string, templateName: string) => {
    try {
      console.log('Template selecionado:', { templateId, templateName, vendorId: vendorData.id });
      
      // Buscar o framework real no banco de dados baseado no tipo
      const frameworkId = templateId;
      
      // Se o templateId não for um UUID válido, buscar o framework correspondente
      if (templateId === 'nist_csf_default' || templateId === 'iso_27001_27701_default') {
        console.log('Template hardcoded detectado, salvando informações localmente');
        
        // Por enquanto, vamos salvar as informações do template selecionado no localStorage
        // para que possam ser recuperadas quando necessário
        const selectedTemplateInfo = {
          templateId,
          templateName,
          vendorId: vendorData.id,
          selectedAt: new Date().toISOString(),
          selectedInOnboarding: true
        };
        
        localStorage.setItem(`vendor_${vendorData.id}_selected_template`, JSON.stringify(selectedTemplateInfo));
        console.log('Template selecionado salvo no localStorage:', selectedTemplateInfo);
        
        return; // Não criar assessment ainda, apenas salvar a seleção
      }
      
      // Se for um UUID válido, criar o assessment normalmente
      const assessmentData = {
        vendor_id: vendorData.id,
        framework_id: frameworkId,
        assessment_name: `Assessment - ${vendorData.name}`,
        assessment_type: 'initial' as const,
        status: 'draft' as const,
        priority: 'medium' as const,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
        responses: {},
        alex_analysis: {},
        alex_recommendations: {},
        evidence_attachments: [],
        metadata: {
          template_name: templateName,
          selected_at: new Date().toISOString(),
          selected_in_onboarding: true
        }
      };
      
      await createAssessment(assessmentData);
      console.log('Assessment criado com sucesso no banco de dados');
      
    } catch (error) {
      console.error('Erro ao salvar template selecionado:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
        <h4 className="flex items-center gap-2 text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
          <Shield className="h-4 w-4" />
          ALEX VENDOR - Assessment de Riscos Inteligente
        </h4>
        <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
          Selecione e customize o framework de assessment mais adequado para avaliar os riscos do fornecedor.
          Disponível: NIST CSF, ISO 27001/27701 ou Assessment Proprietário.
        </p>
      </div>
      
      {/* Assessment Manager */}
      <RiskAssessmentManager 
        vendorId={vendorData.id}
        onAssessmentComplete={onAssessmentComplete}
        onTemplateSelected={handleTemplateSelected}
      />
      
      {/* Instruções */}
      <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <div>
              <h4 className="font-medium text-orange-900 dark:text-orange-100 text-sm">
                Instruções para o Assessment
              </h4>
              <p className="text-sm text-orange-800 dark:text-orange-200">
                Responda todas as questões obrigatórias para calcular o score de risco do fornecedor.
                Use o modo de edição para customizar questões conforme necessário.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ContractReviewStep: React.FC<{ 
  vendorData: VendorRegistry;
  onAnalysisComplete: (completed: boolean) => void;
  onAnalysisChange?: (analysis: any) => void;
  onContractReviewComplete?: (completed: boolean) => void;
}> = ({ vendorData, onAnalysisComplete, onAnalysisChange, onContractReviewComplete }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 p-4 rounded-lg border border-green-200 dark:border-green-800">
        <h4 className="flex items-center gap-2 text-sm font-medium text-green-900 dark:text-green-100 mb-2">
          <Brain className="h-4 w-4" />
          ALEX VENDOR - Revisão Contratual com IA
        </h4>
        <p className="text-sm text-green-700 dark:text-green-300 mb-3">
          Análise inteligente de contratos com foco em segurança, privacidade, SLAs e compliance.
          Configure a análise de acordo com suas preferências e execute a revisão automatizada.
        </p>
      </div>
      
      {/* Contract Review Manager */}
      <ContractReviewManager 
        vendorId={vendorData.id}
        allowSkip={true}
        onSkip={() => {
          // Marcar como completado para permitir avançar
          if (onContractReviewComplete) {
            onContractReviewComplete(true);
          }
        }}
        onAnalysisComplete={(completed, analysis) => {
          if (onAnalysisComplete) {
            onAnalysisComplete(completed, analysis);
          }
          if (onContractReviewComplete) {
            onContractReviewComplete(completed);
          }
        }}
        onAnalysisChange={onAnalysisChange}
        onContractReviewComplete={onContractReviewComplete}
      />
      
      {/* Instruções */}
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <h4 className="font-medium text-green-900 dark:text-green-100 text-sm">
                Instruções para a Revisão
              </h4>
              <p className="text-sm text-green-800 dark:text-green-200">
                Faça upload do contrato ou insira o texto diretamente. Configure os pontos de análise 
                e execute a revisão com IA para obter um parecer detalhado sobre riscos e recomendações.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const FinalApprovalStep: React.FC<{ vendorData: VendorRegistry; riskScore: number }> = ({ vendorData, riskScore }) => {
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [registrationDate, setRegistrationDate] = useState(new Date().toISOString().split('T')[0]);
  const [reviewDate, setReviewDate] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const { toast } = useToast();

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Simular geração de PDF
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'PDF Gerado',
        description: 'O resumo executivo foi gerado com sucesso.',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao gerar PDF. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const sendEmail = async () => {
    setIsSendingEmail(true);
    try {
      // Simular envio de email
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Email Enviado',
        description: 'O resumo executivo foi enviado por email.',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao enviar email. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="flex items-center gap-2 text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          <Award className="h-5 w-5" />
          Revisão Final - Resumo Executivo
        </h4>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Todas as etapas foram concluídas. Revise o resumo executivo abaixo, adicione informações complementares e finalize o processo.
        </p>
      </div>

      {/* Resumo Executivo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações do Fornecedor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Informações do Fornecedor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome</label>
                <p className="font-medium">{vendorData.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                <p className="font-medium">{vendorData.vendor_type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Criticidade</label>
                <Badge variant="outline">{vendorData.criticality_level}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Valor do Contrato</label>
                <p className="font-medium">R$ {vendorData.contract_value?.toLocaleString()}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Contato Principal</label>
              <p className="font-medium">{vendorData.primary_contact_name}</p>
              <p className="text-sm text-muted-foreground">{vendorData.primary_contact_email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Avaliação de Risco */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Avaliação de Risco
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {riskScore > 0 ? (
              <>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{riskScore}%</div>
                  <Badge className={`${
                    riskScore >= 70 ? 'bg-green-600' : riskScore >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}>
                    {riskScore >= 70 ? 'Aprovado' : riskScore >= 50 ? 'Condicional' : 'Rejeitado'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Nível de Risco:</span>
                    <span className="font-medium">
                      {riskScore >= 70 ? 'Baixo' : riskScore >= 50 ? 'Médio' : 'Alto'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <span className="font-medium">
                      {riskScore >= 70 ? 'Recomendado' : riskScore >= 50 ? 'Requer Atenção' : 'Não Recomendado'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Avaliação de risco não realizada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumo das Etapas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Resumo das Etapas Concluídas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">Informações Básicas</span>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300">Dados cadastrais coletados</p>
            </div>
            
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">Due Diligence</span>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300">Verificações realizadas</p>
            </div>
            
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">Revisão Contratual</span>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300">Contrato analisado</p>
            </div>
            
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-200">Revisão Final</span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">Em andamento</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informações Adicionais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="additional-info">Observações e Comentários</Label>
            <Textarea
              id="additional-info"
              placeholder="Adicione informações complementares, observações ou comentários sobre o processo de onboarding..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              rows={4}
              className="mt-1"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="registration-date">Data de Cadastro</Label>
              <Input
                id="registration-date"
                type="date"
                value={registrationDate}
                onChange={(e) => setRegistrationDate(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="review-date">Data de Revisão (se necessário)</Label>
              <Input
                id="review-date"
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Ações de Finalização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
            >
              {isGeneratingPDF ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              {isGeneratingPDF ? 'Gerando PDF...' : 'Gerar PDF'}
            </Button>
            
            <Button
              onClick={sendEmail}
              disabled={isSendingEmail}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isSendingEmail ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {isSendingEmail ? 'Enviando...' : 'Enviar por Email'}
            </Button>
            
            <Button
              variant="secondary"
              className="flex items-center gap-2"
              onClick={() => {
                toast({
                  title: 'Resumo Salvo',
                  description: 'As informações foram salvas com sucesso.',
                  variant: 'default',
                });
              }}
            >
              <Save className="h-4 w-4" />
              Salvar Resumo
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Importante</span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Certifique-se de revisar todas as informações antes de finalizar o processo. O PDF gerado servirá como documentação oficial do onboarding.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

