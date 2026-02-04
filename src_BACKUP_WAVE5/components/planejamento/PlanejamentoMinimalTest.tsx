import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PlanejamentoMinimalTest() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Planejamento de Auditoria</h1>
        <p className="text-muted-foreground mt-2">
          Sistema de planejamento e gestão de auditorias internas
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teste Minimal</CardTitle>
          <CardDescription>
            Componente de teste para verificar se o routing está funcionando
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Se você está vendo esta mensagem, o componente está carregando corretamente.</p>
        </CardContent>
      </Card>
    </div>
  );
}