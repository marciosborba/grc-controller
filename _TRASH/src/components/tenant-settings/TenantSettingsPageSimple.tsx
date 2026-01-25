import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

const TenantSettingsPageSimple: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações da Organização (Teste Simples)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Esta é uma versão simplificada para teste.</p>
          <p>Se esta página carregar, o problema está no componente principal.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export { TenantSettingsPageSimple };
export default TenantSettingsPageSimple;