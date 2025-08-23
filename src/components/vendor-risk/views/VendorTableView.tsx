import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileCheck,
  AlertTriangle,
  Shield,
  Calendar,
  DollarSign,
  Building,
  Phone,
  Mail,
  Globe,
  Star,
  MoreHorizontal,
  Filter,
  Download,
  Upload,
  Brain,
  Zap
} from 'lucide-react';
import { useVendorRiskManagement, VendorRegistry, VendorFilters } from '@/hooks/useVendorRiskManagement';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VendorTableViewProps {
  searchTerm: string;
  selectedFilter: string;
}

interface VendorFormData {
  name: string;
  legal_name: string;
  tax_id: string;
  website: string;
  description: string;
  business_category: string;
  vendor_type: 'strategic' | 'operational' | 'transactional' | 'critical';
  criticality_level: 'low' | 'medium' | 'high' | 'critical';
  annual_spend: number;
  contract_value: number;
  contract_start_date: string;
  contract_end_date: string;
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone: string;
}

export const VendorTableView: React.FC<VendorTableViewProps> = ({
  searchTerm,
  selectedFilter
}) => {
  const {
    vendors,
    fetchVendors,
    createVendor,
    updateVendor,
    deleteVendor,
    loading
  } = useVendorRiskManagement();

  // State management
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorRegistry | null>(null);
  const [viewingVendor, setViewingVendor] = useState<VendorRegistry | null>(null);
  const [localFilters, setLocalFilters] = useState<VendorFilters>({});

  // Form state
  const [formData, setFormData] = useState<Partial<VendorFormData>>({
    vendor_type: 'operational',
    criticality_level: 'medium',
    annual_spend: 0,
    contract_value: 0
  });

  // Load vendors on mount and when filters change
  useEffect(() => {
    const filters: VendorFilters = {
      search: searchTerm,
      ...localFilters
    };

    // Apply selectedFilter from parent
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'critical') {
        filters.criticality_level = ['critical'];
      } else if (selectedFilter === 'high-risk') {
        filters.criticality_level = ['high', 'critical'];
      } else if (selectedFilter === 'pending-assessment') {
        // This would need additional logic to filter by assessment status
      }
    }

    fetchVendors(filters);
  }, [searchTerm, selectedFilter, localFilters, fetchVendors]);

  // Sort vendors
  const sortedVendors = [...vendors].sort((a, b) => {
    const aVal = a[sortBy as keyof VendorRegistry];
    const bVal = b[sortBy as keyof VendorRegistry];
    
    if (aVal === null || aVal === undefined) return sortOrder === 'asc' ? -1 : 1;
    if (bVal === null || bVal === undefined) return sortOrder === 'asc' ? 1 : -1;
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc' 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal);
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    return 0;
  });

  // Paginate vendors
  const totalPages = Math.ceil(sortedVendors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVendors = sortedVendors.slice(startIndex, startIndex + itemsPerPage);

  // Handle sort
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Handle vendor selection
  const handleVendorSelect = (vendorId: string, checked: boolean) => {
    if (checked) {
      setSelectedVendors(prev => [...prev, vendorId]);
    } else {
      setSelectedVendors(prev => prev.filter(id => id !== vendorId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVendors(paginatedVendors.map(v => v.id));
    } else {
      setSelectedVendors([]);
    }
  };

  // Form handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingVendor) {
      await updateVendor(editingVendor.id, formData);
      setEditingVendor(null);
    } else {
      await createVendor(formData as Omit<VendorRegistry, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>);
      setShowCreateDialog(false);
    }
    
    setFormData({
      vendor_type: 'operational',
      criticality_level: 'medium',
      annual_spend: 0,
      contract_value: 0
    });
  };

  const handleEdit = (vendor: VendorRegistry) => {
    setFormData(vendor);
    setEditingVendor(vendor);
    setShowCreateDialog(true);
  };

  const handleDelete = async (vendorId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
      await deleteVendor(vendorId);
    }
  };

  // Risk level styling
  const getRiskLevelStyle = (riskScore?: number) => {
    if (!riskScore) return 'text-gray-600 bg-gray-100';
    
    if (riskScore >= 4.5) return 'text-red-700 bg-red-100 border-red-200';
    if (riskScore >= 3.5) return 'text-orange-700 bg-orange-100 border-orange-200';
    if (riskScore >= 2.5) return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    return 'text-green-700 bg-green-100 border-green-200';
  };

  const getRiskLevelText = (riskScore?: number) => {
    if (!riskScore) return 'N/A';
    
    if (riskScore >= 4.5) return 'Crítico';
    if (riskScore >= 3.5) return 'Alto';
    if (riskScore >= 2.5) return 'Médio';
    return 'Baixo';
  };

  // Status styling
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100 border-green-200';
      case 'inactive': return 'text-gray-700 bg-gray-100 border-gray-200';
      case 'suspended': return 'text-red-700 bg-red-100 border-red-200';
      case 'onboarding': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'offboarding': return 'text-orange-700 bg-orange-100 border-orange-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'suspended': return 'Suspenso';
      case 'onboarding': return 'Onboarding';
      case 'offboarding': return 'Offboarding';
      default: return status;
    }
  };

  const getVendorTypeText = (type: string) => {
    switch (type) {
      case 'strategic': return 'Estratégico';
      case 'operational': return 'Operacional';
      case 'transactional': return 'Transacional';
      case 'critical': return 'Crítico';
      default: return type;
    }
  };

  const getCriticalityText = (level: string) => {
    switch (level) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      case 'critical': return 'Crítica';
      default: return level;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Fornecedores Registrados</span>
              </CardTitle>
              <CardDescription>
                Gerencie seu catálogo completo de fornecedores e parceiros
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Fornecedor
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center flex-1">
              <Select
                value={localFilters.status?.[0] || 'all'}
                onValueChange={(value) => 
                  setLocalFilters(prev => ({
                    ...prev,
                    status: value === 'all' ? undefined : [value]
                  }))
                }
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={localFilters.criticality_level?.[0] || 'all'}
                onValueChange={(value) => 
                  setLocalFilters(prev => ({
                    ...prev,
                    criticality_level: value === 'all' ? undefined : [value]
                  }))
                }
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Criticidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={localFilters.vendor_type?.[0] || 'all'}
                onValueChange={(value) => 
                  setLocalFilters(prev => ({
                    ...prev,
                    vendor_type: value === 'all' ? undefined : [value]
                  }))
                }
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="strategic">Estratégico</SelectItem>
                  <SelectItem value="operational">Operacional</SelectItem>
                  <SelectItem value="transactional">Transacional</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedVendors.length > 0 && (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {selectedVendors.length} selecionados
                </Badge>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden bg-white dark:bg-slate-800">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-900">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedVendors.length === paginatedVendors.length && paginatedVendors.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Fornecedor</span>
                        {sortBy === 'name' && (
                          <span className="text-xs">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Criticidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={() => handleSort('risk_score')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Risco</span>
                        {sortBy === 'risk_score' && (
                          <span className="text-xs">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Contrato</TableHead>
                    <TableHead>Último Assessment</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedVendors.map((vendor) => (
                    <TableRow key={vendor.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                      <TableCell>
                        <Checkbox
                          checked={selectedVendors.includes(vendor.id)}
                          onCheckedChange={(checked) => handleVendorSelect(vendor.id, !!checked)}
                        />
                      </TableCell>
                      
                      <TableCell className="min-w-0">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                              <span className="text-xs font-medium text-white">
                                {vendor.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                              {vendor.name}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                              {vendor.website && (
                                <div className="flex items-center space-x-1">
                                  <Globe className="w-3 h-3" />
                                  <span className="truncate max-w-[100px]">{vendor.website.replace(/^https?:\/\//, '')}</span>
                                </div>
                              )}
                              {vendor.primary_contact_email && (
                                <div className="flex items-center space-x-1">
                                  <Mail className="w-3 h-3" />
                                  <span className="truncate max-w-[120px]">{vendor.primary_contact_email}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {getVendorTypeText(vendor.vendor_type)}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${
                          vendor.criticality_level === 'critical' ? 'border-red-200 text-red-700 bg-red-50' :
                          vendor.criticality_level === 'high' ? 'border-orange-200 text-orange-700 bg-orange-50' :
                          vendor.criticality_level === 'medium' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                          'border-green-200 text-green-700 bg-green-50'
                        }`}>
                          {getCriticalityText(vendor.criticality_level)}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${getStatusStyle(vendor.status)}`}>
                          {getStatusText(vendor.status)}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${getRiskLevelStyle(vendor.risk_score)}`}>
                          {getRiskLevelText(vendor.risk_score)}
                          {vendor.risk_score && (
                            <span className="ml-1 text-xs opacity-75">
                              ({vendor.risk_score.toFixed(1)})
                            </span>
                          )}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-3 h-3" />
                            <span>
                              {new Intl.NumberFormat('pt-BR', { 
                                style: 'currency', 
                                currency: 'BRL',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                              }).format(vendor.contract_value || 0)}
                            </span>
                          </div>
                          {vendor.contract_end_date && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {format(new Date(vendor.contract_end_date), 'MMM/yyyy', { locale: ptBR })}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {vendor.last_assessment_date ? (
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            <div>{format(new Date(vendor.last_assessment_date), 'dd/MM/yyyy', { locale: ptBR })}</div>
                            <div className="flex items-center space-x-1 mt-1">
                              {vendor.next_assessment_due && new Date(vendor.next_assessment_due) < new Date() ? (
                                <Badge variant="destructive" className="text-xs px-1 py-0">
                                  Vencido
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs px-1 py-0 border-green-200 text-green-700 bg-green-50">
                                  OK
                                </Badge>
                              )}
                            </div>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-xs text-slate-500">
                            Nunca avaliado
                          </Badge>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => setViewingVendor(vendor)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleEdit(vendor)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDelete(vendor.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <span>
                  Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, sortedVendors.length)} de {sortedVendors.length} fornecedores
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {editingVendor ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              <span>{editingVendor ? 'Editar Fornecedor' : 'Novo Fornecedor'}</span>
            </DialogTitle>
            <DialogDescription>
              {editingVendor ? 'Atualize as informações do fornecedor.' : 'Adicione um novo fornecedor ao seu catálogo.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nome *</label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do fornecedor"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Razão Social</label>
                <Input
                  value={formData.legal_name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, legal_name: e.target.value }))}
                  placeholder="Razão social"
                />
              </div>
              <div>
                <label className="text-sm font-medium">CNPJ/CPF</label>
                <Input
                  value={formData.tax_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, tax_id: e.target.value }))}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Website</label>
                <Input
                  value={formData.website || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://exemplo.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Categoria de Negócio *</label>
                <Input
                  value={formData.business_category || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, business_category: e.target.value }))}
                  placeholder="Ex: Tecnologia, Consultoria"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tipo do Fornecedor *</label>
                <Select
                  value={formData.vendor_type || 'operational'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, vendor_type: value as any }))}
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
              <div>
                <label className="text-sm font-medium">Nível de Criticidade *</label>
                <Select
                  value={formData.criticality_level || 'medium'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, criticality_level: value as any }))}
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
              <div>
                <label className="text-sm font-medium">Valor do Contrato (R$)</label>
                <Input
                  type="number"
                  value={formData.contract_value || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, contract_value: Number(e.target.value) }))}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Descrição</label>
              <textarea
                className="w-full p-2 border rounded-md text-sm resize-none"
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição dos serviços ou produtos fornecidos..."
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Contato Principal</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-600">Nome</label>
                  <Input
                    value={formData.primary_contact_name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, primary_contact_name: e.target.value }))}
                    placeholder="Nome do contato"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600">E-mail</label>
                  <Input
                    type="email"
                    value={formData.primary_contact_email || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, primary_contact_email: e.target.value }))}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-600">Telefone</label>
                  <Input
                    value={formData.primary_contact_phone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, primary_contact_phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setEditingVendor(null);
                  setFormData({
                    vendor_type: 'operational',
                    criticality_level: 'medium',
                    annual_spend: 0,
                    contract_value: 0
                  });
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {loading ? 'Salvando...' : editingVendor ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      {viewingVendor && (
        <Dialog open={!!viewingVendor} onOpenChange={() => setViewingVendor(null)}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>{viewingVendor.name}</span>
              </DialogTitle>
              <DialogDescription>
                Informações detalhadas do fornecedor
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Razão Social</label>
                  <p className="text-sm font-medium">{viewingVendor.legal_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">CNPJ/CPF</label>
                  <p className="text-sm font-medium">{viewingVendor.tax_id || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Categoria</label>
                  <p className="text-sm font-medium">{viewingVendor.business_category}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Website</label>
                  {viewingVendor.website ? (
                    <a 
                      href={viewingVendor.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center space-x-1"
                    >
                      <Globe className="w-3 h-3" />
                      <span>{viewingVendor.website}</span>
                    </a>
                  ) : (
                    <p className="text-sm text-slate-500">N/A</p>
                  )}
                </div>
              </div>

              {/* Classification */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Classificação</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    Tipo: {getVendorTypeText(viewingVendor.vendor_type)}
                  </Badge>
                  <Badge variant="outline" className={
                    viewingVendor.criticality_level === 'critical' ? 'border-red-200 text-red-700 bg-red-50' :
                    viewingVendor.criticality_level === 'high' ? 'border-orange-200 text-orange-700 bg-orange-50' :
                    viewingVendor.criticality_level === 'medium' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                    'border-green-200 text-green-700 bg-green-50'
                  }>
                    Criticidade: {getCriticalityText(viewingVendor.criticality_level)}
                  </Badge>
                  <Badge variant="outline" className={getStatusStyle(viewingVendor.status)}>
                    Status: {getStatusText(viewingVendor.status)}
                  </Badge>
                  {viewingVendor.risk_score && (
                    <Badge variant="outline" className={getRiskLevelStyle(viewingVendor.risk_score)}>
                      Risco: {getRiskLevelText(viewingVendor.risk_score)} ({viewingVendor.risk_score.toFixed(1)})
                    </Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              {viewingVendor.description && (
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Descrição</label>
                  <p className="text-sm mt-1">{viewingVendor.description}</p>
                </div>
              )}

              {/* Contract Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Informações Contratuais</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Valor do Contrato</label>
                    <p className="text-sm font-medium">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(viewingVendor.contract_value || 0)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Status do Contrato</label>
                    <p className="text-sm font-medium">
                      {viewingVendor.contract_status === 'active' ? 'Ativo' :
                       viewingVendor.contract_status === 'expired' ? 'Expirado' :
                       viewingVendor.contract_status === 'terminated' ? 'Encerrado' :
                       viewingVendor.contract_status === 'draft' ? 'Rascunho' :
                       viewingVendor.contract_status === 'under_review' ? 'Em Revisão' : 'N/A'}
                    </p>
                  </div>
                  {viewingVendor.contract_start_date && (
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Início do Contrato</label>
                      <p className="text-sm font-medium">
                        {format(new Date(viewingVendor.contract_start_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  )}
                  {viewingVendor.contract_end_date && (
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Fim do Contrato</label>
                      <p className="text-sm font-medium">
                        {format(new Date(viewingVendor.contract_end_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              {(viewingVendor.primary_contact_name || viewingVendor.primary_contact_email || viewingVendor.primary_contact_phone) && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Contato Principal</h4>
                  <div className="space-y-2">
                    {viewingVendor.primary_contact_name && (
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-slate-500" />
                        <span className="text-sm">{viewingVendor.primary_contact_name}</span>
                      </div>
                    )}
                    {viewingVendor.primary_contact_email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-slate-500" />
                        <a href={`mailto:${viewingVendor.primary_contact_email}`} className="text-sm text-blue-600 hover:underline">
                          {viewingVendor.primary_contact_email}
                        </a>
                      </div>
                    )}
                    {viewingVendor.primary_contact_phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-slate-500" />
                        <span className="text-sm">{viewingVendor.primary_contact_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Onboarding Progress */}
              {viewingVendor.onboarding_status !== 'completed' && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Progresso do Onboarding</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Status: {viewingVendor.onboarding_status}</span>
                      <span>{viewingVendor.onboarding_progress}%</span>
                    </div>
                    <Progress value={viewingVendor.onboarding_progress} className="h-2" />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewingVendor(null);
                    handleEdit(viewingVendor);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  <FileCheck className="w-4 h-4 mr-2" />
                  Criar Assessment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default VendorTableView;