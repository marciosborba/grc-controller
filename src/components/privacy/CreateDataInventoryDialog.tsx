import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { toast } from 'sonner';

import { DataInventoryForm, DataCategory, DataType, SensitivityLevel, DataOrigin } from '@/types/privacy-management';
import { DATA_CATEGORIES, SENSITIVITY_LEVELS } from '@/types/privacy-management';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CreateDataInventoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DataInventoryForm) => Promise<{ success: boolean; error?: string }>;
}

export function CreateDataInventoryDialog({ open, onClose, onSubmit }: CreateDataInventoryDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<Array<{ id: string; full_name: string }>>([]);
  
  const [formData, setFormData] = useState<DataInventoryForm>({
    name: '',
    description: '',
    data_category: 'identificacao',
    data_types: [],
    system_name: '',
    database_name: '',
    table_field_names: [],
    file_locations: [],
    estimated_volume: 0,
    retention_period_months: 12,
    retention_justification: '',
    sensitivity_level: 'media',
    data_origin: 'coleta_direta',
    data_controller_id: '',
    data_processor_id: '',
    data_steward_id: '',
    next_review_date: ''
  });

  const [newDataType, setNewDataType] = useState('');
  const [newTableField, setNewTableField] = useState('');
  const [newFileLocation, setNewFileLocation] = useState('');

  useEffect(() => {
    if (open) {
      fetchUsers();
      // Set next review date to 1 year from now
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      setFormData(prev => ({
        ...prev,
        next_review_date: nextYear.toISOString().split('T')[0]
      }));
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .order('full_name');

      if (error) throw error;

      setUsers(data.map(u => ({ id: u.user_id, full_name: u.full_name })));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.name.trim()) {
      toast.error('Nome do item é obrigatório');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }

    if (!formData.system_name.trim()) {
      toast.error('Nome do sistema é obrigatório');
      return;
    }

    if (!formData.data_controller_id) {
      toast.error('Controlador de dados é obrigatório');
      return;
    }

    if (!formData.data_steward_id) {
      toast.error('Data steward é obrigatório');
      return;
    }

    if (formData.data_types.length === 0) {
      toast.error('Pelo menos um tipo de dado deve ser especificado');
      return;
    }

    setLoading(true);

    try {
      const result = await onSubmit(formData);
      
      if (result.success) {
        toast.success('Item do inventário criado com sucesso!');
        onClose();
        resetForm();
      } else {
        toast.error(result.error || 'Erro ao criar item do inventário');
      }
    } catch (error) {
      toast.error('Erro inesperado ao criar item do inventário');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      data_category: 'identificacao',
      data_types: [],
      system_name: '',
      database_name: '',
      table_field_names: [],
      file_locations: [],
      estimated_volume: 0,
      retention_period_months: 12,
      retention_justification: '',
      sensitivity_level: 'media',
      data_origin: 'coleta_direta',
      data_controller_id: '',
      data_processor_id: '',
      data_steward_id: '',
      next_review_date: ''
    });
    setNewDataType('');
    setNewTableField('');
    setNewFileLocation('');
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      resetForm();
    }
  };

  const addDataType = () => {
    if (newDataType.trim() && !formData.data_types.includes(newDataType.trim())) {
      setFormData(prev => ({
        ...prev,
        data_types: [...prev.data_types, newDataType.trim()]
      }));
      setNewDataType('');
    }
  };

  const removeDataType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      data_types: prev.data_types.filter(t => t !== type)
    }));
  };

  const addTableField = () => {
    if (newTableField.trim() && !formData.table_field_names?.includes(newTableField.trim())) {
      setFormData(prev => ({
        ...prev,
        table_field_names: [...(prev.table_field_names || []), newTableField.trim()]
      }));
      setNewTableField('');
    }
  };

  const removeTableField = (field: string) => {
    setFormData(prev => ({
      ...prev,
      table_field_names: prev.table_field_names?.filter(f => f !== field) || []
    }));
  };

  const addFileLocation = () => {
    if (newFileLocation.trim() && !formData.file_locations?.includes(newFileLocation.trim())) {
      setFormData(prev => ({
        ...prev,
        file_locations: [...(prev.file_locations || []), newFileLocation.trim()]
      }));
      setNewFileLocation('');
    }
  };

  const removeFileLocation = (location: string) => {
    setFormData(prev => ({
      ...prev,
      file_locations: prev.file_locations?.filter(l => l !== location) || []
    }));
  };

  const dataOriginOptions = [
    { value: 'coleta_direta', label: 'Coleta Direta' },
    { value: 'terceiros', label: 'Terceiros' },
    { value: 'fontes_publicas', label: 'Fontes Públicas' },
    { value: 'cookies', label: 'Cookies/Tracking' },
    { value: 'sistemas_internos', label: 'Sistemas Internos' },
    { value: 'parceiros', label: 'Parceiros' },
    { value: 'fornecedores', label: 'Fornecedores' },
    { value: 'outros', label: 'Outros' }
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Item do Inventário</DialogTitle>
          <DialogDescription>
            Adicione um novo item ao inventário de dados pessoais da organização.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Item *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Dados de Clientes - CRM"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="system_name">Sistema *</Label>
              <Input
                id="system_name"
                value={formData.system_name}
                onChange={(e) => setFormData(prev => ({ ...prev, system_name: e.target.value }))}
                placeholder="Ex: Sistema CRM, ERP, Website"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva quais dados são armazenados e como são utilizados"
              rows={3}
              required
            />
          </div>

          {/* Categoria e Tipos de Dados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_category">Categoria de Dados *</Label>
              <Select
                value={formData.data_category}
                onValueChange={(value: DataCategory) => 
                  setFormData(prev => ({ ...prev, data_category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DATA_CATEGORIES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sensitivity_level">Nível de Sensibilidade *</Label>
              <Select
                value={formData.sensitivity_level}
                onValueChange={(value: SensitivityLevel) => 
                  setFormData(prev => ({ ...prev, sensitivity_level: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SENSITIVITY_LEVELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tipos de Dados */}
          <div className="space-y-2">
            <Label>Tipos de Dados *</Label>
            <div className="flex gap-2">
              <Input
                value={newDataType}
                onChange={(e) => setNewDataType(e.target.value)}
                placeholder="Ex: email, nome, CPF"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDataType())}
              />
              <Button type="button" onClick={addDataType} disabled={!newDataType.trim()}>
                Adicionar
              </Button>
            </div>
            {formData.data_types.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.data_types.map((type, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {type}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeDataType(type)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Localização dos Dados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="database_name">Nome do Banco de Dados</Label>
              <Input
                id="database_name"
                value={formData.database_name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, database_name: e.target.value }))}
                placeholder="Ex: production_db, customer_db"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_origin">Origem dos Dados</Label>
              <Select
                value={formData.data_origin}
                onValueChange={(value: DataOrigin) => 
                  setFormData(prev => ({ ...prev, data_origin: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dataOriginOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabelas/Campos */}
          <div className="space-y-2">
            <Label>Tabelas/Campos</Label>
            <div className="flex gap-2">
              <Input
                value={newTableField}
                onChange={(e) => setNewTableField(e.target.value)}
                placeholder="Ex: users.email, customers.name"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTableField())}
              />
              <Button type="button" onClick={addTableField} disabled={!newTableField.trim()}>
                Adicionar
              </Button>
            </div>
            {formData.table_field_names && formData.table_field_names.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.table_field_names.map((field, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {field}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeTableField(field)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Localizações de Arquivos */}
          <div className="space-y-2">
            <Label>Localizações de Arquivos</Label>
            <div className="flex gap-2">
              <Input
                value={newFileLocation}
                onChange={(e) => setNewFileLocation(e.target.value)}
                placeholder="Ex: /data/customers/, C:\Backups\Users"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFileLocation())}
              />
              <Button type="button" onClick={addFileLocation} disabled={!newFileLocation.trim()}>
                Adicionar
              </Button>
            </div>
            {formData.file_locations && formData.file_locations.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.file_locations.map((location, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {location}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeFileLocation(location)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Volume e Retenção */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_volume">Volume Estimado</Label>
              <Input
                id="estimated_volume"
                type="number"
                min="0"
                value={formData.estimated_volume}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_volume: parseInt(e.target.value) || 0 }))}
                placeholder="Número de registros"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retention_period_months">Período de Retenção (meses)</Label>
              <Input
                id="retention_period_months"
                type="number"
                min="1"
                value={formData.retention_period_months || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, retention_period_months: parseInt(e.target.value) || undefined }))}
                placeholder="Ex: 12, 24, 60"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="retention_justification">Justificativa de Retenção</Label>
            <Textarea
              id="retention_justification"
              value={formData.retention_justification || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, retention_justification: e.target.value }))}
              placeholder="Explique por que os dados precisam ser retidos por este período"
              rows={2}
            />
          </div>

          {/* Responsáveis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_controller_id">Controlador de Dados *</Label>
              <Select
                value={formData.data_controller_id}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, data_controller_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar controlador" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_processor_id">Processador de Dados</Label>
              <Select
                value={formData.data_processor_id || ''}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, data_processor_id: value || undefined }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar processador" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_steward_id">Data Steward *</Label>
              <Select
                value={formData.data_steward_id}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, data_steward_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar steward" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data de Revisão */}
          <div className="space-y-2">
            <Label htmlFor="next_review_date">Próxima Data de Revisão</Label>
            <Input
              id="next_review_date"
              type="date"
              value={formData.next_review_date || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, next_review_date: e.target.value }))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}