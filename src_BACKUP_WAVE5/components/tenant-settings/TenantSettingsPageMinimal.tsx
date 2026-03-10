import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

const TenantSettingsPageMinimal: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações da Organização (Versão Mínima)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Esta é uma versão mínima para identificar o problema.</p>
          <p>Se esta página carregar sem erros, o problema está nos subcomponentes.</p>
          <p>Se esta página também der erro, o problema está no sistema de carregamento.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantSettingsPageMinimal;