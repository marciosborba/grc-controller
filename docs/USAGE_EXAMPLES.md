# Exemplos de Uso - Sistema de Administração de Usuários

## Visão Geral

Este documento fornece exemplos práticos de como usar o sistema de administração de usuários em diferentes cenários.

## 1. Configuração Inicial

### Importar Componentes e Hooks

```typescript
import { UserManagementPage } from '@/components/admin/UserManagementPage';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useMFA } from '@/hooks/useMFA';
import { useAuth } from '@/contexts/AuthContext';
```

### Verificar Permissões

```typescript
const { user, hasPermission } = useUserManagement();

// Verificar se pode gerenciar usuários
if (hasPermission('users.read')) {
  // Mostrar interface de usuários
}

// Verificar múltiplas permissões
const canManageUsers = hasPermission('users.create') && hasPermission('users.update');
```

## 2. Gerenciamento de Usuários

### Listar Usuários com Filtros

```typescript
const {
  users,
  filters,
  setFilters,
  isLoadingUsers
} = useUserManagement();

// Aplicar filtros
const handleFilterChange = () => {
  setFilters({
    search: 'joão',
    role: 'admin',
    status: 'active',
    mfa_enabled: true,
    last_login_days: 7
  });
};

// Renderizar lista
{users.map(user => (
  <div key={user.id}>
    <h3>{user.profile.full_name}</h3>
    <p>{user.email}</p>
    <Badge>{user.roles.join(', ')}</Badge>
  </div>
))}
```

### Criar Novo Usuário

```typescript
const { createUser, isCreatingUser } = useUserManagement();

const handleCreateUser = async () => {
  const userData = {
    email: 'novo.usuario@empresa.com',
    full_name: 'Novo Usuário',
    job_title: 'Analista',
    department: 'TI',
    phone: '(11) 99999-9999',
    roles: ['user', 'auditor'],
    tenant_id: 'tenant-1',
    send_invitation: true,
    must_change_password: true,
    permissions: ['reports.export']
  };

  try {
    await createUser(userData);
    console.log('Usuário criado com sucesso!');
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
  }
};
```

### Atualizar Usuário

```typescript
const { updateUser, isUpdatingUser } = useUserManagement();

const handleUpdateUser = async (userId: string) => {
  const updateData = {
    full_name: 'Nome Atualizado',
    job_title: 'Gerente',
    roles: ['risk_manager'],
    is_active: true,
    notification_preferences: {
      email: true,
      push: false,
      sms: true
    }
  };

  try {
    await updateUser({ userId, userData: updateData });
    console.log('Usuário atualizado!');
  } catch (error) {
    console.error('Erro ao atualizar:', error);
  }
};
```

### Ações em Lote

```typescript
const { bulkAction, isBulkActionLoading } = useUserManagement();

// Ativar múltiplos usuários
const activateUsers = async (userIds: string[]) => {
  await bulkAction({
    action: 'activate',
    user_ids: userIds
  });
};

// Reset de senhas em massa
const resetPasswords = async (userIds: string[]) => {
  await bulkAction({
    action: 'reset_password',
    user_ids: userIds,
    parameters: {
      new_password: 'TempPassword123!',
      send_email: true
    }
  });
};

// Atribuir role em massa
const assignRole = async (userIds: string[]) => {
  await bulkAction({
    action: 'assign_role',
    user_ids: userIds,
    parameters: {
      role: 'auditor'
    }
  });
};
```

## 3. Autenticação Multifator (MFA)

### Configurar MFA para Usuário

```typescript
const {
  setupMFA,
  enableMFA,
  setupData,
  isSettingUpMFA,
  isEnablingMFA
} = useMFA();

// Iniciar configuração
const handleSetupMFA = async () => {
  try {
    const data = await setupMFA();
    console.log('QR Code:', data.qr_code);
    console.log('Secret:', data.secret);
    console.log('Backup Codes:', data.backup_codes);
  } catch (error) {
    console.error('Erro na configuração MFA:', error);
  }
};

// Verificar e habilitar
const handleEnableMFA = async (token: string) => {
  try {
    await enableMFA({ token });
    console.log('MFA habilitado com sucesso!');
  } catch (error) {
    console.error('Código inválido:', error);
  }
};
```

### Gerenciar MFA

```typescript
const {
  disableMFA,
  regenerateBackupCodes,
  mfaConfig,
  newBackupCodes
} = useMFA();

// Desabilitar MFA
const handleDisableMFA = async (token: string) => {
  await disableMFA({ token });
};

// Gerar novos códigos de backup
const handleRegenerateBackupCodes = async (token: string) => {
  await regenerateBackupCodes({ token });
  console.log('Novos códigos:', newBackupCodes);
};

// Verificar status MFA
if (mfaConfig?.is_enabled) {
  console.log('MFA está habilitado');
  console.log('Último uso:', mfaConfig.last_used_at);
  console.log('Códigos disponíveis:', mfaConfig.backup_codes?.length);
}
```

## 4. Logs e Auditoria

### Visualizar Atividade do Usuário

```typescript
const { getUserActivity } = useUserManagement();

const handleViewActivity = async (userId: string) => {
  try {
    const activity = await getUserActivity(userId);
    
    console.log('Total de logins:', activity.total_logins);
    console.log('Último login:', activity.last_login);
    console.log('Tentativas falhadas:', activity.failed_attempts);
    console.log('Sessões ativas:', activity.active_sessions);
    
    // Atividades recentes
    activity.recent_activities.forEach(act => {
      console.log(`${act.action} em ${act.timestamp}`);
    });
  } catch (error) {
    console.error('Erro ao buscar atividade:', error);
  }
};
```

### Filtrar Logs de Segurança

```typescript
// Exemplo de query para logs de segurança
const getSecurityLogs = async (filters: {
  user_id?: string;
  event_type?: string;
  severity?: string;
  date_from?: string;
  date_to?: string;
}) => {
  let query = supabase
    .from('security_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.user_id) {
    query = query.eq('user_id', filters.user_id);
  }

  if (filters.event_type) {
    query = query.eq('event_type', filters.event_type);
  }

  if (filters.severity) {
    query = query.eq('severity', filters.severity);
  }

  if (filters.date_from) {
    query = query.gte('created_at', filters.date_from);
  }

  if (filters.date_to) {
    query = query.lte('created_at', filters.date_to);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};
```

## 5. Componentes de Interface

### Usar Componente Principal

```typescript
import { UserManagementPage } from '@/components/admin/UserManagementPage';

const AdminPage = () => {
  return (
    <div className="container mx-auto p-6">
      <UserManagementPage />
    </div>
  );
};
```

### Componente de Criação de Usuário

```typescript
import { CreateUserDialog } from '@/components/admin/CreateUserDialog';

const [showCreateDialog, setShowCreateDialog] = useState(false);
const { createUser, isCreatingUser } = useUserManagement();

<CreateUserDialog
  open={showCreateDialog}
  onOpenChange={setShowCreateDialog}
  onCreateUser={createUser}
  isLoading={isCreatingUser}
/>
```

### Componente de MFA

```typescript
import { MFASetupDialog } from '@/components/admin/MFASetupDialog';

const [showMFADialog, setShowMFADialog] = useState(false);

<MFASetupDialog
  open={showMFADialog}
  onOpenChange={setShowMFADialog}
/>
```

## 6. Estatísticas e Métricas

### Obter Estatísticas de Usuários

```typescript
const { stats, isLoadingStats } = useUserManagement();

if (stats) {
  console.log('Total de usuários:', stats.total_users);
  console.log('Usuários ativos:', stats.active_users);
  console.log('MFA habilitado:', stats.mfa_enabled_users);
  console.log('Logins recentes:', stats.recent_logins);
  
  // Distribuição por roles
  Object.entries(stats.users_by_role).forEach(([role, count]) => {
    console.log(`${role}: ${count} usuários`);
  });
}
```

### Criar Dashboard Personalizado

```typescript
const UserDashboard = () => {
  const { stats } = useUserManagement();
  
  const mfaAdoptionRate = stats ? 
    (stats.mfa_enabled_users / stats.total_users) * 100 : 0;
  
  const activeUserRate = stats ? 
    (stats.active_users / stats.total_users) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Taxa de Adoção MFA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {mfaAdoptionRate.toFixed(1)}%
          </div>
          <Progress value={mfaAdoptionRate} className="mt-2" />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Usuários Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {activeUserRate.toFixed(1)}%
          </div>
          <Progress value={activeUserRate} className="mt-2" />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Logins Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.recent_logins || 0}
          </div>
          <p className="text-sm text-gray-500">Últimos 7 dias</p>
        </CardContent>
      </Card>
    </div>
  );
};
```

## 7. Tratamento de Erros

### Tratamento Global de Erros

```typescript
const { createUser } = useUserManagement();

const handleCreateUserWithErrorHandling = async (userData: CreateUserRequest) => {
  try {
    await createUser(userData);
    toast.success('Usuário criado com sucesso!');
  } catch (error: any) {
    // Tratar diferentes tipos de erro
    if (error.message.includes('email')) {
      toast.error('Email já está em uso');
    } else if (error.message.includes('permission')) {
      toast.error('Você não tem permissão para esta ação');
    } else if (error.message.includes('tenant')) {
      toast.error('Limite de usuários do plano atingido');
    } else {
      toast.error('Erro inesperado. Tente novamente.');
    }
    
    // Log do erro para debugging
    console.error('Erro ao criar usuário:', {
      error: error.message,
      userData: { ...userData, password: '[REDACTED]' },
      timestamp: new Date().toISOString()
    });
  }
};
```

## 8. Integração com Outros Sistemas

### Webhook para Eventos de Usuário

```typescript
// Exemplo de função para webhook
const sendUserEventWebhook = async (event: string, userData: any) => {
  const webhookUrl = process.env.WEBHOOK_URL;
  
  if (!webhookUrl) return;
  
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WEBHOOK_SECRET}`
      },
      body: JSON.stringify({
        event,
        data: userData,
        timestamp: new Date().toISOString(),
        source: 'grc-user-management'
      })
    });
  } catch (error) {
    console.error('Erro ao enviar webhook:', error);
  }
};

// Usar após criar usuário
const { createUser } = useUserManagement();

const handleCreateUserWithWebhook = async (userData: CreateUserRequest) => {
  const user = await createUser(userData);
  await sendUserEventWebhook('user.created', user);
};
```

### Sincronização com Active Directory

```typescript
// Exemplo de sincronização com AD
const syncWithActiveDirectory = async (userId: string) => {
  try {
    const user = await getUserById(userId);
    
    // Buscar dados do AD
    const adUser = await fetchFromActiveDirectory(user.email);
    
    if (adUser) {
      // Atualizar dados do usuário
      await updateUser({
        userId,
        userData: {
          full_name: adUser.displayName,
          job_title: adUser.title,
          department: adUser.department,
          phone: adUser.telephoneNumber
        }
      });
    }
  } catch (error) {
    console.error('Erro na sincronização com AD:', error);
  }
};
```

## 9. Testes

### Teste de Componente

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { UserManagementPage } from '@/components/admin/UserManagementPage';

describe('UserManagementPage', () => {
  it('should render user list', async () => {
    render(<UserManagementPage />);
    
    expect(screen.getByText('Administração de Usuários')).toBeInTheDocument();
    expect(screen.getByText('Novo Usuário')).toBeInTheDocument();
  });

  it('should filter users by search term', async () => {
    render(<UserManagementPage />);
    
    const searchInput = screen.getByPlaceholderText('Buscar por nome ou email...');
    fireEvent.change(searchInput, { target: { value: 'joão' } });
    
    // Verificar se a filtragem funcionou
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });
  });
});
```

### Teste de Hook

```typescript
import { renderHook, act } from '@testing-library/react';
import { useUserManagement } from '@/hooks/useUserManagement';

describe('useUserManagement', () => {
  it('should create user successfully', async () => {
    const { result } = renderHook(() => useUserManagement());
    
    const userData = {
      email: 'test@example.com',
      full_name: 'Test User',
      roles: ['user'],
      tenant_id: 'tenant-1',
      send_invitation: true
    };

    await act(async () => {
      await result.current.createUser(userData);
    });

    expect(result.current.isCreatingUser).toBe(false);
  });
});
```

## 10. Performance e Otimização

### Lazy Loading de Componentes

```typescript
import { lazy, Suspense } from 'react';

const UserManagementPage = lazy(() => 
  import('@/components/admin/UserManagementPage').then(module => ({
    default: module.UserManagementPage
  }))
);

const AdminRoute = () => (
  <Suspense fallback={<div>Carregando...</div>}>
    <UserManagementPage />
  </Suspense>
);
```

### Memoização de Componentes

```typescript
import { memo, useMemo } from 'react';

const UserCard = memo(({ user }: { user: ExtendedUser }) => {
  const statusBadge = useMemo(() => {
    return getUserStatusBadge(user.profile.is_active, user.profile.locked_until);
  }, [user.profile.is_active, user.profile.locked_until]);

  return (
    <Card>
      <CardContent>
        <h3>{user.profile.full_name}</h3>
        {statusBadge}
      </CardContent>
    </Card>
  );
});
```

### Debounce para Busca

```typescript
import { useDebouncedCallback } from 'use-debounce';

const UserSearch = () => {
  const { setFilters } = useUserManagement();
  
  const debouncedSearch = useDebouncedCallback(
    (searchTerm: string) => {
      setFilters({ search: searchTerm });
    },
    300
  );

  return (
    <Input
      placeholder="Buscar usuários..."
      onChange={(e) => debouncedSearch(e.target.value)}
    />
  );
};
```

---

Estes exemplos cobrem os principais casos de uso do sistema de administração de usuários. Para mais detalhes, consulte a documentação completa em `USER_MANAGEMENT_SYSTEM.md`.