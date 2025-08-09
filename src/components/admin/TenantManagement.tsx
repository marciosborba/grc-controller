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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Building2, 
  Mail, 
  Phone,
  CreditCard,
  Eye,
  Search
} from 'lucide-react';

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
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

  // Verificar se usuário tem permissão
  if (!user?.isPlatformAdmin) {
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

  // Buscar tenants
  const {
    data: tenants = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['tenants', searchTerm],
    queryFn: async (): Promise<Tenant[]> => {
      let query = supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%,contact_email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    }
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
    onError: (error: any) => {
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
      setIsEditDialogOpen(false);
      setSelectedTenant(null);
      resetForm();
    },
    onError: (error: any) => {
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
    onError: (error: any) => {
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

  const openEditDialog = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormData({
      name: tenant.name,
      slug: tenant.slug,
      contact_email: tenant.contact_email,
      contact_phone: tenant.contact_phone || '',
      billing_email: tenant.billing_email || '',
      max_users: tenant.max_users,
      subscription_plan: tenant.subscription_plan,
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTenant) {
      updateTenantMutation.mutate({ id: selectedTenant.id, data: formData });
    } else {
      createTenantMutation.mutate(formData);
    }
  };

  const getStatusBadge = (tenant: Tenant) => {
    if (!tenant.is_active) {
      return <Badge variant="destructive">Inativo</Badge>;
    }
    
    switch (tenant.subscription_status) {
      case 'active':
        return <Badge variant="default">Ativo</Badge>;
      case 'trial':
        return <Badge variant="secondary">Trial</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspenso</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    const planColors = {
      basic: 'default',
      professional: 'secondary',
      enterprise: 'destructive',
      trial: 'outline'
    };
    
    return (
      <Badge variant={(planColors[plan as keyof typeof planColors] || 'outline') as 'default' | 'destructive' | 'outline' | 'secondary'}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </Badge>
    );
  };

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

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Usuários</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{tenant.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {tenant.slug}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {tenant.contact_email}
                        </div>
                        {tenant.contact_phone && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {tenant.contact_phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">{tenant.current_users_count}</span>
                        <span className="text-muted-foreground">/ {tenant.max_users}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPlanBadge(tenant.subscription_plan)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(tenant)}
                    </TableCell>
                    <TableCell>
                      {new Date(tenant.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(tenant)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={tenant.current_users_count > 0}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o tenant "{tenant.name}"? 
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteTenantMutation.mutate(tenant.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {tenants.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'Nenhum tenant encontrado.' : 'Nenhum tenant cadastrado.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Editar Tenant</DialogTitle>
              <DialogDescription>
                Atualize as informações do tenant.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_name">Nome da Empresa</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_contact_email">Email de Contato</Label>
                <Input
                  id="edit_contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_contact_phone">Telefone de Contato</Label>
                <Input
                  id="edit_contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_billing_email">Email de Faturamento</Label>
                <Input
                  id="edit_billing_email"
                  type="email"
                  value={formData.billing_email}
                  onChange={(e) => setFormData({ ...formData, billing_email: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_max_users">Limite de Usuários</Label>
                <Input
                  id="edit_max_users"
                  type="number"
                  min="1"
                  value={formData.max_users}
                  onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_subscription_plan">Plano de Assinatura</Label>
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
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateTenantMutation.isPending}>
                {updateTenantMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantManagement;