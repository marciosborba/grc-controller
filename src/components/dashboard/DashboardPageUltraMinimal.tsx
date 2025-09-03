import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Zap } from 'lucide-react';

const DashboardPageUltraMinimal = () => {
  console.log('🚀 DashboardPageUltraMinimal carregado em:', new Date().toISOString());

  return (
    <div className="space-y-6">
      {/* Banner de Teste */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-green-800">Dashboard Ultra Mínimo - Teste de Performance</h1>
              <p className="text-green-700 mt-2">
                Esta é a versão mais simples possível do dashboard. Se ainda estiver lento, 
                o problema é fundamental (AuthContext, servidor, configuração).
              </p>
              <div className="flex gap-2 mt-3">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  ⚡ SEM QUERIES
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  🚫 SEM HOOKS COMPLEXOS
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  📊 SEM GRÁFICOS
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  🎯 APENAS HTML
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo Mínimo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Zap className="h-12 w-12 mx-auto text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold">Teste 1</h3>
            <p className="text-muted-foreground">Componente básico</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Zap className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold">Teste 2</h3>
            <p className="text-muted-foreground">Sem queries</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Zap className="h-12 w-12 mx-auto text-orange-500 mb-4" />
            <h3 className="text-lg font-semibold">Teste 3</h3>
            <p className="text-muted-foreground">Sem hooks</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Zap className="h-12 w-12 mx-auto text-purple-500 mb-4" />
            <h3 className="text-lg font-semibold">Teste 4</h3>
            <p className="text-muted-foreground">Ultra rápido</p>
          </CardContent>
        </Card>
      </div>

      {/* Informações de Debug */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Informações de Debug</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Tempo de carregamento:</strong> {new Date().toLocaleTimeString()}</p>
            <p><strong>Componentes carregados:</strong> Apenas este dashboard</p>
            <p><strong>Hooks executados:</strong> Nenhum hook complexo</p>
            <p><strong>Queries ao banco:</strong> Zero</p>
            <p><strong>Imports lazy:</strong> Nenhum</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPageUltraMinimal;