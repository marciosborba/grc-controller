import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, X } from 'lucide-react';

interface AlexRiskGuidedProcessSimpleProps {
  onComplete: (riskData: any) => void;
  onCancel: () => void;
}

export const AlexRiskGuidedProcessSimple: React.FC<AlexRiskGuidedProcessSimpleProps> = ({
  onComplete,
  onCancel
}) => {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Análise Alex Risk
            </h2>
            <p className="text-muted-foreground">
              Processo inteligente e assistido por IA para registro completo de riscos
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Conteúdo de teste */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>Alex Risk - Versão de Teste</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-purple-700 dark:text-purple-200">
              🎉 Parabéns! O modal do Alex Risk está funcionando corretamente.
            </p>
            <p className="text-sm text-muted-foreground">
              Esta é uma versão simplificada para testar a integração. 
              O componente completo com 7 etapas será carregado em seguida.
            </p>
            <div className="flex space-x-2">
              <Button 
                onClick={() => onComplete({ risk_title: 'Teste concluído' })}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
              >
                Testar Conclusão
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Fechar Teste
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};