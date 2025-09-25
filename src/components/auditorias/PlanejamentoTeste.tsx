import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle } from 'lucide-react';

export function PlanejamentoTeste() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Planejamento de Auditoria - TESTE</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-2xl font-bold text-green-600">FUNCIONANDO</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Aba</p>
                <p className="text-2xl font-bold text-green-600">ATIVA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teste de Componente</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Se você está vendo esta mensagem, a aba Planejamento está carregando corretamente!</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Timestamp: {new Date().toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}