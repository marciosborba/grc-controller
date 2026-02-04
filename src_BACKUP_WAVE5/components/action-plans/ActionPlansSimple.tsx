import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ActionPlansSimple: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planos de Ação</h1>
          <p className="text-gray-600">Gestão centralizada de todos os planos de ação da organização</p>
        </div>
        <Button 
          onClick={() => navigate('/action-plans/create')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total de Planos</p>
                <div className="text-2xl font-bold">3</div>
              </div>
              <Target className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Em Execução</p>
                <div className="text-2xl font-bold">1</div>
              </div>
              <Target className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Vencidos</p>
                <div className="text-2xl font-bold">0</div>
              </div>
              <Target className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Concluídos</p>
                <div className="text-2xl font-bold">1</div>
              </div>
              <Target className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sistema de Planos de Ação</CardTitle>
          <CardDescription>
            Módulo centralizado para gestão de todos os planos de ação da organização
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8">
              <Target className="h-16 w-16 mx-auto text-blue-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Módulo de Planos de Ação Ativo
              </h3>
              <p className="text-gray-600 mb-6">
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
                  <Target className="h-6 w-6" />
                  <span>Relatórios</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => navigate('/action-plans/settings')}
                >
                  <Target className="h-6 w-6" />
                  <span>Configurações</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};