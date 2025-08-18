import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SystemDiagnosticSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Diagnostics</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Diagnósticos temporariamente desabilitados devido a problemas de tipagem.
          Será reativado em breve.
        </p>
      </CardContent>
    </Card>
  );
};

export default SystemDiagnosticSection;