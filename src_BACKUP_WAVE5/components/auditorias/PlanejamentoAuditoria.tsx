import React from 'react';
import { PlanejamentoAnualAuditoria } from './PlanejamentoAnualAuditoria';

/**
 * Componente de Planejamento de Auditoria
 * 
 * Este componente serve como wrapper para o PlanejamentoAnualAuditoria,
 * mantendo compatibilidade com as rotas existentes.
 */
export function PlanejamentoAuditoria() {
  return <PlanejamentoAnualAuditoria />;
}

export default PlanejamentoAuditoria;