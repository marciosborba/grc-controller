import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PlanejamentoTestePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">🎯 Planejamento Estratégico</h1>
        <p className="text-muted-foreground">
          Sistema completo de planejamento estratégico organizacional
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dashboard Funcionando</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">✅ OK</p>
            <p className="text-sm text-muted-foreground">
              Componente carregou corretamente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Planos de Ação</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">12</p>
            <p className="text-sm text-muted-foreground">
              Planos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cronograma</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">25</p>
            <p className="text-sm text-muted-foreground">
              Atividades programadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notificações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">8</p>
            <p className="text-sm text-muted-foreground">
              Alertas pendentes
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teste de Funcionalidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>✅ Componente React carregou</p>
            <p>✅ UI Components funcionando</p>
            <p>✅ Rota configurada corretamente</p>
            <p>🎯 Planejamento estratégico está operacional!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}