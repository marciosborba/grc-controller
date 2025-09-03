// ============================================================================
// COMPONENT: TENANT SECURITY GUARD
// ============================================================================
// Componente para validação e proteção de acesso multi-tenant

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Shield, Lock, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTenantSecurity } from '@/utils/tenantSecurity';
import { useAuth} from '@/contexts/AuthContextOptimized';

interface TenantSecurityGuardProps {
  children: React.ReactNode;
  requireValidTenant?: boolean;
  allowedRoles?: string[];
  resourceTenantId?: string | null;
  resourceName?: string;
  showTenantInfo?: boolean;
  strictMode?: boolean;
  onSecurityViolation?: (violation: string, details: any) => void;
}

interface SecurityStatus {
  hasAccess: boolean;
  tenantValid: boolean;
  roleValid: boolean;
  crossTenantAttempt: boolean;
  violations: string[];
  details: any;
}

export const TenantSecurityGuard: React.FC<TenantSecurityGuardProps> = ({
  children,
  requireValidTenant = true,
  allowedRoles = [],
  resourceTenantId,
  resourceName = 'recurso',
  showTenantInfo = false,
  strictMode = true,
  onSecurityViolation
}) => {
  const { user } = useAuth();
  const { 
    userTenantId, 
    validateAccess, 
    logActivity, 
    isValidTenant 
  } = useTenantSecurity();
  
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    hasAccess: false,
    tenantValid: false,
    roleValid: false,
    crossTenantAttempt: false,
    violations: [],
    details: {}
  });
  
  const [isLoading, setIsLoading] = useState(true);

  // Validar acesso quando componente monta ou dados mudam
  useEffect(() => {
    const validateSecurity = async () => {
      setIsLoading(true);
      
      const violations: string[] = [];
      let hasAccess = true;
      const details: any = {
        userId: user?.id,
        userTenantId: userTenantId,
        resourceTenantId: resourceTenantId,
        requiredRoles: allowedRoles,
        userRoles: user?.roles || [],
        timestamp: new Date().toISOString()
      };

      // 1. Validar se usuário tem tenant
      const tenantValid = requireValidTenant ? isValidTenant : true;
      if (requireValidTenant && !tenantValid) {
        violations.push('Usuário não possui tenant válido');
        hasAccess = false;
        
        await logActivity('invalid_access', {
          reason: 'No valid tenant',
          ...details
        });
      }

      // 2. Validar roles se especificadas
      let roleValid = true;
      if (allowedRoles.length > 0) {
        const userRoles = user?.roles || [];
        roleValid = allowedRoles.some(role => userRoles.includes(role)) || userRoles.includes('admin');
        
        if (!roleValid) {
          violations.push(`Acesso requer uma das seguintes permissões: ${allowedRoles.join(', ')}`);
          hasAccess = false;
          
          await logActivity('invalid_access', {
            reason: 'Insufficient roles',
            requiredRoles: allowedRoles,
            userRoles: userRoles,
            ...details
          });
        }
      }

      // 3. Validar acesso cross-tenant se resourceTenantId especificado
      let crossTenantAttempt = false;
      if (resourceTenantId && userTenantId) {
        const validation = validateAccess(resourceTenantId, { strictMode, logAttempts: true });
        
        if (!validation.isValid) {
          crossTenantAttempt = true;
          violations.push(validation.error || 'Tentativa de acesso cross-tenant detectada');
          hasAccess = false;
          
          await logActivity('cross_tenant_attempt', {
            reason: validation.error,
            code: validation.code,
            resourceName,
            ...details
          });
        }
      }

      const status: SecurityStatus = {
        hasAccess,
        tenantValid,
        roleValid,
        crossTenantAttempt,
        violations,
        details
      };

      setSecurityStatus(status);

      // Callback para violação de segurança
      if (!hasAccess && onSecurityViolation) {
        onSecurityViolation('security_violation', {
          violations,
          ...details
        });
      }

      setIsLoading(false);
    };

    validateSecurity();
  }, [
    user?.id, 
    userTenantId, 
    resourceTenantId, 
    requireValidTenant, 
    allowedRoles.join(','), 
    strictMode,
    resourceName
  ]);

  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full w-fit">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-pulse" />
          </div>
          <CardTitle className="text-lg">Validando Acesso</CardTitle>
          <CardDescription>
            Verificando permissões de segurança multi-tenant...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Acesso negado - mostrar erro de segurança
  if (!securityStatus.hasAccess) {
    return (
      <Card className="w-full max-w-lg mx-auto border-red-200 dark:border-red-800">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 p-2 bg-red-100 dark:bg-red-900/20 rounded-full w-fit">
            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-lg text-red-700 dark:text-red-300">
            Acesso Negado
          </CardTitle>
          <CardDescription>
            Você não tem permissão para acessar {resourceName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {securityStatus.violations.map((violation, index) => (
            <Alert key={index} className="border-red-200 bg-red-50 dark:bg-red-950">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {violation}
              </AlertDescription>
            </Alert>
          ))}
          
          {securityStatus.crossTenantAttempt && (
            <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950">
              <Lock className="h-4 w-4" />
              <AlertTitle className="text-orange-800 dark:text-orange-200">
                Isolamento Multi-Tenant
              </AlertTitle>
              <AlertDescription className="text-orange-700 dark:text-orange-300">
                Este recurso pertence a outra organização e não pode ser acessado por questões de segurança.
              </AlertDescription>
            </Alert>
          )}

          {showTenantInfo && (
            <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
              <p><strong>Seu Tenant:</strong> {userTenantId || 'Não definido'}</p>
              {resourceTenantId && (
                <p><strong>Tenant do Recurso:</strong> {resourceTenantId}</p>
              )}
              {allowedRoles.length > 0 && (
                <p><strong>Roles Necessárias:</strong> {allowedRoles.join(', ')}</p>
              )}
              <p><strong>Suas Roles:</strong> {user?.roles?.join(', ') || 'Nenhuma'}</p>
            </div>
          )}

          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="text-xs"
            >
              Recarregar Página
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Acesso autorizado - mostrar conteúdo
  return (
    <div className="w-full">
      {showTenantInfo && (
        <div className="mb-4">
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
            <Shield className="h-4 w-4" />
            <AlertTitle className="text-green-800 dark:text-green-200">
              Acesso Autorizado
            </AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300 flex items-center gap-2">
              <span>Tenant:</span>
              <Badge variant="secondary" className="text-xs">
                {user?.tenant?.name || userTenantId}
              </Badge>
            </AlertDescription>
          </Alert>
        </div>
      )}
      {children}
    </div>
  );
};

export default TenantSecurityGuard;