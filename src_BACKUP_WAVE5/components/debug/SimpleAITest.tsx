import React from 'react';

const SimpleAITest: React.FC = () => {
  console.log('🟢 [SIMPLE AI TEST] Componente carregado com sucesso!');
  console.log('🕰️ [SIMPLE AI TEST] Timestamp:', new Date().toISOString());
  
  return (
    <div style={{
      padding: '3rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
        ✅ TESTE AI MANAGER FUNCIONANDO!
      </h1>
      
      <div style={{ fontSize: '18px', lineHeight: '1.6' }}>
        <p>🎯 Esta é uma versão simplificada do AI Manager</p>
        <p>🔗 URL: /admin/ai-management-simple</p>
        <p>🕰️ Carregado em: {new Date().toLocaleString()}</p>
        <p>🚀 Se você vê esta página, a rota funciona!</p>
      </div>
      
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: '8px',
        fontSize: '16px'
      }}>
        <p><strong>Próximo passo:</strong></p>
        <p>Se esta página carrega, o problema é específico do componente AIManagementPage</p>
      </div>
    </div>
  );
};

export default SimpleAITest;