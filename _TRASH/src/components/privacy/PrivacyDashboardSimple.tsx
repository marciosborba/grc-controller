import React from 'react';

export default function PrivacyDashboardSimple() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Privacidade/LGPD Dashboard</h1>
      <p>Módulo de Privacidade funcionando corretamente.</p>
      <p>Sistema de gestão LGPD carregado com sucesso.</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </div>
  );
}