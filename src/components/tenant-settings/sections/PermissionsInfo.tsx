import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Building, Settings } from 'lucide-react';

export const PermissionsInfo: React.FC = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Níveis de Acesso
        </CardTitle>
        <CardDescription>
          Entenda os diferentes níveis de permissão no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Admin da Tenant */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building className="h-4 w-4 text-blue-600" />
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                Admin da Organização
              </Badge>
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✅ Gerenciar usuários da sua organização</li>
              <li>✅ Acessar configurações da organização</li>
              <li>✅ Definir políticas e regras</li>
              <li>✅ Visualizar relatórios da organização</li>
              <li>❌ Não acessa outras organizações</li>
            </ul>
          </div>

          {/* Platform Admin */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-purple-600" />
              <Badge variant="outline" className="text-purple-600 border-purple-600">
                Admin da Plataforma
              </Badge>
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✅ Acesso a todas as organizações</li>
              <li>✅ Criar e gerenciar organizações</li>
              <li>✅ Configurações globais da plataforma</li>
              <li>✅ Gerenciar admins de organização</li>
              <li>✅ Acesso total ao sistema</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Como obter permissões</span>
          </div>
          <div className="text-sm text-blue-700">
            <p><strong>Admin da Organização:</strong> Solicite ao Admin da Plataforma para atribuir a role 'admin' ou 'tenant_admin' ao seu usuário.</p>
            <p className="mt-1"><strong>Admin da Plataforma:</strong> Apenas usuários específicos podem ser promovidos a Platform Admin pelo administrador do sistema.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};