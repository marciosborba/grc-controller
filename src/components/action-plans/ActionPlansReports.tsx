import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Download, FileText, TrendingUp } from 'lucide-react';

export const ActionPlansReports: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios de Planos de Ação</h1>
        <p className="text-gray-600">Gere relatórios e análises detalhadas dos planos de ação</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Relatório Executivo
            </CardTitle>
            <CardDescription>
              Visão geral dos planos de ação para gestores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Relatório Detalhado
            </CardTitle>
            <CardDescription>
              Análise completa de todos os planos e atividades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Análise de Performance
            </CardTitle>
            <CardDescription>
              Métricas de progresso e efetividade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Gerar Análise
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sistema de Relatórios em Desenvolvimento
          </h3>
          <p className="text-gray-600">
            Funcionalidades avançadas de relatórios serão disponibilizadas em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};