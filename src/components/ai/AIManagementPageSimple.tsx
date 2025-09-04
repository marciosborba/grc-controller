import React from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { Navigate } from 'react-router-dom';

const AIManagementPageSimple: React.FC = () => {
  console.log('🎆 [AI MANAGER SIMPLE] === COMPONENTE SIMPLES CARREGADO ===');
  console.log('🕰️ [AI MANAGER SIMPLE] Timestamp:', new Date().toISOString());
  
  const { user } = useAuth();
  
  console.log('👤 [AI MANAGER SIMPLE] Dados do usuário:', {
    id: user?.id,
    isPlatformAdmin: user?.isPlatformAdmin,
    roles: user?.roles
  });

  // Verificar se o usuário é platform admin
  if (!user?.isPlatformAdmin) {
    console.log('❌ [AI MANAGER SIMPLE] Usuário não é Platform Admin, redirecionando');
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log('✅ [AI MANAGER SIMPLE] Usuário é Platform Admin, renderizando componente');

  return (
    <div style={{
      padding: '3rem',
      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      color: 'white',
      fontSize: '24px',
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '2rem' }}>
        🤖 AI MANAGER FUNCIONANDO!
      </h1>
      
      <div style={{ fontSize: '18px', lineHeight: '1.6', maxWidth: '600px' }}>
        <p>✅ Esta é uma versão simplificada do AI Manager</p>
        <p>🔗 URL: /admin/ai-management</p>
        <p>👤 Usuário: {user?.name || user?.email}</p>
        <p>🔐 Platform Admin: {user?.isPlatformAdmin ? 'Sim' : 'Não'}</p>
        <p>🕰️ Carregado em: {new Date().toLocaleString()}</p>
      </div>
      
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: '8px',
        fontSize: '16px'
      }}>
        <p><strong>Status:</strong> Componente AI Manager carregado com sucesso!</p>
        <p><strong>Próximo passo:</strong> Se esta página funciona, o problema era com o componente complexo</p>
      </div>
    </div>
  );
};

export default AIManagementPageSimple;