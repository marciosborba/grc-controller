import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
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
  Users,
  Plus,
  Edit,
  Trash2,
  Mail,
  Shield,
  Key,
  Moon,
  Sun,
  Search
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const mockUsers = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana.silva@empresa.com',
    jobTitle: 'CISO',
    roles: ['admin', 'ciso'],
    isActive: true,
    lastLogin: '2024-07-20',
    theme: 'light'
  },
  {
    id: '2',
    name: 'Carlos Santos',
    email: 'carlos.santos@empresa.com',
    jobTitle: 'Chief Risk Officer',
    roles: ['risk_manager'],
    isActive: true,
    lastLogin: '2024-07-19',
    theme: 'dark'
  },
  {
    id: '3',
    name: 'Maria Costa',
    email: 'maria.costa@empresa.com',
    jobTitle: 'Compliance Officer',
    roles: ['compliance_officer'],
    isActive: true,
    lastLogin: '2024-07-18',
    theme: 'light'
  },
  {
    id: '4',
    name: 'João Oliveira',
    email: 'joao.oliveira@empresa.com',
    jobTitle: 'Internal Auditor',
    roles: ['auditor'],
    isActive: false,
    lastLogin: '2024-07-10',
    theme: 'light'
  }
];

const availableRoles = [
  { value: 'admin', label: 'Administrador', description: 'Acesso completo ao sistema' },
  { value: 'ciso', label: 'CISO', description: 'Chief Information Security Officer' },
  { value: 'risk_manager', label: 'Gestor de Riscos', description: 'Gestão de riscos corporativos' },
  { value: 'compliance_officer', label: 'Compliance Officer', description: 'Gestão de compliance e ética' },
  { value: 'auditor', label: 'Auditor', description: 'Auditoria interna' },
  { value: 'analyst', label: 'Analista', description: 'Análise e operação' }
];

export const UserManagementPage = () => {
  const { user: currentUser, toggleTheme } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    jobTitle: '',
    roles: [] as string[],
    theme: 'light' as 'light' | 'dark'
  });

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleLabel = (roleValue: string) => {
    return availableRoles.find(role => role.value === roleValue)?.label || roleValue;
  };

  const handleCreateUser = () => {
    // Here you would typically make an API call to create the user
    console.log('Creating user:', newUser);
    setIsNewUserOpen(false);
    setNewUser({
      name: '',
      email: '',
      jobTitle: '',
      roles: [],
      theme: 'light'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Usuários</h1>
          <p className="text-muted-foreground mt-1">
            Administração de usuários, papéis e permissões
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleTheme}
            className="flex items-center space-x-2"
          >
            {currentUser?.theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4" />
                <span>Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                <span>Modo Escuro</span>
              </>
            )}
          </Button>
          <Dialog open={isNewUserOpen} onOpenChange={setIsNewUserOpen}>
            <DialogTrigger asChild>
              <Button className="grc-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Usuário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nome Completo</label>
                  <Input
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Nome do usuário"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="email@empresa.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Cargo</label>
                  <Input
                    value={newUser.jobTitle}
                    onChange={(e) => setNewUser({ ...newUser, jobTitle: e.target.value })}
                    placeholder="Cargo do usuário"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Tema</label>
                  <Select 
                    value={newUser.theme} 
                    onValueChange={(value: 'light' | 'dark') => setNewUser({ ...newUser, theme: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Papéis</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availableRoles.map((role) => (
                      <div key={role.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={role.value}
                          checked={newUser.roles.includes(role.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewUser({ ...newUser, roles: [...newUser.roles, role.value] });
                            } else {
                              setNewUser({ ...newUser, roles: newUser.roles.filter(r => r !== role.value) });
                            }
                          }}
                          className="rounded border-border"
                        />
                        <label htmlFor={role.value} className="text-sm">
                          <div className="font-medium">{role.label}</div>
                          <div className="text-xs text-muted-foreground">{role.description}</div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={handleCreateUser} className="w-full grc-button-primary">
                  Criar Usuário
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="grc-card">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuários por nome, email ou cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline" className="px-3 py-1">
              {filteredUsers.length} usuários
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="grc-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{user.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center space-x-2">
                      <Mail className="h-3 w-3" />
                      <span>{user.email}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{user.jobTitle}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  {/* Roles */}
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground mb-1">Papéis</p>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {user.roles.map((role) => (
                        <Badge key={role} variant="outline" className="text-xs">
                          {getRoleLabel(role)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground mb-1">Status</p>
                    <div className="flex items-center space-x-2">
                      <Switch checked={user.isActive} />
                      <span className="text-xs text-muted-foreground">
                        {user.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>

                  {/* Theme */}
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground mb-1">Tema</p>
                    <div className="flex items-center justify-center">
                      {user.theme === 'dark' ? (
                        <Moon className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Sun className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Last Login */}
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground mb-1">Último Login</p>
                    <p className="text-xs text-muted-foreground">{user.lastLogin}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Key className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-danger hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current User Panel */}
      <Card className="grc-card border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Seu Perfil</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">
                  {currentUser?.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{currentUser?.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center space-x-2">
                  <Mail className="h-3 w-3" />
                  <span>{currentUser?.email}</span>
                </p>
                <p className="text-sm text-muted-foreground">{currentUser?.jobTitle}</p>
                <div className="flex items-center space-x-2 mt-2">
                  {currentUser?.roles.map((role) => (
                    <Badge key={role} className="bg-primary/10 text-primary border-primary/30 text-xs">
                      {getRoleLabel(role)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-right space-y-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={toggleTheme}
                className="flex items-center space-x-2"
              >
                {currentUser?.theme === 'dark' ? (
                  <>
                    <Sun className="h-4 w-4" />
                    <span>Modo Claro</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    <span>Modo Escuro</span>
                  </>
                )}
              </Button>
              <div className="text-xs text-muted-foreground">
                Tema atual: {currentUser?.theme === 'dark' ? 'Escuro' : 'Claro'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};