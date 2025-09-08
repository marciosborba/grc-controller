import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Activity, Clock, Users, LogOut, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ActiveSession {
  id: string;
  userId: string;
  userEmail: string;
  ipAddress: string;
  location: string;
  device: string;
  browser: string;
  loginTime: string;
  lastActivity: string;
  isCurrentSession: boolean;
}

interface SessionManagementSectionProps {
  tenantId: string;
  onSettingsChange: () => void;
}

export const SessionManagementSection: React.FC<SessionManagementSectionProps> = ({
  tenantId,
  onSettingsChange
}) => {
  const [sessionSettings, setSessionSettings] = useState({
    maxConcurrentSessions: 3,
    sessionTimeoutMinutes: 30,
    forceLogoutOnPasswordChange: true,
    trackDeviceFingerprint: true,
    allowMultipleDevices: true
  });

  const [activeSessions] = useState<ActiveSession[]>([
    {
      id: '1',
      userId: '1',
      userEmail: 'admin@empresa.com',
      ipAddress: '192.168.1.100',
      location: 'São Paulo, BR',
      device: 'Desktop',
      browser: 'Chrome 120',
      loginTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      isCurrentSession: true
    },
    {
      id: '2',
      userId: '2',
      userEmail: 'maria@empresa.com',
      ipAddress: '10.0.0.50',
      location: 'Rio de Janeiro, BR',
      device: 'Mobile',
      browser: 'Safari 17',
      loginTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isCurrentSession: false
    }
  ]);

  const handleTerminateSession = (sessionId: string) => {
    if (confirm('Tem certeza que deseja encerrar esta sessão?')) {
      // Implementar terminação de sessão
      toast.success('Sessão encerrada com sucesso');
    }
  };

  const handleTerminateAllSessions = () => {
    if (confirm('Tem certeza que deseja encerrar todas as sessões ativas? Todos os usuários serão desconectados.')) {
      // Implementar terminação de todas as sessões
      toast.success('Todas as sessões foram encerradas');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Gerenciamento de Sessões
          </CardTitle>
          <CardDescription>
            Configure políticas de sessão e monitore sessões ativas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configurações de Sessão */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max-sessions">Máximo de sessões simultâneas por usuário</Label>
                <Input
                  id="max-sessions"
                  type="number"
                  value={sessionSettings.maxConcurrentSessions}
                  onChange={(e) => {
                    setSessionSettings({
                      ...sessionSettings,
                      maxConcurrentSessions: parseInt(e.target.value)
                    });
                    onSettingsChange();
                  }}
                  min={1}
                  max={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-timeout">Timeout de sessão (minutos)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={sessionSettings.sessionTimeoutMinutes}
                  onChange={(e) => {
                    setSessionSettings({
                      ...sessionSettings,
                      sessionTimeoutMinutes: parseInt(e.target.value)
                    });
                    onSettingsChange();
                  }}
                  min={5}
                  max={1440}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="force-logout">Forçar logout ao alterar senha</Label>
                  <p className="text-xs text-muted-foreground">
                    Encerra todas as outras sessões do usuário
                  </p>
                </div>
                <Switch
                  id="force-logout"
                  checked={sessionSettings.forceLogoutOnPasswordChange}
                  onCheckedChange={(checked) => {
                    setSessionSettings({
                      ...sessionSettings,
                      forceLogoutOnPasswordChange: checked
                    });
                    onSettingsChange();
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="track-device">Rastrear impressão digital do dispositivo</Label>
                  <p className="text-xs text-muted-foreground">
                    Detecta mudanças no dispositivo/navegador
                  </p>
                </div>
                <Switch
                  id="track-device"
                  checked={sessionSettings.trackDeviceFingerprint}
                  onCheckedChange={(checked) => {
                    setSessionSettings({
                      ...sessionSettings,
                      trackDeviceFingerprint: checked
                    });
                    onSettingsChange();
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="multiple-devices">Permitir múltiplos dispositivos</Label>
                  <p className="text-xs text-muted-foreground">
                    Usuário pode estar logado em vários dispositivos
                  </p>
                </div>
                <Switch
                  id="multiple-devices"
                  checked={sessionSettings.allowMultipleDevices}
                  onCheckedChange={(checked) => {
                    setSessionSettings({
                      ...sessionSettings,
                      allowMultipleDevices: checked
                    });
                    onSettingsChange();
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessões Ativas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Sessões Ativas
              </CardTitle>
              <CardDescription>
                Monitore e gerencie sessões ativas dos usuários
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={handleTerminateAllSessions}
              className="text-red-600 hover:text-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Encerrar Todas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Dispositivo</TableHead>
                  <TableHead>Login</TableHead>
                  <TableHead>Última Atividade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{session.userEmail}</div>
                        <div className="text-sm text-muted-foreground">{session.ipAddress}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{session.location}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{session.device}</div>
                        <div className="text-xs text-muted-foreground">{session.browser}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(session.loginTime).toLocaleDateString('pt-BR')}
                        <div className="text-xs text-muted-foreground">
                          {new Date(session.loginTime).toLocaleTimeString('pt-BR')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(session.lastActivity).toLocaleDateString('pt-BR')}
                        <div className="text-xs text-muted-foreground">
                          {new Date(session.lastActivity).toLocaleTimeString('pt-BR')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {session.isCurrentSession ? (
                        <Badge className="bg-green-100 text-green-800">
                          Sessão Atual
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Ativa
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!session.isCurrentSession && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTerminateSession(session.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {activeSessions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma sessão ativa encontrada.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas de Sessão */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sessões Ativas</p>
                <p className="text-2xl font-bold">{activeSessions.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tempo Médio de Sessão</p>
                <p className="text-2xl font-bold">2h 15m</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sessões Suspeitas (24h)</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};