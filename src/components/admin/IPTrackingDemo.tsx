import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SessionInfoDisplay } from './SessionInfoDisplay';
import { useSessionInfo, useUserIP } from '@/hooks/useSessionInfo';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Globe,
  MapPin,
  Shield,
  Eye
} from 'lucide-react';

export const IPTrackingDemo: React.FC = () => {
  const { sessionInfo, isLoading: sessionLoading } = useSessionInfo();
  const { ip, isLoading: ipLoading } = useUserIP();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span>Sistema de Rastreamento de IP Implementado</span>
          </CardTitle>
          <CardDescription>
            O sistema agora captura automaticamente o IP real e localização de todos os usuários durante o login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-green-800">IP Real Capturado</div>
                <div className="text-sm text-green-600">
                  {ipLoading ? 'Carregando...' : ip || 'Não disponível'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Globe className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-800">Geolocalização</div>
                <div className="text-sm text-blue-600">
                  {sessionLoading ? 'Carregando...' : 
                   sessionInfo?.location?.city ? 
                   `${sessionInfo.location.city}, ${sessionInfo.location.region}` : 
                   'Detectando...'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <Eye className="h-5 w-5 text-purple-600" />
              <div>
                <div className="font-medium text-purple-800">Sessões Ativas</div>
                <div className="text-sm text-purple-600">Dados reais em tempo real</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funcionalidades Implementadas */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades Implementadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium">Captura Automática de IP</div>
                <div className="text-sm text-muted-foreground">
                  Sistema usa múltiplos serviços (ipify.org, ipapi.co, ipinfo.io) para garantir captura do IP real
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium">Geolocalização Automática</div>
                <div className="text-sm text-muted-foreground">
                  Detecta cidade, estado, país e provedor de internet baseado no IP real
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium">Logging Completo</div>
                <div className="text-sm text-muted-foreground">
                  Todos os logins são registrados com IP, localização e informações do navegador
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium">Sessões Ativas Reais</div>
                <div className="text-sm text-muted-foreground">
                  A guia Segurança agora mostra dados reais de IP e localização dos usuários conectados
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium">Fallback Inteligente</div>
                <div className="text-sm text-muted-foreground">
                  Se um serviço falhar, o sistema tenta outros métodos incluindo WebRTC
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações da Sessão Atual */}
      <SessionInfoDisplay showRefreshButton={true} />

      {/* Como Funciona */}
      <Card>
        <CardHeader>
          <CardTitle>Como o Sistema Funciona</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Durante o Login:</strong> O sistema automaticamente captura o IP real do usuário, 
                detecta a localização geográfica e registra todas essas informações nos logs de atividade.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <Globe className="h-4 w-4" />
              <AlertDescription>
                <strong>Múltiplos Serviços:</strong> Para garantir confiabilidade, o sistema tenta 
                diferentes serviços de detecção de IP (ipify.org, ipapi.co, ipinfo.io) e até WebRTC como fallback.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <MapPin className="h-4 w-4" />
              <AlertDescription>
                <strong>Geolocalização Precisa:</strong> Baseado no IP real, o sistema detecta cidade, 
                estado, país, timezone e provedor de internet do usuário.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Privacidade:</strong> Todas as informações são coletadas apenas para fins de 
                segurança e auditoria, seguindo as melhores práticas de proteção de dados.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Demonstração Técnica */}
      <Card>
        <CardHeader>
          <CardTitle>Demonstração Técnica</CardTitle>
          <CardDescription>
            Veja os dados técnicos capturados em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              variant="outline" 
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Ocultar' : 'Mostrar'} Detalhes Técnicos
            </Button>
            
            {showDetails && sessionInfo && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Informações de Rede</h4>
                    <div className="space-y-1 text-sm">
                      <div><strong>IP:</strong> {sessionInfo.ip_address || 'N/A'}</div>
                      <div><strong>User Agent:</strong> {sessionInfo.user_agent?.substring(0, 50)}...</div>
                      <div><strong>Timezone:</strong> {sessionInfo.location?.timezone || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Localização</h4>
                    <div className="space-y-1 text-sm">
                      <div><strong>Cidade:</strong> {sessionInfo.location?.city || 'N/A'}</div>
                      <div><strong>Estado:</strong> {sessionInfo.location?.region || 'N/A'}</div>
                      <div><strong>País:</strong> {sessionInfo.location?.country || 'N/A'}</div>
                      <div><strong>ISP:</strong> {sessionInfo.location?.isp || 'N/A'}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Dados Brutos (JSON)</h4>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(sessionInfo, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};