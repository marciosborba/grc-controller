import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

import { DataDiscoverySourceForm, DataDiscoverySourceType, ScanFrequency } from '@/types/privacy-management';
import { useAuth} from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';

interface CreateDataSourceDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DataDiscoverySourceForm) => Promise<{ success: boolean; error?: string }>;
}

export function CreateDataSourceDialog({ open, onClose, onSubmit }: CreateDataSourceDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<Array<{ id: string; full_name: string }>>([]);
  
  const [formData, setFormData] = useState<DataDiscoverySourceForm>({
    name: '',
    description: '',
    type: 'database',
    location: '',
    connection_string: '',
    credentials_stored: false,
    scan_frequency: 'monthly',
    data_steward_id: undefined
  });

  useEffect(() => {
    if (open) {
      fetchUsers();
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
      toast.error('Nome da fonte é obrigatório');
      return;
    }

    if (!formData.location.trim()) {
      toast.error('Localização da fonte é obrigatória');
      return;
    }

    setLoading(true);

    try {
      const result = await onSubmit(formData);
      
      if (result.success) {
        toast.success('Fonte de dados criada com sucesso!');
        onClose();
        resetForm();
      } else {
        toast.error(result.error || 'Erro ao criar fonte de dados');
      }
    } catch (error) {
      toast.error('Erro inesperado ao criar fonte de dados');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'database',
      location: '',
      connection_string: '',
      credentials_stored: false,
      scan_frequency: 'monthly',
      data_steward_id: undefined
    });
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      resetForm();
    }
  };

  const sourceTypes: Array<{ value: DataDiscoverySourceType; label: string; description: string }> = [
    { value: 'database', label: 'Banco de Dados', description: 'PostgreSQL, MySQL, Oracle, SQL Server' },
    { value: 'file_system', label: 'Sistema de Arquivos', description: 'Pastas locais ou de rede' },
    { value: 'cloud_storage', label: 'Armazenamento em Nuvem', description: 'AWS S3, Google Cloud, Azure' },
    { value: 'application', label: 'Aplicação', description: 'Sistemas web e mobile' },
    { value: 'api', label: 'API', description: 'APIs REST e GraphQL' },
    { value: 'email_system', label: 'Sistema de E-mail', description: 'Exchange, Gmail, Outlook' },
    { value: 'crm', label: 'CRM', description: 'Salesforce, HubSpot, etc.' },
    { value: 'erp', label: 'ERP', description: 'SAP, Oracle, Microsoft Dynamics' },
    { value: 'hr_system', label: 'Sistema de RH', description: 'Folha de pagamento, gestão de pessoas' },
    { value: 'other', label: 'Outro', description: 'Outros tipos de fonte de dados' }
  ];

  const scanFrequencies: Array<{ value: ScanFrequency; label: string }> = [
    { value: 'daily', label: 'Diário' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'manual', label: 'Manual' }
  ];

  const selectedSourceType = sourceTypes.find(t => t.value === formData.type);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Fonte de Dados</DialogTitle>
          <DialogDescription>
            Configure uma nova fonte de dados para descoberta automática de informações pessoais.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome e Descrição */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Fonte *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Banco de Dados de Clientes"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o que esta fonte contém e como é usada"
                rows={3}
              />
            </div>
          </div>

          {/* Tipo da Fonte */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo da Fonte *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: DataDiscoverySourceType) => 
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sourceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-muted-foreground">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSourceType && (
              <p className="text-sm text-muted-foreground">
                {selectedSourceType.description}
              </p>
            )}
          </div>

          {/* Localização */}
          <div className="space-y-2">
            <Label htmlFor="location">Localização *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder={
                formData.type === 'database' ? 'servidor.empresa.com:5432/database' :
                formData.type === 'file_system' ? '/dados/clientes/' :
                formData.type === 'api' ? 'https://api.empresa.com/v1' :
                'Endereço ou caminho da fonte de dados'
              }
              required
            />
            <p className="text-sm text-muted-foreground">
              {formData.type === 'database' && 'Formato: servidor:porta/database'}
              {formData.type === 'file_system' && 'Caminho da pasta ou diretório'}
              {formData.type === 'api' && 'URL base da API'}
              {formData.type === 'cloud_storage' && 'Bucket ou container name'}
              {!['database', 'file_system', 'api', 'cloud_storage'].includes(formData.type) && 
               'Especifique como acessar esta fonte de dados'}
            </p>
          </div>

          {/* String de Conexão */}
          <div className="space-y-2">
            <Label htmlFor="connection_string">String de Conexão</Label>
            <Textarea
              id="connection_string"
              value={formData.connection_string || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, connection_string: e.target.value }))}
              placeholder="Parâmetros de conexão adicionais (chaves de API, credenciais, etc.)"
              rows={2}
            />
            <p className="text-sm text-muted-foreground">
              ⚠️ Informações sensíveis como senhas não devem ser inseridas aqui em texto plano
            </p>
          </div>

          {/* Credenciais Armazenadas */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="credentials_stored"
              checked={formData.credentials_stored}
              onCheckedChange={(checked: boolean) => 
                setFormData(prev => ({ ...prev, credentials_stored: checked }))
              }
            />
            <Label htmlFor="credentials_stored" className="text-sm">
              Credenciais são armazenadas em cofre seguro externo
            </Label>
          </div>

          {/* Frequência de Scan e Data Steward */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scan_frequency">Frequência de Scan</Label>
              <Select
                value={formData.scan_frequency}
                onValueChange={(value: ScanFrequency) => 
                  setFormData(prev => ({ ...prev, scan_frequency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scanFrequencies.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_steward">Data Steward</Label>
              <Select
                value={formData.data_steward_id || ''}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, data_steward_id: value || undefined }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar responsável" />
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Fonte'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}