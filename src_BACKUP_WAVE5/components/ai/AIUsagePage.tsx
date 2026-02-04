import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const AIUsagePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/ai-manager')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Estatísticas de Uso
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitore custos, performance e uso dos provedores de IA
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Estatísticas de Uso</h3>
          <p className="text-muted-foreground">
            Esta funcionalidade está em desenvolvimento. Em breve você terá acesso a métricas detalhadas de uso, custos e performance dos provedores de IA.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIUsagePage;