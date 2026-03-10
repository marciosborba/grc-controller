
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Role {
  id: string;
  name: string;
  display_name: string;
  permissions: string[];
}

export const useRolesSafe = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Timeout de 3 segundos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );
      
      const queryPromise = supabase
        .from('custom_roles')
        .select('id, name, display_name, permissions')
        .eq('is_active', true)
        .limit(50); // Limitar para evitar queries muito grandes

      const { data, error: queryError } = await Promise.race([queryPromise, timeoutPromise]);

      if (queryError) {
        throw queryError;
      }

      setRoles(data || []);
      console.log('✅ Roles carregadas com sucesso:', data?.length || 0);
      
    } catch (err: any) {
      console.warn('⚠️ Erro ao carregar roles:', err.message);
      setError(err.message);
      
      // Fallback para roles básicas
      setRoles([
        {
          id: 'user',
          name: 'user',
          display_name: 'Usuário Básico',
          permissions: ['read', 'all']
        },
        {
          id: 'admin',
          name: 'admin',
          display_name: 'Administrador',
          permissions: ['*', 'all', 'admin']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  return { roles, loading, error, reload: loadRoles };
};
