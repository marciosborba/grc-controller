import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSessionInfo } from '@/hooks/useSessionInfo';
import { 
  Globe, 
  MapPin, 
  Monitor, 
  RefreshCw, 
  Wifi,
  Clock,
  Shield
} from 'lucide-react';

interface SessionInfoDisplayProps {
  showRefreshButton?: boolean;
  compact?: boolean;
}

export const SessionInfoDisplay: React.FC<SessionInfoDisplayProps> = ({ 
  showRefreshButton = true, 
  compact = false 
}) => {
  const { sessionInfo, isLoading, error, refreshSessionInfo } = useSessionInfo();

  if (isLoading) {
    return (
      <Card className={compact ? "p-4" : ""}>
        <CardContent className={compact ? "p-0" : ""}>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Carregando informações de sessão...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={compact ? "p-4" : ""}>
        <CardContent className={compact ? "p-0" : ""}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-600">Erro: {error}</span>
            {showRefreshButton && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshSessionInfo}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Tentar novamente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sessionInfo) {
    return (
      <Card className={compact ? "p-4" : ""}>
        <CardContent className={compact ? "p-0" : ""}>
          <span className="text-sm text-muted-foreground">
            Informações de sessão não disponíveis
          </span>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-1">
          <Globe className="h-3 w-3" />
          <span>{sessionInfo.ip_address || 'IP não disponível'}</span>
        </div>
        {sessionInfo.location && (
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>
              {sessionInfo.location.city && sessionInfo.location.region 
                ? `${sessionInfo.location.city}, ${sessionInfo.location.region}`
                : sessionInfo.location.city || sessionInfo.location.region || 'Localização não disponível'
              }
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Informações da Sessão Atual</span>
            </CardTitle>
            <CardDescription>
              Dados capturados automaticamente durante o login
            </CardDescription>
          </div>
          {showRefreshButton && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshSessionInfo}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* IP Address */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Endereço IP:</span>
          </div>
          <Badge variant="outline" className="font-mono">
            {sessionInfo.ip_address || 'Não disponível'}
          </Badge>
        </div>

        {/* Location */}
        {sessionInfo.location && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="font-medium">Localização:</span>
            </div>
            <div className="text-right">
              <div className="font-medium">
                {sessionInfo.location.city && sessionInfo.location.region 
                  ? `${sessionInfo.location.city}, ${sessionInfo.location.region}`
                  : sessionInfo.location.city || sessionInfo.location.region || 'Não disponível'
                }
              </div>
              {sessionInfo.location.country && (
                <div className="text-sm text-muted-foreground">
                  {sessionInfo.location.country}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ISP */}
        {sessionInfo.location?.isp && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wifi className="h-4 w-4 text-purple-600" />
              <span className="font-medium">Provedor:</span>
            </div>
            <span className="text-sm">{sessionInfo.location.isp}</span>
          </div>
        )}

        {/* Browser Info */}
        {sessionInfo.browser_info && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Monitor className="h-4 w-4 text-orange-600" />
              <span className="font-medium">Navegador:</span>
            </div>
            <div className="text-right text-sm">
              <div>{sessionInfo.browser_info.platform || 'Plataforma desconhecida'}</div>
              <div className="text-muted-foreground">
                {sessionInfo.browser_info.language || 'Idioma não detectado'}
              </div>
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className="font-medium">Capturado em:</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {new Date(sessionInfo.timestamp).toLocaleString('pt-BR')}
          </span>
        </div>

        {/* Raw Data (for debugging) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-muted-foreground">
              Dados brutos (desenvolvimento)
            </summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(sessionInfo, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
};