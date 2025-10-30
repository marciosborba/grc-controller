import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImportSource, ConnectionConfig } from './types/import';

interface ConnectionTesterProps {
  source: ImportSource;
  config: ConnectionConfig;
  onTestResult: (result: any) => void;
}

export default function ConnectionTester({ source, config, onTestResult }: ConnectionTesterProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Teste de Conexão</CardTitle>
        <CardDescription>
          Teste a conectividade com {source.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Testador de conexão em desenvolvimento...
        </p>
      </CardContent>
    </Card>
  );
}