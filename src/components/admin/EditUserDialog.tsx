import React, { useState, useEffect } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Edit, 
  User, 
  Shield, 
  Settings, 
  Bell,
  Globe,
  Clock
} from 'lucide-react';
import type { ExtendedUser, UpdateUserRequest, AppRole } from '@/types/user-management';
import { USER_ROLES } from '@/types/user-management';

const updateUserSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  job_title: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  roles: z.array(z.string()).min(1, 'Selecione pelo menos uma role'),
  is_active: z.boolean(),
  must_change_password: z.boolean(),
  timezone: z.string(),
  language: z.string(),
  notification_preferences: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean()
  }),
  permissions: z.array(z.string()).default([])
});

type UpdateUserFormData = z.infer<typeof updateUserSchema>;

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ExtendedUser;
  onUpdateUser: (userData: UpdateUserRequest) => void;
  isLoading: boolean;
}

const AVAILABLE_ROLES: AppRole[] = ['user', 'compliance_officer', 'risk_manager', 'ciso', 'admin'];

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

const TIMEZONES = [
  'America/Sao_Paulo',
  'America/New_York',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'UTC'
];

const LANGUAGES = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'es-ES', label: 'Español' },
  { value: 'fr-FR', label: 'Français' }
];

const ADDITIONAL_PERMISSIONS = [
  { id: 'reports.export', label: 'Exportar Relatórios' },
  { id: 'logs.export', label: 'Exportar Logs' },
  { id: 'users.reset_password', label: 'Resetar Senhas' },
  { id: 'users.unlock', label: 'Desbloquear Usuários' },
  { id: 'tenant.update', label: 'Editar Configurações da Organização' }
];

export const EditUserDialog: React.FC<EditUserDialogProps> = ({
  open,
  onOpenChange,
  user,
  onUpdateUser,
  isLoading
}) => {
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>(user.roles);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(user.permissions);

  const form = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      full_name: user.profile.full_name,
      job_title: user.profile.job_title || '',
      department: user.profile.department || '',
      phone: user.profile.phone || '',
      roles: user.roles,
      is_active: user.profile.is_active,
      must_change_password: user.profile.must_change_password,
      timezone: user.profile.timezone,
      language: user.profile.language,
      notification_preferences: user.profile.notification_preferences,
      permissions: user.permissions
    }
  });

  // Atualizar valores quando o usuário mudar
  useEffect(() => {
    if (user) {
      setSelectedRoles(user.roles);
      setSelectedPermissions(user.permissions);
      form.reset({
        full_name: user.profile.full_name,
        job_title: user.profile.job_title || '',
        department: user.profile.department || '',
        phone: user.profile.phone || '',
        roles: user.roles,
        is_active: user.profile.is_active,
        must_change_password: user.profile.must_change_password,
        timezone: user.profile.timezone,
        language: user.profile.language,
        notification_preferences: user.profile.notification_preferences,
        permissions: user.permissions
      });
    }
  }, [user, form]);

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

  const onSubmit = (data: UpdateUserFormData) => {
    const userData: UpdateUserRequest = {
      ...data,
      roles: data.roles as AppRole[]
    };
    onUpdateUser(userData);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Editar Usuário
          </DialogTitle>
          <DialogDescription>
            Edite as informações e configurações do usuário {user.profile.full_name}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="security">Segurança</TabsTrigger>
                <TabsTrigger value="preferences">Preferências</TabsTrigger>
                <TabsTrigger value="permissions">Permissões</TabsTrigger>
              </TabsList>

              {/* Aba Básico */}
              <TabsContent value="basic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Informações Básicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba Segurança */}
              <TabsContent value="security" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Configurações de Segurança
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="is_active"
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
                              Usuário ativo
                            </FormLabel>
                            <FormDescription>
                              Usuários inativos não podem fazer login no sistema.
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
                              Forçar alteração de senha
                            </FormLabel>
                            <FormDescription>
                              O usuário será obrigado a alterar a senha no próximo login.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Informações de Status */}
                    <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium">Status Atual:</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">MFA:</span>
                          <Badge variant={user.profile.two_factor_enabled ? "default" : "outline"} className="ml-2">
                            {user.profile.two_factor_enabled ? 'Habilitado' : 'Desabilitado'}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-500">Email Verificado:</span>
                          <Badge variant={user.profile.email_verified ? "default" : "outline"} className="ml-2">
                            {user.profile.email_verified ? 'Sim' : 'Não'}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-500">Tentativas Falhadas:</span>
                          <span className="ml-2 font-medium">{user.profile.failed_login_attempts}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Total de Logins:</span>
                          <span className="ml-2 font-medium">{user.profile.login_count}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba Preferências */}
              <TabsContent value="preferences" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Configurações Regionais */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Configurações Regionais
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fuso Horário</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {TIMEZONES.map((tz) => (
                                  <SelectItem key={tz} value={tz}>
                                    {tz}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Idioma</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {LANGUAGES.map((lang) => (
                                  <SelectItem key={lang.value} value={lang.value}>
                                    {lang.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Notificações */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Notificações
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="notification_preferences.email"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Notificações por Email</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notification_preferences.push"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Notificações Push</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notification_preferences.sms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Notificações por SMS</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Aba Permissões */}
              <TabsContent value="permissions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Roles do Sistema
                    </CardTitle>
                    <CardDescription>
                      Selecione as roles que definem o nível de acesso geral do usuário no sistema.
                      <br />
                      <strong>Nota:</strong> Para atribuir papéis específicos em assessments (respondente/auditor), 
                      use o botão "Gerenciar Usuários" dentro do assessment específico.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="roles"
                      render={() => (
                        <FormItem>
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Permissões Adicionais</CardTitle>
                    <CardDescription>
                      Permissões específicas além das definidas pelas roles.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="permissions"
                      render={() => (
                        <FormItem>
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
                  </CardContent>
                </Card>

                {/* Resumo das Roles Selecionadas */}
                {selectedRoles.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Resumo das Permissões</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

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
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};