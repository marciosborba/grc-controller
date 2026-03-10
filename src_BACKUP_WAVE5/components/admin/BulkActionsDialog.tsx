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
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Unlock, 
  Lock, 
  RefreshCw, 
  Trash2,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import type { BulkUserAction, AppRole } from '@/types/user-management';
import { USER_ROLES } from '@/types/user-management';

const bulkActionSchema = z.object({
  action: z.enum(['activate', 'deactivate', 'unlock', 'delete', 'reset_password', 'assign_role']),
  new_password: z.string().optional(),
  role: z.string().optional(),
  send_email: z.boolean().default(false)
});

type BulkActionFormData = z.infer<typeof bulkActionSchema>;

interface BulkActionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUserIds: string[];
  onBulkAction: (action: BulkUserAction) => void;
  isLoading: boolean;
  onComplete: () => void;
}

const BULK_ACTIONS = [
  {
    value: 'activate',
    label: 'Ativar Usuários',
    description: 'Ativar todos os usuários selecionados',
    icon: UserCheck,
    color: 'text-green-600',
    dangerous: false
  },
  {
    value: 'deactivate',
    label: 'Desativar Usuários',
    description: 'Desativar todos os usuários selecionados',
    icon: UserX,
    color: 'text-yellow-600',
    dangerous: true
  },
  {
    value: 'unlock',
    label: 'Desbloquear Usuários',
    description: 'Desbloquear usuários que estão bloqueados',
    icon: Unlock,
    color: 'text-blue-600',
    dangerous: false
  },
  {
    value: 'reset_password',
    label: 'Resetar Senhas',
    description: 'Resetar senhas e forçar alteração no próximo login',
    icon: RefreshCw,
    color: 'text-orange-600',
    dangerous: true
  },
  {
    value: 'assign_role',
    label: 'Atribuir Role',
    description: 'Adicionar uma role específica aos usuários',
    icon: Shield,
    color: 'text-purple-600',
    dangerous: false
  },
  {
    value: 'delete',
    label: 'Excluir Usuários',
    description: 'ATENÇÃO: Esta ação é irreversível!',
    icon: Trash2,
    color: 'text-red-600',
    dangerous: true
  }
];

const AVAILABLE_ROLES: AppRole[] = ['user', 'auditor', 'compliance_officer', 'risk_manager', 'ciso', 'admin'];

export const BulkActionsDialog: React.FC<BulkActionsDialogProps> = ({
  open,
  onOpenChange,
  selectedUserIds,
  onBulkAction,
  isLoading,
  onComplete
}) => {
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [confirmDangerous, setConfirmDangerous] = useState(false);

  const form = useForm<BulkActionFormData>({
    resolver: zodResolver(bulkActionSchema),
    defaultValues: {
      action: 'activate' as any,
      new_password: '',
      role: '',
      send_email: false
    }
  });

  const watchedAction = form.watch('action');
  const currentActionConfig = BULK_ACTIONS.find(a => a.value === watchedAction);
  const isDangerous = currentActionConfig?.dangerous || false;

  const onSubmit = (data: BulkActionFormData) => {
    if (isDangerous && !confirmDangerous) {
      return;
    }

    const parameters: Record<string, any> = {};
    
    if (data.action === 'reset_password') {
      parameters.new_password = data.new_password || 'temp-password-123';
      parameters.send_email = data.send_email;
    }
    
    if (data.action === 'assign_role' && data.role) {
      parameters.role = data.role;
    }

    const bulkAction: BulkUserAction = {
      action: data.action,
      user_ids: selectedUserIds,
      parameters
    };

    onBulkAction(bulkAction);
  };

  const handleClose = () => {
    form.reset();
    setSelectedAction('');
    setConfirmDangerous(false);
    onOpenChange(false);
  };

  const handleActionChange = (action: string) => {
    setSelectedAction(action);
    setConfirmDangerous(false);
    form.setValue('action', action as any);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Ações em Lote
          </DialogTitle>
          <DialogDescription>
            Executar ação em {selectedUserIds.length} usuário{selectedUserIds.length !== 1 ? 's' : ''} selecionado{selectedUserIds.length !== 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Seleção da Ação */}
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selecione a Ação</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-1 gap-3">
                      {BULK_ACTIONS.map((action) => {
                        const Icon = action.icon;
                        const isSelected = field.value === action.value;
                        
                        return (
                          <div
                            key={action.value}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              isSelected 
                                ? 'border-primary bg-primary/5' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => {
                              field.onChange(action.value);
                              handleActionChange(action.value);
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <Icon className={`w-5 h-5 mt-0.5 ${action.color}`} />
                              <div className="flex-1">
                                <div className="font-medium">{action.label}</div>
                                <div className="text-sm text-gray-500">{action.description}</div>
                                {action.dangerous && (
                                  <Badge variant="destructive" className="mt-1 text-xs">
                                    Ação Perigosa
                                  </Badge>
                                )}
                              </div>
                              {isSelected && (
                                <CheckCircle className="w-5 h-5 text-primary" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Configurações específicas por ação */}
            {watchedAction === 'reset_password' && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium">Configurações de Reset de Senha</h3>
                
                <FormField
                  control={form.control}
                  name="new_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="password"
                          placeholder="Deixe vazio para gerar automaticamente"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Se não especificada, será gerada uma senha temporária.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="send_email"
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
                          Enviar nova senha por email
                        </FormLabel>
                        <FormDescription>
                          Os usuários receberão a nova senha por email.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {watchedAction === 'assign_role' && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium">Atribuir Role</h3>
                
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role a ser Atribuída</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AVAILABLE_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {USER_ROLES[role]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Esta role será adicionada aos usuários selecionados.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Confirmação para ações perigosas */}
            {isDangerous && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="space-y-3">
                  <div>
                    <strong>Atenção!</strong> Esta é uma ação perigosa que pode afetar 
                    significativamente os usuários selecionados.
                  </div>
                  
                  {watchedAction === 'delete' && (
                    <div className="text-sm">
                      A exclusão de usuários é <strong>irreversível</strong> e removerá 
                      permanentemente todos os dados associados.
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="confirm-dangerous"
                      checked={confirmDangerous}
                      onCheckedChange={(checked) => setConfirmDangerous(checked === true)}
                    />
                    <label
                      htmlFor="confirm-dangerous"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Eu entendo os riscos e quero continuar
                    </label>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Resumo */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium mb-2">Resumo da Ação</h3>
              <div className="text-sm space-y-1">
                <div>
                  <strong>Ação:</strong> {currentActionConfig?.label}
                </div>
                <div>
                  <strong>Usuários afetados:</strong> {selectedUserIds.length}
                </div>
                {watchedAction === 'assign_role' && form.watch('role') && (
                  <div>
                    <strong>Role:</strong> {USER_ROLES[form.watch('role') as AppRole]}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || (isDangerous && !confirmDangerous)}
                variant={isDangerous ? "destructive" : "default"}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Executando...
                  </>
                ) : (
                  `Executar Ação`
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};