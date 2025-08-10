import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Building2, 
  Search,
  Users2
} from 'lucide-react';
import TenantCard from './TenantCard';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  contact_email: string;
  contact_phone?: string;
  billing_email?: string;
  max_users: number;
  current_users_count: number;
  subscription_plan: string;
  subscription_status: string;
  is_active: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface TenantFormData {
  name: string;
  slug: string;
  contact_email: string;
  contact_phone: string;
  billing_email: string;
  max_users: number;
  subscription_plan: string;
}

const TenantManagement: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<TenantFormData>({
    name: '',
    slug: '',
    contact_email: '',
    contact_phone: '',
    billing_email: '',
    max_users: 10,
    subscription_plan: 'basic',
  });

  const hasPermission = user?.isPlatformAdmin || false;

  // Buscar tenants
  const {
    data: tenants = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['tenants', searchTerm],
    queryFn: async (): Promise<Tenant[]> => {
      if (!hasPermission) return [];

      let query = supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%,contact_email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      // Garantir que settings sempre existe
      return (data || []).map(tenant => ({
        ...tenant,
        settings: tenant.settings || {}
      }));
    },
    enabled: hasPermission
  });

  // Criar tenant
  const createTenantMutation = useMutation({
    mutationFn: async (data: TenantFormData) => {
      const { data: result, error } = await supabase.rpc('rpc_manage_tenant', {
        action: 'create',
        tenant_data: data
      });
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Tenant criado com sucesso');
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar tenant: ${error.message}`);
    }
  });

  // Atualizar tenant
  const updateTenantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TenantFormData> }) => {
      const { data: result, error } = await supabase.rpc('rpc_manage_tenant', {
        action: 'update',
        tenant_data: data,
        tenant_id_param: id
      });
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Tenant atualizado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar tenant: ${error.message}`);
    }
  });

  // Excluir tenant
  const deleteTenantMutation = useMutation({
    mutationFn: async (tenantId: string) => {
      const { data: result, error } = await supabase.rpc('rpc_manage_tenant', {
        action: 'delete',
        tenant_id_param: tenantId
      });
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Tenant excluído com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir tenant: ${error.message}`);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      contact_email: '',
      contact_phone: '',
      billing_email: '',
      max_users: 10,
      subscription_plan: 'basic',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTenantMutation.mutate(formData);
  };

  // Verificar permissão
  if (!hasPermission) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Building2 className="mx-auto h-12 w-12 mb-4" />
            <p>Acesso restrito a administradores da plataforma.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando tenants...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            Erro ao carregar tenants: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Gerenciamento de Tenants
              </CardTitle>
              <CardDescription>
                Gerencie organizações e configure limites de usuários
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Tenant
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Tenant</DialogTitle>
                    <DialogDescription>
                      Configure uma nova organização na plataforma.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nome da Empresa</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="slug">Slug (Identificador único)</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                        placeholder="exemplo-empresa"
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="contact_email">Email de Contato</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="contact_phone">Telefone de Contato</Label>
                      <Input
                        id="contact_phone"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="billing_email">Email de Faturamento</Label>
                      <Input
                        id="billing_email"
                        type="email"
                        value={formData.billing_email}
                        onChange={(e) => setFormData({ ...formData, billing_email: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="max_users">Limite de Usuários</Label>
                      <Input
                        id="max_users"
                        type="number"
                        min="1"
                        value={formData.max_users}
                        onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) })}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="subscription_plan">Plano de Assinatura</Label>
                      <Select
                        value={formData.subscription_plan}
                        onValueChange={(value) => setFormData({ ...formData, subscription_plan: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="trial">Trial</SelectItem>
                          <SelectItem value="basic">Básico</SelectItem>
                          <SelectItem value="professional">Profissional</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createTenantMutation.isPending}>
                      {createTenantMutation.isPending ? 'Criando...' : 'Criar Tenant'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, slug ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Grid de Cards dos Tenants */}
          <div className="space-y-4">
            {tenants.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground">
                    <Users2 className="mx-auto h-12 w-12 mb-4" />
                    <p>{searchTerm ? 'Nenhum tenant encontrado.' : 'Nenhum tenant cadastrado.'}</p>
                    {!searchTerm && (
                      <p className="text-sm mt-2">Clique em "Novo Tenant" para começar.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              tenants.map((tenant) => (
                <TenantCard
                  key={tenant.id}
                  tenant={tenant}
                  onDelete={(tenantId) => deleteTenantMutation.mutate(tenantId)}
                  isDeleting={deleteTenantMutation.isPending}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default TenantManagement;