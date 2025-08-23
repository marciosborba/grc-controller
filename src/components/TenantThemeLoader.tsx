import { useEffect } from 'react';
import { useTenantTheme } from '@/hooks/useTenantTheme';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Componente responsável por carregar e aplicar automaticamente
 * as configurações de tema do tenant quando o usuário faz login.
 * 
 * Este componente deve ser usado dentro do AuthProvider para ter
 * acesso às informações do usuário logado.
 */
export const TenantThemeLoader: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  // Só usar o hook se o usuário estiver logado
  const shouldLoadTheme = user && !isLoading;
  
  // Usar o hook condicionalmente pode causar problemas
  // Então vamos sempre usar o hook, mas ele vai verificar internamente
  const { tenantTheme, loading } = useTenantTheme();

  useEffect(() => {
    if (shouldLoadTheme && tenantTheme && !loading) {
      console.log('🎨 TenantThemeLoader: Tema do tenant carregado:', tenantTheme);
    }
  }, [shouldLoadTheme, tenantTheme, loading]);

  // Este componente não renderiza nada visualmente
  // Ele apenas gerencia o carregamento e aplicação do tema
  return null;
};