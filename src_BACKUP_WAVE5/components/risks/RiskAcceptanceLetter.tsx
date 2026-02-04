import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  FileText, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Shield,
  Eye,
  Download,
  Calendar as CalendarIcon,
  Users,
  DollarSign,
  Workflow,
  Archive,
  Bell,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  FileCheck,
  UserCheck,
  Building,
  Crown
} from 'lucide-react';
import { format, addDays, addMonths, addYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth} from '@/contexts/AuthContextOptimized';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useRiskLetterPrint } from '@/hooks/useRiskLetterPrint';

interface RiskAcceptanceLetter {
  id?: string;
  risk_id: string;
  letter_number: string;
  title: string;
  risk_description: string;
  business_justification: string;
  acceptance_rationale: string;
  residual_risk_level: string;
  residual_risk_score: number;
  financial_exposure: number;
  acceptance_period_start: Date;
  acceptance_period_end: Date;
  monitoring_requirements: string[];
  escalation_triggers: string[];
  review_frequency: string;
  next_review_date: Date;
  conditions_and_limitations: string[];
  compensating_controls: string[];
  stakeholder_notifications: string[];
  status: string;
  
  // Approval workflow
  manager_approval_status?: string;
  manager_comments?: string;
  director_approval_status?: string;
  director_comments?: string;
  cro_approval_status?: string;
  cro_comments?: string;
  board_approval_status?: string;
  board_comments?: string;
  
  created_at?: string;
  created_by?: string;
}

interface MonitoringRecord {
  id?: string;
  letter_id: string;
  monitoring_date: Date;
  risk_level_current: string;
  risk_score_current: number;
  financial_exposure_current: number;
  triggers_activated: string[];
  control_effectiveness: any;
  incidents_occurred: string[];
  monitoring_notes: string;
  action_required: boolean;
  action_description?: string;
  action_due_date?: Date;
  monitoring_status: string;
}

export const RiskAcceptanceLetter: React.FC = () => {
  const [risks, setRisks] = useState<any[]>([]);
  const [letters, setLetters] = useState<RiskAcceptanceLetter[]>([]);
  const [currentLetter, setCurrentLetter] = useState<RiskAcceptanceLetter | null>(null);
  const [monitoringRecords, setMonitoringRecords] = useState<MonitoringRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  
  const [formData, setFormData] = useState<RiskAcceptanceLetter>({
    risk_id: '',
    letter_number: '',
    title: '',
    risk_description: '',
    business_justification: '',
    acceptance_rationale: '',
    residual_risk_level: 'Médio',
    residual_risk_score: 0,
    financial_exposure: 0,
    acceptance_period_start: new Date(),
    acceptance_period_end: addYears(new Date(), 1),
    monitoring_requirements: [''],
    escalation_triggers: [''],
    review_frequency: 'quarterly',
    next_review_date: addMonths(new Date(), 3),
    conditions_and_limitations: [''],
    compensating_controls: [''],
    stakeholder_notifications: [''],
    status: 'draft'
  });

  const [monitoringForm, setMonitoringForm] = useState<MonitoringRecord>({
    letter_id: '',
    monitoring_date: new Date(),
    risk_level_current: 'Médio',
    risk_score_current: 0,
    financial_exposure_current: 0,
    triggers_activated: [],
    control_effectiveness: {},
    incidents_occurred: [],
    monitoring_notes: '',
    action_required: false,
    monitoring_status: 'compliant'
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const { printRiskLetter, isGenerating } = useRiskLetterPrint();

  useEffect(() => {
    fetchRisks();
    fetchLetters();
  }, []);

  const fetchRisks = async () => {
    try {
      const { data, error } = await supabase
        .from('risk_assessments')
        .select('*')
        .order('risk_score', { ascending: false });

      if (error) throw error;
      setRisks(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar riscos:', error);
    }
  };

  const fetchLetters = async () => {
    try {
      const { data, error } = await supabase
        .from('risk_acceptance_letters')
        .select(`
          *,
          risk_assessments(title, risk_category, risk_level)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLetters(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar cartas:', error);
    }
  };

  const fetchMonitoringRecords = async (letterId: string) => {
    try {
      const { data, error } = await supabase
        .from('risk_acceptance_monitoring')
        .select('*')
        .eq('letter_id', letterId)
        .order('monitoring_date', { ascending: false });

      if (error) throw error;
      setMonitoringRecords(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar monitoramento:', error);
    }
  };

  const generateLetterNumber = () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RA-${year}${month}-${random}`;
  };

  const calculateNextReviewDate = (frequency: string, startDate: Date) => {
    switch (frequency) {
      case 'monthly': return addMonths(startDate, 1);
      case 'quarterly': return addMonths(startDate, 3);
      case 'semiannually': return addMonths(startDate, 6);
      case 'annually': return addYears(startDate, 1);
      default: return addMonths(startDate, 3);
    }
  };

  const saveLetter = async () => {
    if (!formData.risk_id || !formData.title || !formData.business_justification) {
      toast({
        title: 'Erro',
        description: 'Preencha os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      const letterData = {
        ...formData,
        letter_number: formData.letter_number || generateLetterNumber(),
        next_review_date: calculateNextReviewDate(formData.review_frequency, formData.acceptance_period_start),
        audit_trail: {
          created: {
            timestamp: new Date().toISOString(),
            user_id: user?.id,
            action: 'created'
          }
        },
        created_by: user?.id
      };

      const { data, error } = await supabase
        .from('risk_acceptance_letters')
        .insert([letterData])
        .select()
        .single();

      if (error) throw error;

      setCurrentLetter(data);
      fetchLetters();
      
      toast({
        title: 'Carta Salva',
        description: `Carta de risco ${data.letter_number} criada com sucesso`,
      });
      
      setActiveTab('manage');
    } catch (error: any) {
      console.error('Erro ao salvar carta:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao salvar carta de risco',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const submitForApproval = async (letterId: string) => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('risk_acceptance_letters')
        .update({
          status: 'pending_approval',
          submitted_by: user?.id,
          submitted_at: new Date().toISOString(),
          audit_trail: {
            submitted: {
              timestamp: new Date().toISOString(),
              user_id: user?.id,
              action: 'submitted_for_approval'
            }
          }
        })
        .eq('id', letterId);

      if (error) throw error;

      fetchLetters();
      
      toast({
        title: 'Carta Submetida',
        description: 'Carta enviada para aprovação',
      });
    } catch (error: any) {
      console.error('Erro ao submeter carta:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao submeter carta',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const approveRejectLetter = async (letterId: string, action: 'approve' | 'reject', level: string, comments: string) => {
    setLoading(true);
    
    try {
      const updateData: any = {
        [`${level}_approval_status`]: action === 'approve' ? 'approved' : 'rejected',
        [`${level}_approved_by`]: user?.id,
        [`${level}_approved_at`]: new Date().toISOString(),
        [`${level}_comments`]: comments
      };

      // Se aprovado em todos os níveis necessários, marcar como aprovado final
      if (action === 'approve' && level === 'cro') {
        updateData.status = 'approved';
        updateData.final_approval_date = new Date().toISOString();
      } else if (action === 'reject') {
        updateData.status = 'rejected';
        updateData.rejection_reason = comments;
      }

      const { error } = await supabase
        .from('risk_acceptance_letters')
        .update(updateData)
        .eq('id', letterId);

      if (error) throw error;

      fetchLetters();
      
      toast({
        title: action === 'approve' ? 'Carta Aprovada' : 'Carta Rejeitada',
        description: `Carta ${action === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso`,
      });
    } catch (error: any) {
      console.error('Erro na aprovação:', error);
      toast({
        title: 'Erro',
        description: 'Falha no processo de aprovação',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addMonitoringRecord = async () => {
    if (!monitoringForm.letter_id) {
      toast({
        title: 'Erro',
        description: 'Selecione uma carta para monitorar',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('risk_acceptance_monitoring')
        .insert([{ ...monitoringForm, created_by: user?.id }])
        .select()
        .single();

      if (error) throw error;

      fetchMonitoringRecords(monitoringForm.letter_id);
      
      toast({
        title: 'Monitoramento Registrado',
        description: 'Registro de monitoramento adicionado com sucesso',
      });
      
      // Reset form
      setMonitoringForm({
        ...monitoringForm,
        monitoring_notes: '',
        triggers_activated: [],
        incidents_occurred: [],
        action_required: false
      });
    } catch (error: any) {
      console.error('Erro ao registrar monitoramento:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao registrar monitoramento',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateArrayField = (field: keyof RiskAcceptanceLetter, index: number, value: string) => {
    const currentArray = formData[field] as string[];
    const newArray = [...currentArray];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field: keyof RiskAcceptanceLetter) => {
    const currentArray = formData[field] as string[];
    setFormData({ ...formData, [field]: [...currentArray, ''] });
  };

  const removeArrayItem = (field: keyof RiskAcceptanceLetter, index: number) => {
    const currentArray = formData[field] as string[];
    const newArray = currentArray.filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      case 'revoked': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalIcon = (level: string) => {
    switch (level) {
      case 'manager': return UserCheck;
      case 'director': return Building;
      case 'cro': return Shield;
      case 'board': return Crown;
      default: return CheckCircle;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate flex items-center space-x-2">
            <FileText className="h-8 w-8 text-primary" />
            <span>Carta de Risco (Risk Acceptance)</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Processo completo de aceitação de risco com workflow de aprovação e monitoramento
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline"
            onClick={() => {
              if (currentLetter) {
                console.log('Tentando imprimir carta:', currentLetter);
                printRiskLetter(currentLetter);
              } else {
                // Criar carta de teste se não houver nenhuma selecionada
                const testLetter = {
                  id: 'test-001',
                  risk_id: 'risk-test-001',
                  letter_number: 'RA-2025-001',
                  title: 'Carta de Teste - Risco de Demonstração',
                  risk_description: 'Este é um risco de demonstração para testar a funcionalidade de impressão de cartas de aceitação de risco.',
                  business_justification: 'A justificativa de negócio para aceitar este risco é demonstrar a funcionalidade completa do sistema de geração de PDFs profissionais.',
                  acceptance_rationale: 'O racional técnico para aceitação inclui a validação de todas as funcionalidades implementadas no gerador de PDF.',
                  residual_risk_level: 'Médio',
                  residual_risk_score: 5,
                  financial_exposure: 50000,
                  acceptance_period_start: new Date(),
                  acceptance_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                  monitoring_requirements: ['Monitoramento mensal', 'Relatórios trimestrais', 'Revisão anual'],
                  escalation_triggers: ['Aumento de 20% no score', 'Incidentes críticos', 'Mudanças regulatórias'],
                  review_frequency: 'quarterly',
                  next_review_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                  conditions_and_limitations: ['Limitado ao escopo atual', 'Sujeito a revisões'],
                  compensating_controls: ['Controle de acesso', 'Monitoramento contínuo', 'Backup diário'],
                  stakeholder_notifications: ['Gerência', 'Auditoria', 'Compliance'],
                  status: 'approved',
                  manager_approval_status: 'approved',
                  manager_approved_by: 'João Silva',
                  manager_approved_at: new Date().toISOString(),
                  manager_comments: 'Aprovado conforme análise técnica',
                  director_approval_status: 'approved',
                  director_approved_by: 'Maria Santos',
                  director_approved_at: new Date().toISOString(),
                  director_comments: 'Aprovado pela diretoria',
                  created_at: new Date().toISOString(),
                  created_by: user?.id || 'test-user'
                };
                console.log('Usando carta de teste:', testLetter);
                printRiskLetter(testLetter);
              }
            }}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Imprimir Carta
              </>
            )}
          </Button>
          
          <Button variant="outline">
            <Archive className="h-4 w-4 mr-2" />
            Arquivo
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create">Criar Carta</TabsTrigger>
          <TabsTrigger value="manage">Gerenciar</TabsTrigger>
          <TabsTrigger value="approve">Aprovações</TabsTrigger>
          <TabsTrigger value="monitor">Monitoramento</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nova Carta de Aceitação de Risco</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="risk_select">Risco Associado *</Label>
                  <Select value={formData.risk_id} onValueChange={(value) => {
                    setFormData({ ...formData, risk_id: value });
                    const selectedRisk = risks.find(r => r.id === value);
                    if (selectedRisk) {
                      setFormData({
                        ...formData,
                        risk_id: value,
                        title: `Aceitação de Risco: ${selectedRisk.title}`,
                        risk_description: selectedRisk.description || '',
                        residual_risk_level: selectedRisk.risk_level || 'Médio',
                        residual_risk_score: selectedRisk.risk_score || 0
                      });
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um risco..." />
                    </SelectTrigger>
                    <SelectContent>
                      {risks.map((risk) => (
                        <SelectItem key={risk.id} value={risk.id}>
                          {risk.title} - {risk.risk_category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="letter_number">Número da Carta</Label>
                  <Input
                    id="letter_number"
                    value={formData.letter_number}
                    onChange={(e) => setFormData({ ...formData, letter_number: e.target.value })}
                    placeholder="Será gerado automaticamente se vazio"
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="title">Título da Carta *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Título descritivo da carta de aceitação"
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="risk_description">Descrição do Risco</Label>
                  <Textarea
                    id="risk_description"
                    value={formData.risk_description}
                    onChange={(e) => setFormData({ ...formData, risk_description: e.target.value })}
                    rows={3}
                    placeholder="Descrição detalhada do risco a ser aceito..."
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="business_justification">Justificativa de Negócio *</Label>
                  <Textarea
                    id="business_justification"
                    value={formData.business_justification}
                    onChange={(e) => setFormData({ ...formData, business_justification: e.target.value })}
                    rows={4}
                    placeholder="Justificativa detalhada do ponto de vista de negócio para aceitar este risco..."
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="acceptance_rationale">Racional da Aceitação *</Label>
                  <Textarea
                    id="acceptance_rationale"
                    value={formData.acceptance_rationale}
                    onChange={(e) => setFormData({ ...formData, acceptance_rationale: e.target.value })}
                    rows={4}
                    placeholder="Explicação técnica e estratégica para a aceitação do risco..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="residual_risk_level">Nível de Risco Residual</Label>
                  <Select value={formData.residual_risk_level} onValueChange={(value) => setFormData({ ...formData, residual_risk_level: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Muito Baixo">Muito Baixo</SelectItem>
                      <SelectItem value="Baixo">Baixo</SelectItem>
                      <SelectItem value="Médio">Médio</SelectItem>
                      <SelectItem value="Alto">Alto</SelectItem>
                      <SelectItem value="Muito Alto">Muito Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="financial_exposure">Exposição Financeira (R$)</Label>
                  <Input
                    id="financial_exposure"
                    type="number"
                    value={formData.financial_exposure}
                    onChange={(e) => setFormData({ ...formData, financial_exposure: parseFloat(e.target.value) })}
                    placeholder="Valor da exposição financeira"
                  />
                </div>
                
                <div>
                  <Label>Data de Início</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.acceptance_period_start && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.acceptance_period_start ? 
                          format(formData.acceptance_period_start, "dd/MM/yyyy", { locale: ptBR }) : 
                          "Selecionar data"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.acceptance_period_start}
                        onSelect={(date) => date && setFormData({ ...formData, acceptance_period_start: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label>Data de Fim</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.acceptance_period_end && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.acceptance_period_end ? 
                          format(formData.acceptance_period_end, "dd/MM/yyyy", { locale: ptBR }) : 
                          "Selecionar data"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.acceptance_period_end}
                        onSelect={(date) => date && setFormData({ ...formData, acceptance_period_end: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label htmlFor="review_frequency">Frequência de Revisão</Label>
                  <Select value={formData.review_frequency} onValueChange={(value) => setFormData({ ...formData, review_frequency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="semiannually">Semestral</SelectItem>
                      <SelectItem value="annually">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Dynamic Arrays */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Requisitos de Monitoramento</Label>
                    <Button size="sm" onClick={() => addArrayItem('monitoring_requirements')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.monitoring_requirements.map((req, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={req}
                          onChange={(e) => updateArrayField('monitoring_requirements', index, e.target.value)}
                          placeholder="Requisito de monitoramento..."
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeArrayItem('monitoring_requirements', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Gatilhos de Escalação</Label>
                    <Button size="sm" onClick={() => addArrayItem('escalation_triggers')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.escalation_triggers.map((trigger, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={trigger}
                          onChange={(e) => updateArrayField('escalation_triggers', index, e.target.value)}
                          placeholder="Gatilho de escalação..."
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeArrayItem('escalation_triggers', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Controles Compensatórios</Label>
                    <Button size="sm" onClick={() => addArrayItem('compensating_controls')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.compensating_controls.map((control, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={control}
                          onChange={(e) => updateArrayField('compensating_controls', index, e.target.value)}
                          placeholder="Controle compensatório..."
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeArrayItem('compensating_controls', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setFormData({
                  risk_id: '',
                  letter_number: '',
                  title: '',
                  risk_description: '',
                  business_justification: '',
                  acceptance_rationale: '',
                  residual_risk_level: 'Médio',
                  residual_risk_score: 0,
                  financial_exposure: 0,
                  acceptance_period_start: new Date(),
                  acceptance_period_end: addYears(new Date(), 1),
                  monitoring_requirements: [''],
                  escalation_triggers: [''],
                  review_frequency: 'quarterly',
                  next_review_date: addMonths(new Date(), 3),
                  conditions_and_limitations: [''],
                  compensating_controls: [''],
                  stakeholder_notifications: [''],
                  status: 'draft'
                })}>
                  Limpar
                </Button>
                <Button onClick={saveLetter} disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <FileCheck className="h-4 w-4 mr-2" />
                      Salvar Carta
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cartas de Aceitação de Risco</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {letters.map((letter) => (
                  <div key={letter.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <h4 className="font-medium">{letter.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {letter.letter_number} • {letter.residual_risk_level}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(letter.status)}>
                          {letter.status}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => setCurrentLetter(letter)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => printRiskLetter(letter)}
                          disabled={isGenerating}
                          title="Imprimir Carta"
                        >
                          {isGenerating ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                        {letter.status === 'draft' && (
                          <Button size="sm" onClick={() => submitForApproval(letter.id!)}>
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Exposição: </span>
                        {formatCurrency(letter.financial_exposure)}
                      </div>
                      <div>
                        <span className="font-medium">Período: </span>
                        {format(new Date(letter.acceptance_period_start), 'dd/MM/yyyy')} - {format(new Date(letter.acceptance_period_end), 'dd/MM/yyyy')}
                      </div>
                      <div>
                        <span className="font-medium">Próxima Revisão: </span>
                        {format(new Date(letter.next_review_date), 'dd/MM/yyyy')}
                      </div>
                    </div>
                  </div>
                ))}
                
                {letters.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhuma carta de aceitação encontrada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approve" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow de Aprovação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {letters.filter(l => l.status === 'pending_approval').map((letter) => (
                  <div key={letter.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium">{letter.title}</h4>
                        <p className="text-sm text-muted-foreground">{letter.letter_number}</p>
                      </div>
                      <Badge className={getStatusColor(letter.status)}>
                        {letter.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {['manager', 'director', 'cro', 'board'].map((level) => {
                        const Icon = getApprovalIcon(level);
                        const status = letter[`${level}_approval_status` as keyof RiskAcceptanceLetter] as string;
                        
                        return (
                          <div key={level} className="p-3 border rounded">
                            <div className="flex items-center space-x-2 mb-2">
                              <Icon className="h-4 w-4" />
                              <span className="text-sm font-medium capitalize">{level}</span>
                            </div>
                            
                            {status ? (
                              <Badge className={status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {status}
                              </Badge>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    onClick={() => approveRejectLetter(letter.id!, 'approve', level, 'Aprovado')}
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => approveRejectLetter(letter.id!, 'reject', level, 'Rejeitado')}
                                  >
                                    <XCircle className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                {letters.filter(l => l.status === 'pending_approval').length === 0 && (
                  <div className="text-center py-8">
                    <Workflow className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhuma carta pendente de aprovação</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Novo Registro de Monitoramento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Carta de Risco</Label>
                  <Select value={monitoringForm.letter_id} onValueChange={(value) => {
                    setMonitoringForm({ ...monitoringForm, letter_id: value });
                    fetchMonitoringRecords(value);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma carta..." />
                    </SelectTrigger>
                    <SelectContent>
                      {letters.filter(l => l.status === 'approved').map((letter) => (
                        <SelectItem key={letter.id} value={letter.id!}>
                          {letter.letter_number} - {letter.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nível Atual</Label>
                    <Select value={monitoringForm.risk_level_current} onValueChange={(value) => setMonitoringForm({ ...monitoringForm, risk_level_current: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Muito Baixo">Muito Baixo</SelectItem>
                        <SelectItem value="Baixo">Baixo</SelectItem>
                        <SelectItem value="Médio">Médio</SelectItem>
                        <SelectItem value="Alto">Alto</SelectItem>
                        <SelectItem value="Muito Alto">Muito Alto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Score Atual</Label>
                    <Input
                      type="number"
                      value={monitoringForm.risk_score_current}
                      onChange={(e) => setMonitoringForm({ ...monitoringForm, risk_score_current: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Notas de Monitoramento</Label>
                  <Textarea
                    value={monitoringForm.monitoring_notes}
                    onChange={(e) => setMonitoringForm({ ...monitoringForm, monitoring_notes: e.target.value })}
                    rows={4}
                    placeholder="Observações sobre o monitoramento..."
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={monitoringForm.action_required}
                    onCheckedChange={(checked) => setMonitoringForm({ ...monitoringForm, action_required: checked as boolean })}
                  />
                  <Label>Ação requerida</Label>
                </div>
                
                <Button onClick={addMonitoringRecord} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Registrar Monitoramento
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Monitoramento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {monitoringRecords.map((record) => (
                    <div key={record.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {format(new Date(record.monitoring_date), 'dd/MM/yyyy')}
                        </span>
                        <Badge className={record.monitoring_status === 'compliant' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {record.monitoring_status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{record.monitoring_notes}</p>
                      {record.action_required && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded">
                          <p className="text-xs text-yellow-800">⚠️ Ação requerida</p>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {monitoringRecords.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">Nenhum registro de monitoramento</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};