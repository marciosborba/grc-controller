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
import { 
  Scale,
  Settings,
  Umbrella,
  Gavel,
  GraduationCap
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
  Users,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Building,
  FileCheck,
  Shield,
  Brain,
  Zap,
  Target,
  ArrowRight,
  ArrowLeft,
  Star,
  Award,
  TrendingUp,
  Activity,
  Calendar,
  DollarSign,
  Globe,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Download,
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

export const VendorOnboardingWorkflowUpdated: React.FC<VendorOnboardingWorkflowProps> = ({
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
  const [onboardingSteps, setOnboardingSteps] = useState<VendorOnboardingStep[]>([
    {
      id: 'basic_info',
      title: 'Informações Básicas',
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
      title: 'Assessment de Riscos',
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
      title: 'Revisão Contratual',
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
      title: 'Aprovação Final',
      description: 'Aprovação pela liderança e ativação do fornecedor',
      required: true,
      completed: false,
      automated: false,
      aiAssisted: false,
      order: 5,
      category: 'approval'
    },
    {
      id: 'system_integration',
      title: 'Integração de Sistemas',
      description: 'Setup de monitoramento e integração com sistemas internos',
      required: false,
      completed: false,
      automated: true,
      aiAssisted: true,
      order: 6,
      category: 'integration'
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
          completed = vendor.onboarding_progress >= 60;
          break;
        case 'contract_review':
          completed = vendor.onboarding_progress >= 80;
          break;
        case 'final_approval':
          completed = vendor.onboarding_status === 'completed';
          break;
        case 'system_integration':
          completed = vendor.status === 'active';
          break;
      }
      
      return { ...step, completed };
    }));
  };

  // Calculate overall progress
  const calculateProgress = () => {
    const completedSteps = onboardingSteps.filter(step => step.completed).length;
    const requiredSteps = onboardingSteps.filter(step => step.required).length;
    return Math.round((completedSteps / onboardingSteps.length) * 100);
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
            `Progresso de onboarding: ${progress}%`
          ],
          recommendations: generateAlexRecommendations()
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
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
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
    
    switch (currentStepData?.id) {
      case 'basic_info':
        return <BasicInfoStep vendorData={vendorData} setVendorData={setVendorData} />;
      case 'due_diligence':
        return <DueDiligenceStepUpdated 
          vendorData={vendorData} 
          onChecklistComplete={setDueDiligenceComplete}
        />;
      case 'risk_assessment':
        return <RiskAssessmentStep vendorData={vendorData} />;
      case 'contract_review':
        return <ContractReviewStep vendorData={vendorData} />;
      case 'final_approval':
        return <FinalApprovalStep vendorData={vendorData} />;
      case 'system_integration':
        return <SystemIntegrationStep vendorData={vendorData} />;
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
            ALEX VENDOR - Onboarding de Fornecedor
          </DialogTitle>
          <DialogDescription>
            Workflow inteligente para onboarding completo de fornecedores com checklist editável
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
              
              {/* Steps Timeline */}
              <div className="flex items-center justify-between">
                {onboardingSteps.map((step, index) => (
                  <div key={step.id} className="flex flex-col items-center space-y-2">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm font-medium
                      ${step.completed 
                        ? 'bg-green-100 border-green-500 text-green-700' 
                        : index === currentStep 
                          ? 'bg-blue-100 border-blue-500 text-blue-700'
                          : 'bg-gray-100 border-gray-300 text-gray-500'
                      }
                    `}>
                      {step.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xs font-medium max-w-20 leading-tight">
                        {step.title}
                      </div>
                      {step.aiAssisted && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          <Brain className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                    
                    {index < onboardingSteps.length - 1 && (
                      <div className="hidden md:block absolute top-4 left-full w-full h-0.5 bg-gray-300 -z-10" />
                    )}
                  </div>
                ))}
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

            <div className="text-sm text-muted-foreground">
              Etapa {currentStep + 1} de {onboardingSteps.length}
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
}> = ({ vendorData, setVendorData }) => {
  
  const updateVendorData = (field: string, value: any) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setVendorData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value }
      }));
    } else {
      setVendorData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
        <h4 className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          <Brain className="h-4 w-4" />
          ALEX VENDOR - Análise Inteligente
        </h4>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Preencha as informações básicas do fornecedor. O sistema irá automaticamente 
          sugerir a classificação de risco e criticidade baseada nos dados inseridos.
        </p>
      </div>

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
            onChange={(e) => updateVendorData('tax_id', e.target.value)}
            placeholder="00.000.000/0000-00"
          />
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

// Due Diligence Step atualizado com checklist editável
const DueDiligenceStepUpdated: React.FC<{ 
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

const RiskAssessmentStep: React.FC<{ vendorData: VendorRegistry }> = ({ vendorData }) => (
  <div className="space-y-4">
    <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
      <h4 className="flex items-center gap-2 text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
        <Shield className="h-4 w-4" />
        Assessment de Riscos Inteligente
      </h4>
      <p className="text-sm text-orange-700 dark:text-orange-300">
        ALEX VENDOR selecionará automaticamente o framework de assessment mais adequado 
        baseado no tipo e criticidade do fornecedor.
      </p>
    </div>
    <div className="text-center py-8">
      <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500">Assessment será configurado baseado no perfil do fornecedor...</p>
    </div>
  </div>
);

const ContractReviewStep: React.FC<{ vendorData: VendorRegistry }> = ({ vendorData }) => (
  <div className="space-y-4">
    <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
      <h4 className="flex items-center gap-2 text-sm font-medium text-green-900 dark:text-green-100 mb-2">
        <FileCheck className="h-4 w-4" />
        Revisão Contratual Assistida por IA
      </h4>
      <p className="text-sm text-green-700 dark:text-green-300">
        Análise automatizada de cláusulas contratuais, SLAs e termos de conformidade 
        com sugestões de melhorias.
      </p>
    </div>
    <div className="text-center py-8">
      <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500">Contrato será analisado automaticamente...</p>
    </div>
  </div>
);

const FinalApprovalStep: React.FC<{ vendorData: VendorRegistry }> = ({ vendorData }) => (
  <div className="space-y-4">
    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
      <h4 className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
        <Award className="h-4 w-4" />
        Resumo do Onboarding
      </h4>
      <p className="text-sm text-blue-700 dark:text-blue-300">
        Todas as etapas foram concluídas. Revise o resumo abaixo e aprove o fornecedor.
      </p>
    </div>
    
    <Card>
      <CardHeader>
        <CardTitle>Resumo do Fornecedor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div><strong>Nome:</strong> {vendorData.name}</div>
        <div><strong>Tipo:</strong> {vendorData.vendor_type}</div>
        <div><strong>Criticidade:</strong> {vendorData.criticality_level}</div>
        <div><strong>Valor do Contrato:</strong> R$ {vendorData.contract_value?.toLocaleString()}</div>
        <div><strong>Contato:</strong> {vendorData.primary_contact_name} ({vendorData.primary_contact_email})</div>
      </CardContent>
    </Card>
  </div>
);

const SystemIntegrationStep: React.FC<{ vendorData: VendorRegistry }> = ({ vendorData }) => (
  <div className="space-y-4">
    <div className="bg-indigo-50 dark:bg-indigo-950 p-4 rounded-lg">
      <h4 className="flex items-center gap-2 text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-2">
        <Activity className="h-4 w-4" />
        Integração de Sistemas
      </h4>
      <p className="text-sm text-indigo-700 dark:text-indigo-300">
        Setup automático de monitoramento, dashboards e integração com sistemas internos.
      </p>
    </div>
    <div className="text-center py-8">
      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500">Configuração de monitoramento será executada automaticamente...</p>
    </div>
  </div>
);