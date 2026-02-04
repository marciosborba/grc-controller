import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { UserX, Ban, Unlock, AlertTriangle, Shield } from 'lucide-react';

interface SessionActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: 'terminate' | 'block' | 'unblock';
  userName: string;
  userEmail?: string;
  ipAddress?: string;
  location?: string;
  isLoading?: boolean;
}

export const SessionActionDialog: React.FC<SessionActionDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  userName,
  userEmail,
  ipAddress,
  location,
  isLoading = false
}) => {
  const getActionConfig = () => {
    switch (action) {
      case 'terminate':
        return {
          title: 'Encerrar Sessão',
          description: 'Tem certeza que deseja encerrar a sessão deste usuário?',
          icon: <UserX className="h-5 w-5 text-red-600" />,
          actionText: 'Encerrar Sessão',
          actionVariant: 'destructive' as const,
          consequences: [
            'O usuário será desconectado imediatamente',
            'Todas as sessões ativas serão encerradas',
            'O usuário precisará fazer login novamente',
            'Esta ação será registrada nos logs de auditoria'
          ]
        };
      case 'block':
        return {
          title: 'Bloquear Usuário',
          description: 'Tem certeza que deseja bloquear este usuário?',
          icon: <Ban className="h-5 w-5 text-red-600" />,
          actionText: 'Bloquear Usuário',
          actionVariant: 'destructive' as const,
          consequences: [
            'O usuário será bloqueado por 24 horas',
            'Todas as sessões ativas serão encerradas',
            'O usuário não poderá fazer login durante o bloqueio',
            'Esta ação será registrada nos logs de auditoria'
          ]
        };
      case 'unblock':
        return {
          title: 'Desbloquear Usuário',
          description: 'Tem certeza que deseja desbloquear este usuário?',
          icon: <Unlock className="h-5 w-5 text-green-600" />,
          actionText: 'Desbloquear Usuário',
          actionVariant: 'default' as const,
          consequences: [
            'O usuário poderá fazer login novamente',
            'O bloqueio será removido imediatamente',
            'Esta ação será registrada nos logs de auditoria'
          ]
        };
    }
  };

  const config = getActionConfig();

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2">
            {config.icon}
            <span>{config.title}</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>{config.description}</p>

            {/* Informações do usuário */}
            {/* Informações do usuário */}
            <div className="bg-muted/50 p-3 rounded-lg space-y-2 border border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Usuário:</span>
                <span className="text-sm font-semibold">{userName}</span>
              </div>
              {userEmail && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Email:</span>
                  <span className="text-sm text-foreground/90">{userEmail}</span>
                </div>
              )}
              {ipAddress && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">IP:</span>
                  <span className="text-sm font-mono text-foreground/90">{ipAddress}</span>
                </div>
              )}
              {location && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Localização:</span>
                  <span className="text-sm text-foreground/90">{location}</span>
                </div>
              )}
            </div>

            {/* Consequências */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Consequências:</span>
              </div>
              <ul className="text-sm space-y-1 ml-6 text-muted-foreground">
                {config.consequences.map((consequence, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>{consequence}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Aviso de segurança */}
            <div className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-900/50">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div className="text-xs text-blue-800 dark:text-blue-300">
                <strong>Nota de Segurança:</strong> Esta ação será registrada nos logs de auditoria
                e pode ser revisada por outros administradores.
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={config.actionVariant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {isLoading ? 'Processando...' : config.actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};