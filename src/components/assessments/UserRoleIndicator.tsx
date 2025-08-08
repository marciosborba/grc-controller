import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { UserCheck, UserCog, AlertCircle } from 'lucide-react';

interface UserRoleIndicatorProps {
  userRole: 'respondent' | 'auditor' | null;
}

const UserRoleIndicator: React.FC<UserRoleIndicatorProps> = ({ userRole }) => {
  if (!userRole) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <div className="text-sm">
              <strong>Sem papel atribuído</strong> - Você pode visualizar este assessment, mas não pode editar ou avaliar controles.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const roleInfo = {
    respondent: {
      label: 'Respondente',
      icon: UserCheck,
      color: 'bg-blue-100 text-blue-800',
      description: 'Você pode responder questões e avaliar a maturidade dos controles.',
      permissions: [
        'Preencher respostas de implementação',
        'Avaliar nível de maturidade inicial',
        'Adicionar comentários'
      ]
    },
    auditor: {
      label: 'Auditor',
      icon: UserCog,
      color: 'bg-green-100 text-green-800',
      description: 'Você pode revisar respostas, fazer análises e dar avaliação final.',
      permissions: [
        'Revisar respostas dos respondentes',
        'Fazer análises e recomendações',
        'Dar avaliação final de maturidade',
        'Finalizar avaliação de controles'
      ]
    }
  };

  const role = roleInfo[userRole];
  const Icon = role.icon;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={role.color}>
                {role.label}
              </Badge>
              <span className="text-sm font-medium">Seu papel neste assessment</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {role.description}
            </p>
            <div className="text-xs text-muted-foreground">
              <strong>Suas permissões:</strong>
              <ul className="mt-1 space-y-0.5">
                {role.permissions.map((permission, index) => (
                  <li key={index} className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-primary rounded-full"></span>
                    {permission}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRoleIndicator;