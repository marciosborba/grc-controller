import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  CalendarIcon, 
  AlertTriangle, 
  TrendingUp, 
  Shield, 
  User,
  Building2,
  Target,
  Clock,
  Plus,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VendorRisk {
  id?: string;
  vendor_id: string;
  title: string;
  description: string;
  risk_category: string;
  likelihood: string;
  impact: string;
  risk_level: string;
  risk_score: number;
  status: string;
  risk_owner: string;
  identified_date: string;
  next_review_date?: string;
  mitigation_actions: any[];
  risk_treatment_strategy?: string;
  risk_source?: string;
  potential_consequences?: string[];
  existing_controls?: string[];
  target_risk_level?: string;
  monitoring_frequency?: string;
}

interface VendorRiskFormProps {
  risk?: VendorRisk | null;
  vendors: any[];
  profiles: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const VendorRiskForm = ({ risk, vendors, profiles, onSubmit, onCancel }: VendorRiskFormProps) => {
  const [formData, setFormData] = useState<Partial<VendorRisk>>({
    vendor_id: '',
    title: '',
    description: '',
    risk_category: 'Operational Risk',
    likelihood: 'Medium',
    impact: 'Medium',
    risk_level: 'medium',
    risk_score: 9,
    status: 'open',
    risk_owner: '',
    identified_date: new Date().toISOString().split('T')[0],
    next_review_date: '',
    risk_treatment_strategy: 'Mitigate',
    risk_source: '',
    potential_consequences: [],
    existing_controls: [],
    target_risk_level: 'low',
    monitoring_frequency: 'Monthly',
    mitigation_actions: []
  });

  const [identifiedDate, setIdentifiedDate] = useState<Date | undefined>(new Date());
  const [reviewDate, setReviewDate] = useState<Date | undefined>();
  const [newConsequence, setNewConsequence] = useState('');
  const [newControl, setNewControl] = useState('');

  useEffect(() => {
    if (risk) {
      setFormData(risk);
      setIdentifiedDate(new Date(risk.identified_date));
      if (risk.next_review_date) {
        setReviewDate(new Date(risk.next_review_date));
      }
    }
  }, [risk]);

  const riskCategories = [
    'Operational Risk',
    'Financial Risk', 
    'Security Risk',
    'Compliance Risk',
    'Reputation Risk',
    'Strategic Risk',
    'Legal Risk',
    'Privacy Risk',
    'Business Continuity Risk',
    'Performance Risk',
    'Concentration Risk'
  ];

  const likelihoodOptions = [
    { value: 'Very Low', label: 'Muito Baixa', score: 1 },
    { value: 'Low', label: 'Baixa', score: 2 },
    { value: 'Medium', label: 'Média', score: 3 },
    { value: 'High', label: 'Alta', score: 4 },
    { value: 'Very High', label: 'Muito Alta', score: 5 }
  ];

  const impactOptions = [
    { value: 'Very Low', label: 'Muito Baixo', score: 1 },
    { value: 'Low', label: 'Baixo', score: 2 },
    { value: 'Medium', label: 'Médio', score: 3 },
    { value: 'High', label: 'Alto', score: 4 },
    { value: 'Very High', label: 'Muito Alto', score: 5 }
  ];

  const statusOptions = [
    { value: 'open', label: 'Em Aberto' },
    { value: 'in_treatment', label: 'Em Tratamento' },
    { value: 'monitored', label: 'Monitorado' },
    { value: 'closed', label: 'Fechado' },
    { value: 'accepted', label: 'Aceito' }
  ];

  const treatmentStrategies = [
    { value: 'Accept', label: 'Aceitar' },
    { value: 'Mitigate', label: 'Mitigar' },
    { value: 'Transfer', label: 'Transferir' },
    { value: 'Avoid', label: 'Evitar' }
  ];

  const monitoringFrequencies = [
    { value: 'Continuous', label: 'Contínuo' },
    { value: 'Weekly', label: 'Semanal' },
    { value: 'Monthly', label: 'Mensal' },
    { value: 'Quarterly', label: 'Trimestral' },
    { value: 'Semi-Annual', label: 'Semestral' },
    { value: 'Annual', label: 'Anual' },
    { value: 'Ad-hoc', label: 'Ad-hoc' }
  ];

  const calculateRiskScore = (likelihood: string, impact: string) => {
    const likelihoodScore = likelihoodOptions.find(l => l.value === likelihood)?.score || 3;
    const impactScore = impactOptions.find(i => i.value === impact)?.score || 3;
    return likelihoodScore * impactScore;
  };

  const getRiskLevel = (score: number) => {
    if (score >= 20) return 'critical';
    if (score >= 15) return 'high';
    if (score >= 9) return 'medium';
    if (score >= 4) return 'low';
    return 'minimal';
  };

  const handleInputChange = (field: string, value: any) => {
    const updatedData = { ...formData, [field]: value };
    
    // Recalcular score quando likelihood ou impact mudarem
    if (field === 'likelihood' || field === 'impact') {
      const newScore = calculateRiskScore(
        field === 'likelihood' ? value : updatedData.likelihood || 'Medium',
        field === 'impact' ? value : updatedData.impact || 'Medium'
      );
      updatedData.risk_score = newScore;
      updatedData.risk_level = getRiskLevel(newScore);
    }

    setFormData(updatedData);
  };

  const handleDateChange = (field: 'identified_date' | 'next_review_date', date: Date | undefined) => {
    if (!date) return;
    
    if (field === 'identified_date') {
      setIdentifiedDate(date);
      handleInputChange(field, date.toISOString());
    } else {
      setReviewDate(date);
      handleInputChange(field, date.toISOString());
    }
  };

  const addConsequence = () => {
    if (!newConsequence.trim()) return;
    const consequences = [...(formData.potential_consequences || []), newConsequence];
    handleInputChange('potential_consequences', consequences);
    setNewConsequence('');
  };

  const removeConsequence = (index: number) => {
    const consequences = [...(formData.potential_consequences || [])];
    consequences.splice(index, 1);
    handleInputChange('potential_consequences', consequences);
  };

  const addControl = () => {
    if (!newControl.trim()) return;
    const controls = [...(formData.existing_controls || []), newControl];
    handleInputChange('existing_controls', controls);
    setNewControl('');
  };

  const removeControl = (index: number) => {
    const controls = [...(formData.existing_controls || [])];
    controls.splice(index, 1);
    handleInputChange('existing_controls', controls);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Informações Básicas do Risco
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor_id">Fornecedor *</Label>
              <Select 
                value={formData.vendor_id} 
                onValueChange={(value) => handleInputChange('vendor_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {vendor.name} ({vendor.category})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="risk_owner">Responsável pelo Risco *</Label>
              <Select 
                value={formData.risk_owner} 
                onValueChange={(value) => handleInputChange('risk_owner', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar responsável" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.user_id} value={profile.user_id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {profile.full_name} ({profile.job_title})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título do Risco *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Ex: Risco de interrupção de serviços críticos"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição Detalhada *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva detalhadamente o risco identificado..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="risk_category">Categoria do Risco *</Label>
              <Select 
                value={formData.risk_category} 
                onValueChange={(value) => handleInputChange('risk_category', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {riskCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="risk_source">Fonte do Risco</Label>
              <Input
                id="risk_source"
                value={formData.risk_source}
                onChange={(e) => handleInputChange('risk_source', e.target.value)}
                placeholder="Ex: Dependência de fornecedor único"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avaliação do Risco */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Avaliação e Classificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="likelihood">Probabilidade *</Label>
              <Select 
                value={formData.likelihood} 
                onValueChange={(value) => handleInputChange('likelihood', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {likelihoodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} ({option.score})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="impact">Impacto *</Label>
              <Select 
                value={formData.impact} 
                onValueChange={(value) => handleInputChange('impact', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {impactOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} ({option.score})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nível de Risco (Calculado)</Label>
              <div className="flex items-center gap-2">
                <Badge className={`${getRiskLevelColor(formData.risk_level || 'medium')} px-3 py-2`}>
                  {formData.risk_level?.charAt(0).toUpperCase() + formData.risk_level?.slice(1)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Score: {formData.risk_score}/25
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status Atual *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="risk_treatment_strategy">Estratégia de Tratamento</Label>
              <Select 
                value={formData.risk_treatment_strategy} 
                onValueChange={(value) => handleInputChange('risk_treatment_strategy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {treatmentStrategies.map((strategy) => (
                    <SelectItem key={strategy.value} value={strategy.value}>
                      {strategy.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Datas e Monitoramento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Cronograma e Monitoramento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Data de Identificação *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !identifiedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {identifiedDate ? format(identifiedDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={identifiedDate}
                    onSelect={(date) => handleDateChange('identified_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Próxima Revisão</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !reviewDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {reviewDate ? format(reviewDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={reviewDate}
                    onSelect={(date) => handleDateChange('next_review_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monitoring_frequency">Frequência de Monitoramento</Label>
              <Select 
                value={formData.monitoring_frequency} 
                onValueChange={(value) => handleInputChange('monitoring_frequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monitoringFrequencies.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consequências Potenciais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Consequências Potenciais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newConsequence}
              onChange={(e) => setNewConsequence(e.target.value)}
              placeholder="Adicionar consequência potencial..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addConsequence())}
            />
            <Button type="button" onClick={addConsequence}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.potential_consequences?.map((consequence, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1">
                {consequence}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => removeConsequence(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Controles Existentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Controles Existentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newControl}
              onChange={(e) => setNewControl(e.target.value)}
              placeholder="Adicionar controle existente..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addControl())}
            />
            <Button type="button" onClick={addControl}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.existing_controls?.map((control, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1">
                {control}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => removeControl(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {risk ? 'Atualizar Risco' : 'Criar Risco'}
        </Button>
      </div>
    </form>
  );
};

export default VendorRiskForm;