import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info,
  Shield,
  Zap,
  Heart
} from 'lucide-react';

// Demo component to preview color changes
export const ColorPreviewDemo: React.FC = () => {
  return (
    <div className="space-y-6 p-6 bg-background">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          🎨 Preview das Cores Aplicadas
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Esta demonstração mostra como as cores se aplicam aos diferentes componentes da aplicação.
        </p>
        
        {/* Primary Text Demo */}
        <div className="mb-6 p-4 rounded-lg bg-card border">
          <h4 className="text-sm font-medium text-card-foreground mb-3">🔤 Demonstração Primary Text:</h4>
          <div className="space-y-2">
            <p className="text-primary-text text-lg font-semibold" style={{ color: 'hsl(var(--primary-text)) !important' }}>
              Este texto usa a cor --primary-text (class: text-primary-text)
            </p>
            <p className="text-lg font-semibold" style={{ color: 'hsl(var(--primary-text))' }}>
              🧪 Teste DIRETO: Este texto usa style inline com --primary-text
            </p>
            <p className="text-lg font-semibold" style={{ color: 'hsl(300 100% 50%)' }}>
              🔮 Teste ROXO PURO: Este texto deve estar ROXO (sem variável CSS)
            </p>
            <p className="text-lg font-semibold" style={{ color: 'magenta' }}>
              💜 Teste MAGENTA: Este texto deve estar MAGENTA (cor nomeada)
            </p>
            <p className="text-sm text-muted-foreground">
              Mude a cor "Primary Text" na aba Core Colors e veja a mudança aqui!
            </p>
            <div className="flex items-center gap-3 mt-3">
              <div 
                className="w-6 h-6 rounded border border-border"
                style={{ backgroundColor: 'hsl(var(--primary-text))' }}
                title="Cor atual do primary-text"
              />
              <div 
                className="w-6 h-6 rounded border border-border"
                style={{ backgroundColor: 'hsl(300 100% 50%)' }}
                title="Roxo puro de referência"
              />
              <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                --primary-text atual vs roxo puro
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Example */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Score Atual</span>
              <Badge style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
                85%
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all"
                style={{ 
                  width: '85%', 
                  backgroundColor: 'hsl(var(--primary))'
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-secondary" />
              Risk Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: 'hsl(var(--risk-critical))' }}
                />
                <span className="text-sm">Critical: 2</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: 'hsl(var(--risk-high))' }}
                />
                <span className="text-sm">High: 5</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: 'hsl(var(--risk-medium))' }}
                />
                <span className="text-sm">Medium: 12</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: 'hsl(var(--risk-low))' }}
                />
                <span className="text-sm">Low: 8</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-danger" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" style={{ color: 'hsl(var(--success))' }} />
                <span className="text-sm">Database Online</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" style={{ color: 'hsl(var(--success))' }} />
                <span className="text-sm">API Healthy</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" style={{ color: 'hsl(var(--warning))' }} />
                <span className="text-sm">Cache Warning</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Buttons Example */}
      <div className="space-y-4">
        <h4 className="text-md font-medium">Botões e Interações</h4>
        <div className="flex flex-wrap gap-3">
          <Button>
            Primary Button
          </Button>
          <Button variant="secondary">
            Secondary Button  
          </Button>
          <Button variant="outline">
            Outline Button
          </Button>
          <Button variant="destructive">
            Destructive Button
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      <div className="space-y-4">
        <h4 className="text-md font-medium">Mensagens de Status</h4>
        <div className="space-y-3">
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CheckCircle className="h-4 w-4" style={{ color: 'hsl(var(--success))' }} />
            <AlertDescription>
              <strong>Sucesso:</strong> Operação realizada com sucesso!
            </AlertDescription>
          </Alert>

          <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
            <AlertTriangle className="h-4 w-4" style={{ color: 'hsl(var(--warning))' }} />
            <AlertDescription>
              <strong>Atenção:</strong> Verificação manual necessária.
            </AlertDescription>
          </Alert>

          <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <XCircle className="h-4 w-4" style={{ color: 'hsl(var(--danger))' }} />
            <AlertDescription>
              <strong>Erro:</strong> Falha na operação. Tente novamente.
            </AlertDescription>
          </Alert>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Informação:</strong> Este é um exemplo de mensagem informativa.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Form Elements */}
      <div className="space-y-4">
        <h4 className="text-md font-medium">Elementos de Formulário</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="Digite algo aqui..." />
          <Input placeholder="Campo com foco..." className="focus:ring-2" />
        </div>
      </div>

      {/* GRC Risk Badges */}
      <div className="space-y-4">
        <h4 className="text-md font-medium">Níveis de Risco GRC</h4>
        <div className="flex flex-wrap gap-3">
          <Badge 
            className="text-white font-medium"
            style={{ backgroundColor: 'hsl(var(--risk-critical))' }}
          >
            CRÍTICO
          </Badge>
          <Badge 
            className="text-white font-medium"
            style={{ backgroundColor: 'hsl(var(--risk-high))' }}
          >
            ALTO
          </Badge>
          <Badge 
            className="text-black font-medium"
            style={{ backgroundColor: 'hsl(var(--risk-medium))' }}
          >
            MÉDIO
          </Badge>
          <Badge 
            className="text-white font-medium"
            style={{ backgroundColor: 'hsl(var(--risk-low))' }}
          >
            BAIXO
          </Badge>
        </div>
      </div>
    </div>
  );
};