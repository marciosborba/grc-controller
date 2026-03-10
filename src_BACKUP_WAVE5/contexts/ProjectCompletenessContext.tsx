import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PhaseCompleteness {
  // Completude baseada no preenchimento da interface (0-100%)
  interfaceCompleteness: number;
  // Completude baseada nos dados salvos no banco (0-100%)
  databaseCompleteness: number;
  // Elementos preenchidos vs total de elementos
  filledElements: number;
  totalElements: number;
}

interface ProjectCompletenessState {
  planejamento: PhaseCompleteness;
  execucao: PhaseCompleteness;
  achados: PhaseCompleteness;
  relatorio: PhaseCompleteness;
  followup: PhaseCompleteness;
}

interface ProjectCompletenessContextType {
  completeness: ProjectCompletenessState;
  updatePhaseCompleteness: (phase: string, interfaceData: {
    filledElements: number;
    totalElements: number;
  }) => void;
  refreshFromDatabase: (projectId: string, tenantId: string) => Promise<void>;
  saveToDatabase: (projectId: string, tenantId: string, phase: string, value: number) => Promise<void>;
  loading: boolean;
}

const defaultPhaseCompleteness: PhaseCompleteness = {
  interfaceCompleteness: 0,
  databaseCompleteness: 0,
  filledElements: 0,
  totalElements: 0
};

const defaultState: ProjectCompletenessState = {
  planejamento: { ...defaultPhaseCompleteness },
  execucao: { ...defaultPhaseCompleteness },
  achados: { ...defaultPhaseCompleteness },
  relatorio: { ...defaultPhaseCompleteness },
  followup: { ...defaultPhaseCompleteness }
};

const ProjectCompletenessContext = createContext<ProjectCompletenessContextType | undefined>(undefined);

export function ProjectCompletenessProvider({ children }: { children: React.ReactNode }) {
  const [completeness, setCompleteness] = useState<ProjectCompletenessState>(defaultState);
  const [loading, setLoading] = useState(false);

  // Atualizar completude de uma fase baseada no preenchimento da interface
  const updatePhaseCompleteness = useCallback((
    phase: string, 
    interfaceData: { filledElements: number; totalElements: number }
  ) => {
    const { filledElements, totalElements } = interfaceData;
    const interfaceCompleteness = totalElements > 0 ? Math.round((filledElements / totalElements) * 100) : 0;

    console.log(`ProjectCompletenessContext - Updating ${phase}:`, {
      filledElements,
      totalElements,
      interfaceCompleteness
    });

    setCompleteness(prev => ({
      ...prev,
      [phase]: {
        ...prev[phase as keyof ProjectCompletenessState],
        interfaceCompleteness,
        filledElements,
        totalElements
      }
    }));
  }, []);

  // Carregar completude do banco de dados
  const refreshFromDatabase = useCallback(async (projectId: string, tenantId: string) => {
    try {
      setLoading(true);
      
      console.log('ProjectCompletenessContext - Loading from database:', { projectId, tenantId });

      const { data, error } = await supabase
        .from('projetos_auditoria')
        .select(`
          completude_planejamento,
          completude_execucao,
          completude_achados,
          completude_relatorio,
          completude_followup
        `)
        .eq('id', projectId)
        .eq('tenant_id', tenantId)
        .single();

      if (error) throw error;

      if (data) {
        console.log('ProjectCompletenessContext - Database data:', data);

        setCompleteness(prev => ({
          planejamento: {
            ...prev.planejamento,
            databaseCompleteness: Math.round(data.completude_planejamento || 0)
          },
          execucao: {
            ...prev.execucao,
            databaseCompleteness: Math.round(data.completude_execucao || 0)
          },
          achados: {
            ...prev.achados,
            databaseCompleteness: Math.round(data.completude_achados || 0)
          },
          relatorio: {
            ...prev.relatorio,
            databaseCompleteness: Math.round(data.completude_relatorio || 0)
          },
          followup: {
            ...prev.followup,
            databaseCompleteness: Math.round(data.completude_followup || 0)
          }
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar completude do banco:', error);
      toast.error('Erro ao carregar progresso do projeto');
    } finally {
      setLoading(false);
    }
  }, []);

  // Salvar completude no banco de dados
  const saveToDatabase = useCallback(async (
    projectId: string, 
    tenantId: string, 
    phase: string, 
    value: number
  ) => {
    try {
      console.log(`ProjectCompletenessContext - Saving ${phase} to database:`, { projectId, value });

      const { error } = await supabase
        .from('projetos_auditoria')
        .update({
          [`completude_${phase}`]: value,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .eq('tenant_id', tenantId);

      if (error) throw error;

      // Atualizar estado local
      setCompleteness(prev => ({
        ...prev,
        [phase]: {
          ...prev[phase as keyof ProjectCompletenessState],
          databaseCompleteness: value
        }
      }));

      console.log(`ProjectCompletenessContext - Successfully saved ${phase}:`, value);
    } catch (error) {
      console.error('Erro ao salvar completude:', error);
      toast.error('Erro ao salvar progresso');
    }
  }, []);

  const contextValue: ProjectCompletenessContextType = {
    completeness,
    updatePhaseCompleteness,
    refreshFromDatabase,
    saveToDatabase,
    loading
  };

  return (
    <ProjectCompletenessContext.Provider value={contextValue}>
      {children}
    </ProjectCompletenessContext.Provider>
  );
}

export function useProjectCompleteness() {
  const context = useContext(ProjectCompletenessContext);
  if (context === undefined) {
    throw new Error('useProjectCompleteness must be used within a ProjectCompletenessProvider');
  }
  return context;
}

// Hook para uma fase específica
export function usePhaseCompleteness(phase: string) {
  const { completeness, updatePhaseCompleteness, saveToDatabase } = useProjectCompleteness();
  
  const phaseData = completeness[phase as keyof ProjectCompletenessState];
  
  return {
    // Para exibição nas abas (baseado no preenchimento da interface)
    interfaceCompleteness: phaseData.interfaceCompleteness,
    // Para exibição nos botões (baseado nos dados do banco)
    databaseCompleteness: phaseData.databaseCompleteness,
    // Detalhes do preenchimento
    filledElements: phaseData.filledElements,
    totalElements: phaseData.totalElements,
    // Funções
    updateInterface: (filledElements: number, totalElements: number) => 
      updatePhaseCompleteness(phase, { filledElements, totalElements }),
    saveToDatabase: (projectId: string, tenantId: string, value: number) =>
      saveToDatabase(projectId, tenantId, phase, value)
  };
}