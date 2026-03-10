import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Target,
  Plus,
  BarChart3,
  Settings,
  Activity
} from 'lucide-react';

export const ActionPlansDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Planos de Ação</h1>
          <p className="text-muted-foreground">Central de Gestão e Acompanhamento de Planos de Ação</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/action-plans/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Plano
          </Button>
        </div>
      </div>

      {/* Métricas Simples */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Planos</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Target className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Execução</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Activity className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Target className="h-10 w-10 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vencidos</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Target className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Módulo Ativo */}
      <Card>
        <CardHeader>
          <CardTitle>Sistema de Planos de Ação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="h-16 w-16 mx-auto text-blue-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Módulo de Planos de Ação Ativo
            </h3>
            <p className="text-muted-foreground mb-6">
              O módulo foi implementado com sucesso e está funcionando corretamente.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => navigate('/action-plans/management')}
              >
                <Target className="h-6 w-6" />
                <span>Gerenciar Planos</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => navigate('/action-plans/create')}
              >
                <Plus className="h-6 w-6" />
                <span>Criar Plano</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => navigate('/action-plans/reports')}
              >
                <BarChart3 className="h-6 w-6" />
                <span>Relatórios</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => navigate('/action-plans/settings')}
              >
                <Settings className="h-6 w-6" />
                <span>Configurações</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};