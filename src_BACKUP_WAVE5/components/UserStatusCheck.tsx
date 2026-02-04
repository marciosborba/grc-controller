import React from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';

const UserStatusCheck: React.FC = () => {
  const { user } = useAuth();

  console.log('🔍 [USER STATUS CHECK] Estado atual do usuário:', {
    user,
    isPlatformAdmin: user?.isPlatformAdmin,
    roles: user?.roles,
    permissions: user?.permissions,
    id: user?.id,
    email: user?.email,
    name: user?.name,
    tenantId: user?.tenantId
  });

  if (!user) {
    return (
      <div style={{ padding: '20px', border: '2px solid red', margin: '20px' }}>
        <h2>❌ USUÁRIO NÃO ENCONTRADO</h2>
        <p>Nenhum usuário logado no momento.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', border: '2px solid blue', margin: '20px', fontFamily: 'monospace' }}>
      <h2>🔍 STATUS DO USUÁRIO</h2>
      <div style={{ backgroundColor: '#f5f5f5', padding: '10px', marginTop: '10px' }}>
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Nome:</strong> {user.name}</p>
        <p><strong>Tenant ID:</strong> {user.tenantId}</p>
        <p><strong>isPlatformAdmin:</strong> <span style={{ color: user.isPlatformAdmin ? 'green' : 'red', fontWeight: 'bold' }}>{String(user.isPlatformAdmin)}</span></p>
        <p><strong>Roles:</strong> {JSON.stringify(user.roles)}</p>
        <p><strong>Permissions:</strong> {JSON.stringify(user.permissions)}</p>
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: user.isPlatformAdmin ? '#d4edda' : '#f8d7da' }}>
        {user.isPlatformAdmin ? (
          <p style={{ color: 'green', fontWeight: 'bold' }}>✅ USUÁRIO TEM PERMISSÕES DE ADMIN</p>
        ) : (
          <p style={{ color: 'red', fontWeight: 'bold' }}>❌ USUÁRIO NÃO TEM PERMISSÕES DE ADMIN</p>
        )}
      </div>
    </div>
  );
};

export default UserStatusCheck;