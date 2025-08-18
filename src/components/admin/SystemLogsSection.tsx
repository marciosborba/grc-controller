import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SystemLogsSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Logs temporariamente desabilitados devido a problemas de tipagem.
          Será reativado em breve.
        </p>
      </CardContent>
    </Card>
  );
};

export default SystemLogsSection;