import React, { useState, useEffect } from 'react';
import { useAuth} from '@/contexts/AuthContextOptimized';
import { useTenantManagement } from '@/hooks/useTenantManagement';
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
import SortableTenantCard from './SortableTenantCard';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import type { Tenant, CreateTenantRequest } from '@/hooks/useTenantManagement';

const TenantManagement: React.FC = () => {
  const { user } = useAuth();
  const {
    tenants,
    isLoadingTenants,
    tenantsError,
    createTenant,
    deleteTenant,
    isCreatingTenant,
    isDeletingTenant
  } = useTenantManagement();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderedTenants, setOrderedTenants] = useState<Tenant[]>([]);
  const [formData, setFormData] = useState<CreateTenantRequest>({
    name: '',
    slug: '',
    contact_email: '',
    contact_phone: '',
    billing_email: '',
    max_users: 10,
    subscription_plan: 'basic',
  });

  // Configure drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const hasPermission = user?.isPlatformAdmin || false;

  // Filter tenants based on search term
  const filteredTenants = tenants.filter(tenant => 
    !searchTerm || 
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.contact_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Update ordered tenants when tenants data changes
  useEffect(() => {
    if (filteredTenants.length > 0) {
      setOrderedTenants(filteredTenants);
    }
  }, [filteredTenants]);

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOrderedTenants((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Save order to localStorage
        localStorage.setItem('tenantCardsOrder', JSON.stringify(newOrder.map(t => t.id)));
        
        return newOrder;
      });
    }
  };

  // Load saved order from localStorage
  useEffect(() => {
    const savedOrder = localStorage.getItem('tenantCardsOrder');
    if (savedOrder && filteredTenants.length > 0) {
      try {
        const orderIds = JSON.parse(savedOrder);
        const reorderedTenants = orderIds
          .map((id: string) => filteredTenants.find(tenant => tenant.id === id))
          .filter(Boolean)
          .concat(filteredTenants.filter(tenant => !orderIds.includes(tenant.id)));
        setOrderedTenants(reorderedTenants);
      } catch (error) {
        console.warn('Failed to load saved tenant order:', error);
        setOrderedTenants(filteredTenants);
      }
    }
  }, [filteredTenants]);

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
    createTenant(formData);
    setIsCreateDialogOpen(false);
    resetForm();
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

  if (isLoadingTenants) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando tenants...</div>
        </CardContent>
      </Card>
    );
  }

  if (tenantsError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            Erro ao carregar tenants: {tenantsError.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                    <Button type="submit" disabled={isCreatingTenant}>
                      {isCreatingTenant ? 'Criando...' : 'Criar Tenant'}
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

          {/* Grid de Cards dos Tenants with Drag & Drop */}
          {orderedTenants.length === 0 ? (
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
              <SortableContext
                items={orderedTenants.map(tenant => tenant.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {orderedTenants.map((tenant) => (
                    <SortableTenantCard
                      key={tenant.id}
                      tenant={tenant}
                      onDelete={(tenantId) => deleteTenant(tenantId)}
                      isDeleting={isDeletingTenant}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default TenantManagement;