import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Plus, X, Building2, Users, Shield, DollarSign, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Vendor, VendorStatus, VendorRiskLevel, VendorCategory, VendorType } from '@/types/vendor-management';

interface VendorFormProps {
  vendor?: Vendor;
  profiles: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const VENDOR_STATUSES: Record<VendorStatus, string> = {
  'Active': 'Ativo',
  'Inactive': 'Inativo',
  'Suspended': 'Suspenso',
  'Under Review': 'Em Análise',
  'Approved': 'Aprovado',
  'Rejected': 'Rejeitado',
  'Pending Approval': 'Aguardando Aprovação',
  'Terminated': 'Terminado',
  'Blacklisted': 'Lista Negra'
};

const VENDOR_RISK_LEVELS: Record<VendorRiskLevel, string> = {
  'Critical': 'Crítico',
  'High': 'Alto',
  'Medium': 'Médio',
  'Low': 'Baixo',
  'Minimal': 'Mínimo'
};

const VENDOR_CATEGORIES: Record<VendorCategory, string> = {
  'Critical Vendor': 'Fornecedor Crítico',
  'Strategic Partner': 'Parceiro Estratégico',
  'Preferred Vendor': 'Fornecedor Preferencial',
  'Standard Vendor': 'Fornecedor Padrão',
  'Sole Source': 'Fonte Única',
  'Temporary Vendor': 'Fornecedor Temporário',
  'Emergency Vendor': 'Fornecedor Emergencial'
};

const VENDOR_TYPES: Record<VendorType, string> = {
  'Technology Provider': 'Provedor de Tecnologia',
  'Professional Services': 'Serviços Profissionais',
  'Manufacturing': 'Manufatura',
  'Logistics': 'Logística',
  'Financial Services': 'Serviços Financeiros',
  'Healthcare Provider': 'Provedor de Saúde',
  'Outsourcing Provider': 'Provedor de Terceirização',
  'Cloud Service Provider': 'Provedor de Serviços em Nuvem',
  'Data Processor': 'Processador de Dados',
  'Consultant': 'Consultor',
  'Contractor': 'Contratado'
};

const VendorForm: React.FC<VendorFormProps> = ({
  vendor,
  profiles,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  // Form state
  const [formData, setFormData] = useState({
    name: vendor?.name || '',
    legal_name: vendor?.legal_name || '',
    tax_id: vendor?.tax_id || '',
    vendor_type: vendor?.vendor_type || '',
    vendor_category: vendor?.vendor_category || '',
    status: vendor?.status || 'Active',
    overall_risk_level: vendor?.overall_risk_level || 'Medium',
    primary_contact_name: vendor?.primary_contact_name || '',
    primary_contact_email: vendor?.primary_contact_email || '',
    primary_contact_phone: vendor?.primary_contact_phone || '',
    address_street: vendor?.address?.street || '',
    address_city: vendor?.address?.city || '',
    address_state: vendor?.address?.state || '',
    address_postal_code: vendor?.address?.postal_code || '',
    address_country: vendor?.address?.country || 'Brasil',
    relationship_manager: vendor?.relationship_manager || '',
    business_criticality: vendor?.business_criticality || 'Medium',
    data_access_level: vendor?.data_access_level || 'Internal',
    monitoring_frequency: vendor?.monitoring_frequency || 'Quarterly',
    annual_spend: vendor?.annual_spend || '',
    contract_value: vendor?.contract_value || '',
    employee_count: vendor?.employee_count || '',
    years_in_business: vendor?.years_in_business || '',
    website: vendor?.website || '',
    industry_sector: vendor?.industry_sector || '',
    notes: vendor?.notes || ''
  });

  // Date states
  const [contractStartDate, setContractStartDate] = useState<Date | undefined>(
    vendor?.contract_start_date ? new Date(vendor.contract_start_date) : undefined
  );
  const [contractEndDate, setContractEndDate] = useState<Date | undefined>(
    vendor?.contract_end_date ? new Date(vendor.contract_end_date) : undefined
  );
  const [nextAssessmentDate, setNextAssessmentDate] = useState<Date | undefined>(
    vendor?.next_risk_assessment_due ? new Date(vendor.next_risk_assessment_due) : undefined
  );

  // Array states
  const [certifications, setCertifications] = useState<string[]>(
    vendor?.certifications?.map(c => typeof c === 'string' ? c : c.name) || []
  );
  const [serviceRequirements, setServiceRequirements] = useState<string[]>(
    vendor?.service_level_requirements || []
  );
  const [tags, setTags] = useState<string[]>(vendor?.tags || []);

  // Input states for adding items
  const [newCertification, setNewCertification] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      address: {
        street: formData.address_street,
        city: formData.address_city,
        state: formData.address_state,
        postal_code: formData.address_postal_code,
        country: formData.address_country
      },
      contract_start_date: contractStartDate ? format(contractStartDate, 'yyyy-MM-dd') : null,
      contract_end_date: contractEndDate ? format(contractEndDate, 'yyyy-MM-dd') : null,
      next_risk_assessment_due: nextAssessmentDate ? format(nextAssessmentDate, 'yyyy-MM-dd') : null,
      certifications: certifications.map(name => ({ name, status: 'Valid' as const })),
      service_level_requirements: serviceRequirements,
      tags,
      annual_spend: formData.annual_spend ? parseFloat(formData.annual_spend) : null,
      contract_value: formData.contract_value ? parseFloat(formData.contract_value) : null,
      employee_count: formData.employee_count ? parseInt(formData.employee_count) : null,
      years_in_business: formData.years_in_business ? parseInt(formData.years_in_business) : null,
      onboarding_date: vendor?.onboarding_date || new Date(),
      auto_renewal: vendor?.auto_renewal || false
    };

    onSubmit(submitData);
  };

  const addCertification = () => {
    if (newCertification.trim() && !certifications.includes(newCertification.trim())) {
      setCertifications([...certifications, newCertification.trim()]);
      setNewCertification('');
    }
  };

  const removeCertification = (certification: string) => {
    setCertifications(certifications.filter(c => c !== certification));
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !serviceRequirements.includes(newRequirement.trim())) {
      setServiceRequirements([...serviceRequirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const removeRequirement = (requirement: string) => {
    setServiceRequirements(serviceRequirements.filter(r => r !== requirement));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Básico
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Contato
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Risco
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Fornecedor *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legal_name">Razão Social *</Label>
                  <Input
                    id="legal_name"
                    value={formData.legal_name}
                    onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax_id">CNPJ/CPF *</Label>
                  <Input
                    id="tax_id"
                    value={formData.tax_id}
                    onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendor_type">Tipo de Fornecedor *</Label>
                  <Select
                    value={formData.vendor_type}
                    onValueChange={(value) => setFormData({ ...formData, vendor_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(VENDOR_TYPES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendor_category">Categoria *</Label>
                  <Select
                    value={formData.vendor_category}
                    onValueChange={(value) => setFormData({ ...formData, vendor_category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(VENDOR_CATEGORIES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as VendorStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(VENDOR_STATUSES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry_sector">Setor da Indústria</Label>
                <Input
                  id="industry_sector"
                  value={formData.industry_sector}
                  onChange={(e) => setFormData({ ...formData, industry_sector: e.target.value })}
                  placeholder="Ex: Tecnologia, Saúde, Financeiro..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_contact_name">Contato Principal *</Label>
                  <Input
                    id="primary_contact_name"
                    value={formData.primary_contact_name}
                    onChange={(e) => setFormData({ ...formData, primary_contact_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary_contact_email">Email Principal *</Label>
                  <Input
                    id="primary_contact_email"
                    type="email"
                    value={formData.primary_contact_email}
                    onChange={(e) => setFormData({ ...formData, primary_contact_email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary_contact_phone">Telefone</Label>
                  <Input
                    id="primary_contact_phone"
                    value={formData.primary_contact_phone}
                    onChange={(e) => setFormData({ ...formData, primary_contact_phone: e.target.value })}
                  />
                </div>
              </div>

              <Separator />
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Endereço</h4>
                <div className="space-y-2">
                  <Label htmlFor="address_street">Logradouro</Label>
                  <Input
                    id="address_street"
                    value={formData.address_street}
                    onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                    placeholder="Rua, Avenida, número..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address_city">Cidade</Label>
                    <Input
                      id="address_city"
                      value={formData.address_city}
                      onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address_state">Estado</Label>
                    <Input
                      id="address_state"
                      value={formData.address_state}
                      onChange={(e) => setFormData({ ...formData, address_state: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address_postal_code">CEP</Label>
                    <Input
                      id="address_postal_code"
                      value={formData.address_postal_code}
                      onChange={(e) => setFormData({ ...formData, address_postal_code: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address_country">País</Label>
                    <Input
                      id="address_country"
                      value={formData.address_country}
                      onChange={(e) => setFormData({ ...formData, address_country: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Avaliação de Risco</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="overall_risk_level">Nível de Risco Geral</Label>
                  <Select
                    value={formData.overall_risk_level}
                    onValueChange={(value) => setFormData({ ...formData, overall_risk_level: value as VendorRiskLevel })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(VENDOR_RISK_LEVELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_criticality">Criticidade do Negócio</Label>
                  <Select
                    value={formData.business_criticality}
                    onValueChange={(value) => setFormData({ ...formData, business_criticality: value as 'Critical' | 'High' | 'Medium' | 'Low' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Critical">Crítico</SelectItem>
                      <SelectItem value="High">Alto</SelectItem>
                      <SelectItem value="Medium">Médio</SelectItem>
                      <SelectItem value="Low">Baixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_access_level">Nível de Acesso aos Dados</Label>
                  <Select
                    value={formData.data_access_level}
                    onValueChange={(value) => setFormData({ ...formData, data_access_level: value as 'Public' | 'Internal' | 'Confidential' | 'Restricted' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Public">Público</SelectItem>
                      <SelectItem value="Internal">Interno</SelectItem>
                      <SelectItem value="Confidential">Confidencial</SelectItem>
                      <SelectItem value="Restricted">Restrito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monitoring_frequency">Frequência de Monitoramento</Label>
                  <Select
                    value={formData.monitoring_frequency}
                    onValueChange={(value) => setFormData({ ...formData, monitoring_frequency: value as MonitoringFrequency })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Continuous">Contínuo</SelectItem>
                      <SelectItem value="Weekly">Semanal</SelectItem>
                      <SelectItem value="Monthly">Mensal</SelectItem>
                      <SelectItem value="Quarterly">Trimestral</SelectItem>
                      <SelectItem value="Semi-Annual">Semestral</SelectItem>
                      <SelectItem value="Annual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Próxima Avaliação de Risco</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !nextAssessmentDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {nextAssessmentDate ? (
                          format(nextAssessmentDate, "PPP", { locale: ptBR })
                        ) : (
                          "Selecione uma data"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={nextAssessmentDate}
                        onSelect={setNextAssessmentDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship_manager">Gerente de Relacionamento</Label>
                <Select
                  value={formData.relationship_manager}
                  onValueChange={(value) => setFormData({ ...formData, relationship_manager: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um gerente" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles?.map((profile) => (
                      <SelectItem key={profile.user_id} value={profile.user_id}>
                        {profile.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Financeiras</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="annual_spend">Gasto Anual (R$)</Label>
                  <Input
                    id="annual_spend"
                    type="number"
                    value={formData.annual_spend}
                    onChange={(e) => setFormData({ ...formData, annual_spend: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contract_value">Valor do Contrato (R$)</Label>
                  <Input
                    id="contract_value"
                    type="number"
                    value={formData.contract_value}
                    onChange={(e) => setFormData({ ...formData, contract_value: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de Início do Contrato</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !contractStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {contractStartDate ? (
                          format(contractStartDate, "PPP", { locale: ptBR })
                        ) : (
                          "Selecione uma data"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={contractStartDate}
                        onSelect={setContractStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Data de Fim do Contrato</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !contractEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {contractEndDate ? (
                          format(contractEndDate, "PPP", { locale: ptBR })
                        ) : (
                          "Selecione uma data"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={contractEndDate}
                        onSelect={setContractEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee_count">Número de Funcionários</Label>
                  <Input
                    id="employee_count"
                    type="number"
                    value={formData.employee_count}
                    onChange={(e) => setFormData({ ...formData, employee_count: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="years_in_business">Anos no Mercado</Label>
                  <Input
                    id="years_in_business"
                    type="number"
                    value={formData.years_in_business}
                    onChange={(e) => setFormData({ ...formData, years_in_business: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certificações e Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Certificações</Label>
                <div className="flex gap-2">
                  <Input
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    placeholder="Ex: ISO 27001, SOC 2..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                  />
                  <Button type="button" onClick={addCertification} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {certifications.map((cert) => (
                    <Badge key={cert} variant="secondary" className="flex items-center gap-1">
                      {cert}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeCertification(cert)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Requisitos de Nível de Serviço</Label>
                <div className="flex gap-2">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Ex: 99.9% uptime, Resposta em 24h..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                  />
                  <Button type="button" onClick={addRequirement} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {serviceRequirements.map((req) => (
                    <Badge key={req} variant="outline" className="flex items-center gap-1">
                      {req}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeRequirement(req)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Ex: Crítico, Cloud, LGPD..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} className="flex items-center gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações adicionais sobre o fornecedor..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : vendor ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
};

export default VendorForm;