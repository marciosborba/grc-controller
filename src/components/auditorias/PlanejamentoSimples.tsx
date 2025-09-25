import React from 'react';

export function PlanejamentoSimples() {
  console.log('🎯 [PLANEJAMENTO_SIMPLES] Componente renderizado em:', new Date().toISOString());
  
  const handleClick = () => {
    console.log('🖱️ [PLANEJAMENTO_SIMPLES] Botão clicado!');
    alert('Componente funcionando!');
  };

  return (
    <div>
      <h1>🎯 PLANEJAMENTO FUNCIONANDO</h1>
      <p>Se você está vendo esta mensagem, o componente Planejamento está renderizando corretamente.</p>
      <p><strong>Timestamp:</strong> {new Date().toLocaleString('pt-BR')}</p>
      
      <button 
        onClick={handleClick}
        style={{
          padding: '12px 24px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px',
          marginTop: '20px'
        }}
      >
        Testar JavaScript
      </button>
      
      <div style={{
        marginTop: '20px',
        padding: '16px',
        backgroundColor: '#f0f9ff',
        border: '2px solid #3b82f6',
        borderRadius: '8px'
      }}>
        <h3>✅ Status do Sistema</h3>
        <ul>
          <li>✅ React renderizando</li>
          <li>✅ JSX funcionando</li>
          <li>✅ Estilos aplicados</li>
          <li>✅ Event handlers ativos</li>
          <li>✅ Console.log funcionando</li>
        </ul>
      </div>
    </div>
  );
}