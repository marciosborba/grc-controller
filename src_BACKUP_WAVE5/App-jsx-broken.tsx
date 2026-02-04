import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div style={{ padding: '20px', backgroundColor: '#f0f9ff', minHeight: '100vh' }}>
            <h1 style={{ color: '#1e40af', marginBottom: '20px' }}>
              🎯 APLICAÇÃO COM ROTEAMENTO FUNCIONANDO
            </h1>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h2>✅ React Router está funcionando!</h2>
              <p>Se você está vendo esta mensagem, o roteamento está funcionando corretamente.</p>
              <p><strong>URL atual:</strong> {window.location.pathname}</p>
              <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#dcfce7', borderLeft: '4px solid #16a34a' }}>
                <h3>Status do Sistema:</h3>
                <ul>
                  <li>✅ React renderizando</li>
                  <li>✅ React Router funcionando</li>
                  <li>✅ Vite funcionando</li>
                  <li>✅ Servidor ativo na porta 8080</li>
                </ul>
              </div>
              <div style={{ marginTop: '20px' }}>
                <h3>Rotas de Teste:</h3>
                <ul>
                  <li><a href="/test" style={{ color: '#3b82f6' }}>Teste</a></li>
                  <li><a href="/vulnerabilities/classification" style={{ color: '#3b82f6' }}>Classificação de Vulnerabilidades</a></li>
                </ul>
              </div>
            </div>
          </div>
        } />
        
        <Route path="/test" element={
          <div style={{ padding: '20px' }}>
            <h1>🧪 Página de Teste</h1>
            <p>Esta é uma página de teste simples.</p>
            <a href="/" style={{ color: '#3b82f6' }}>Voltar</a>
          </div>
        } />
        
        <Route path="/vulnerabilities/classification" element={
          <div style={{ padding: '20px', backgroundColor: '#f0f9ff', minHeight: '100vh' }}>
            <h1 style={{ color: '#1e40af', marginBottom: '20px' }}>
              🎯 CLASSIFICAÇÃO DE VULNERABILIDADES
            </h1>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h2>✅ Página de Classificação Funcionando!</h2>
              <p>A rota /vulnerabilities/classification está funcionando corretamente.</p>
              <p><strong>URL atual:</strong> {window.location.pathname}</p>
              <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
              <a href="/" style={{ color: '#3b82f6' }}>Voltar ao início</a>
            </div>
          </div>
        } />
        
        <Route path="*" element={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>404 - Página não encontrada</h1>
            <p>A página que você está procurando não existe.</p>
            <a href="/" style={{ color: '#3b82f6' }}>Voltar ao início</a>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;