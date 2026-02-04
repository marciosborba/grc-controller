import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserPlus, Mail, Shield } from 'lucide-react';
import { SimpleExtensibleSelect } from '@/components/ui/simple-extensible-select';
import { useDepartmentOptions, useJobTitleOptions } from '@/hooks/useExtensibleDropdowns';
import type { CreateUserRequest, AppRole } from '@/types/user-management';
import { USER_ROLES } from '@/types/user-management';
import { useAuth} from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

// Schema dinâmico baseado no tipo de usuário
const createUserSchema = (isPlatformAdmin: boolean) => z.object({
  email: z.string().email('Email inválido'),
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  job_title: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  roles: z.array(z.string()).min(1, 'Selecione pelo menos uma role'),
  tenant_id: isPlatformAdmin 
    ? z.string().min(1, 'Selecione uma organização')
    : z.string().optional(),
  send_invitation: z.boolean().default(true),
  must_change_password: z.boolean().default(false),
  permissions: z.array(z.string()).default([])
});

type CreateUserFormData = z.infer<ReturnType<typeof createUserSchema>>;

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateUser: (userData: CreateUserRequest) => void;
  isLoading: boolean;
}

const AVAILABLE_ROLES: AppRole[] = ['user', 'auditor', 'compliance_officer', 'risk_manager', 'ciso', 'admin'];

const ADDITIONAL_PERMISSIONS = [
  { id: 'reports.export', label: 'Exportar Relatórios' },
  { id: 'logs.export', label: 'Exportar Logs' },
  { id: 'users.reset_password', label: 'Resetar Senhas' },
  { id: 'users.unlock', label: 'Desbloquear Usuários' },
  { id: 'tenant.update', label: 'Editar Configurações da Organização' }
];

export const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  open,
  onOpenChange,
  onCreateUser,
  isLoading
}) => {
  const { user } = useAuth();
  const currentTenantId = useCurrentTenantId(); // Tenant selecionado no header
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [availableTenants, setAvailableTenants] = useState<Array<{id: string; name: string}>>([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);
  const wasLoadingRef = useRef(false);
  
  // Hooks para opções dos dropdowns
  const departmentOptions = useDepartmentOptions();
  const jobTitleOptions = useJobTitleOptions();

  // Buscar tenants disponíveis para platform admins
  useEffect(() => {
    if (user?.isPlatformAdmin && open) {
      const fetchTenants = async () => {
        setIsLoadingTenants(true);
        try {
          const { data, error } = await supabase
            .from('tenants')
            .select('id, name')
            .eq('is_active', true)
            .order('name');
          
          if (error) {
            console.error('Erro ao buscar tenants:', error);
            return;
          }
          
          setAvailableTenants(data || []);
        } catch (error) {
          console.error('Erro ao buscar tenants:', error);
        } finally {
          setIsLoadingTenants(false);
        }
      };
      
      fetchTenants();
    }
  }, [user?.isPlatformAdmin, open]);

  // Fechar dialog automaticamente após sucesso
  useEffect(() => {
    if (wasLoadingRef.current && !isLoading) {
      // Se estava carregando e agora não está mais, significa que terminou
      // Aguardar um pouco para garantir que o toast de sucesso seja exibido
      setTimeout(() => {
        handleClose();
      }, 1000);
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading]);

  // Atualizar tenant_id quando currentTenantId mudar (para Platform Admins)
  useEffect(() => {
    if (user?.isPlatformAdmin && currentTenantId && open) {
      form.setValue('tenant_id', currentTenantId);
    }
  }, [currentTenantId, user?.isPlatformAdmin, open, form]);

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema(user?.isPlatformAdmin || false)),
    defaultValues: {
      email: '',
      full_name: '',
      job_title: '',
      department: '',
      phone: '',
      roles: [],
      tenant_id: user?.isPlatformAdmin ? currentTenantId : (user?.tenantId || ''),
      send_invitation: true,
      must_change_password: false,
      permissions: []
    }
  });

  const handleRoleToggle = (role: AppRole, checked: boolean) => {
    let newRoles: AppRole[];
    if (checked) {
      newRoles = [...selectedRoles, role];
    } else {
      newRoles = selectedRoles.filter(r => r !== role);
    }
    setSelectedRoles(newRoles);
    form.setValue('roles', newRoles);
  };

  const handlePermissionToggle = (permission: string, checked: boolean) => {
    let newPermissions: string[];
    if (checked) {
      newPermissions = [...selectedPermissions, permission];
    } else {
      newPermissions = selectedPermissions.filter(p => p !== permission);
    }
    setSelectedPermissions(newPermissions);
    form.setValue('permissions', newPermissions);
  };

  const onSubmit = (data: CreateUserFormData) => {
    const userData: CreateUserRequest = {
      email: data.email,
      full_name: data.full_name,
      job_title: data.job_title,
      department: data.department,
      phone: data.phone,
      roles: data.roles as AppRole[],
      tenant_id: data.tenant_id || currentTenantId || user?.tenantId || '',
      send_invitation: data.send_invitation,
      must_change_password: data.must_change_password,
      permissions: data.permissions
    };
    onCreateUser(userData);
  };

  const handleClose = () => {
    form.reset();
    setSelectedRoles([]);
    setSelectedPermissions([]);
    setAvailableTenants([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Criar Novo Usuário
          </DialogTitle>
          <DialogDescription>
            Preencha as informações para criar um novo usuário no sistema.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Informações Básicas</h3>
                {user?.isPlatformAdmin && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Como administrador da plataforma, você pode criar usuários em qualquer organização.
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="usuario@empresa.com" 
                          type="email"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input placeholder="João Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="job_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo</FormLabel>
                      <FormControl>
                        <SimpleExtensibleSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          type="jobTitles"
                          placeholder="Selecione ou adicione um cargo"
                          canAddNew={true}
                          hasAddPermission={jobTitleOptions.canAdd}
                          validateNewItem={jobTitleOptions.validateNewItem}
                          showDescription={true}
                          allowClear={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <FormControl>
                        <SimpleExtensibleSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          type="departments"
                          placeholder="Selecione ou adicione um departamento"
                          canAddNew={true}
                          hasAddPermission={departmentOptions.canAdd}
                          validateNewItem={departmentOptions.validateNewItem}
                          showDescription={true}
                          allowClear={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Seleção de Tenant - apenas para Platform Admins */}
              {user?.isPlatformAdmin && (
                <FormField
                  control={form.control}
                  name="tenant_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organização *</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isLoadingTenants}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={
                              isLoadingTenants 
                                ? "Carregando organizações..." 
                                : "Selecione uma organização"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTenants.map((tenant) => (
                              <SelectItem key={tenant.id} value={tenant.id}>
                                {tenant.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        {currentTenantId ? 
                          `Tenant atual selecionado no header será usado como padrão` :
                          `Selecione a organização onde o usuário será criado`
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <Separator />

            {/* Roles e Permissões */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Roles e Permissões
              </h3>

              <FormField
                control={form.control}
                name="roles"
                render={() => (
                  <FormItem>
                    <FormLabel>Roles do Sistema *</FormLabel>
                    <FormDescription>
                      Selecione as roles que definem o nível de acesso do usuário.
                    </FormDescription>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {AVAILABLE_ROLES.map((role) => (
                        <div key={role} className="flex items-center space-x-2">
                          <Checkbox
                            id={role}
                            checked={selectedRoles.includes(role)}
                            onCheckedChange={(checked) => 
                              handleRoleToggle(role, checked as boolean)
                            }
                          />
                          <label
                            htmlFor={role}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {USER_ROLES[role]}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Permissões Adicionais */}
              <FormField
                control={form.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <FormLabel>Permissões Adicionais</FormLabel>
                    <FormDescription>
                      Permissões específicas além das definidas pelas roles.
                    </FormDescription>
                    <div className="grid grid-cols-1 gap-3">
                      {ADDITIONAL_PERMISSIONS.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={(checked) => 
                              handlePermissionToggle(permission.id, checked as boolean)
                            }
                          />
                          <label
                            htmlFor={permission.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {permission.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Configurações de Acesso */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Configurações de Acesso
              </h3>

              <FormField
                control={form.control}
                name="send_invitation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Enviar convite por email
                      </FormLabel>
                      <FormDescription>
                        O usuário receberá um email para definir sua senha.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="must_change_password"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Forçar alteração de senha no primeiro login
                      </FormLabel>
                      <FormDescription>
                        O usuário será obrigado a alterar a senha no primeiro acesso.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Resumo das Roles Selecionadas */}
            {selectedRoles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Roles Selecionadas:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRoles.map((role) => (
                    <Badge key={role} variant="secondary">
                      {USER_ROLES[role]}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Criando...' : 'Criar Usuário'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};