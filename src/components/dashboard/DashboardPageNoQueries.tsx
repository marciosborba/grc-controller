import React from 'react';
import { ExecutiveDashboardNoQueries } from './ExecutiveDashboardNoQueries';
import RiskMatrixNoQueries from './RiskMatrixNoQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

const DashboardPageNoQueries = () => {
  console.log('🚀 DashboardPageNoQueries carregado em:', new Date().toISOString());

  return (
    <div className="space-y-6">
      {/* Banner de Teste */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">Modo de Teste - Dashboard sem Queries</h3>
              <p className="text-sm text-green-700">
                Esta versão não faz queries ao banco de dados. Se carregar rapidamente, 
                o problema está nas queries. Se ainda estiver lento, o problema é mais fundamental.
              </p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              SEM QUERIES
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Executivo */}
      <ExecutiveDashboardNoQueries />

      {/* Matriz de Riscos */}
      <RiskMatrixNoQueries />
    </div>
  );
};

export default DashboardPageNoQueries;