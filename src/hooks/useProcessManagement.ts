import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { toast } from 'sonner';

export interface ProcessTemplate {
  id: string;
  name: string;
  description: string;
  category: 'compliance' | 'audit' | 'risk' | 'policy' | 'incident' | 'assessment' | 'custom';
  framework: string;
  version: string;
  field_definitions: {
    fields: any[];
    formRows: any[];
  };
  workflow_definition: {
    nodes: any[];
    connections: any[];
  };
  ui_configuration: {
    layout: string;
    theme: string;
  };
  security_config: {
    encryption_required: boolean;
    access_level: string;
    audit_trail: boolean;
    data_retention_days: number;
    pii_handling: string;
  };
  automation_config: {
    notifications_enabled: boolean;
    auto_assignment: boolean;
    webhook_triggers: string[];
    ai_assistance: boolean;
  };
  is_active: boolean;
  is_default_for_framework: boolean;
  usage_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

export interface ProcessData {
  name: string;
  description: string;
  category: 'compliance' | 'audit' | 'risk' | 'policy' | 'incident' | 'assessment' | 'custom';
  framework: string;
  formFields: any[];
  formRows: any[];
  workflowNodes: any[];
  workflowConnections: any[];
  analytics?: {
    kpis: string[];
    reports: string[];
  };
  integrations?: string[];
}

export const useProcessManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const saveProcess = useCallback(async (processData: ProcessData): Promise<string | null> => {
    if (!user) {
      setError('Usuário não autenticado');
      toast.error('Usuário não autenticado');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Preparar dados para salvar na tabela compliance_process_templates
      const processTemplate = {
        name: processData.name,
        description: processData.description || '',
        framework: processData.framework || processData.category.toUpperCase(),
        version: '1.0',
        tenant_id: user.tenant_id,
        field_definitions: {
          fields: processData.formFields || [],
          formRows: processData.formRows || []
        },
        workflow_definition: {
          nodes: processData.workflowNodes || [],
          connections: processData.workflowConnections || []
        },
        ui_configuration: {
          layout: 'default',
          theme: 'standard'
        },
        security_config: {
          encryption_required: false,
          access_level: 'internal',
          audit_trail: true,
          data_retention_days: 2555,
          pii_handling: 'encrypt'
        },
        automation_config: {
          notifications_enabled: true,
          auto_assignment: false,
          webhook_triggers: [],
          ai_assistance: false
        },
        is_active: true,
        is_default_for_framework: false,
        usage_count: 0,
        created_by: user.id,
        updated_by: user.id
      };

      console.log('Salvando processo:', processTemplate);

      const { data, error: saveError } = await supabase
        .from('compliance_process_templates')
        .insert(processTemplate)
        .select()
        .single();

      if (saveError) {
        console.error('Erro ao salvar processo:', saveError);
        setError(saveError.message);
        toast.error(`Erro ao salvar processo: ${saveError.message}`);
        return null;
      }

      console.log('Processo salvo com sucesso:', data);
      toast.success(`Processo "${processData.name}" salvo com sucesso!`);
      return data.id;

    } catch (err: any) {
      console.error('Erro inesperado ao salvar processo:', err);
      const errorMessage = err.message || 'Erro desconhecido';
      setError(errorMessage);
      toast.error(`Erro inesperado: ${errorMessage}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProcess = useCallback(async (id: string, processData: ProcessData): Promise<boolean> => {
    if (!user) {
      setError('Usuário não autenticado');
      toast.error('Usuário não autenticado');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const updateData = {
        name: processData.name,
        description: processData.description || '',
        framework: processData.framework || processData.category.toUpperCase(),
        field_definitions: {
          fields: processData.formFields || [],
          formRows: processData.formRows || []
        },
        workflow_definition: {
          nodes: processData.workflowNodes || [],
          connections: processData.workflowConnections || []
        },
        updated_by: user.id,
        updated_at: new Date().toISOString()
      };

      console.log('Atualizando processo:', updateData);

      const { data, error: updateError } = await supabase
        .from('compliance_process_templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Erro ao atualizar processo:', updateError);
        setError(updateError.message);
        toast.error(`Erro ao atualizar processo: ${updateError.message}`);
        return false;
      }

      console.log('Processo atualizado com sucesso:', data);
      toast.success(`Processo "${processData.name}" atualizado com sucesso!`);
      return true;

    } catch (err: any) {
      console.error('Erro inesperado ao atualizar processo:', err);
      const errorMessage = err.message || 'Erro desconhecido';
      setError(errorMessage);
      toast.error(`Erro inesperado: ${errorMessage}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadProcess = useCallback(async (id: string): Promise<ProcessTemplate | null> => {
    setLoading(true);
    setError(null);

    try {
      console.log('Carregando processo:', id);

      const { data, error: loadError } = await supabase
        .from('compliance_process_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (loadError) {
        console.error('Erro ao carregar processo:', loadError);
        setError(loadError.message);
        toast.error(`Erro ao carregar processo: ${loadError.message}`);
        return null;
      }

      console.log('Processo carregado com sucesso:', data);
      return data as ProcessTemplate;

    } catch (err: any) {
      console.error('Erro inesperado ao carregar processo:', err);
      const errorMessage = err.message || 'Erro desconhecido';
      setError(errorMessage);
      toast.error(`Erro inesperado: ${errorMessage}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const listProcesses = useCallback(async (): Promise<ProcessTemplate[]> => {
    if (!user) {
      setError('Usuário não autenticado');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Listando processos para tenant:', user.tenant_id);

      const { data, error: listError } = await supabase
        .from('compliance_process_templates')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (listError) {
        console.error('Erro ao listar processos:', listError);
        setError(listError.message);
        toast.error(`Erro ao listar processos: ${listError.message}`);
        return [];
      }

      console.log('Processos listados com sucesso:', data);
      return data as ProcessTemplate[];

    } catch (err: any) {
      console.error('Erro inesperado ao listar processos:', err);
      const errorMessage = err.message || 'Erro desconhecido';
      setError(errorMessage);
      toast.error(`Erro inesperado: ${errorMessage}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteProcess = useCallback(async (id: string): Promise<boolean> => {
    if (!user) {
      setError('Usuário não autenticado');
      toast.error('Usuário não autenticado');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Deletando processo:', id);

      // Soft delete - marcar como inativo ao invés de deletar
      const { error: deleteError } = await supabase
        .from('compliance_process_templates')
        .update({ 
          is_active: false,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (deleteError) {
        console.error('Erro ao deletar processo:', deleteError);
        setError(deleteError.message);
        toast.error(`Erro ao deletar processo: ${deleteError.message}`);
        return false;
      }

      console.log('Processo deletado com sucesso');
      toast.success('Processo deletado com sucesso!');
      return true;

    } catch (err: any) {
      console.error('Erro inesperado ao deletar processo:', err);
      const errorMessage = err.message || 'Erro desconhecido';
      setError(errorMessage);
      toast.error(`Erro inesperado: ${errorMessage}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    saveProcess,
    updateProcess,
    loadProcess,
    listProcesses,
    deleteProcess,
    loading,
    error
  };
};