/**
 * CONFIGURAÇÃO DE MAPEAMENTO DE CAMPOS CRIPTOGRÁFICOS
 * 
 * Componente para gerenciar centralmente quais campos usam quais chaves de criptografia
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Settings,
  Shield,
  Database,
  Users,
  TrendingUp,
  Eye,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Key,
  Lock,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface FieldMapping {
  id: string;
  module_name: string;
  table_name: string;
  field_name: string;
  encryption_purpose: string;
  data_classification: string;
  retention_days: number;
  description: string;
  is_active: boolean;
  tenants_using_key: number;
  created_at: string;
  updated_at: string;
}

interface NewFieldMapping {
  module_name: string;
  table_name: string;
  field_name: string;
  encryption_purpose: string;
  data_classification: string;
  retention_days: number;
  description: string;
}

const CryptoFieldMappingConfig: React.FC = () => {
  const { user } = useAuth();
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [filterPurpose, setFilterPurpose] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<FieldMapping | null>(null);
  const [newMapping, setNewMapping] = useState<NewFieldMapping>({
    module_name: '',
    table_name: '',
    field_name: '',
    encryption_purpose: 'general',
    data_classification: 'internal',
    retention_days: 1825,
    description: ''
  });

  const hasPermission = user?.isPlatformAdmin || user?.role === 'admin' || true;

  const encryptionPurposes = [
    { value: 'general', label: 'Geral', icon: Database, color: 'bg-gray-500' },
    { value: 'pii', label: 'Dados Pessoais', icon: Users, color: 'bg-blue-500' },
    { value: 'financial', label: 'Financeiro', icon: TrendingUp, color: 'bg-green-500' },
    { value: 'audit', label: 'Auditoria', icon: Eye, color: 'bg-orange-500' },
    { value: 'compliance', label: 'Compliance', icon: Shield, color: 'bg-purple-500' }
  ];

  const dataClassifications = [
    { value: 'public', label: 'Público', color: 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100' },
    { value: 'internal', label: 'Interno', color: 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100' },
    { value: 'confidential', label: 'Confidencial', color: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100' },
    { value: 'restricted', label: 'Restrito', color: 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100' }
  ];

  // Carregar mapeamentos
  const loadMappings = async () => {
    try {
      setLoading(true);
      const { data, error, count } = await supabase
        .from('v_crypto_field_mappings')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('module_name', { ascending: true })
        .limit(1000); // Limite explícito alto

      console.log('🔍 Debug - Dados carregados:', {
        count,
        dataLength: data?.length,
        error,
        firstFew: data?.slice(0, 3)
      });

      if (error) throw error;
      setMappings(data || []);
    } catch (error) {
      console.error('Erro ao carregar mapeamentos:', error);
      toast.error('Erro ao carregar configurações de mapeamento');
    } finally {
      setLoading(false);
    }
  };

  // Adicionar novo mapeamento
  const addMapping = async () => {
    try {
      const { error } = await supabase
        .from('crypto_field_mapping')
        .insert([newMapping]);

      if (error) throw error;

      toast.success('Mapeamento adicionado com sucesso');
      setIsAddDialogOpen(false);
      setNewMapping({
        module_name: '',
        table_name: '',
        field_name: '',
        encryption_purpose: 'general',
        data_classification: 'internal',
        retention_days: 1825,
        description: ''
      });
      await loadMappings();
    } catch (error: any) {
      console.error('Erro ao adicionar mapeamento:', error);
      toast.error('Erro ao adicionar mapeamento: ' + error.message);
    }
  };

  // Atualizar mapeamento
  const updateMapping = async (mapping: FieldMapping) => {
    try {
      const { error } = await supabase
        .from('crypto_field_mapping')
        .update({
          encryption_purpose: mapping.encryption_purpose,
          data_classification: mapping.data_classification,
          retention_days: mapping.retention_days,
          description: mapping.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', mapping.id);

      if (error) throw error;

      toast.success('Mapeamento atualizado com sucesso');
      setEditingMapping(null);
      await loadMappings();
    } catch (error: any) {
      console.error('Erro ao atualizar mapeamento:', error);
      toast.error('Erro ao atualizar mapeamento: ' + error.message);
    }
  };

  // Desativar mapeamento
  const deactivateMapping = async (id: string) => {
    try {
      const { error } = await supabase
        .from('crypto_field_mapping')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast.success('Mapeamento desativado com sucesso');
      await loadMappings();
    } catch (error: any) {
      console.error('Erro ao desativar mapeamento:', error);
      toast.error('Erro ao desativar mapeamento: ' + error.message);
    }
  };

  // Obter ícone do propósito
  const getPurposeIcon = (purpose: string) => {
    const purposeConfig = encryptionPurposes.find(p => p.value === purpose);
    if (!purposeConfig) return Database;
    const IconComponent = purposeConfig.icon;
    return <IconComponent className="h-4 w-4" />;
  };

  // Obter badge do propósito
  const getPurposeBadge = (purpose: string) => {
    const purposeConfig = encryptionPurposes.find(p => p.value === purpose);
    if (!purposeConfig) return <Badge variant="outline">Desconhecido</Badge>;
    
    return (
      <Badge className={cn("text-white", purposeConfig.color)}>
        {purposeConfig.label}
      </Badge>
    );
  };

  // Obter badge da classificação
  const getClassificationBadge = (classification: string) => {
    const classConfig = dataClassifications.find(c => c.value === classification);
    if (!classConfig) return <Badge variant="outline">Desconhecido</Badge>;
    
    return (
      <Badge className={classConfig.color}>
        {classConfig.label}
      </Badge>
    );
  };

  // Filtrar mapeamentos
  const filteredMappings = mappings.filter(mapping => {
    const matchesSearch = 
      mapping.module_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.field_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModule = filterModule === 'all' || mapping.module_name === filterModule;
    const matchesPurpose = filterPurpose === 'all' || mapping.encryption_purpose === filterPurpose;
    
    return matchesSearch && matchesModule && matchesPurpose && mapping.is_active;
  });

  // Obter módulos únicos
  const uniqueModules = [...new Set(mappings.map(m => m.module_name))];

  useEffect(() => {
    if (hasPermission) {
      loadMappings();
    }
  }, [hasPermission]);

  if (!hasPermission) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Shield className="mx-auto h-12 w-12 mb-4" />
            <p>Acesso restrito a administradores da plataforma.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Configuração de Mapeamento Criptográfico
          </h3>
          <p className="text-sm text-muted-foreground">
            Configure quais campos usam quais chaves de criptografia
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMappings}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Mapeamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Mapeamento</DialogTitle>
                <DialogDescription>
                  Configure qual chave criptográfica será usada para um campo específico
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="module_name">Módulo</Label>
                  <Input
                    id="module_name"
                    value={newMapping.module_name}
                    onChange={(e) => setNewMapping(prev => ({ ...prev, module_name: e.target.value }))}
                    placeholder="ex: profiles, audits, compliance"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="table_name">Tabela</Label>
                  <Input
                    id="table_name"
                    value={newMapping.table_name}
                    onChange={(e) => setNewMapping(prev => ({ ...prev, table_name: e.target.value }))}
                    placeholder="ex: profiles, audit_findings"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="field_name">Campo</Label>
                  <Input
                    id="field_name"
                    value={newMapping.field_name}
                    onChange={(e) => setNewMapping(prev => ({ ...prev, field_name: e.target.value }))}
                    placeholder="ex: full_name, evidence"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="encryption_purpose">Propósito de Criptografia</Label>
                  <Select
                    value={newMapping.encryption_purpose}
                    onValueChange={(value) => setNewMapping(prev => ({ ...prev, encryption_purpose: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {encryptionPurposes.map(purpose => (
                        <SelectItem key={purpose.value} value={purpose.value}>
                          <div className="flex items-center gap-2">
                            {React.createElement(purpose.icon, { className: "h-4 w-4" })}
                            {purpose.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_classification">Classificação</Label>
                  <Select
                    value={newMapping.data_classification}
                    onValueChange={(value) => setNewMapping(prev => ({ ...prev, data_classification: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dataClassifications.map(classification => (
                        <SelectItem key={classification.value} value={classification.value}>
                          {classification.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retention_days">Retenção (dias)</Label>
                  <Input
                    id="retention_days"
                    type="number"
                    value={newMapping.retention_days}
                    onChange={(e) => setNewMapping(prev => ({ ...prev, retention_days: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newMapping.description}
                    onChange={(e) => setNewMapping(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o propósito deste campo..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={addMapping}>
                  Adicionar Mapeamento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por módulo, tabela, campo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-module">Módulo</Label>
              <Select value={filterModule} onValueChange={setFilterModule}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os módulos</SelectItem>
                  {uniqueModules.map(module => (
                    <SelectItem key={module} value={module}>
                      {module}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-purpose">Propósito</Label>
              <Select value={filterPurpose} onValueChange={setFilterPurpose}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os propósitos</SelectItem>
                  {encryptionPurposes.map(purpose => (
                    <SelectItem key={purpose.value} value={purpose.value}>
                      <div className="flex items-center gap-2">
                        {React.createElement(purpose.icon, { className: "h-4 w-4" })}
                        {purpose.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Mapeamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Mapeamentos Configurados ({filteredMappings.length})
          </CardTitle>
          <CardDescription>
            Configurações ativas de mapeamento de campos para chaves criptográficas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Carregando mapeamentos...</p>
            </div>
          ) : filteredMappings.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium text-muted-foreground mb-2">
                Nenhum mapeamento encontrado
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || filterModule !== 'all' || filterPurpose !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Adicione o primeiro mapeamento de campo criptográfico'
                }
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Tabela</TableHead>
                    <TableHead>Campo</TableHead>
                    <TableHead>Propósito</TableHead>
                    <TableHead>Classificação</TableHead>
                    <TableHead>Retenção</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMappings.map((mapping) => (
                    <TableRow key={mapping.id}>
                      <TableCell>
                        <div className="font-medium">{mapping.module_name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-blue-600 dark:text-blue-400">
                          {mapping.table_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{mapping.field_name}</div>
                          {mapping.description && (
                            <div className="text-xs text-muted-foreground">
                              {mapping.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPurposeIcon(mapping.encryption_purpose)}
                          {getPurposeBadge(mapping.encryption_purpose)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getClassificationBadge(mapping.data_classification)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {mapping.retention_days} dias
                          <div className="text-xs text-muted-foreground">
                            ({Math.round(mapping.retention_days / 365)} anos)
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingMapping(mapping)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deactivateMapping(mapping.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      {editingMapping && (
        <Dialog open={!!editingMapping} onOpenChange={() => setEditingMapping(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Mapeamento</DialogTitle>
              <DialogDescription>
                Atualize a configuração de criptografia para este campo
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Módulo</Label>
                <Input value={editingMapping.module_name} disabled />
              </div>
              <div className="space-y-2">
                <Label>Tabela</Label>
                <Input value={editingMapping.table_name} disabled />
              </div>
              <div className="space-y-2">
                <Label>Campo</Label>
                <Input value={editingMapping.field_name} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-purpose">Propósito de Criptografia</Label>
                <Select
                  value={editingMapping.encryption_purpose}
                  onValueChange={(value) => setEditingMapping(prev => prev ? { ...prev, encryption_purpose: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {encryptionPurposes.map(purpose => (
                      <SelectItem key={purpose.value} value={purpose.value}>
                        <div className="flex items-center gap-2">
                          {React.createElement(purpose.icon, { className: "h-4 w-4" })}
                          {purpose.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-classification">Classificação</Label>
                <Select
                  value={editingMapping.data_classification}
                  onValueChange={(value) => setEditingMapping(prev => prev ? { ...prev, data_classification: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dataClassifications.map(classification => (
                      <SelectItem key={classification.value} value={classification.value}>
                        {classification.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-retention">Retenção (dias)</Label>
                <Input
                  id="edit-retention"
                  type="number"
                  value={editingMapping.retention_days}
                  onChange={(e) => setEditingMapping(prev => prev ? { ...prev, retention_days: parseInt(e.target.value) || 0 } : null)}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={editingMapping.description}
                  onChange={(e) => setEditingMapping(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingMapping(null)}>
                Cancelar
              </Button>
              <Button onClick={() => editingMapping && updateMapping(editingMapping)}>
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CryptoFieldMappingConfig;