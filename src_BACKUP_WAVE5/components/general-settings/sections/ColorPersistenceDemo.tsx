import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  RefreshCw, 
  Palette,
  Info
} from 'lucide-react';
import { loadPendingColors, hasPendingColors } from '@/utils/colorFileManager';

export const ColorPersistenceDemo: React.FC = () => {
  const [reloadCount, setReloadCount] = useState(0);
  const [persistedColors, setPersistedColors] = useState(false);

  useEffect(() => {
    // Check if there are persisted colors
    setPersistedColors(hasPendingColors());
    
    // Simulate page reload counter
    const count = parseInt(localStorage.getItem('demo-reload-count') || '0');
    setReloadCount(count);
  }, []);

  const simulateReload = () => {
    const newCount = reloadCount + 1;
    setReloadCount(newCount);
    localStorage.setItem('demo-reload-count', newCount.toString());
    
    // Force refresh of the page to demonstrate persistence
    window.location.reload();
  };

  const resetDemo = () => {
    localStorage.removeItem('demo-reload-count');
    setReloadCount(0);
  };

  const pendingData = loadPendingColors();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Demonstração de Persistência
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Card */}
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-primary">
                {persistedColors ? '✅' : '⭕'}
              </div>
              <div className="text-sm font-medium mt-2">
                {persistedColors ? 'Cores Personalizadas' : 'Cores Padrão'}
              </div>
              <Badge variant={persistedColors ? 'default' : 'secondary'} className="mt-2">
                {persistedColors ? 'Ativas' : 'Inativas'}
              </Badge>
            </div>

            {/* Reload Counter */}
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">
                {reloadCount}
              </div>
              <div className="text-sm font-medium mt-2">
                Recarregamentos
              </div>
              <Badge variant="outline" className="mt-2">
                Contador de Teste
              </Badge>
            </div>

            {/* Last Update */}
            <div className="text-center p-4 rounded-lg border">
              <div className="text-sm font-bold text-green-600">
                {pendingData ? (
                  new Date(pendingData.palette.light.primary?.hex || Date.now()).toLocaleTimeString('pt-BR')
                ) : (
                  '--:--'
                )}
              </div>
              <div className="text-sm font-medium mt-2">
                Última Atualização
              </div>
              <Badge variant={pendingData ? 'default' : 'secondary'} className="mt-2">
                {pendingData ? 'Registrada' : 'Nenhuma'}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 justify-center pt-4">
            <Button onClick={simulateReload} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Simular Reload
            </Button>
            <Button onClick={resetDemo} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reset Demo
            </Button>
          </div>

          {/* Status Alert */}
          {persistedColors ? (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                <strong>✅ Persistência Funcionando!</strong> As cores personalizadas foram detectadas e aplicadas automaticamente.
                Elas persistem mesmo após recarregar a página ou fechar e abrir o navegador.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>💡 Como Testar:</strong> Altere algumas cores usando os seletores acima, 
                clique em "Aplicar Cores" e depois clique em "Simular Reload" para ver a persistência funcionando.
              </AlertDescription>
            </Alert>
          )}

          {/* Technical Details */}
          <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
            <p><strong>Como funciona:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>As cores são salvas no localStorage temporariamente</li>
              <li>Um elemento &lt;style&gt; é injetado no &lt;head&gt; com as cores customizadas</li>
              <li>No reload, o hook detecta cores pendentes e as aplica automaticamente</li>
              <li>Para persistência permanente, substitua o arquivo CSS conforme instruções</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};