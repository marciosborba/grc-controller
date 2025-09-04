/**
 * ALEX CONFIGURATION PANEL - Painel de configurações
 * 
 * Interface para configurar o Assessment Engine por tenant
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Cog } from 'lucide-react';

interface AlexConfigurationPanelProps {
  currentConfig: any;
  userRole: string;
}

const AlexConfigurationPanel: React.FC<AlexConfigurationPanelProps> = ({
  currentConfig,
  userRole
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Assessment Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Cog className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Painel de Configuração</h3>
            <p className="text-gray-600 mb-4">
              Interface de configuração será implementada em breve
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlexConfigurationPanel;