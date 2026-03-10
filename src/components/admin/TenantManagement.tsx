import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';
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
import TenantDetailView from './TenantDetailView';

// Local interface for the extended form
interface TenantFormState {
  // Principais
  name: string;
  slug: string;
  contact_email: string;
  contact_phone: string;
  billing_email: string;
  max_users: number;
  subscription_plan: string;

  // Dados Cadastrais
  corporate_name: string; // Razão Social
  trading_name: string;   // Nome Fantasia
  tax_id: string;         // CNPJ

  // Endereço
  zip_code: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

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
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  // Expanded form state
  const [formData, setFormData] = useState<TenantFormState>({
    name: '',
    slug: '',
    contact_email: '',
    contact_phone: '',
    billing_email: '',
    max_users: 10,
    subscription_plan: 'basic',
    corporate_name: '',
    trading_name: '',
    tax_id: '',
    zip_code: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  // Keep active tab state to validate before switching if needed (optional)
  const [activeTab, setActiveTab] = useState("identification");

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
      corporate_name: '',
      trading_name: '',
      tax_id: '',
      zip_code: '',
      address: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: ''
    });
    setActiveTab("identification");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare the payload compatible with CreateTenantRequest
    const payload: CreateTenantRequest = {
      name: formData.name,
      slug: formData.slug,
      contact_email: formData.contact_email,
      contact_phone: formData.contact_phone,
      billing_email: formData.billing_email,
      max_users: formData.max_users,
      subscription_plan: formData.subscription_plan,
      settings: {
        company_data: {
          corporate_name: formData.corporate_name,
          trading_name: formData.trading_name,
          tax_id: formData.tax_id,
          address: formData.address,
          number: formData.number,
          complement: formData.complement,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          country: 'Brasil' // Default
        }
      }
    };

    createTenant(payload);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleTenantClick = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // --- DETAIL VIEW ---
  if (selectedTenantId) {
    const tenant = tenants.find(t => t.id === selectedTenantId);
    if (!tenant) return <div>Tenant não encontrado</div>;

    return (
      <TenantDetailView
        tenantId={selectedTenantId}
        tenantName={tenant.name}
        onBack={() => setSelectedTenantId(null)}
      />
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
                Gerencie organizações, módulos e limites de usuários
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Tenant
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Tenant</DialogTitle>
                    <DialogDescription>
                      Configure uma nova organização na plataforma.
                    </DialogDescription>
                  </DialogHeader>

                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="identification">Identificação</TabsTrigger>
                      <TabsTrigger value="company">Dados Cadastrais</TabsTrigger>
                      <TabsTrigger value="address">Endereço</TabsTrigger>
                    </TabsList>

                    <div className="py-4">
                      {/* ABA: IDENTIFICAÇÃO */}
                      <TabsContent value="identification" className="space-y-4 mt-0">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Nome (Interno)</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Nome para identificação interna"
                            required
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="slug">Slug (URL)</Label>
                          <Input
                            id="slug"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                            placeholder="exemplo-empresa"
                            required
                          />
                          <p className="text-xs text-muted-foreground">O identificador único usado na URL.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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
                            <Label htmlFor="subscription_plan">Plano</Label>
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

                        <div className="grid gap-2">
                          <Label htmlFor="contact_email">Email do Administrador</Label>
                          <Input
                            id="contact_email"
                            type="email"
                            value={formData.contact_email}
                            onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                            required
                          />
                          <p className="text-xs text-muted-foreground">Este email será usado para o primeiro acesso.</p>
                        </div>
                      </TabsContent>

                      {/* ABA: DADOS CADASTRAIS */}
                      <TabsContent value="company" className="space-y-4 mt-0">
                        <div className="grid gap-2">
                          <Label htmlFor="corporate_name">Razão Social</Label>
                          <Input
                            id="corporate_name"
                            value={formData.corporate_name}
                            onChange={(e) => setFormData({ ...formData, corporate_name: e.target.value })}
                            placeholder="Empresa Exemplo Ltda"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="trading_name">Nome Fantasia</Label>
                          <Input
                            id="trading_name"
                            value={formData.trading_name}
                            onChange={(e) => setFormData({ ...formData, trading_name: e.target.value })}
                            placeholder="Empresa Exemplo"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="tax_id">CNPJ</Label>
                            <Input
                              id="tax_id"
                              value={formData.tax_id}
                              onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                              placeholder="00.000.000/0000-00"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="contact_phone">Telefone</Label>
                            <Input
                              id="contact_phone"
                              value={formData.contact_phone}
                              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                              placeholder="(00) 00000-0000"
                            />
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="billing_email">Email Financeiro</Label>
                          <Input
                            id="billing_email"
                            type="email"
                            value={formData.billing_email}
                            onChange={(e) => setFormData({ ...formData, billing_email: e.target.value })}
                            placeholder="financeiro@empresa.com"
                          />
                        </div>
                      </TabsContent>

                      {/* ABA: ENDEREÇO */}
                      <TabsContent value="address" className="space-y-4 mt-0">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="grid gap-2 col-span-1">
                            <Label htmlFor="zip_code">CEP</Label>
                            <Input
                              id="zip_code"
                              value={formData.zip_code}
                              onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                              placeholder="00000-000"
                            />
                          </div>
                          <div className="grid gap-2 col-span-2">
                            {/* Espaço vazio ou botão de busca CEP futuro */}
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                          <div className="grid gap-2 col-span-3">
                            <Label htmlFor="address">Logradouro</Label>
                            <Input
                              id="address"
                              value={formData.address}
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                              placeholder="Rua, Avenida, etc"
                            />
                          </div>
                          <div className="grid gap-2 col-span-1">
                            <Label htmlFor="number">Número</Label>
                            <Input
                              id="number"
                              value={formData.number}
                              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="complement">Complemento</Label>
                            <Input
                              id="complement"
                              value={formData.complement}
                              onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="neighborhood">Bairro</Label>
                            <Input
                              id="neighborhood"
                              value={formData.neighborhood}
                              onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="grid gap-2 col-span-2">
                            <Label htmlFor="city">Cidade</Label>
                            <Input
                              id="city"
                              value={formData.city}
                              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2 col-span-1">
                            <Label htmlFor="state">UF</Label>
                            <Input
                              id="state"
                              value={formData.state}
                              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                              maxLength={2}
                              placeholder="SP"
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isCreatingTenant}>
                        {isCreatingTenant ? 'Criando...' : 'Criar Tenant'}
                      </Button>
                    </DialogFooter>
                  </Tabs>
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
                    <div key={tenant.id} onClick={() => handleTenantClick(tenant.id)} className="cursor-pointer">
                      <SortableTenantCard
                        tenant={tenant}
                        onDelete={(tenantId) => {
                          // Stop propagation to avoid clicking the card when deleting
                          deleteTenant(tenantId);
                        }}
                        isDeleting={isDeletingTenant}
                      />
                    </div>
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