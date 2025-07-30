import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Assessment {
  id: string;
  tenant_id: string;
  framework_id_on_creation: string;
  name: string;
  status: 'Não Iniciado' | 'Em Andamento' | 'Em Revisão' | 'Concluído';
  due_date: string | null;
  progress: number;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
  framework?: {
    id: string;
    name: string;
    short_name: string;
    category: string;
  };
}

export interface Framework {
  id: string;
  name: string;
  short_name: string;
  category: string;
  description: string | null;
  version: string;
  created_at: string;
  updated_at: string;
}

export const useAssessments = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAssessments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          *,
          framework:frameworks!framework_id_on_creation (
            id,
            name,
            short_name,
            category
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar assessments.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFrameworks = async () => {
    try {
      const { data, error } = await supabase
        .from('frameworks')
        .select('*')
        .order('name');

      if (error) throw error;
      setFrameworks(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar frameworks.',
        variant: 'destructive',
      });
    }
  };

  const createAssessment = async (assessmentData: {
    name: string;
    framework_id_on_creation: string;
    due_date?: string;
  }) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('assessments')
        .insert({
          ...assessmentData,
          created_by_user_id: userData.user?.id,
          status: 'Não Iniciado' as const,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Create assessment responses for all controls in the framework
      const { data: controls } = await supabase
        .from('framework_controls')
        .select('id')
        .eq('framework_id', assessmentData.framework_id_on_creation);

      if (controls && controls.length > 0) {
        const responses = controls.map(control => ({
          assessment_id: data.id,
          control_id: control.id,
        }));

        await supabase
          .from('assessment_responses')
          .insert(responses);
      }

      await fetchAssessments();
      return data;
    } catch (error: any) {
      throw error;
    }
  };

  const deleteAssessment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchAssessments();
    } catch (error: any) {
      throw error;
    }
  };

  useEffect(() => {
    fetchAssessments();
    fetchFrameworks();
  }, []);

  return {
    assessments,
    frameworks,
    isLoading,
    createAssessment,
    deleteAssessment,
    refetchAssessments: fetchAssessments,
    refetchFrameworks: fetchFrameworks,
  };
};