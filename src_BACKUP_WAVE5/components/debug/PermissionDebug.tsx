import React from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';

export const PermissionDebug = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="p-4 bg-red-100 border border-red-300 rounded">
        <h3 className="font-bold text-red-800">❌ Usuário não encontrado</h3>
      </div>
    );
  }

  const hasAssessmentRead = user.permissions.includes('assessment.read');
  const hasAll = user.permissions.includes('all');

  return (
    <div className="p-4 bg-blue-100 border border-blue-300 rounded mb-4">
      <h3 className="font-bold text-blue-800">🔍 Debug de Permissões</h3>
      <div className="mt-2 text-sm">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Nome:</strong> {user.name}</p>
        <p><strong>Platform Admin:</strong> {user.isPlatformAdmin ? '✅ Sim' : '❌ Não'}</p>
        <p><strong>Roles:</strong> {user.roles.join(', ')}</p>
        <p><strong>Total Permissões:</strong> {user.permissions.length}</p>
        <p><strong>Permissões:</strong> {user.permissions.join(', ')}</p>
        <div className="mt-2 space-y-1">
          <p><strong>assessment.read:</strong> {hasAssessmentRead ? '✅ Sim' : '❌ Não'}</p>
          <p><strong>all (público):</strong> {hasAll ? '✅ Sim' : '❌ Não'}</p>
        </div>
        <div className="mt-2 p-2 bg-white rounded border">
          <p><strong>Deve ver Assessments:</strong> {hasAssessmentRead || hasAll || user.isPlatformAdmin ? '✅ SIM' : '❌ NÃO'}</p>
        </div>
      </div>
    </div>
  );
};