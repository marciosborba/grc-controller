import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Bell, Users, FileText } from 'lucide-react';

export const ActionPlansSettings: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações de Planos de Ação</h1>
        <p className="text-gray-600">Configure as preferências do módulo de planos de ação</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configure alertas e lembretes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configurar Notificações
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Permissões
            </CardTitle>
            <CardDescription>
              Gerencie permissões de acesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Gerenciar Permissões
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Templates
            </CardTitle>
            <CardDescription>
              Configure templates padrão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configurar Templates
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Geral
            </CardTitle>
            <CardDescription>
              Configurações gerais do módulo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configurações Gerais
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Settings className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Configurações em Desenvolvimento
          </h3>
          <p className="text-gray-600">
            Funcionalidades de configuração serão disponibilizadas em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};