import React from 'react';

export function PlanejamentoMinimal() {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f8fafc',
      minHeight: '400px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: '#1e293b'
        }}>
          🎯 Planejamento de Auditoria
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: '#f0f9ff',
            padding: '16px',
            borderRadius: '6px',
            border: '1px solid #e0f2fe'
          }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#0369a1', marginBottom: '8px' }}>
              Status
            </h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0c4a6e' }}>
              ATIVO ✅
            </p>
          </div>
          
          <div style={{
            backgroundColor: '#f0fdf4',
            padding: '16px',
            borderRadius: '6px',
            border: '1px solid #bbf7d0'
          }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#16a34a', marginBottom: '8px' }}>
              Planos 2025
            </h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d' }}>
              3 ATIVOS
            </p>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fefce8',
          padding: '16px',
          borderRadius: '6px',
          border: '1px solid #fef08a'
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#a16207', marginBottom: '8px' }}>
            ⚡ Teste de Componente Funcionando
          </h4>
          <p style={{ fontSize: '14px', color: '#713f12' }}>
            Se você está vendo esta mensagem, significa que a aba Planejamento está carregando corretamente!
          </p>
          <p style={{ fontSize: '12px', color: '#a16207', marginTop: '8px' }}>
            <strong>Timestamp:</strong> {new Date().toLocaleString('pt-BR')}
          </p>
        </div>
        
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
            Lista de Planos de Auditoria
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              padding: '12px',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <p style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>
                  Plano Anual de Auditoria 2025
                </p>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>
                  Janeiro - Dezembro 2025
                </p>
              </div>
              <span style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                Em Execução
              </span>
            </div>
            
            <div style={{
              padding: '12px',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <p style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>
                  Auditoria de Compliance
                </p>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>
                  Q1 2025
                </p>
              </div>
              <span style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                Planejado
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}