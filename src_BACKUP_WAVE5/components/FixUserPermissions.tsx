import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const FixUserPermissions: React.FC = () => {
  const { user, refreshUserData } = useAuth();
  const [isFixing, setIsFixing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const fixPermissions = async () => {
    if (!user) {
      toast.error('Usuário não encontrado');
      return;
    }

    setIsFixing(true);
    setLogs([]);
    addLog('🔧 Iniciando correção de permissões...');

    try {
      const userId = user.id;
      addLog(`👤 Usuário ID: ${userId}`);

      // 1. Verificar roles atuais
      addLog('📊 Verificando roles atuais...');
      const { data: currentRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      if (rolesError) {
        addLog(`❌ Erro ao buscar roles: ${rolesError.message}`);
      } else {
        addLog(`📋 Roles atuais: ${currentRoles?.map(r => r.role).join(', ') || 'nenhuma'}`);
      }

      // 2. Adicionar roles de admin
      addLog('🚨 Adicionando roles de admin...');
      const adminRoles = ['platform_admin', 'super_admin', 'admin'];

      for (const role of adminRoles) {
        addLog(`➕ Adicionando role: ${role}`);
        
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: role
          });

        if (error) {
          if (error.code === '23505') { // Duplicate key
            addLog(`ℹ️  Role ${role} já existe`);
          } else {
            addLog(`❌ Erro ao adicionar role ${role}: ${error.message}`);
          }
        } else {
          addLog(`✅ Role ${role} adicionada com sucesso`);
        }
      }

      // 3. Verificar roles finais
      addLog('📊 Verificando roles finais...');
      const { data: finalRoles, error: finalRolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      if (finalRolesError) {
        addLog(`❌ Erro ao verificar roles finais: ${finalRolesError.message}`);
      } else {
        addLog(`🎉 Roles finais: ${finalRoles?.map(r => r.role).join(', ') || 'nenhuma'}`);
      }

      // 4. Recarregar dados do usuário
      addLog('🔄 Recarregando dados do usuário...');
      await refreshUserData();
      
      addLog('✅ Correção concluída!');
      toast.success('Permissões corrigidas! Recarregue a página para ver as mudanças.');

    } catch (error: any) {
      addLog(`❌ Erro inesperado: ${error.message}`);
      toast.error('Erro ao corrigir permissões');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '2px solid orange', margin: '20px', fontFamily: 'monospace' }}>
      <h2>🔧 CORREÇÃO DE PERMISSÕES NO BANCO</h2>
      
      <div style={{ backgroundColor: '#f5f5f5', padding: '10px', marginTop: '10px' }}>
        <p><strong>Usuário atual:</strong> {user?.email}</p>
        <p><strong>isPlatformAdmin:</strong> <span style={{ color: user?.isPlatformAdmin ? 'green' : 'red' }}>{String(user?.isPlatformAdmin)}</span></p>
        <p><strong>Roles:</strong> {JSON.stringify(user?.roles)}</p>
      </div>

      <button 
        onClick={fixPermissions}
        disabled={isFixing}
        style={{
          padding: '10px 20px',
          backgroundColor: isFixing ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: isFixing ? 'not-allowed' : 'pointer',
          marginTop: '10px'
        }}
      >
        {isFixing ? '🔄 Corrigindo...' : '🚨 CORRIGIR PERMISSÕES NO BANCO'}
      </button>

      {logs.length > 0 && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#000', 
          color: '#00ff00', 
          maxHeight: '300px', 
          overflowY: 'auto',
          fontSize: '12px'
        }}>
          <h3 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>📋 LOGS:</h3>
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FixUserPermissions;