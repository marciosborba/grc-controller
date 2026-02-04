import React from 'react';
import PolicyManagementHub from './PolicyManagementHub';

/**
 * PolicyManagementPage - Página principal do módulo de gestão de políticas
 * 
 * Este componente serve como wrapper para o PolicyManagementHub,
 * que contém toda a lógica e interface do novo módulo refatorado
 * com cards expansíveis e integração com Alex Policy IA.
 */
const PolicyManagementPage: React.FC = () => {
  return <PolicyManagementHub />;
};

export default PolicyManagementPage;