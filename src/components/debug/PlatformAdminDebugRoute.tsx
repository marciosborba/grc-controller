import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Shield, User } from 'lucide-react';

interface PlatformAdminDebugRouteProps {
  children: React.ReactNode;
}

const PlatformAdminDebugRoute: React.FC<PlatformAdminDebugRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  console.log('🔍 [PLATFORM ADMIN ROUTE] Debug:', {
    user,
    isLoading,
    isPlatformAdmin: user?.isPlatformAdmin,
    roles: user?.roles,
    timestamp: new Date().toISOString()
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-border border-t-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando dados de autenticação...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    console.log('❌ [PLATFORM ADMIN ROUTE] Usuário não logado, redirecionando para login');
    return <Navigate to="/login" replace />;
  }
  
  if (!user.isPlatformAdmin) {
    console.log('❌ [PLATFORM ADMIN ROUTE] Usuário não é Platform Admin, redirecionando para dashboard');
    console.log('📊 [PLATFORM ADMIN ROUTE] Dados do usuário:', {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      isPlatformAdmin: user.isPlatformAdmin,
      permissions: user.permissions
    });
    
    // Mostrar página de debug em vez de redirecionar
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Acesso Negado - Platform Admin Necessário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">Problema Identificado:</h3>
              <p className="text-red-700">
                O usuário atual não possui permissões de Platform Admin necessárias para acessar o AI Manager.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Dados do Usuário Atual:</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>ID: {user.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Email: {user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Nome: {user.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Platform Admin: {user.isPlatformAdmin ? 'Sim' : 'Não'}</span>
                </div>
              </div>
              
              {user.roles && user.roles.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Roles Atuais:</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.roles.map((role, index) => (
                      <Badge 
                        key={index} 
                        variant={role === 'platform_admin' ? 'default' : 'secondary'}
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {(!user.roles || user.roles.length === 0) && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-yellow-700">⚠️ Nenhuma role encontrada para este usuário</p>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Solução:</h3>
              <div className="text-blue-700 space-y-2">
                <p>Para acessar o AI Manager, adicione uma das seguintes roles ao usuário:</p>
                <ul className="list-disc list-inside ml-4">
                  <li><code>admin</code></li>
                  <li><code>super_admin</code></li>
                  <li><code>platform_admin</code></li>
                </ul>
                <p className="mt-3">
                  <strong>SQL para adicionar role:</strong>
                </p>
                <code className="block bg-gray-100 p-2 rounded text-sm mt-1">
                  INSERT INTO user_roles (user_id, role) VALUES ('{user.id}', 'platform_admin');
                </code>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Ir para Dashboard
              </button>
              <button
                onClick={() => window.location.href = '/auth-debug'}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Ver Debug de Auth
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  console.log('✅ [PLATFORM ADMIN ROUTE] Usuário é Platform Admin, permitindo acesso');
  return <>{children}</>;
};

export default PlatformAdminDebugRoute;