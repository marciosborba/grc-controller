import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardHeader,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  ChevronDown,
  ChevronRight,
  Building,
  FileCheck,
  AlertTriangle,
  FileText,
  BarChart3,
  History,
  Edit,
  CheckCircle,
  Clock,
  XCircle,
  Shield,
  AlertCircle,
  Info,
  Star,
  Monitor,
  Cloud,
  Briefcase,
  Package,
  Truck,
  DollarSign,
  Database
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { 
  Vendor, 
  VendorStatus, 
  VendorType,
  VendorRiskLevel,
  VendorCategory
} from '@/types/vendor-management';

interface VendorCardProps {
  vendor: Vendor;
  onUpdate?: (vendorId: string, updates: any) => void;
  onDelete?: (vendorId: string) => void;
  canEdit?: boolean;
}

const VendorCard: React.FC<VendorCardProps> = ({
  vendor,
  onUpdate,
  onDelete,
  canEdit = true
}) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'general' | 'assessments' | 'risks' | 'issues' | 'contracts' | 'performance' | 'history'>('general');
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Form states
  const [generalData, setGeneralData] = useState({
    name: vendor.name,
    legalName: vendor.legal_name,
    taxId: vendor.tax_id,
    vendorType: vendor.vendor_type,
    category: vendor.vendor_category,
    status: vendor.status,
    riskLevel: vendor.overall_risk_level,
    criticality: vendor.business_criticality,
    contactName: vendor.primary_contact_name,
    contactEmail: vendor.primary_contact_email,
    contactPhone: vendor.primary_contact_phone || '',
    manager: vendor.relationship_manager || '',
    contractStart: vendor.contract_start_date ? format(vendor.contract_start_date, 'yyyy-MM-dd') : '',
    contractEnd: vendor.contract_end_date ? format(vendor.contract_end_date, 'yyyy-MM-dd') : '',
    contractValue: vendor.contract_value || 0,
    annualSpend: vendor.annual_spend || 0
  });

  const handleSaveGeneral = useCallback(() => {
    if (onUpdate) {
      const updates = {
        name: generalData.name,
        legal_name: generalData.legalName,
        tax_id: generalData.taxId,
        vendor_type: generalData.vendorType,
        vendor_category: generalData.category,
        status: generalData.status,
        overall_risk_level: generalData.riskLevel,
        business_criticality: generalData.criticality,
        primary_contact_name: generalData.contactName,
        primary_contact_email: generalData.contactEmail,
        primary_contact_phone: generalData.contactPhone,
        relationship_manager: generalData.manager,
        contract_start_date: generalData.contractStart ? new Date(generalData.contractStart) : null,
        contract_end_date: generalData.contractEnd ? new Date(generalData.contractEnd) : null,
        contract_value: generalData.contractValue,
        annual_spend: generalData.annualSpend,
        updated_by: user?.id,
        updated_at: new Date()
      };
      onUpdate(vendor.id, updates);
      setIsEditingGeneral(false);
      toast.success('Fornecedor atualizado com sucesso');
    }
  }, [generalData, vendor.id, onUpdate, user?.id]);

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(vendor.id);
      toast.success('Fornecedor excluído com sucesso');
    }
    setShowDeleteDialog(false);
  }, [vendor.id, onDelete]);

  const getStatusIcon = (status: VendorStatus) => {
    switch (status) {
      case 'Active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Suspended': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'Under Review': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'Pending Approval': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'Terminated': return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return <Building className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: VendorStatus) => {
    switch (status) {
      case 'Active': return 'border-green-300 bg-green-50 text-green-800 dark:border-green-600 dark:bg-green-900 dark:text-green-200';
      case 'Suspended': return 'border-red-300 bg-red-50 text-red-800 dark:border-red-600 dark:bg-red-900 dark:text-red-200';
      case 'Under Review': return 'border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-600 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Pending Approval': return 'border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-600 dark:bg-orange-900 dark:text-orange-200';
      case 'Terminated': return 'border-gray-300 bg-gray-50 text-gray-800 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200';
      default: return 'border-gray-300 bg-gray-50 text-gray-800 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRiskLevelColor = (level: VendorRiskLevel) => {
    switch (level) {
      case 'Critical': return 'text-red-600 dark:text-red-400';
      case 'High': return 'text-orange-600 dark:text-orange-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'Low': return 'text-blue-600 dark:text-blue-400';
      case 'Minimal': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getRiskLevelIcon = (level: VendorRiskLevel) => {
    switch (level) {
      case 'Critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'High': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'Medium': return <Info className="h-4 w-4 text-yellow-600" />;
      case 'Low': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'Minimal': return <Shield className="h-4 w-4 text-green-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: VendorType) => {
    switch (type) {
      case 'Technology Provider': return <Monitor className="h-5 w-5" />;
      case 'Cloud Service Provider': return <Cloud className="h-5 w-5" />;
      case 'Professional Services': return <Briefcase className="h-5 w-5" />;
      case 'Manufacturing': return <Package className="h-5 w-5" />;
      case 'Logistics': return <Truck className="h-5 w-5" />;
      case 'Financial Services': return <DollarSign className="h-5 w-5" />;
      case 'Data Processor': return <Database className="h-5 w-5" />;
      default: return <Building className="h-5 w-5" />;
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'Critical': return 'text-red-600 dark:text-red-400';
      case 'High': return 'text-orange-600 dark:text-orange-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'Low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const performanceScore = 85; // Mock performance score
  const assessmentsCount = vendor.assessments?.length || 0;
  const risksCount = vendor.identified_risks?.length || 0;
  const issuesCount = vendor.open_issues?.length || 0;
  const contractsCount = vendor.contracts?.length || 0;
  const hasExpiringContracts = vendor.contract_end_date ? new Date(vendor.contract_end_date) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) : false;

  return (
    <Card className={cn(
      "w-full transition-all duration-300 overflow-hidden cursor-pointer",
      isExpanded 
        ? "bg-gray-50 dark:bg-gray-800 shadow-lg ring-2 ring-primary/20" 
        : "hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
    )}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              {/* Left Section - Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {isExpanded ? 
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : 
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                }
                
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
                  {getTypeIcon(vendor.vendor_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm text-foreground truncate">
                      {vendor.name}
                    </h3>
                    {hasExpiringContracts && (
                      <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    )}
                    {vendor.business_criticality === 'Critical' && (
                      <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{vendor.vendor_category}</span>
                    <span>•</span>
                    <span className="truncate">{vendor.vendor_type}</span>
                    {vendor.relationship_manager && (
                      <>
                        <span>•</span>
                        <span className="truncate">Gerente: {vendor.relationship_manager}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Center Section - Metrics */}
              <div className="flex items-center gap-2">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Risco</div>
                  <div className="flex items-center gap-1">
                    {getRiskLevelIcon(vendor.overall_risk_level)}
                    <span className={cn("text-xs font-medium", getRiskLevelColor(vendor.overall_risk_level))}>
                      {vendor.overall_risk_level}
                    </span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Performance</div>
                  <div className="flex items-center gap-2">
                    <Progress value={performanceScore} className="w-12 h-2" />
                    <span className="text-xs font-medium">{performanceScore}</span>
                  </div>
                </div>

                {issuesCount > 0 && (
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Questões</div>
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 text-red-500" />
                      <span className="text-xs font-medium text-red-600">{issuesCount}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right Section */}
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(vendor.status)}
                  <Badge className={cn("text-xs", getStatusColor(vendor.status))}>
                    {vendor.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className={cn("font-medium", getCriticalityColor(vendor.business_criticality))}>
                    {vendor.business_criticality}
                  </span>
                  {vendor.contract_end_date && (
                    <>
                      <span className="mx-1">•</span>
                      <span className={cn(
                        hasExpiringContracts ? "text-orange-600 font-medium" : ""
                      )}>
                        {format(vendor.contract_end_date, "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-6">
              {/* Navigation Tabs */}
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setActiveSection('general')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'general' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Building className="h-4 w-4" />
                  Geral
                </button>
                
                <button
                  onClick={() => setActiveSection('assessments')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'assessments' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <FileCheck className="h-4 w-4" />
                  Assessments
                  {assessmentsCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 text-xs">
                      {assessmentsCount}
                    </Badge>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveSection('risks')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'risks' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <AlertTriangle className="h-4 w-4" />
                  Riscos
                  {risksCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 text-xs">
                      {risksCount}
                    </Badge>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveSection('issues')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'issues' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <AlertCircle className="h-4 w-4" />
                  Questões
                  {issuesCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 text-xs">
                      {issuesCount}
                    </Badge>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveSection('contracts')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'contracts' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Contratos
                  {contractsCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 text-xs">
                      {contractsCount}
                    </Badge>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveSection('performance')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'performance' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  Performance
                </button>
                
                <button
                  onClick={() => setActiveSection('history')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'history' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <History className="h-4 w-4" />
                  Histórico
                </button>
              </div>

              {/* Section Content */}
              {/* 1. INFORMAÇÕES GERAIS */}
              {activeSection === 'general' && (
                <div className="space-y-4">
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
                      <div>
                        <Label htmlFor="name">Nome do Fornecedor</Label>
                        <Input
                          id="name"
                          value={generalData.name}
                          onChange={(e) => setGeneralData({ ...generalData, name: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="legalName">Razão Social</Label>
                        <Input
                          id="legalName"
                          value={generalData.legalName}
                          onChange={(e) => setGeneralData({ ...generalData, legalName: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="taxId">CNPJ</Label>
                        <Input
                          id="taxId"
                          value={generalData.taxId}
                          onChange={(e) => setGeneralData({ ...generalData, taxId: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="vendorType">Tipo</Label>
                        <Select
                          value={generalData.vendorType}
                          onValueChange={(value) => setGeneralData({ ...generalData, vendorType: value as VendorType })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Technology Provider">Technology Provider</SelectItem>
                            <SelectItem value="Cloud Service Provider">Cloud Service Provider</SelectItem>
                            <SelectItem value="Professional Services">Professional Services</SelectItem>
                            <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="Logistics">Logistics</SelectItem>
                            <SelectItem value="Financial Services">Financial Services</SelectItem>
                            <SelectItem value="Data Processor">Data Processor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="category">Categoria</Label>
                        <Select
                          value={generalData.category}
                          onValueChange={(value) => setGeneralData({ ...generalData, category: value as VendorCategory })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Software & IT Services">Software & IT Services</SelectItem>
                            <SelectItem value="Infrastructure Services">Infrastructure Services</SelectItem>
                            <SelectItem value="Professional Services">Professional Services</SelectItem>
                            <SelectItem value="Legal Services">Legal Services</SelectItem>
                            <SelectItem value="Consulting">Consulting</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={generalData.status}
                          onValueChange={(value) => setGeneralData({ ...generalData, status: value as VendorStatus })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Suspended">Suspended</SelectItem>
                            <SelectItem value="Under Review">Under Review</SelectItem>
                            <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                            <SelectItem value="Terminated">Terminated</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="riskLevel">Nível de Risco</Label>
                        <Select
                          value={generalData.riskLevel}
                          onValueChange={(value) => setGeneralData({ ...generalData, riskLevel: value as VendorRiskLevel })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Critical">Critical</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Minimal">Minimal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="criticality">Criticidade do Negócio</Label>
                        <Select
                          value={generalData.criticality}
                          onValueChange={(value) => setGeneralData({ ...generalData, criticality: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Critical">Critical</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="contactName">Contato Principal</Label>
                        <Input
                          id="contactName"
                          value={generalData.contactName}
                          onChange={(e) => setGeneralData({ ...generalData, contactName: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="contactEmail">E-mail</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={generalData.contactEmail}
                          onChange={(e) => setGeneralData({ ...generalData, contactEmail: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="contactPhone">Telefone</Label>
                        <Input
                          id="contactPhone"
                          value={generalData.contactPhone}
                          onChange={(e) => setGeneralData({ ...generalData, contactPhone: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="manager">Gerente de Relacionamento</Label>
                        <Input
                          id="manager"
                          value={generalData.manager}
                          onChange={(e) => setGeneralData({ ...generalData, manager: e.target.value })}
                        />
                      </div>

                      <div className="col-span-2 flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsEditingGeneral(false)}
                        >
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveGeneral}>
                          Salvar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Nome</Label>
                          <p className="text-sm font-medium">{vendor.name}</p>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Razão Social</Label>
                          <p className="text-sm">{vendor.legal_name}</p>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">CNPJ</Label>
                          <p className="text-sm">{vendor.tax_id}</p>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Tipo</Label>
                          <p className="text-sm">{vendor.vendor_type}</p>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Status</Label>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(vendor.status)}
                            <Badge className={cn("text-xs", getStatusColor(vendor.status))}>
                              {vendor.status}
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground">Score de Performance</Label>
                          <div className="flex items-center gap-2">
                            <Progress value={performanceScore} className="flex-1" />
                            <span className="text-sm font-medium">{performanceScore}/100</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Categoria</Label>
                          <p className="text-sm">{vendor.vendor_category}</p>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Nível de Risco</Label>
                          <div className="flex items-center gap-2">
                            {getRiskLevelIcon(vendor.overall_risk_level)}
                            <span className={cn("text-sm font-medium", getRiskLevelColor(vendor.overall_risk_level))}>
                              {vendor.overall_risk_level}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Criticidade do Negócio</Label>
                          <p className={cn("text-sm font-medium", getCriticalityColor(vendor.business_criticality))}>
                            {vendor.business_criticality}
                          </p>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Contato Principal</Label>
                          <p className="text-sm">{vendor.primary_contact_name}</p>
                          <p className="text-xs text-muted-foreground">{vendor.primary_contact_email}</p>
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground">Gerente de Relacionamento</Label>
                          <p className="text-sm">{vendor.relationship_manager || 'Não definido'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            <div className="text-muted-foreground">Questões Abertas</div>
                            <div className="text-lg font-bold text-red-600">{issuesCount}</div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            <div className="text-muted-foreground">Riscos Alto/Crítico</div>
                            <div className="text-lg font-bold text-orange-600">{risksCount}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Other sections would be implemented similarly */}
              {activeSection === 'assessments' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-muted-foreground">ASSESSMENTS</h4>
                  <div className="text-center py-8 text-muted-foreground">
                    <FileCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum assessment realizado</p>
                    <p className="text-xs">Clique para criar um novo assessment</p>
                  </div>
                </div>
              )}

              {activeSection === 'risks' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-muted-foreground">RISCOS IDENTIFICADOS</h4>
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum risco identificado</p>
                    <p className="text-xs">Clique para registrar riscos</p>
                  </div>
                </div>
              )}

              {activeSection === 'issues' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-muted-foreground">QUESTÕES EM ABERTO</h4>
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma questão registrada</p>
                    <p className="text-xs">Clique para registrar questões</p>
                  </div>
                </div>
              )}

              {activeSection === 'contracts' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-muted-foreground">CONTRATOS</h4>
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum contrato cadastrado</p>
                    <p className="text-xs">Clique para adicionar contratos</p>
                  </div>
                </div>
              )}

              {activeSection === 'performance' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-muted-foreground">PERFORMANCE</h4>
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Métricas de performance serão exibidas aqui</p>
                    <p className="text-xs">Dados em desenvolvimento</p>
                  </div>
                </div>
              )}

              {activeSection === 'history' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-muted-foreground">HISTÓRICO</h4>
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma alteração registrada</p>
                    <p className="text-xs">Histórico será exibido aqui</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este fornecedor? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default VendorCard;