import React from 'react';

function App() {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f9ff', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#1e40af', marginBottom: '20px' }}>
        🚨 APLICAÇÃO DE EMERGÊNCIA FUNCIONANDO
      </h1>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
      }}>
        <h2>✅ Sistema Restaurado!</h2>
        <p>A aplicação está funcionando corretamente.</p>
        <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
        <p><strong>URL:</strong> {window.location.href}</p>
        
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#dcfce7', borderLeft: '4px solid #16a34a' }}>
          <h3>Status:</h3>
          <ul>
            <li>✅ React renderizando</li>
            <li>✅ Servidor ativo</li>
            <li>✅ JavaScript executando</li>
          </ul>
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            Recarregar Página
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;