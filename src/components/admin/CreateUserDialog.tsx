import React, { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { UserPlus, Mail, Shield, Users } from 'lucide-react';
import type { CreateUserRequest, AppRole } from '@/types/user-management';
import { USER_ROLES } from '@/types/user-management';

const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  job_title: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  roles: z.array(z.string()).min(1, 'Selecione pelo menos uma role'),
  send_invitation: z.boolean().default(true),
  must_change_password: z.boolean().default(false),
  permissions: z.array(z.string()).default([])
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateUser: (userData: CreateUserRequest) => void;
  isLoading: boolean;
}

const AVAILABLE_ROLES: AppRole[] = ['user', 'auditor', 'compliance_officer', 'risk_manager', 'ciso', 'admin'];

const DEPARTMENTS = [
  'Tecnologia da Informação',
  'Segurança da Informação',
  'Compliance',
  'Auditoria',
  'Riscos',
  'Jurídico',
  'Recursos Humanos',
  'Financeiro',
  'Operações'
];

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
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      full_name: '',
      job_title: '',
      department: '',
      phone: '',
      roles: [],
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
      ...data,
      tenant_id: 'tenant-1', // Em produção, pegar do contexto do usuário
      roles: data.roles as AppRole[]
    };
    onCreateUser(userData);
  };

  const handleClose = () => {
    form.reset();
    setSelectedRoles([]);
    setSelectedPermissions([]);
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
              <h3 className="text-lg font-medium">Informações Básicas</h3>
              
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
                        <Input placeholder="Analista de Segurança" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o departamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DEPARTMENTS.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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