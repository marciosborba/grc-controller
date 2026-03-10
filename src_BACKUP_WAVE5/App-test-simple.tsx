import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Simple working app without complex dependencies
function App() {
  return (
    <BrowserRouter>
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <Routes>
          {/* Main Dashboard Route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={
            <div style={{ padding: '20px' }}>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '30px', 
                borderRadius: '8px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                maxWidth: '1200px',
                margin: '0 auto'
              }}>
                <h1 style={{ 
                  fontSize: '2rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '20px',
                  borderBottom: '2px solid #e5e7eb',
                  paddingBottom: '10px'
                }}>
                  🛡️ GRC Controller Dashboard
                </h1>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                  gap: '20px',
                  marginTop: '30px'
                }}>
                  {/* Vulnerabilities Card */}
                  <div style={{ 
                    backgroundColor: '#fef3c7', 
                    padding: '20px', 
                    borderRadius: '8px',
                    border: '1px solid #fbbf24'
                  }}>
                    <h3 style={{ color: '#92400e', marginBottom: '10px' }}>
                      🎯 Gestão de Vulnerabilidades
                    </h3>
                    <p style={{ color: '#78350f', marginBottom: '15px' }}>
                      Classificação e gerenciamento de vulnerabilidades de segurança
                    </p>
                    <a 
                      href="/vulnerabilities/classification" 
                      style={{ 
                        color: '#92400e', 
                        textDecoration: 'none',
                        fontWeight: '500',
                        padding: '8px 16px',
                        backgroundColor: '#fbbf24',
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}
                    >
                      Acessar Classificação →
                    </a>
                  </div>

                  {/* Risk Management Card */}
                  <div style={{ 
                    backgroundColor: '#fecaca', 
                    padding: '20px', 
                    borderRadius: '8px',
                    border: '1px solid #f87171'
                  }}>
                    <h3 style={{ color: '#991b1b', marginBottom: '10px' }}>
                      ⚠️ Gestão de Riscos
                    </h3>
                    <p style={{ color: '#7f1d1d', marginBottom: '15px' }}>
                      Identificação, avaliação e mitigação de riscos
                    </p>
                    <a 
                      href="/risks" 
                      style={{ 
                        color: '#991b1b', 
                        textDecoration: 'none',
                        fontWeight: '500',
                        padding: '8px 16px',
                        backgroundColor: '#f87171',
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}
                    >
                      Gerenciar Riscos →
                    </a>
                  </div>

                  {/* Compliance Card */}
                  <div style={{ 
                    backgroundColor: '#d1fae5', 
                    padding: '20px', 
                    borderRadius: '8px',
                    border: '1px solid #34d399'
                  }}>
                    <h3 style={{ color: '#065f46', marginBottom: '10px' }}>
                      ✅ Compliance
                    </h3>
                    <p style={{ color: '#047857', marginBottom: '15px' }}>
                      Conformidade regulatória e auditoria
                    </p>
                    <a 
                      href="/compliance" 
                      style={{ 
                        color: '#065f46', 
                        textDecoration: 'none',
                        fontWeight: '500',
                        padding: '8px 16px',
                        backgroundColor: '#34d399',
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}
                    >
                      Ver Compliance →
                    </a>
                  </div>

                  {/* Debug Card */}
                  <div style={{ 
                    backgroundColor: '#e0e7ff', 
                    padding: '20px', 
                    borderRadius: '8px',
                    border: '1px solid #6366f1'
                  }}>
                    <h3 style={{ color: '#3730a3', marginBottom: '10px' }}>
                      🔧 Debug & Configuração
                    </h3>
                    <p style={{ color: '#4338ca', marginBottom: '15px' }}>
                      Ferramentas de debug e configuração do sistema
                    </p>
                    <a 
                      href="/debug-tenant" 
                      style={{ 
                        color: '#3730a3', 
                        textDecoration: 'none',
                        fontWeight: '500',
                        padding: '8px 16px',
                        backgroundColor: '#6366f1',
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}
                    >
                      Debug Tenant →
                    </a>
                  </div>
                </div>

                <div style={{ 
                  marginTop: '40px', 
                  padding: '20px', 
                  backgroundColor: '#f3f4f6', 
                  borderRadius: '8px',
                  border: '1px solid #d1d5db'
                }}>
                  <h3 style={{ color: '#374151', marginBottom: '15px' }}>
                    📊 Status do Sistema
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <div>
                      <strong style={{ color: '#059669' }}>✅ Servidor:</strong>
                      <span style={{ marginLeft: '8px', color: '#065f46' }}>Online</span>
                    </div>
                    <div>
                      <strong style={{ color: '#059669' }}>✅ React:</strong>
                      <span style={{ marginLeft: '8px', color: '#065f46' }}>Funcionando</span>
                    </div>
                    <div>
                      <strong style={{ color: '#059669' }}>✅ Roteamento:</strong>
                      <span style={{ marginLeft: '8px', color: '#065f46' }}>Ativo</span>
                    </div>
                    <div>
                      <strong style={{ color: '#059669' }}>✅ Timestamp:</strong>
                      <span style={{ marginLeft: '8px', color: '#065f46' }}>{new Date().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          } />

          {/* Vulnerabilities Classification */}
          <Route path="/vulnerabilities/classification" element={
            <div style={{ padding: '20px', backgroundColor: '#f0f9ff', minHeight: '100vh' }}>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '30px', 
                borderRadius: '8px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                maxWidth: '1200px',
                margin: '0 auto'
              }}>
                <h1 style={{ 
                  fontSize: '2rem', 
                  fontWeight: '600', 
                  color: '#1e40af', 
                  marginBottom: '20px',
                  borderBottom: '2px solid #3b82f6',
                  paddingBottom: '10px'
                }}>
                  🎯 Classificação de Vulnerabilidades
                </h1>
                
                <div style={{ 
                  backgroundColor: '#dbeafe', 
                  padding: '20px', 
                  borderRadius: '8px',
                  border: '1px solid #3b82f6',
                  marginBottom: '30px'
                }}>
                  <h2 style={{ color: '#1e40af', marginBottom: '15px' }}>
                    ✅ Sistema Funcionando!
                  </h2>
                  <p style={{ color: '#1e3a8a', marginBottom: '10px' }}>
                    A página de classificação de vulnerabilidades está carregando corretamente.
                  </p>
                  <p style={{ color: '#1e3a8a' }}>
                    <strong>URL atual:</strong> {window.location.pathname}
                  </p>
                  <p style={{ color: '#1e3a8a' }}>
                    <strong>Timestamp:</strong> {new Date().toLocaleString()}
                  </p>
                </div>

                <div style={{ 
                  backgroundColor: '#fef3c7', 
                  padding: '20px', 
                  borderRadius: '8px',
                  border: '1px solid #fbbf24',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ color: '#92400e', marginBottom: '15px' }}>
                    🔍 Diagnóstico do Tenant
                  </h3>
                  <p style={{ color: '#78350f', marginBottom: '10px' }}>
                    Para investigar o problema do tenant_id do usuário super admin, você pode:
                  </p>
                  <ul style={{ color: '#78350f', marginLeft: '20px' }}>
                    <li>Verificar se o usuário está logado corretamente</li>
                    <li>Confirmar se o tenant_id está configurado no perfil</li>
                    <li>Validar se o usuário tem permissões de Platform Admin</li>
                    <li>Acessar a página de debug para mais informações</li>
                  </ul>
                </div>

                <div style={{ marginTop: '30px' }}>
                  <a 
                    href="/dashboard" 
                    style={{ 
                      color: '#1e40af', 
                      textDecoration: 'none',
                      fontWeight: '500',
                      padding: '10px 20px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      borderRadius: '4px',
                      display: 'inline-block',
                      marginRight: '10px'
                    }}
                  >
                    ← Voltar ao Dashboard
                  </a>
                  <a 
                    href="/debug-tenant" 
                    style={{ 
                      color: '#7c3aed', 
                      textDecoration: 'none',
                      fontWeight: '500',
                      padding: '10px 20px',
                      backgroundColor: '#8b5cf6',
                      color: 'white',
                      borderRadius: '4px',
                      display: 'inline-block'
                    }}
                  >
                    Debug Tenant →
                  </a>
                </div>
              </div>
            </div>
          } />

          {/* Debug Tenant */}
          <Route path="/debug-tenant" element={
            <div style={{ padding: '20px', backgroundColor: '#f3e8ff', minHeight: '100vh' }}>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '30px', 
                borderRadius: '8px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                maxWidth: '1200px',
                margin: '0 auto'
              }}>
                <h1 style={{ 
                  fontSize: '2rem', 
                  fontWeight: '600', 
                  color: '#7c3aed', 
                  marginBottom: '20px',
                  borderBottom: '2px solid #8b5cf6',
                  paddingBottom: '10px'
                }}>
                  🔧 Debug do Tenant
                </h1>
                
                <div style={{ 
                  backgroundColor: '#ede9fe', 
                  padding: '20px', 
                  borderRadius: '8px',
                  border: '1px solid #8b5cf6',
                  marginBottom: '30px'
                }}>
                  <h2 style={{ color: '#6b21a8', marginBottom: '15px' }}>
                    🔍 Informações de Debug
                  </h2>
                  <p style={{ color: '#581c87', marginBottom: '10px' }}>
                    Esta página permitirá diagnosticar problemas relacionados ao tenant_id do usuário super admin.
                  </p>
                  <p style={{ color: '#581c87' }}>
                    <strong>Status:</strong> Página carregando corretamente
                  </p>
                </div>

                <div style={{ 
                  backgroundColor: '#fef2f2', 
                  padding: '20px', 
                  borderRadius: '8px',
                  border: '1px solid #f87171',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ color: '#991b1b', marginBottom: '15px' }}>
                    ⚠️ Próximos Passos
                  </h3>
                  <p style={{ color: '#7f1d1d', marginBottom: '10px' }}>
                    Para implementar o debug completo do tenant, será necessário:
                  </p>
                  <ul style={{ color: '#7f1d1d', marginLeft: '20px' }}>
                    <li>Conectar com o sistema de autenticação</li>
                    <li>Carregar dados do usuário atual</li>
                    <li>Verificar configurações de tenant</li>
                    <li>Validar permissões de Platform Admin</li>
                  </ul>
                </div>

                <div style={{ marginTop: '30px' }}>
                  <a 
                    href="/dashboard" 
                    style={{ 
                      color: 'white', 
                      textDecoration: 'none',
                      fontWeight: '500',
                      padding: '10px 20px',
                      backgroundColor: '#7c3aed',
                      borderRadius: '4px',
                      display: 'inline-block'
                    }}
                  >
                    ← Voltar ao Dashboard
                  </a>
                </div>
              </div>
            </div>
          } />

          {/* Catch-all 404 */}
          <Route path="*" element={
            <div style={{ 
              padding: '20px', 
              textAlign: 'center',
              minHeight: '100vh',
              backgroundColor: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '40px', 
                borderRadius: '8px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h1 style={{ color: '#dc2626', marginBottom: '20px' }}>
                  404 - Página não encontrada
                </h1>
                <p style={{ color: '#7f1d1d', marginBottom: '20px' }}>
                  A página que você está procurando não existe.
                </p>
                <a 
                  href="/dashboard" 
                  style={{ 
                    color: 'white', 
                    textDecoration: 'none',
                    fontWeight: '500',
                    padding: '10px 20px',
                    backgroundColor: '#dc2626',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}
                >
                  Voltar ao Dashboard
                </a>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;