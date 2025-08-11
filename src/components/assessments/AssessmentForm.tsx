import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  X,
  ChevronDown,
  ChevronRight,
  Users,
  Settings,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { 
  Assessment,
  AssessmentFramework,
  CreateAssessmentRequest,
  AssessmentType,
  AssessmentPriority,
  AssessmentFrequency,
  UserRole
} from '@/types/assessment-management';
import { 
  ASSESSMENT_TYPES,
  ASSESSMENT_PRIORITIES,
  ASSESSMENT_FREQUENCIES,
  USER_ROLES
} from '@/types/assessment-management';

const assessmentFormSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  framework_id: z.string().min(1, 'Selecione um framework'),
  type: z.enum(['internal_audit', 'external_audit', 'compliance_check', 'risk_assessment', 'security_review', 'gap_analysis', 'maturity_assessment', 'vendor_assessment']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  frequency: z.enum(['one_time', 'quarterly', 'semi_annual', 'annual', 'biennial']),
  start_date: z.date().optional(),
  due_date: z.date().optional(),
  assigned_users: z.array(z.object({
    user_id: z.string(),
    role: z.enum(['respondent', 'auditor', 'reviewer', 'approver'])
  })).optional(),
});

type AssessmentFormData = z.infer<typeof assessmentFormSchema>;

interface AssessmentFormProps {
  assessment?: Assessment;
  frameworks: AssessmentFramework[];
  profiles: any[];
  onSubmit: (data: AssessmentFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({
  assessment,
  frameworks,
  profiles,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<{ user_id: string; role: UserRole }[]>([]);
  const [openUserSelect, setOpenUserSelect] = useState(false);
  const [openFrameworkSelect, setOpenFrameworkSelect] = useState(false);

  const form = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues: {
      name: assessment?.name || '',
      description: assessment?.description || '',
      framework_id: assessment?.framework_id || '',
      type: assessment?.type || 'internal_audit',
      priority: assessment?.priority || 'medium',
      frequency: assessment?.frequency || 'annual',
      start_date: assessment?.start_date ? new Date(assessment.start_date) : undefined,
      due_date: assessment?.due_date ? new Date(assessment.due_date) : undefined,
      assigned_users: []
    },
  });

  useEffect(() => {
    if (assessment?.assigned_users) {
      const users = assessment.assigned_users.map(au => ({
        user_id: au.user_id,
        role: au.role
      }));
      setSelectedUsers(users);
      form.setValue('assigned_users', users);
    }
  }, [assessment, form]);

  const handleSubmit = async (data: AssessmentFormData) => {
    const formData = {
      ...data,
      start_date: data.start_date?.toISOString(),
      due_date: data.due_date?.toISOString(),
      assigned_users: selectedUsers
    };

    await onSubmit(formData as any);
  };

  const addUser = (userId: string, role: UserRole) => {
    if (!selectedUsers.find(u => u.user_id === userId)) {
      const newUsers = [...selectedUsers, { user_id: userId, role }];
      setSelectedUsers(newUsers);
      form.setValue('assigned_users', newUsers);
    }
  };

  const removeUser = (userId: string) => {
    const newUsers = selectedUsers.filter(u => u.user_id !== userId);
    setSelectedUsers(newUsers);
    form.setValue('assigned_users', newUsers);
  };

  const updateUserRole = (userId: string, role: UserRole) => {
    const newUsers = selectedUsers.map(u => 
      u.user_id === userId ? { ...u, role } : u
    );
    setSelectedUsers(newUsers);
    form.setValue('assigned_users', newUsers);
  };

  const getSelectedFramework = () => {
    const frameworkId = form.watch('framework_id');
    return frameworks.find(f => f.id === frameworkId);
  };

  const getUserName = (userId: string) => {
    const profile = profiles.find(p => p.id === userId);
    return profile?.full_name || profile?.email || userId;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Info className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Informações Básicas</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Nome do Assessment *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Auditoria ISO 27001 Q1 2024" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o objetivo e escopo do assessment..."
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Opcional - Descrição detalhada do assessment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="framework_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Framework *</FormLabel>
                  <Popover open={openFrameworkSelect} onOpenChange={setOpenFrameworkSelect}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? frameworks.find(f => f.id === field.value)?.name
                            : "Selecione um framework"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Buscar framework..." />
                        <CommandEmpty>Nenhum framework encontrado.</CommandEmpty>
                        <CommandGroup>
                          {frameworks.map((framework) => (
                            <CommandItem
                              value={framework.name}
                              key={framework.id}
                              onSelect={() => {
                                form.setValue("framework_id", framework.id);
                                setOpenFrameworkSelect(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  framework.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div>
                                <div className="font-medium">{framework.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {framework.short_name} - {framework.category}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {getSelectedFramework() && (
                    <FormDescription>
                      {getSelectedFramework()?.description || 'Framework selecionado'}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(ASSESSMENT_TYPES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          <div>
                            <div className="font-medium">{label.split(' - ')[0]}</div>
                            <div className="text-sm text-muted-foreground">
                              {label.split(' - ')[1]}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridade *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(ASSESSMENT_PRIORITIES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              key === 'critical' ? 'bg-red-500' :
                              key === 'high' ? 'bg-orange-500' :
                              key === 'medium' ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`} />
                            <div>
                              <div className="font-medium">{label.split(' - ')[0]}</div>
                              <div className="text-sm text-muted-foreground">
                                {label.split(' - ')[1]}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequência *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a frequência" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(ASSESSMENT_FREQUENCIES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Cronograma */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Cronograma</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Início</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date("1900-01-01")}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Quando o assessment deve começar
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Vencimento</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          const startDate = form.getValues('start_date');
                          return date < (startDate || new Date());
                        }}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Prazo limite para conclusão
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Configurações Avançadas */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <div className="space-y-4">
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" className="flex items-center gap-2 p-0">
                {showAdvanced ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <Settings className="h-5 w-5" />
                <span className="text-lg font-medium">Configurações Avançadas</span>
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-4">
              <div className="pl-6 space-y-4">
                {/* Atribuição de Usuários */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-muted">
                    <Users className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">Usuários Atribuídos</h4>
                  </div>

                  <div className="space-y-3">
                    <Popover open={openUserSelect} onOpenChange={setOpenUserSelect}>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" className="w-full justify-between">
                          Adicionar usuário
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Buscar usuário..." />
                          <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                          <CommandGroup>
                            {profiles
                              .filter(profile => !selectedUsers.find(u => u.user_id === profile.id))
                              .map((profile) => (
                                <CommandItem
                                  key={profile.id}
                                  onSelect={() => {
                                    addUser(profile.id, 'respondent');
                                    setOpenUserSelect(false);
                                  }}
                                >
                                  <div>
                                    <div className="font-medium">{profile.full_name}</div>
                                    <div className="text-sm text-muted-foreground">{profile.email}</div>
                                  </div>
                                </CommandItem>
                              ))
                            }
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {selectedUsers.length > 0 && (
                      <div className="space-y-2">
                        {selectedUsers.map((userAssignment) => (
                          <div 
                            key={userAssignment.user_id} 
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div>
                                <div className="font-medium text-sm">
                                  {getUserName(userAssignment.user_id)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {profiles.find(p => p.id === userAssignment.user_id)?.email}
                                </div>
                              </div>
                              <Badge variant="secondary">
                                {USER_ROLES[userAssignment.role].split(' - ')[0]}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Select
                                value={userAssignment.role}
                                onValueChange={(role: UserRole) => updateUserRole(userAssignment.user_id, role)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(USER_ROLES).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                      {label.split(' - ')[0]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeUser(userAssignment.user_id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : (assessment ? 'Atualizar' : 'Criar Assessment')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AssessmentForm;