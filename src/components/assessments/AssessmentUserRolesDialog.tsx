import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { UserPlus, X, Users, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AssessmentUserRole {
  id: string;
  user_id: string;
  role: 'respondent' | 'auditor';
  user_profile: {
    full_name: string;
    email: string;
    department?: string;
  };
}

interface AvailableUser {
  id: string;
  full_name: string;
  email: string;
  department?: string;
}

interface AssessmentUserRolesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessmentId: string;
  assessmentName: string;
}

export const AssessmentUserRolesDialog: React.FC<AssessmentUserRolesDialogProps> = ({
  open,
  onOpenChange,
  assessmentId,
  assessmentName,
}) => {
  const { toast } = useToast();
  const [assignedUsers, setAssignedUsers] = useState<AssessmentUserRole[]>([]);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'respondent' | 'auditor'>('respondent');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchAssignedUsers = async () => {
    try {
      // Primeiro buscar as atribuições
      const { data: roles, error: rolesError } = await supabase
        .from('assessment_user_roles')
        .select('id, user_id, role')
        .eq('assessment_id', assessmentId);

      if (rolesError) throw rolesError;

      if (!roles || roles.length === 0) {
        setAssignedUsers([]);
        return;
      }

      // Depois buscar os perfis dos usuários
      const userIds = roles.map(r => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, department')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Combinar os dados
      const formattedData = roles.map(role => {
        const profile = profiles?.find(p => p.user_id === role.user_id);
        return {
          id: role.id,
          user_id: role.user_id,
          role: role.role as 'respondent' | 'auditor',
          user_profile: {
            full_name: profile?.full_name || 'Nome não encontrado',
            email: profile?.email || 'Email não encontrado',
            department: profile?.department
          }
        };
      });

      setAssignedUsers(formattedData);
    } catch (error: any) {
      console.error('Erro ao buscar usuários atribuídos:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar usuários atribuídos.',
        variant: 'destructive',
      });
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, department')
        .eq('is_active', true);

      if (error) throw error;

      // Filtrar usuários que já estão atribuídos
      const assignedUserIds = assignedUsers.map(u => u.user_id);
      const filtered = data?.filter(user => !assignedUserIds.includes(user.user_id)) || [];

      const formattedData = filtered.map(user => ({
        id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        department: user.department
      }));

      setAvailableUsers(formattedData);
    } catch (error: any) {
      console.error('Erro ao buscar usuários disponíveis:', error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAssignedUsers();
    }
  }, [open, assessmentId]);

  useEffect(() => {
    if (assignedUsers.length >= 0) {
      fetchAvailableUsers();
    }
  }, [assignedUsers]);

  const handleAssignUser = async () => {
    if (!selectedUserId || !selectedRole) {
      toast({
        title: 'Erro',
        description: 'Selecione um usuário e um papel.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data: userData } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('assessment_user_roles')
        .insert({
          assessment_id: assessmentId,
          user_id: selectedUserId,
          role: selectedRole,
          assigned_by: userData.user?.id,
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: `Usuário atribuído como ${selectedRole === 'respondent' ? 'respondente' : 'auditor'}.`,
      });

      setSelectedUserId('');
      setSelectedRole('respondent');
      fetchAssignedUsers();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao atribuir usuário.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('assessment_user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Usuário removido do assessment.',
      });

      fetchAssignedUsers();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao remover usuário.',
        variant: 'destructive',
      });
    }
  };

  const filteredAvailableUsers = availableUsers.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gerenciar Usuários do Assessment
          </DialogTitle>
          <DialogDescription>
            Gerencie os usuários e suas funções no assessment "{assessmentName}".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Adicionar novo usuário */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Atribuir Novo Usuário
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Usuário</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar usuário..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredAvailableUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex flex-col">
                              <span>{user.full_name}</span>
                              <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Papel</Label>
                  <Select value={selectedRole} onValueChange={(value: 'respondent' | 'auditor') => setSelectedRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="respondent">
                        <div className="flex flex-col">
                          <span>Respondente</span>
                          <span className="text-xs text-muted-foreground">Pode responder questões</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="auditor">
                        <div className="flex flex-col">
                          <span>Auditor</span>
                          <span className="text-xs text-muted-foreground">Pode revisar e avaliar</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={handleAssignUser} 
                    disabled={!selectedUserId || !selectedRole || isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Atribuindo...' : 'Atribuir'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Lista de usuários atribuídos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Usuários Atribuídos ({assignedUsers.length})
            </h3>

            {assignedUsers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum usuário atribuído a este assessment ainda.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {assignedUsers.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <span className="font-medium">{user.user_profile.full_name}</span>
                            <span className="text-sm text-muted-foreground">{user.user_profile.email}</span>
                            {user.user_profile.department && (
                              <span className="text-xs text-muted-foreground">{user.user_profile.department}</span>
                            )}
                          </div>
                          <Badge 
                            variant={user.role === 'auditor' ? 'default' : 'secondary'}
                            className="ml-auto"
                          >
                            {user.role === 'respondent' ? 'Respondente' : 'Auditor'}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveUser(user.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};